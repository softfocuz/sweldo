from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.enums import DistributionType, PayrollStatus
from app.models.payroll import Payroll

from app.crud.payroll import payroll_crud
from app.crud.wallet import wallet_crud
from app.crud.milestone import milestone_crud
from app.crud.claim import claim_crud

from app.services.claimable_balance import (
    create_claimable_balance,
)
from app.services.stellar import resolve_claimable_balance_id

# Demo mode: a "MONTHLY" payroll re-fires every 3 minutes instead of
# every 30 days, so the recurring-payout experience is actually
# observable in a demo/staging session. This is the one intentional
# behavior change from a real monthly cadence -- everything else
# about MONTHLY (recurring, auto re-funds, stays PENDING between
# runs) works exactly as it would in production.
MONTHLY_INTERVAL = timedelta(minutes=3)


class PayrollEngine:

    def process(
        self,
        db: Session,
        payroll: Payroll,
    ):

        if payroll.status == PayrollStatus.FUNDED:
            existing_claim = claim_crud.get_by_payroll(
                db,
                payroll.id,
            )

            if existing_claim is not None:
                # Already fully processed -- nothing to do.
                return {
                    "claimable_balance_id": existing_claim.claimable_balance_id,
                    "transaction_hash": payroll.stellar_transaction_hash,
                    "status": "already_funded",
                }

            return self._repair_missing_claim(db, payroll)

        match payroll.distribution_type:

            case DistributionType.ONE_TIME:
                return self.process_one_time(
                    db,
                    payroll,
                )

            case DistributionType.MONTHLY:
                return self.process_monthly(
                    db,
                    payroll,
                )

            case DistributionType.MILESTONE:
                return self.process_milestone(
                    db,
                    payroll,
                )

    def _repair_missing_claim(
            self,
            db: Session,
            payroll: Payroll,
    ):
        if not payroll.stellar_transaction_hash:
            raise Exception(
                "This payroll is marked FUNDED but has no recorded "
                "transaction hash, so its claimable balance can't be "
                "recovered automatically."
            )

        claimable_balance_id = resolve_claimable_balance_id(
            payroll.stellar_transaction_hash,
        )

        if claimable_balance_id is None:
            raise Exception(
                "Could not find a claimable balance on Stellar for "
                "this payroll's funding transaction."
            )

        claim = claim_crud.create(
            db=db,
            payroll_id=payroll.id,
            employee_id=payroll.employee_id,
            claimable_balance_id=claimable_balance_id,
        )

        return {
            "claimable_balance_id": claim.claimable_balance_id,
            "transaction_hash": payroll.stellar_transaction_hash,
            "status": "repaired",
        }

    def _create_claim(
            self,
            db: Session,
            payroll: Payroll,
    ):

        wallet = wallet_crud.get_by_employee(
            db,
            payroll.employee_id,
        )

        print("=" * 50)
        print("Payroll ID:", payroll.id)
        print("Employee ID from payroll:", payroll.employee_id)

        wallet = wallet_crud.get_by_employee(
            db,
            payroll.employee_id,
        )

        print("Wallet found:", wallet)

        if wallet is None:
            raise Exception(
                "This employee has not connected a Stellar wallet yet."
            )

        if not wallet.public_key:
            raise Exception(
                "Employee wallet address is missing."
            )

        wallet.public_key = wallet.public_key.strip()

        if wallet.public_key.startswith("S"):
            raise Exception(
                "A Stellar Secret Key was provided instead of a Public Key."
            )

        if not wallet.public_key.startswith("G"):
            raise Exception(
                "Employee wallet address is invalid."
            )

        print("\nCREATE CLAIM")
        print("Employee:", payroll.employee_id)
        print("Wallet:", wallet.public_key)

        try:
            response = create_claimable_balance(
                destination=wallet.public_key,
                amount=str(payroll.amount),
                asset_code=payroll.asset.code,
                issuer=payroll.asset.issuer,
            )
        except Exception as e:
            raise Exception(
                f"Unable to create the Stellar claimable balance. {str(e)}"
            )

        print("Stellar response:", response)

        print("Creating Claim record...")

        claim = claim_crud.create(
            db=db,
            payroll_id=payroll.id,
            employee_id=payroll.employee_id,
            claimable_balance_id=response["claimable_balance_id"],
        )

        claim = claim_crud.mark_ready(db, claim)

        print("Claim created!")
        print("Claim ID:", claim.id)
        print("Claimable Balance ID:", claim.claimable_balance_id)

        payroll_crud.mark_transaction_submitted(
            db=db,
            payroll=payroll,
            transaction_hash=response["transaction_hash"],
        )

        print("Payroll marked as FUNDED")

        return response

    def process_one_time(
        self,
        db: Session,
        payroll: Payroll,
    ):

        response = self._create_claim(
            db,
            payroll,
        )

        payroll.is_active = False

        db.commit()

        return response

    def process_monthly(
        self,
        db: Session,
        payroll: Payroll,
    ):

        response = self._create_claim(
            db,
            payroll,
        )

        # MONTHLY is scheduled off next_run, same mechanism a
        # WEEKLY-style recurring payroll would use -- it just
        # advances by MONTHLY_INTERVAL (3 minutes, for demo
        # purposes) instead of a real calendar month.
        payroll.last_run = payroll.next_run or datetime.now(timezone.utc)
        payroll.next_run = payroll.last_run + MONTHLY_INTERVAL

        payroll.status = PayrollStatus.PENDING

        db.commit()

        return response

    def process_milestone(
        self,
        db: Session,
        payroll: Payroll,
    ):

        if not milestone_crud.all_completed(
            db,
            payroll.id,
        ):

            return {
                "status": "waiting",
                "message": "Waiting for milestone completion.",
            }

        response = self._create_claim(
            db,
            payroll,
        )

        payroll.is_active = False

        db.commit()

        return response


payroll_engine = PayrollEngine()
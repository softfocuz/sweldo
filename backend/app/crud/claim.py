from sqlalchemy.orm import Session

from app.models.claim import Claim
from app.models.transaction import Transaction
from app.models.enums import ClaimStatus, TransactionStatus


class ClaimCRUD:

    def create(
        self,
        db: Session,
        payroll_id,
        employee_id,
        claimable_balance_id,
    ):
        claim = Claim(
            payroll_id=payroll_id,
            employee_id=employee_id,
            claimable_balance_id=claimable_balance_id,
            status=ClaimStatus.PENDING,
        )

        db.add(claim)
        db.commit()
        db.refresh(claim)

        return claim

    def mark_ready(
        self,
        db: Session,
        claim: Claim,
    ):
        """
        Move a claim from PENDING to CLAIMABLE ("ready") once its
        claimable balance is confirmed live on Stellar.
        """
        claim.status = ClaimStatus.CLAIMABLE

        db.commit()
        db.refresh(claim)

        return claim

    def get(
        self,
        db: Session,
        claim_id,
    ):
        return (
            db.query(Claim)
            .filter(
                Claim.id == claim_id
            )
            .first()
        )

    def get_by_employee(
        self,
        db: Session,
        employee_id,
    ):
        return (
            db.query(Claim)
            .filter(
                Claim.employee_id == employee_id
            )
            .all()
        )

    def get_by_payroll(
        self,
        db: Session,
        payroll_id,
    ):
        return (
            db.query(Claim)
            .filter(
                Claim.payroll_id == payroll_id
            )
            .first()
        )

    def mark_claimed(
        self,
        db: Session,
        claim: Claim,
        transaction_hash: str,
    ):
        claim.status = ClaimStatus.CLAIMED

        db.commit()
        db.refresh(claim)

        # Record the on-chain claim transaction. This is idempotent so
        # confirming the same claim twice (e.g. a retried request)
        # doesn't hit the transactions.claim_id unique constraint.
        existing = (
            db.query(Transaction)
            .filter(Transaction.claim_id == claim.id)
            .first()
        )

        if existing is None:
            from app.services.stellar import get_transaction_ledger

            try:
                ledger = get_transaction_ledger(transaction_hash)
            except Exception:
                ledger = 0

            transaction = Transaction(
                claim_id=claim.id,
                stellar_tx_hash=transaction_hash,
                ledger=ledger,
                status=TransactionStatus.CLAIMED,
            )

            db.add(transaction)
            db.commit()

        return claim


claim_crud = ClaimCRUD()

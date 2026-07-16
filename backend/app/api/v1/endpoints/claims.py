from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_employee

from app.crud.claim import claim_crud
from app.crud.wallet import wallet_crud
from app.crud.payroll import payroll_crud

from app.schemas.claim import ClaimWithPayrollResponse
from app.schemas.transaction import TransactionSubmit

from app.services.claim import build_claim_xdr
from app.services.stellar import (
    find_claimable_balance_by_claimant,
    get_claimable_balance_claimant,
    is_valid_claimable_balance_id,
    resolve_claimable_balance_id,
    verify_transaction,
)

router = APIRouter()


@router.get("/{employee_id}", response_model=list[ClaimWithPayrollResponse])
def get_employee_claims(
    employee_id: UUID,
    db: Session = Depends(get_db),
):
    claims = claim_crud.get_by_employee(
        db,
        employee_id,
    )

    return [
        ClaimWithPayrollResponse(
            id=claim.id,
            payroll_id=claim.payroll_id,
            employee_id=claim.employee_id,
            claimable_balance_id=claim.claimable_balance_id,
            status=claim.status,
            payroll_title=claim.payroll.title if claim.payroll else None,
            payroll_message=claim.payroll.message if claim.payroll else None,
        )
        for claim in claims
    ]


@router.post("/{claim_id}/claim")
def claim(
    claim_id: UUID,
    current_user=Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    claim = claim_crud.get(
        db,
        claim_id,
    )

    if claim is None:
        raise HTTPException(
            status_code=404,
            detail="Claim not found.",
        )

    wallet = wallet_crud.get_by_employee(
        db,
        claim.employee_id,
    )

    if wallet is None:
        raise HTTPException(
            status_code=400,
            detail="Connect a Stellar wallet before claiming.",
        )

    # Rows created before the Horizon parsing fix may have the
    # operation's numeric id stored instead of the real claimable
    # balance id. Repair on the fly so old claims don't stay
    # permanently stuck.
    if not is_valid_claimable_balance_id(claim.claimable_balance_id):
        tx_hash = claim.payroll.stellar_transaction_hash if claim.payroll else None

        repaired_id = (
            resolve_claimable_balance_id(tx_hash) if tx_hash else None
        )

        # The recorded transaction hash can go stale (e.g. overwritten
        # by an unrelated confirmation on the same payroll), so fall
        # back to asking Stellar directly for an unclaimed balance
        # that names this wallet as claimant.
        if not is_valid_claimable_balance_id(repaired_id) and claim.payroll:
            payroll = claim.payroll
            repaired_id = find_claimable_balance_by_claimant(
                claimant_public_key=wallet.public_key,
                asset_code=payroll.asset.code if payroll.asset else None,
                issuer=payroll.asset.issuer if payroll.asset else None,
                amount=f"{payroll.amount:.7f}",
            )

        if not is_valid_claimable_balance_id(repaired_id):
            raise HTTPException(
                status_code=500,
                detail=(
                    "This claim has an invalid claimable balance id "
                    "and it could not be recovered from Stellar."
                ),
            )

        claim.claimable_balance_id = repaired_id
        db.commit()
        db.refresh(claim)

    # ---- Canonical-wallet check -------------------------------------
    # The claimable balance on Stellar already has a fixed claimant —
    # it was baked in permanently the moment the payroll was processed.
    # If the wallet on file for this employee has since changed (a
    # reconnect through any part of the UI), it will never match that
    # claimant again, and Horizon will reject the claim with
    # tx_bad_auth. Catch that here, before wasting a signature on it,
    # with a message that actually explains what's wrong.
    onchain_claimant = get_claimable_balance_claimant(claim.claimable_balance_id)

    print("\nCLAIM WALLET CHECK")
    print("Database wallet:      ", wallet.public_key)
    print("On-chain claimant:    ", onchain_claimant)
    print("Claimable balance id: ", claim.claimable_balance_id)

    if onchain_claimant is None:
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not look up this claimable balance on Stellar. "
                "It may already have been claimed."
            ),
        )

    if onchain_claimant != wallet.public_key:
        raise HTTPException(
            status_code=409,
            detail=(
                "The connected wallet does not match the wallet "
                "registered for this employee. Please reconnect the "
                "correct wallet."
            ),
        )
    # -------------------------------------------------------------------

    xdr = build_claim_xdr(
        claim.claimable_balance_id,
        wallet.public_key,
    )

    return {
        "claim_id": str(claim.id),
        "xdr": xdr,
    }


@router.post("/{claim_id}/confirm")
def confirm_claim(
    claim_id: UUID,
    data: TransactionSubmit,
    current_user=Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    claim = claim_crud.get(
        db,
        claim_id,
    )

    if claim is None:
        raise HTTPException(
            status_code=404,
            detail="Claim not found.",
        )

    if not data.transaction_hash:
        raise HTTPException(
            status_code=400,
            detail="A transaction hash is required to confirm a claim.",
        )

    if not verify_transaction(data.transaction_hash):
        raise HTTPException(
            status_code=400,
            detail=(
                "Could not verify that this transaction was submitted "
                "successfully on Stellar."
            ),
        )

    claim_crud.mark_claimed(
        db,
        claim,
        data.transaction_hash,
    )

    payroll = claim.payroll

    # Recurring payrolls (MONTHLY) are already reset to PENDING
    # by the engine for their next cycle. Terminal payrolls (ONE_TIME/
    # MILESTONE) are done once their single claim is claimed.
    if payroll is not None and not payroll.is_active:
        payroll_crud.mark_completed(db, payroll)

    return {
        "message": "Claim confirmed.",
    }


from app.services.stellar import (
    create_claimable_balance as stellar_create_claimable_balance,
)


def create_claimable_balance(
    destination: str,
    amount: str,
    asset_code: str,
    issuer: str | None,
):

    response = stellar_create_claimable_balance(
        employee_public_key=destination,
        amount=amount,
        asset_code=asset_code,
        issuer=issuer,
    )

    return {
        "claimable_balance_id": response.get(
            "claimable_balance_id"
        ),
        "transaction_hash": response.get(
            "transaction_hash"
        ),
        "status": "created",
    }
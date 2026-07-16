from stellar_sdk import (
    Keypair,
    Server,
    TransactionBuilder,
)

from app.core.config import settings

server = Server(settings.STELLAR_HORIZON_URL)


def claim_claimable_balance(
    claimable_balance_id: str,
):
    """
    Temporary backend signer.

    Later:
    Freighter signs this transaction
    in the React frontend.
    """

    source = Keypair.from_secret(
        settings.STELLAR_SECRET_KEY
    )

    source_account = server.load_account(
        source.public_key
    )

    transaction = (
        TransactionBuilder(
            source_account=source_account,
            network_passphrase=settings.STELLAR_NETWORK_PASSPHRASE,
            base_fee=100,
        )
        .append_claim_claimable_balance_op(
            balance_id=claimable_balance_id,
        )
        .set_timeout(30)
        .build()
    )

    transaction.sign(source)

    response = server.submit_transaction(
        transaction
    )

    return {
        "hash": response["hash"],
        "ledger": response["ledger"],
        "successful": response["successful"],
    }
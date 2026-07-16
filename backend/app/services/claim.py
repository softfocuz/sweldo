from stellar_sdk import (
    Keypair,
    Server,
    TransactionBuilder,
)

from app.core.config import settings

server = Server(settings.STELLAR_HORIZON_URL)


def build_claim_xdr(
    claimable_balance_id: str,
    claimant_public_key: str,
):
    """
    Build an unsigned claim transaction.
    The employee signs this with Freighter.
    """

    source = Keypair.from_public_key(
        claimant_public_key,
    )

    account = server.load_account(
        source.public_key,
    )

    tx = (
        TransactionBuilder(
            source_account=account,
            network_passphrase=settings.STELLAR_NETWORK_PASSPHRASE,
            base_fee=100,
        )
        .append_claim_claimable_balance_op(
            balance_id=claimable_balance_id,
        )
        .set_timeout(300)
        .build()
    )

    return tx.to_xdr()
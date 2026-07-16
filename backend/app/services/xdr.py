from stellar_sdk import (
    Asset,
    Claimant,
    Keypair,
    Server,
    TransactionBuilder,
)

from app.core.config import settings

server = Server(
    settings.STELLAR_HORIZON_URL,
)


def build_claimable_balance_xdr(
    destination: str,
    amount: str,
    asset_code: str,
    issuer: str | None,
):
    """
    Build an unsigned Claimable Balance XDR.

    The frontend signs using Freighter.
    """

    source = Keypair.from_public_key(
        settings.PLATFORM_PUBLIC_KEY,
    )

    source_account = server.load_account(
        source.public_key,
    )

    if issuer:

        asset = Asset(
            asset_code,
            issuer,
        )

    else:

        asset = Asset.native()

    claimant = Claimant(destination)

    tx = (
        TransactionBuilder(
            source_account=source_account,
            network_passphrase=settings.STELLAR_NETWORK_PASSPHRASE,
            base_fee=100,
        )
        .append_create_claimable_balance_op(
            asset=asset,
            amount=amount,
            claimants=[claimant],
        )
        .set_timeout(300)
        .build()
    )

    return tx.to_xdr()
from stellar_sdk import (
    Server,
    Keypair,
    TransactionBuilder,
    Asset,
    Claimant,
    ClaimPredicate,
)

from stellar_sdk.exceptions import (
    NotFoundError,
    BadRequestError,
)

from app.core.config import settings


server = Server(settings.STELLAR_HORIZON_URL)


def get_employer_keypair():
    return Keypair.from_secret(
        settings.STELLAR_SECRET_KEY
    )


def get_employer_public_key():
    return get_employer_keypair().public_key


def test_connection():
    return {
        "network": "Stellar Testnet",
        "horizon": settings.STELLAR_HORIZON_URL,
        "status": "connected",
    }


def account_exists(public_key: str):
    if not public_key:
        return False

    public_key = public_key.strip()

    if not public_key.startswith("G"):
        return False

    try:
        server.accounts().account_id(public_key).call()
        return True

    except (
        NotFoundError,
        BadRequestError,
    ):
        return False


def get_transaction_ledger(transaction_hash: str) -> int:
    record = server.transactions().transaction(transaction_hash).call()
    return record["ledger"]


def create_claimable_balance(
    employee_public_key: str,
    amount: str,
    asset_code: str,
    issuer: str | None = None,
):
    employer_keypair = get_employer_keypair()

    employer_public = employer_keypair.public_key

    account = server.load_account(
        employer_public
    )

    print("\nSTELLAR")
    print("Employer:", employer_public)
    print("Employee:", employee_public_key)
    print("Asset:", asset_code)
    print("Amount:", amount)
    print("Sequence:", account.sequence)
    print("Network:", settings.STELLAR_NETWORK_PASSPHRASE)

    if asset_code == "XLM":
        asset = Asset.native()
    else:
        resolved_issuer = issuer or settings.STELLAR_ISSUER_PUBLIC_KEY
        if not resolved_issuer:
            raise Exception(
                f"Asset {asset_code} has no issuer configured and no "
                "STELLAR_ISSUER_PUBLIC_KEY fallback is set. Cannot build "
                "a claimable balance for it."
            )
        asset = Asset(asset_code, resolved_issuer)

    try:
        claimant = Claimant(
            employee_public_key,
            ClaimPredicate.predicate_unconditional(),
        )
    except Exception:
        raise Exception(
            "The employee's Stellar wallet address is invalid."
        )

    builder = TransactionBuilder(
        source_account=account,
        network_passphrase=settings.STELLAR_NETWORK_PASSPHRASE,
        base_fee=100,
    ).append_create_claimable_balance_op(
        asset=asset,
        amount=amount,
        claimants=[claimant],
    ).set_timeout(30)

    transaction = builder.build()

    inner_transaction = (
        transaction.transaction
        if hasattr(transaction, "transaction")
        else transaction
    )
    claimable_balance_id = inner_transaction.get_claimable_balance_id(0)

    transaction.sign(employer_keypair)

    response = server.submit_transaction(transaction)

    print("\nTransaction Response:")
    print(response)

    transaction_hash = response["hash"]

    if not response.get("successful", True):
        raise Exception(
            f"Claimable balance transaction {transaction_hash} was not "
            "successful."
        )

    if not is_valid_claimable_balance_id(claimable_balance_id):
        raise Exception(
            f"Computed claimable balance id '{claimable_balance_id}' is "
            "not a valid 72-character Stellar balance id."
        )

    print("\nTransaction Hash:", transaction_hash)
    print("Claimable Balance ID:", claimable_balance_id)

    return {
        "transaction_hash": transaction_hash,
        "claimable_balance_id": claimable_balance_id,
    }


def verify_transaction(transaction_hash: str) -> bool:
    try:
        record = server.transactions().transaction(transaction_hash).call()
    except (NotFoundError, BadRequestError):
        return False

    return bool(record.get("successful"))


def resolve_claimable_balance_id(transaction_hash: str):
    operations = (
        server.operations()
        .for_transaction(transaction_hash)
        .call()
    )

    for record in operations["_embedded"]["records"]:
        if record["type"] != "create_claimable_balance":
            continue

        try:
            effects = server.effects().for_operation(record["id"]).call()
        except (NotFoundError, BadRequestError):
            continue

        for effect in effects["_embedded"]["records"]:
            if effect["type"] == "claimable_balance_created":
                balance_id = effect.get("balance_id")
                if balance_id:
                    return balance_id

    return None


def is_valid_claimable_balance_id(value: str | None) -> bool:
    if not value:
        return False
    return len(value) == 72 and value[:8] == "00000000"


def find_claimable_balance_by_claimant(
    claimant_public_key: str,
    asset_code: str | None = None,
    issuer: str | None = None,
    amount: str | None = None,
):

    query = server.claimable_balances().for_claimant(claimant_public_key)

    if asset_code:
        asset = (
            Asset.native()
            if asset_code.upper() == "XLM" or not issuer
            else Asset(asset_code, issuer)
        )
        query = query.for_asset(asset)

    try:
        records = query.limit(20).call()["_embedded"]["records"]
    except (NotFoundError, BadRequestError):
        return None

    if amount is not None:
        for record in records:
            if record.get("amount") == amount:
                return record.get("id")

    return records[0]["id"] if records else None


def get_claimable_balance_claimant(claimable_balance_id: str) -> str | None:
    """
    Returns the destination public key of the (first, and in this app's
    case only) claimant on a claimable balance, straight from Horizon.
    This is the ground truth for "who can actually claim this."
    """
    try:
        record = (
            server.claimable_balances()
            .claimable_balance(claimable_balance_id)
            .call()
        )
    except (NotFoundError, BadRequestError):
        return None

    claimants = record.get("claimants", [])
    if not claimants:
        return None

    return claimants[0].get("destination")

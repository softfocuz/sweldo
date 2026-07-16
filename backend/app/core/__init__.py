from stellar_sdk import Network
from stellar_sdk import Server

HORIZON_URL = "https://horizon-testnet.stellar.org"

NETWORK_PASSPHRASE = Network.TESTNET_NETWORK_PASSPHRASE

server = Server(
    horizon_url=HORIZON_URL,
)

def test_connection():
    return server.root()
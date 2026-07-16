import { Horizon, Networks, TransactionBuilder } from "@stellar/stellar-sdk";
import {
  getAddress,
  isConnected as freighterIsConnected,
  isAllowed as freighterIsAllowed,
  requestAccess,
  signTransaction
} from "@stellar/freighter-api";

const HORIZON_URL = import.meta.env.VITE_HORIZON_URL ?? "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE ?? Networks.TESTNET;
const STELLAR_EXPERT_BASE = import.meta.env.VITE_STELLAR_EXPERT_URL ?? "https://stellar.expert/explorer/testnet";

export const server = new Horizon.Server(HORIZON_URL);

export function stellarExpertTxUrl(hash: string) {
  return `${STELLAR_EXPERT_BASE}/tx/${hash}`;
}

export function stellarExpertAccountUrl(publicKey: string) {
  return `${STELLAR_EXPERT_BASE}/account/${publicKey}`;
}

export async function isFreighterAvailable(): Promise<boolean> {
  const result = await freighterIsConnected();
  return !result.error && result.isConnected;
}

export async function connectFreighter(): Promise<string> {
  const allowed = await freighterIsAllowed();
  if (allowed.error || !allowed.isAllowed) {
    const access = await requestAccess();
    if (access.error) {
      throw new Error(access.error);
    }
    return access.address;
  }
  const address = await getAddress();
  if (address.error) {
    throw new Error(address.error);
  }
  return address.address;
}

export interface AccountBalance {
  assetCode: string;
  assetIssuer: string | null;
  balance: string;
}

export async function getAccountBalances(publicKey: string): Promise<AccountBalance[]> {
  const account = await server.loadAccount(publicKey);
  return account.balances.map((entry) => {
    if (entry.asset_type === "native") {
      return { assetCode: "XLM", assetIssuer: null, balance: entry.balance };
    }
    const withIssuer = entry as { asset_code: string; asset_issuer: string; balance: string };
    return {
      assetCode: withIssuer.asset_code,
      assetIssuer: withIssuer.asset_issuer,
      balance: withIssuer.balance
    };
  });
}

export async function accountExists(publicKey: string): Promise<boolean> {
  try {
    await server.loadAccount(publicKey);
    return true;
  } catch {
    return false;
  }
}

export interface SignAndSubmitResult {
  hash: string;
  claimableBalanceId: string | null;
}

export async function signAndSubmitXdr(unsignedXdr: string, signerPublicKey: string): Promise<SignAndSubmitResult> {
  const signed = await signTransaction(unsignedXdr, {
    address: signerPublicKey,
    networkPassphrase: NETWORK_PASSPHRASE
  });

  if (signed.error) {
    throw new Error(signed.error);
  }

  const envelope = TransactionBuilder.fromXDR(signed.signedTxXdr, NETWORK_PASSPHRASE);
  const response = await server.submitTransaction(envelope);
  const claimableBalanceId = await lookupClaimableBalanceId(response.hash);

  return { hash: response.hash, claimableBalanceId };
}

async function lookupClaimableBalanceId(txHash: string): Promise<string | null> {
  try {
    const operations = await server.operations().forTransaction(txHash).call();
    const createOp = operations.records.find(
      (op) => op.type === "create_claimable_balance"
    ) as { balance_id?: string } | undefined;
    return createOp?.balance_id ?? null;
  } catch {
    return null;
  }
}

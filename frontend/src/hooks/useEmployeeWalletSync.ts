import { createWallet } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

/**
 * The one and only place an employee's connected wallet address should
 * ever get persisted from. Every "Connect Wallet" surface for an
 * employee — Topbar, the dedicated Wallet page, the Claims page's
 * inline prompt — already gets a fresh address from Freighter via
 * <WalletConnectButton>'s onConnected callback; this hook is what that
 * callback should hand the address to. It guarantees the database
 * `wallets` row and the local AuthContext cache are always written
 * together, so they can never quietly drift apart.
 */
export function useEmployeeWalletSync() {
  const { user, setWalletAddress } = useAuth();

  async function syncWallet(address: string): Promise<void> {
    if (user?.role === "EMPLOYEE") {
      await createWallet(user.profileId, address, "TESTNET");
    }
    setWalletAddress(address);
  }

  return { syncWallet };
}

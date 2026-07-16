import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { WalletConnectButton } from "@/components/shared/WalletConnectButton";
import { useAuth } from "@/context/AuthContext";
import { useEmployeeWalletSync } from "@/hooks/useEmployeeWalletSync";
import { getErrorMessage } from "@/lib/errors";

export function Topbar({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const { syncWallet } = useEmployeeWalletSync();
  const navigate = useNavigate();
  const [walletError, setWalletError] = useState<string | null>(null);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  async function handleConnected(address: string) {
    setWalletError(null);
    try {
      await syncWallet(address);
    } catch (err) {
      setWalletError(getErrorMessage(err, "Could not save this wallet to your account."));
    }
  }

  return (
    <div className="flex flex-col gap-4 border-b border-line px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6 md:px-8">
      <div className="flex flex-col gap-1.5">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-signal-600"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
          </svg>
          Home
        </Link>
        <h1 className="font-display text-page-title text-ink-900">{title}</h1>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2.5">
          <WalletConnectButton
            address={user?.walletAddress ?? null}
            onConnected={handleConnected}
            size="sm"
            variant="outline"
          />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>
        {walletError && <span className="text-xs text-red-500">{walletError}</span>}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { WalletConnectButton } from "@/components/shared/WalletConnectButton";
import { getErrorMessage } from "@/lib/errors";
import { getAccountBalances, stellarExpertAccountUrl, type AccountBalance } from "@/lib/stellar";
import { useAuth } from "@/context/AuthContext";
import { formatAmount, truncateAddress } from "@/lib/format";

export function EmployerWalletPage() {
  const { user, setWalletAddress } = useAuth();
  const [balances, setBalances] = useState<AccountBalance[]>([]);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [balancesError, setBalancesError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.walletAddress) return;
    setBalancesLoading(true);
    setBalancesError(null);
    getAccountBalances(user.walletAddress)
      .then(setBalances)
      .catch((err) => setBalancesError(getErrorMessage(err, "Could not load balances from Horizon.")))
      .finally(() => setBalancesLoading(false));
  }, [user?.walletAddress]);

  return (
    <DashboardLayout role="employer" title="Wallet">
      <Card className="max-w-xl">
        <CardHeader>
          <h2 className="font-display text-base font-semibold text-ink-900">Paying wallet</h2>
          <p className="mt-1 text-sm text-ink-500">
            This is the wallet you sign payroll transactions with. It is only stored in this browser, not on the backend.
          </p>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          {user?.walletAddress ? (
            <div className="flex items-center justify-between rounded-xl border border-line bg-paper-50 px-4 py-3">
              <div>
                <p className="font-mono text-sm text-ink-900">{truncateAddress(user.walletAddress, 6)}</p>
                <a
                  href={stellarExpertAccountUrl(user.walletAddress)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-signal-500 hover:text-signal-600"
                >
                  View on Stellar Expert
                </a>
              </div>
              <WalletConnectButton address={user.walletAddress} onConnected={setWalletAddress} size="sm" variant="outline" />
            </div>
          ) : (
            <WalletConnectButton address={null} onConnected={setWalletAddress} />
          )}

          {user?.walletAddress && (
            <div>
              <p className="mb-2 text-sm font-medium text-ink-800">Balances</p>
              {balancesLoading ? (
                <div className="flex items-center gap-2 text-sm text-ink-500">
                  <Spinner /> Loading balances...
                </div>
              ) : balancesError ? (
                <Alert>{balancesError}</Alert>
              ) : (
                <div className="flex flex-col gap-2">
                  {balances.map((balance) => (
                    <div
                      key={`${balance.assetCode}-${balance.assetIssuer ?? "native"}`}
                      className="flex items-center justify-between rounded-lg border border-line px-3.5 py-2.5 text-sm"
                    >
                      <span className="text-ink-600">{balance.assetCode}</span>
                      <span className="font-mono text-ink-900">{formatAmount(balance.balance, balance.assetCode)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}

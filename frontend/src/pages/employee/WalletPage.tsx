import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { WalletConnectButton } from "@/components/shared/WalletConnectButton";
import { useEmployeeWalletSync } from "@/hooks/useEmployeeWalletSync";
import { getErrorMessage } from "@/lib/errors";
import { getAccountBalances, stellarExpertAccountUrl, type AccountBalance } from "@/lib/stellar";
import { useAuth } from "@/context/AuthContext";
import { formatAmount, truncateAddress } from "@/lib/format";

export function EmployeeWalletPage() {
  const { user } = useAuth();
  const { syncWallet } = useEmployeeWalletSync();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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

  async function handleConnected(address: string) {
    setSaveError(null);
    setSaved(false);
    setSaving(true);
    try {
      await syncWallet(address);
      setSaved(true);
    } catch (err) {
      setSaveError(getErrorMessage(err, "Could not save this wallet to your account."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout role="employee" title="Wallet">
      <Card className="max-w-xl">
        <CardHeader>
          <h2 className="font-display text-base font-semibold text-ink-900">Your Stellar wallet</h2>
          <p className="mt-1 text-sm text-ink-500">
            Connecting saves your public key so payrolls can pay you directly. If you switch
            accounts in Freighter, reconnect here so this stays in sync.
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
              <WalletConnectButton address={user.walletAddress} onConnected={handleConnected} size="sm" variant="outline" />
            </div>
          ) : (
            <WalletConnectButton address={null} onConnected={handleConnected} />
          )}

          {saving && (
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <Spinner /> Saving wallet to your account...
            </div>
          )}
          {saveError && <Alert>{saveError}</Alert>}
          {saved && <Alert tone="success">Wallet saved.</Alert>}

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

          {!user?.walletAddress && (
            <p className="text-sm text-ink-500">Balances appear once a wallet is connected.</p>
          )}
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}

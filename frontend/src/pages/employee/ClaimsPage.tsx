import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { WalletConnectButton } from "@/components/shared/WalletConnectButton";
import { useEmployeeWalletSync } from "@/hooks/useEmployeeWalletSync";
import { confirmClaimTransaction, listClaimsForEmployee, requestClaimXdr } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { connectFreighter, isFreighterAvailable, signAndSubmitXdr, stellarExpertTxUrl } from "@/lib/stellar";
import { useAuth } from "@/context/AuthContext";
import type { Claim, ClaimStatus } from "@/types";

const statusTone: Record<ClaimStatus, "locked" | "ready" | "claimed" | "neutral"> = {
  PENDING: "locked",
  CLAIMABLE: "ready",
  CLAIMED: "claimed",
  FAILED: "neutral"
};

export function ClaimsPage() {
  const { user } = useAuth();
  const { syncWallet } = useEmployeeWalletSync();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rowState, setRowState] = useState<Record<string, { status: string; error?: string; hash?: string }>>({});

  async function loadClaims() {
    if (!user) return;
    setLoading(true);
    setLoadError(null);
    try {
      const response = await listClaimsForEmployee(user.profileId);
      setClaims(response.data);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Could not load your claims."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.profileId]);

  async function handleWalletConnect(address: string) {
    try {
      await syncWallet(address);
    } catch (err) {
      setRowState((current) => ({
        ...current,
        wallet_error: { status: "error", error: getErrorMessage(err, "Failed to save wallet.") }
      }));
    }
  }

  async function handleClaim(claim: Claim) {
    if (!user?.walletAddress) {
      setRowState((current) => ({
        ...current,
        [claim.id]: { status: "error", error: "Connect your Stellar wallet before claiming." }
      }));
      return;
    }

    setRowState((current) => ({ ...current, [claim.id]: { status: "checking" } }));

    // Freighter is the one thing that actually produces the signature, so
    // it — not our cached AuthContext value — is the account that has to
    // match what the backend used to build the transaction. Read it live
    // instead of trusting whatever was connected last time.
    let liveWalletAddress: string;
    try {
      const available = await isFreighterAvailable();
      if (!available) {
        throw new Error("Freighter is not available. Install or unlock the extension.");
      }
      liveWalletAddress = await connectFreighter();
    } catch (err) {
      setRowState((current) => ({
        ...current,
        [claim.id]: { status: "error", error: getErrorMessage(err, "Could not read the connected Freighter wallet.") }
      }));
      return;
    }

    console.log("Freighter wallet (live):", liveWalletAddress);
    console.log("Registered wallet (backend):", user.walletAddress);

    if (liveWalletAddress !== user.walletAddress) {
      setRowState((current) => ({
        ...current,
        [claim.id]: {
          status: "error",
          error:
            "The connected wallet does not match the wallet registered for this employee. " +
            "Please reconnect the correct wallet."
        }
      }));
      return;
    }

    setRowState((current) => ({ ...current, [claim.id]: { status: "requesting" } }));

    try {
      const claimResponse = await requestClaimXdr(claim.id);
      setRowState((current) => ({ ...current, [claim.id]: { status: "signing" } }));

      const result = await signAndSubmitXdr(claimResponse.data.xdr, liveWalletAddress);

      setRowState((current) => ({ ...current, [claim.id]: { status: "confirming" } }));
      await confirmClaimTransaction(claim.id, result.hash);

      setRowState((current) => ({ ...current, [claim.id]: { status: "done", hash: result.hash } }));
      loadClaims();
    } catch (err) {
      setRowState((current) => ({
        ...current,
        [claim.id]: { status: "error", error: getErrorMessage(err, "Could not claim this payment.") }
      }));
    }
  }

  return (
    <DashboardLayout role="employee" title="Claims">
      {!user?.walletAddress && (
        <div className="mb-5">
          <Alert tone="warning">
            Connect your Stellar wallet to claim payments.
            <span className="ml-3 inline-block align-middle">
              <WalletConnectButton address={null} onConnected={handleWalletConnect} size="sm" />
            </span>
          </Alert>
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-display text-base font-semibold text-ink-900">Your claims</h2>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex items-center gap-2 px-6 py-10 text-sm text-ink-500">
              <Spinner /> Loading claims...
            </div>
          ) : loadError ? (
            <div className="p-6">
              <Alert>{loadError}</Alert>
            </div>
          ) : claims.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-ink-500">No claims yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-6 py-3 font-medium">Claimable balance</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => {
                  const state = rowState[claim.id];
                  const isBusy =
                    state?.status === "checking" ||
                    state?.status === "requesting" ||
                    state?.status === "signing" ||
                    state?.status === "confirming";
                  return (
                    <tr key={claim.id}>
                      <td className="px-6 py-4 font-mono text-xs text-ink-600">{claim.claimable_balance_id}</td>
                      <td className="px-6 py-4">
                        <Badge tone={statusTone[claim.status]}>{claim.status.toLowerCase()}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {claim.status === "CLAIMABLE" ? (
                            <Button size="sm" disabled={isBusy} onClick={() => handleClaim(claim)}>
                              {state?.status === "checking" && "Checking wallet..."}
                              {state?.status === "requesting" && "Requesting..."}
                              {state?.status === "signing" && "Sign in Freighter..."}
                              {state?.status === "confirming" && "Confirming..."}
                              {(!state || state.status === "error" || state.status === "done") && "Claim Now"}
                            </Button>
                          ) : (
                            <span className="text-xs text-ink-500">Nothing to do</span>
                          )}
                          {state?.status === "error" && <span className="text-xs text-red-500">{state.error}</span>}
                          {state?.status === "done" && state.hash && (
                            <a
                              href={stellarExpertTxUrl(state.hash)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-signal-500 hover:text-signal-600"
                            >
                              View on Stellar Expert
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}

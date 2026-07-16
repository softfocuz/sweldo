import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Amount } from "@/components/ui/Amount";
import { listClaimsForEmployee } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { useAuth } from "@/context/AuthContext";
import { truncateAddress } from "@/lib/format";
import type { Claim, ClaimStatus } from "@/types";

const statusTone: Record<ClaimStatus, "locked" | "ready" | "claimed" | "neutral"> = {
  PENDING: "locked",
  CLAIMABLE: "ready",
  CLAIMED: "claimed",
  FAILED: "neutral"
};

export function EmployeeDashboardPage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    listClaimsForEmployee(user.profileId)
      .then((response) => setClaims(response.data))
      .catch((err) => setError(getErrorMessage(err, "Could not load your claims.")))
      .finally(() => setLoading(false));
  }, [user]);

  const pendingClaims = claims.filter((claim) => claim.status === "CLAIMABLE" || claim.status === "PENDING");
  const claimHistory = claims.filter((claim) => claim.status === "CLAIMED");

  return (
    <DashboardLayout role="employee" title="Dashboard">
      <Card className="mb-6">
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Signed in as</p>
            <p className="mt-1 font-display text-lg font-semibold text-ink-900">{user?.displayName}</p>
            <p className="text-sm text-ink-500">{user?.email}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Wallet</p>
            {user?.walletAddress ? (
              <p className="mt-1 font-mono text-sm text-ink-900">{truncateAddress(user.walletAddress, 6)}</p>
            ) : (
              <Link to="/employee/wallet">
                <Button size="sm" className="mt-1">Connect Wallet</Button>
              </Link>
            )}
          </div>
        </CardBody>
      </Card>

      {error ? (
        <Alert>{error}</Alert>
      ) : loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-ink-500">
          <Spinner /> Loading your claims...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Card>
              <CardBody>
                <p className="text-sm text-ink-500">Pending claims</p>
                <Amount value={String(pendingClaims.length)} className="mt-2 text-pending-600" />
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-sm text-ink-500">Claim history</p>
                <Amount value={String(claimHistory.length)} className="mt-2 text-unlock-600" />
              </CardBody>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-section-title font-display text-ink-900">Recent claims</h2>
              <Link to="/employee/claims">
                <Button variant="ghost" size="sm">View all claims</Button>
              </Link>
            </CardHeader>
            <CardBody className="p-0">
              {claims.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-ink-500">No claims yet.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-500">
                      <th className="px-6 py-3 font-medium">Claimable balance</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.slice(0, 5).map((claim) => (
                      <tr key={claim.id} className="border-b border-line last:border-0">
                        <td className="px-6 py-4 font-mono text-xs text-ink-600">{claim.claimable_balance_id}</td>
                        <td className="px-6 py-4">
                          <Badge tone={statusTone[claim.status]}>{claim.status.toLowerCase()}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}

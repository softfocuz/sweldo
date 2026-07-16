import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { listPayrolls, processPayroll } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { stellarExpertTxUrl } from "@/lib/stellar";
import { useAuth } from "@/context/AuthContext";
import { formatAmount, formatDate } from "@/lib/format";
import type { Payroll, PayrollStatus } from "@/types";

const statusTone: Record<PayrollStatus, "locked" | "active" | "completed" | "neutral"> = {
  PENDING: "locked",
  FUNDED: "active",
  COMPLETED: "completed",
  FAILED: "neutral"
};

export function PayrollsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("created");

  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rowState, setRowState] = useState<Record<string, { status: string; error?: string; hash?: string }>>({});

  async function loadPayrolls() {
    if (!user) return;
    setLoading(true);
    setLoadError(null);
    try {
      const response = await listPayrolls();
      setPayrolls(response.data.filter((payroll) => payroll.employer_id === user.profileId));
    } catch (err) {
      setLoadError(getErrorMessage(err, "Could not load payrolls."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayrolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.profileId]);

  async function handleProcess(payroll: Payroll) {
    setRowState((current) => ({ ...current, [payroll.id]: { status: "processing" } }));

    try {
      // Funding is custodial: the backend's own Stellar account creates
      // the claimable balance and confirms it in the same request, so
      // there is nothing for the employer to sign here.
      const processResponse = await processPayroll(payroll.id);
      const data = processResponse.data;

      if ("status" in data && data.status === "waiting") {
        setRowState((current) => ({
          ...current,
          [payroll.id]: { status: "waiting", error: data.message }
        }));
        return;
      }

      setRowState((current) => ({
        ...current,
        [payroll.id]: { status: "done", hash: data.transaction_hash ?? undefined }
      }));
      loadPayrolls();
    } catch (err) {
      setRowState((current) => ({
        ...current,
        [payroll.id]: { status: "error", error: getErrorMessage(err, "Could not process this payroll.") }
      }));
    }
  }

  return (
    <DashboardLayout role="employer" title="Payrolls">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-ink-500">Payrolls are funded from the platform's Stellar account.</p>
        <Link to="/employer/payrolls/new">
          <Button size="sm">Create Payroll</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display text-base font-semibold text-ink-900">All payrolls</h2>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex items-center gap-2 px-6 py-10 text-sm text-ink-500">
              <Spinner /> Loading payrolls...
            </div>
          ) : loadError ? (
            <div className="p-6">
              <Alert>{loadError}</Alert>
            </div>
          ) : payrolls.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-ink-500">No payrolls yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-6 py-3 font-medium">Payroll name</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Distribution</th>
                  <th className="px-6 py-3 font-medium">Start date</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((payroll) => {
                  const state = rowState[payroll.id];
                  const isHighlighted = payroll.id === highlightId;
                  const isBusy = state?.status === "processing";
                  return (
                    <tr key={payroll.id} className={isHighlighted ? "bg-signal-100/40" : ""}>
                      <td className="px-6 py-4 font-medium text-ink-900">{payroll.title}</td>
                      <td className="px-6 py-4 font-mono text-ink-900">{formatAmount(payroll.amount)}</td>
                      <td className="px-6 py-4 capitalize text-ink-600">
                        {payroll.distribution_type.toLowerCase().replace("_", " ")}
                      </td>
                      <td className="px-6 py-4 text-ink-600">{formatDate(payroll.start_date)}</td>
                      <td className="px-6 py-4">
                        <Badge tone={statusTone[payroll.status]}>{payroll.status.toLowerCase()}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {(payroll.status === "PENDING" || payroll.status === "FUNDED") && (
                            <Button size="sm" variant="outline" disabled={isBusy} onClick={() => handleProcess(payroll)}>
                              {isBusy ? "Processing..." : payroll.status === "FUNDED" ? "Sync claim" : "Process"}
                            </Button>
                          )}
                          {payroll.status !== "PENDING" && payroll.status !== "FUNDED" && (
                            <span className="text-xs text-ink-500">No action needed</span>
                          )}
                          {state?.status === "waiting" && (
                            <span className="text-xs text-pending-600">{state.error}</span>
                          )}
                          {state?.status === "error" && (
                            <span className="text-xs text-red-500">{state.error}</span>
                          )}
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

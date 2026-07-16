import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { listAssets, listPayrolls } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
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
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [assetCodes, setAssetCodes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.profileId) return;
    let active = true;

    Promise.all([listPayrolls(), listAssets()])
      .then(([payrollsRes, assetsRes]) => {
        if (!active) return;
        setPayrolls(payrollsRes.data.filter((p) => p.employee_id === user.profileId));
        setAssetCodes(Object.fromEntries(assetsRes.data.map((a) => [a.id, a.code])));
      })
      .catch((err) => active && setLoadError(getErrorMessage(err, "Could not load your payrolls.")))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [user?.profileId]);

  return (
    <DashboardLayout role="employee" title="My Payrolls">
      <Card>
        <CardHeader>
          <h2 className="font-display text-base font-semibold text-ink-900">Your payrolls</h2>
          <p className="mt-1 text-sm text-ink-500">Every payroll your employer has set up for you.</p>
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
                </tr>
              </thead>
              <tbody>
                {payrolls.map((payroll) => (
                  <tr key={payroll.id}>
                    <td className="px-6 py-4 font-medium text-ink-900">{payroll.title}</td>
                    <td className="px-6 py-4 font-mono text-ink-900">
                      {formatAmount(payroll.amount, assetCodes[payroll.asset_id])}
                    </td>
                    <td className="px-6 py-4 capitalize text-ink-600">
                      {payroll.distribution_type.toLowerCase().replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 text-ink-600">{formatDate(payroll.start_date)}</td>
                    <td className="px-6 py-4">
                      <Badge tone={statusTone[payroll.status]}>{payroll.status.toLowerCase()}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}

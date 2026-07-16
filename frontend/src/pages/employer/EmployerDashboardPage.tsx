import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { listPayrolls } from "@/lib/api";
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

export function EmployerDashboardPage() {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    listPayrolls()
      .then((response) => {
        setPayrolls(response.data.filter((payroll) => payroll.employer_id === user.profileId));
      })
      .catch((err) => setError(getErrorMessage(err, "Could not load your payrolls.")))
      .finally(() => setLoading(false));
  }, [user]);

  const pending = payrolls.filter((payroll) => payroll.status === "PENDING").length;
  const funded = payrolls.filter((payroll) => payroll.status === "FUNDED").length;
  const completed = payrolls.filter((payroll) => payroll.status === "COMPLETED").length;
  const recent = [...payrolls].slice(-5).reverse();

  return (
    <DashboardLayout role="employer" title="Dashboard">
      <Card className="mb-6">
        <CardBody className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-500">Signed in as</p>
            <p className="font-display text-lg font-semibold text-ink-900">{user?.displayName}</p>
            <p className="text-sm text-ink-500">{user?.email}</p>
          </div>
          <Link to="/employer/payrolls/new">
            <Button>Create Payroll</Button>
          </Link>
        </CardBody>
      </Card>

      {error ? (
        <Alert>{error}</Alert>
      ) : loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-ink-500">
          <Spinner /> Loading payroll statistics...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <StatCard label="Pending" value={pending.toString()} />
            <StatCard label="Funded" value={funded.toString()} tone="unlock" />
            <StatCard label="Completed" value={completed.toString()} />
          </div>

          <Card className="mt-6">
            <CardHeader className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink-900">Recent payrolls</h2>
              <Link to="/employer/payrolls">
                <Button variant="ghost" size="sm">View all payrolls</Button>
              </Link>
            </CardHeader>
            <CardBody className="p-0">
              {recent.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-ink-500">No payrolls yet.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-500">
                      <th className="px-6 py-3 font-medium">Payroll name</th>
                      <th className="px-6 py-3 font-medium">Start date</th>
                      <th className="px-6 py-3 font-medium">Amount</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((payroll) => (
                      <tr key={payroll.id} className="border-b border-line last:border-0">
                        <td className="px-6 py-4 font-medium text-ink-900">{payroll.title}</td>
                        <td className="px-6 py-4 text-ink-600">{formatDate(payroll.start_date)}</td>
                        <td className="px-6 py-4 font-mono text-ink-900">{formatAmount(payroll.amount)}</td>
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
        </>
      )}
    </DashboardLayout>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "unlock" }) {
  return (
    <Card>
      <CardBody>
        <p className="text-sm text-ink-500">{label}</p>
        <p className={`mt-2 font-display text-2xl font-semibold ${tone === "unlock" ? "text-unlock-600" : "text-ink-900"}`}>
          {value}
        </p>
      </CardBody>
    </Card>
  );
}

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { listAssets, listClaimsForEmployee, listEmployees, listPayrolls, listTransactions } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { stellarExpertTxUrl } from "@/lib/stellar";
import { useAuth } from "@/context/AuthContext";
import { formatAmount, formatDate } from "@/lib/format";
import type { Claim, Payroll, TransactionRecord } from "@/types";

interface Row {
  transaction: TransactionRecord;
  payroll: Payroll;
  employeeName: string;
  assetCode: string;
}

export function TransactionsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.profileId) return;
    let active = true;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const [payrollsRes, employeesRes, assetsRes, transactionsRes] = await Promise.all([
          listPayrolls(),
          listEmployees(),
          listAssets(),
          listTransactions()
        ]);

        const myPayrolls = payrollsRes.data.filter((p) => p.employer_id === user!.profileId);
        const payrollById = new Map(myPayrolls.map((p) => [p.id, p]));
        const employeeNameById = new Map(employeesRes.data.map((e) => [e.id, e.name]));
        const assetCodeById = new Map(assetsRes.data.map((a) => [a.id, a.code]));

        const relevantEmployeeIds = Array.from(new Set(myPayrolls.map((p) => p.employee_id)));
        const claimLists = await Promise.all(relevantEmployeeIds.map((id) => listClaimsForEmployee(id)));
        const claims: Claim[] = claimLists.flatMap((res) => res.data);
        const claimById = new Map(claims.map((c) => [c.id, c]));

        if (!active) return;

        const nextRows: Row[] = transactionsRes.data
          .map((transaction) => {
            const claim = claimById.get(transaction.claim_id);
            if (!claim) return null;
            const payroll = payrollById.get(claim.payroll_id);
            if (!payroll) return null;
            return {
              transaction,
              payroll,
              employeeName: employeeNameById.get(payroll.employee_id) ?? "—",
              assetCode: assetCodeById.get(payroll.asset_id) ?? "USDC"
            };
          })
          .filter((row): row is Row => row !== null);

        setRows(nextRows);
      } catch (err) {
        if (active) setLoadError(getErrorMessage(err, "Could not load transactions."));
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [user?.profileId]);

  return (
    <DashboardLayout role="employer" title="Transactions">
      <Card>
        <CardHeader>
          <h2 className="font-display text-base font-semibold text-ink-900">Claimed payments</h2>
          <p className="mt-1 text-sm text-ink-500">Every payment an employee has claimed from your payrolls.</p>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex items-center gap-2 px-6 py-10 text-sm text-ink-500">
              <Spinner /> Loading transactions...
            </div>
          ) : loadError ? (
            <div className="p-6">
              <Alert>{loadError}</Alert>
            </div>
          ) : rows.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-ink-500">No claimed payments yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-6 py-3 font-medium">Payroll</th>
                  <th className="px-6 py-3 font-medium">Employee</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.transaction.id}>
                    <td className="px-6 py-4 font-medium text-ink-900">{row.payroll.title}</td>
                    <td className="px-6 py-4 text-ink-600">{row.employeeName}</td>
                    <td className="px-6 py-4 font-mono text-ink-900">
                      {formatAmount(row.payroll.amount, row.assetCode)}
                    </td>
                    <td className="px-6 py-4 text-ink-600">{formatDate(row.payroll.start_date)}</td>
                    <td className="px-6 py-4">
                      <Badge tone={row.transaction.status === "CLAIMED" ? "claimed" : "neutral"}>
                        {row.transaction.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={stellarExpertTxUrl(row.transaction.stellar_tx_hash)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-signal-500 hover:text-signal-600"
                      >
                        View on Stellar Expert
                      </a>
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

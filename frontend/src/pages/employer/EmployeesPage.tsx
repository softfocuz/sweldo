import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { listEmployees, listWallets } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { truncateAddress } from "@/lib/format";
import type { EmployeeProfile, WalletRecord } from "@/types";

export function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [wallets, setWallets] = useState<WalletRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([listEmployees(), listWallets()])
      .then(([employeesResponse, walletsResponse]) => {
        if (!active) return;
        setEmployees(employeesResponse.data);
        setWallets(walletsResponse.data);
      })
      .catch((err) => setLoadError(getErrorMessage(err, "Could not load employees.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const walletByEmployee = new Map(wallets.map((wallet) => [wallet.employee_id, wallet]));

  return (
    <DashboardLayout role="employer" title="Employees">
      <Card>
        <CardHeader>
          <h2 className="font-display text-base font-semibold text-ink-900">All employees</h2>
          <p className="mt-1 text-sm text-ink-500">
            Anyone who has signed up as an employee can be selected when you create a payroll.
          </p>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex items-center gap-2 px-6 py-10 text-sm text-ink-500">
              <Spinner /> Loading employees...
            </div>
          ) : loadError ? (
            <div className="p-6">
              <Alert>{loadError}</Alert>
            </div>
          ) : employees.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-ink-500">No employees have signed up yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Wallet</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => {
                  const wallet = walletByEmployee.get(employee.id);
                  return (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 font-medium text-ink-900">{employee.name}</td>
                      <td className="px-6 py-4">
                        {wallet ? (
                          <span className="font-mono text-xs text-ink-600">
                            {truncateAddress(wallet.public_key, 6)}
                          </span>
                        ) : (
                          <Badge tone="neutral">Not connected</Badge>
                        )}
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

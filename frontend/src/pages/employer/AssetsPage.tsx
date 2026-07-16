import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { listAssets } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { truncateAddress } from "@/lib/format";
import type { AssetRecord } from "@/types";

export function AssetsPage() {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listAssets()
      .then((response) => active && setAssets(response.data))
      .catch((err) => setLoadError(getErrorMessage(err, "Could not load assets.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardLayout role="employer" title="Assets">
      <Card>
        <CardHeader>
          <h2 className="font-display text-base font-semibold text-ink-900">Available assets</h2>
          <p className="mt-1 text-sm text-ink-500">
            These are the assets you can pay employees with when creating a payroll.
          </p>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex items-center gap-2 px-6 py-10 text-sm text-ink-500">
              <Spinner /> Loading assets...
            </div>
          ) : loadError ? (
            <div className="p-6">
              <Alert>{loadError}</Alert>
            </div>
          ) : assets.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-ink-500">No assets configured yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-6 py-3 font-medium">Code</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Issuer</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td className="px-6 py-4 font-mono font-medium text-ink-900">{asset.code}</td>
                    <td className="px-6 py-4 text-ink-600">{asset.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-ink-500">
                      {asset.is_native ? "Native" : asset.issuer ? truncateAddress(asset.issuer, 6) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={asset.is_active ? "active" : "neutral"}>
                        {asset.is_active ? "Active" : "Inactive"}
                      </Badge>
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

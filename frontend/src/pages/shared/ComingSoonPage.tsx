import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody } from "@/components/ui/Card";
import type { AppRole } from "@/types";

export function ComingSoonPage({ role, title }: { role: AppRole; title: string }) {
  return (
    <DashboardLayout role={role} title={title}>
      <Card>
        <CardBody className="flex flex-col items-center justify-center gap-2 py-20 text-center">
          <p className="font-display text-lg font-semibold text-ink-900">{title}</p>
          <p className="max-w-sm text-sm text-ink-500">
            This screen is scaffolded and routed. Wire it up to its backend endpoint next.
          </p>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}

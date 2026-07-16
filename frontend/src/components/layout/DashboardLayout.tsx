import type { ReactNode } from "react";
import { BottomNav, TopNav } from "@/components/layout/TopNav";
import { Topbar } from "@/components/layout/Topbar";
import type { AppRole } from "@/types";

export function DashboardLayout({
  role,
  title,
  children
}: {
  role: AppRole;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-signal-100">
      <TopNav role={role} />
      <Topbar title={title} />
      <main className="mx-auto max-w-[1400px] px-4 pb-24 pt-6 sm:px-6 sm:pb-8 md:px-8">{children}</main>
      <BottomNav role={role} />
    </div>
  );
}

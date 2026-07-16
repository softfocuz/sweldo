import type { ReactNode } from "react";
import clsx from "clsx";

type Tone = "locked" | "ready" | "claimed" | "active" | "completed" | "neutral";

const toneStyles: Record<Tone, string> = {
  locked: "bg-paper-200 text-ink-600",
  ready: "bg-pending-100 text-pending-600",
  claimed: "bg-unlock-100 text-unlock-600",
  active: "bg-signal-100 text-signal-600",
  completed: "bg-unlock-100 text-unlock-600",
  neutral: "bg-paper-200 text-ink-600"
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", toneStyles[tone])}>
      {children}
    </span>
  );
}

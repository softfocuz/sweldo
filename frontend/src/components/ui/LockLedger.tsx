import clsx from "clsx";
import { formatAmount, formatDate } from "@/lib/format";

export interface LedgerStep {
  label: string;
  amount: string;
  assetCode: string;
  date: string;
  status: "locked" | "ready" | "claimed";
}

export function LockLedger({ steps }: { steps: LedgerStep[] }) {
  return (
    <ol className="relative flex flex-col gap-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={`${step.label}-${index}`} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span
                className={clsx(
                  "absolute left-[9px] top-5 h-full w-px",
                  step.status === "claimed" ? "bg-unlock-500" : "bg-line"
                )}
              />
            )}
            <span
              className={clsx(
                "relative z-10 mt-1 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border-2",
                step.status === "claimed" && "border-unlock-500 bg-unlock-500",
                step.status === "ready" && "border-pending-500 bg-white",
                step.status === "locked" && "border-line bg-white"
              )}
            >
              {step.status === "claimed" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
            <div className="flex flex-1 items-center justify-between rounded-lg border border-line bg-paper-50 px-3.5 py-2.5">
              <div>
                <p className="text-sm font-medium text-ink-900">{step.label}</p>
                <p className="text-xs text-ink-500">{formatDate(step.date)}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-ink-900">{formatAmount(step.amount, step.assetCode)}</p>
                <p
                  className={clsx(
                    "text-xs font-medium capitalize",
                    step.status === "claimed" && "text-unlock-600",
                    step.status === "ready" && "text-pending-600",
                    step.status === "locked" && "text-ink-500"
                  )}
                >
                  {step.status}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

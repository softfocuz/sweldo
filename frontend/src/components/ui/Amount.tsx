import type { HTMLAttributes } from "react";
import clsx from "clsx";

type Size = "md" | "lg";

interface AmountProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  suffix?: string;
  size?: Size;
  tone?: "default" | "positive";
}

/**
 * Emphasized numeric display for balances, payment amounts, totals, etc.
 * Use anywhere a figure should "catch the user's attention" per design brief.
 */
export function Amount({ value, suffix, size = "md", tone = "default", className, ...props }: AmountProps) {
  return (
    <div className={clsx("flex items-baseline gap-1.5 font-display tabular-nums", className)} {...props}>
      <span
        className={clsx(
          size === "lg" ? "text-amount-lg" : "text-amount-md",
          tone === "positive" ? "text-unlock-600" : "text-ink-900"
        )}
      >
        {value}
      </span>
      {suffix && <span className="text-sm font-medium text-ink-500">{suffix}</span>}
    </div>
  );
}

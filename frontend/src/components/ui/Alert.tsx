import clsx from "clsx";

type Tone = "error" | "warning" | "success";

const toneStyles: Record<Tone, string> = {
  error: "bg-red-50 text-red-700 border border-red-200",
  warning: "bg-pending-100 text-pending-600 border border-pending-500/30",
  success: "bg-unlock-100 text-unlock-600 border border-unlock-500/30"
};

export function Alert({ tone = "error", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <div className={clsx("rounded-xl px-4 py-3 text-sm", toneStyles[tone])}>{children}</div>
  );
}

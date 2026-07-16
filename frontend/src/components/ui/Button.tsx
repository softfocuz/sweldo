import { type ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

// Every variant defines its own hover/active/focus so a hover state never
// lands on a background close to the text color (the "invisible label" bug).
const variantStyles: Record<Variant, string> = {
  primary:
    "bg-signal-500 text-white shadow-card hover:bg-signal-600 active:bg-signal-600/90 focus-visible:ring-signal-100 disabled:hover:bg-signal-500",
  secondary:
    "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-800/90 focus-visible:ring-ink-500/30 disabled:hover:bg-ink-900",
  outline:
    "border border-line bg-white text-ink-800 hover:border-signal-400 hover:bg-signal-100/40 hover:text-signal-600 active:bg-signal-100/70 focus-visible:ring-signal-100 disabled:hover:bg-white disabled:hover:text-ink-800 disabled:hover:border-line",
  ghost:
    "text-ink-700 hover:bg-paper-200 active:bg-paper-200/80 focus-visible:ring-ink-500/20 disabled:hover:bg-transparent"
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 text-sm px-3.5 rounded-lg",
  md: "h-10 text-sm px-4 rounded-xl",
  lg: "h-12 text-base px-6 rounded-xl"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

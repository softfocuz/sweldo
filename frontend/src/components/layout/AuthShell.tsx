import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

export function AuthShell({
  title,
  subtitle,
  children,
  footer
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-signal-100 px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-3 flex items-center justify-center gap-1.5 text-xs font-medium text-ink-500 hover:text-signal-600"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Home
        </Link>
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <img src={logo} alt="Sweldo" className="h-8 w-8 rounded-md object-cover" />
          <span className="font-display text-lg font-semibold text-ink-900">Sweldo</span>
        </Link>
        <div className="rounded-xl2 border border-line bg-white p-8 shadow-panel">
          <h1 className="font-display text-2xl font-semibold text-ink-900">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-ink-500">{footer}</div>}
      </div>
    </div>
  );
}

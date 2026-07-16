import { Link, NavLink } from "react-router-dom";
import clsx from "clsx";
import logo from "@/assets/logo.png";
import type { AppRole } from "@/types";

interface NavItem {
  label: string;
  to: string;
  icon: string;
}

const employerNav: NavItem[] = [
  { label: "Dashboard", to: "/employer", icon: "M4 6h16M4 12h16M4 18h7" },
  { label: "Employees", to: "/employer/employees", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { label: "Payrolls", to: "/employer/payrolls", icon: "M9 17V7m6 10V7M4 21h16a1 1 0 001-1V4a1 1 0 00-1-1H4a1 1 0 00-1 1v16a1 1 0 001 1z" },
  { label: "Assets", to: "/employer/assets", icon: "M12 8c-3.31 0-6 1.34-6 3s2.69 3 6 3 6-1.34 6-3-2.69-3-6-3zM6 11v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" },
  { label: "Wallet", to: "/employer/wallet", icon: "M3 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM16 12h.01" },
  { label: "Transactions", to: "/employer/transactions", icon: "M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" }
];

const employeeNav: NavItem[] = [
  { label: "Dashboard", to: "/employee", icon: "M4 6h16M4 12h16M4 18h7" },
  { label: "My Payrolls", to: "/employee/payrolls", icon: "M9 17V7m6 10V7M4 21h16a1 1 0 001-1V4a1 1 0 00-1-1H4a1 1 0 00-1 1v16a1 1 0 001 1z" },
  { label: "Claims", to: "/employee/claims", icon: "M5 13l4 4L19 7" },
  { label: "Wallet", to: "/employee/wallet", icon: "M3 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM16 12h.01" },
  { label: "Transactions", to: "/employee/transactions", icon: "M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" }
];

// Icons that best represent the four primary mobile bottom-nav tabs per role.
export function getBottomNavItems(role: AppRole): NavItem[] {
  return role === "employer"
    ? [employerNav[0], employerNav[2], employerNav[4], employerNav[5]]
    : [employeeNav[0], employeeNav[1], employeeNav[2], employeeNav[4]];
}

/**
 * Compact desktop top navigation bar, replacing the previous fixed sidebar
 * so pages get the full viewport width back.
 */
export function TopNav({ role }: { role: AppRole }) {
  const items = role === "employer" ? employerNav : employeeNav;

  return (
    <header className="sticky top-0 z-30 hidden border-b border-line bg-white/90 backdrop-blur md:block">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <img src={logo} alt="Sweldo" className="h-7 w-7 rounded-md object-cover" />
          <span className="font-display text-base font-semibold tracking-tight text-ink-900">Sweldo</span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/employer" || item.to === "/employee"}
              className={({ isActive }) =>
                clsx(
                  "group flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-signal-100 text-signal-600"
                    : "text-ink-600 hover:bg-paper-200 hover:text-ink-900"
                )
              }
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-4 w-4 shrink-0"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center">
          <span className="text-[11px] font-medium uppercase tracking-wide text-ink-500">Connected to Testnet</span>
        </div>
      </div>
    </header>
  );
}

/**
 * Thumb-friendly bottom navigation for mobile, mirroring the GCash-style
 * pattern requested in the brief. Shows the four most-used destinations.
 */
export function BottomNav({ role }: { role: AppRole }) {
  const items = getBottomNavItems(role);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur md:hidden">
      <div className="flex h-16 items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/employer" || item.to === "/employee"}
            className={({ isActive }) =>
              clsx(
                "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                isActive ? "text-signal-600" : "text-ink-500"
              )
            }
          >
            {({ isActive }) => (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={isActive ? 2.1 : 1.8}
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

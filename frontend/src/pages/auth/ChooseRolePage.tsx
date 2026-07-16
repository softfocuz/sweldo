import { Link } from "react-router-dom";
import { AuthShell } from "@/components/layout/AuthShell";

const roles = [
  {
    to: "/signup/employer",
    title: "I'm an Employer",
    detail: "I want to pay my team or contractors",
    icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-4a4 4 0 100-8 4 4 0 000 8zm6 3a4 4 0 10-8 0"
  },
  {
    to: "/signup/employee",
    title: "I'm an Employee",
    detail: "I want to receive payments",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
  }
];

export function ChooseRolePage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Choose how you want to continue"
      footer={
        <span>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-signal-500 hover:text-signal-600">
            Log in
          </Link>
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {roles.map((role) => (
          <Link
            key={role.to}
            to={role.to}
            className="group flex flex-col items-center gap-3 rounded-xl border border-line px-5 py-8 text-center transition hover:border-signal-400 hover:shadow-card"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-100 text-signal-600 group-hover:bg-signal-500 group-hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d={role.icon} />
              </svg>
            </span>
            <span className="font-display text-base font-semibold text-ink-900">{role.title}</span>
            <span className="text-xs text-ink-500">{role.detail}</span>
          </Link>
        ))}
      </div>
    </AuthShell>
  );
}

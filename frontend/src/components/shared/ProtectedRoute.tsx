import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { AppRole } from "@/types";

export function ProtectedRoute({ role, children }: { role: AppRole; children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-ink-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userAppRole: AppRole = user.role === "EMPLOYER" ? "employer" : "employee";

  if (userAppRole !== role) {
    return <Navigate to={userAppRole === "employer" ? "/employer" : "/employee"} replace />;
  }

  return <>{children}</>;
}

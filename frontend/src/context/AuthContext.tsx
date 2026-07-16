import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  findEmployeeByUserId,
  findEmployerByUserId,
  getUser
} from "@/lib/api";
import { decodeAccessToken, isTokenExpired } from "@/lib/jwt";
import type { AuthUser } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
  setWalletAddress: (address: string) => void;
  setDisplayName: (name: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function resolveUserFromToken(token: string): Promise<AuthUser | null> {
  const payload = decodeAccessToken(token);
  if (!payload || isTokenExpired(payload)) {
    return null;
  }

  const userResponse = await getUser(payload.sub);
  const backendUser = userResponse.data;

  if (backendUser.role === "EMPLOYER") {
    const employer = await findEmployerByUserId(backendUser.id);
    if (!employer) return null;
    return {
      id: backendUser.id,
      email: backendUser.email,
      role: "EMPLOYER",
      displayName: employer.name,
      profileId: employer.id,
      walletAddress: localStorage.getItem("sweldo_employer_wallet")
    };
  }

  const employee = await findEmployeeByUserId(backendUser.id);
  if (!employee) return null;
  return {
    id: backendUser.id,
    email: backendUser.email,
    role: "EMPLOYEE",
    displayName: employee.name,
    profileId: employee.id,
    walletAddress: localStorage.getItem("sweldo_employee_wallet")
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sweldo_token");
    if (!token) {
      setLoading(false);
      return;
    }
    resolveUserFromToken(token)
      .then((resolved) => {
        if (resolved) {
          setUser(resolved);
        } else {
          localStorage.removeItem("sweldo_token");
        }
      })
      .catch(() => localStorage.removeItem("sweldo_token"))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      setSession: (token, nextUser) => {
        localStorage.setItem("sweldo_token", token);
        setUser(nextUser);
      },
      logout: () => {
        localStorage.removeItem("sweldo_token");
        setUser(null);
      },
      setWalletAddress: (address) => {
        setUser((current) => {
          if (!current) return current;
          const key = current.role === "EMPLOYER" ? "sweldo_employer_wallet" : "sweldo_employee_wallet";
          localStorage.setItem(key, address);
          return { ...current, walletAddress: address };
        });
      },
      setDisplayName: (name) => {
        setUser((current) => (current ? { ...current, displayName: name } : current));
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

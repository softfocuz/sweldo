import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/layout/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { findEmployeeByUserId, findEmployerByUserId, getUser, login } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { useAuth } from "@/context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const loginResponse = await login(email, password);
      const token = loginResponse.data.access_token;
      localStorage.setItem("sweldo_token", token);

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userResponse = await getUser(payload.sub);
      const backendUser = userResponse.data;

      if (backendUser.role === "EMPLOYER") {
        const employer = await findEmployerByUserId(backendUser.id);
        if (!employer) {
          setError("No employer profile found for this account.");
          return;
        }
        setSession(token, {
          id: backendUser.id,
          email: backendUser.email,
          role: "EMPLOYER",
          displayName: employer.name,
          profileId: employer.id,
          walletAddress: localStorage.getItem("sweldo_employer_wallet")
        });
        navigate("/employer");
        return;
      }

      const employee = await findEmployeeByUserId(backendUser.id);
      if (!employee) {
        setError("No employee profile found for this account.");
        return;
      }
      setSession(token, {
        id: backendUser.id,
        email: backendUser.email,
        role: "EMPLOYEE",
        displayName: employee.name,
        profileId: employee.id,
        walletAddress: localStorage.getItem("sweldo_employee_wallet")
      });
      navigate("/employee");
    } catch (err) {
      setError(getErrorMessage(err, "Could not log in. Check your email and password."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Log in"
      subtitle="Welcome back!"
      footer={
        <span>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-medium text-signal-500 hover:text-signal-600">
            Sign up
          </Link>
        </span>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Alert>{error}</Alert>}
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </Button>
      </form>
    </AuthShell>
  );
}

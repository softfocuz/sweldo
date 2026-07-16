import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/layout/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { createEmployeeProfile, createUser, login } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { useAuth } from "@/context/AuthContext";

export function EmployeeSignupPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const userResponse = await createUser(form.email, form.password, "EMPLOYEE");
      const employeeResponse = await createEmployeeProfile(userResponse.data.id, form.fullName);
      const loginResponse = await login(form.email, form.password);

      setSession(loginResponse.data.access_token, {
        id: userResponse.data.id,
        email: userResponse.data.email,
        role: "EMPLOYEE",
        displayName: employeeResponse.data.name,
        profileId: employeeResponse.data.id,
        walletAddress: null
      });
      navigate("/employee");
    } catch (err) {
      setError(getErrorMessage(err, "Could not create your account."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your employee account"
      subtitle="You can connect your Stellar wallet after you log in"
      footer={
        <span>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-signal-500 hover:text-signal-600">
            Log in
          </Link>
        </span>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Full name"
          placeholder="Enter your full name"
          required
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
        />
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
          <Input
            label="Confirm password"
            type="password"
            required
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
          />
        </div>
        {error && <Alert>{error}</Alert>}
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}

import { useState, type FormEvent } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { updateEmployeeProfile } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { useAuth } from "@/context/AuthContext";

export function SettingsPage() {
  const { user, setDisplayName } = useAuth();
  const [name, setName] = useState(user?.displayName ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user?.profileId) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateEmployeeProfile(user.profileId, name);
      setDisplayName(name);
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err, "Could not update your name."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout role="employee" title="Settings">
      <Card className="max-w-xl">
        <CardHeader>
          <h2 className="font-display text-base font-semibold text-ink-900">Your profile</h2>
        </CardHeader>
        <CardBody>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input label="Email address" value={user?.email ?? ""} disabled />
            <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            {error && <Alert>{error}</Alert>}
            {saved && <Alert tone="success">Saved.</Alert>}
            <div>
              <Button type="submit" disabled={saving || name.trim().length === 0}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}

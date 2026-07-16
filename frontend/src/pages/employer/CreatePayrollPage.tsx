import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { createPayroll, listAssets, listEmployees } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { useAuth } from "@/context/AuthContext";
import type { AssetRecord, DistributionType, EmployeeProfile } from "@/types";

const distributionOptions: { value: DistributionType; label: string }[] = [
  { value: "ONE_TIME", label: "One time" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "MILESTONE", label: "Milestone" }
];

export function CreatePayrollPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    employeeId: "",
    assetId: "",
    amount: "",
    distributionType: "ONE_TIME" as DistributionType,
    startDate: ""
  });
  const [milestones, setMilestones] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listEmployees(), listAssets()])
      .then(([employeesResponse, assetsResponse]) => {
        setEmployees(employeesResponse.data);
        setAssets(assetsResponse.data);
        setForm((current) => ({
          ...current,
          employeeId: current.employeeId || employeesResponse.data[0]?.id || "",
          assetId: current.assetId || assetsResponse.data[0]?.id || ""
        }));
      })
      .catch((err) => setOptionsError(getErrorMessage(err, "Could not load employees and assets.")))
      .finally(() => setLoadingOptions(false));
  }, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const scheduleHelp: Record<DistributionType, string> = {
    ONE_TIME: "Paid once, as soon as you fund it.",
    MONTHLY: "First payment on the start date, then automatically every 3 minutes(For Demo ONLY).",
    MILESTONE: "Paid once every milestone below is marked complete — start date is not used."
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setError(null);

    if (!form.employeeId || !form.assetId) {
      setError("Select an employee and an asset.");
      return;
    }

    const cleanedMilestones = milestones.map((m) => m.trim()).filter(Boolean);

    if (form.distributionType === "MILESTONE" && cleanedMilestones.length === 0) {
      setError("Add at least one milestone.");
      return;
    }

    setSubmitting(true);
    try {
      const payroll = await createPayroll({
        employer_id: user.profileId,
        employee_id: form.employeeId,
        asset_id: form.assetId,
        title: form.title,
        amount: Number(form.amount),
        distribution_type: form.distributionType,
        start_date: new Date(form.startDate).toISOString(),
        ...(form.distributionType === "MILESTONE" ? { milestones: cleanedMilestones } : {})
      });
      navigate(`/employer/payrolls?created=${payroll.data.id}`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not create the payroll."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout role="employer" title="Create Payroll">
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <h2 className="font-display text-base font-semibold text-ink-900">Payroll details</h2>
          <p className="mt-1 text-sm text-ink-500">
            This creates the payroll record. Funds are locked separately from the payrolls list.
          </p>
        </CardHeader>
        <CardBody>
          {loadingOptions ? (
            <div className="flex items-center gap-2 py-10 text-sm text-ink-500">
              <Spinner /> Loading employees and assets...
            </div>
          ) : optionsError ? (
            <Alert>{optionsError}</Alert>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <Input
                label="Payroll name"
                placeholder="e.g., July Salary"
                required
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />

              <SelectField
                label="Employee"
                value={form.employeeId}
                onChange={(value) => update("employeeId", value)}
                options={employees.map((employee) => ({ value: employee.id, label: employee.name }))}
                emptyLabel="No employees found. Add one on the backend first."
              />

              <SelectField
                label="Asset"
                value={form.assetId}
                onChange={(value) => update("assetId", value)}
                options={assets.map((asset) => ({
                  value: asset.id,
                  label: asset.is_native ? `${asset.code} (native)` : asset.code
                }))}
                emptyLabel="No assets found. Add one on the backend first."
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Amount"
                  type="number"
                  min="0"
                  step="0.0000001"
                  required
                  value={form.amount}
                  onChange={(e) => update("amount", e.target.value)}
                />
                <SelectField
                  label="Distribution type"
                  value={form.distributionType}
                  onChange={(value) => update("distributionType", value as DistributionType)}
                  options={distributionOptions.map((option) => ({ value: option.value, label: option.label }))}
                />
              </div>

              <Input
                label="Start date"
                type="date"
                required
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
              />

              <p className="-mt-2 text-xs text-ink-500">{scheduleHelp[form.distributionType]}</p>

              {form.distributionType === "MILESTONE" && (
                <div className="flex flex-col gap-2 rounded-xl border border-line bg-paper-50 p-4">
                  <label className="text-sm font-medium text-ink-800">Milestones</label>
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Milestone ${index + 1} name`}
                        value={milestone}
                        onChange={(e) => {
                          const next = [...milestones];
                          next[index] = e.target.value;
                          setMilestones(next);
                        }}
                      />
                      {milestones.length > 1 && (
                        <button
                          type="button"
                          className="text-xs font-medium text-ink-500 hover:text-signal-600"
                          onClick={() => setMilestones(milestones.filter((_, i) => i !== index))}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="self-start text-xs font-medium text-signal-600 hover:text-signal-500"
                    onClick={() => setMilestones([...milestones, ""])}
                  >
                    + Add milestone
                  </button>
                </div>
              )}

              {error && <Alert>{error}</Alert>}

              <Button type="submit" fullWidth disabled={submitting}>
                {submitting ? "Creating payroll..." : "Create payroll"}
              </Button>
            </form>
          )}
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  emptyLabel
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  emptyLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink-800">{label}</label>
      <select
        className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:border-signal-500 focus:ring-2 focus:ring-signal-100 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      >
        {options.length === 0 && <option value="">{emptyLabel ?? `No ${label.toLowerCase()} available`}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

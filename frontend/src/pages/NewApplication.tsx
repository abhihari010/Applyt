import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient, { OpenJob } from "../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ImportJobModal, {
  ImportedData,
  ConfidenceBadge,
} from "../components/ImportJobModal";
import { Link as LinkIcon, AlertCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { AppShell, PageHeader } from "../components/AppShell";
type FormState = {
  company: string;
  role: string;
  location?: string;
  jobUrl?: string;
  dateApplied?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: string;
};

export default function NewApplication() {
  const [form, setForm] = useState<FormState>({
    company: "",
    role: "",
    priority: "MEDIUM",
    status: "SAVED",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedData, setImportedData] = useState<ImportedData | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const location = useLocation();
  const job = location.state?.prefillJob as OpenJob | undefined;
  useEffect(() => {
    if (job) {
      setForm({
        company: job.company,
        role: job.role,
        location: job.location,
        jobUrl: job.jobUrl,
      });
    }
  }, [job]);

  const createMut = useMutation<any, Error, FormState>({
    mutationFn: async (payload: FormState) => {
      const res = await apiClient.post("/apps", payload);
      return res.data;
    },
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["apps"] });
      qc.invalidateQueries({ queryKey: ["applications"] });
      navigate(created?.id ? `/applications/${created.id}` : "/applications");
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { [key: string]: string } = {};
    if (!form.company || form.company.trim() === "") {
      newErrors.company = "Company is required";
    }
    if (!form.role || form.role.trim() === "") {
      newErrors.role = "Role is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    createMut.mutate(form);
  };

  const handleImportSuccess = (data: ImportedData) => {
    setImportedData(data);
    setForm({
      ...form,
      company: data.company || "",
      role: data.role || "",
      location: data.location || "",
      jobUrl: data.jobUrl || "",
    });
  };

  return (
    <AppShell maxWidth="4xl">
      <ImportJobModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
      <PageHeader
        eyebrow="Capture"
        title="New Application"
        description="Save the essentials now. You can enrich notes, contacts, reminders, and attachments later."
        actions={
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="btn-secondary"
            >
              <LinkIcon className="w-4 h-4" />
              Import from URL
            </button>
        }
      />

        <div className="surface p-5 sm:p-8">

          {importedData && (
            <div className="mb-6 rounded-lg border border-brand-200 bg-brand-50 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-brand-900">
                    Auto-imported from URL
                  </p>
                  <ConfidenceBadge confidence={importedData.confidence} />
                </div>
              </div>
              {importedData.warnings && importedData.warnings.length > 0 && (
                <div className="mt-2 space-y-1">
                  {importedData.warnings.map((warning, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-yellow-800"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-brand-700">
                Review and edit the fields below before saving
              </p>
            </div>
          )}
          <form onSubmit={submit} className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">
                Company
              </label>
              <input
                value={form.company}
                onChange={(e) => {
                  setForm({ ...form, company: e.target.value });
                  if (errors.company) setErrors({ ...errors, company: "" });
                }}
                placeholder="Company"
                className={`field ${
                  errors.company ? "border-red-500 focus:ring-red-500/20" : ""
                }`}
                required
              />
              {errors.company && (
                <p className="text-red-600 text-sm">{errors.company}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">
                Role
              </label>
              <input
                value={form.role}
                onChange={(e) => {
                  setForm({ ...form, role: e.target.value });
                  if (errors.role) setErrors({ ...errors, role: "" });
                }}
                placeholder="Role"
                className={`field ${
                  errors.role ? "border-red-500 focus:ring-red-500/20" : ""
                }`}
                required
              />
              {errors.role && (
                <p className="text-red-600 text-sm">{errors.role}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">
                Location
              </label>
            <input
              value={form.location || ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Location"
              className="field"
            />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">
                Job URL
              </label>
            <input
              value={form.jobUrl || ""}
              onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
              placeholder="Job URL"
              className="field"
            />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value as any })
                  }
                  className="field"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Med</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="field"
                >
                  <option value="SAVED">Saved</option>
                  <option value="APPLIED">Applied</option>
                  <option value="OA">OA</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="OFFER">Offer</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-neutral-700">
                Date Applied
              </label>
              <DatePicker
                selected={form.dateApplied ? new Date(form.dateApplied) : null}
                onChange={(date: Date | null) => {
                  setForm({
                    ...form,
                    dateApplied: date ? date.toISOString() : undefined,
                  });
                }}
                dateFormat="MMM d, yyyy"
                className="field"
                placeholderText="Select date"
                wrapperClassName="w-full"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={createMut.isPending}
                className="btn-primary"
              >
                {createMut.isPending ? "Creating..." : "Create Application"}
              </button>
            </div>
            {createMut.isError && (
              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                Error creating application
              </div>
            )}
          </form>
        </div>
    </AppShell>
  );
}

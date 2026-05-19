import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import api from "../api";
import { AppShell, PageHeader } from "../components/AppShell";

interface ImportResult {
  successCount: number;
  errorCount: number;
  totalProcessed: number;
  applications: any[];
  errors: Array<{ rowNumber: number; message: string }>;
}

export default function ImportApplications() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
        setError("Please select a CSV file");
        setFile(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/applications/import/csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(response.data);
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data) {
        setResult(err.response.data);
      } else {
        setError("Failed to import CSV. Please try again.");
      }
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `company,role,location,date_applied,status,priority,job_url
Google,Software Engineer,Mountain View,2024-01-15,APPLIED,HIGH,https://careers.google.com/jobs/123
Microsoft,Product Manager,Seattle,01/20/2024,INTERVIEW,MEDIUM,https://careers.microsoft.com/us/en/job/456
Amazon,Data Scientist,Remote,2024-01-25,REJECTED,LOW,https://amazon.jobs/en/jobs/789`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "applications_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AppShell maxWidth="4xl">
        <PageHeader
          eyebrow="Bulk capture"
          title="Import Applications"
          description="Upload a CSV to bring your existing search history into the cockpit."
        />

        {/* Instructions Card */}
        <div className="surface mb-6 p-6">
          <h2 className="mb-3 flex items-center text-lg font-semibold text-neutral-950">
            <FileText className="w-5 h-5 mr-2" />
            CSV Format Requirements
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="mb-2 font-semibold text-brand-900">
                Required Headers:
              </h3>
              <ul className="list-inside list-disc space-y-1 text-neutral-700">
                <li>
                  <strong>company</strong> - Company name
                </li>
                <li>
                  <strong>role</strong> - Job title (also accepts: position,
                  job_title, title)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-brand-900">
                Optional Headers:
              </h3>
              <ul className="list-inside list-disc space-y-1 text-neutral-700">
                <li>
                  <strong>location</strong> - Job location (also accepts: city,
                  loc)
                </li>
                <li>
                  <strong>date_applied</strong> - Application date (also
                  accepts: applied_date, date, applied)
                  <br />
                  <span className="text-xs ml-5">
                    Formats: YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY
                  </span>
                </li>
                <li>
                  <strong>status</strong> - Application status
                  <br />
                  <span className="text-xs ml-5">
                    Values: APPLIED, INTERVIEW, OFFER, REJECTED,
                    WITHDRAWN
                  </span>
                </li>
                <li>
                  <strong>priority</strong> - Application priority
                  <br />
                  <span className="text-xs ml-5">
                    Values: LOW, MEDIUM, HIGH
                  </span>
                </li>
                <li>
                  <strong>job_url</strong> - Link to job posting (also accepts:
                  url, link, job_link)
                </li>
              </ul>
            </div>

            <div className="border-t border-neutral-200 pt-2">
              <p className="text-neutral-700">
                <strong>Note:</strong> Headers are case-insensitive. If
                date_applied is not provided, the current date will be used. If
                status is not provided, it defaults to APPLIED. If priority is
                not provided, it defaults to MEDIUM.
              </p>
            </div>
          </div>

          <button
            onClick={downloadTemplate}
            className="btn-secondary mt-4"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template CSV
          </button>
        </div>

        {/* Upload Section */}
        <div className="surface mb-6 p-6">
          <h2 className="text-xl font-semibold mb-4">Upload CSV File</h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="csv-upload"
                className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50/60 transition-colors hover:border-brand-500 hover:bg-brand-50"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="mb-2 h-10 w-10 text-brand-700" />
                  <p className="text-sm text-neutral-600">
                    {file ? (
                        <span className="font-semibold text-brand-700">
                        {file.name}
                      </span>
                    ) : (
                      <>
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    CSV file (max 5MB)
                  </p>
                </div>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {file && (
              <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-brand-700 mr-2" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setError(null);
                    setResult(null);
                  }}
                  className="icon-button text-neutral-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="btn-primary w-full"
            >
              {importing ? "Importing..." : "Import Applications"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Import Failed</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="surface p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                Import Summary
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="text-center">
                  <div className="metric-value text-green-700">
                    {result.successCount}
                  </div>
                  <div className="text-sm text-gray-600">Successful</div>
                </div>
                <div className="text-center">
                  <div className="metric-value text-red-700">
                    {result.errorCount}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="metric-value text-brand-700">
                    {result.totalProcessed}
                  </div>
                  <div className="text-sm text-gray-600">Total Rows</div>
                </div>
              </div>

              {result.successCount > 0 && (
                <button
                  onClick={() => navigate("/applications")}
                  className="btn-primary mt-4 w-full"
                >
                  View Applications
                </button>
              )}
            </div>

            {/* Errors */}
            {result.errors && result.errors.length > 0 && (
              <div className="surface p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-3">
                  Import Errors ({result.errors.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="bg-red-50 border border-red-200 rounded p-3 text-sm"
                    >
                      <span className="font-semibold text-red-900">
                        Row {err.rowNumber}:
                      </span>{" "}
                      <span className="text-red-700">{err.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
    </AppShell>
  );
}

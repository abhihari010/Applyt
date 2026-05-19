import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  ExternalLink,
  MapPin,
  Plus,
  RefreshCw,
  SearchX,
} from "lucide-react";
import { OpenJob, jobsApi } from "../api";
import {
  AppShell,
  EmptyState,
  PageHeader,
  SkeletonBlock,
} from "../components/AppShell";

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

const OpenJobs = () => {
  const [openJobs, setOpenJobs] = useState<OpenJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const pageSize = 20;
  const navigate = useNavigate();

  const fetchOpenJobs = async (pageNum: number = 0) => {
    setLoading(true);
    setError("");
    try {
      const response = await jobsApi.getOpenInternships(pageNum, pageSize);
      const pageData = response.data as PageResponse<OpenJob>;
      setOpenJobs(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
      setPage(pageData.number);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch open jobs");
      console.error("Error fetching open jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenJobs(page);
  }, []);

  const handleAddApplication = (job: OpenJob) => {
    navigate("/applications/new", { state: { prefillJob: job } });
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Market scan"
        title="Open Jobs"
        description="Fresh internship listings you can add to your tracked applications."
        metric={`${totalElements} listings`}
        actions={
          <button
            onClick={() => fetchOpenJobs(page)}
            disabled={loading}
            className="btn-primary"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing" : "Refresh"}
          </button>
        }
      />

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          {error}
        </div>
      )}

      {loading && openJobs.length === 0 ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((item) => (
            <SkeletonBlock key={item} className="h-24" />
          ))}
        </div>
      ) : openJobs.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No open jobs available"
          description="The feed is quiet right now. Refresh later or add a role manually if you already have a link."
        />
      ) : (
        <div className="surface overflow-hidden">
          <ul className="divide-y divide-neutral-200">
            {openJobs.map((job, index) => (
              <li
                key={`${job.company}-${job.role}-${index}`}
                className="animate-stagger-in hover:bg-brand-50/40"
                style={{ "--stagger": index } as React.CSSProperties}
              >
                <div className="px-5 py-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-950">
                        {job.role}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-600">
                        {job.company}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-mono">
                          <Calendar className="h-4 w-4" />
                          {new Date(job.datePosted).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleAddApplication(job)}
                        className="btn-primary"
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </button>
                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Apply
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-mono text-sm text-neutral-500">
            Showing {page * pageSize + 1} to{" "}
            {Math.min((page + 1) * pageSize, totalElements)} of{" "}
            {totalElements} jobs
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fetchOpenJobs(page - 1)}
              disabled={page === 0 || loading}
              className="btn-secondary"
            >
              Previous
            </button>
            <span className="px-4 py-2 font-mono text-sm text-neutral-700">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => fetchOpenJobs(page + 1)}
              disabled={page >= totalPages - 1 || loading}
              className="btn-secondary"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {totalPages <= 1 && openJobs.length > 0 && (
        <div className="mt-6 text-center font-mono text-sm text-neutral-500">
          Showing all {totalElements} job{totalElements !== 1 ? "s" : ""}
        </div>
      )}
    </AppShell>
  );
};

export default OpenJobs;

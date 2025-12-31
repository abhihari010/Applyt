import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { OpenJob, jobsApi } from "../api";

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

  // Fetch jobs when component mounts
  useEffect(() => {
    fetchOpenJobs(page);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Open Jobs</h1>
            <p className="text-gray-600 mt-1">
              Current open job listings. Updated every 12 hours.
            </p>
          </div>
          <button
            onClick={() => fetchOpenJobs(page)}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading && openJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading jobs...</p>
          </div>
        ) : openJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No open jobs available at the moment.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {openJobs.map((job, index) => (
                <li key={index} className="hover:bg-gray-50">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {job.role}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {job.company}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>📍 {job.location}</span>
                          <span>
                            📅 {new Date(job.datePosted).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        Apply
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {page * pageSize + 1} to{" "}
              {Math.min((page + 1) * pageSize, totalElements)} of{" "}
              {totalElements} jobs
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchOpenJobs(page - 1)}
                disabled={page === 0 || loading}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => fetchOpenJobs(page + 1)}
                disabled={page >= totalPages - 1 || loading}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {totalPages <= 1 && openJobs.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing all {totalElements} job{totalElements !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenJobs;

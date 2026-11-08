import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Filter,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Archive,
} from "lucide-react";
import api, { Application } from "../api";
import ApplicationCard from "../components/ApplicationCard";
import { useAuth } from "../hooks/useAuth";
import { useBulkDelete } from "../hooks/useBulkDelete";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import {
  AppShell,
  EmptyState,
  PageHeader,
  PageLoader,
} from "../components/AppShell";

const ITEMS_PER_PAGE = 12;

export default function Applications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] =
    useState<Application | null>(null);

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["applications", "withArchived"],
    queryFn: async () => {
      const response = await api.get("/apps", {
        params: { includeArchived: true },
      });
      // Handle both paginated and direct array responses
      const data = response.data.content || response.data;
      return Array.isArray(data) ? data : [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/apps/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  // Filter and search
  const filteredApplications = useMemo(() => {
    // Ensure we always work with an array
    if (!Array.isArray(applications)) return [];

    let filtered = applications;

    // Filter out archived applications unless user preference says to show them
    if (!user?.showArchivedApps) {
      filtered = filtered.filter((app: Application) => !app.archived);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (app: Application) =>
          app.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.location?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (app: Application) => app.status === statusFilter,
      );
    }

    // Priority filter
    if (priorityFilter !== "ALL") {
      filtered = filtered.filter(
        (app: Application) => app.priority === priorityFilter,
      );
    }

    return filtered;
  }, [
    applications,
    searchQuery,
    statusFilter,
    priorityFilter,
    user?.showArchivedApps,
  ]);

  // Select all covers every filtered application, across pages.
  const bulk = useBulkDelete({
    items: filteredApplications,
    noun: "application",
    deleteOne: (app: Application) => api.delete(`/apps/${app.id}`),
    onDeleted: () =>
      queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });

  // Pagination (clamped: deleting the whole last page must not strand us on an empty one)
  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const page = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedApplications = filteredApplications.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleDelete = async (
    id: string,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    const app = applications.find((a) => a.id === id);
    if (app) {
      setApplicationToDelete(app);
      setDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (applicationToDelete) {
      deleteMutation.mutate(applicationToDelete.id, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setApplicationToDelete(null);
        },
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return <PageLoader label="Loading applications" />;
  }

  const hasActiveFilters =
    Boolean(searchQuery) || statusFilter !== "ALL" || priorityFilter !== "ALL";

  return (
    <AppShell>
      <PageHeader
        eyebrow="Tracked roles"
        title="Applications"
        description="Search, filter, and inspect every opportunity without losing your place."
        metric={`${filteredApplications.length} visible`}
        actions={
          <>
            <button
              onClick={() => navigate("/applications/import")}
              className="btn-secondary"
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </button>
            <button
              onClick={() => navigate("/applications/new")}
              className="btn-primary"
            >
              <Plus className="h-4 w-4" />
              New Application
            </button>
          </>
        }
      />

      {/* Filters */}
      <div className="surface mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company, role, or location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="field pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="field pl-10 appearance-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SAVED">Saved</option>
              <option value="APPLIED">Applied</option>
              <option value="OA">Online Assessment</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="field pl-10 appearance-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 font-mono text-sm text-neutral-600">
          Showing {paginatedApplications.length} of{" "}
          {filteredApplications.length} applications
        </div>
      </div>

      {/* Applications Grid */}
      {paginatedApplications.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="No applications found"
          description={
            searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL"
              ? "The current filters are hiding everything. Clear them to get back to your full pipeline."
              : "Add your first application or import a CSV to start building your search cockpit."
          }
          action={
            hasActiveFilters ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setPriorityFilter("ALL");
                  setCurrentPage(1);
                }}
                className="btn-secondary"
              >
                Clear filters
              </button>
            ) : (
              <button
                onClick={() => navigate("/applications/new")}
                className="btn-primary"
              >
                <Plus className="h-4 w-4" />
                Add application
              </button>
            )
          }
        />
      ) : (
        <>
          {bulk.bar}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedApplications.map((application: Application, index) => (
              <div
                key={application.id}
                className="group relative animate-stagger-in"
                style={{ "--stagger": index } as React.CSSProperties}
              >
                <ApplicationCard
                  application={application}
                  className="pl-11"
                  onClick={() => navigate(`/applications/${application.id}`)}
                />
                <div className="absolute left-3.5 top-4 flex">
                  {bulk.checkbox(
                    application,
                    `Select ${application.role} at ${application.company}`,
                  )}
                </div>
                <button
                  onClick={(e) => handleDelete(application.id, e)}
                  className="icon-button absolute right-2 top-2 min-h-9 min-w-9 bg-white text-red-700 opacity-0 shadow-soft transition-opacity group-hover:opacity-100 focus:opacity-100"
                  aria-label={`Delete ${application.role} at ${application.company}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="icon-button border-neutral-300 bg-white"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-4 py-2 rounded-lg ${
                        page === pageNumber
                          ? "bg-brand-700 text-white"
                          : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="icon-button border-neutral-300 bg-white"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setApplicationToDelete(null);
        }}
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
        title="Delete Application"
        message={
          applicationToDelete
            ? `Are you sure you want to delete your application to ${applicationToDelete.company} for ${applicationToDelete.role}? This action cannot be undone.`
            : ""
        }
      />
    </AppShell>
  );
}

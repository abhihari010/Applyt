import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { useState, useMemo } from "react";
import { Search, Filter, Minimize2, Maximize2, Columns3 } from "lucide-react";
import api from "../api";
import ApplicationCard from "../components/ApplicationCard";
import { useAuth } from "../hooks/useAuth";
import { AppShell, EmptyState, PageHeader, PageLoader } from "../components/AppShell";

const STATUSES = [
  { id: "SAVED", label: "Saved", color: "bg-neutral-100 text-neutral-800" },
  { id: "APPLIED", label: "Applied", color: "bg-brand-50 text-brand-800" },
  { id: "OA", label: "Assessment", color: "bg-accent-50 text-accent-800" },
  { id: "INTERVIEW", label: "Interview", color: "bg-amber-50 text-amber-800" },
  { id: "OFFER", label: "Offer", color: "bg-green-50 text-green-800" },
  { id: "REJECTED", label: "Rejected", color: "bg-red-50 text-red-800" },
];

const ITEMS_PER_COLUMN = 5;

export default function Board() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [compactView, setCompactView] = useState(true);
  const [dateRange, setDateRange] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("");
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>(
    STATUSES.reduce(
      (acc, status) => ({ ...acc, [status.id]: ITEMS_PER_COLUMN }),
      {}
    )
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const response = await api.get("/apps");
      const data = response.data.content || response.data;
      return Array.isArray(data) ? data : [];
    },
  });

  // Filter applications
  const filteredApplications = useMemo(() => {
    if (!Array.isArray(applications)) return [];

    let filtered = applications;

    // Filter out archived applications unless user preference says to show them
    if (!user?.showArchivedApps) {
      filtered = filtered.filter((app: any) => !app.archived);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (app: any) =>
          app.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Company filter
    if (companyFilter) {
      filtered = filtered.filter((app: any) =>
        app.company?.toLowerCase().includes(companyFilter.toLowerCase())
      );
    }

    // Date range filter
    if (dateRange !== "all" && filtered.length > 0) {
      const now = new Date();
      const days = parseInt(dateRange);
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      filtered = filtered.filter((app: any) => {
        if (!app.dateApplied) return false;
        const appDate = new Date(app.dateApplied);
        return appDate >= cutoffDate;
      });
    }

    return filtered;
  }, [
    applications,
    searchQuery,
    companyFilter,
    dateRange,
    user?.showArchivedApps,
  ]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.patch(`/apps/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const applicationId = active.id as number;
      const newStatus = over.id as string;

      queryClient.setQueryData(["applications"], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((app: any) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        );
      });
      updateStatusMutation.mutate({ id: applicationId, status: newStatus });
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const getApplicationsByStatus = (status: string) => {
    if (!Array.isArray(filteredApplications)) return [];
    return filteredApplications.filter((app: any) => app.status === status);
  };

  const activeApplication = Array.isArray(filteredApplications)
    ? filteredApplications.find((app: any) => app.id === activeId)
    : null;

  const loadMore = (statusId: string) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [statusId]: prev[statusId] + ITEMS_PER_COLUMN,
    }));
  };

  if (isLoading) {
    return <PageLoader label="Loading board" />;
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Pipeline"
        title="Application Board"
        description="Drag cards across stages to keep your search moving. Filters narrow the board without hiding the workflow."
        metric={`${filteredApplications.length} cards`}
        actions={
            <button
              onClick={() => setCompactView(!compactView)}
              className="btn-secondary"
            >
              {compactView ? (
                <>
                  <Maximize2 className="h-4 w-4" />
                  <span>Expanded View</span>
                </>
              ) : (
                <>
                  <Minimize2 className="h-4 w-4" />
                  <span>Compact View</span>
                </>
              )}
            </button>
        }
      />
          {/* Filters */}
          <div className="surface mb-6 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="field pl-10"
                />
              </div>

              {/* Company Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by company..."
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="field pl-10"
                />
              </div>

              {/* Date Range */}
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="field appearance-none"
                >
                  <option value="all">All Time</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-center font-mono text-sm text-neutral-600">
                {filteredApplications.length} applications
              </div>
            </div>
          </div>

          {filteredApplications.length === 0 && (
            <EmptyState
              icon={Columns3}
              title="No cards match this board"
              description="Adjust search, company, or date filters to see your applications by stage."
            />
          )}

          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            {/* Grid Layout */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {STATUSES.map((status) => (
                <Column
                  key={status.id}
                  status={status}
                  applications={getApplicationsByStatus(status.id)}
                  onCardClick={(id: string) => navigate(`/applications/${id}`)}
                  compactView={compactView}
                  visibleCount={visibleCounts[status.id]}
                  onLoadMore={() => loadMore(status.id)}
                />
              ))}
            </div>

            <DragOverlay>
              {activeId && activeApplication ? (
                <ApplicationCard
                  application={activeApplication}
                  className="rotate-3 opacity-90"
                />
              ) : null}
            </DragOverlay>
          </DndContext>
    </AppShell>
  );
}

function Column({
  status,
  applications,
  onCardClick,
  compactView,
  visibleCount,
  onLoadMore,
}: any) {
  const { setNodeRef } = useDroppable({
    id: status.id,
  });

  const visibleApps = applications.slice(0, visibleCount);
  const hasMore = applications.length > visibleCount;

  return (
    <section className="surface overflow-hidden">
      <div className={`${status.color} border-b border-neutral-200 p-3`}>
        <h3 className="flex items-center justify-between font-semibold">
          <span>{status.label}</span>
          <span className="font-mono text-sm font-semibold opacity-70">
            {applications.length}
          </span>
        </h3>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-32 space-y-2 bg-neutral-50/80 p-3 ${
          compactView ? "max-h-96" : "max-h-[600px]"
        } overflow-y-auto`}
      >
        {visibleApps.map((application: any) => (
          <DraggableCard
            key={application.id}
            application={application}
            onClick={() => onCardClick(application.id)}
            compactView={compactView}
          />
        ))}
        {applications.length === 0 && (
          <p className="rounded-lg border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500">
            Drop cards here
          </p>
        )}
        {hasMore && (
          <button
            onClick={onLoadMore}
            className="btn-secondary w-full"
          >
            Load More ({applications.length - visibleCount} remaining)
          </button>
        )}
      </div>
    </section>
  );
}

function DraggableCard({ application, onClick, compactView }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: application.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ApplicationCard
        application={application}
        onClick={onClick}
        className={compactView ? "text-sm" : ""}
      />
    </div>
  );
}

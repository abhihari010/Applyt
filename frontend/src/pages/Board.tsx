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
import { Search, Filter, Minimize2, Maximize2 } from "lucide-react";
import api from "../api";
import Nav from "../components/Nav";
import ApplicationCard from "../components/ApplicationCard";
import { useAuth } from "../hooks/useAuth";

const STATUSES = [
  { id: "SAVED", label: "Saved", color: "bg-gray-100" },
  { id: "APPLIED", label: "Applied", color: "bg-blue-100" },
  { id: "OA", label: "Online Assessment", color: "bg-purple-100" },
  { id: "INTERVIEW", label: "Interview", color: "bg-yellow-100" },
  { id: "OFFER", label: "Offer", color: "bg-green-100" },
  { id: "REJECTED", label: "Rejected", color: "bg-red-100" },
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
    return (
      <div>
        <Nav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Application Pipeline
            </h1>
            <button
              onClick={() => setCompactView(!compactView)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
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
          </div>
          <h3 className=" text-gray-900 mb-6">
            Drag and drop your application cards to their respective status to
            update them.
          </h3>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Date Range */}
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  <option value="all">All Time</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-center text-sm text-gray-600">
                {filteredApplications.length} applications
              </div>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>
      </div>
    </div>
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className={`${status.color} rounded-t-lg p-3`}>
        <h3 className="font-semibold text-gray-900 flex items-center justify-between">
          <span>{status.label}</span>
          <span className="text-sm font-normal text-gray-600">
            {applications.length}
          </span>
        </h3>
      </div>

      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-32 bg-gray-50 rounded-b-lg p-3 ${
          compactView ? "max-h-96" : "max-h-600"
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
          <p className="text-sm text-gray-400 text-center py-8">
            Drop cards here
          </p>
        )}
        {hasMore && (
          <button
            onClick={onLoadMore}
            className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Load More ({applications.length - visibleCount} remaining)
          </button>
        )}
      </div>
    </div>
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

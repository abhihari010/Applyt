import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { remindersApi, applicationsApi, analyticsApi, Reminder } from "../api";
import {
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  Trash2,
  CheckSquare,
  Plus,
  ArrowRight,
  SquareKanban,
  BarChart3,
  Briefcase,
} from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { AppShell, EmptyState, PageHeader, StatTile } from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(
    null,
  );

  const { data: reminders } = useQuery({
    queryKey: ["reminders", "all"],
    queryFn: () => remindersApi.getAll().then((res) => res.data),
  });

  const { data: allApps } = useQuery({
    queryKey: ["applications", "all"],
    queryFn: () =>
      applicationsApi.getAll({ page: 0, size: 100 }).then((res) => res.data),
  });

  const { data: appsData } = useQuery({
    queryKey: ["applications"],
    queryFn: () =>
      applicationsApi.getAll({ page: 0, size: 5 }).then((res) => res.data),
  });

  const { data: analytics } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => analyticsApi.get().then((res) => res.data),
  });

  const stats = [
    {
      label: "Total Applications",
      value: analytics?.statusCounts
        ? Object.values(analytics.statusCounts).reduce((a, b) => a + b, 0)
        : 0,
      icon: TrendingUp,
      tone: "brand" as const,
    },
    {
      label: "In Progress",
      value:
        (analytics?.statusCounts?.APPLIED || 0) +
        (analytics?.statusCounts?.OA || 0) +
        (analytics?.statusCounts?.INTERVIEW || 0),
      icon: Clock,
      tone: "warning" as const,
    },
    {
      label: "Offers",
      value: analytics?.statusCounts?.OFFER || 0,
      icon: CheckCircle,
      tone: "success" as const,
    },
    {
      label: "Due Reminders",
      value: Array.isArray(reminders) ? reminders.filter((r) => !r.completed).length : 0,
      icon: Bell,
      tone: "accent" as const,
    },
  ];
  const deleteMutation = useMutation({
    mutationFn: ({ appId, id }: { appId: string; id: string }) =>
      remindersApi.delete(appId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", "all"] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ appId, id }: { appId: string; id: string }) =>
      remindersApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", "all"] });
    },
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const reminder = Array.isArray(reminders) ? reminders.find((r) => r.id === id) : undefined;
    if (reminder) {
      setReminderToDelete(reminder);
      setDeleteModalOpen(true);
    }
  };

  const confirmDeleteReminder = () => {
    if (reminderToDelete) {
      deleteMutation.mutate(
        {
          appId: reminderToDelete.applicationId,
          id: reminderToDelete.id,
        },
        {
          onSuccess: () => {
            setDeleteModalOpen(false);
            setReminderToDelete(null);
          },
        },
      );
    }
  };

  const handleComplete = async (
    appId: string,
    id: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    completeMutation.mutate({ appId, id });
  };

  const getUrgency = (date: string) => {
    const reminderDate = new Date(date);
    const now = new Date();

    if (isPast(reminderDate) && reminderDate < now) {
      return {
        label: "Overdue",
        badgeClass: "bg-red-100 text-red-800",
        bgColor: "bg-red-50",
        borderColor: "border-red-500",
      };
    }
    if (isToday(reminderDate)) {
      return {
        label: "Today",
        badgeClass: "bg-orange-100 text-orange-800",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-500",
      };
    }
    if (isTomorrow(reminderDate)) {
      return {
        label: "Tomorrow",
        badgeClass: "bg-yellow-100 text-yellow-800",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-500",
      };
    }
    return {
      label: "Upcoming",
      badgeClass: "bg-purple-100 text-purple-800",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-500",
    };
  };

  const getApplicationName = (appId: string) => {
    const app = Array.isArray(allApps?.content) 
      ? allApps.content.find((a: any) => a.id === appId)
      : null;
    return app ? { company: app.company, role: app.role } : null;
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Command center"
        title="Dashboard"
        description="A fast read on your pipeline, reminders, and the next useful move."
        actions={
          <Link to="/applications/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            New Application
          </Link>
        }
      />

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatTile
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              tone={stat.tone}
              index={index}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Due Reminders */}
          <section className="surface p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="kicker">Time-sensitive</p>
                <h2 className="mt-1 text-xl font-semibold text-neutral-950">
                  Upcoming Reminders
                </h2>
              </div>
              <Bell className="h-5 w-5 text-accent-700" />
            </div>
            {Array.isArray(reminders) && reminders.filter((r) => !r.completed).length > 0 ? (
              <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                {reminders
                  .filter((r) => !r.completed)
                  .slice(0, 10)
                  .map((reminder) => {
                    const urgency = getUrgency(reminder.remindAt);
                    const app = getApplicationName(reminder.applicationId);
                    return (
                      <div
                        key={reminder.id}
                        className={`animate-stagger-in cursor-pointer rounded-lg border border-neutral-200 bg-white p-3 shadow-sm transition duration-200 ease-out hover:border-brand-200 hover:shadow-soft-lg`}
                        onClick={() =>
                          navigate(`/applications/${reminder.applicationId}`)
                        }
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-semibold ${urgency.badgeClass}`}
                              >
                                {urgency.label}
                              </span>
                              {app && (
                                <span className="text-xs text-gray-600 font-medium">
                                  {app.company} / {app.role}
                                </span>
                              )}
                            </div>
                            <p className="mb-1 text-sm font-semibold text-neutral-950">
                              {reminder.message}
                            </p>
                            <p className="font-mono text-xs text-neutral-500">
                              {format(
                                new Date(reminder.remindAt),
                                "MMM d, yyyy h:mm a",
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={(e) =>
                                handleComplete(
                                  reminder.applicationId,
                                  reminder.id,
                                  e,
                                )
                              }
                              className="icon-button min-h-9 min-w-9 text-green-700 hover:bg-green-50"
                              aria-label="Mark reminder complete"
                              disabled={completeMutation.isPending}
                            >
                              <CheckSquare className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(reminder.id, e)}
                              className="icon-button min-h-9 min-w-9 text-red-700 hover:bg-red-50"
                              aria-label="Delete reminder"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <EmptyState
                icon={Bell}
                title="No reminders due"
                description="Your follow-ups are quiet. Add reminders from an application detail page when a recruiter gives you a date."
              />
            )}
          </section>

          {/* Recent Applications */}
          <section className="surface p-5 sm:p-6">
            <h2 className="mb-4 flex items-center justify-between text-xl font-semibold text-neutral-950">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand-700" />
                Recent Applications
              </span>
              <Link
                to="/applications"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </h2>
            {appsData?.content && appsData.content.length > 0 ? (
              <div className="space-y-3">
                {appsData.content.map((app, index) => (
                  <Link
                    key={app.id}
                    to={`/applications/${app.id}`}
                    className="animate-stagger-in block rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition duration-200 ease-out hover:border-brand-200 hover:bg-brand-50/40"
                    style={{ "--stagger": index } as React.CSSProperties}
                  >
                    <p className="text-sm font-semibold text-neutral-950">
                      {app.role}
                    </p>
                    <p className="mt-1 text-xs text-neutral-600">{app.company}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <StatusBadge status={app.status} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No applications yet"
                description="Start with one tracked role, then let the board and analytics do the organizing work."
                action={
                  <Link to="/applications/new" className="btn-primary">
                    <Plus className="h-4 w-4" />
                    Add application
                  </Link>
                }
              />
            )}
          </section>
        </div>

        {/* Quick Actions */}
        <div className="surface mt-6 p-5 sm:p-6">
          <h3 className="mb-3 text-lg font-semibold text-neutral-950">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/applications/new"
              className="btn-primary"
            >
              <Plus className="h-4 w-4" />
              Add New Application
            </Link>
            <Link
              to="/board"
              className="btn-secondary"
            >
              <SquareKanban className="h-4 w-4" />
              View Board
            </Link>
            <Link
              to="/analytics"
              className="btn-secondary"
            >
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </Link>
            <Link
              to="/open-jobs"
              className="btn-secondary"
            >
              <Briefcase className="h-4 w-4" />
              View Open Jobs
            </Link>
          </div>
        </div>
      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setReminderToDelete(null);
        }}
        onConfirm={confirmDeleteReminder}
        loading={deleteMutation.isPending}
        title="Delete Reminder"
        message={
          reminderToDelete
            ? `Are you sure you want to delete this reminder? This action cannot be undone.`
            : ""
        }
      />
    </AppShell>
  );
}

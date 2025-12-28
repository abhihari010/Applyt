import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import { remindersApi, applicationsApi, analyticsApi } from "../api";
import {
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  Trash2,
  ExternalLink,
  CheckSquare,
} from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
      value: analytics
        ? Object.values(analytics.statusCounts).reduce((a, b) => a + b, 0)
        : 0,
      icon: TrendingUp,
      color: "bg-blue-500",
    },
    {
      label: "In Progress",
      value:
        (analytics?.statusCounts.APPLIED || 0) +
        (analytics?.statusCounts.OA || 0) +
        (analytics?.statusCounts.INTERVIEW || 0),
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      label: "Offers",
      value: analytics?.statusCounts.OFFER || 0,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      label: "Due Reminders",
      value: reminders?.filter((r) => !r.completed).length || 0,
      icon: Bell,
      color: "bg-purple-500",
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

  const handleDelete = async (
    appId: string,
    id: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this reminder?")) {
      deleteMutation.mutate({ appId, id });
    }
  };

  const handleComplete = async (
    appId: string,
    id: string,
    e: React.MouseEvent
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
        color: "red",
        bgColor: "bg-red-50",
        borderColor: "border-red-500",
      };
    }
    if (isToday(reminderDate)) {
      return {
        label: "Today",
        color: "orange",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-500",
      };
    }
    if (isTomorrow(reminderDate)) {
      return {
        label: "Tomorrow",
        color: "yellow",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-500",
      };
    }
    return {
      label: "Upcoming",
      color: "purple",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-500",
    };
  };

  const getApplicationName = (appId: string) => {
    const app = allApps?.content?.find((a: any) => a.id === appId);
    return app ? { company: app.company, role: app.role } : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's your application overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Due Reminders */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-purple-600" />
              Upcoming Reminders
            </h2>
            {reminders && reminders.filter((r) => !r.completed).length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {reminders
                  .filter((r) => !r.completed)
                  .slice(0, 10)
                  .map((reminder) => {
                    const urgency = getUrgency(reminder.remindAt);
                    const app = getApplicationName(reminder.applicationId);
                    return (
                      <div
                        key={reminder.id}
                        className={`border-l-4 ${urgency.borderColor} ${urgency.bgColor} rounded-r-lg p-3 cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() =>
                          navigate(`/applications/${reminder.applicationId}`)
                        }
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-${urgency.color}-100 text-${urgency.color}-800`}
                              >
                                {urgency.label}
                              </span>
                              {app && (
                                <span className="text-xs text-gray-600 font-medium">
                                  {app.company} - {app.role}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {reminder.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(
                                new Date(reminder.remindAt),
                                "MMM d, yyyy h:mm a"
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={(e) =>
                                handleComplete(
                                  reminder.applicationId,
                                  reminder.id,
                                  e
                                )
                              }
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors cursor-pointer"
                              title="Mark complete"
                              disabled={completeMutation.isPending}
                            >
                              <CheckSquare className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) =>
                                handleDelete(
                                  reminder.applicationId,
                                  reminder.id,
                                  e
                                )
                              }
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors cursor-pointer"
                              title="Delete"
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
              <p className="text-gray-500 text-sm">No upcoming reminders</p>
            )}
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Recent Applications
              </span>
              <Link
                to="/applications"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </h2>
            {appsData?.content && appsData.content.length > 0 ? (
              <div className="space-y-3">
                {appsData.content.map((app) => (
                  <Link
                    key={app.id}
                    to={`/applications/${app.id}`}
                    className="block border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {app.role}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{app.company}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          app.status === "OFFER"
                            ? "bg-green-100 text-green-800"
                            : app.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : app.status === "INTERVIEW"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No applications yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/applications/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Add New Application
            </Link>
            <Link
              to="/board"
              className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              View Board
            </Link>
            <Link
              to="/analytics"
              className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              View Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

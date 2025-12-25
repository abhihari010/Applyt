import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import { remindersApi, applicationsApi, analyticsApi } from "../api";
import { Bell, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: reminders } = useQuery({
    queryKey: ["reminders", "due"],
    queryFn: () => remindersApi.getDue(7).then((res) => res.data),
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
            {reminders && reminders.length > 0 ? (
              <div className="space-y-3">
                {reminders.slice(0, 5).map((reminder) => (
                  <div
                    key={reminder.id}
                    className="border-l-4 border-purple-500 pl-4 py-2"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {reminder.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(
                        new Date(reminder.remindAt),
                        "MMM d, yyyy h:mm a"
                      )}
                    </p>
                  </div>
                ))}
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

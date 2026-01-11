import { useQuery } from "@tanstack/react-query";
import {
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  format,
  subWeeks,
} from "date-fns";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Target, CheckCircle } from "lucide-react";
import api from "../api";
import Nav from "../components/Nav";

const STATUS_COLORS: Record<string, string> = {
  SAVED: "#B06645",
  APPLIED: "#3B82F6",
  ONLINE_ASSESSMENT: "#8B5CF6",
  INTERVIEW: "#EAB308",
  OFFER: "#10B981",
  REJECTED: "#EF4444",
  ACCEPTED: "#059669",
};

export default function Analytics() {
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const response = await api.get("/apps");
      return response.data.content || response.data;
    },
  });

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

  // Ensure applications is an array
  const apps = Array.isArray(applications) ? applications : [];

  // Status distribution
  const statusCounts = apps.reduce((acc: any, app: any) => {
    if (app && app.status) {
      acc[app.status] = (acc[app.status] || 0) + 1;
    }
    return acc;
  }, {});

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value: value as number,
  }));

  // Ensure statusData is an array and has data
  const safeStatusData = Array.isArray(statusData) ? statusData : [];

  // Applications per week (last 12 weeks)
  const twelveWeeksAgo = subWeeks(new Date(), 12);
  const weeks = eachWeekOfInterval({
    start: twelveWeeksAgo,
    end: new Date(),
  });

  const weeklyData = weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart);
    const count = apps.filter((app: any) => {
      const appDate = new Date(app.dateApplied || app.createdAt);
      return appDate >= weekStart && appDate <= weekEnd;
    }).length;

    return {
      week: format(weekStart, "MMM d"),
      applications: count,
    };
  });

  // Priority distribution
  const priorityCounts = apps.reduce((acc: any, app: any) => {
    acc[app.priority] = (acc[app.priority] || 0) + 1;
    return acc;
  }, {});

  const priorityData = Object.entries(priorityCounts).map(([name, value]) => ({
    name,
    value: value as number,
  }));

  // Conversion metrics
  const totalApps = apps.length;
  const appliedCount = apps.filter((app: any) =>
    ["APPLIED", "OA", "INTERVIEW", "OFFER"].includes(app.status)
  ).length;
  const interviewedCount = apps.filter((app: any) =>
    ["INTERVIEW", "OFFER"].includes(app.status)
  ).length;
  const offerCount = apps.filter((app: any) =>
    ["OFFER"].includes(app.status)
  ).length;

  const interviewRate =
    appliedCount > 0
      ? ((interviewedCount / appliedCount) * 100).toFixed(1)
      : "0";
  const offerRate =
    interviewedCount > 0
      ? ((offerCount / interviewedCount) * 100).toFixed(1)
      : "0";
  const overallSuccessRate =
    appliedCount > 0 ? ((offerCount / appliedCount) * 100).toFixed(1) : "0";

  const stats = [
    {
      label: "Total Applications",
      value: totalApps,
      icon: Target,
      color: "text-blue-600",
    },
    {
      label: "Applied",
      value: appliedCount,
      icon: TrendingUp,
      color: "text-indigo-600",
    },
    {
      label: "Interviewed",
      value: interviewedCount,
      icon: TrendingUp,
      color: "text-yellow-600",
    },
    {
      label: "Offers",
      value: offerCount,
      icon: CheckCircle,
      color: "text-green-600",
    },
  ];

  return (
    <div>
      <Nav />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className={`h-10 w-10 ${stat.color}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Conversion Rates */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Conversion Funnel
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Interview Rate</p>
                <p className="text-4xl font-bold text-yellow-600">
                  {interviewRate}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {interviewedCount} of {appliedCount} applied
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Offer Rate</p>
                <p className="text-4xl font-bold text-green-600">
                  {offerRate}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {offerCount} of {interviewedCount} interviewed
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Overall Success Rate
                </p>
                <p className="text-4xl font-bold text-emerald-600">
                  {overallSuccessRate}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {offerCount} of {appliedCount} applied
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Applications Over Time */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Applications Per Week
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#3B82F6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Status Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={safeStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {safeStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name] || "#9CA3AF"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Priority Distribution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Priority Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Status Breakdown Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Status Breakdown
              </h2>
              <div className="space-y-3">
                {safeStatusData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor:
                            STATUS_COLORS[
                              item.name.replace(/ /g, "_").toUpperCase()
                            ] || "#9CA3AF",
                        }}
                      />
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {item.value}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({((item.value / totalApps) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

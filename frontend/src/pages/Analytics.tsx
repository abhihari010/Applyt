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
import {
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle,
  Clock,
  Award,
} from "lucide-react";
import api, { Application } from "../api";
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
  const statusCounts = apps.reduce((acc: any, app: Application) => {
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
    const count = apps.filter((app: Application) => {
      const appDate = new Date(app.dateApplied || app.createdAt);
      return appDate >= weekStart && appDate <= weekEnd;
    }).length;

    return {
      week: format(weekStart, "MMM d"),
      applications: count,
    };
  });

  // Priority distribution
  const priorityCounts = apps.reduce((acc: any, app: Application) => {
    acc[app.priority] = (acc[app.priority] || 0) + 1;
    return acc;
  }, {});

  const priorityData = Object.entries(priorityCounts).map(([name, value]) => ({
    name,
    value: value as number,
  }));

  // Conversion metrics
  const totalApps = apps.length;
  const appliedCount = apps.filter((app: Application) =>
    ["APPLIED", "OA", "INTERVIEW", "OFFER"].includes(app.status),
  ).length;
  const interviewedCount = apps.filter((app: Application) =>
    ["INTERVIEW", "OFFER"].includes(app.status),
  ).length;
  const offerCount = apps.filter((app: Application) =>
    ["OFFER"].includes(app.status),
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

  // New Metrics for Preview Match
  // Response Rate: % of applications that got past "Applied" status
  const respondedApps = apps.filter((app: Application) =>
    ["OA", "INTERVIEW", "OFFER", "REJECTED"].includes(app.status),
  ).length;
  const responseRate =
    totalApps > 0 ? ((respondedApps / totalApps) * 100).toFixed(0) : "0";

  // Avg Time to Offer: Days between dateApplied and offer status
  const offeredApps = apps.filter((app: Application) => app.status === "OFFER");
  const avgTimeToOffer =
    offeredApps.length > 0
      ? Math.round(
          offeredApps.reduce((sum: number, app: Application) => {
            const applied = new Date(app.dateApplied || app.createdAt);
            const now = new Date();
            const days = Math.floor(
              (now.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24),
            );
            return sum + days;
          }, 0) / offeredApps.length,
        )
      : 0;

  // Interview Success Rate: % of interviews that led to offers
  const interviewSuccessRate =
    interviewedCount > 0
      ? ((offerCount / interviewedCount) * 100).toFixed(0)
      : "0";

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

          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-brand-100 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-brand-600" />
                </div>
                <span className="text-xs font-bold text-green-600">
                  {respondedApps > 0 ? "+" : ""}
                  {respondedApps}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {responseRate}%
              </div>
              <div className="text-sm text-gray-600">Response Rate</div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-brand-100 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-brand-600" />
                </div>
                <span className="text-xs font-bold text-green-600">
                  {avgTimeToOffer > 0 ? "-" : ""}
                  {avgTimeToOffer > 0 ? `${avgTimeToOffer}d` : "N/A"}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {avgTimeToOffer > 0 ? `${avgTimeToOffer} days` : "N/A"}
              </div>
              <div className="text-sm text-gray-600">Avg. Time to Offer</div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-brand-100 p-2 rounded-lg">
                  <Award className="w-5 h-5 text-brand-600" />
                </div>
                <span className="text-xs font-bold text-green-600">
                  {offerCount > 0 ? "+" : ""}
                  {offerCount}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {interviewSuccessRate}%
              </div>
              <div className="text-sm text-gray-600">Interview Success</div>
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

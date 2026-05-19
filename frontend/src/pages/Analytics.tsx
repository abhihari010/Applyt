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
import { AppShell, EmptyState, PageHeader, PageLoader, StatTile } from "../components/AppShell";

const STATUS_COLORS: Record<string, string> = {
  SAVED: "#8c8373",
  APPLIED: "#1f5f56",
  OA: "#b15d35",
  ONLINE_ASSESSMENT: "#b15d35",
  INTERVIEW: "#d97706",
  OFFER: "#059669",
  REJECTED: "#dc2626",
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
    return <PageLoader label="Loading analytics" />;
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
      tone: "brand" as const,
    },
    {
      label: "Applied",
      value: appliedCount,
      icon: TrendingUp,
      tone: "accent" as const,
    },
    {
      label: "Interviewed",
      value: interviewedCount,
      icon: TrendingUp,
      tone: "warning" as const,
    },
    {
      label: "Offers",
      value: offerCount,
      icon: CheckCircle,
      tone: "success" as const,
    },
  ];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Signal"
        title="Analytics"
        description="Track pace, response patterns, and where your pipeline is converting."
        metric={`${totalApps} total`}
      />

      {totalApps === 0 ? (
        <EmptyState
          icon={Target}
          title="No analytics yet"
          description="Analytics start filling in as soon as you add applications with statuses and dates."
        />
      ) : (
        <>

          {/* Stats Cards */}
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

          {/* Key Performance Metrics */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="surface p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="rounded-lg bg-brand-50 p-2">
                  <Target className="w-5 h-5 text-brand-600" />
                </div>
                <span className="font-mono text-xs font-bold text-green-700">
                  {respondedApps > 0 ? "+" : ""}
                  {respondedApps}
                </span>
              </div>
              <div className="metric-value mb-1">
                {responseRate}%
              </div>
              <div className="text-sm text-neutral-600">Response Rate</div>
            </div>

            <div className="surface p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="rounded-lg bg-brand-50 p-2">
                  <Clock className="w-5 h-5 text-brand-600" />
                </div>
                <span className="font-mono text-xs font-bold text-green-700">
                  {avgTimeToOffer > 0 ? "-" : ""}
                  {avgTimeToOffer > 0 ? `${avgTimeToOffer}d` : "N/A"}
                </span>
              </div>
              <div className="metric-value mb-1">
                {avgTimeToOffer > 0 ? `${avgTimeToOffer} days` : "N/A"}
              </div>
              <div className="text-sm text-neutral-600">Avg. Time to Offer</div>
            </div>

            <div className="surface p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="rounded-lg bg-brand-50 p-2">
                  <Award className="w-5 h-5 text-brand-600" />
                </div>
                <span className="font-mono text-xs font-bold text-green-700">
                  {offerCount > 0 ? "+" : ""}
                  {offerCount}
                </span>
              </div>
              <div className="metric-value mb-1">
                {interviewSuccessRate}%
              </div>
              <div className="text-sm text-neutral-600">Interview Success</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Applications Over Time */}
            <div className="surface p-5">
              <h2 className="mb-4 text-lg font-semibold text-neutral-950">
                Applications Per Week
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ded9cb" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#1f5f56"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Status Distribution */}
            <div className="surface p-5">
              <h2 className="mb-4 text-lg font-semibold text-neutral-950">
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
            <div className="surface p-5">
              <h2 className="mb-4 text-lg font-semibold text-neutral-950">
                Priority Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ded9cb" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#b15d35" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Status Breakdown Table */}
            <div className="surface p-5">
              <h2 className="mb-4 text-lg font-semibold text-neutral-950">
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
                      <span className="text-sm text-neutral-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-neutral-950">
                        {item.value}
                      </span>
                      <span className="font-mono text-xs text-neutral-500">
                        ({((item.value / totalApps) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}

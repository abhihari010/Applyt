import { TrendingUp, Target, Clock, Award } from "lucide-react";
import { motion } from "framer-motion";

interface StatCard {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

const stats: StatCard[] = [
  {
    icon: Target,
    label: "Response Rate",
    value: "32%",
    change: "+12%",
    trend: "up",
  },
  {
    icon: Clock,
    label: "Avg. Time to Offer",
    value: "18 days",
    change: "-3 days",
    trend: "up",
  },
  {
    icon: Award,
    label: "Interview Success",
    value: "68%",
    change: "+8%",
    trend: "up",
  },
];

export default function AnalyticsPreview() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Funnel Chart */}
      <div className="bg-gradient-to-br from-white to-neutral-50 rounded-2xl shadow-elevation-3 p-6 mb-4 border border-neutral-200">
        <h3 className="text-lg font-bold text-neutral-900 mb-6">
          Application Funnel
        </h3>

        <div className="space-y-3">
          {[
            {
              stage: "Applied",
              count: 42,
              percentage: 100,
              color: "bg-neutral-400",
            },
            {
              stage: "Screening",
              count: 28,
              percentage: 67,
              color: "bg-brand-400",
            },
            {
              stage: "Interview",
              count: 15,
              percentage: 36,
              color: "bg-brand-500",
            },
            {
              stage: "Offer",
              count: 6,
              percentage: 14,
              color: "bg-success-DEFAULT",
            },
          ].map((item, index) => (
            <motion.div
              key={item.stage}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
                ease: "easeOut",
              }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-neutral-700">
                  {item.stage}
                </span>
                <span className="text-xs text-neutral-500">
                  {item.count} applications
                </span>
              </div>
              <div className="relative h-10 bg-neutral-100 rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{
                    delay: index * 0.1 + 0.2,
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  className={`h-full ${item.color} flex items-center justify-end pr-3`}
                >
                  <span className="text-white text-sm font-bold">
                    {item.percentage}%
                  </span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
              className="bg-white rounded-xl shadow-soft p-4 border border-neutral-200 hover:shadow-soft-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="bg-brand-100 p-2 rounded-lg">
                  <Icon className="w-4 h-4 text-brand-600" />
                </div>
                <span
                  className={`text-xs font-bold ${
                    stat.trend === "up"
                      ? "text-success-dark"
                      : "text-error-dark"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-neutral-900 mb-0.5">
                {stat.value}
              </div>
              <div className="text-xs text-neutral-500">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface Reminder {
  id: number;
  company: string;
  role: string;
  message: string;
  remindAt: string;
  urgency: "today" | "tomorrow" | "upcoming";
}

const mockReminders: Reminder[] = [
  {
    id: 1,
    company: "Google",
    role: "Software Engineer",
    message: "Follow up on application",
    remindAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now (today)
    urgency: "today",
  },
  {
    id: 2,
    company: "Amazon",
    role: "Data Scientist",
    message: "Prepare for interview",
    remindAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    urgency: "upcoming",
  },
  {
    id: 3,
    company: "Meta",
    role: "Product Manager",
    message: "Check application status",
    remindAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    urgency: "tomorrow",
  },
];

const urgencyConfig = {
  today: {
    label: "Today",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-800",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-500",
  },
  tomorrow: {
    label: "Tomorrow",
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-800",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-600",
  },
  upcoming: {
    label: "Upcoming",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-800",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-500",
  },
};

export default function RemindersPreview() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-elevation-3 p-6 border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2.5 rounded-xl">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900">
              Reminders
            </h3>
          </div>
          <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            {mockReminders.length} Active
          </span>
        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          {mockReminders.map((reminder, index) => {
            const config = urgencyConfig[reminder.urgency];
            return (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={`border-l-4 ${config.borderColor} ${config.bgColor} rounded-r-lg p-3 hover:shadow-md transition-shadow`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badgeBg} ${config.badgeText}`}
                      >
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-600 font-medium">
                        {reminder.company} - {reminder.role}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {reminder.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(
                        new Date(reminder.remindAt),
                        "MMM d, yyyy h:mm a",
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

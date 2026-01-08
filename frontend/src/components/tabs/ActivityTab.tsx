import { format } from "date-fns";
import { Activity } from "src/api";

interface ActivityTabProps {
  activities: Activity[];
}

export default function ActivityTab({ activities }: ActivityTabProps) {
  return (
    <div className="space-y-3">
      {activities.map((activity: Activity) => (
        <div
          key={activity.id}
          className="flex gap-3 pb-3 border-b border-gray-200 last:border-0"
        >
          <div className="shrink-0 w-2 h-2 mt-2 bg-indigo-500 rounded-full" />
          <div className="flex-1">
            <p className="text-gray-700">{activity.activityType}</p>
            {activity.description && (
              <p className="text-sm text-gray-600 mt-1">
                {activity.description}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {format(new Date(activity.createdAt), "MMM d, yyyy h:mm a")}
            </p>
          </div>
        </div>
      ))}
      {activities.length === 0 && (
        <p className="text-gray-500 text-center py-8">No activity yet</p>
      )}
    </div>
  );
}

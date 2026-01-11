import { MapPin, Calendar, Building2 } from "lucide-react";
import { format } from "date-fns";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import { Application } from "src/api";

interface ApplicationCardProps {
  application: Application;
  onClick?: () => void;
  className?: string;
}

export default function ApplicationCard({
  application,
  onClick,
  className = "",
}: ApplicationCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {application.role}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-600">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{application.company}</span>
          </div>
        </div>
        <PriorityBadge priority={application.priority} />
      </div>

      <div className="space-y-2 mb-3">
        {application.location && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{application.location}</span>
          </div>
        )}
        {application.dateApplied && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>
              {format(new Date(application.dateApplied), "MMM d, yyyy")}
            </span>
          </div>
        )}
      </div>

      <StatusBadge status={application.status} />
    </div>
  );
}

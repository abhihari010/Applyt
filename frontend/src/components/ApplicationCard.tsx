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
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick();
        }
      }}
      className={`surface applet-lift cursor-pointer p-4 transition duration-200 ease-out hover:border-brand-200 hover:shadow-soft-lg active:scale-[0.99] ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-sm font-semibold text-neutral-950">
            {application.role}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-neutral-600">
            <Building2 className="h-4 w-4 shrink-0 text-brand-700" />
            <span className="truncate">{application.company}</span>
          </div>
        </div>
        <PriorityBadge priority={application.priority} />
      </div>

      <div className="space-y-2 mb-3">
        {application.location && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-600">
            <MapPin className="h-4 w-4 shrink-0 text-neutral-400" />
            <span className="truncate">{application.location}</span>
          </div>
        )}
        {application.dateApplied && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-600">
            <Calendar className="h-4 w-4 shrink-0 text-neutral-400" />
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

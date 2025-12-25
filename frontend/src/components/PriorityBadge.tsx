interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700 border-gray-300",
  MEDIUM: "bg-blue-100 text-blue-700 border-blue-300",
  HIGH: "bg-orange-100 text-orange-700 border-orange-300",
  URGENT: "bg-red-100 text-red-700 border-red-300",
};

export default function PriorityBadge({
  priority,
  className = "",
}: PriorityBadgeProps) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.LOW;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style} ${className}`}
    >
      {priority}
    </span>
  );
}

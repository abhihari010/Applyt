interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-neutral-100 text-neutral-700 border-neutral-300",
  MEDIUM: "bg-brand-50 text-brand-800 border-brand-200",
  HIGH: "bg-accent-50 text-accent-800 border-accent-200",
  URGENT: "bg-red-50 text-red-800 border-red-200",
};

export default function PriorityBadge({
  priority,
  className = "",
}: PriorityBadgeProps) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.LOW;

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 font-mono text-[11px] font-semibold ${style} ${className}`}
    >
      {priority}
    </span>
  );
}

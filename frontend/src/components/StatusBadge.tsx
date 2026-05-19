interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  SAVED: "bg-neutral-100 text-neutral-800 border-neutral-300",
  WISHLIST: "bg-neutral-100 text-neutral-800 border-neutral-300",
  APPLIED: "bg-brand-50 text-brand-800 border-brand-200",
  OA: "bg-accent-50 text-accent-800 border-accent-200",
  ONLINE_ASSESSMENT: "bg-accent-50 text-accent-800 border-accent-200",
  INTERVIEW: "bg-amber-50 text-amber-800 border-amber-200",
  INTERVIEWED: "bg-amber-50 text-amber-800 border-amber-200",
  OFFER: "bg-green-50 text-green-800 border-green-200",
  REJECTED: "bg-red-50 text-red-800 border-red-200",
  ACCEPTED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  DECLINED: "bg-orange-50 text-orange-800 border-orange-200",
  GHOSTED: "bg-slate-100 text-slate-800 border-slate-300",
};

const STATUS_LABELS: Record<string, string> = {
  SAVED: "Saved",
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  OA: "Online Assessment",
  ONLINE_ASSESSMENT: "Online Assessment",
  INTERVIEW: "Interview",
  INTERVIEWED: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  GHOSTED: "Ghosted",
};

export default function StatusBadge({
  status,
  className = "",
}: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.WISHLIST;
  const label = STATUS_LABELS[status] || status;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${style} ${className}`}
    >
      {label}
    </span>
  );
}

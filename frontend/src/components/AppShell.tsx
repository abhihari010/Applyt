import { CSSProperties, ReactNode } from "react";
import { LucideIcon, SearchX } from "lucide-react";
import Nav from "./Nav";

type AppShellProps = {
  children: ReactNode;
  maxWidth?: "4xl" | "6xl" | "7xl";
};

const maxWidthClass = {
  "4xl": "max-w-4xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
};

export function AppShell({ children, maxWidth = "7xl" }: AppShellProps) {
  return (
    <div className="app-page">
      <Nav />
      <main className={`app-container ${maxWidthClass[maxWidth]}`}>
        {children}
      </main>
    </div>
  );
}

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  metric?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  metric,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="kicker mb-2">{eyebrow}</p>}
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-3xl font-bold tracking-normal text-neutral-950 sm:text-4xl">
            {title}
          </h1>
          {metric && (
            <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 font-mono text-sm font-semibold text-brand-800">
              {metric}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gradient-to-r from-neutral-200 via-white to-neutral-200 bg-[length:220%_100%] ${className}`}
    />
  );
}

export function PageLoader({ label = "Loading workspace" }: { label?: string }) {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <SkeletonBlock className="mb-3 h-4 w-36" />
          <SkeletonBlock className="h-10 w-72 max-w-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <SkeletonBlock key={item} className="h-32" />
          ))}
        </div>
        <div className="surface p-6" aria-live="polite">
          <SkeletonBlock className="mb-4 h-6 w-44" />
          <div className="space-y-3">
            {[0, 1, 2, 3].map((item) => (
              <SkeletonBlock key={item} className="h-14" />
            ))}
          </div>
          <span className="sr-only">{label}</span>
        </div>
      </div>
    </AppShell>
  );
}

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="surface flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 rounded-full border border-brand-200 bg-brand-50 p-3 text-brand-700">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-neutral-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-neutral-600">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

type StatTileProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "brand" | "accent" | "success" | "warning" | "neutral";
  detail?: string;
  index?: number;
};

const statTone = {
  brand: "bg-brand-50 text-brand-800 border-brand-200",
  accent: "bg-accent-50 text-accent-800 border-accent-200",
  success: "bg-green-50 text-green-800 border-green-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  neutral: "bg-neutral-100 text-neutral-800 border-neutral-200",
};

export function StatTile({
  label,
  value,
  icon: Icon,
  tone = "brand",
  detail,
  index = 0,
}: StatTileProps) {
  return (
    <div
      className="surface applet-lift animate-stagger-in p-5 transition-transform"
      style={{ "--stagger": index } as CSSProperties}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-600">{label}</span>
        <span className={`rounded-lg border p-2 ${statTone[tone]}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <div className="metric-value">{value}</div>
      {detail && <p className="mt-2 text-xs text-neutral-500">{detail}</p>}
    </div>
  );
}

import { Link, Navigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  FileText,
  LockKeyhole,
  MailCheck,
  Shield,
  Sparkles,
  SquareKanban,
  Upload,
} from "lucide-react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import KanbanPreview from "../components/KanbanPreview";
import SmartReminders from "../components/RemindersPreview";
import AnalyticsPreview from "../components/AnalyticsPreview";

const fadeUp = {
  hidden: { opacity: 0, transform: "translateY(18px)" },
  visible: { opacity: 1, transform: "translateY(0px)" },
};

const proofPoints = [
  ["42", "active applications without spreadsheet drift"],
  ["3.7d", "average follow-up window kept visible"],
  ["18", "interviews grouped by stage, contact, and date"],
];

const searchTimeline = [
  { label: "Applied", detail: "Resume sent to Forgewell Labs", tone: "ink" },
  { label: "Follow-up", detail: "Email Maya before Thursday noon", tone: "gold" },
  { label: "Interview", detail: "Panel prep notes pinned to role", tone: "green" },
];

const featureCards = [
  {
    icon: FileText,
    title: "Notes that stay attached",
    description:
      "Contacts, recruiter context, interview prompts, salary ranges, and links live beside the role they belong to.",
  },
  {
    icon: Shield,
    title: "Private by default",
    description:
      "Your search data is treated like personal career material, not lead-gen inventory.",
  },
  {
    icon: Upload,
    title: "CSV import",
    description:
      "Bring an existing tracker in quickly, then keep the process moving from a cleaner board.",
  },
];

export default function Homepage() {
  const { user, isLoading } = useAuth();
  const reduceMotion = useReducedMotion();

  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="landing-shell flex min-h-[100dvh] items-center justify-center bg-[#f6f1e8]">
        <div className="landing-card px-6 py-4 text-sm font-semibold text-[#283029]">
          Loading Applyt
        </div>
      </div>
    );
  }

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.55, ease: [0.23, 1, 0.32, 1] };

  return (
    <div className="landing-shell min-h-[100dvh] bg-[#f6f1e8] text-[#22251f]">
      <Nav />

      <main className="overflow-hidden">
        <section className="landing-grid relative px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={transition}
              className="relative"
            >
              <div className="mb-8 inline-flex items-center gap-2 border border-[#2c332c]/15 bg-[#fffaf0]/75 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#475044] shadow-[0_12px_35px_-28px_rgba(34,37,31,0.9)] backdrop-blur">
                <Sparkles className="h-4 w-4 text-[#af7c21]" strokeWidth={1.8} />
                Built for the messy middle of job searching
              </div>

              <h1 className="max-w-4xl text-[clamp(3.15rem,8vw,7.6rem)] font-black leading-[0.86] text-[#20231e]">
                Turn every application into a clear next move.
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-[#596154] sm:text-xl">
                Applyt gives your job hunt a working surface: pipeline stages,
                follow-up reminders, interview notes, and analytics that show
                where momentum is actually building.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/signup"
                  className="landing-button group inline-flex min-h-12 items-center justify-center gap-3 bg-[#22251f] px-6 py-3 text-sm font-bold text-[#fffaf0] shadow-[0_18px_45px_-24px_rgba(34,37,31,0.75)]"
                >
                  Start tracking free
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/features"
                  className="landing-button inline-flex min-h-12 items-center justify-center gap-3 border border-[#22251f]/20 bg-[#fffaf0]/70 px-6 py-3 text-sm font-bold text-[#22251f] backdrop-blur"
                >
                  See the workflow
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, transform: "translateY(26px) rotate(-1deg)" }}
              animate={{ opacity: 1, transform: "translateY(0px) rotate(-1deg)" }}
              transition={transition}
              className="relative"
            >
              <div className="landing-board-shell relative mx-auto max-w-3xl rotate-[-1deg] border border-[#262820]/15 bg-[#fffaf0] p-3 shadow-[0_28px_80px_-48px_rgba(34,37,31,0.85)]">
                <div className="flex items-center justify-between border-b border-[#262820]/10 px-3 pb-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8a6421]">
                      Today&apos;s board
                    </p>
                    <p className="text-sm font-semibold text-[#596154]">
                      Three roles need attention before Friday
                    </p>
                  </div>
                  <div className="hidden items-center gap-2 rounded-full bg-[#dfe9d0] px-3 py-1 text-xs font-black text-[#315239] sm:flex">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#4b7f52]" />
                    live
                  </div>
                </div>
                <div className="pt-4">
                  <KanbanPreview />
                </div>
              </div>

              <div className="landing-float-card absolute -bottom-6 left-3 max-w-[18rem] border border-[#2b3028]/15 bg-[#233026] p-4 text-[#fffaf0] shadow-[0_22px_50px_-34px_rgba(35,48,38,0.9)] sm:left-10">
                <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#d7b56d]">
                  <MailCheck className="h-4 w-4" />
                  Reminder queued
                </div>
                <p className="text-sm leading-6 text-[#edf3e6]">
                  Follow up with Northstar Systems after the technical screen.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-[#22251f]/10 bg-[#22251f] px-4 py-5 text-[#fffaf0] sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
            {proofPoints.map(([value, label]) => (
              <div key={label} className="flex items-baseline gap-4">
                <span className="text-3xl font-black text-[#d7b56d]">{value}</span>
                <span className="text-sm font-medium leading-5 text-[#dfe9d0]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="landing-kicker">The Applyt difference</p>
              <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight text-[#22251f] sm:text-5xl">
                A search command center, not another blank spreadsheet.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[#596154]">
                Your job hunt changes every day. Applyt keeps the moving pieces
                connected so the next action is visible before it becomes a
                missed opportunity.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
              <div className="landing-card p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8a6421]">
                      Next actions
                    </p>
                    <h3 className="mt-1 text-xl font-black text-[#22251f]">
                      Search timeline
                    </h3>
                  </div>
                  <Bell className="h-5 w-5 text-[#8a6421]" />
                </div>
                <div className="space-y-3">
                  {searchTimeline.map((item, index) => (
                    <motion.div
                      key={item.detail}
                      initial={reduceMotion ? false : { opacity: 0, transform: "translateX(-12px)" }}
                      whileInView={{ opacity: 1, transform: "translateX(0px)" }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ ...transition, delay: index * 0.08 }}
                      className="flex gap-3 border-t border-[#22251f]/10 pt-3 first:border-t-0 first:pt-0"
                    >
                      <span
                        className={`mt-1 h-3 w-3 rounded-full ${
                          item.tone === "gold"
                            ? "bg-[#c08b2b]"
                            : item.tone === "green"
                              ? "bg-[#4b7f52]"
                              : "bg-[#22251f]"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-black text-[#22251f]">
                          {item.label}
                        </p>
                        <p className="text-sm leading-6 text-[#596154]">
                          {item.detail}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="landing-card landing-card-dark p-5">
                <SmartReminders />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#fffaf0] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 grid gap-6 lg:grid-cols-[0.7fr_1fr] lg:items-end">
              <div>
                <p className="landing-kicker">Core workflow</p>
                <h2 className="mt-4 text-4xl font-black leading-tight text-[#22251f] sm:text-5xl">
                  Move from "I applied somewhere" to "I know what happens next."
                </h2>
              </div>
              <p className="max-w-2xl text-lg leading-8 text-[#596154]">
                Applyt keeps applications, reminders, and results in one
                workflow, so your effort compounds instead of scattering across
                tabs, notes, and calendar events.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="landing-card p-4 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <SquareKanban className="h-5 w-5 text-[#4b7f52]" />
                  <h3 className="text-xl font-black text-[#22251f]">
                    Visual pipeline
                  </h3>
                </div>
                <KanbanPreview />
              </div>
              <div className="grid gap-6">
                <div className="landing-card p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-[#8a6421]" />
                    <h3 className="text-xl font-black text-[#22251f]">
                      Search analytics
                    </h3>
                  </div>
                  <AnalyticsPreview />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {featureCards.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    whileHover={reduceMotion ? undefined : { transform: "translateY(-4px)" }}
                    whileTap={{ scale: 0.98 }}
                    className="landing-card p-6"
                  >
                    <Icon className="mb-5 h-6 w-6 text-[#4b7f52]" strokeWidth={1.8} />
                    <h3 className="text-xl font-black text-[#22251f]">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#596154]">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="landing-kicker">Ready when you are</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-[#22251f] sm:text-6xl">
                Give your job search a system before the next role opens.
              </h2>
            </div>
            <div className="landing-card p-6">
              <p className="text-lg leading-8 text-[#596154]">
                Start with a clean board, add the roles you care about, and let
                reminders keep the follow-ups from slipping.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/signup"
                  className="landing-button inline-flex min-h-12 items-center justify-center gap-3 bg-[#22251f] px-6 py-3 text-sm font-bold text-[#fffaf0]"
                >
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/about"
                  className="landing-button inline-flex min-h-12 items-center justify-center gap-3 border border-[#22251f]/20 px-6 py-3 text-sm font-bold text-[#22251f]"
                >
                  Why Applyt
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#596154]">
                <span className="inline-flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4" /> Private
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Free to start
                </span>
                <span className="inline-flex items-center gap-2">
                  <Shield className="h-4 w-4" /> No recruiter marketplace
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

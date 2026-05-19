import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  FileText,
  Shield,
  SquareKanban,
  Upload,
} from "lucide-react";
import Nav from "../components/Nav";

const capabilities = [
  {
    icon: FileText,
    eyebrow: "Capture",
    title: "Application records with real context",
    description:
      "Store role links, contacts, salary notes, interview prompts, and research beside the exact application they support.",
    checks: ["Recruiter and contact notes", "Interview prep fields", "Source and deadline tracking"],
  },
  {
    icon: SquareKanban,
    eyebrow: "Move",
    title: "A pipeline you can actually read",
    description:
      "Drag applications from applied to interview to offer, then scan the whole search without opening a dozen rows.",
    checks: ["Stage-based board", "Fast status changes", "Filters for busy searches"],
  },
  {
    icon: Bell,
    eyebrow: "Remember",
    title: "Follow-ups that stay visible",
    description:
      "Create reminders for interviews, thank-you notes, recruiter check-ins, and deadlines before they become stale.",
    checks: ["Email notifications", "Due-date visibility", "Completion tracking"],
  },
  {
    icon: BarChart3,
    eyebrow: "Learn",
    title: "Analytics for better search decisions",
    description:
      "See where applications stall, which roles get replies, and how long each stage takes so your effort has feedback.",
    checks: ["Response rates", "Funnel conversion", "Time-in-stage patterns"],
  },
  {
    icon: Upload,
    eyebrow: "Import",
    title: "Bring your old tracker forward",
    description:
      "Start from a CSV instead of rebuilding your history by hand, then keep everything cleaner from there.",
    checks: ["CSV upload", "Column mapping", "Bulk application creation"],
  },
  {
    icon: Shield,
    eyebrow: "Protect",
    title: "Private search data",
    description:
      "Applyt is built for job seekers managing sensitive career information, not for selling candidate intent.",
    checks: ["Secure account access", "Private records", "No recruiter marketplace"],
  },
];

const workflow = [
  "Add a role the moment you apply",
  "Move it through the visual board",
  "Set the follow-up before you forget",
  "Review analytics and adjust your search",
];

export default function Features() {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: [0.23, 1, 0.32, 1] };

  return (
    <div className="landing-shell min-h-[100dvh] bg-[#f6f1e8] text-[#22251f]">
      <Nav />
      <main className="overflow-hidden">
        <section className="landing-grid px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, transform: "translateY(18px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              transition={transition}
            >
              <p className="landing-kicker">Features</p>
              <h1 className="mt-4 max-w-4xl text-[clamp(3rem,7vw,6.7rem)] font-black leading-[0.9]">
                The whole search, laid out where you can see it.
              </h1>
            </motion.div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, transform: "translateY(18px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              transition={{ ...transition, delay: 0.08 }}
              className="landing-card p-6"
            >
              <p className="text-lg leading-8 text-[#596154]">
                Applyt keeps the operational work of job searching in one
                place: capture opportunities, move them through stages, set
                follow-ups, and read the patterns that tell you what to change.
              </p>
              <Link
                to="/signup"
                className="landing-button mt-6 inline-flex min-h-12 items-center justify-center gap-3 bg-[#22251f] px-6 py-3 text-sm font-bold text-[#fffaf0]"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">
            {capabilities.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  initial={reduceMotion ? false : { opacity: 0, transform: "translateY(16px)" }}
                  whileInView={{ opacity: 1, transform: "translateY(0px)" }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ ...transition, delay: (index % 2) * 0.08 }}
                  whileHover={reduceMotion ? undefined : { transform: "translateY(-4px)" }}
                  whileTap={{ scale: 0.98 }}
                  className={`landing-card p-6 ${
                    index === 1 || index === 2 ? "md:translate-y-8" : ""
                  }`}
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8a6421]">
                        {feature.eyebrow}
                      </p>
                      <h2 className="mt-3 text-2xl font-black leading-tight text-[#22251f]">
                        {feature.title}
                      </h2>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-[#dfe9d0] text-[#315239]">
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </div>
                  </div>
                  <p className="text-base leading-7 text-[#596154]">
                    {feature.description}
                  </p>
                  <div className="mt-6 grid gap-3">
                    {feature.checks.map((check) => (
                      <div key={check} className="flex items-center gap-3 text-sm font-semibold text-[#374033]">
                        <CheckCircle2 className="h-4 w-4 text-[#4b7f52]" />
                        {check}
                      </div>
                    ))}
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-[#22251f]/10 bg-[#22251f] px-4 py-16 text-[#fffaf0] sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d7b56d]">
                Workflow
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                One loop from application to offer.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {workflow.map((step, index) => (
                <div
                  key={step}
                  className="border border-[#fffaf0]/15 bg-[#fffaf0]/5 p-5 backdrop-blur"
                >
                  <span className="text-sm font-black text-[#d7b56d]">
                    0{index + 1}
                  </span>
                  <p className="mt-3 text-lg font-bold leading-7">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="landing-kicker">No setup theater</p>
              <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-[#22251f]">
                Add the first role and the system starts working.
              </h2>
            </div>
            <Link
              to="/signup"
              className="landing-button inline-flex min-h-12 items-center justify-center gap-3 bg-[#22251f] px-6 py-3 text-sm font-bold text-[#fffaf0]"
            >
              Create your tracker
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

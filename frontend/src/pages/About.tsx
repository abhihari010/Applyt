import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Compass,
  LockKeyhole,
  TimerReset,
} from "lucide-react";
import Nav from "../components/Nav";

const principles = [
  {
    icon: ClipboardList,
    title: "The tracker should match the work",
    body: "Job searching is not a static list. It is a sequence of applications, conversations, deadlines, decisions, and reminders.",
  },
  {
    icon: TimerReset,
    title: "Follow-up timing matters",
    body: "Good opportunities can go cold because the next action was buried in a note. Applyt keeps time-sensitive work visible.",
  },
  {
    icon: LockKeyhole,
    title: "Career data is personal",
    body: "A job search can include salary expectations, companies you are leaving, and private notes. The product is designed around that sensitivity.",
  },
];

const reasons = [
  "A visual board for the stage every role is in",
  "Reminders for interviews, thank-you notes, and check-ins",
  "Notes that stay attached to companies and contacts",
  "Analytics that show response and conversion patterns",
  "A free starting point without credit card friction",
];

export default function About() {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.52, ease: [0.23, 1, 0.32, 1] };

  return (
    <div className="landing-shell min-h-[100dvh] bg-[#f6f1e8] text-[#22251f]">
      <Nav />
      <main className="overflow-hidden">
        <section className="landing-grid px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, transform: "translateY(18px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              transition={transition}
            >
              <p className="landing-kicker">About Applyt</p>
              <h1 className="mt-4 max-w-4xl text-[clamp(3.2rem,7vw,6.9rem)] font-black leading-[0.88]">
                Built for people managing the job search themselves.
              </h1>
            </motion.div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, transform: "translateY(18px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              transition={{ ...transition, delay: 0.08 }}
              className="landing-card p-6"
            >
              <Compass className="mb-5 h-8 w-8 text-[#8a6421]" strokeWidth={1.8} />
              <p className="text-lg leading-8 text-[#596154]">
                Applyt exists because a modern job search has too many moving
                parts for a plain spreadsheet: applications, recruiter replies,
                interview prep, follow-up timing, and the quiet question of
                whether your strategy is working.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <motion.article
                  key={principle.title}
                  initial={reduceMotion ? false : { opacity: 0, transform: "translateY(18px)" }}
                  whileInView={{ opacity: 1, transform: "translateY(0px)" }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ ...transition, delay: index * 0.08 }}
                  className="landing-card p-6"
                >
                  <Icon className="mb-6 h-7 w-7 text-[#4b7f52]" strokeWidth={1.8} />
                  <h2 className="text-2xl font-black leading-tight text-[#22251f]">
                    {principle.title}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-[#596154]">
                    {principle.body}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-[#22251f]/10 bg-[#fffaf0] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="landing-kicker">Why it exists</p>
              <h2 className="mt-4 text-4xl font-black leading-tight text-[#22251f] sm:text-5xl">
                Organization is not the goal. Momentum is.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#596154]">
                A tracker earns its place only when it helps you take the next
                useful action. Applyt is designed around that practical promise.
              </p>
            </div>
            <div className="landing-card p-6">
              <div className="grid gap-4">
                {reasons.map((reason) => (
                  <div
                    key={reason}
                    className="flex items-start gap-3 border-t border-[#22251f]/10 pt-4 first:border-t-0 first:pt-0"
                  >
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#4b7f52]" />
                    <p className="text-lg font-semibold leading-7 text-[#374033]">
                      {reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="landing-kicker">Start small</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-[#22251f] sm:text-5xl">
                Add one application. Set one reminder. Let the system prove
                itself.
              </h2>
            </div>
            <div className="landing-card p-6">
              <p className="text-lg leading-8 text-[#596154]">
                Applyt is free to start and focused on the parts of the search
                that are easiest to lose track of when things get busy.
              </p>
              <Link
                to="/signup"
                className="landing-button mt-6 inline-flex min-h-12 items-center justify-center gap-3 bg-[#22251f] px-6 py-3 text-sm font-bold text-[#fffaf0]"
              >
                Start your free account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

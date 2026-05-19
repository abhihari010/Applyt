import { Link, Navigate } from "react-router-dom";
import {
  FileText,
  SquareKanban,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
} from "lucide-react";
import Nav from "../components/Nav";
import { useAuth } from "../hooks/useAuth";
import KanbanPreview from "../components/KanbanPreview";
import SmartReminders from "../components/RemindersPreview";
import AnalyticsPreview from "../components/AnalyticsPreview";

export default function Homepage() {
  const { user, isLoading } = useAuth();

  // Redirect to dashboard if user is already logged in
  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-brand-50/30">
      <Nav />

      {/* Hero Section - Asymmetric Layout with Product Visual */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Copy */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-100 to-accent-100 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span className="text-sm font-semibold text-brand-700">
                  Smart Job Application Tracking
                </span>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 leading-tight">
                Land Your Dream Job{" "}
                <span className="gradient-text">Faster</span>
              </h1>

              <p className="text-xl text-neutral-600 max-w-xl leading-relaxed">
                Stop juggling spreadsheets. Applyt allows you to set reminders,
                provides a visual pipeline tracking system, and analytics that
                actually help you get hired.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-brand-600 text-white font-semibold rounded-xl shadow-elevation-2 hover:bg-brand-700 hover:shadow-elevation-3 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/features"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-600 font-semibold rounded-xl border-2 border-brand-200 hover:border-brand-300 hover:bg-brand-50 transition-all duration-200"
                >
                  Explore Features
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 border-2 border-white"
                    />
                  ))}
                </div>
                <div>
                  <div className="text-sm font-semibold text-neutral-900">
                    500+ job seekers
                  </div>
                  <div className="text-xs text-neutral-500">
                    organized their search
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Interactive Kanban Preview */}
            <div className="relative animate-fade-in lg:animate-slide-in-left">
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/20 to-accent-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-elevation-4 p-6 border border-neutral-200">
                <KanbanPreview />
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-success-DEFAULT text-white px-4 py-2 rounded-xl shadow-elevation-3 animate-float">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-bold">Live Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
      </section>

      {/* Signature Differentiator - Smart Reminders */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Visual First */}
            <div className="order-2 lg:order-1 animate-fade-in-up">
              <SmartReminders />
            </div>

            {/* Copy */}
            <div className="order-1 lg:order-2 space-y-6 text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  What Makes Applyt Different
                </span>
              </div>

              <h2 className="font-display text-4xl lg:text-5xl font-bold leading-tight">
                Never Miss a Follow-Up Again
              </h2>

              <p className="text-xl text-brand-100 leading-relaxed">
                Set reminders for any application and get email notifications
                when they're due. Unlike spreadsheets, you won't lose track of
                important follow-ups.
              </p>

              <div className="space-y-4 pt-4">
                {[
                  {
                    title: "Email Notifications",
                    description:
                      "Get automatically notified when your reminders are due. Never forget to follow up.",
                  },
                  {
                    title: "Flexible Scheduling",
                    description:
                      "Set reminders for any date and time. Perfect for tracking interviews, follow-ups, and deadlines.",
                  },
                  {
                    title: "Simple Management",
                    description:
                      "View, edit, and mark reminders as complete. All your follow-ups organized in one place.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-success-DEFAULT rounded-full flex items-center justify-center mt-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{item.title}</h4>
                      <p className="text-brand-100">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Experiences - Visual Storytelling */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-neutral-900">
              Built for Job Seekers, Not Recruiters
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Every feature designed to help{" "}
              <span className="font-semibold text-neutral-900">you</span> land
              offers faster
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            {/* Kanban Feature */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-brand-100 px-4 py-2 rounded-full">
                <SquareKanban className="w-4 h-4 text-brand-600" />
                <span className="text-sm font-semibold text-brand-700">
                  Visual Pipeline
                </span>
              </div>

              <h3 className="font-display text-3xl lg:text-4xl font-bold text-neutral-900">
                See Your Progress at a Glance
              </h3>

              <p className="text-lg text-neutral-600 leading-relaxed">
                Drag and drop applications through your pipeline. Instantly
                visualize where you are in your job search journey. No more
                hunting through spreadsheet tabs.
              </p>

              <ul className="space-y-3">
                {[
                  "Drag-and-drop to update status",
                  "Customizable pipeline stages",
                  "Quick-view application details",
                  "Filter by company, role, or date",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-brand-100 rounded flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-brand-600" />
                    </div>
                    <span className="text-neutral-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/10 to-accent-500/10 rounded-3xl blur-2xl" />
              <div className="relative">
                <KanbanPreview />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Analytics Feature */}
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-accent-500/10 to-brand-500/10 rounded-3xl blur-2xl" />
              <div className="relative">
                <AnalyticsPreview />
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 bg-accent-100 px-4 py-2 rounded-full">
                <BarChart3 className="w-4 h-4 text-accent-600" />
                <span className="text-sm font-semibold text-accent-700">
                  Smart Analytics
                </span>
              </div>

              <h3 className="font-display text-3xl lg:text-4xl font-bold text-neutral-900">
                Data That Helps You Improve
              </h3>

              <p className="text-lg text-neutral-600 leading-relaxed">
                Understand your job search patterns. See which strategies work.
                Track response rates, conversion metrics, and time-to-offer.
                Make informed decisions about where to focus your energy.
              </p>

              <ul className="space-y-3">
                {[
                  "Application funnel visualization",
                  "Response rate tracking by company/role",
                  "Time-to-offer analytics",
                  "Success pattern identification",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-accent-100 rounded flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-accent-600" />
                    </div>
                    <span className="text-neutral-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Everything You Need, Nothing You Don't
            </h2>
            <p className="text-lg text-neutral-600">
              Focused features that actually matter for job seekers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Detailed Notes",
                description:
                  "Track contacts, interview questions, and company research in one place.",
                iconBgClass: "bg-brand-100",
                iconTextClass: "text-brand-600",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description:
                  "Your data is encrypted. We never share your information with anyone.",
                iconBgClass: "bg-accent-100",
                iconTextClass: "text-accent-600",
              },
              {
                icon: Zap,
                title: "Bulk Import",
                description:
                  "Import existing applications from CSV. Get started in minutes, not hours.",
                iconBgClass: "bg-success-light",
                iconTextClass: "text-success-dark",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group bg-white rounded-2xl shadow-soft hover:shadow-soft-xl p-8 transition-all duration-300 hover:-translate-y-1 border border-neutral-200"
                >
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 ${feature.iconBgClass} rounded-xl mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`w-7 h-7 ${feature.iconTextClass}`} />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-600 to-accent-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5" />

        <div className="max-w-4xl mx-auto text-center relative space-y-8">
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white leading-tight">
            Ready to Take Control of Your Job Search?
          </h2>
          <p className="text-xl text-brand-100 max-w-2xl mx-auto">
            Join hundreds of job seekers who've organized their search with
            Applyt. Free forever, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-600 font-bold rounded-xl shadow-elevation-3 hover:shadow-elevation-4 hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/features"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/10 transition-all duration-200"
            >
              See All Features
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-white/90">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Bank-Level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">Always Free</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">No Credit Card</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="font-display text-2xl font-bold text-white mb-4">
                Applyt
              </h3>
              <p className="text-neutral-400 max-w-md">
                The smart way to track job applications, manage interviews, and
                land your dream job.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/privacy-policy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms-of-service"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Applyt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

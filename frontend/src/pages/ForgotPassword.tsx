import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, Send } from "lucide-react";
import { authApi } from "../api";
import Nav from "../components/Nav";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authApi.forgotPassword({ email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <main className="relative isolate min-h-[100dvh] overflow-hidden bg-[#f7f4ee] px-4 py-8 text-neutral-900 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_18%,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_82%_80%,rgba(16,185,129,0.12),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(245,245,244,0.72))]" />
        <div className="absolute inset-0 -z-10 bg-grid-neutral/5 opacity-70" />

        <div className="mx-auto grid min-h-[calc(100dvh-8rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.aside
            initial={{ opacity: 0, transform: "translateY(16px)" }}
            animate={{ opacity: 1, transform: "translateY(0)" }}
            transition={{ type: "spring", duration: 0.7, bounce: 0.12 }}
            className="hidden lg:block"
          >
            <p className="text-sm font-bold uppercase tracking-normal text-brand-700">
              Account recovery
            </p>
            <h1 className="mt-3 max-w-md font-display text-5xl font-black leading-none text-neutral-950">
              Reset the lock without losing your trail.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-neutral-700">
              We will send a time-limited link so you can get back to your
              applications, notes, and next steps.
            </p>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, transform: "translateY(18px) scale(0.98)" }}
            animate={{ opacity: 1, transform: "translateY(0) scale(1)" }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.08 }}
            className="mx-auto w-80 rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-[0_24px_80px_-36px_rgba(28,25,23,0.38)] backdrop-blur-xl min-[380px]:w-[22rem] sm:w-full sm:max-w-[30rem] sm:p-8"
          >
            {submitted ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success-light text-success-dark shadow-soft">
                  <CheckCircle2 className="h-7 w-7" strokeWidth={1.8} />
                </div>
                <h2 className="mt-5 font-display text-3xl font-black text-neutral-950">
                  Check your email
                </h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  We sent a password reset link to{" "}
                  <strong className="font-bold text-neutral-900">{email}</strong>.
                </p>
                <p className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                  The link expires in 24 hours. If it is not in your inbox,
                  check spam or request another link.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="mt-8 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-3 font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0 active:scale-[0.98]"
                >
                  Back to login
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="mb-7">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-elevation-2">
                    <Send className="h-6 w-6" strokeWidth={1.8} />
                  </div>
                  <h1 className="font-display text-3xl font-black leading-tight text-neutral-950">
                    Forgot password?
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Enter the email on your account and we will send a reset
                    link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-error/30 bg-error-light/80 p-4 text-sm font-semibold text-error-dark shadow-soft"
                    >
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="reset-email" className="block text-sm font-bold text-neutral-800">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" strokeWidth={1.8} />
                      <input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        aria-describedby="reset-email-help"
                        autoComplete="email"
                        className="min-h-12 w-full rounded-xl border border-neutral-200 bg-white px-12 py-3 text-base text-neutral-950 shadow-soft outline-none transition duration-200 placeholder:text-neutral-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                        placeholder="you@company.com"
                      />
                    </div>
                    <p id="reset-email-help" className="text-sm text-neutral-500">
                      Use the address tied to your Applyt account.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-3 font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {loading ? "Sending link..." : "Send reset link"}
                    {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                  </button>
                </form>

                <button
                  onClick={() => navigate("/login")}
                  className="mt-6 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700 transition duration-200 hover:bg-neutral-50 active:scale-[0.98]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </button>
              </>
            )}
          </motion.section>
        </div>
      </main>
    </>
  );
}

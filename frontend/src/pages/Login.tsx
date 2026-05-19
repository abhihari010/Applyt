import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  Github,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Nav from "../components/Nav";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 1) {
      errors.password = "Password must not be empty";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setError("");
    setErrorEmail("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      const status = err.response?.status;
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid credentials. Please try again.";
      const errorEmailFromResponse = err.response?.data?.email;

      if (status === 429) {
        setError("Too many login attempts. Please try again in a few minutes.");
      } else {
        setError(errorMessage);
      }

      if (errorEmailFromResponse) {
        setErrorEmail(errorEmailFromResponse);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const API_URL = import.meta.env.VITE_API_URL;

  const handleOAuth2Login = (provider: "google" | "github") => {
    window.location.href = `${API_URL}/oauth2/authorization/${provider}`;
  };

  return (
    <>
      <Nav />
      <main className="relative isolate min-h-[100dvh] overflow-hidden bg-[#f7f4ee] px-4 py-8 text-neutral-900 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.12),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.86),rgba(245,245,244,0.72))]" />
        <div className="absolute inset-0 -z-10 bg-grid-neutral/5 opacity-70" />

        <div className="mx-auto grid min-h-[calc(100dvh-8rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.aside
            initial={{ opacity: 0, transform: "translateY(16px)" }}
            animate={{ opacity: 1, transform: "translateY(0)" }}
            transition={{ type: "spring", duration: 0.7, bounce: 0.12 }}
            className="hidden lg:block"
          >
            <div className="max-w-md">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-900/10 bg-white/70 px-3 py-2 text-sm font-semibold text-neutral-700 shadow-soft backdrop-blur">
                <ShieldCheck
                  className="h-4 w-4 text-brand-700"
                  strokeWidth={1.8}
                />
                Secure application workspace
              </div>
              <h1 className="font-display text-5xl font-black leading-none text-neutral-950">
                Pick up exactly where your search left off.
              </h1>
              <p className="mt-5 text-base leading-7 text-neutral-700">
                Sign in to review deadlines, notes, interviews, and every open
                thread in one focused place.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  ["Today", "Follow up with Beacon Health"],
                  ["Thu", "Prep notes for platform interview"],
                  ["Next", "Archive closed loops"],
                ].map(([time, task], index) => (
                  <motion.div
                    key={task}
                    initial={{ opacity: 0, transform: "translateX(-12px)" }}
                    animate={{ opacity: 1, transform: "translateX(0)" }}
                    transition={{ delay: 0.12 + index * 0.07, duration: 0.28 }}
                    className="flex items-center gap-4 rounded-xl border border-white/70 bg-white/65 p-4 shadow-soft backdrop-blur"
                  >
                    <span className="w-14 rounded-lg bg-neutral-950 px-3 py-2 text-center text-xs font-bold uppercase tracking-normal text-white">
                      {time}
                    </span>
                    <span className="text-sm font-semibold text-neutral-800">
                      {task}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, transform: "translateY(18px) scale(0.98)" }}
            animate={{ opacity: 1, transform: "translateY(0) scale(1)" }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.08 }}
            className="mx-auto w-80 rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-[0_24px_80px_-36px_rgba(28,25,23,0.38)] backdrop-blur-xl min-[380px]:w-[22rem] sm:w-full sm:max-w-[30rem] sm:p-8"
          >
            <div className="mb-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-elevation-2">
                <BriefcaseBusiness className="h-6 w-6" strokeWidth={1.8} />
              </div>
              <h2 className="font-display text-3xl font-black leading-tight text-neutral-950">
                Welcome back
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Use the email and password connected to your Applyt account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div
                  role="alert"
                  className={`rounded-xl border p-4 text-sm shadow-soft ${
                    error.includes("not verified")
                      ? "border-warning/40 bg-warning-light/80 text-yellow-900"
                      : "border-error/30 bg-error-light/80 text-error-dark"
                  }`}
                >
                  <p className="mb-2 font-semibold">{error}</p>
                  {errorEmail && (
                    <Link
                      to={`/verify-email?email=${encodeURIComponent(errorEmail)}`}
                      className="mt-2 inline-flex items-center gap-1 text-sm font-bold underline-offset-4 hover:underline"
                    >
                      Go to verification page
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="block text-sm font-bold text-neutral-800"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
                    strokeWidth={1.8}
                  />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={Boolean(validationErrors.email)}
                    aria-describedby="login-email-help"
                    className={`min-h-12 w-full rounded-xl border bg-white px-12 py-3 text-base text-neutral-950 shadow-soft outline-none transition duration-200 placeholder:text-neutral-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 ${
                      validationErrors.email
                        ? "border-error"
                        : "border-neutral-200"
                    }`}
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                  />
                </div>
                {validationErrors.email ? (
                  <p
                    id="login-email-help"
                    className="text-sm font-medium text-error-dark"
                  >
                    {validationErrors.email}
                  </p>
                ) : (
                  <p id="login-email-help" className="text-sm text-neutral-500">
                    Use the address you registered with.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-bold text-neutral-800"
                >
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
                    strokeWidth={1.8}
                  />
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={Boolean(validationErrors.password)}
                    aria-describedby="login-password-help"
                    className={`min-h-12 w-full rounded-xl border bg-white px-12 py-3 text-base text-neutral-950 shadow-soft outline-none transition duration-200 placeholder:text-neutral-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 ${
                      validationErrors.password
                        ? "border-error"
                        : "border-neutral-200"
                    }`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                {validationErrors.password ? (
                  <p
                    id="login-password-help"
                    className="text-sm font-medium text-error-dark"
                  >
                    {validationErrors.password}
                  </p>
                ) : (
                  <p id="login-password-help" className="text-sm text-neutral-500">
                    Passwords stay encrypted on the way in.
                  </p>
                )}
              </div>

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-bold text-brand-700 underline-offset-4 hover:text-brand-800 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-3 font-bold text-white shadow-[0_14px_30px_-18px_rgba(12,10,9,0.9)] transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
                {!isSubmitting && (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white/90 px-3 font-medium text-neutral-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleOAuth2Login("google")}
                type="button"
                className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 font-bold text-neutral-800 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50 active:translate-y-0 active:scale-[0.98]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>

              <button
                onClick={() => handleOAuth2Login("github")}
                type="button"
                className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 font-bold text-neutral-800 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50 active:translate-y-0 active:scale-[0.98]"
              >
                <Github className="h-5 w-5" strokeWidth={1.8} />
                Sign in with GitHub
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-neutral-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-bold text-brand-700 underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-neutral-500">
              <Sparkles
                className="h-3.5 w-3.5 text-brand-600"
                strokeWidth={1.8}
              />
              Protected by your existing Applyt credentials
            </div>
          </motion.section>
        </div>
      </main>
    </>
  );
}

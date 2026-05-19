import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Github,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Nav from "../components/Nav";

const RESERVED_NAMES = [
  "admin",
  "administrator",
  "root",
  "superuser",
  "sysadmin",
  "system",
  "support",
  "moderator",
  "mod",
  "owner",
  "webmaster",
  "postmaster",
  "hostmaster",
  "abuse",
  "security",
  "noreply",
  "no-reply",
  "service",
  "api",
  "bot",
  "help",
  "info",
];

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const calculatePasswordStrength = (
    pwd: string
  ): "weak" | "medium" | "strong" => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 3) return "weak";
    if (score <= 5) return "medium";
    return "strong";
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!name) {
      errors.name = "Full name is required";
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (name.trim().length > 50) {
      errors.name = "Name must not exceed 50 characters";
    } else if (!/^[a-zA-Z0-9\s._-]+$/.test(name)) {
      errors.name =
        "Name can only contain letters, numbers, spaces, dots, underscores, and hyphens";
    } else if (RESERVED_NAMES.includes(name.toLowerCase().trim())) {
      errors.name = "This name is reserved and cannot be used";
    }

    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (password.length > 128) {
      errors.password = "Password must not exceed 128 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register(name, email, password);
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      const status = err.response?.status;
      const errorMessage = err.response?.data?.error;

      if (status === 429) {
        setError("Too many registration attempts. Please try again later.");
      } else if (errorMessage) {
        setError(errorMessage);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const API_URL = import.meta.env.VITE_API_URL;

  const handleOAuth2Login = (provider: "google" | "github") => {
    window.location.href = `${API_URL}/oauth2/authorization/${provider}`;
  };

  const strengthTone = {
    weak: "bg-error text-error-dark",
    medium: "bg-warning text-yellow-900",
    strong: "bg-success text-green-900",
  };

  return (
    <>
      <Nav />
      <main className="relative isolate min-h-[100dvh] overflow-hidden bg-[#f7f4ee] px-4 py-8 text-neutral-900 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_84%_10%,rgba(59,130,246,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(245,245,244,0.72))]" />
        <div className="absolute inset-0 -z-10 bg-grid-neutral/5 opacity-70" />

        <div className="mx-auto grid min-h-[calc(100dvh-8rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.section
            initial={{ opacity: 0, transform: "translateY(18px) scale(0.98)" }}
            animate={{ opacity: 1, transform: "translateY(0) scale(1)" }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.08 }}
            className="mx-auto w-80 rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-[0_24px_80px_-36px_rgba(28,25,23,0.38)] backdrop-blur-xl min-[380px]:w-[22rem] sm:w-full sm:max-w-[31rem] sm:p-8"
          >
            <div className="mb-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-elevation-2">
                <Sparkles className="h-6 w-6" strokeWidth={1.8} />
              </div>
              <h1 className="font-display text-2xl font-black leading-tight text-neutral-950 sm:text-3xl">
                Create your workspace
              </h1>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Set up the account you will use to track roles, contacts, and
                interview movement.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-error/30 bg-error-light/80 p-4 text-sm font-semibold text-error-dark shadow-soft"
                >
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="signup-name" className="block text-sm font-bold text-neutral-800">
                  Full name
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" strokeWidth={1.8} />
                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={Boolean(validationErrors.name)}
                    aria-describedby="signup-name-help"
                    className={`min-h-12 w-full rounded-xl border bg-white px-12 py-3 text-base text-neutral-950 shadow-soft outline-none transition duration-200 placeholder:text-neutral-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 ${
                      validationErrors.name ? "border-error" : "border-neutral-200"
                    }`}
                    placeholder="Maya Patel"
                    autoComplete="name"
                    required
                  />
                </div>
                <p id="signup-name-help" className={`text-sm ${validationErrors.name ? "font-medium text-error-dark" : "text-neutral-500"}`}>
                  {validationErrors.name || "This is shown in your account settings."}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-email" className="block text-sm font-bold text-neutral-800">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" strokeWidth={1.8} />
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={Boolean(validationErrors.email)}
                    aria-describedby="signup-email-help"
                    className={`min-h-12 w-full rounded-xl border bg-white px-12 py-3 text-base text-neutral-950 shadow-soft outline-none transition duration-200 placeholder:text-neutral-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 ${
                      validationErrors.email ? "border-error" : "border-neutral-200"
                    }`}
                    placeholder="maya@company.com"
                    autoComplete="email"
                    required
                  />
                </div>
                <p id="signup-email-help" className={`text-sm ${validationErrors.email ? "font-medium text-error-dark" : "text-neutral-500"}`}>
                  {validationErrors.email || "We will send verification here."}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-password" className="block text-sm font-bold text-neutral-800">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" strokeWidth={1.8} />
                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordStrength(
                        e.target.value.length > 0
                          ? calculatePasswordStrength(e.target.value)
                          : null
                      );
                    }}
                    aria-invalid={Boolean(validationErrors.password)}
                    aria-describedby="signup-password-help"
                    className={`min-h-12 w-full rounded-xl border bg-white px-12 py-3 text-base text-neutral-950 shadow-soft outline-none transition duration-200 placeholder:text-neutral-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 ${
                      validationErrors.password ? "border-error" : "border-neutral-200"
                    }`}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                {passwordStrength && !validationErrors.password && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-1">
                      {[0, 1, 2].map((bar) => {
                        const filled =
                          passwordStrength === "strong" ||
                          (passwordStrength === "medium" && bar < 2) ||
                          (passwordStrength === "weak" && bar === 0);
                        return (
                          <span
                            key={bar}
                            className={`h-1.5 rounded-full ${
                              filled
                                ? strengthTone[passwordStrength].split(" ")[0]
                                : "bg-neutral-200"
                            }`}
                          />
                        );
                      })}
                    </div>
                    <p className={`text-xs font-bold ${strengthTone[passwordStrength].split(" ")[1]}`}>
                      Password strength: {passwordStrength}
                    </p>
                  </div>
                )}
                <p id="signup-password-help" className={`text-sm ${validationErrors.password ? "font-medium text-error-dark" : "text-neutral-500"}`}>
                  {validationErrors.password ||
                    "Use 8+ characters with uppercase, lowercase, and a number."}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-3 font-bold text-white shadow-[0_14px_30px_-18px_rgba(12,10,9,0.9)] transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
                {!isSubmitting && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
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
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </button>
              <button
                onClick={() => handleOAuth2Login("github")}
                type="button"
                className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 font-bold text-neutral-800 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50 active:translate-y-0 active:scale-[0.98]"
              >
                <Github className="h-5 w-5" strokeWidth={1.8} />
                Sign up with GitHub
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-neutral-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-brand-700 underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, transform: "translateY(16px)" }}
            animate={{ opacity: 1, transform: "translateY(0)" }}
            transition={{ type: "spring", duration: 0.7, bounce: 0.12 }}
            className="hidden lg:block"
          >
            <div className="ml-auto max-w-md">
              <p className="text-sm font-bold uppercase tracking-normal text-brand-700">
                New account checklist
              </p>
              <h2 className="mt-3 font-display text-5xl font-black leading-none text-neutral-950">
                A calmer way to run a busy search.
              </h2>
              <div className="mt-8 space-y-4">
                {[
                  "Save roles before the tabs disappear",
                  "Track follow-ups without spreadsheet drift",
                  "Keep notes attached to each opportunity",
                ].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, transform: "translateX(12px)" }}
                    animate={{ opacity: 1, transform: "translateX(0)" }}
                    transition={{ delay: 0.12 + index * 0.08, duration: 0.28 }}
                    className="flex items-center gap-3 rounded-xl border border-white/70 bg-white/65 p-4 shadow-soft backdrop-blur"
                  >
                    <CheckCircle2 className="h-5 w-5 text-success-dark" strokeWidth={1.8} />
                    <span className="text-sm font-semibold text-neutral-800">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </main>
    </>
  );
}

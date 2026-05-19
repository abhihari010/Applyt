import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Home,
  Mail,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../api";
import Nav from "../components/Nav";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendEmail, setResendEmail] = useState(
    searchParams.get("email") || ""
  );

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setSuccess(false);
      return;
    }

    const verify = async () => {
      setLoading(true);
      try {
        await verifyEmail(token);
        setSuccess(true);
        setError("");
        setTimeout(() => navigate("/login"), 3000);
      } catch (err: any) {
        setError(
          err.response?.data?.error || "Verification failed. Please try again."
        );
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams, navigate, verifyEmail]);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resendEmail) {
      setError("Please enter your email address");
      return;
    }

    setResendLoading(true);
    setError("");

    try {
      await authApi.resendVerificationEmail(resendEmail);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to resend verification email"
      );
    } finally {
      setResendLoading(false);
    }
  };

  const ResendForm = ({ compact = false }: { compact?: boolean }) => (
    <form onSubmit={handleResendVerification} className="space-y-3">
      <div className="space-y-2 text-left">
        <label htmlFor="verify-email" className="block text-sm font-bold text-neutral-800">
          Email address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" strokeWidth={1.8} />
          <input
            id="verify-email"
            type="email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            className="min-h-12 w-full rounded-xl border border-neutral-200 bg-white px-12 py-3 text-base text-neutral-950 shadow-soft outline-none transition duration-200 placeholder:text-neutral-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={resendLoading}
        className={`group flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-3 font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${
          compact ? "text-sm" : ""
        }`}
      >
        {resendLoading ? "Sending..." : "Resend verification email"}
        {!resendLoading && <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
      </button>
    </form>
  );

  return (
    <>
      <Nav />
      <main className="relative isolate min-h-[100dvh] overflow-hidden bg-[#f7f4ee] px-4 py-8 text-neutral-900 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(59,130,246,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(245,245,244,0.72))]" />
        <div className="absolute inset-0 -z-10 bg-grid-neutral/5 opacity-70" />

        <div className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-5xl items-center justify-center">
          <motion.section
            initial={{ opacity: 0, transform: "translateY(18px) scale(0.98)" }}
            animate={{ opacity: 1, transform: "translateY(0) scale(1)" }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.08 }}
            className="w-80 rounded-[2rem] border border-white/80 bg-white/85 p-5 text-center shadow-[0_24px_80px_-36px_rgba(28,25,23,0.38)] backdrop-blur-xl min-[380px]:w-[22rem] sm:w-full sm:max-w-[32rem] sm:p-8"
          >
            {loading && (
              <>
                <div className="mx-auto h-12 w-40 animate-pulse rounded-full bg-neutral-200" />
                <div className="mx-auto mt-5 h-5 w-56 animate-pulse rounded-full bg-neutral-200" />
                <h1 className="mt-6 font-display text-3xl font-black text-neutral-950">
                  Verifying email
                </h1>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Please wait while we confirm your email address.
                </p>
              </>
            )}

            {success && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success-light text-success-dark shadow-soft">
                  <CheckCircle2 className="h-7 w-7" strokeWidth={1.8} />
                </div>
                <h1 className="mt-5 font-display text-3xl font-black text-neutral-950">
                  Email verified
                </h1>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  Your account is ready. We will send you to login in a moment.
                </p>
                <Link
                  to="/login"
                  className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-3 font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0 active:scale-[0.98]"
                >
                  Go to login
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}

            {!loading && !success && !searchParams.get("token") && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-elevation-2">
                  <ShieldCheck className="h-7 w-7" strokeWidth={1.8} />
                </div>
                <h1 className="mt-5 font-display text-3xl font-black text-neutral-950">
                  Verify your email
                </h1>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  We sent a verification link to your inbox. Open it to finish
                  setting up your account.
                </p>

                {resendSuccess && (
                  <div
                    role="status"
                    className="mt-6 rounded-xl border border-success/30 bg-success-light/80 p-4 text-left text-sm text-green-900 shadow-soft"
                  >
                    <p className="font-bold">Email sent</p>
                    <p className="mt-1">Check your inbox for the new link.</p>
                  </div>
                )}

                <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left">
                  <p className="mb-2 text-sm font-bold text-neutral-800">
                    Did not get an email?
                  </p>
                  <p className="mb-4 text-sm leading-6 text-neutral-600">
                    Check spam, or enter your email below and we will send a
                    fresh verification link.
                  </p>
                  <ResendForm />
                </div>
              </>
            )}

            {!loading && !success && error && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error-light text-error-dark shadow-soft">
                  <XCircle className="h-7 w-7" strokeWidth={1.8} />
                </div>
                <h1 className="mt-5 font-display text-3xl font-black text-neutral-950">
                  Verification failed
                </h1>
                <p className="mt-3 text-sm font-semibold leading-6 text-error-dark">
                  {error}
                </p>

                <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left">
                  <p className="mb-4 text-sm font-bold text-neutral-800">
                    Send a fresh verification link
                  </p>
                  <ResendForm compact />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => (window.location.href = "/")}
                    className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700 transition duration-200 hover:bg-neutral-50 active:scale-[0.98]"
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </button>
                  <Link
                    to="/signup"
                    className="flex min-h-11 items-center justify-center rounded-xl border border-error/20 bg-error-light/70 px-4 py-3 text-sm font-bold text-error-dark transition duration-200 hover:bg-error-light active:scale-[0.98]"
                  >
                    Create new account
                  </Link>
                </div>
              </>
            )}
          </motion.section>
        </div>
      </main>
    </>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  XCircle,
} from "lucide-react";
import { authApi } from "../api";
import Nav from "../components/Nav";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const hash = location.hash;
    const hashToken =
      hash && hash.startsWith("#token=")
        ? decodeURIComponent(hash.slice("#token=".length))
        : null;
    const queryToken = searchParams.get("token");
    setToken(hashToken || queryToken);
  }, [location.hash, searchParams]);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
      setValidating(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await authApi.validateForgotPassword(token);
        setValidToken(response.data.valid);
        if (!response.data.valid) {
          setError(response.data.message || "Invalid or expired token");
        }
      } catch {
        setError("Invalid or expired reset token");
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword({ token, newPassword });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const shell = (children: React.ReactNode) => (
    <>
      <Nav />
      <main className="relative isolate min-h-[100dvh] overflow-hidden bg-[#f7f4ee] px-4 py-8 text-neutral-900 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_82%_80%,rgba(16,185,129,0.12),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(245,245,244,0.72))]" />
        <div className="absolute inset-0 -z-10 bg-grid-neutral/5 opacity-70" />
        <div className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-5xl items-center justify-center">
          {children}
        </div>
      </main>
    </>
  );

  if (validating) {
    return shell(
      <motion.div
        initial={{ opacity: 0, transform: "translateY(18px) scale(0.98)" }}
        animate={{ opacity: 1, transform: "translateY(0) scale(1)" }}
        className="w-80 rounded-[2rem] border border-white/80 bg-white/85 p-8 text-center shadow-[0_24px_80px_-36px_rgba(28,25,23,0.38)] backdrop-blur-xl min-[380px]:w-[22rem] sm:w-full sm:max-w-[30rem]"
      >
        <div className="mx-auto h-12 w-40 animate-pulse rounded-full bg-neutral-200" />
        <div className="mx-auto mt-5 h-5 w-56 animate-pulse rounded-full bg-neutral-200" />
        <p className="mt-6 text-sm font-semibold text-neutral-600">
          Validating reset link...
        </p>
      </motion.div>
    );
  }

  if (!validToken) {
    return shell(
      <motion.div
        initial={{ opacity: 0, transform: "translateY(18px) scale(0.98)" }}
        animate={{ opacity: 1, transform: "translateY(0) scale(1)" }}
        className="w-80 rounded-[2rem] border border-white/80 bg-white/85 p-8 text-center shadow-[0_24px_80px_-36px_rgba(28,25,23,0.38)] backdrop-blur-xl min-[380px]:w-[22rem] sm:w-full sm:max-w-[30rem]"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error-light text-error-dark shadow-soft">
          <XCircle className="h-7 w-7" strokeWidth={1.8} />
        </div>
        <h1 className="mt-5 font-display text-3xl font-black text-neutral-950">
          Invalid link
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">{error}</p>
        <button
          onClick={() => navigate("/forgot-password")}
          className="mt-8 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-3 font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0 active:scale-[0.98]"
        >
          Request new link
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  if (success) {
    return shell(
      <motion.div
        initial={{ opacity: 0, transform: "translateY(18px) scale(0.98)" }}
        animate={{ opacity: 1, transform: "translateY(0) scale(1)" }}
        className="w-80 rounded-[2rem] border border-white/80 bg-white/85 p-8 text-center shadow-[0_24px_80px_-36px_rgba(28,25,23,0.38)] backdrop-blur-xl min-[380px]:w-[22rem] sm:w-full sm:max-w-[30rem]"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success-light text-success-dark shadow-soft">
          <CheckCircle2 className="h-7 w-7" strokeWidth={1.8} />
        </div>
        <h1 className="mt-5 font-display text-3xl font-black text-neutral-950">
          Password reset
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Your password has been updated. You can now log in with the new one.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="mt-8 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-3 font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0 active:scale-[0.98]"
        >
          Go to login
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  return shell(
    <motion.section
      initial={{ opacity: 0, transform: "translateY(18px) scale(0.98)" }}
      animate={{ opacity: 1, transform: "translateY(0) scale(1)" }}
      transition={{ type: "spring", duration: 0.6, bounce: 0.08 }}
      className="w-80 rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-[0_24px_80px_-36px_rgba(28,25,23,0.38)] backdrop-blur-xl min-[380px]:w-[22rem] sm:w-full sm:max-w-[30rem] sm:p-8"
    >
      <div className="mb-7">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-elevation-2">
          <KeyRound className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <h1 className="font-display text-3xl font-black leading-tight text-neutral-950">
          Set a new password
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Use at least 8 characters. Matching fields unlock the reset action.
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

        {[
          {
            id: "password",
            label: "New password",
            value: newPassword,
            onChange: setNewPassword,
            autoComplete: "new-password",
          },
          {
            id: "confirm",
            label: "Confirm password",
            value: confirmPassword,
            onChange: setConfirmPassword,
            autoComplete: "new-password",
          },
        ].map((field) => (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.id} className="block text-sm font-bold text-neutral-800">
              {field.label}
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" strokeWidth={1.8} />
              <input
                id={field.id}
                type="password"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                required
                minLength={8}
                autoComplete={field.autoComplete}
                className="min-h-12 w-full rounded-xl border border-neutral-200 bg-white px-12 py-3 text-base text-neutral-950 shadow-soft outline-none transition duration-200 placeholder:text-neutral-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                placeholder={field.label}
              />
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
          <p className={newPassword.length >= 8 ? "font-semibold text-success-dark" : "text-neutral-600"}>
            At least 8 characters
          </p>
          <p className={newPassword && confirmPassword && newPassword === confirmPassword ? "mt-1 font-semibold text-success-dark" : "mt-1 text-neutral-600"}>
            Passwords match
          </p>
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            newPassword.length < 8 ||
            confirmPassword.length < 8 ||
            newPassword !== confirmPassword
          }
          className="group flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-3 font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? "Resetting..." : "Reset password"}
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
    </motion.section>
  );
}

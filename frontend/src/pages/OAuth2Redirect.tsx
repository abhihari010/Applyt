import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function OAuth2Redirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { oauthLogin } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      oauthLogin(token)
        .then(() => {
          navigate("/dashboard");
        })
        .catch(() => {
          navigate("/login?error=oauth_failed");
        });
    } else {
      navigate("/login?error=oauth_failed");
    }
  }, [searchParams, navigate, oauthLogin]);

  return (
    <main className="relative isolate min-h-[100dvh] overflow-hidden bg-[#f7f4ee] px-4 py-8 text-neutral-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_22%_18%,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_82%_80%,rgba(16,185,129,0.12),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.9),rgba(245,245,244,0.72))]" />
      <div className="absolute inset-0 -z-10 bg-grid-neutral/5 opacity-70" />

      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-5xl items-center justify-center">
        <motion.section
          initial={{ opacity: 0, transform: "translateY(18px) scale(0.98)" }}
          animate={{ opacity: 1, transform: "translateY(0) scale(1)" }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.08 }}
          className="w-80 rounded-[2rem] border border-white/80 bg-white/85 p-8 text-center shadow-[0_24px_80px_-36px_rgba(28,25,23,0.38)] backdrop-blur-xl min-[380px]:w-[22rem] sm:w-full sm:max-w-[28rem]"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-elevation-2">
            <ShieldCheck className="h-7 w-7" strokeWidth={1.8} />
          </div>
          <h1 className="mt-5 font-display text-3xl font-black text-neutral-950">
            Completing sign in
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            We are confirming your provider token and preparing your workspace.
          </p>
          <div className="mt-7 grid grid-cols-3 gap-2" aria-hidden="true">
            {[0, 1, 2].map((item) => (
              <motion.span
                key={item}
                className="h-1.5 rounded-full bg-brand-600"
                animate={{ opacity: [0.28, 1, 0.28] }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  delay: item * 0.16,
                }}
              />
            ))}
          </div>
        </motion.section>
      </div>
    </main>
  );
}

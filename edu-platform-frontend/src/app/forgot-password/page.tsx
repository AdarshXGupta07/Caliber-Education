"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AuthShell } from "@/components/AuthShell";
import { Turnstile } from "@/components/Turnstile";
import { ArrowRight, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address."); return; }
    if (!turnstileToken) {
      setError("Security verification in progress. Please wait.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiURL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // The backend always returns 200 for a valid request, even if the
        // email doesn't exist (prevents account enumeration) — a non-200
        // here means the request itself failed (e.g. bot check), not that
        // the email is unknown, so this should surface as a real error.
        throw new Error(err.detail || "Request failed. Please try again.");
      }
      setSent(true);
    } catch (err: any) {
      setTurnstileToken("");
      setTurnstileKey((k) => k + 1);
      setError(err.message || "Request failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell progressStep={1} progressTotal={1}>
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-5">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-16 h-16 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex items-center justify-center mx-auto">
              <MailCheck className="w-8 h-8 text-signal-emerald" />
            </motion.div>
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-xl text-ink-navy dark:text-paper">Check your inbox</h2>
              <p className="text-xs text-slate dark:text-paper/60 leading-relaxed">
                If <span className="font-semibold text-ink-navy dark:text-paper">{email}</span> is registered, a reset link has been sent. Check your spam folder too.
              </p>
            </div>
            <Link href="/login"
              className="w-full flex items-center justify-center gap-2 py-2 border border-line-gray-light dark:border-line-gray-dark rounded-lg text-xs font-semibold text-ink-navy dark:text-paper hover:bg-line-gray-light/40 dark:hover:bg-line-gray-dark/40 transition-all active:scale-[0.98]">
              Back to Sign In
            </Link>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div>
              <h2 className="font-heading font-bold text-xl text-ink-navy dark:text-paper">Forgot your password?</h2>
              <p className="text-xs text-slate dark:text-paper/60 mt-1">Enter your email and we will send you a reset link.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1.5 block">Email Address</label>
                <input id="forgot-email" type="email" placeholder="you@example.com" value={email} autoFocus
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors" required />
              </div>
              {error && <p className="text-xs text-alert-coral">{error}</p>}

              {/* Invisible Turnstile widget */}
              <Turnstile key={turnstileKey} onVerify={setTurnstileToken} />

              <button type="submit" disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
                {isSubmitting ? "Sending…" : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
            <p className="text-xs text-center text-slate dark:text-paper/50">
              Remembered it?{" "}
              <Link href="/login" className="text-ink-navy dark:text-paper font-semibold hover:underline">Sign in</Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}

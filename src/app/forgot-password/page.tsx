"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AuthShell } from "@/components/AuthShell";
import { ArrowRight, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address."); return; }
    setError(""); setSent(true);
  }

  return (
    <AuthShell progressStep={1} progressTotal={1}>
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-5">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-signal-emerald/20 flex items-center justify-center mx-auto">
              <MailCheck className="w-8 h-8 text-signal-emerald" />
            </motion.div>
            <div>
              <h2 className="font-heading font-bold text-2xl text-ink-navy dark:text-paper">Check your inbox</h2>
              <p className="text-sm text-slate dark:text-paper/60 mt-2 leading-relaxed">
                If <span className="font-semibold text-ink-navy dark:text-paper">{email}</span> is registered, a reset link has been sent. Check your spam folder too.
              </p>
            </div>
            <Link href="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-line-gray-light dark:border-line-gray-dark rounded-xl text-sm font-semibold text-slate dark:text-paper/70 hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors">
              Back to Sign In
            </Link>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }} className="space-y-6">
            <div>
              <h2 className="font-heading font-bold text-2xl text-ink-navy dark:text-paper">Forgot your password?</h2>
              <p className="text-sm text-slate dark:text-paper/60 mt-1">Enter your email and we'll send you a reset link.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1.5 block">Email Address</label>
                <input type="email" placeholder="you@example.com" value={email} autoFocus
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="w-full px-4 py-3 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-xl focus:outline-none focus:border-signal-emerald transition-colors" required />
              </div>
              {error && <p className="text-xs text-alert-coral">{error}</p>}
              <button type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-xl hover:opacity-90 transition-opacity">
                Send Reset Link <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <p className="text-xs text-center text-slate dark:text-paper/50">
              Remembered it?{" "}
              <Link href="/login" className="text-signal-emerald font-semibold hover:underline">Sign in</Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}

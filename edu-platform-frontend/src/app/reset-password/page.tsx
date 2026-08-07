"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthShell, PasswordStrength } from "@/components/AuthShell";
import { ArrowRight, CheckCircle, Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tokens, setTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null);
  const [linkInvalid, setLinkInvalid] = useState(false);

  useEffect(() => {
    // Supabase's recovery email redirects here with the session tokens in
    // the URL hash: #access_token=...&refresh_token=...&type=recovery
    const hash = window.location.hash;
    if (!hash) { setLinkInvalid(true); return; }
    const params = new URLSearchParams(hash.replace("#", "?"));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) { setLinkInvalid(true); return; }
    setTokens({ accessToken, refreshToken });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (!tokens) { setError("This reset link is invalid or has expired."); return; }

    setError("");
    setSubmitting(true);
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiURL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          newPassword: password,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Couldn't reset your password.");
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Couldn't reset your password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell progressStep={1} progressTotal={1}>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-16 h-16 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-signal-emerald" />
            </motion.div>
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-xl text-ink-navy dark:text-paper">Password updated!</h2>
              <p className="text-xs text-slate dark:text-paper/60">Redirecting to sign in…</p>
            </div>
          </motion.div>
        ) : linkInvalid ? (
          <motion.div key="invalid" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-lg border border-alert-coral/30 bg-alert-coral/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-alert-coral" />
            </div>
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-xl text-ink-navy dark:text-paper">Link expired or invalid</h2>
              <p className="text-xs text-slate dark:text-paper/60 max-w-xs mx-auto">
                This password reset link is no longer valid. Request a new one from the sign-in page.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div>
              <h2 className="font-heading font-bold text-xl text-ink-navy dark:text-paper">Set a new password</h2>
              <p className="text-xs text-slate dark:text-paper/60 mt-1">Choose a strong password for your account.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1.5 block">New Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} placeholder="Min. 6 characters" value={password} autoFocus
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="w-full px-4 py-2.5 pr-10 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors" required />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate/50 hover:text-slate">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && <div className="mt-2"><PasswordStrength password={password} /></div>}
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1.5 block">Confirm Password</label>
                <input type="password" placeholder="Repeat your password" value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                  className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors" required />
              </div>
              {error && <p className="text-xs text-alert-coral">{error}</p>}
              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm disabled:opacity-50">
                {submitting ? "Updating..." : "Update Password"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}

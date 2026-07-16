"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthShell, PasswordStrength } from "@/components/AuthShell";
import { ArrowRight, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setError(""); setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <AuthShell progressStep={1} progressTotal={1}>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-signal-emerald/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-signal-emerald" />
            </motion.div>
            <div>
              <h2 className="font-heading font-bold text-2xl text-ink-navy dark:text-paper">Password updated!</h2>
              <p className="text-sm text-slate dark:text-paper/60 mt-2">Redirecting to sign in…</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }} className="space-y-6">
            <div>
              <h2 className="font-heading font-bold text-2xl text-ink-navy dark:text-paper">Set a new password</h2>
              <p className="text-sm text-slate dark:text-paper/60 mt-1">Choose a strong password for your account.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1.5 block">New Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} placeholder="Min. 6 characters" value={password} autoFocus
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="w-full px-4 py-3 pr-10 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-xl focus:outline-none focus:border-signal-emerald transition-colors" required />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate/50 hover:text-slate">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && <div className="mt-2"><PasswordStrength password={password} /></div>}
              </div>
              <div>
                <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1.5 block">Confirm Password</label>
                <input type="password" placeholder="Repeat your password" value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                  className="w-full px-4 py-3 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-xl focus:outline-none focus:border-signal-emerald transition-colors" required />
              </div>
              {error && <p className="text-xs text-alert-coral">{error}</p>}
              <button type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-signal-emerald text-white font-bold rounded-xl hover:bg-signal-emerald/90 transition-colors">
                Update Password <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}

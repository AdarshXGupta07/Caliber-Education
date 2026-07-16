"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { AuthShell } from "@/components/AuthShell";
import { ArrowRight, CheckCircle, Eye, EyeOff } from "lucide-react";

type Step = "form" | "done";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address."); return; }
    if (password.length < 1) { setError("Enter your password."); return; }
    setError(""); setStep("done");
    login(email);
    setTimeout(() => router.push("/dashboard"), 1400);
  }

  return (
    <AuthShell progressStep={1} progressTotal={1}>
      <AnimatePresence mode="wait">
        {step === "done" ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-signal-emerald/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-signal-emerald" />
            </motion.div>
            <div>
              <h2 className="font-heading font-bold text-2xl text-ink-navy dark:text-paper">Welcome back!</h2>
              <p className="text-sm text-slate dark:text-paper/60 mt-2">Redirecting to your dashboard…</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }} className="space-y-6">
            <div>
              <h2 className="font-heading font-bold text-2xl text-ink-navy dark:text-paper">Sign in</h2>
              <p className="text-sm text-slate dark:text-paper/60 mt-1">Welcome back to Caliber.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1.5 block">Email Address</label>
                <input type="email" placeholder="you@example.com" value={email} autoFocus
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="w-full px-4 py-3 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-xl focus:outline-none focus:border-signal-emerald transition-colors" required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate dark:text-paper/70">Password</label>
                  <Link href="/forgot-password" className="text-xs text-signal-emerald font-semibold hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} placeholder="Your password" value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="w-full px-4 py-3 pr-10 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-xl focus:outline-none focus:border-signal-emerald transition-colors" required />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate/50 hover:text-slate transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-xs text-alert-coral">{error}</p>}
              <button type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-xl hover:opacity-90 transition-opacity">
                Sign In <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-xs text-center text-slate dark:text-paper/50">
              New here?{" "}
              <Link href="/signup" className="text-signal-emerald font-semibold hover:underline">Create an account</Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}

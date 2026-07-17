"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { AuthShell, OTPInput, ResendTimer, PasswordStrength } from "@/components/AuthShell";
import { ArrowRight, CheckCircle, Eye, EyeOff, ChevronLeft } from "lucide-react";

type Step = "email" | "otp" | "password" | "done";
const OTP_LENGTH = 6;

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [error, setError] = useState("");

  const otpFilled = otp.every((d) => d !== "");
  const stepNum = step === "email" ? 1 : step === "otp" ? 2 : step === "password" ? 3 : 3;

  function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address."); return; }
    setError(""); setOtp(Array(OTP_LENGTH).fill("")); setStep("otp");
  }

  function handleOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!otpFilled) { setError("Enter all 6 digits."); return; }
    setError(""); setStep("password");
  }

  function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setError(""); setStep("done");
    login(email);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  return (
    <AuthShell progressStep={stepNum} progressTotal={3}>
      <AnimatePresence mode="wait">
        {step === "done" ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-16 h-16 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-signal-emerald" />
            </motion.div>
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-xl text-ink-navy dark:text-paper">Account created!</h2>
              <p className="text-xs text-slate dark:text-paper/60">Redirecting to your dashboard…</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            {/* Back */}
            {(step === "otp" || step === "password") && (
              <button onClick={() => { setError(""); setStep(step === "otp" ? "email" : "otp"); }}
                className="flex items-center gap-1 text-xs text-slate dark:text-paper/50 hover:text-ink-navy dark:hover:text-paper transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}

            {/* Header */}
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate dark:text-paper/50 mb-1">Step {stepNum} of 3</p>
              <h2 className="font-heading font-bold text-xl text-ink-navy dark:text-paper">
                {step === "email" ? "Create your account" : step === "otp" ? "Verify your email" : "Set a password"}
              </h2>
              <p className="text-xs text-slate dark:text-paper/60 mt-1">
                {step === "email" ? "Enter your email to get started." : step === "otp" ? `OTP sent to ${email}` : "Choose a secure password for your account."}
              </p>
            </div>

            {/* Email step */}
            {step === "email" && (
              <form onSubmit={handleEmail} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1.5 block">Email Address</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} autoFocus
                    className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors" required />
                </div>
                {error && <p className="text-xs text-alert-coral">{error}</p>}
                <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm animate-pulse">
                  Send OTP <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-xs text-center text-slate dark:text-paper/50">
                  Already have an account?{" "}
                  <Link href="/login" className="text-ink-navy dark:text-paper font-semibold hover:underline">Sign in</Link>
                </p>
              </form>
            )}

            {/* OTP step */}
            {step === "otp" && (
              <form onSubmit={handleOTP} className="space-y-5">
                <OTPInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} />
                <p className="text-[10px] text-center text-slate dark:text-paper/50">Enter any 6 digits for this demo</p>
                {error && <p className="text-xs text-alert-coral text-center">{error}</p>}
                <button type="submit" disabled={!otpFilled}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                  Verify <ArrowRight className="w-4 h-4" />
                </button>
                <ResendTimer onResend={() => {}} />
              </form>
            )}

            {/* Password step */}
            {step === "password" && (
              <form onSubmit={handlePassword} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1.5 block">Password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} placeholder="Min. 6 characters" value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }} autoFocus
                      className="w-full px-4 py-2.5 pr-10 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors" required />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate/50 hover:text-slate transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && <div className="mt-2"><PasswordStrength password={password} /></div>}
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1.5 block">Confirm Password</label>
                  <div className="relative">
                    <input type={showCpw ? "text" : "password"} placeholder="Repeat your password" value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      className="w-full px-4 py-2.5 pr-10 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors" required />
                    <button type="button" onClick={() => setShowCpw(!showCpw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate/50 hover:text-slate transition-colors">
                      {showCpw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-xs text-alert-coral">{error}</p>}
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm">
                  Create Account <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}

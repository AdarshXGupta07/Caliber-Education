"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { AuthShell, OTPInput, ResendTimer, PasswordStrength } from "@/components/AuthShell";
import { Turnstile } from "@/components/Turnstile";
import { TermsAcceptanceBox } from "@/components/TermsAcceptanceBox";
import { apiFetch, ApiFetchError } from "@/lib/apiFetch";
import { ArrowRight, CheckCircle, Eye, EyeOff, ChevronLeft, Loader2, Sparkles } from "lucide-react";

type Step = "email" | "otp" | "password" | "profile" | "done";
const OTP_LENGTH = 6;

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession, markProfileComplete } = useAuth();

  // See login/page.tsx — same ?next=<path> pattern, same open-redirect guard.
  const nextPath = (() => {
    const raw = searchParams.get("next");
    if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
    return null;
  })();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileForm, setProfileForm] = useState({
    full_name: "", phone_number: "", address: "", stage: "CA Final", attempt_status: "First Attempt"
  });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [tempToken, setTempToken] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  // True once a request has been in flight a while — most likely the free-tier
  // backend was asleep and is waking up (can take up to ~50s), not a real hang.
  const [slowHint, setSlowHint] = useState(false);

  const otpFilled = otp.every((d) => d !== "");
  const stepNum = step === "email" ? 1 : step === "otp" ? 2 : step === "password" ? 3 : step === "profile" ? 4 : 4;

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!termsAccepted) { setError("Please read and accept the Terms & Conditions to continue."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address."); return; }
    if (!turnstileToken) { setError("Security verification in progress. Please wait a moment and try again."); return; }

    setError("");
    setIsSubmitting(true);
    setSlowHint(false);
    const slowTimer = setTimeout(() => setSlowHint(true), 9000);
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await apiFetch(`${apiURL}/api/auth/register-init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to initialize registration.");
      }
      setOtp(Array(OTP_LENGTH).fill(""));
      setStep("otp");
    } catch (err: any) {
      // A Turnstile token is single-use — whatever the failure, the token
      // that was just spent is now dead. Force a fresh widget so a retry
      // actually has a valid token instead of failing bot-check again.
      setTurnstileToken("");
      setTurnstileKey((k) => k + 1);
      setError(err.message || "Server error. Please check your connection and try again.");
    } finally {
      clearTimeout(slowTimer);
      setIsSubmitting(false);
      setSlowHint(false);
    }
  }

  async function handleOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!otpFilled) { setError("Enter all 6 digits."); return; }

    setError("");
    setIsSubmitting(true);
    setSlowHint(false);
    const slowTimer = setTimeout(() => setSlowHint(true), 9000);
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await apiFetch(`${apiURL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join("") }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Invalid OTP");
      }
      const data = await res.json();
      setTempToken(data.tempToken);
      setStep("password");
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP.");
    } finally {
      clearTimeout(slowTimer);
      setIsSubmitting(false);
      setSlowHint(false);
    }
  }

  async function handleResendOTP() {
    if (!turnstileToken) {
      setError("Security verification in progress. Please wait a moment and try again.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    setSlowHint(false);
    const slowTimer = setTimeout(() => setSlowHint(true), 9000);
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await apiFetch(`${apiURL}/api/auth/register-init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Couldn't resend the code.");
      }
      setOtp(Array(OTP_LENGTH).fill(""));
    } catch (err: any) {
      setError(err.message || "Couldn't resend the code. Please try again.");
    } finally {
      // Whether it succeeded or not, that token is spent — a second resend
      // needs a fresh one.
      setTurnstileToken("");
      setTurnstileKey((k) => k + 1);
      clearTimeout(slowTimer);
      setIsSubmitting(false);
      setSlowHint(false);
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!termsAccepted) { setError("Please read and accept the Terms & Conditions to continue."); setStep("email"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setError("");
    setIsSubmitting(true);
    setSlowHint(false);
    const slowTimer = setTimeout(() => setSlowHint(true), 9000);
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await apiFetch(`${apiURL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, tempToken, termsAccepted }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Signup failed");
      }
      const data = await res.json();
      // register already returns a valid session — hydrate directly instead
      // of calling login() again, which would reuse this same single-use
      // Turnstile token a second time and fail.
      if (data.token && data.user) {
        setSession(data.token, data.user);
      }
      setStep("profile");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      clearTimeout(slowTimer);
      setIsSubmitting(false);
      setSlowHint(false);
    }
  }

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    setSlowHint(false);
    const slowTimer = setTimeout(() => setSlowHint(true), 9000);
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";
      const res = await apiFetch(`${apiURL}/api/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(profileForm)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Couldn't save your details. Please try again.");
      }
      markProfileComplete();
      setStep("done");
      setTimeout(() => router.push(nextPath || "/dashboard"), 1500);
    } catch (err: any) {
      setError(err.message || "Couldn't save your details. Please try again.");
    } finally {
      clearTimeout(slowTimer);
      setIsSubmitting(false);
      setSlowHint(false);
    }
  }

  const handleGoogleAuth = async () => {
    if (!termsAccepted) { setError("Please read and accept the Terms & Conditions to continue."); return; }
    setError("");
    setIsGoogleLoading(true);
    setSlowHint(false);
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await apiFetch(`${apiURL}/api/auth/google/url`, { onSlow: () => setSlowHint(true) });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return; // leaving the page — keep the button showing "loading" until navigation completes
      }
      setError("Failed to initialize Google connection.");
      setIsGoogleLoading(false);
      setSlowHint(false);
    } catch (err) {
      setError(err instanceof ApiFetchError ? err.message : "Failed to initialize Google connection.");
      setIsGoogleLoading(false);
      setSlowHint(false);
    }
  };

  return (
    <AuthShell progressStep={stepNum} progressTotal={4}>
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
                {step === "email" ? "Create your account" : step === "otp" ? "Verify your email" : step === "password" ? "Set a password" : "Tell us about you"}
              </h2>
              <p className="text-xs text-slate dark:text-paper/60 mt-1">
                {step === "email" ? "Enter your email to get started." : step === "otp" ? `OTP sent to ${email}` : step === "password" ? "Choose a secure password for your account." : "Help us personalize your study experience."}
              </p>
            </div>

            {slowHint && (
              <p className="text-center text-[11px] text-slate dark:text-paper/50 bg-line-gray-light/50 dark:bg-line-gray-dark/40 rounded-lg py-2 px-3">
                Still connecting — this can take up to a minute if our server was asleep.
              </p>
            )}

            {/* Email step */}
            {step === "email" && (
              <div className="space-y-5">
                <TermsAcceptanceBox accepted={termsAccepted} onAcceptedChange={setTermsAccepted} />

                {/* Google is the primary, recommended path — one tap, nothing
                    to remember, and no OTP/password steps at all. The manual
                    form below still works exactly the same, just visually
                    secondary. Both paths are gated on terms acceptance above. */}
                <div className="space-y-2">
                  <button type="button" onClick={handleGoogleAuth} disabled={!termsAccepted || isGoogleLoading || isSubmitting}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100">
                    {isGoogleLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Connecting…</>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign up with Google
                      </>
                    )}
                  </button>
                  <p className="flex items-center justify-center gap-1.5 text-[11px] text-signal-emerald font-semibold">
                    <Sparkles className="w-3 h-3" /> Recommended — skip the OTP step entirely
                  </p>
                </div>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-line-gray-light dark:border-line-gray-dark"></div>
                  <span className="flex-shrink-0 mx-4 text-slate dark:text-paper/50 text-[10px] font-bold uppercase tracking-wider">or sign up with email</span>
                  <div className="flex-grow border-t border-line-gray-light dark:border-line-gray-dark"></div>
                </div>

                <form onSubmit={handleEmail} className="space-y-4 opacity-90">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1.5 block">Email Address</label>
                    <input type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors" required />
                  </div>

                  {/* Invisible Turnstile widget — must be mounted before the
                      "Send OTP" submit fires, since register-init requires it.
                      key forces a fresh widget (and fresh single-use token)
                      after any failed attempt. */}
                  <Turnstile key={turnstileKey} onVerify={setTurnstileToken} />

                  {error && <p className="text-xs text-alert-coral">{error}</p>}
                  <button type="submit" disabled={!turnstileToken || !termsAccepted || isSubmitting || isGoogleLoading} className="w-full flex items-center justify-center gap-2 py-2.5 border border-line-gray-light dark:border-line-gray-dark text-ink-navy dark:text-paper font-semibold rounded-lg hover:bg-line-gray-light/40 dark:hover:bg-line-gray-dark/40 active:scale-[0.98] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100">
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                <p className="text-xs text-center text-slate dark:text-paper/50 mt-4">
                  Already have an account?{" "}
                  <Link href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"} className="text-ink-navy dark:text-paper font-semibold hover:underline">Sign in</Link>
                </p>
              </div>
            )}

            {/* OTP step */}
            {step === "otp" && (
              <form onSubmit={handleOTP} className="space-y-5">
                <OTPInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} />
                <p className="text-xs text-center text-slate dark:text-paper/50">
                  Don&apos;t see it in your inbox? Check your spam/junk folder.
                </p>
                {/* Fresh widget for the resend action — the step-1 token was
                    already spent on the original register-init call. */}
                <Turnstile key={turnstileKey} onVerify={setTurnstileToken} />
                {error && <p className="text-xs text-alert-coral text-center">{error}</p>}
                <button type="submit" disabled={!otpFilled || isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : <>Verify <ArrowRight className="w-4 h-4" /></>}
                </button>
                <ResendTimer onResend={handleResendOTP} />
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

                <button type="submit" disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Continuing…</> : <>Continue <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}

            {/* Profile Step */}
            {step === "profile" && (
              <form onSubmit={handleProfile} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1.5 block">Full Name</label>
                  <input required autoFocus value={profileForm.full_name} onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg outline-none focus:border-signal-emerald/50 transition-colors"
                    placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1.5 block">Phone or WhatsApp</label>
                  <input required value={profileForm.phone_number} onChange={e => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg outline-none focus:border-signal-emerald/50 transition-colors"
                    placeholder="+91..." />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1.5 block">Address / City</label>
                  <textarea required value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg outline-none focus:border-signal-emerald/50 transition-colors resize-none"
                    rows={2} placeholder="Your residential address" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1.5 block">Stage</label>
                    <select required value={profileForm.stage} onChange={e => setProfileForm({ ...profileForm, stage: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg outline-none focus:border-signal-emerald/50 transition-colors">
                      <option>CA Foundation</option>
                      <option>CA Intermediate</option>
                      <option>CA Final</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1.5 block">Attempt Status</label>
                    <select required value={profileForm.attempt_status} onChange={e => setProfileForm({ ...profileForm, attempt_status: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg outline-none focus:border-signal-emerald/50 transition-colors">
                      <option>First Attempt</option>
                      <option>Repeater (2nd)</option>
                      <option>Repeater (3rd+)</option>
                    </select>
                  </div>
                </div>

                {error && <p className="text-xs text-alert-coral">{error}</p>}

                <button type="submit" disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm mt-6 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <>Complete Setup <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}

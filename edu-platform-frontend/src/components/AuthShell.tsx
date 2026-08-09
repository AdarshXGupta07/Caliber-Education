"use client";

import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

interface AuthShellProps {
  children: ReactNode;
  progressStep: number;
  progressTotal: number;
}

export function AuthShell({ children, progressStep, progressTotal }: AuthShellProps) {
  // Same premium/normal logo logic as Navbar.tsx — these pages are reached
  // almost exclusively pre-auth, where this already resolves to NORMAL.jpg
  // (the previous static BookOpen icon here was disconnected from that
  // logic entirely). Still correctly shows PREMIUM.jpg for the edge case of
  // an already-authenticated premium user landing on e.g. /reset-password.
  const { isAuthenticated, purchasedCourseIds } = useAuth();

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center bg-line-gray-light/30 dark:bg-line-gray-dark/10 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center relative bg-white/10">
              <Image
                src={isAuthenticated && purchasedCourseIds?.length > 0 ? "/PREMIUM.jpg" : "/NORMAL.jpg"}
                alt="Caliber Education Logo"
                fill
                sizes="32px"
                unoptimized
                className="object-cover"
              />
            </div>
            <span className="font-heading font-bold text-xl text-ink-navy dark:text-paper">CAliber</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-line-gray-dark/50 border border-line-gray-light dark:border-line-gray-dark rounded-xl overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-line-gray-light dark:bg-line-gray-dark">
            <div
              className="h-full bg-signal-emerald transition-all duration-500"
              style={{ width: `${(progressStep / progressTotal) * 100}%` }}
            />
          </div>
          <div className="p-7">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Shared OTP input — reused across signup & login */
import { useRef } from "react";

const OTP_LENGTH = 6;

export function OTPInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function handleKey(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[idx] && idx > 0) refs.current[idx - 1]?.focus();
  }

  function handleChange(idx: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[idx] = digit;
    onChange(next);
    if (digit && idx < OTP_LENGTH - 1) refs.current[idx + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted.length) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => (next[i] = ch));
    onChange(next);
    refs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    e.preventDefault();
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          style={{ height: "3.25rem" }}
          className="w-11 text-center font-mono text-xl font-bold border-2 border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg focus:outline-none focus:border-signal-emerald transition-colors caret-signal-emerald"
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}

/** Resend countdown */
import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

export function ResendTimer({ onResend }: { onResend: () => void }) {
  const [seconds, setSeconds] = useState(30);
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  if (seconds > 0)
    return (
      <p className="text-xs text-slate dark:text-paper/50 text-center">
        Resend in <span className="font-mono font-bold text-signal-emerald">{String(seconds).padStart(2, "0")}s</span>
      </p>
    );

  return (
    <button
      onClick={() => { setSeconds(30); onResend(); }}
      className="flex items-center gap-1.5 mx-auto text-xs font-semibold text-signal-emerald hover:underline"
    >
      <RotateCcw className="w-3 h-3" /> Resend OTP
    </button>
  );
}

/** Password strength hint */
export function PasswordStrength({ password }: { password: string }) {
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /\d/.test(password);
  const score = (len >= 8 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNum ? 1 : 0);
  const labels = ["Weak", "Fair", "Strong"];
  const colors = ["bg-alert-coral", "bg-yellow-400", "bg-signal-emerald"];
  if (!password) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${i < score ? colors[score - 1] : "bg-line-gray-light dark:bg-line-gray-dark"}`}
          />
        ))}
      </div>
      <p className={`text-xs ${score === 3 ? "text-signal-emerald" : score === 2 ? "text-yellow-500" : "text-alert-coral"}`}>
        {labels[score - 1] || "Too short"}
      </p>
    </div>
  );
}

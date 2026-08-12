"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

export interface ToastState {
  message: string;
  type: "success" | "error";
}

// Self-contained success/error notification — no toast library exists
// anywhere in this app (confirmed before building this), so this is a small
// hand-rolled component matching the codebase's existing pattern
// (SocialIcons.tsx, AuthShell.tsx) rather than adding a new dependency.
// Payment flows were the main gap: 3 of 4 purchase paths gave zero visual
// confirmation before redirecting, which read as "nothing happened."
export function Toast({ toast, onDismiss, durationMs = 4000 }: { toast: ToastState | null; onDismiss: () => void; durationMs?: number }) {
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(id);
  }, [toast, onDismiss, durationMs]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -16, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -16, x: "-50%" }}
          className={`fixed top-20 left-1/2 z-[300] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border max-w-sm bg-white dark:bg-line-gray-dark text-ink-navy dark:text-paper ${
            toast.type === "success" ? "border-signal-emerald/30" : "border-alert-coral/30"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-signal-emerald flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-alert-coral flex-shrink-0" />
          )}
          <p className="text-sm font-medium">{toast.message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

// Structural clone of the quiz page's existing "unanswered questions" modal
// (fixed inset-0 + backdrop-blur overlay, rounded-2xl card) — reused here,
// not a new visual style, so the leave-confirmation UI feels consistent with
// the rest of the quiz-taking flow.
export function LeaveTestModal({
  open, onStay, onLeave,
}: {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}) {
  // Escape mirrors clicking the backdrop — dismiss/cancel (stay in test),
  // never the destructive action (leave).
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onStay(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onStay]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink-navy/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onStay()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-test-modal-title"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            className="bg-paper dark:bg-ink-navy border border-line-gray-light dark:border-line-gray-dark rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-alert-coral/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-alert-coral" />
              </div>
              <div>
                <h3 id="leave-test-modal-title" className="font-heading font-bold text-base text-ink-navy dark:text-paper">Leave Test?</h3>
                <p className="text-xs text-slate dark:text-paper/60 mt-1 leading-relaxed">
                  You have an active test in progress. Your progress is saved automatically, but leaving now will interrupt your attempt.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onStay}
                className="flex-1 py-2.5 text-xs font-semibold border border-line-gray-light dark:border-line-gray-dark text-ink-navy dark:text-paper rounded-xl hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors"
              >
                Stay in Test
              </button>
              <button
                onClick={onLeave}
                className="flex-1 py-2.5 text-xs font-bold bg-alert-coral text-white rounded-xl hover:opacity-90 transition-colors"
              >
                Leave Test
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

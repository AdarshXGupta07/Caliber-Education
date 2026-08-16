"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="pt-16 min-h-screen bg-paper dark:bg-ink-navy flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="w-16 h-16 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 flex items-center justify-center mx-auto text-ink-navy dark:text-paper"
        >
          <AlertTriangle className="w-8 h-8 text-slate/50 dark:text-paper/40" />
        </motion.div>

        <div className="space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate/40 dark:text-paper/40">Something went wrong</span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink-navy dark:text-paper leading-none">
            This page hit an error
          </h1>
          <p className="text-xs text-slate dark:text-paper/60 max-w-xs mx-auto leading-relaxed">
            Nothing you did caused this. Try again, or head back home — if you were mid-quiz or mid-checkout, your progress up to this point should still be saved.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-2 max-w-xs mx-auto">
          <button
            onClick={() => reset()}
            className="w-full py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Try Again
          </button>
          <Link
            href="/"
            className="w-full py-2 border border-line-gray-light dark:border-line-gray-dark text-slate dark:text-paper/70 hover:text-ink-navy dark:hover:text-paper rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <Home className="w-3.5 h-3.5" /> Return Home
          </Link>
        </div>

      </div>
    </div>
  );
}

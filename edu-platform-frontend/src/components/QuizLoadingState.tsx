"use client";

import { motion } from "framer-motion";

export function QuizLoadingState({ label }: { label: string }) {
  return (
    <div className="pt-32 pb-20 flex flex-col items-center justify-center gap-4 text-center">
      <div className="relative w-14 h-14">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-line-gray-light dark:border-line-gray-dark border-t-signal-emerald"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="font-heading text-xs font-bold uppercase tracking-widest text-slate dark:text-paper/60"
      >
        {label}
      </motion.p>
    </div>
  );
}

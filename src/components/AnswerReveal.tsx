"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

interface AnswerRevealOptionProps {
  label: string;
  text: string;
  state: "idle" | "selected" | "correct" | "wrong" | "reveal-correct";
  onClick?: () => void;
  disabled?: boolean;
}

export function AnswerRevealOption({
  label,
  text,
  state,
  onClick,
  disabled,
}: AnswerRevealOptionProps) {
  const base =
    "relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-200 select-none";

  const stateStyles: Record<string, string> = {
    idle: "border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/30 hover:border-signal-emerald/50 hover:bg-signal-emerald/5 cursor-pointer",
    selected:
      "border-slate/50 dark:border-slate/30 bg-slate/5 cursor-pointer",
    correct:
      "border-signal-emerald bg-signal-emerald/10 shadow-[0_0_16px_rgba(22,163,101,0.25)]",
    wrong: "border-alert-coral bg-alert-coral/10 opacity-75",
    "reveal-correct":
      "border-signal-emerald/50 bg-signal-emerald/5",
  };

  const iconStyles: Record<string, string> = {
    idle: "bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/50",
    selected: "bg-slate/20 text-slate",
    correct: "bg-signal-emerald text-white",
    wrong: "bg-alert-coral text-white",
    "reveal-correct": "bg-signal-emerald/20 text-signal-emerald",
  };

  return (
    <motion.button
      layout
      onClick={onClick}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      className={`${base} ${stateStyles[state]}`}
    >
      {/* Label bubble */}
      <motion.div
        layout
        className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-colors duration-300 ${iconStyles[state]}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {state === "correct" && (
            <motion.span
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </motion.span>
          )}
          {state === "wrong" && (
            <motion.span
              key="x"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <X className="w-3.5 h-3.5" strokeWidth={3} />
            </motion.span>
          )}
          {state === "reveal-correct" && (
            <motion.span
              key="reveal"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
            >
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </motion.span>
          )}
          {(state === "idle" || state === "selected") && (
            <motion.span key="label" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Option text */}
      <span
        className={`text-sm font-medium transition-colors duration-200 ${
          state === "correct"
            ? "text-signal-emerald font-semibold"
            : state === "wrong"
            ? "text-alert-coral"
            : "text-ink-navy dark:text-paper"
        }`}
      >
        {text}
      </span>

      {/* Correct glow ring */}
      {state === "correct" && (
        <motion.span
          className="absolute inset-0 rounded-xl border-2 border-signal-emerald pointer-events-none"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
        />
      )}
    </motion.button>
  );
}

/* ─── Review card used in Results ─── */
interface ReviewCardProps {
  index: number;
  questionText: string;
  options: string[];
  userAnswerIndex: number | null;
  correctAnswerIndex: number;
  explanation: string;
}

export function ReviewCard({
  index,
  questionText,
  options,
  userAnswerIndex,
  correctAnswerIndex,
  explanation,
}: ReviewCardProps) {
  const isCorrect = userAnswerIndex === correctAnswerIndex;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`rounded-2xl border p-5 space-y-3 ${
        isCorrect
          ? "border-signal-emerald/30 bg-signal-emerald/5"
          : "border-alert-coral/30 bg-alert-coral/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
            isCorrect
              ? "bg-signal-emerald text-white"
              : "bg-alert-coral text-white"
          }`}
        >
          {isCorrect ? <Check className="w-3 h-3" strokeWidth={3} /> : <X className="w-3 h-3" strokeWidth={3} />}
        </span>
        <p className="text-sm font-medium text-ink-navy dark:text-paper leading-relaxed">
          <span className="text-slate dark:text-paper/50 font-mono text-xs mr-2">Q{index + 1}.</span>
          {questionText}
        </p>
      </div>

      <div className="ml-9 space-y-1.5">
        {options.map((opt, i) => {
          const isUserChoice = i === userAnswerIndex;
          const isRight = i === correctAnswerIndex;
          let cls = "text-sm px-3 py-1.5 rounded-lg border ";
          if (isRight) cls += "border-signal-emerald/40 bg-signal-emerald/10 text-signal-emerald font-semibold";
          else if (isUserChoice && !isCorrect)
            cls += "border-alert-coral/40 bg-alert-coral/10 text-alert-coral line-through";
          else cls += "border-transparent text-slate dark:text-paper/50";

          return (
            <div key={i} className={cls}>
              <span className="font-mono text-xs mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
              {isRight && <span className="ml-2 text-xs">(correct)</span>}
              {isUserChoice && !isCorrect && <span className="ml-2 text-xs">(your answer)</span>}
            </div>
          );
        })}
      </div>

      <div className="ml-9 pt-1 border-t border-line-gray-light dark:border-line-gray-dark">
        <p className="text-xs text-slate dark:text-paper/60 leading-relaxed">
          <span className="font-semibold text-ink-navy dark:text-paper/80">Explanation: </span>
          {explanation}
        </p>
      </div>
    </motion.div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnswerRevealOption } from "./AnswerReveal";

const demoQuestion = {
  text: "Which accounting concept assumes the business will continue to operate for the foreseeable future?",
  options: ["Accrual Concept", "Going Concern Concept", "Consistency Concept", "Materiality Concept"],
  correctIndex: 1,
};

type OptionState = "idle" | "selected" | "correct" | "wrong" | "reveal-correct";

const CYCLE_DELAY = 3200; // ms between auto cycles

export function HeroMCQCard() {
  const [phase, setPhase] = useState<"idle" | "selecting" | "revealed">("idle");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(6);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-cycle animation
  useEffect(() => {
    if (isHovered) return;
    const id = setTimeout(() => runCycle(demoQuestion.correctIndex), 1200);
    return () => clearTimeout(id);
  }, [isHovered, score]);

  function runCycle(answerIdx: number) {
    setPhase("selecting");
    setSelectedIndex(answerIdx);

    setTimeout(() => {
      setPhase("revealed");
      if (answerIdx === demoQuestion.correctIndex) {
        setScore((s) => Math.min(s + 1, 10));
      }
    }, 600);

    setTimeout(() => {
      setPhase("idle");
      setSelectedIndex(null);
    }, CYCLE_DELAY);
  }

  function handleOptionClick(i: number) {
    if (phase === "revealed") return;
    setIsHovered(true);
    runCycle(i);
    setTimeout(() => setIsHovered(false), CYCLE_DELAY + 500);
  }

  function getOptionState(i: number): OptionState {
    if (phase === "idle") return "idle";
    if (phase === "selecting") return i === selectedIndex ? "selected" : "idle";
    // revealed
    if (i === demoQuestion.correctIndex) return "correct";
    if (i === selectedIndex && selectedIndex !== demoQuestion.correctIndex) return "wrong";
    return "idle";
  }

  return (
    <div
      className="relative w-full max-w-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark rounded-xl overflow-hidden backdrop-blur-sm">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line-gray-light dark:border-line-gray-dark">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-alert-coral/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-signal-emerald/60" />
          </div>
          <span className="text-xs font-mono text-slate dark:text-paper/50">Accounting · Q4/30</span>
          {/* Score counter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate dark:text-paper/50">Score</span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={score}
                initial={{ y: -12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 12, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="font-mono text-sm font-bold text-signal-emerald tabular-nums"
              >
                {String(score).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
            <span className="font-mono text-xs text-slate dark:text-paper/50">/10</span>
          </div>
        </div>

        {/* Question */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-sm font-medium text-ink-navy dark:text-paper leading-relaxed">
            {demoQuestion.text}
          </p>
        </div>

        {/* Options */}
        <div className="px-5 pb-5 space-y-2.5 mt-2">
          {demoQuestion.options.map((opt, i) => (
            <AnswerRevealOption
              key={i}
              label={String.fromCharCode(65 + i)}
              text={opt}
              state={getOptionState(i)}
              onClick={() => handleOptionClick(i)}
              disabled={phase === "revealed"}
            />
          ))}
        </div>

        {/* Explanation reveal */}
        <AnimatePresence>
          {phase === "revealed" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-line-gray-light dark:border-line-gray-dark overflow-hidden"
            >
              <div className="px-5 py-3.5 bg-signal-emerald/5">
                <p className="text-xs text-slate dark:text-paper/70 leading-relaxed">
                  <span className="font-semibold text-signal-emerald">Explanation: </span>
                  The Going Concern Concept assumes the entity will continue operations indefinitely, so assets are recorded at cost rather than liquidation value.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click hint */}
        <AnimatePresence>
          {phase === "idle" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-3 right-4"
            >
              <span className="text-xs text-slate/50 dark:text-paper/30 italic">click to try</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

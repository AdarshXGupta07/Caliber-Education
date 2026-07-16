"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AnswerRevealOption, ReviewCard } from "@/components/AnswerReveal";
import { mcqSets } from "@/lib/mockData";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  LayoutDashboard,
  Trophy,
} from "lucide-react";

type QuizPhase = "in-progress" | "results";
type OptionState = "idle" | "selected" | "correct" | "wrong" | "reveal-correct";

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const set = mcqSets.find((s) => s.id === id);

  if (!set) return notFound();

  return <QuizEngine set={set} />;
}

function QuizEngine({ set }: { set: (typeof mcqSets)[0] }) {
  const total = set.questions.length;

  const [phase, setPhase] = useState<QuizPhase>("in-progress");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(Array(total).fill(null));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [score, setScore] = useState(0);

  // Timer
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (phase === "in-progress") {
      timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const currentQ = set.questions[currentIndex];
  const correct = currentQ.correctOptionIndex;

  function getOptionState(i: number): OptionState {
    if (!submitted) {
      return i === selectedOption ? "selected" : "idle";
    }
    if (i === correct) return "correct";
    if (i === selectedOption && selectedOption !== correct) return "wrong";
    return "idle";
  }

  function handleSelect(i: number) {
    if (submitted) return;
    setSelectedOption(i);
  }

  function handleSubmit() {
    if (selectedOption === null) return;
    setSubmitted(true);
    const updated = [...userAnswers];
    updated[currentIndex] = selectedOption;
    setUserAnswers(updated);
    if (selectedOption === correct) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (currentIndex + 1 >= total) {
      // Go to results
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase("results");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setSubmitted(false);
    }
  }

  const handleReset = useCallback(() => {
    setPhase("in-progress");
    setCurrentIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setUserAnswers(Array(total).fill(null));
    setElapsedSeconds(0);
    setScore(0);
  }, [total]);

  const progress = ((currentIndex + (submitted ? 1 : 0)) / total) * 100;
  const pct = Math.round((score / total) * 100);

  return (
    <div className="pt-16 min-h-screen bg-line-gray-light/20 dark:bg-line-gray-dark/10">
      <AnimatePresence mode="wait">
        {phase === "in-progress" ? (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6"
          >
            {/* ─── HEADER BAR ─── */}
            <div className="flex items-center justify-between">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-xs text-slate dark:text-paper/60 hover:text-ink-navy dark:hover:text-paper transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Exit
              </Link>
              <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-ink-navy dark:text-paper">
                <Clock className="w-4 h-4 text-slate dark:text-paper/50" />
                <span className="tabular-nums">{formatTime(elapsedSeconds)}</span>
              </div>
              <span className="font-mono text-xs text-slate dark:text-paper/50">
                {currentIndex + 1}/{total}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-line-gray-light dark:bg-line-gray-dark rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-signal-emerald rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* Question tracker — dots for ≤15, compact counter for >15 */}
            {total <= 15 ? (
              <div className="flex gap-1.5 flex-wrap">
                {set.questions.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i < currentIndex
                        ? userAnswers[i] === set.questions[i].correctOptionIndex
                          ? "bg-signal-emerald"
                          : "bg-alert-coral"
                        : i === currentIndex
                        ? "bg-ink-navy dark:bg-paper"
                        : "bg-line-gray-light dark:bg-line-gray-dark"
                    }`}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Mini dot row — only show surrounding 5 */}
                <div className="flex gap-1.5">
                  {Array.from({ length: total }).map((_, i) => {
                    const near = Math.abs(i - currentIndex) <= 2;
                    if (!near) return null;
                    return (
                      <div
                        key={i}
                        className={`rounded-full transition-all ${
                          i === currentIndex
                            ? "w-3 h-3 bg-ink-navy dark:bg-paper"
                            : i < currentIndex
                            ? `w-2 h-2 ${userAnswers[i] === set.questions[i].correctOptionIndex ? "bg-signal-emerald" : "bg-alert-coral"}`
                            : "w-2 h-2 bg-line-gray-light dark:bg-line-gray-dark"
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate dark:text-paper/50">
                  <span className="font-mono font-bold text-ink-navy dark:text-paper">{currentIndex + 1}/{total}</span>
                  <span className="text-signal-emerald font-semibold">✓ {score}</span>
                  <span className="text-alert-coral font-semibold">✗ {currentIndex - score - (submitted && selectedOption !== correct ? 0 : 0)}</span>
                </div>
              </div>
            )}

            {/* ─── QUESTION CARD ─── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl overflow-hidden shadow-lg"
              >
                {/* Question */}
                <div className="px-6 pt-6 pb-4">
                  <p className="text-xs font-mono text-signal-emerald uppercase tracking-widest mb-3">
                    Question {currentIndex + 1}
                  </p>
                  <p className="text-base font-medium text-ink-navy dark:text-paper leading-relaxed">
                    {currentQ.questionText}
                  </p>
                </div>

                {/* Options */}
                <div className="px-6 pb-4 space-y-2.5">
                  {currentQ.options.map((opt, i) => (
                    <AnswerRevealOption
                      key={i}
                      label={String.fromCharCode(65 + i)}
                      text={opt}
                      state={getOptionState(i)}
                      onClick={() => handleSelect(i)}
                      disabled={submitted}
                    />
                  ))}
                </div>

                {/* Explanation */}
                <AnimatePresence>
                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mx-6 mb-4 p-4 rounded-xl bg-signal-emerald/5 border border-signal-emerald/20">
                        <p className="text-xs text-slate dark:text-paper/70 leading-relaxed">
                          <span className="font-semibold text-signal-emerald">Explanation: </span>
                          {currentQ.explanation}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action button */}
                <div className="px-6 pb-6">
                  {!submitted ? (
                    <button
                      onClick={handleSubmit}
                      disabled={selectedOption === null}
                      className="w-full py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleNext}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-signal-emerald text-white font-bold rounded-xl hover:bg-signal-emerald/90 transition-colors"
                    >
                      {currentIndex + 1 >= total ? (
                        <>
                          <Trophy className="w-4 h-4" />
                          View Results
                        </>
                      ) : (
                        <>
                          Next Question
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Live score */}
            <div className="flex items-center justify-center gap-3 text-sm text-slate dark:text-paper/50">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-signal-emerald" />
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={score}
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 8, opacity: 0 }}
                    className="font-mono font-bold text-signal-emerald tabular-nums"
                  >
                    {score}
                  </motion.span>
                </AnimatePresence>
                <span>correct</span>
              </span>
              <span className="w-px h-4 bg-line-gray-light dark:bg-line-gray-dark" />
              <span className="flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-alert-coral" />
                <span className="font-mono font-bold text-alert-coral tabular-nums">
                  {currentIndex - score + (submitted && selectedOption !== correct ? 0 : 0)}
                </span>
                <span>wrong</span>
              </span>
            </div>
          </motion.div>
        ) : (
          /* ─── RESULTS VIEW ─── */
          <ResultsView
            set={set}
            score={score}
            userAnswers={userAnswers}
            elapsedSeconds={elapsedSeconds}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function ResultsView({
  set,
  score,
  userAnswers,
  elapsedSeconds,
  onReset,
}: {
  set: (typeof mcqSets)[0];
  score: number;
  userAnswers: (number | null)[];
  elapsedSeconds: number;
  onReset: () => void;
}) {
  const total = set.questions.length;
  const pct = Math.round((score / total) * 100);
  const grade = pct >= 80 ? "Excellent" : pct >= 60 ? "Good" : pct >= 40 ? "Fair" : "Needs Work";
  const gradeColor =
    pct >= 80 ? "text-signal-emerald" : pct >= 60 ? "text-blue-500" : pct >= 40 ? "text-yellow-500" : "text-alert-coral";

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8"
    >
      {/* Score card */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl overflow-hidden shadow-xl"
      >
        <div className={`h-1.5 ${pct >= 60 ? "bg-signal-emerald" : "bg-alert-coral"}`} />
        <div className="p-7 text-center space-y-4">
          <p className="text-xs font-mono text-slate dark:text-paper/50 uppercase tracking-widest">{set.title}</p>

          <div className="space-y-1">
            <div className="flex items-baseline justify-center gap-1">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-mono font-extrabold text-7xl text-ink-navy dark:text-paper tabular-nums"
              >
                {String(score).padStart(2, "0")}
              </motion.span>
              <span className="font-mono text-3xl text-slate dark:text-paper/40">/{total}</span>
            </div>
            <p className={`font-heading font-bold text-xl ${gradeColor}`}>{grade}</p>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-slate dark:text-paper/60">
            <div className="text-center">
              <div className="font-mono font-bold text-lg text-ink-navy dark:text-paper">{pct}%</div>
              <div className="text-xs">Accuracy</div>
            </div>
            <div className="w-px h-8 bg-line-gray-light dark:bg-line-gray-dark" />
            <div className="text-center">
              <div className="font-mono font-bold text-lg text-ink-navy dark:text-paper">
                {formatTime(elapsedSeconds)}
              </div>
              <div className="text-xs">Time taken</div>
            </div>
            <div className="w-px h-8 bg-line-gray-light dark:bg-line-gray-dark" />
            <div className="text-center">
              <div className="font-mono font-bold text-lg text-signal-emerald">{score}</div>
              <div className="text-xs">Correct</div>
            </div>
            <div className="w-px h-8 bg-line-gray-light dark:bg-line-gray-dark" />
            <div className="text-center">
              <div className="font-mono font-bold text-lg text-alert-coral">{total - score}</div>
              <div className="text-xs">Wrong</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onReset}
              className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-ink-navy dark:border-paper text-ink-navy dark:text-paper font-bold rounded-xl hover:bg-ink-navy/5 dark:hover:bg-paper/5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Practice Again
            </button>
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-signal-emerald text-white font-bold rounded-xl hover:bg-signal-emerald/90 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Review breakdown */}
      <div>
        <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper mb-4">
          Question Review
        </h2>
        <div className="space-y-3">
          {set.questions.map((q, i) => (
            <ReviewCard
              key={q.id}
              index={i}
              questionText={q.questionText}
              options={q.options}
              userAnswerIndex={userAnswers[i]}
              correctAnswerIndex={q.correctOptionIndex}
              explanation={q.explanation}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

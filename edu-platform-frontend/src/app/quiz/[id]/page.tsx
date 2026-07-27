"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { AnswerRevealOption, ReviewCard } from "@/components/AnswerReveal";
import { mcqSets, flattenSetQuestions, type MCQSet } from "@/lib/mockData";
import {
  ArrowLeft, ArrowRight, Clock, LayoutDashboard, RotateCcw, Trophy,
  SkipForward, AlertCircle,
} from "lucide-react";

type QuizPhase = "in-progress" | "results";

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const set = mcqSets.find((s) => s.id === id);
  if (!set) return notFound();
  return <QuizEngine set={set} />;
}

// ─── Quiz Engine ──────────────────────────────────────────────────────────
function QuizEngine({ set }: { set: MCQSet }) {
  const flatQuestions = flattenSetQuestions(set);
  const total = flatQuestions.length;

  const [phase, setPhase] = useState<QuizPhase>("in-progress");
  const [currentIndex, setCurrentIndex] = useState(0);

  // userAnswers: null = unanswered/skipped, number = chosen option index
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(Array(total).fill(null));
  const [perQuestionTimes, setPerQuestionTimes] = useState<number[]>(Array(total).fill(0));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showFinishWarning, setShowFinishWarning] = useState(false);

  // Timestamp (performance.now()) when each question was first shown
  const questionShownAt = useRef<number[]>(Array(total).fill(0));

  useEffect(() => {
    questionShownAt.current[0] = window.performance.now();
  }, []);

  useEffect(() => {
    if (!questionShownAt.current[currentIndex]) {
      questionShownAt.current[currentIndex] = window.performance.now();
    }
  }, [currentIndex]);

  // Global test timer — keeps running even while navigating back/forth
  useEffect(() => {
    if (phase !== "in-progress") return;
    const timer = window.setInterval(() => setElapsedSeconds((t) => t + 1), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const currentEntry = flatQuestions[currentIndex];
  const currentQ = currentEntry.question;
  const selectedOption = userAnswers[currentIndex];
  const answeredCount = userAnswers.filter((a) => a !== null).length;
  const skippedCount = total - answeredCount;

  // Select or CHANGE an option — allowed any time during the test
  function selectOption(optionIndex: number, answeredAt: number) {
    const alreadyAnswered = userAnswers[currentIndex] !== null;
    const duration = alreadyAnswered
      ? perQuestionTimes[currentIndex]  // keep original time if changing answer
      : Math.max(1, Math.round((answeredAt - questionShownAt.current[currentIndex]) / 1000));
    setUserAnswers((prev) => prev.map((a, i) => (i === currentIndex ? optionIndex : a)));
    setPerQuestionTimes((prev) => prev.map((t, i) => (i === currentIndex ? duration : t)));
  }

  // Clear answer (unselect) — lets student go back to unanswered state
  function clearAnswer() {
    setUserAnswers((prev) => prev.map((a, i) => (i === currentIndex ? null : a)));
  }

  function goBack() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  function goNext() {
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
  }

  function skipQuestion() {
    // Mark as skipped (null stays) and move forward
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }

  function jumpTo(index: number) {
    setCurrentIndex(index);
  }

  function tryFinish() {
    if (skippedCount > 0) {
      setShowFinishWarning(true);
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    setShowFinishWarning(false);
    setPhase("results");
  }

  const reset = useCallback(() => {
    setPhase("in-progress");
    setCurrentIndex(0);
    setUserAnswers(Array(total).fill(null));
    setPerQuestionTimes(Array(total).fill(0));
    setElapsedSeconds(0);
    setShowFinishWarning(false);
    questionShownAt.current = [window.performance.now(), ...Array(total - 1).fill(0)];
  }, [total]);

  if (phase === "results") {
    const score = userAnswers.reduce<number>(
      (sum, answer, i) => sum + (answer === flatQuestions[i].question.correctOptionIndex ? 1 : 0),
      0
    );
    return (
      <ResultsView
        set={set}
        flatQuestions={flatQuestions}
        score={score}
        userAnswers={userAnswers}
        elapsedSeconds={elapsedSeconds}
        perQuestionTimes={perQuestionTimes}
        onReset={reset}
      />
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-line-gray-light/20 dark:bg-line-gray-dark/10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-5"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link href="/mcq" className="flex items-center gap-1.5 text-xs text-slate dark:text-paper/60 hover:text-ink-navy dark:hover:text-paper transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Exit
          </Link>
          <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-ink-navy dark:text-paper">
            <Clock className="w-4 h-4 text-slate" />
            {formatTime(elapsedSeconds)}
          </div>
          <span className="font-mono text-xs text-slate dark:text-paper/50">
            {answeredCount}/{total} answered
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-line-gray-light dark:bg-line-gray-dark rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-ink-navy dark:bg-paper rounded-full"
            animate={{ width: `${(answeredCount / total) * 100}%` }}
          />
        </div>

        {/* Question tracker dots — neutral colours only during test */}
        <div className="flex gap-1.5 flex-wrap" aria-label="Question navigator">
          {flatQuestions.map((_, index) => (
            <button
              key={index}
              onClick={() => jumpTo(index)}
              title={`Q${index + 1}${userAnswers[index] !== null ? " (answered)" : " (unanswered)"}`}
              className={`w-6 h-6 rounded-md text-[9px] font-bold transition-all ${
                index === currentIndex
                  ? "bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy ring-2 ring-ink-navy/20 dark:ring-paper/20"
                  : userAnswers[index] !== null
                  ? "bg-slate/30 dark:bg-slate/50 text-ink-navy dark:text-paper hover:bg-slate/50"
                  : "bg-line-gray-light dark:bg-line-gray-dark text-slate/50 dark:text-paper/40 hover:bg-line-gray-light/80"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Section label */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate dark:text-paper/40">
          {currentEntry.sectionTitle}
        </p>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl overflow-hidden shadow-lg"
          >
            <div className="px-6 pt-6 pb-4">
              <p className="text-xs font-mono text-slate dark:text-paper/50 uppercase tracking-widest mb-3">
                Question {currentIndex + 1} of {total}
              </p>
              <p className="text-base font-medium text-ink-navy dark:text-paper leading-relaxed">
                {currentQ.text}
              </p>
            </div>

            {/* Options — "selected" = neutral ink-navy highlight, "idle" = default */}
            <div className="px-6 pb-4 space-y-2.5">
              {currentQ.options.map((option, index) => (
                <AnswerRevealOption
                  key={index}
                  label={String.fromCharCode(65 + index)}
                  text={option}
                  state={index === selectedOption ? "selected" : "idle"}
                  onClick={(event) => selectOption(index, event.timeStamp)}
                  disabled={false} // always enabled — student can change their answer
                />
              ))}
            </div>

            {/* Change-answer note + clear button */}
            {selectedOption !== null && (
              <div className="px-6 pb-2 flex items-center gap-2">
                <p className="text-[10px] text-slate dark:text-paper/40 flex-1">
                  Changed your mind? Select a different option above, or clear your answer.
                </p>
                <button
                  onClick={clearAnswer}
                  className="text-[10px] font-semibold text-slate dark:text-paper/50 hover:text-alert-coral transition-colors px-2 py-1 rounded-lg hover:bg-alert-coral/10"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Navigation row */}
            <div className="px-6 pb-6 pt-2 grid grid-cols-3 gap-2">
              {/* Back */}
              <button
                onClick={goBack}
                disabled={currentIndex === 0}
                className="flex items-center justify-center gap-1.5 py-2.5 border border-line-gray-light dark:border-line-gray-dark text-ink-navy dark:text-paper text-xs font-semibold rounded-xl hover:bg-line-gray-light/40 dark:hover:bg-line-gray-dark/40 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              {/* Skip (only shown if unanswered and not last question) */}
              {selectedOption === null && currentIndex < total - 1 ? (
                <button
                  onClick={skipQuestion}
                  className="flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-slate/30 dark:border-paper/20 text-slate dark:text-paper/50 text-xs font-semibold rounded-xl hover:border-slate hover:text-ink-navy dark:hover:text-paper active:scale-[0.98] transition-all"
                >
                  <SkipForward className="w-3.5 h-3.5" /> Skip
                </button>
              ) : (
                <div /> // spacer
              )}

              {/* Next / Finish */}
              {currentIndex < total - 1 ? (
                <button
                  onClick={goNext}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy text-xs font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={tryFinish}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-signal-emerald text-white text-xs font-bold rounded-xl hover:bg-signal-emerald/90 active:scale-[0.98] transition-all"
                >
                  <Trophy className="w-3.5 h-3.5" /> Finish
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-xs text-slate dark:text-paper/40">
          Results and full analysis shown after finishing. You can go back and change any answer.
        </p>
      </motion.div>

      {/* Finish-with-skips warning modal */}
      <AnimatePresence>
        {showFinishWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-navy/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowFinishWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              className="bg-paper dark:bg-ink-navy border border-line-gray-light dark:border-line-gray-dark rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-ink-navy dark:text-paper">
                    {skippedCount} unanswered question{skippedCount !== 1 ? "s" : ""}
                  </h3>
                  <p className="text-xs text-slate dark:text-paper/60 mt-1 leading-relaxed">
                    You have skipped {skippedCount} question{skippedCount !== 1 ? "s" : ""}. Skipped questions count as incorrect. You can go back and answer them, or submit now.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFinishWarning(false)}
                  className="flex-1 py-2.5 text-xs font-semibold border border-line-gray-light dark:border-line-gray-dark text-ink-navy dark:text-paper rounded-xl hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors"
                >
                  Review answers
                </button>
                <button
                  onClick={finishQuiz}
                  className="flex-1 py-2.5 text-xs font-bold bg-signal-emerald text-white rounded-xl hover:bg-signal-emerald/90 transition-colors"
                >
                  Submit anyway
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
function signed(value: number, suffix = "") {
  return `${value > 0 ? "+" : ""}${value}${suffix}`;
}

// ─── Results / Analysis View ──────────────────────────────────────────────
type FlatEntry = ReturnType<typeof flattenSetQuestions>[number];

function ResultsView({
  set, flatQuestions, score, userAnswers, elapsedSeconds, perQuestionTimes, onReset,
}: {
  set: MCQSet;
  flatQuestions: FlatEntry[];
  score: number;
  userAnswers: (number | null)[];
  elapsedSeconds: number;
  perQuestionTimes: number[];
  onReset: () => void;
}) {
  const total = flatQuestions.length;
  const accuracy = Math.round((score / total) * 100);

  const scoreChartData = [{ name: "Score", You: score, Topper: set.topperStats.score }];

  const timeChartData = flatQuestions.map((entry, i) => ({
    question: `Q${i + 1}`,
    You: perQuestionTimes[i],
    Topper: set.topperStats.perQuestionTimes[i] ?? 0,
  }));

  const sectionStats = set.sections.map((section) => {
    const indices = flatQuestions
      .map((e, i) => (e.sectionId === section.id ? i : -1))
      .filter((i) => i >= 0);
    const correct = indices.filter((i) => userAnswers[i] === flatQuestions[i].question.correctOptionIndex).length;
    return {
      section: section.title.replace(/^Section [A-Z] — /, ""),
      fullTitle: section.title,
      Accuracy: indices.length ? Math.round((correct / indices.length) * 100) : 0,
      correct,
      total: indices.length,
    };
  });

  const headline = [
    { label: "Score",           value: `${score}/${total}` },
    { label: "Accuracy",        value: `${accuracy}%` },
    { label: "Time taken",      value: formatTime(elapsedSeconds) },
    { label: "vs topper score", value: signed(score - set.topperStats.score) },
    { label: "vs topper time",  value: signed(elapsedSeconds - set.topperStats.totalTimeSeconds, "s") },
  ];

  return (
    <motion.main
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="pt-16 max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8"
    >
      {/* Headline stats */}
      <section className="bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl p-6 sm:p-8">
        <p className="font-mono text-xs text-slate dark:text-paper/50 uppercase tracking-widest">Complete · {set.title}</p>
        <h1 className="font-heading font-extrabold text-3xl text-ink-navy dark:text-paper mt-2">Your analysis</h1>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
          {headline.map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-line-gray-light/45 dark:bg-ink-navy/30">
              <p className="font-mono font-bold text-xl text-ink-navy dark:text-paper">{value}</p>
              <p className="text-[11px] text-slate dark:text-paper/55 mt-1">{label}</p>
            </div>
          ))}
        </div>
        {/* Disclaimer */}
        <p className="mt-4 text-xs text-slate dark:text-paper/50 italic">
          ⚠ Topper comparisons are seeded mock data for this prototype — not real aggregated student performance.
        </p>
      </section>

      {/* Score comparison + Section accuracy */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Score comparison — You vs Topper">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={scoreChartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} domain={[0, total]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="You"    fill="#16a365" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Topper" fill="#64748b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Section-wise accuracy (%)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sectionStats} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
              <XAxis dataKey="section" tick={{ fontSize: 10 }} interval={0} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value, _name, props) =>
                  [`${value}% (${props.payload.correct}/${props.payload.total})`, "Accuracy"]
                }
                labelFormatter={(label) =>
                  sectionStats.find((s) => s.section === label)?.fullTitle ?? label
                }
              />
              <Bar dataKey="Accuracy" fill="#16a365" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Time per question */}
      <ChartCard title="Time per question (seconds) — You vs Topper">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={timeChartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
            <XAxis dataKey="question" tick={{ fontSize: 9 }} interval={Math.floor(total / 10)} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="You"    fill="#16a365" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Topper" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Full question review — emerald/coral reveal plays here, once */}
      <section>
        <h2 className="font-heading font-bold text-xl text-ink-navy dark:text-paper mb-4">Full question review</h2>
        <div className="space-y-4">
          {flatQuestions.map((entry, index) => (
            <div key={entry.question.id}>
              {(index === 0 || entry.sectionId !== flatQuestions[index - 1].sectionId) && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate dark:text-paper/40 mb-2 mt-4">
                  {entry.sectionTitle}
                </p>
              )}
              <ReviewCard
                index={index}
                questionText={entry.question.text}
                options={entry.question.options}
                userAnswerIndex={userAnswers[index]}
                correctAnswerIndex={entry.question.correctOptionIndex}
                explanation={entry.question.explanation}
                timeTakenSeconds={perQuestionTimes[index]}
              />
            </div>
          ))}
        </div>
      </section>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 pb-4">
        <button
          onClick={onReset}
          className="flex-1 flex justify-center items-center gap-2 py-3 border-2 border-ink-navy dark:border-paper text-ink-navy dark:text-paper font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Practice Again
        </button>
        <Link
          href="/dashboard"
          className="flex-1 flex justify-center items-center gap-2 py-3 bg-signal-emerald text-white font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <LayoutDashboard className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </motion.main>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl p-5">
      <h2 className="font-heading font-bold text-base text-ink-navy dark:text-paper mb-3">{title}</h2>
      {children}
    </section>
  );
}

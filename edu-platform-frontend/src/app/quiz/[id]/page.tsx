"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { AnswerRevealOption, ReviewCard } from "@/components/AnswerReveal";
import {
  ArrowLeft, ArrowRight, Clock, LayoutDashboard, RotateCcw, Trophy,
  SkipForward, AlertCircle,
} from "lucide-react";

// -- Models matching Backend V3 Schema --
export interface Question {
  id: string;
  type: "normal" | "case";
  content: string;
  options: string[];
  correct_option: number;
  explanation?: string;
  marks: number;
  negative_marks: number;
  difficulty: "easy" | "medium" | "hard";
  case_scenario_id?: string;
}

export interface CaseScenario {
  id: string;
  narrative: string;
}

export interface ExamSection {
  id: string;
  title: string;
  questions: Question[];
}

export interface MCQPaper {
  id: string;
  title: string;
  level: string; 
  groupName: string; 
  subjectCode: string; 
  chapterName?: string;
  testType: string; 
  durationMinutes: number;
  passingMarks: number;
  totalMarks: number;
  status: "draft" | "published" | "archived";
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  sections: ExamSection[];
  case_scenarios?: CaseScenario[];
}

type FlatEntry = {
  sectionId: string;
  sectionTitle: string;
  question: Question;
  caseScenario?: CaseScenario;
};

function flattenPaperQuestions(paper: MCQPaper): FlatEntry[] {
  const result: FlatEntry[] = [];
  if (!paper.sections) return result;
  
  for (const sec of paper.sections) {
    if (!sec.questions) continue;
    for (const q of sec.questions) {
      const caseScen = paper.case_scenarios?.find(c => c.id === q.case_scenario_id);
      result.push({
        sectionId: sec.id,
        sectionTitle: sec.title,
        question: q,
        caseScenario: caseScen
      });
    }
  }
  return result;
}

type QuizPhase = "in-progress" | "results";

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [paper, setPaper] = useState<MCQPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [is404, setIs404] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${apiURL}/api/quizzes/${id}`);
        if (res.status === 404) { setIs404(true); return; }
        if (res.ok) {
          const data = await res.json();
          setPaper(data);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  if (is404) return notFound();
  if (loading || !paper) return <div className="pt-24 text-center">Loading quiz engine...</div>;

  return <QuizEngine paper={paper} />;
}

// ─── Quiz Engine ──────────────────────────────────────────────────────────
function QuizEngine({ paper }: { paper: MCQPaper }) {
  const flatQuestions = flattenPaperQuestions(paper);
  const total = flatQuestions.length;

  if (total === 0) {
    return (
      <div className="pt-32 pb-20 text-center max-w-lg mx-auto">
        <h2 className="text-xl font-bold font-heading mb-4 text-ink-navy dark:text-paper">No questions available</h2>
        <p className="text-slate dark:text-paper/60 mb-6">This MCQ paper hasn't been populated with questions yet.</p>
        <Link href="/mcq" className="text-sm font-bold text-signal-emerald hover:underline">
          Go back to MCQ Library
        </Link>
      </div>
    );
  }

  const [phase, setPhase] = useState<QuizPhase>("in-progress");
  const [currentIndex, setCurrentIndex] = useState(0);

  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(Array(total).fill(null));
  const [perQuestionTimes, setPerQuestionTimes] = useState<number[]>(Array(total).fill(0));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showFinishWarning, setShowFinishWarning] = useState(false);

  const [sectionElapsed, setSectionElapsed] = useState<Record<string, number>>(() => {
    const acc: Record<string, number> = {};
    if (paper.sections) {
      for (const sec of paper.sections) acc[sec.id] = 0;
    }
    return acc;
  });

  const questionShownAt = useRef<number[]>(Array(total).fill(0));

  useEffect(() => {
    questionShownAt.current[0] = window.performance.now();
  }, []);

  useEffect(() => {
    if (!questionShownAt.current[currentIndex]) {
      questionShownAt.current[currentIndex] = window.performance.now();
    }
  }, [currentIndex]);

  useEffect(() => {
    if (phase !== "in-progress") return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((t) => t + 1);
      const currentSecId = flatQuestions[currentIndex]?.sectionId;
      if (currentSecId) {
        setSectionElapsed(prev => ({
          ...prev,
          [currentSecId]: (prev[currentSecId] || 0) + 1
        }));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, currentIndex, flatQuestions]);

  const currentEntry = flatQuestions[currentIndex];
  const currentQ = currentEntry.question;
  const currentCase = currentEntry.caseScenario;
  const selectedOption = userAnswers[currentIndex];
  const answeredCount = userAnswers.filter((a) => a !== null).length;
  const skippedCount = total - answeredCount;

  function selectOption(optionIndex: number, answeredAt: number) {
    const alreadyAnswered = userAnswers[currentIndex] !== null;
    const duration = alreadyAnswered
      ? perQuestionTimes[currentIndex]  
      : Math.max(1, Math.round((answeredAt - questionShownAt.current[currentIndex]) / 1000));
    setUserAnswers((prev) => prev.map((a, i) => (i === currentIndex ? optionIndex : a)));
    setPerQuestionTimes((prev) => prev.map((t, i) => (i === currentIndex ? duration : t)));
  }

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
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
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

  async function finishQuiz() {
    setShowFinishWarning(false);
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt");
      const score = userAnswers.reduce<number>(
        (sum, answer, i) => sum + (answer === flatQuestions[i].question.correct_option ? flatQuestions[i].question.marks : (answer !== null ? -(flatQuestions[i].question.negative_marks) : 0)),
        0
      );
      if (token) {
        await fetch(`${apiURL}/api/quizzes/${paper.id}/submit-v2`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            score: score,
            totalQuestions: total,
            totalTimeSeconds: elapsedSeconds,
            perQuestionTimes: perQuestionTimes
          })
        });
      }
    } catch (e) {
      console.warn("Failed to sync quiz attempt", e);
    }
    setPhase("results");
  }

  const reset = useCallback(() => {
    setPhase("in-progress");
    setCurrentIndex(0);
    setUserAnswers(Array(total).fill(null));
    setPerQuestionTimes(Array(total).fill(0));
    setElapsedSeconds(0);
    setSectionElapsed(() => {
      const acc: Record<string, number> = {};
      if (paper.sections) {
        for (const sec of paper.sections) acc[sec.id] = 0;
      }
      return acc;
    });
    setShowFinishWarning(false);
    questionShownAt.current = [window.performance.now(), ...Array(total - 1).fill(0)];
  }, [total, paper.sections]);

  if (phase === "results") {
    const score = userAnswers.reduce<number>(
      (sum, answer, i) => sum + (answer === flatQuestions[i].question.correct_option ? flatQuestions[i].question.marks : (answer !== null ? -(flatQuestions[i].question.negative_marks) : 0)),
      0
    );
    return (
      <ResultsView
        paper={paper}
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
    <div className="pt-16 min-h-screen flex flex-col bg-line-gray-light/20 dark:bg-line-gray-dark/10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 w-full max-w-[1500px] mx-auto px-4 sm:px-6 py-8 flex flex-col"
      >
        <div className="w-full max-w-7xl mx-auto space-y-4 mb-8">
          <div className="flex gap-2 p-1 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-xl overflow-x-auto whitespace-nowrap " style={{ scrollbarWidth: "none" }}>
            {paper.sections?.map(sec => (
              <button
                key={sec.id}
                onClick={() => {
                  const firstIdx = flatQuestions.findIndex(q => q.sectionId === sec.id);
                  if (firstIdx !== -1) jumpTo(firstIdx);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${currentEntry.sectionId === sec.id ? 'bg-signal-emerald text-white shadow-sm' : 'text-slate dark:text-paper/60 hover:bg-line-gray-light/60 dark:hover:bg-line-gray-dark'}`}
              >
                {sec.title}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Link href="/mcq" className="flex items-center gap-1.5 text-xs text-slate dark:text-paper/60 hover:text-ink-navy dark:hover:text-paper transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Exit
            </Link>

            <div className="flex gap-6 sm:gap-8 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark px-6 py-2 rounded-xl shadow-sm">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-slate dark:text-paper/40 uppercase tracking-widest mb-0.5">Total Time</span>
                <div className="flex items-center gap-1.5 font-mono text-base font-extrabold text-ink-navy dark:text-paper">
                  <Clock className="w-3.5 h-3.5 text-signal-emerald" />
                  {formatTime(elapsedSeconds)}
                </div>
              </div>
              <div className="flex flex-col items-center pl-6 sm:pl-8 border-l border-line-gray-light dark:border-line-gray-dark">
                <span className="text-[9px] font-bold text-slate dark:text-paper/40 uppercase tracking-widest mb-0.5">Section Time</span>
                <div className="flex items-center gap-1.5 font-mono text-base font-bold text-ink-navy/80 dark:text-paper/80">
                  <Clock className="w-3.5 h-3.5 text-slate" />
                  {formatTime(sectionElapsed[currentEntry.sectionId] || 0)}
                </div>
              </div>
            </div>

            <span className="font-mono text-xs font-bold bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy px-3 py-1.5 rounded-lg shadow-sm">
              {answeredCount}/{total} <span className="font-sans font-normal opacity-70 ml-1">answered</span>
            </span>
          </div>

          <div className="w-full h-1.5 bg-line-gray-light dark:bg-line-gray-dark rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-signal-emerald rounded-full"
              animate={{ width: `${(answeredCount / total) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start max-w-7xl mx-auto w-full">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate dark:text-paper/40">
              {currentEntry.sectionTitle}
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={`q-${currentIndex}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                className="bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl overflow-hidden shadow-lg p-6 lg:min-h-[400px]"
              >
                {currentCase && (
                  <div className="mb-6 pb-6 border-b border-line-gray-light dark:border-line-gray-dark">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate dark:text-paper/40 mb-3">Case Study / Passage</p>
                    <div className="text-sm text-ink-navy dark:text-paper leading-relaxed whitespace-pre-wrap">
                      {currentCase.narrative}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-mono text-slate dark:text-paper/50 uppercase tracking-widest">
                      Question {currentIndex + 1} of {total}
                    </p>
                    <div className="flex gap-2">
                        <span className="text-[10px] font-bold bg-signal-emerald/10 text-signal-emerald px-2 py-0.5 rounded">
                            +{currentQ.marks} Marks
                        </span>
                        {currentQ.negative_marks > 0 && (
                            <span className="text-[10px] font-bold bg-alert-coral/10 text-alert-coral px-2 py-0.5 rounded">
                                -{currentQ.negative_marks} Marks
                            </span>
                        )}
                    </div>
                  </div>
                  <p className="text-base font-medium text-ink-navy dark:text-paper leading-relaxed whitespace-pre-wrap">
                    {currentQ.content}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4 flex flex-col h-full space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={`opts-${currentIndex}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl overflow-hidden shadow-lg flex flex-col lg:min-h-[400px]"
              >
                <div className="p-6 flex-1 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate dark:text-paper/40 mb-1">Select an Option</p>
                  {currentQ.options.map((option, index) => (
                    <AnswerRevealOption
                      key={index}
                      label={String.fromCharCode(65 + index)}
                      text={option}
                      state={index === selectedOption ? "selected" : "idle"}
                      onClick={(event) => selectOption(index, event.timeStamp)}
                      disabled={false}
                    />
                  ))}
                </div>

                <div className="p-6 pt-0 border-t border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/10 dark:bg-line-gray-dark/10">
                  {selectedOption !== null && (
                    <div className="flex items-center gap-2 mb-4 pt-4">
                      <p className="text-[10px] text-slate dark:text-paper/40 flex-1">
                        Changed your mind?
                      </p>
                      <button
                        onClick={clearAnswer}
                        className="text-[10px] font-semibold text-slate dark:text-paper/50 hover:text-alert-coral transition-colors px-2 py-1 rounded-lg hover:bg-alert-coral/10"
                      >
                        Clear Answer
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <button
                      onClick={goBack}
                      disabled={currentIndex === 0}
                      className="flex items-center justify-center gap-1.5 py-2.5 border border-line-gray-light dark:border-line-gray-dark text-ink-navy dark:text-paper text-xs font-semibold rounded-xl hover:bg-line-gray-light/40 dark:hover:bg-line-gray-dark/40 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>

                    {selectedOption === null && currentIndex < total - 1 ? (
                      <button
                        onClick={skipQuestion}
                        className="flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-slate/30 dark:border-paper/20 text-slate dark:text-paper/50 text-xs font-semibold rounded-xl hover:border-slate hover:text-ink-navy dark:hover:text-paper active:scale-[0.98] transition-all"
                      >
                        <SkipForward className="w-3.5 h-3.5" /> Skip
                      </button>
                    ) : (
                      <div />
                    )}

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
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl p-5 shadow-lg lg:sticky lg:top-24">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate dark:text-paper/40 mb-4">
                Question Navigator
              </p>
              <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2" aria-label="Question navigator">
                {flatQuestions.map((_, index) => {
                  const qSectionId = flatQuestions[index].sectionId;
                  if (qSectionId !== currentEntry.sectionId) return null;

                  return (
                    <button
                      key={index}
                      onClick={() => jumpTo(index)}
                      title={`Q${index + 1}${userAnswers[index] !== null ? " (answered)" : " (unanswered)"}`}
                      className={`aspect-square flex items-center justify-center rounded-lg text-xs font-bold transition-all ${index === currentIndex
                        ? "bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy ring-2 ring-ink-navy/20 dark:ring-paper/20 shadow-sm"
                        : userAnswers[index] !== null
                          ? "bg-signal-emerald/10 text-signal-emerald border border-signal-emerald/20 hover:bg-signal-emerald/20"
                          : "bg-line-gray-light/50 dark:bg-line-gray-dark text-slate/60 dark:text-paper/50 hover:bg-line-gray-light dark:hover:bg-line-gray-dark/80"
                        }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 space-y-2 text-[10px] text-slate dark:text-paper/60">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-signal-emerald/10 border border-signal-emerald/20 block" /> Answered
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-ink-navy dark:bg-paper block" /> Current Status
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-line-gray-light/50 dark:bg-line-gray-dark block" /> Unanswered
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-line-gray-light dark:border-line-gray-dark">
                <p className="text-center text-[10px] text-slate dark:text-paper/40 bg-line-gray-light/30 dark:bg-line-gray-dark/30 p-2 rounded-lg">
                  Submit test anytime. Unanswered questions count as incorrect.
                </p>
              </div>
            </div>
          </div>

        </div>
      </motion.div>

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

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
function signed(value: number, suffix = "") {
  return `${value > 0 ? "+" : ""}${value}${suffix}`;
}

function ResultsView({
  paper, flatQuestions, score, userAnswers, elapsedSeconds, perQuestionTimes, onReset,
}: {
  paper: MCQPaper;
  flatQuestions: FlatEntry[];
  score: number;
  userAnswers: (number | null)[];
  elapsedSeconds: number;
  perQuestionTimes: number[];
  onReset: () => void;
}) {
  const total = flatQuestions.length;
  const accuracy = Math.round((userAnswers.filter((a, i) => a === flatQuestions[i].question.correct_option).length / total) * 100) || 0;

  const topperScore = paper.totalMarks * 0.9;
  const topperTime = paper.durationMinutes * 60 * 0.8;
  const topperTimes = Array(total).fill(45);

  const scoreChartData = [{ name: "Score", You: score, Topper: topperScore }];

  const timeChartData = flatQuestions.map((entry, i) => ({
    question: `Q${i + 1}`,
    You: perQuestionTimes[i],
    Topper: topperTimes[i] ?? 0,
  }));

  const sectionStats = (paper.sections || []).map((section) => {
    const indices = flatQuestions
      .map((e, i) => (e.sectionId === section.id ? i : -1))
      .filter((i) => i >= 0);
    const correct = indices.filter((i) => userAnswers[i] === flatQuestions[i].question.correct_option).length;
    return {
      section: section.title.replace(/^Section [A-Z] — /, ""),
      fullTitle: section.title,
      Accuracy: indices.length ? Math.round((correct / indices.length) * 100) : 0,
      correct,
      total: indices.length,
    };
  });

  const headline = [
    { label: "Score", value: `${score}/${paper.totalMarks}` },
    { label: "Accuracy", value: `${accuracy}%` },
    { label: "Time taken", value: formatTime(elapsedSeconds) },
    { label: "vs topper score", value: signed(score - topperScore) },
    { label: "vs topper time", value: signed(elapsedSeconds - topperTime, "s") },
  ];

  const rawLeaderboard = [
    { name: "Akash Mehta (Topper)", score: topperScore, time: topperTime, isUser: false },
    { name: "You", score: score, time: elapsedSeconds, isUser: true }
  ];

  const sortedLeaderboard = rawLeaderboard.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.time - b.time;
  }).slice(0, 5);

  const RankBadge = ({ rank }: { rank: number }) => {
    const bg =
      rank === 1 ? "bg-amber-100 dark:bg-amber-955/35 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800/40" :
        rank === 2 ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700" :
          rank === 3 ? "bg-orange-100 dark:bg-orange-955/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-850" :
            "bg-line-gray-light/60 dark:bg-line-gray-dark text-slate dark:text-paper/40 border-line-gray-light dark:border-line-gray-dark/50";

    return (
      <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold font-mono ${bg}`}>
        {rank}
      </span>
    );
  };

  return (
    <motion.main
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="pt-16 max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8"
    >
      <section className="bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl p-6 sm:p-8">
        <p className="font-mono text-xs text-slate dark:text-paper/50 uppercase tracking-widest">Complete · {paper.title}</p>
        <h1 className="font-heading font-extrabold text-3xl text-ink-navy dark:text-paper mt-2">Your analysis</h1>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
          {headline.map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-line-gray-light/45 dark:bg-ink-navy/30">
              <p className="font-mono font-bold text-xl text-ink-navy dark:text-paper">{value}</p>
              <p className="text-[11px] text-slate dark:text-paper/55 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Score comparison — You vs Topper">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={scoreChartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} domain={[0, paper.totalMarks]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="You" fill="#16a365" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Topper" fill="#64748b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <section className="bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-base text-ink-navy dark:text-paper flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-500" /> Leaderboard — Top Performers
              </h2>
              <span className="text-[9px] px-2 py-0.5 rounded bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/50 font-bold uppercase tracking-wider">
                Live Rankings
              </span>
            </div>

            <div className="space-y-2">
              {sortedLeaderboard.map((item, idx) => {
                const rank = idx + 1;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${item.isUser
                      ? "bg-signal-emerald/5 dark:bg-signal-emerald/10 border-signal-emerald/30 shadow-sm"
                      : "bg-paper/40 dark:bg-line-gray-dark/10 border-line-gray-light dark:border-line-gray-dark/30"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <RankBadge rank={rank} />
                      <div>
                        <p className={`text-xs font-semibold ${item.isUser ? "text-signal-emerald dark:text-emerald-400 font-bold" : "text-ink-navy dark:text-paper"}`}>
                          {item.name} {item.isUser && "(You)"}
                        </p>
                        <p className="text-[9px] text-slate dark:text-paper/40 font-mono mt-0.5">
                          Time: {formatTime(item.time)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${item.isUser
                        ? "bg-signal-emerald/10 text-signal-emerald dark:text-emerald-400"
                        : "bg-line-gray-light/50 dark:bg-line-gray-dark/60 text-slate dark:text-paper/50"
                        }`}>
                        {item.score} Marks
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Section-wise accuracy (%)">
          <ResponsiveContainer width="100%" height={245}>
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

        <ChartCard title="Time per question (seconds) — You vs Topper">
          <ResponsiveContainer width="100%" height={245}>
            <BarChart data={timeChartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
              <XAxis dataKey="question" tick={{ fontSize: 9 }} interval={Math.floor(total / 10)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="You" fill="#16a365" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Topper" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

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
              {entry.caseScenario && (
                  <div className="bg-slate/5 border-l-2 border-slate/20 p-3 mb-2 rounded-r-lg text-sm italic">
                      {entry.caseScenario.narrative}
                  </div>
              )}
              <ReviewCard
                index={index}
                questionText={entry.question.content}
                options={entry.question.options}
                userAnswerIndex={userAnswers[index]}
                correctAnswerIndex={entry.question.correct_option}
                explanation={entry.question.explanation || ""}
                timeTakenSeconds={perQuestionTimes[index]}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-3 pb-4">
        <button
          onClick={onReset}
          className="flex-1 flex justify-center items-center gap-2 py-3 border-2 border-ink-navy dark:border-paper text-ink-navy dark:text-paper font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Practice Again
        </button>
        <Link
          href="/mcq"
          className="flex-1 flex justify-center items-center gap-2 py-3 bg-signal-emerald text-white font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <LayoutDashboard className="w-4 h-4" /> Back to MCQs
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

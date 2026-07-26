"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter, notFound } from "next/navigation";
import { motion } from "framer-motion";
import { mcqSeries, mcqSets } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Zap, Lock, Unlock, BookOpen, Clock, ArrowRight } from "lucide-react";

export default function SeriesDetailPage({ params }: { params: Promise<{ seriesId: string }> }) {
  const { seriesId } = use(params);
  const series = mcqSeries.find(s => s.id === seriesId);
  
  if (!series) return notFound();

  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const setsInSeries = mcqSets.filter(s => s.seriesId === series.id);
  const totalQuestions = setsInSeries.reduce((sum, set) => sum + set.sections.reduce((sSum, sec) => sSum + sec.questions.length, 0), 0);

  function handleAttempt(set: typeof setsInSeries[0]) {
    if (set.isLocked && !isAuthenticated) {
      router.push("/login");
      return;
    }
    router.push(`/quiz/${set.id}`);
  }

  return (
    <div className="pt-16 pb-20">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-8">
        <Link href="/mcq" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate dark:text-paper/60 hover:text-ink-navy dark:hover:text-paper transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> All Series
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-line-gray-light/60 dark:bg-line-gray-dark/40 text-slate dark:text-paper/80">
              {series.subject}
            </span>
            {!series.isLocked && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-signal-emerald/10 text-signal-emerald">Free Access</span>
            )}
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink-navy dark:text-paper leading-tight tracking-tight">
            {series.title}
          </h1>
          <p className="text-slate dark:text-paper/70 leading-relaxed text-sm max-w-2xl">{series.description}</p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-5 text-xs text-slate dark:text-paper/50 pt-2">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> {setsInSeries.length} MCQ set{setsInSeries.length !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> {totalQuestions}+ total questions
            </span>
            {series.isLocked && (
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> ₹{series.price.toLocaleString()} — one-time payment
              </span>
            )}
          </div>
        </motion.div>

        {/* Sets list */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">Practice Sets in this Series</h2>
          
          {setsInSeries.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-line-gray-light dark:border-line-gray-dark rounded-xl bg-white dark:bg-line-gray-dark/10">
              <p className="text-xs text-slate dark:text-paper/50">No sets available in this series yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {setsInSeries.map((set, i) => {
                const questionCount = set.sections.reduce((sum, sec) => sum + sec.questions.length, 0);
                
                return (
                  <motion.div
                    key={set.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.04, duration: 0.3 }}
                    className="flex flex-col bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark rounded-xl overflow-hidden hover:border-ink-navy dark:hover:border-paper transition-all duration-200 group"
                  >
                    <div className="p-5 flex flex-col flex-1 gap-3.5">
                      {/* Tags */}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-line-gray-light/60 dark:bg-line-gray-dark/40 text-slate dark:text-paper/70">
                          {set.subject}
                        </span>
                        {!set.isLocked ? (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-signal-emerald/10 text-signal-emerald">Free</span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-line-gray-light/60 dark:bg-line-gray-dark/60 text-slate dark:text-paper/70">₹{set.price}</span>
                        )}
                      </div>

                      {/* Title & desc */}
                      <div className="flex-1">
                        <h3 className="font-heading font-bold text-base text-ink-navy dark:text-paper leading-snug group-hover:text-ink-navy/80 dark:group-hover:text-paper/80 transition-colors">
                          {set.title}
                        </h3>
                        <p className="mt-1.5 text-xs text-slate dark:text-paper/60 leading-relaxed line-clamp-2">
                          {set.description}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-[10px] text-slate dark:text-paper/50">
                        <span>{questionCount} questions</span>
                        <span>·</span>
                        <span>{set.sections.length} section{set.sections.length !== 1 ? "s" : ""}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~{Math.round(questionCount * 1.5)}m</span>
                      </div>

                      {/* CTA */}
                      <div className="pt-3 border-t border-line-gray-light dark:border-line-gray-dark">
                        {!set.isLocked ? (
                          <button
                            onClick={() => handleAttempt(set)}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy text-xs font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            Start Free Set
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : isAuthenticated ? (
                          <button
                            onClick={() => handleAttempt(set)}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy text-xs font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            Attempt Set
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAttempt(set)}
                            className="w-full flex items-center justify-center gap-2 py-2 border border-line-gray-light dark:border-line-gray-dark text-ink-navy dark:text-paper hover:bg-line-gray-light/40 dark:hover:bg-line-gray-dark/40 text-xs font-semibold rounded-lg active:scale-[0.98] transition-all"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            Sign in to unlock
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { mcqSeries, mcqSets } from "@/lib/mockData";
import { Search, Zap, Lock, Unlock, BookOpen, ArrowRight } from "lucide-react";

export default function MCQSeriesPage() {
  const [search, setSearch] = useState("");

  const filtered = mcqSeries.filter((series) =>
    series.title.toLowerCase().includes(search.toLowerCase()) ||
    series.subject.toLowerCase().includes(search.toLowerCase()) ||
    series.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-16">
      {/* Header */}
      <section className="py-16 bg-white dark:bg-ink-navy border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-line-gray-light dark:bg-line-gray-dark border border-line-gray-light/60 dark:border-line-gray-dark/60 rounded-full text-xs font-semibold text-slate dark:text-paper/70 mb-4">
              <Zap className="w-3.5 h-3.5" /> MCQ Practice Library
            </div>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-ink-navy dark:text-paper leading-tight tracking-tight">
              MCQ Series
            </h1>
            <p className="mt-3 text-slate dark:text-paper/70 text-base max-w-xl">
              Structured MCQ test series for CA Foundation, Intermediate, and Final. Each series contains multiple practice sets with instant scoring and detailed analysis.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search */}
      <div className="sticky top-16 z-30 bg-paper/95 dark:bg-ink-navy/95 backdrop-blur-md border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/60 dark:text-paper/40" />
            <input
              type="text"
              placeholder="Search MCQ series..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-line-gray-dark/50 border border-line-gray-light dark:border-line-gray-dark rounded-lg text-ink-navy dark:text-paper placeholder-slate/50 dark:placeholder-paper/40 focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-slate dark:text-paper/50">
              <p className="font-heading text-xl">No series match your search.</p>
              <p className="text-sm mt-2">Try a different keyword.</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <p className="text-xs text-slate dark:text-paper/50">
                Showing {filtered.length} of {mcqSeries.length} series
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((series, i) => {
                  const setsInSeries = mcqSets.filter(s => s.seriesId === series.id);
                  const totalQuestions = setsInSeries.reduce((sum, set) => sum + set.sections.reduce((sSum, sec) => sSum + sec.questions.length, 0), 0);
                  
                  return (
                    <motion.div
                      key={series.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.4 }}
                    >
                      <Link href={`/mcq/${series.id}`} className="group block h-full">
                        <div className="h-full flex flex-col bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark rounded-xl overflow-hidden hover:border-ink-navy dark:hover:border-paper transition-all duration-200">
                          <div className="p-6 flex flex-col flex-1 gap-4">
                            {/* Subject & access badge */}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-line-gray-light/60 dark:bg-line-gray-dark/40 text-slate dark:text-paper/80">
                                {series.subject}
                              </span>
                              {!series.isLocked ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-signal-emerald/10 text-signal-emerald">Free</span>
                              ) : (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-line-gray-light/60 dark:bg-line-gray-dark/60 text-slate dark:text-paper/80">
                                  ₹{series.price}
                                </span>
                              )}
                            </div>

                            {/* Title & desc */}
                            <div className="flex-1">
                              <h3 className="font-heading font-bold text-lg text-ink-navy dark:text-paper leading-snug group-hover:text-ink-navy/80 dark:group-hover:text-paper/80 transition-colors">
                                {series.title}
                              </h3>
                              <p className="mt-2 text-xs text-slate dark:text-paper/60 leading-relaxed line-clamp-2">
                                {series.description}
                              </p>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-xs text-slate dark:text-paper/50">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5" />
                                {setsInSeries.length} set{setsInSeries.length !== 1 ? "s" : ""}
                              </span>
                              <span>{totalQuestions}+ questions</span>
                            </div>

                            {/* CTA */}
                            <div className="flex items-center justify-between pt-3 border-t border-line-gray-light dark:border-line-gray-dark">
                              <div>
                                {series.price === 0 ? (
                                  <span className="font-heading font-bold text-sm text-ink-navy dark:text-paper">Free</span>
                                ) : (
                                  <span className="font-heading font-bold text-sm text-ink-navy dark:text-paper">₹{series.price.toLocaleString()}</span>
                                )}
                              </div>
                              <span className="flex items-center gap-1 text-xs font-semibold text-ink-navy dark:text-paper group-hover:gap-1.5 transition-all">
                                {!series.isLocked ? <Unlock className="w-3 h-3 text-slate dark:text-paper/40" /> : <Lock className="w-3 h-3 text-slate dark:text-paper/40" />}
                                View series
                                <ArrowRight className="w-3.5 h-3.5 text-slate dark:text-paper/50 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

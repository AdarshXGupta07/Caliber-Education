"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { mcqSets } from "@/lib/mockData";
import { Search, SlidersHorizontal, Lock, Unlock, Zap, ArrowRight } from "lucide-react";
import { useState } from "react";

const subjects = ["All", "Accounting", "Law", "Costing", "Audit", "Taxation"];

const subjectColors: Record<string, string> = {
  Accounting: "bg-line-gray-light/60 dark:bg-line-gray-dark/40 text-slate dark:text-paper/80",
  Law:        "bg-line-gray-light/60 dark:bg-line-gray-dark/40 text-slate dark:text-paper/80",
  Costing:    "bg-line-gray-light/60 dark:bg-line-gray-dark/40 text-slate dark:text-paper/80",
  Audit:      "bg-line-gray-light/60 dark:bg-line-gray-dark/40 text-slate dark:text-paper/80",
  Taxation:   "bg-line-gray-light/60 dark:bg-line-gray-dark/40 text-slate dark:text-paper/80",
};

export default function PracticePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeSubject, setActiveSubject] = useState("All");

  const filtered = mcqSets.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.subject.toLowerCase().includes(search.toLowerCase());
    const matchSubject = activeSubject === "All" || s.subject === activeSubject;
    return matchSearch && matchSubject;
  });

  function handleAttempt(set: (typeof mcqSets)[0]) {
    if (!set.isFree && !isAuthenticated) {
      router.push("/login");
      return;
    }
    router.push(`/quiz/${set.id}`);
  }

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
              Practice sets
            </h1>
            <p className="mt-3 text-slate dark:text-paper/70 text-base max-w-xl">
              Timed, exam-pattern MCQ sets for CA Foundation, Intermediate, and Final. Free sets need no sign-in.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sticky filters */}
      <div className="sticky top-16 z-30 bg-paper/95 dark:bg-ink-navy/95 backdrop-blur-md border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/60 dark:text-paper/40" />
              <input
                type="text"
                placeholder="Search sets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-line-gray-dark/50 border border-line-gray-light dark:border-line-gray-dark rounded-lg text-ink-navy dark:text-paper placeholder-slate/50 dark:placeholder-paper/40 focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate dark:text-paper/50" />
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSubject(s)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeSubject === s
                      ? "bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy"
                      : "bg-line-gray-light/60 dark:bg-line-gray-dark/60 text-slate dark:text-paper/70 hover:text-ink-navy dark:hover:text-paper"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-slate dark:text-paper/50">
              <p className="font-heading text-xl">No sets match your search.</p>
              <p className="text-sm mt-2">Try a different subject or keyword.</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <p className="text-xs text-slate dark:text-paper/50">
                Showing {filtered.length} of {mcqSets.length} sets
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((set, i) => (
                  <motion.div
                    key={set.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                    className="flex flex-col bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark rounded-xl overflow-hidden hover:border-ink-navy dark:hover:border-paper transition-all duration-200 group"
                  >
                    <div className="p-6 flex flex-col flex-1 gap-4">
                      {/* Tags row */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${subjectColors[set.subject] ?? "bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/60"}`}>
                          {set.subject}
                        </span>
                        {set.isFree ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-line-gray-light/60 dark:bg-line-gray-dark/60 text-slate dark:text-paper/80">Free</span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-line-gray-light/60 dark:bg-line-gray-dark/60 text-slate dark:text-paper/80">
                            ₹{set.price}
                          </span>
                        )}
                      </div>

                      {/* Title & desc */}
                      <div className="flex-1">
                        <h3 className="font-heading font-bold text-base text-ink-navy dark:text-paper leading-snug group-hover:text-ink-navy/80 dark:group-hover:text-paper/80 transition-colors">
                          {set.title}
                        </h3>
                        <p className="mt-2 text-xs text-slate dark:text-paper/60 leading-relaxed line-clamp-2">
                          {set.description}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="text-xs text-slate dark:text-paper/50">
                        {set.questions.length} questions · timed · explanations
                      </div>

                      {/* CTA */}
                      <div className="pt-3 border-t border-line-gray-light dark:border-line-gray-dark">
                        {set.isFree ? (
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
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

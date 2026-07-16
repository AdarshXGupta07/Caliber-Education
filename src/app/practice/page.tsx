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
  Accounting: "bg-signal-emerald/10 text-signal-emerald",
  Law:        "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  Costing:    "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  Audit:      "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  Taxation:   "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500",
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
      <section className="py-16 bg-ink-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-signal-emerald/20 border border-signal-emerald/30 rounded-full text-xs font-semibold text-signal-emerald mb-4">
              <Zap className="w-3.5 h-3.5" /> MCQ Practice Library
            </div>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-paper leading-tight">
              Practice sets
            </h1>
            <p className="mt-3 text-paper/70 text-lg max-w-xl">
              Timed, exam-pattern MCQ sets for CA Foundation, Intermediate, and Final. Free sets need no sign-in.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sticky filters */}
      <div className="sticky top-16 z-30 bg-paper/95 dark:bg-ink-navy/95 backdrop-blur-md border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/60 dark:text-paper/40" />
              <input
                type="text"
                placeholder="Search sets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-line-gray-dark/50 border border-line-gray-light dark:border-line-gray-dark rounded-xl text-ink-navy dark:text-paper placeholder-slate/50 dark:placeholder-paper/40 focus:outline-none focus:border-signal-emerald transition-colors"
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
                      ? "bg-signal-emerald text-white"
                      : "bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/70 hover:bg-signal-emerald/10 hover:text-signal-emerald"
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
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-slate dark:text-paper/50">
              <p className="font-heading text-xl">No sets match your search.</p>
              <p className="text-sm mt-2">Try a different subject or keyword.</p>
            </motion.div>
          ) : (
            <>
              <p className="text-xs text-slate dark:text-paper/50 mb-6">
                Showing {filtered.length} of {mcqSets.length} sets
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((set, i) => (
                  <motion.div
                    key={set.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex flex-col bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl overflow-hidden hover:shadow-lg hover:border-signal-emerald/30 transition-all duration-300 group"
                  >
                    <div className="h-1.5 bg-gradient-to-r from-signal-emerald/60 via-signal-emerald to-signal-emerald/40" />
                    <div className="p-5 flex flex-col flex-1 gap-3">
                      {/* Tags row */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${subjectColors[set.subject] ?? "bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/60"}`}>
                          {set.subject}
                        </span>
                        {set.isFree ? (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-signal-emerald/10 text-signal-emerald">Free</span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/60">
                            ₹{set.price}
                          </span>
                        )}
                      </div>

                      {/* Title & desc */}
                      <div className="flex-1">
                        <h3 className="font-heading font-bold text-base text-ink-navy dark:text-paper leading-snug group-hover:text-signal-emerald transition-colors">
                          {set.title}
                        </h3>
                        <p className="mt-1.5 text-xs text-slate dark:text-paper/60 leading-relaxed line-clamp-2">
                          {set.description}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="text-xs text-slate dark:text-paper/50">
                        {set.questions.length} questions · timed · with explanations
                      </div>

                      {/* CTA */}
                      <div className="pt-2 border-t border-line-gray-light dark:border-line-gray-dark">
                        {set.isFree ? (
                          <button
                            onClick={() => handleAttempt(set)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-signal-emerald text-white text-sm font-bold rounded-xl hover:bg-signal-emerald/90 transition-colors"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            Start Free Set
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : isAuthenticated ? (
                          <button
                            onClick={() => handleAttempt(set)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            Attempt Set
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAttempt(set)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-signal-emerald/40 text-signal-emerald text-sm font-bold rounded-xl hover:bg-signal-emerald/10 transition-colors"
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
            </>
          )}
        </div>
      </section>
    </div>
  );
}

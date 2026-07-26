"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { courses, type Course } from "@/lib/mockData";
import { ArrowRight, Lock, Users, Star, Clock, Zap } from "lucide-react";

// ─── Tab definition — one entry per product, in display order ────────────
type TabId = Course["id"] | "all";

interface ProgramTab {
  id: TabId;
  label: string;
}

const PROGRAM_TABS: ProgramTab[] = [
  { id: "all",                    label: "All Programs" },
  { id: "ca-final-mentorship",    label: "CA Final Mentorship" },
  { id: "ca-final-rankers-program", label: "CA Final Ranker's" },
  { id: "ca-inter-mentorship",    label: "CA Inter Mentorship" },
  { id: "ca-inter-rankers-program", label: "CA Inter Ranker's" },
  { id: "test-series-all-levels", label: "Test Series" },
  { id: "rti-copy-analysis",      label: "RTI Copy Analysis" },
  { id: "one-on-one-session",     label: "1:1 Session" },
  { id: "ca-foundation-mentorship", label: "CA Foundation" },
  { id: "quiz-mcq-practice",      label: "MCQ — All Levels" },
  { id: "ibs-mentorship",         label: "IBS Mentorship" },
  { id: "afm-difficult-questions", label: "AFM Difficult Qs" },
];

const levelColors: Partial<Record<NonNullable<Course["level"]>, string>> = {
  Foundation:   "text-signal-emerald bg-signal-emerald/10",
  Intermediate: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
  Final:        "text-alert-coral bg-alert-coral/10",
  "All Levels": "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
};

export default function ProgramPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const tabBarRef = useRef<HTMLDivElement>(null);

  const displayed = activeTab === "all"
    ? courses
    : courses.filter((c) => c.id === activeTab);

  function selectTab(id: TabId) {
    setActiveTab(id);
    // Scroll the active tab chip into view on narrow screens
    const el = document.getElementById(`tab-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  return (
    <div className="pt-16">
      {/* ─── HEADER ─── */}
      <section className="py-16 bg-white dark:bg-ink-navy border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest">Programs</span>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-ink-navy dark:text-paper mt-2 leading-tight tracking-tight">
              Find your program
            </h1>
            <p className="mt-3 text-slate dark:text-paper/70 text-base max-w-xl">
              Mentorship, test series, and practice tools for CA Foundation, Intermediate &amp; Final. Pick the program that fits where you are.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── SECONDARY TAB BAR ─── */}
      <div className="sticky top-16 z-30 bg-paper/95 dark:bg-ink-navy/95 backdrop-blur-md border-b border-line-gray-light dark:border-line-gray-dark">
        {/* fade-edge wrapper — masks left/right when content overflows */}
        <div className="relative max-w-6xl mx-auto">
          {/* left fade */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-paper/95 dark:from-ink-navy/95 to-transparent z-10" />
          {/* right fade */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-paper/95 dark:from-ink-navy/95 to-transparent z-10" />

          <div
            ref={tabBarRef}
            className="px-6 sm:px-8 py-3 flex gap-1.5 overflow-x-auto no-scrollbar"
          >
            {PROGRAM_TABS.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => selectTab(tab.id)}
                className={`flex-shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy shadow-sm"
                    : "bg-line-gray-light/60 dark:bg-line-gray-dark/60 text-slate dark:text-paper/70 hover:text-ink-navy dark:hover:text-paper hover:bg-line-gray-light dark:hover:bg-line-gray-dark"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── GRID ─── */}
      <section className="py-14">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <p className="text-xs text-slate dark:text-paper/50 mb-8">
            {activeTab === "all"
              ? `${courses.length} programs`
              : `1 program`}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayed.map((course, i) => (
              <ProgramCard key={course.id} course={course} index={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Program Card ─────────────────────────────────────────────────────────
function ProgramCard({ course, index }: { course: Course; index: number }) {
  const isComingSoon = course.status === "coming_soon";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
    >
      <Link href={`/courses/${course.id}`} className="group block h-full">
        <div className="h-full flex flex-col bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark rounded-xl overflow-hidden hover:border-ink-navy dark:hover:border-paper transition-all duration-200">
          <div className="p-6 flex flex-col flex-1 gap-4">

            {/* Top row: level badge + status/tag */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {course.level && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${levelColors[course.level] ?? "bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/60"}`}>
                  {course.level}
                </span>
              )}
              <div className="flex items-center gap-1.5 ml-auto">
                {isComingSoon && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    Coming Soon
                  </span>
                )}
                {!isComingSoon && course.tag && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/60">
                    {course.tag}
                  </span>
                )}
              </div>
            </div>

            {/* Title & desc */}
            <div className="flex-1">
              <h3 className={`font-heading font-bold text-lg text-ink-navy dark:text-paper leading-snug transition-colors ${isComingSoon ? "" : "group-hover:text-ink-navy/80 dark:group-hover:text-paper/80"}`}>
                {course.title}
              </h3>
              <p className="mt-2 text-xs text-slate dark:text-paper/60 leading-relaxed line-clamp-2">
                {course.description}
              </p>
            </div>

            {/* Mentor chips */}
            {course.mentors?.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {course.mentors.map((m) => (
                  <div key={m.name} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-line-gray-light/60 dark:bg-line-gray-dark/40 border border-line-gray-light/30">
                    <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-[7px] font-bold flex-shrink-0`}>
                      {m.initials}
                    </div>
                    <span className="text-[10px] text-slate dark:text-paper/60 font-medium">{m.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-slate dark:text-paper/50">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {course.enrolledCount.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                {course.rating}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {course.duration}
              </span>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-line-gray-light dark:border-line-gray-dark">
              <div>
                {course.price === 0 ? (
                  <span className="font-heading font-bold text-sm text-ink-navy dark:text-paper">Free</span>
                ) : (
                  <span className="font-heading font-bold text-sm text-ink-navy dark:text-paper">
                    ₹{typeof course.price === "number" ? course.price.toLocaleString() : course.price}
                  </span>
                )}
              </div>

              {isComingSoon ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Zap className="w-3 h-3" />
                  Notify me
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-ink-navy dark:text-paper group-hover:gap-1.5 transition-all">
                  {typeof course.price === "number" && course.price > 0 && <Lock className="w-3 h-3 text-slate dark:text-paper/40" />}
                  View details
                  <ArrowRight className="w-3.5 h-3.5 text-slate dark:text-paper/50 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

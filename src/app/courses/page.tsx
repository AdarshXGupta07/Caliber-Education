"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { courses, type Course } from "@/lib/mockData";
import { CourseCard } from "@/components/CourseCard";

const levels: (Course["level"] | "All")[] = ["All", "Foundation", "Intermediate", "Final"];

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [activeLevel, setActiveLevel] = useState<Course["level"] | "All">("All");

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = activeLevel === "All" || c.level === activeLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="pt-16">
      {/* ─── HEADER ─── */}
      <section className="py-16 bg-white dark:bg-ink-navy border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest">Courses</span>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-ink-navy dark:text-paper mt-2 leading-tight tracking-tight">
              Find your course
            </h1>
            <p className="mt-3 text-slate dark:text-paper/70 text-base max-w-xl">
              Structured MCQ practice for CA Foundation, Intermediate & Final. Pay once, practise at your own pace.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── FILTERS ─── */}
      <div className="sticky top-16 z-30 bg-paper/95 dark:bg-ink-navy/95 backdrop-blur-md border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/60 dark:text-paper/40" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-line-gray-dark/50 border border-line-gray-light dark:border-line-gray-dark rounded-lg text-ink-navy dark:text-paper placeholder-slate/50 dark:placeholder-paper/40 focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate dark:text-paper/50" />
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setActiveLevel(level)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeLevel === level
                      ? "bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy"
                      : "bg-line-gray-light/60 dark:bg-line-gray-dark/60 text-slate dark:text-paper/70 hover:bg-ink-navy dark:hover:text-paper"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── GRID ─── */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-slate dark:text-paper/50">
              <p className="font-heading text-xl">No courses match your search.</p>
              <p className="text-sm mt-2">Try adjusting the filter or search term.</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <p className="text-xs text-slate dark:text-paper/50">
                Showing {filtered.length} of {courses.length} courses
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((course, i) => (
                  <CourseCard key={course.id} course={course} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

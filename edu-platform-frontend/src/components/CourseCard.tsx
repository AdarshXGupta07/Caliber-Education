"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users, Star, Lock } from "lucide-react";
import type { Course } from "@/lib/mockData";

interface CourseCardProps {
  course: Course;
  index?: number;
}

const levelColors: Partial<Record<NonNullable<Course["level"]>, string>> = {
  Foundation:   "text-signal-emerald bg-signal-emerald/10",
  Intermediate: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
  Final:        "text-alert-coral bg-alert-coral/10",
  "All Levels": "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
};

export function CourseCard({ course, index = 0 }: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link href={`/courses/${course.id}`} className="group block h-full">
        <div className="h-full flex flex-col bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark rounded-xl overflow-hidden hover:border-ink-navy dark:hover:border-paper transition-all duration-200">
          <div className="p-6 flex flex-col flex-1 gap-4">
            {/* Level & tag */}
            <div className="flex items-center justify-between">
              {course.level && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${levelColors[course.level] ?? "bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/60"}`}>
                  {course.level}
                </span>
              )}
              {course.tag && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/60">
                  {course.tag}
                </span>
              )}
            </div>

            {/* Title & desc */}
            <div className="flex-1">
              <h3 className="font-heading font-bold text-lg text-ink-navy dark:text-paper leading-snug group-hover:text-ink-navy/80 dark:group-hover:text-paper/80 transition-colors">
                {course.title}
              </h3>
              <p className="mt-2 text-xs text-slate dark:text-paper/60 leading-relaxed line-clamp-2">
                {course.description}
              </p>
            </div>

            {/* Mentors chips */}
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
                {course.enrolledCount.toLocaleString()} students
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                {course.rating}
              </span>
              <span>{course.duration}</span>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-line-gray-light dark:border-line-gray-dark">
              <div>
                {course.price === 0 ? (
                  <span className="font-heading font-bold text-sm text-ink-navy dark:text-paper">Free</span>
                ) : (
                  <span className="font-heading font-bold text-sm text-ink-navy dark:text-paper">
                    ₹{course.price.toLocaleString()}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-ink-navy dark:text-paper group-hover:gap-1.5 transition-all">
                {(typeof course.price === "number" && course.price > 0) && <Lock className="w-3 h-3 text-slate dark:text-paper/40" />}
                View details
                <ArrowRight className="w-3.5 h-3.5 text-slate dark:text-paper/50 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

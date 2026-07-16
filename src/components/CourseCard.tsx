"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users, Star, Lock } from "lucide-react";
import type { Course } from "@/lib/mockData";

interface CourseCardProps {
  course: Course;
  index?: number;
}

const levelColors: Record<Course["level"], string> = {
  Foundation:   "text-signal-emerald bg-signal-emerald/10",
  Intermediate: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
  Final:        "text-alert-coral bg-alert-coral/10",
};

export function CourseCard({ course, index = 0 }: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
    >
      <Link href={`/courses/${course.id}`} className="group block h-full">
        <div className="h-full flex flex-col bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl overflow-hidden hover:shadow-lg hover:border-signal-emerald/30 transition-all duration-300">
          <div className="h-1.5 bg-gradient-to-r from-signal-emerald/60 via-signal-emerald to-signal-emerald/40" />
          <div className="p-5 flex flex-col flex-1 gap-3">
            {/* Tags */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${levelColors[course.level]}`}>
                {course.level}
              </span>
              {course.tag && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-ink-navy/5 dark:bg-paper/10 text-ink-navy dark:text-paper">
                  {course.tag}
                </span>
              )}
            </div>

            {/* Title & desc */}
            <div className="flex-1">
              <h3 className="font-heading font-bold text-base text-ink-navy dark:text-paper leading-snug group-hover:text-signal-emerald transition-colors">
                {course.title}
              </h3>
              <p className="mt-1.5 text-xs text-slate dark:text-paper/60 leading-relaxed line-clamp-2">
                {course.description}
              </p>
            </div>

            {/* Mentors chips */}
            {course.mentors?.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {course.mentors.map((m) => (
                  <div key={m.name} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-line-gray-light dark:bg-line-gray-dark">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0`}>
                      {m.initials}
                    </div>
                    <span className="text-xs text-slate dark:text-paper/60 font-medium">{m.name}</span>
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
              <span>{course.duration}</span>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center justify-between pt-2 border-t border-line-gray-light dark:border-line-gray-dark">
              <div>
                {course.price === 0 ? (
                  <span className="font-heading font-bold text-signal-emerald">Free</span>
                ) : (
                  <span className="font-heading font-bold text-ink-navy dark:text-paper">
                    ₹{course.price.toLocaleString()}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-signal-emerald group-hover:gap-2 transition-all">
                {course.price > 0 && <Lock className="w-3 h-3" />}
                View Details
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CheckCircle, Lock, Users, Star, Clock,
  BookOpen, MessageCircle, ChevronDown, ChevronRight, X, Zap,
} from "lucide-react";
import { courses } from "@/lib/mockData";

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const course = courses.find((c) => c.id === id);
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [showModal, setShowModal] = useState(false);

  if (!course) return notFound();

  const levelColor =
    course.level === "Foundation"
      ? "text-signal-emerald bg-signal-emerald/10"
      : course.level === "Final"
      ? "text-alert-coral bg-alert-coral/10"
      : "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400";

  return (
    <div className="pt-16 pb-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm text-slate dark:text-paper/60 hover:text-signal-emerald transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> All Courses
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* ─── MAIN CONTENT ─── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelColor}`}>{course.level}</span>
                {course.tag && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-ink-navy/5 dark:bg-paper/10 text-ink-navy dark:text-paper">{course.tag}</span>
                )}
              </div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink-navy dark:text-paper leading-tight">
                {course.title}
              </h1>
              <p className="mt-3 text-slate dark:text-paper/70 leading-relaxed">{course.description}</p>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-5 mt-4 text-sm text-slate dark:text-paper/60">
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {course.rating} rating
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> {course.enrolledCount.toLocaleString()} students
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {course.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {course.curriculum.reduce((acc, m) => acc + m.topics.length, 0)} topics
                </span>
              </div>

              {/* Mentor chips */}
              {course.mentors?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {course.mentors.map((m) => (
                    <div key={m.name} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/40">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                        {m.initials}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-ink-navy dark:text-paper leading-none">{m.name}</p>
                        <p className="text-[10px] text-slate dark:text-paper/50 mt-0.5">{m.specialty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Outcomes */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl border border-signal-emerald/20 bg-signal-emerald/5">
              <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-signal-emerald" /> What you&apos;ll achieve
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {course.outcomes.map((outcome, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-signal-emerald flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-ink-navy dark:text-paper">{outcome}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mentor bios */}
            {course.mentors?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <h2 className="font-heading font-bold text-xl text-ink-navy dark:text-paper mb-4">
                  {course.mentors.length > 1 ? "Your Mentors" : "Your Mentor"}
                </h2>
                <div className="space-y-4">
                  {course.mentors.map((m) => (
                    <div key={m.name} className="flex items-start gap-4 p-5 rounded-2xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/30">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white font-heading font-bold text-base shadow`}>
                        {m.initials}
                      </div>
                      <div>
                        <p className="font-heading font-bold text-sm text-ink-navy dark:text-paper">{m.name}</p>
                        <p className="text-xs text-signal-emerald font-medium">{m.specialty}</p>
                        <p className="text-xs text-slate dark:text-paper/60 mt-1.5 leading-relaxed">{m.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Curriculum */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <h2 className="font-heading font-bold text-xl text-ink-navy dark:text-paper mb-4">Course Curriculum</h2>
              <div className="space-y-2">
                {course.curriculum.map((module, mi) => (
                  <div key={mi} className="rounded-xl border border-line-gray-light dark:border-line-gray-dark overflow-hidden">
                    <button
                      onClick={() => setOpenModule(openModule === mi ? null : mi)}
                      className="w-full flex items-center justify-between px-5 py-3.5 bg-white dark:bg-line-gray-dark/40 hover:bg-line-gray-light/50 dark:hover:bg-line-gray-dark/60 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-signal-emerald">{String(mi + 1).padStart(2, "0")}</span>
                        <span className="font-semibold text-sm text-ink-navy dark:text-paper">{module.module}</span>
                        <span className="text-xs text-slate dark:text-paper/50">({module.topics.length} topics)</span>
                      </div>
                      {openModule === mi
                        ? <ChevronDown className="w-4 h-4 text-slate dark:text-paper/50" />
                        : <ChevronRight className="w-4 h-4 text-slate dark:text-paper/50" />}
                    </button>
                    <AnimatePresence initial={false}>
                      {openModule === mi && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="px-5 py-3 space-y-2 border-t border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/20 dark:bg-line-gray-dark/20">
                            {module.topics.map((topic, ti) => (
                              <div key={ti} className="flex items-center gap-2.5 text-sm text-slate dark:text-paper/70">
                                <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-slate/50 dark:text-paper/30" />
                                {topic}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ─── STICKY SIDEBAR ─── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl overflow-hidden shadow-xl">
                <div className="h-1.5 bg-gradient-to-r from-signal-emerald/60 via-signal-emerald to-signal-emerald/40" />
                <div className="p-6 space-y-5">
                  <div>
                    {course.price === 0 ? (
                      <span className="font-heading font-extrabold text-4xl text-signal-emerald">Free</span>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="font-heading font-extrabold text-4xl text-ink-navy dark:text-paper">₹{course.price.toLocaleString()}</span>
                        <span className="text-sm text-slate dark:text-paper/50">one-time</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setShowModal(true)}
                    className="w-full py-3.5 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                    {course.price === 0 ? <><Zap className="w-4 h-4" /> Enrol for Free</> : <><Lock className="w-4 h-4" /> Buy Now</>}
                  </button>
                  <div className="space-y-3 pt-2 border-t border-line-gray-light dark:border-line-gray-dark">
                    {[
                      { icon: <MessageCircle className="w-4 h-4" />, label: "WhatsApp group access" },
                      { icon: <Clock className="w-4 h-4" />, label: `${course.duration} program` },
                      { icon: <BookOpen className="w-4 h-4" />, label: "Daily practice sets" },
                      { icon: <Users className="w-4 h-4" />, label: "Join a student batch" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm text-slate dark:text-paper/70">
                        <span className="text-signal-emerald">{item.icon}</span>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── BUY MODAL ─── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-navy/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="bg-paper dark:bg-ink-navy border border-line-gray-light dark:border-line-gray-dark rounded-2xl p-7 max-w-sm w-full shadow-2xl">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">Almost there!</h3>
                  <p className="text-xs text-slate dark:text-paper/60 mt-1">{course.title}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors">
                  <X className="w-4 h-4 text-slate dark:text-paper/60" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-signal-emerald/10 border border-signal-emerald/20">
                  <div className="flex items-center gap-2 text-signal-emerald text-sm font-semibold mb-2">
                    <MessageCircle className="w-4 h-4" /> How payment works
                  </div>
                  <ol className="space-y-1.5 text-xs text-slate dark:text-paper/70 list-decimal list-inside">
                    <li>Pay via UPI / bank transfer to our account details (shown after sign-in).</li>
                    <li>Submit your UTR / transaction ID on the dashboard.</li>
                    <li>Our admin verifies within 24 hours on weekdays.</li>
                    <li>You receive a WhatsApp group invite on <span className="font-semibold text-signal-emerald">your registered email</span>.</li>
                  </ol>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate dark:text-paper/60">Amount due</span>
                  <span className="font-heading font-bold text-ink-navy dark:text-paper">
                    {course.price === 0 ? "Free" : `₹${course.price.toLocaleString()}`}
                  </span>
                </div>
                <Link href="/login" onClick={() => setShowModal(false)}
                  className="block w-full py-3 text-center bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-xl hover:opacity-90 transition-opacity">
                  Sign In to Continue
                </Link>
                <button onClick={() => setShowModal(false)}
                  className="block w-full py-2 text-center text-sm text-slate dark:text-paper/60 hover:text-ink-navy dark:hover:text-paper transition-colors">
                  Maybe later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

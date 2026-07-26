"use client";

import { use, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CheckCircle, Lock, Users, Star, Clock,
  BookOpen, MessageCircle, ChevronDown, ChevronRight, X, Zap, Copy, Check, Bell
} from "lucide-react";
import { courses } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const course = courses.find((c) => c.id === id);
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [showModal, setShowModal] = useState(false);
  const [utr, setUtr] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  const {
    user,
    isAuthenticated,
    verifications,
    purchasedCourseIds,
    submitUTR,
    enrollFreeCourse
  } = useAuth();
  
  const router = useRouter();

  if (!course) return notFound();

  const isPurchased = purchasedCourseIds.includes(course.id);
  const isComingSoon = course.status === "coming_soon";
  const pendingVerification = verifications.find(
    (v) => v.studentEmail.toLowerCase() === user?.email.toLowerCase() &&
           v.courseTitle === course.title &&
           v.status === "pending"
  );
  const isPending = !!pendingVerification;

  const levelColor =
    course.level === "Foundation"
      ? "text-slate-800 bg-line-gray-light dark:bg-line-gray-dark dark:text-paper"
      : course.level === "Final"
      ? "text-alert-coral bg-alert-coral/10"
      : "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400";

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("caliber@upi");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleUtrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr.trim()) return;
    submitUTR(course.id, utr.trim());
    setUtr("");
    setShowModal(false);
    // Redirect to dashboard to see pending status
    router.push("/dashboard");
  };

  const handleInstantDemoPurchase = () => {
    // Directly enrol user (simulating approved payment instantly)
    enrollFreeCourse(course.id);
    setShowModal(false);
    router.push(`/courses/${course.id}/success`);
  };

  return (
    <div className="pt-16 pb-20">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-8">
        <Link href="/courses" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate dark:text-paper/60 hover:text-ink-navy dark:hover:text-paper transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> All Programs
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-12">

          {/* ─── MAIN CONTENT ─── */}
          <div className="lg:col-span-8 space-y-10">

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${levelColor}`}>{course.level}</span>
                {course.tag && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/60">{course.tag}</span>
                )}
              </div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink-navy dark:text-paper leading-tight tracking-tight">
                {course.title}
              </h1>
              <p className="text-slate dark:text-paper/70 leading-relaxed text-sm">{course.description}</p>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-5 text-xs text-slate dark:text-paper/50 pt-2">
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
                <div className="flex flex-wrap gap-2 pt-2">
                  {course.mentors.map((m) => (
                    <div key={m.name} className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0`}>
                        {m.initials}
                      </div>
                      <div className="leading-none">
                        <p className="text-[10px] font-semibold text-ink-navy dark:text-paper">{m.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Outcomes */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="p-6 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 space-y-4">
              <h2 className="font-heading font-bold text-base text-ink-navy dark:text-paper flex items-center gap-2">
                <Zap className="w-4 h-4 text-ink-navy dark:text-paper" /> What you will achieve
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {course.outcomes.map((outcome, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-signal-emerald flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-slate dark:text-paper/85">{outcome}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Curriculum */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper mb-4">Course Curriculum</h2>
              <div className="space-y-2">
                {course.curriculum.map((module, mi) => (
                  <div key={mi} className="rounded-lg border border-line-gray-light dark:border-line-gray-dark overflow-hidden bg-white dark:bg-line-gray-dark/20">
                    <button
                      onClick={() => setOpenModule(openModule === mi ? null : mi)}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-line-gray-light/40 dark:hover:bg-line-gray-dark/30 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-slate dark:text-paper/40">{String(mi + 1).padStart(2, "0")}</span>
                        <span className="font-semibold text-sm text-ink-navy dark:text-paper">{module.module}</span>
                        <span className="text-[10px] text-slate dark:text-paper/40">({module.topics.length} topics)</span>
                      </div>
                      {openModule === mi
                        ? <ChevronDown className="w-4 h-4 text-slate dark:text-paper/50" />
                        : <ChevronRight className="w-4 h-4 text-slate dark:text-paper/50" />}
                    </button>
                    <AnimatePresence initial={false}>
                      {openModule === mi && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                          <div className="px-5 py-4 space-y-2.5 border-t border-line-gray-light dark:border-line-gray-dark bg-paper/30 dark:bg-line-gray-dark/10">
                            {module.topics.map((topic, ti) => (
                              <div key={ti} className="flex items-center gap-2.5 text-xs text-slate dark:text-paper/70">
                                <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-slate/40" />
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

            {/* Mentor bios */}
            {course.mentors?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="space-y-4">
                <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">
                  Your Mentor
                </h2>
                <div className="space-y-4">
                  {course.mentors.map((m) => (
                    <div key={m.name} className="flex items-start gap-4 p-6 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex items-center justify-center text-ink-navy dark:text-paper font-heading font-bold text-sm">
                        {m.initials}
                      </div>
                      <div className="space-y-1">
                        <p className="font-heading font-bold text-sm text-ink-navy dark:text-paper">{m.name}</p>
                        <p className="text-[10px] font-bold text-slate dark:text-paper/40 uppercase">{m.specialty}</p>
                        <p className="text-xs text-slate dark:text-paper/60 leading-relaxed pt-1.5">{m.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ─── STICKY SIDEBAR ─── */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 space-y-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/40">Enrollment Fee</span>
                    <div>
                      {course.price === 0 ? (
                        <span className="font-heading font-extrabold text-3xl text-ink-navy dark:text-paper">Free</span>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="font-heading font-extrabold text-3xl text-ink-navy dark:text-paper">
                            {typeof course.price === "string" ? course.price : `₹${course.price.toLocaleString()}`}
                          </span>
                          {typeof course.price === "number" && (
                            <span className="text-xs text-slate dark:text-paper/40 font-medium">one-time</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dynamic CTA logic */}
                  {isComingSoon ? (
                    <div className="space-y-3">
                      <div className="w-full py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-bold rounded-lg flex items-center justify-center gap-2 text-sm">
                        <Bell className="w-4 h-4" /> Coming Soon
                      </div>
                      <p className="text-[11px] text-slate dark:text-paper/50 text-center leading-relaxed">
                        This program is being prepared. Check back soon — or follow us on WhatsApp for the launch date.
                      </p>
                    </div>
                  ) : isPurchased ? (
                    <Link href={`/courses/${course.id}/success`}
                      className="w-full py-3 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
                      <MessageCircle className="w-4 h-4" /> View WhatsApp Access
                    </Link>
                  ) : isPending ? (
                    <button disabled
                      className="w-full py-3 bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/40 font-semibold rounded-lg flex items-center justify-center gap-2 text-sm cursor-not-allowed">
                      <Clock className="w-4 h-4 animate-pulse" /> Verification Pending
                    </button>
                  ) : course.price === 0 ? (
                    <button onClick={() => { enrollFreeCourse(course.id); router.push(`/courses/${course.id}/success`); }}
                      className="w-full py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm">
                      <Zap className="w-4 h-4" /> Enrol for Free
                    </button>
                  ) : (
                    <button onClick={() => { if (isAuthenticated) { setShowModal(true); } else { router.push("/login"); } }}
                      className="w-full py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm">
                      <Lock className="w-4 h-4" /> Buy Now
                    </button>
                  )}

                  <div className="space-y-3 pt-4 border-t border-line-gray-light dark:border-line-gray-dark">
                    {[
                      { icon: <MessageCircle className="w-4 h-4" />, label: "WhatsApp group access" },
                      { icon: <Clock className="w-4 h-4" />, label: `${course.duration} program` },
                      { icon: <BookOpen className="w-4 h-4" />, label: "Daily practice sets" },
                      { icon: <Users className="w-4 h-4" />, label: "Join a student batch" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-slate dark:text-paper/60">
                        <span className="text-slate dark:text-paper/40">{item.icon}</span>
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
            <motion.div initial={{ scale: 0.96, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 15 }}
              className="bg-paper dark:bg-ink-navy border border-line-gray-light dark:border-line-gray-dark rounded-xl p-6 max-w-sm w-full shadow-lg space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-ink-navy dark:text-paper">Checkout</h3>
                  <p className="text-[10px] font-bold text-slate dark:text-paper/50 mt-0.5">{course.title}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors">
                  <X className="w-4 h-4 text-slate dark:text-paper/60" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/50 block">Payment Details</span>
                  
                  {/* UPI Box */}
                  <div className="flex items-center justify-between p-2.5 rounded border border-dashed border-line-gray-light dark:border-line-gray-dark bg-paper dark:bg-ink-navy text-xs">
                    <span className="font-mono text-ink-navy dark:text-paper select-all">caliber@upi</span>
                    <button onClick={handleCopyUpi} className="p-1 hover:bg-line-gray-light dark:hover:bg-line-gray-dark rounded transition-colors text-slate dark:text-paper/60">
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-signal-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="text-[10px] text-slate dark:text-paper/50 leading-relaxed space-y-1">
                    <p>1. Scan or pay to the UPI ID above using any app (GPay/PhonePe/Paytm).</p>
                    <p>2. Enter your 12-digit UTR/Transaction ID below to submit.</p>
                  </div>
                </div>

                <form onSubmit={handleUtrSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1 block">Transaction ID / UTR</label>
                    <input type="text" placeholder="Enter UTR number" required value={utr} onChange={(e) => setUtr(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors" />
                  </div>
                  <button type="submit" disabled={!utr.trim()}
                    className="w-full py-2 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-xs disabled:opacity-40 disabled:cursor-not-allowed">
                    Submit Verification
                  </button>
                </form>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-line-gray-light dark:border-line-gray-dark"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-slate/30 dark:text-paper/30">OR</span>
                  <div className="flex-grow border-t border-line-gray-light dark:border-line-gray-dark"></div>
                </div>

                {/* Instant Success Button for demo */}
                <div className="space-y-1">
                  <button onClick={handleInstantDemoPurchase}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs active:scale-[0.98]">
                    <Zap className="w-3.5 h-3.5" /> Simulate Instant Success (Demo)
                  </button>
                  <p className="text-[8px] text-center text-slate/40 dark:text-paper/40">Bypasses admin UTR review for evaluation purposes.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

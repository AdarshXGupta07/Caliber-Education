"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { mcqSets, courses } from "@/lib/mockData";
import {
  BookOpen,
  Lock,
  Unlock,
  Zap,
  Star,
  TrendingUp,
  Calendar,
  Shield,
  ArrowRight,
  ChevronRight,
  BarChart2,
  Clock,
  MessageCircle,
  X,
  Copy,
  Check,
  AlertTriangle
} from "lucide-react";

export default function DashboardPage() {
  const { 
    user, 
    isAuthenticated, 
    toggleRole, 
    purchasedCourseIds, 
    verifications 
  } = useAuth();
  
  const router = useRouter();
  
  const [accessCourseId, setAccessCourseId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  const isAdmin = user.role === "admin";

  // Find user's pending course verifications
  const userPendingVerifications = verifications.filter(
    (v) => v.studentEmail.toLowerCase() === user.email.toLowerCase() && v.status === "pending"
  );

  // Find courses that are purchased
  const userPurchasedCourses = courses.filter((c) => purchasedCourseIds.includes(c.id));

  // Find courses that are pending verification
  const userPendingCourses = courses.filter((c) => 
    userPendingVerifications.some((v) => v.courseTitle === c.title)
  );

  const totalMyCourses = userPurchasedCourses.length + userPendingCourses.length;

  const activeAccessCourse = courses.find(c => c.id === accessCourseId);
  const activeWhatsappLink = activeAccessCourse 
    ? `https://chat.whatsapp.com/invite/CA-${activeAccessCourse.id.split("-").slice(1).join("-").toUpperCase()}-2026`
    : "";

  const handleCopyLink = () => {
    if (!activeWhatsappLink) return;
    navigator.clipboard.writeText(activeWhatsappLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="pt-16 pb-20 min-h-screen bg-paper dark:bg-ink-navy/10">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 space-y-10">
        
        {/* ─── GREETING ─── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate dark:text-paper/40">Dashboard</p>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink-navy dark:text-paper leading-none">
                Welcome back 👋
              </h1>
              <p className="text-xs text-slate dark:text-paper/60">
                {user.email}
              </p>
            </div>

            {/* Admin toggle switch */}
            <div className="flex flex-col items-start sm:items-end gap-2">
              <div
                className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all ${
                  isAdmin
                    ? "bg-alert-coral/5 border-alert-coral/25"
                    : "bg-white dark:bg-line-gray-dark/20 border-line-gray-light dark:border-line-gray-dark"
                }`}
              >
                <Shield className={`w-4 h-4 ${isAdmin ? "text-alert-coral" : "text-slate/50"}`} />
                <span className={`text-xs font-semibold ${isAdmin ? "text-alert-coral" : "text-slate dark:text-paper/60"}`}>
                  Admin Mode
                </span>
                <button
                  onClick={toggleRole}
                  className={`relative w-8 h-4 rounded-full transition-colors ${
                    isAdmin ? "bg-alert-coral" : "bg-line-gray-light dark:bg-line-gray-dark"
                  }`}
                  aria-label="Toggle admin mode"
                >
                  <motion.span
                    layout
                    className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-xs"
                    animate={{ left: isAdmin ? "calc(100% - 0.875rem)" : "0.125rem" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 text-[10px] font-bold text-alert-coral uppercase tracking-wider hover:underline"
                >
                  Go to Admin panel <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* ─── STATS CARDS ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <BookOpen className="w-4 h-4" />, label: "Sets Attempted", value: "7" },
            { icon: <Star className="w-4 h-4" />, label: "Avg Score", value: "72%" },
            { icon: <TrendingUp className="w-4 h-4" />, label: "Streak", value: "4 days" },
            { icon: <BarChart2 className="w-4 h-4" />, label: "Best Score", value: "09/10" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark rounded-xl p-5 space-y-3"
            >
              <div className="w-8 h-8 rounded border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex items-center justify-center text-ink-navy dark:text-paper">
                {stat.icon}
              </div>
              <div>
                <div className="font-heading font-extrabold text-2xl text-ink-navy dark:text-paper leading-none">{stat.value}</div>
                <div className="text-[10px] text-slate dark:text-paper/40 font-semibold uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── MY COURSES (NEW) ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between border-b border-line-gray-light dark:border-line-gray-dark pb-2">
            <h2 className="font-heading font-bold text-base text-ink-navy dark:text-paper">My Courses</h2>
            <span className="text-xs text-slate dark:text-paper/45">{totalMyCourses} enrolled</span>
          </div>

          {totalMyCourses === 0 ? (
            <div className="p-8 text-center border border-dashed border-line-gray-light dark:border-line-gray-dark rounded-xl bg-white dark:bg-line-gray-dark/10 space-y-3">
              <p className="text-xs text-slate dark:text-paper/50">You haven't enrolled in any CA prep courses yet.</p>
              <Link href="/courses" className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy text-xs font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all">
                Browse Courses <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Active Purchased Courses */}
              {userPurchasedCourses.map((c) => (
                <div key={c.id} className="p-5 border border-line-gray-light dark:border-line-gray-dark rounded-xl bg-white dark:bg-line-gray-dark/20 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-signal-emerald">Active Access</span>
                    <h3 className="font-heading font-bold text-sm text-ink-navy dark:text-paper">{c.title}</h3>
                    <p className="text-[10px] text-slate dark:text-paper/50">{c.level} · {c.duration}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-line-gray-light/30 dark:border-line-gray-dark/30">
                    <button 
                      onClick={() => setAccessCourseId(c.id)}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1 active:scale-[0.98]"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Access
                    </button>
                    <Link 
                      href={`/courses/${c.id}`}
                      className="px-3 py-1.5 border border-line-gray-light dark:border-line-gray-dark text-slate dark:text-paper/70 hover:text-ink-navy dark:hover:text-paper rounded-lg text-xs font-semibold transition-all text-center"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}

              {/* Pending Courses */}
              {userPendingCourses.map((c) => {
                const verification = userPendingVerifications.find(v => v.courseTitle === c.title);
                return (
                  <div key={c.id} className="p-5 border border-line-gray-light dark:border-line-gray-dark rounded-xl bg-white dark:bg-line-gray-dark/20 flex flex-col justify-between gap-4 opacity-80">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">
                        <Clock className="w-3.5 h-3.5 animate-pulse" /> Verification Pending
                      </div>
                      <h3 className="font-heading font-bold text-sm text-ink-navy dark:text-paper">{c.title}</h3>
                      <p className="text-[10px] text-slate dark:text-paper/40">UTR: {verification?.utrNumber}</p>
                    </div>
                    <div className="pt-2 border-t border-line-gray-light/30 dark:border-line-gray-dark/30 flex items-center justify-between">
                      <span className="text-[10px] text-slate dark:text-paper/40">Submitting on {verification?.date}</span>
                      <Link 
                        href={`/courses/${c.id}`}
                        className="px-3 py-1.5 border border-line-gray-light dark:border-line-gray-dark text-slate dark:text-paper/70 hover:text-ink-navy dark:hover:text-paper rounded-lg text-xs font-semibold transition-all"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ─── TODAY'S SET ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-ink-navy dark:text-paper" />
            <h2 className="font-heading font-bold text-base text-ink-navy dark:text-paper">Today&apos;s Set</h2>
          </div>
          <div className="relative rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 overflow-hidden">
            <div className="relative px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate dark:text-paper/40">Daily Upload · Jul 16</span>
                <h3 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">Accounting Fundamentals</h3>
                <p className="text-xs text-slate dark:text-paper/50">30 questions · ~25 min · Accounting</p>
              </div>
              <Link
                href="/quiz/ca-accounting-free"
                className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-xs"
              >
                Start Now <Zap className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ─── MCQ SET LIBRARY ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-line-gray-light dark:border-line-gray-dark pb-2">
            <h2 className="font-heading font-bold text-base text-ink-navy dark:text-paper">Practice Library</h2>
            <span className="text-xs text-slate dark:text-paper/45">{mcqSets.length} sets</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {mcqSets.map((set, i) => (
              <motion.div
                key={set.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.03, duration: 0.3 }}
                className="flex items-center justify-between p-4 bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark rounded-xl hover:border-ink-navy dark:hover:border-paper transition-all duration-200 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded bg-line-gray-light/60 dark:bg-line-gray-dark/40 border border-line-gray-light/35 text-ink-navy dark:text-paper flex items-center justify-center text-xs font-bold font-mono">
                    {set.subject.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold text-xs text-ink-navy dark:text-paper truncate">{set.title}</p>
                      {!set.isLocked ? (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-line-gray-light/50 dark:bg-line-gray-dark/60 text-slate dark:text-paper/70 flex-shrink-0">
                          Free
                        </span>
                      ) : (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-line-gray-light/50 dark:bg-line-gray-dark/60 text-slate dark:text-paper/70 flex-shrink-0">
                          ₹{set.price}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate dark:text-paper/40">
                      {set.sections.reduce((sum, s) => sum + s.questions.length, 0)} questions · {set.sections.length} sections · {set.subject}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0 pl-3">
                  {!set.isLocked ? (
                    <Link
                      href={`/quiz/${set.id}`}
                      className="flex items-center gap-1 text-xs font-semibold text-ink-navy dark:text-paper hover:underline"
                    >
                      <Unlock className="w-3 h-3 text-slate/50" />
                      Attempt
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ) : (
                    <Link
                      href="/practice"
                      className="flex items-center gap-1 text-xs font-medium text-slate dark:text-paper/40 hover:text-ink-navy dark:hover:text-paper transition-colors"
                    >
                      <Lock className="w-3 h-3 text-slate/30" />
                      Unlock
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── WHATSAPP ACCESS MODAL ─── */}
      <AnimatePresence>
        {accessCourseId && activeAccessCourse && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-navy/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setAccessCourseId(null)}>
            <motion.div initial={{ scale: 0.96, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 15 }}
              className="bg-paper dark:bg-ink-navy border border-line-gray-light dark:border-line-gray-dark rounded-xl p-6 max-w-sm w-full shadow-lg space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-ink-navy dark:text-paper">WhatsApp Access</h3>
                  <p className="text-[10px] font-bold text-slate dark:text-paper/50 mt-0.5">{activeAccessCourse.title}</p>
                </div>
                <button onClick={() => setAccessCourseId(null)} className="p-1 rounded hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors">
                  <X className="w-4 h-4 text-slate dark:text-paper/60" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/50 block">Your Access Link</span>
                  
                  <div className="flex items-center justify-between p-2.5 rounded border border-line-gray-light dark:border-line-gray-dark bg-paper dark:bg-ink-navy text-xs">
                    <span className="font-mono text-slate dark:text-paper/85 overflow-hidden truncate select-all">{activeWhatsappLink}</span>
                    <button onClick={handleCopyLink} className="ml-2 p-1 hover:bg-line-gray-light dark:hover:bg-line-gray-dark rounded transition-colors text-slate dark:text-paper/60 flex-shrink-0">
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-signal-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <a 
                    href={activeWhatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4.5 h-4.5" /> Join WhatsApp Group
                  </a>
                </div>

                <div className="flex gap-2 p-3 rounded bg-amber-500/5 border border-amber-500/15 text-[10px] text-amber-700 dark:text-amber-500 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    This link is tied to your account batch and must not be shared. Sharing links is a direct violation of our terms and will suspend course access.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

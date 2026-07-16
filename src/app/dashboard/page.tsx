"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { mcqSets } from "@/lib/mockData";
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
} from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated, toggleRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  const isAdmin = user.role === "admin";

  return (
    <div className="pt-16 pb-20 min-h-screen bg-line-gray-light/20 dark:bg-line-gray-dark/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* ─── GREETING ─── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-mono text-signal-emerald uppercase tracking-widest">Dashboard</p>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-1">
                Welcome back 👋
              </h1>
              <p className="text-sm text-slate dark:text-paper/60 mt-1">
                {user.email}
              </p>
            </div>

            {/* Admin toggle switch */}
            <div className="flex flex-col items-start sm:items-end gap-2">
              <div
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${
                  isAdmin
                    ? "bg-alert-coral/10 border-alert-coral/30"
                    : "bg-white dark:bg-line-gray-dark/40 border-line-gray-light dark:border-line-gray-dark"
                }`}
              >
                <Shield className={`w-4 h-4 ${isAdmin ? "text-alert-coral" : "text-slate/50"}`} />
                <span className={`text-sm font-semibold ${isAdmin ? "text-alert-coral" : "text-slate dark:text-paper/60"}`}>
                  Admin Mode
                </span>
                {/* Toggle */}
                <button
                  onClick={toggleRole}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    isAdmin ? "bg-alert-coral" : "bg-line-gray-light dark:bg-line-gray-dark"
                  }`}
                  aria-label="Toggle admin mode"
                >
                  <motion.span
                    layout
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
                    animate={{ left: isAdmin ? "calc(100% - 1.125rem)" : "0.125rem" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 text-xs font-semibold text-alert-coral hover:underline"
                >
                  Go to Admin Dashboard <ChevronRight className="w-3 h-3" />
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl p-4 space-y-2"
            >
              <div className="w-8 h-8 rounded-lg bg-signal-emerald/10 flex items-center justify-center text-signal-emerald">
                {stat.icon}
              </div>
              <div className="font-heading font-bold text-xl text-ink-navy dark:text-paper">{stat.value}</div>
              <div className="text-xs text-slate dark:text-paper/50">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ─── TODAY'S SET ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-signal-emerald" />
            <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">Today&apos;s Set</h2>
          </div>
          <div className="relative rounded-2xl bg-gradient-to-r from-signal-emerald to-emerald-700 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "20px 20px",
                }}
              />
            </div>
            <div className="relative px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-white">
                <span className="text-xs font-mono opacity-70 uppercase tracking-widest">Daily Upload · Jul 16</span>
                <h3 className="font-heading font-bold text-xl mt-1">Accounting Fundamentals</h3>
                <p className="text-sm opacity-80 mt-1">30 questions · ~25 min · Accounting</p>
              </div>
              <Link
                href="/quiz/ca-accounting-free"
                className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-signal-emerald font-bold rounded-xl hover:bg-white/95 transition-colors text-sm shadow-lg"
              >
                Start Now <Zap className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ─── MCQ SET LIBRARY ─── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">Practice Library</h2>
            <span className="text-xs text-slate dark:text-paper/50">{mcqSets.length} sets</span>
          </div>

          <div className="space-y-3">
            {mcqSets.map((set, i) => (
              <motion.div
                key={set.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="flex items-center gap-4 p-4 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl hover:border-signal-emerald/30 hover:shadow-sm transition-all group"
              >
                {/* Subject dot */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                    set.subject === "Accounting"
                      ? "bg-signal-emerald/10 text-signal-emerald"
                      : set.subject === "Law"
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : set.subject === "Costing"
                      ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                      : set.subject === "Audit"
                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                      : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500"
                  }`}
                >
                  {set.subject.slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-ink-navy dark:text-paper truncate">{set.title}</p>
                    {set.isFree ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-signal-emerald/10 text-signal-emerald flex-shrink-0">
                        Free
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/60 flex-shrink-0">
                        ₹{set.price}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate dark:text-paper/50 mt-0.5">
                    {set.questions.length} questions · {set.subject}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  {set.isFree ? (
                    <Link
                      href={`/quiz/${set.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-signal-emerald group-hover:gap-2 transition-all"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      Attempt
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href="/practice"
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate dark:text-paper/50 hover:text-ink-navy dark:hover:text-paper transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Unlock
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

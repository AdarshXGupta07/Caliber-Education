"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, CheckCircle, Users, Clock, BookOpen, Smartphone, ArrowRight, Star } from "lucide-react";

const resources = [
  { icon: <BookOpen className="w-4 h-4" />, label: "Chapter-wise MCQ banks", desc: "Organised by CA subject and topic, updated regularly for the 2026 exam cycle." },
  { icon: <Clock className="w-4 h-4" />, label: "Daily practice sets", desc: "10 questions every morning, delivered to your WhatsApp." },
  { icon: <MessageCircle className="w-4 h-4" />, label: "Live doubt clearing", desc: "Ask doubts in the group. Faculty response within 2 hours." },
  { icon: <Star className="w-4 h-4" />, label: "Full-length mock tests", desc: "Timed mocks with auto-scoring and performance breakdown." },
  { icon: <Smartphone className="w-4 h-4" />, label: "PDF formula & section sheets", desc: "One-page revision sheets for every chapter. Shareable." },
  { icon: <Users className="w-4 h-4" />, label: "Peer community", desc: "Connect with 5,400+ fellow aspirants in your batch group." },
];

const forWhom = [
  { ok: true, label: "CA Foundation aspirants (2026 batch)" },
  { ok: true, label: "CA Intermediate & Final aspirants" },
  { ok: true, label: "Students who want structured daily practice" },
  { ok: true, label: "Repeaters looking for focused revision" },
  { ok: false, label: "Students looking for recorded video lectures only" },
  { ok: false, label: "Students who want a full coaching replacement" },
];

const faqs = [
  {
    q: "How does the WhatsApp group access work?",
    a: "After your payment is verified by our admin team (within 24 hours on weekdays), you receive a WhatsApp group invite via the number you registered with. All resources, daily sets, and doubt sessions happen inside this group.",
  },
  {
    q: "Can I access past MCQ sets if I join mid-cycle?",
    a: "Yes. We maintain a shared archive link inside every group with all historical sets, sorted by date and topic.",
  },
  {
    q: "Is the platform mobile-friendly?",
    a: "Entirely. The quiz interface is optimised for 375px screens. Most students practice on their phones.",
  },
  {
    q: "What if I have a doubt at midnight?",
    a: "Post it in the group — Somya or Aditya (or a senior student) typically reply by the next morning. We also do a live voice session twice a week.",
  },
  {
    q: "Can I attempt the free MCQ set without signing up?",
    a: "Yes! The free Accounting set is fully accessible without an account. Sign up only when you're ready to access more.",
  },
];

export default function ProgramPage() {
  return (
    <div className="pt-16">
      {/* ─── HERO ─── */}
      <section className="relative py-24 overflow-hidden bg-white dark:bg-ink-navy border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="relative max-w-4xl mx-auto px-6 sm:px-8 text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-line-gray-light dark:bg-line-gray-dark border border-line-gray-light/60 dark:border-line-gray-dark/60 rounded-full text-xs font-semibold text-slate dark:text-paper/70">
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp-based Learning Model
            </div>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-ink-navy dark:text-paper leading-tight tracking-tight">
              The program that runs on your phone — no extra app required.
            </h1>
            <p className="text-base text-slate dark:text-paper/70 leading-relaxed max-w-2xl mx-auto">
              Caliber&apos;s teaching model is built around WhatsApp because that&apos;s where you already spend time.
              We deliver structured practice directly to your existing workflow.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── WHAT'S INCLUDED ─── */}
      <section className="py-24 bg-paper dark:bg-ink-navy/40 border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest">What&apos;s Included</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-3">
              Everything in your WhatsApp group
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 p-6 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex items-center justify-center text-ink-navy dark:text-paper">
                  {r.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-semibold text-sm text-ink-navy dark:text-paper">{r.label}</h3>
                  <p className="text-xs text-slate dark:text-paper/60 leading-relaxed">{r.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW WHATSAPP MODEL WORKS ─── */}
      <section className="py-24 bg-white dark:bg-ink-navy border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest">The Flow</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-3">
              A typical day on Caliber
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              { time: "07:00 AM", event: "Daily MCQ set dropped in WhatsApp group (10 questions, timed)" },
              { time: "08:00 AM", event: "Answer key + explanations posted — review on Caliber platform" },
              { time: "12:00 PM", event: "Topic-specific mini test on platform (linked in group)" },
              { time: "07:00 PM", event: "Doubt window — post questions in group, faculty responds live" },
              { time: "09:00 PM", event: "Next day&apos;s topic preview shared with chapter summary PDF" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 font-mono text-xs border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/40 dark:bg-line-gray-dark/30 px-3 py-1 rounded mt-0.5 whitespace-nowrap text-slate dark:text-paper/70">
                  {item.time}
                </div>
                <div className="flex-1 py-1 text-sm text-ink-navy dark:text-paper leading-relaxed">
                  {item.event}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHO IT'S FOR ─── */}
      <section className="py-24 bg-paper dark:bg-ink-navy/40 border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest">Who It&apos;s For</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-3">
              Is Caliber right for you?
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {forWhom.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 p-4 rounded-lg border ${
                  item.ok
                    ? "border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20"
                    : "border-line-gray-light dark:border-line-gray-dark opacity-50"
                }`}
              >
                <CheckCircle
                  className={`flex-shrink-0 w-4 h-4 ${item.ok ? "text-signal-emerald" : "text-slate/30 dark:text-paper/30"}`}
                />
                <span className="text-sm text-ink-navy dark:text-paper leading-none">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-24 bg-white dark:bg-ink-navy border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-3xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest">FAQ</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-3">
              Common questions
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20"
              >
                <h3 className="font-heading font-bold text-base text-ink-navy dark:text-paper">{faq.q}</h3>
                <p className="mt-2.5 text-sm text-slate dark:text-paper/60 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-32 bg-paper dark:bg-ink-navy/40">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 text-center space-y-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper leading-tight">
              Ready to start practising?
            </h2>
            <p className="text-slate dark:text-paper/70 leading-relaxed">
              Browse our courses and find your perfect fit. Or try a free set right now — no sign-up needed.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm animate-pulse"
              >
                Browse Courses <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/quiz/ca-accounting-free"
                className="inline-flex items-center gap-2 px-6 py-3 border border-line-gray-light dark:border-line-gray-dark text-ink-navy dark:text-paper hover:bg-line-gray-light/40 dark:hover:bg-line-gray-dark/40 font-semibold rounded-lg active:scale-[0.98] transition-all text-sm"
              >
                Try Free MCQ Set
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

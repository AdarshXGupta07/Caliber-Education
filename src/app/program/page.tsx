"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, CheckCircle, Users, Clock, BookOpen, Smartphone, ArrowRight, Star } from "lucide-react";

const resources = [
  { icon: <BookOpen className="w-4 h-4" />, label: "Chapter-wise MCQ banks", desc: "Organised by subject and topic, updated regularly." },
  { icon: <Clock className="w-4 h-4" />, label: "Daily practice sets", desc: "10 questions every morning, delivered to your WhatsApp." },
  { icon: <MessageCircle className="w-4 h-4" />, label: "Live doubt clearing", desc: "Ask doubts in the group. Faculty response within 2 hours." },
  { icon: <Star className="w-4 h-4" />, label: "Full-length mock tests", desc: "Timed mocks with auto-scoring and performance breakdown." },
  { icon: <Smartphone className="w-4 h-4" />, label: "PDF formula sheets", desc: "One-page revision sheets for every chapter. Shareable." },
  { icon: <Users className="w-4 h-4" />, label: "Peer community", desc: "Connect with 5,400+ fellow aspirants in your batch group." },
];

const forWhom = [
  { ok: true, label: "NEET UG aspirants (2025–26 batch)" },
  { ok: true, label: "JEE Main / Advanced aspirants" },
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
    a: "Yes. We maintain a Google Drive folder linked inside every group with all historical sets, sorted by date and topic.",
  },
  {
    q: "Is the platform mobile-friendly?",
    a: "Entirely. The quiz interface is optimised for 375px screens. Most students practice on their phones.",
  },
  {
    q: "What if I have a doubt at midnight?",
    a: "Post it in the group — Arjun or Riya (or a senior student) typically reply by the next morning. We also do a live voice session twice a week.",
  },
  {
    q: "Can I attempt the free MCQ set without signing up?",
    a: "Yes! The free Biology set is fully accessible without an account. Sign up only when you're ready to access more.",
  },
];

export default function ProgramPage() {
  return (
    <div className="pt-16">
      {/* ─── HERO ─── */}
      <section className="relative py-20 overflow-hidden bg-ink-navy">
        <div className="absolute -top-20 left-0 w-96 h-96 bg-signal-emerald/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-signal-emerald/20 border border-signal-emerald/30 rounded-full text-xs font-semibold text-signal-emerald mb-6">
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp-based Learning Model
            </div>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-paper leading-tight">
              The program that runs on your phone — no extra app required.
            </h1>
            <p className="mt-5 text-lg text-paper/70 leading-relaxed max-w-2xl mx-auto">
              Caliber&apos;s teaching model is built around WhatsApp because that&apos;s where you already spend time.
              We deliver structured practice directly to your existing workflow.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── WHAT'S INCLUDED ─── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-semibold text-signal-emerald uppercase tracking-widest">What&apos;s Included</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-2">
              Everything in your WhatsApp group
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex gap-4 p-5 rounded-2xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/30"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-signal-emerald/10 border border-signal-emerald/20 flex items-center justify-center text-signal-emerald">
                  {r.icon}
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm text-ink-navy dark:text-paper">{r.label}</h3>
                  <p className="text-xs text-slate dark:text-paper/60 mt-0.5 leading-relaxed">{r.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW WHATSAPP MODEL WORKS ─── */}
      <section className="py-20 bg-line-gray-light/30 dark:bg-line-gray-dark/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-semibold text-signal-emerald uppercase tracking-widest">The Flow</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-2">
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
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 font-mono text-xs text-signal-emerald bg-signal-emerald/10 px-3 py-1.5 rounded-lg mt-0.5 border border-signal-emerald/20 whitespace-nowrap">
                  {item.time}
                </div>
                <div className="flex-1 py-1.5 text-sm text-ink-navy dark:text-paper leading-relaxed">
                  {item.event}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHO IT'S FOR ─── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-semibold text-signal-emerald uppercase tracking-widest">Who It&apos;s For</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-2">
              Is Caliber right for you?
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {forWhom.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-4 rounded-xl border ${
                  item.ok
                    ? "border-signal-emerald/30 bg-signal-emerald/5"
                    : "border-line-gray-light dark:border-line-gray-dark opacity-60"
                }`}
              >
                <CheckCircle
                  className={`flex-shrink-0 w-4 h-4 ${item.ok ? "text-signal-emerald" : "text-slate/40"}`}
                />
                <span className="text-sm text-ink-navy dark:text-paper">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 bg-line-gray-light/30 dark:bg-line-gray-dark/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-semibold text-signal-emerald uppercase tracking-widest">FAQ</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-2">
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
                transition={{ delay: i * 0.07 }}
                className="p-5 rounded-2xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/30"
              >
                <h3 className="font-heading font-semibold text-sm text-ink-navy dark:text-paper">{faq.q}</h3>
                <p className="mt-2 text-sm text-slate dark:text-paper/60 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper">
              Ready to start practising?
            </h2>
            <p className="mt-4 text-slate dark:text-paper/70">
              Browse our courses and find your perfect fit. Or try a free set right now — no sign-up needed.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Browse Courses <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/quiz/biology-cells-free"
                className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-signal-emerald text-signal-emerald font-semibold rounded-xl hover:bg-signal-emerald/10 transition-colors"
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

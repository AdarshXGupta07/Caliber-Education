"use client";

import { motion } from "framer-motion";
import { Target, Heart, Lightbulb, MessageCircle, BookOpen, Award } from "lucide-react";

const founders = [
  {
    name: "Somya Deep",
    role: "CA Accounting Specialist",
    initials: "SD",
    bio: "Chartered Accountant (CA). After clearing his exams, Somya realized that standard dropper programs focused too much on passive reading. He specializes in Financial Reporting and Advanced Accounting, helping repeaters build structural confidence in resolving timed exam papers.",
    specialties: ["Financial Reporting", "Advanced Accounting", "Corporate Valuation"],
    quote: "Exam confidence isn't about how many hours you study. It is about how many timed decisions you make under pressure.",
  },
  {
    name: "Aditya Kanal",
    role: "CA Corporate Law & Audit Specialist",
    initials: "AK",
    bio: "Chartered Accountant (CA). Aditya specializes in translating heavy corporate law provisions and auditing standards into active mental retention schemas. His method relies on daily timed testing and live group discussions to lock in high-yielding ICAI exam topics.",
    specialties: ["Business Laws", "Advanced Auditing", "Direct & Indirect Tax"],
    quote: "If you practice without a timer, you're preparing for a homework assignment, not the CA exam.",
  },
];

const values = [
  { icon: <Target className="w-5 h-5" />, title: "Exam-first design", desc: "Every MCQ, every explanation, every timer is built to replicate actual CA exam conditions — not textbook reading." },
  { icon: <Heart className="w-5 h-5" />, title: "Student-centred", desc: "We obsess over the student experience. Mobile-first, no distractions, instant feedback on every question." },
  { icon: <Lightbulb className="w-5 h-5" />, title: "Understand, don't memorise", desc: "Every answer comes with a full explanation. We care about building conceptual clarity, not rote recall." },
  { icon: <MessageCircle className="w-5 h-5" />, title: "Human access", desc: "Our WhatsApp groups give you direct access to Somya and Aditya. Real answers to real doubts, not chatbots." },
];

export default function AboutPage() {
  return (
    <div className="pt-16">
      {/* ─── HERO ─── */}
      <section className="relative py-32 bg-paper dark:bg-ink-navy border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="relative max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest">About Us</span>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-ink-navy dark:text-paper mt-4 leading-tight tracking-tight">
              Two CAs who got tired of watching droppers waste time on passive reading.
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ─── WHY WE BUILT THIS ─── */}
      <section className="py-24 bg-white dark:bg-ink-navy border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-8">
          <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest">Our Mission</span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper">
            Why we built Caliber Education
          </h2>

          <div className="grid sm:grid-cols-3 gap-6 mt-8">
            {[
              { stat: "90%+", label: "Dropper focus", desc: "Our entire resource pipeline is specifically optimized for repeat attempts." },
              { stat: "3 hours", label: "Per exam paper", desc: "CA exams demand mental stamina and quick retrieval under strict time limits." },
              { stat: "1 platform", label: "Focused on MCQs", desc: "Purpose-built for timed MCQ practice with step-by-step rationales, not just key codes." },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="p-6 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20">
                <div className="font-heading font-extrabold text-3xl text-ink-navy dark:text-paper">{item.stat}</div>
                <div className="font-semibold text-xs text-slate dark:text-paper/70 mt-1">{item.label}</div>
                <p className="text-xs text-slate dark:text-paper/60 mt-2 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 space-y-6 text-slate dark:text-paper/70 text-sm leading-relaxed">
            <p>
              Somya and Aditya both cleared the rigorous CA examinations before co-founding Caliber. During their preparation and teaching tenures, they witnessed the same recurring issue: droppers who understood concepts perfectly still struggled to clear their examinations because they had not trained for the actual format.
            </p>
            <p>
              Traditional coaching programs rely heavily on passive lecture hours and massive textbook dumps. But pattern recognition and speed require active timed retrieval. Caliber provides exactly that—a streamlined workspace where every session behaves like a mock exam, complete with immediate explanations to help close knowledge gaps in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FOUNDERS ─── */}
      <section className="py-24 bg-paper dark:bg-ink-navy/40 border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest">The Founders</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-3">Meet the team</h2>
          </motion.div>

          <div className="space-y-8 max-w-4xl mx-auto">
            {founders.map((f, i) => (
              <motion.div key={f.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8 bg-white dark:bg-line-gray-dark/20 rounded-xl border border-line-gray-light dark:border-line-gray-dark">
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex items-center justify-center text-ink-navy dark:text-paper font-heading font-bold text-xl">
                    {f.initials}
                  </div>
                  <div className="text-center">
                    <p className="font-heading font-bold text-sm text-ink-navy dark:text-paper">{f.name}</p>
                    <p className="text-[10px] font-bold text-slate dark:text-paper/50 uppercase mt-0.5">{f.role}</p>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <p className="text-xs text-slate dark:text-paper/70 leading-relaxed">{f.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {f.specialties.map((s) => (
                      <span key={s} className="text-[10px] px-2.5 py-0.5 rounded bg-line-gray-light/60 dark:bg-line-gray-dark/40 text-slate dark:text-paper/60 font-semibold border border-line-gray-light/30">{s}</span>
                    ))}
                  </div>
                  <blockquote className="border-l border-slate-350 dark:border-line-gray-dark pl-4 text-xs italic text-slate dark:text-paper/60">
                    &ldquo;{f.quote}&rdquo;
                  </blockquote>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VALUES ─── */}
      <section className="py-24 bg-white dark:bg-ink-navy border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest">Our Values</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-3">What we stand for</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="flex gap-4 p-6 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex items-center justify-center text-ink-navy dark:text-paper">{v.icon}</div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-ink-navy dark:text-paper">{v.title}</h3>
                  <p className="text-xs text-slate dark:text-paper/60 mt-1.5 leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CREDENTIALS ─── */}
      <section className="py-24 bg-paper dark:bg-ink-navy/40">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: <BookOpen className="w-5 h-5 text-slate dark:text-paper/50" />, stat: "1,200+", label: "MCQs in the library" },
              { icon: <Award className="w-5 h-5 text-slate dark:text-paper/50" />, stat: "5,400+", label: "CA students trained" },
              { icon: <MessageCircle className="w-5 h-5 text-slate dark:text-paper/50" />, stat: "12", label: "WhatsApp groups active" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex flex-col items-center gap-2.5 p-6 border border-line-gray-light dark:border-line-gray-dark rounded-xl bg-white dark:bg-line-gray-dark/20">
                <div className="w-10 h-10 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex items-center justify-center">{item.icon}</div>
                <div className="font-heading font-extrabold text-2xl text-ink-navy dark:text-paper mt-1">{item.stat}</div>
                <div className="text-xs text-slate dark:text-paper/50">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Target, Heart, Lightbulb, MessageCircle, BookOpen, Award } from "lucide-react";

const founders = [
  {
    name: "Somya Deep",
    role: "[Somya's CA subject specialty — placeholder]",
    initials: "SD",
    color: "from-signal-emerald to-emerald-700",
    bio: "[Somya's bio — placeholder. Add your CA qualification, years of teaching experience, the papers you specialise in, and what makes your approach to CA coaching different from standard institute teaching.]",
    specialties: ["[CA paper specialty 1]", "[CA paper specialty 2]", "[CA paper specialty 3]"],
    quote: "[Somya's quote about CA exam preparation — placeholder.]",
  },
  {
    name: "Aditya Kanal",
    role: "[Aditya's CA subject specialty — placeholder]",
    initials: "AK",
    color: "from-blue-500 to-blue-700",
    bio: "[Aditya's bio — placeholder. Add your CA qualification, years of teaching experience, the papers you specialise in, and what makes your approach to CA coaching different from standard institute teaching.]",
    specialties: ["[CA paper specialty 1]", "[CA paper specialty 2]", "[CA paper specialty 3]"],
    quote: "[Aditya's quote about CA exam preparation — placeholder.]",
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
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-ink-navy dark:bg-line-gray-dark/20 pointer-events-none" />
        <div className="absolute -top-20 right-0 w-80 h-80 bg-signal-emerald/10 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="text-xs font-semibold text-signal-emerald uppercase tracking-widest">About Us</span>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-paper mt-3 leading-tight">
              Two CAs who got tired of watching droppers waste time on the wrong kind of practice.
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ─── WHY WE BUILT THIS ─── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
            <span className="text-xs font-semibold text-signal-emerald uppercase tracking-widest">Our Mission</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper leading-snug">
              Why we built Caliber Education
            </h2>

            <div className="grid sm:grid-cols-3 gap-6 mt-8">
              {[
                { stat: "[X]%", label: "of CA droppers", desc: "[Placeholder — add the pass-rate stat or dropper insight Somya & Aditya want to lead with here.]" },
                { stat: "3 hrs", label: "per paper", desc: "CA exams demand stamina, speed, and pattern recognition — not just content knowledge." },
                { stat: "1 platform", label: "is what we built", desc: "Purpose-built for timed MCQ practice with real explanations, not just answer keys." },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/30">
                  <div className="font-heading font-extrabold text-4xl text-signal-emerald">{item.stat}</div>
                  <div className="font-semibold text-sm text-ink-navy dark:text-paper mt-1">{item.label}</div>
                  <p className="text-xs text-slate dark:text-paper/60 mt-2 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 space-y-4 text-slate dark:text-paper/70">
              <p className="text-base leading-relaxed">
                Somya and Aditya both sat the CA exam before building Caliber. They saw the same pattern over and over: students who clearly understood the concepts were still failing — because they hadn&apos;t practised in exam format.
              </p>
              <p className="text-base leading-relaxed">
                Too much passive reading, not enough active recall under time pressure. Caliber was built to fix that — a focused platform where every session feels like a mini exam, with instant, detailed feedback to close the loop fast.
              </p>
              <p className="text-xs text-slate/50 dark:text-paper/30 italic">
                [Somya & Aditya: feel free to replace the above two paragraphs with your own story.]
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOUNDERS ─── */}
      <section className="py-20 bg-line-gray-light/30 dark:bg-line-gray-dark/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-xs font-semibold text-signal-emerald uppercase tracking-widest">The Founders</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-2">Meet the team</h2>
          </motion.div>

          <div className="space-y-10">
            {founders.map((f, i) => (
              <motion.div key={f.name} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8 bg-white dark:bg-line-gray-dark/40 rounded-2xl border border-line-gray-light dark:border-line-gray-dark">
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white font-heading font-bold text-2xl shadow-lg`}>
                    {f.initials}
                  </div>
                  <div className="text-center">
                    <p className="font-heading font-bold text-sm text-ink-navy dark:text-paper">{f.name}</p>
                    <p className="text-xs text-signal-emerald font-medium">{f.role}</p>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <p className="text-sm text-slate dark:text-paper/70 leading-relaxed">{f.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {f.specialties.map((s) => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/70 font-medium">{s}</span>
                    ))}
                  </div>
                  <blockquote className="border-l-2 border-signal-emerald pl-4 text-sm italic text-slate dark:text-paper/60">
                    &ldquo;{f.quote}&rdquo;
                  </blockquote>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VALUES ─── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-xs font-semibold text-signal-emerald uppercase tracking-widest">Our Values</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-2">What we stand for</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex gap-4 p-5 rounded-2xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/30">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-signal-emerald/10 border border-signal-emerald/20 flex items-center justify-center text-signal-emerald">{v.icon}</div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-ink-navy dark:text-paper">{v.title}</h3>
                  <p className="text-xs text-slate dark:text-paper/60 mt-1 leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CREDENTIALS ─── */}
      <section className="py-16 bg-ink-navy">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: <BookOpen className="w-6 h-6" />, stat: "1,200+", label: "MCQs in the library" },
              { icon: <Award className="w-6 h-6" />, stat: "5,400+", label: "CA students trained" },
              { icon: <MessageCircle className="w-6 h-6" />, stat: "12", label: "WhatsApp groups active" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-signal-emerald/20 flex items-center justify-center text-signal-emerald">{item.icon}</div>
                <div className="font-heading font-extrabold text-3xl text-paper">{item.stat}</div>
                <div className="text-sm text-paper/60">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

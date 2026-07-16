"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, MessageCircle, Trophy, ChevronRight, Zap, Users, Star } from "lucide-react";
import { HeroMCQCard } from "@/components/HeroMCQCard";
import { CourseCard } from "@/components/CourseCard";
import { courses } from "@/lib/mockData";
import { useState } from "react";

const steps = [
  { num: "01", icon: <BookOpen className="w-5 h-5" />, title: "Enroll", desc: "Choose a CA course that matches your exam level. Pay once, access forever." },
  { num: "02", icon: <Zap className="w-5 h-5" />, title: "Practice", desc: "Attempt timed MCQ sets daily. Every question mirrors the CA exam pattern." },
  { num: "03", icon: <MessageCircle className="w-5 h-5" />, title: "Get WhatsApp Access", desc: "After enrolment, join our exclusive WhatsApp group for live doubt resolution." },
];

const founders = [
  {
    name: "Somya Deep",
    role: "[Somya's CA subject specialty — placeholder]",
    tagline: "[Somya's short tagline — e.g. years of experience, exam cleared, what makes their teaching unique.]",
    initials: "SD",
    color: "from-signal-emerald to-emerald-700",
  },
  {
    name: "Aditya Kanal",
    role: "[Aditya's CA subject specialty — placeholder]",
    tagline: "[Aditya's short tagline — e.g. years of experience, exam cleared, what makes their teaching unique.]",
    initials: "AK",
    color: "from-blue-500 to-blue-700",
  },
];

export default function HomePage() {
  const previewCourses = courses.slice(0, 3);

  return (
    <div className="pt-16">
      {/* ─── HERO ─── */}
      <section className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        </div>
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-signal-emerald/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-signal-emerald/10 border border-signal-emerald/20 rounded-full text-xs font-semibold text-signal-emerald">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-emerald animate-pulse" />
                CA Foundation · Inter · Final — Dropper Prep 2026
              </div>
              <div className="space-y-4">
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink-navy dark:text-paper leading-[1.1] tracking-tight">
                  Practice like <span className="text-signal-emerald">the exam</span>,{" "}
                  <br className="hidden sm:block" />
                  not like a textbook.
                </h1>
                <p className="text-lg text-slate dark:text-paper/70 leading-relaxed max-w-md">
                  Timed MCQ sets that replicate real CA exam conditions. Built for droppers and serious repeaters who want results, not just notes.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-ink-navy/20">
                  Browse Courses <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/practice" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-signal-emerald text-signal-emerald font-semibold rounded-xl hover:bg-signal-emerald/10 transition-colors">
                  <Zap className="w-4 h-4" /> Try Free MCQ Set
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-2">
                {[
                  { val: "5,400+", label: "Students enrolled" },
                  { val: "4.8★", label: "Average rating" },
                  { val: "1,200+", label: "MCQs in library" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="font-heading font-bold text-2xl text-ink-navy dark:text-paper">{s.val}</div>
                    <div className="text-xs text-slate dark:text-paper/50">{s.label}</div>
                    {i < 2 && <div className="hidden" />}
                  </div>
                )).reduce((acc: React.ReactNode[], el, i) => [
                  ...acc,
                  el,
                  i < 2 ? <div key={`sep-${i}`} className="w-px h-10 bg-line-gray-light dark:bg-line-gray-dark" /> : null,
                ], [])}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }} className="flex justify-center lg:justify-end">
              <HeroMCQCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 bg-ink-navy dark:bg-line-gray-dark/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-xs font-semibold text-signal-emerald uppercase tracking-widest">How It Works</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-paper mt-2">Three steps to exam confidence</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-signal-emerald/20 border border-signal-emerald/30 flex items-center justify-center text-signal-emerald">{step.icon}</div>
                <div>
                  <span className="font-mono text-xs text-signal-emerald/60">{step.num}</span>
                  <h3 className="font-heading font-bold text-xl text-paper mt-1">{step.title}</h3>
                  <p className="text-sm text-paper/60 leading-relaxed mt-2 max-w-xs mx-auto">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOUNDERS' TEASER ─── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-xs font-semibold text-signal-emerald uppercase tracking-widest">The Team</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-2">Built by CAs who sat the exam themselves</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {founders.map((f, i) => (
              <motion.div key={f.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link href="/about" className="group block">
                  <div className="flex items-start gap-4 p-5 rounded-2xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/30 hover:border-signal-emerald/30 hover:shadow-md transition-all duration-300">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white font-heading font-bold text-lg`}>{f.initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading font-bold text-base text-ink-navy dark:text-paper">{f.name}</h3>
                        <ChevronRight className="w-4 h-4 text-slate/40 group-hover:text-signal-emerald group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <span className="text-xs font-semibold text-signal-emerald">{f.role}</span>
                      <p className="text-xs text-slate dark:text-paper/60 mt-1.5 leading-relaxed">{f.tagline}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/about" className="inline-flex items-center gap-1.5 text-sm font-semibold text-signal-emerald hover:gap-2.5 transition-all">
              Read our full story <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── COURSE PREVIEW ─── */}
      <section className="py-24 bg-line-gray-light/30 dark:bg-line-gray-dark/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-semibold text-signal-emerald uppercase tracking-widest">Courses</span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-2">Start with what matters</h2>
            </div>
            <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm font-semibold text-signal-emerald hover:gap-2.5 transition-all flex-shrink-0">
              All courses <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {previewCourses.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FREE PRACTICE CTA ─── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative rounded-3xl bg-signal-emerald overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
            </div>
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            <div className="relative px-8 py-14 text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-white text-xs font-semibold mb-6">
                <Trophy className="w-3.5 h-3.5" /> No credit card required
              </div>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white leading-tight">
                Try a full MCQ set — completely free
              </h2>
              <p className="mt-4 text-white/80 leading-relaxed">
                30 real CA exam-pattern Accounting questions. Full explanations. The same experience our paid students get.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Link href="/quiz/ca-accounting-free" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-signal-emerald font-bold rounded-xl hover:bg-white/95 transition-colors shadow-lg">
                  Start Free Practice <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">
                  <Users className="w-4 h-4" /> Sign Up Free
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  );
}

function Footer() {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <footer className="bg-ink-navy text-paper border-t border-line-gray-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-signal-emerald rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-lg">Caliber Education</span>
            </div>
            <p className="text-sm text-paper/60 leading-relaxed">Practice like the exam. Built by CAs who cracked it.</p>
            <p className="text-xs text-paper/40">Founded by Somya Deep & Aditya Kanal</p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm text-paper/80 mb-4 uppercase tracking-wide">Platform</h4>
            <ul className="space-y-2">
              {[
                { href: "/courses", label: "All Courses" },
                { href: "/practice", label: "Free MCQ Practice" },
                { href: "/program", label: "Program Details" },
                { href: "/dashboard", label: "Dashboard" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-paper/60 hover:text-paper transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm text-paper/80 mb-4 uppercase tracking-wide">Company</h4>
            <ul className="space-y-2">
              {[
                { href: "/about", label: "About Us" },
                { href: "/login", label: "Sign In" },
                { href: "/signup", label: "Sign Up" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-paper/60 hover:text-paper transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm text-paper/80 mb-4 uppercase tracking-wide">Contact Us</h4>
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-sm text-signal-emerald">
                <Star className="w-4 h-4 fill-signal-emerald" />
                Message received! We&apos;ll reply within 24 hours.
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <input type="text" placeholder="Your name" required value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-line-gray-dark/60 border border-line-gray-dark text-paper placeholder-paper/40 rounded-lg focus:outline-none focus:border-signal-emerald transition-colors" />
                <input type="email" placeholder="Email address" required value={formState.email} onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-line-gray-dark/60 border border-line-gray-dark text-paper placeholder-paper/40 rounded-lg focus:outline-none focus:border-signal-emerald transition-colors" />
                <textarea placeholder="Your message" required rows={3} value={formState.message} onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-line-gray-dark/60 border border-line-gray-dark text-paper placeholder-paper/40 rounded-lg focus:outline-none focus:border-signal-emerald transition-colors resize-none" />
                <button type="submit" className="w-full py-2 text-xs font-semibold bg-signal-emerald text-white rounded-lg hover:bg-signal-emerald/90 transition-colors">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-line-gray-dark flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-paper/40">
          <span>© 2026 Caliber Education. All rights reserved.</span>
          <span>Made with ♥ for CA droppers & repeaters</span>
        </div>
      </div>
    </footer>
  );
}

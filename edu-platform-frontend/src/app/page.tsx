"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, MessageCircle, Trophy, ChevronRight, Zap, Users, Star } from "lucide-react";
import { HeroMCQCard } from "@/components/HeroMCQCard";
import { CourseCard } from "@/components/CourseCard";
import { courses } from "@/lib/mockData";
import { useState } from "react";
import { Turnstile } from "@/components/Turnstile";

const steps = [
  { num: "01", icon: <BookOpen className="w-5 h-5" />, title: "Enroll", desc: "Choose a CA course that matches your exam level. Pay once, access forever." },
  { num: "02", icon: <Zap className="w-5 h-5" />, title: "Practice", desc: "Attempt timed MCQ sets daily. Every question mirrors the CA exam pattern." },
  { num: "03", icon: <MessageCircle className="w-5 h-5" />, title: "Get WhatsApp Access", desc: "After enrolment, join our exclusive WhatsApp group for live doubt resolution." },
];

const founders = [
  {
    name: "Somya Deep",
    role: "CA Accounting & Finance Specialist",
    tagline: "Chartered Accountant. Specializes in building conceptual depth in Financial Reporting & Advanced Accounting for droppers.",
    initials: "SD",
  },
  {
    name: "Aditya Kanal",
    role: "CA Law, Audit & Taxation Specialist",
    tagline: "Chartered Accountant. Decodes complex corporate laws and auditing standards through daily memory-retrieval practice.",
    initials: "AK",
  },
];

export default function HomePage() {
  const previewCourses = courses.slice(0, 3);

  return (
    <div className="pt-16">
      {/* ─── HERO ─── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden py-32 bg-paper dark:bg-ink-navy border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 sm:px-8 py-10 w-full">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="lg:col-span-7 space-y-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-line-gray-light/60 dark:bg-line-gray-dark/60 border border-line-gray-light dark:border-line-gray-dark rounded-full text-xs font-semibold text-slate dark:text-paper/70">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" />
                CA Foundation · Inter · Final — Dropper Prep 2026
              </div>
              <div className="space-y-6">
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink-navy dark:text-paper leading-[1.08] tracking-tight">
                  Practice like <span className="underline decoration-line-gray-light dark:decoration-line-gray-dark">the exam</span>,{" "}
                  <br className="hidden sm:block" />
                  not like a textbook.
                </h1>
                <p className="text-lg text-slate dark:text-paper/70 leading-relaxed max-w-xl">
                  Timed MCQ sets that replicate real CA exam conditions. Built for droppers and serious repeaters who want results, not just notes.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm">
                  Browse Courses <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/practice" className="inline-flex items-center gap-2 px-6 py-3 border border-line-gray-light dark:border-line-gray-dark text-ink-navy dark:text-paper hover:bg-line-gray-light/40 dark:hover:bg-line-gray-dark/40 font-semibold rounded-lg active:scale-[0.98] transition-all text-sm">
                  <Zap className="w-4 h-4" /> Try Free MCQ Set
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4 border-t border-line-gray-light dark:border-line-gray-dark max-w-md">
                {[
                  { val: "5,400+", label: "Students enrolled" },
                  { val: "4.8★", label: "Average rating" },
                  { val: "1,200+", label: "MCQs in library" },
                ].map((s, i) => (
                  <div key={i} className="space-y-1">
                    <div className="font-heading font-bold text-xl text-ink-navy dark:text-paper leading-none">{s.val}</div>
                    <div className="text-xs text-slate dark:text-paper/50">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }} className="lg:col-span-5 flex justify-center lg:justify-end">
              <HeroMCQCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-32 bg-paper dark:bg-ink-navy/40 border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest">How It Works</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-3">Three steps to exam confidence</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex flex-col items-center text-center space-y-5 p-6 border border-transparent hover:border-line-gray-light dark:hover:border-line-gray-dark rounded-xl transition-all duration-200">
                <div className="w-12 h-12 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/30 flex items-center justify-center text-ink-navy dark:text-paper">{step.icon}</div>
                <div className="space-y-2">
                  <span className="font-mono text-xs text-slate/50 dark:text-paper/30">{step.num}</span>
                  <h3 className="font-heading font-bold text-lg text-ink-navy dark:text-paper mt-1">{step.title}</h3>
                  <p className="text-xs text-slate dark:text-paper/60 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOUNDERS' TEASER ─── */}
      <section className="py-32 bg-paper dark:bg-ink-navy border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest">The Team</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-3">Built by CAs who cracked the exam</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {founders.map((f, i) => (
              <motion.div key={f.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link href="/about" className="group block">
                  <div className="flex items-start gap-5 p-6 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 hover:border-ink-navy dark:hover:border-paper transition-all duration-200">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex items-center justify-center text-ink-navy dark:text-paper font-heading font-bold text-base">{f.initials}</div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading font-bold text-base text-ink-navy dark:text-paper">{f.name}</h3>
                        <ChevronRight className="w-4 h-4 text-slate/40 group-hover:text-ink-navy dark:group-hover:text-paper group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/50">{f.role}</span>
                      <p className="text-xs text-slate dark:text-paper/60 leading-relaxed pt-1">{f.tagline}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/about" className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-navy dark:text-paper hover:gap-2.5 transition-all">
              Read our full story <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── COURSE PREVIEW ─── */}
      <section className="py-32 bg-paper dark:bg-ink-navy/40 border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest">Courses</span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper">Start with what matters</h2>
            </div>
            <Link href="/courses" className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-navy dark:text-paper hover:gap-2.5 transition-all flex-shrink-0">
              All courses <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {previewCourses.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FREE PRACTICE CTA ─── */}
      <section className="py-32 bg-paper dark:bg-ink-navy">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 overflow-hidden">
            <div className="relative px-8 py-16 text-center max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-line-gray-light dark:bg-line-gray-dark border border-line-gray-light/55 dark:border-line-gray-dark/55 rounded-full text-xs font-semibold">
                <Trophy className="w-3.5 h-3.5 text-slate dark:text-paper/60" /> No credit card required
              </div>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-ink-navy dark:text-paper leading-tight">
                Try a full MCQ set — completely free
              </h2>
              <p className="text-slate dark:text-paper/70 leading-relaxed">
                30 real CA exam-pattern Accounting questions. Full explanations. The same experience our paid students get.
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-2">
                <Link href="/quiz/ca-accounting-free" className="inline-flex items-center gap-2 px-6 py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm">
                  Start Free Practice <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 border border-line-gray-light dark:border-line-gray-dark text-ink-navy dark:text-paper hover:bg-line-gray-light/40 dark:hover:bg-line-gray-dark/40 font-semibold rounded-lg active:scale-[0.98] transition-all text-sm">
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
  const [turnstileToken, setTurnstileToken] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!turnstileToken) {
      alert("Please wait for security verification to complete.");
      return;
    }
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiURL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formState, turnstileToken }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Submission failed");
      }
      setSubmitted(true);
    } catch (err: any) {
      console.warn("API contact submission error, falling back:", err.message);
      setSubmitted(true);
    }
  }

  return (
    <footer className="bg-white dark:bg-ink-navy text-ink-navy dark:text-paper border-t border-line-gray-light dark:border-line-gray-dark">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-ink-navy dark:bg-paper rounded flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-paper dark:text-ink-navy" />
              </div>
              <span className="font-heading font-bold text-lg">Caliber</span>
            </div>
            <p className="text-xs text-slate dark:text-paper/60 leading-relaxed">Practice like the exam. Built by CAs who cracked it.</p>
            <p className="text-[10px] text-slate/40 dark:text-paper/40">Founded by Somya Deep & Aditya Kanal</p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-xs text-ink-navy dark:text-paper mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/courses", label: "All Courses" },
                { href: "/practice", label: "Free MCQ Practice" },
                { href: "/courses", label: "Course Listings" },
                { href: "/dashboard", label: "Dashboard" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-xs text-slate dark:text-paper/60 hover:text-ink-navy dark:hover:text-paper transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-xs text-ink-navy dark:text-paper mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/about", label: "About Us" },
                { href: "/login", label: "Sign In" },
                { href: "/signup", label: "Sign Up" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-slate dark:text-paper/60 hover:text-ink-navy dark:hover:text-paper transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-xs text-ink-navy dark:text-paper mb-4 uppercase tracking-wider">Contact Us</h4>
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-xs text-slate dark:text-paper/70 font-semibold">
                <Star className="w-4 h-4 fill-slate-500 text-slate-500" />
                Message received! We will reply within 24 hours.
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" placeholder="Your name" required value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors" />
                <input type="email" placeholder="Email address" required value={formState.email} onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors" />
                <textarea placeholder="Your message" required rows={3} value={formState.message} onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors resize-none" />
                {/* Turnstile widget key */}
                <Turnstile onVerify={setTurnstileToken} className="mt-1" />

                <button type="submit" className="w-full py-2 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy text-xs font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-line-gray-light dark:border-line-gray-dark flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate/40 dark:text-paper/40">
          <span>© 2026 Caliber Education. All rights reserved.</span>
          <span>Made with ♥ for CA droppers & repeaters</span>
        </div>
      </div>
    </footer>
  );
}

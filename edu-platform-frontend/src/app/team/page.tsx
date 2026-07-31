"use client";

import { motion } from "framer-motion";
import { Mail, MessageSquare, Shield, GraduationCap, Globe, Users, BookOpen, Award, ArrowRight } from "lucide-react";
import Link from "next/link";

const founders = [
    {
        name: "Somya Deep",
        role: "Co-Founder & CA Accounting Specialist",
        initials: "SD",
        color: "from-signal-emerald to-emerald-700",
        bio: "Chartered Accountant (CA). After clearing his exams, Somya realized that standard dropper programs focused too much on passive reading. He specializes in Financial Reporting and Advanced Accounting, helping repeaters build structural confidence in resolving timed exam papers.",
        specialties: ["Financial Reporting", "Advanced Accounting", "Corporate Valuation", "Strategic Cost Management"],
        quote: "Exam confidence isn't about how many hours you study. It is about how many timed decisions you make under pressure.",
        stats: [
            { val: "2,500+", label: "CAs mentored" },
            { val: "8+", label: "Years experience" },
        ],
        linkedin: "#",
        twitter: "#",
        email: "somya@calibereducation.com",
    },
    {
        name: "Aditya Kanal",
        role: "Co-Founder & CA Law & Audit Specialist",
        initials: "AK",
        color: "from-blue-500 to-blue-700",
        bio: "Chartered Accountant (CA). Aditya specializes in translating heavy corporate law provisions and auditing standards into active mental retention schemas. His method relies on daily timed testing and live group discussions to lock in high-yielding ICAI exam topics.",
        specialties: ["Business Laws", "Advanced Auditing", "Direct & Indirect Tax", "Integrated Business Solutions (IBS)"],
        quote: "If you practice without a timer, you're preparing for a homework assignment, not the CA exam.",
        stats: [
            { val: "3,000+", label: "Students trained" },
            { val: "6+", label: "Subject exemptions" },
        ],
        linkedin: "#",
        twitter: "#",
        email: "aditya@calibereducation.com",
    },
];

const teamCoordinators = [
    {
        name: "Neha Sharma",
        role: "WhatsApp Academic Coordinator",
        initials: "NS",
        color: "from-purple-500 to-indigo-600",
        desc: "Oversees daily doubts resolution pipelines, coordinates student feedback, and ensures 24-hr resolution speed in WhatsApp groups.",
    },
    {
        name: "Vikram Malhotra",
        role: "Technical Operations Lead",
        initials: "VM",
        color: "from-amber-500 to-rose-600",
        desc: "Manages MCQ platform scoring systems, online test analytics, student dashboards, and payment logs validation.",
    },
];

export default function TeamPage() {
    return (
        <div className="pt-16 min-h-screen bg-paper dark:bg-ink-navy">
            {/* ─── HERO HEADER ─── */}
            <section className="py-24 bg-white dark:bg-ink-navy border-b border-line-gray-light dark:border-line-gray-dark">
                <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest bg-line-gray-light/60 dark:bg-line-gray-dark/40 px-3 py-1 rounded-full">
                            Our Educators & founders
                        </span>
                        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-ink-navy dark:text-paper mt-6 leading-tight tracking-tight">
                            Meet the Team Behind Caliber
                        </h1>
                        <p className="text-base text-slate dark:text-paper/70 mt-4 max-w-xl mx-auto leading-relaxed">
                            Founded by Chartered Accountants who cracked the exams themselves. We are structured to replace passive lectures with active, timed mental recall.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ─── FOUNDERS SECTION ─── */}
            <section className="py-20 max-w-6xl mx-auto px-6 sm:px-8">
                <div className="space-y-12">
                    <div className="text-center md:text-left space-y-2">
                        <span className="text-xs font-bold text-slate dark:text-paper/40 uppercase tracking-wider">The Founders</span>
                        <h2 className="font-heading font-bold text-3xl text-ink-navy dark:text-paper">Leadership & Specialists</h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-10">
                        {founders.map((founder, i) => (
                            <motion.div
                                key={founder.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className="flex flex-col md:flex-row gap-6 p-6 sm:p-8 bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark rounded-2xl hover:border-ink-navy dark:hover:border-paper transition-all duration-300 shadow-sm"
                            >
                                {/* Profile Graphics Column */}
                                <div className="flex flex-col items-center flex-shrink-0 space-y-4">
                                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${founder.color} flex items-center justify-center text-white text-3xl font-heading font-bold shadow-md hover:scale-105 transition-transform duration-300`}>
                                        {founder.initials}
                                    </div>

                                    {/* Quick stats on founder */}
                                    <div className="flex gap-4 md:flex-col items-center md:items-stretch text-center pt-2 w-full">
                                        {founder.stats.map((s, idx) => (
                                            <div key={idx} className="bg-paper dark:bg-line-gray-dark/40 px-3 py-1.5 rounded-lg border border-line-gray-light/60 dark:border-line-gray-dark/40">
                                                <p className="font-heading font-bold text-sm text-ink-navy dark:text-paper">{s.val}</p>
                                                <p className="text-[8px] text-slate dark:text-paper/40 uppercase tracking-widest">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Info details Column */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h3 className="font-heading font-extrabold text-xl text-ink-navy dark:text-paper">{founder.name}</h3>
                                        <p className="text-[10px] font-bold text-slate dark:text-paper/40 uppercase mt-0.5 tracking-wider">{founder.role}</p>
                                    </div>

                                    <p className="text-xs text-slate dark:text-paper/70 leading-relaxed">{founder.bio}</p>

                                    {/* Specialties badges */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {founder.specialties.map((s) => (
                                            <span
                                                key={s}
                                                className="text-[9px] font-bold px-2 py-0.5 rounded bg-line-gray-light/60 dark:bg-line-gray-dark/45 text-slate dark:text-paper/60 border border-line-gray-light/30"
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Founder Quote */}
                                    <blockquote className="border-l-2 border-signal-emerald pl-4 text-xs italic text-slate/85 dark:text-paper/60 leading-relaxed bg-paper/40 dark:bg-line-gray-dark/10 py-1.5 pr-2 rounded-r-lg">
                                        &ldquo;{founder.quote}&rdquo;
                                    </blockquote>

                                    {/* Social contacts */}
                                    <div className="flex items-center gap-3 pt-2 text-slate dark:text-paper/50">
                                        <a href={founder.linkedin} className="hover:text-ink-navy dark:hover:text-paper transition-colors" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                                            </svg>
                                        </a>
                                        <a href={founder.twitter} className="hover:text-ink-navy dark:hover:text-paper transition-colors" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                            </svg>
                                        </a>
                                        <a href={`mailto:${founder.email}`} className="hover:text-ink-navy dark:hover:text-paper transition-colors" aria-label="Email">
                                            <Mail className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── COORDINATORS SECTION ─── */}
            <section className="py-20 bg-paper dark:bg-ink-navy/40 border-t border-b border-line-gray-light dark:border-line-gray-dark">
                <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-12">
                    <div className="text-center space-y-2">
                        <span className="text-xs font-bold text-slate dark:text-paper/40 uppercase tracking-wider">Operations & Support</span>
                        <h2 className="font-heading font-bold text-3xl text-ink-navy dark:text-paper">Coordination Team</h2>
                        <p className="text-xs text-slate dark:text-paper/60 max-w-sm mx-auto">
                            Our support specialists work daily to resolve doubts and maintain platform uptime.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        {teamCoordinators.map((member, i) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.35, delay: i * 0.1 }}
                                className="flex items-start gap-4 p-5 rounded-2xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 hover:border-ink-navy dark:hover:border-paper transition-all duration-200"
                            >
                                <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-heading font-extrabold text-sm flex-shrink-0 shadow-sm`}>
                                    {member.initials}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-heading font-bold text-sm text-ink-navy dark:text-paper">{member.name}</h4>
                                    <p className="text-[9px] font-bold text-slate dark:text-paper/40 uppercase tracking-wider">{member.role}</p>
                                    <p className="text-xs text-slate dark:text-paper/60 leading-relaxed pt-1.5">{member.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── TEAM MISSION/STATS ─── */}
            <section className="py-24 max-w-4xl mx-auto px-6 sm:px-8">
                <div className="grid sm:grid-cols-3 gap-8 text-center">
                    {[
                        { icon: <BookOpen className="w-5 h-5 text-slate dark:text-paper/40" />, stat: "1,200+", label: "MCQ answers written" },
                        { icon: <Users className="w-5 h-5 text-slate dark:text-paper/40" />, stat: "5,400+", label: "Students supported" },
                        { icon: <Award className="w-5 h-5 text-slate dark:text-paper/40" />, stat: "24 Hours", label: "Doubt resolution speeds" },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="flex flex-col items-center gap-2.5 p-6 border border-line-gray-light dark:border-line-gray-dark rounded-xl bg-white dark:bg-line-gray-dark/20"
                        >
                            <div className="w-10 h-10 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex items-center justify-center">
                                {item.icon}
                            </div>
                            <div className="font-heading font-extrabold text-2xl text-ink-navy dark:text-paper mt-1">{item.stat}</div>
                            <div className="text-xs text-slate dark:text-paper/50">{item.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─── CALL TO ACTION ─── */}
            <section className="py-14 text-center pb-24">
                <div className="max-w-xl mx-auto px-6 sm:px-8 space-y-4">
                    <GraduationCap className="w-8 h-8 text-signal-emerald mx-auto animate-pulse" />
                    <h3 className="font-heading font-bold text-xl text-ink-navy dark:text-paper">Ready to study with us?</h3>
                    <p className="text-xs text-slate dark:text-paper/60">
                        Join the mock series and WhatsApp cohorts managed directly by Somya and Aditya.
                    </p>
                    <div className="pt-2">
                        <Link
                            href="/courses"
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg text-xs hover:opacity-90 active:scale-[0.98] transition-all"
                        >
                            Explore Courses <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

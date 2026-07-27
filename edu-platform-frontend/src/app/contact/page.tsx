"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, MessageSquare, Send, Check, Copy } from "lucide-react";

export default function ContactPage() {
    const [formState, setFormState] = useState({
        name: "",
        email: "",
        examLevel: "CA Final",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);

    const handleCopyEmail = () => {
        navigator.clipboard.writeText("support@calibereducation.com");
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="pt-16 min-h-screen flex flex-col justify-between">
            {/* ─── HERO ─── */}
            <section className="relative py-24 bg-paper dark:bg-ink-navy border-b border-line-gray-light dark:border-line-gray-dark">
                <div className="relative max-w-4xl mx-auto px-6 sm:px-8 text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest bg-line-gray-light/60 dark:bg-line-gray-dark/40 px-3 py-1 rounded-full">
                            Get in Touch
                        </span>
                        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-ink-navy dark:text-paper mt-6 leading-tight tracking-tight">
                            We're here to help you prep with confidence.
                        </h1>
                        <p className="text-base text-slate dark:text-paper/70 mt-4 max-w-xl mx-auto leading-relaxed">
                            Have questions about mock series, WhatsApp doubt clearance groups, or enrollments? Talk directly with our coordinators.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ─── CONTACT SECTION ─── */}
            <section className="py-20 bg-white dark:bg-ink-navy flex-1">
                <div className="max-w-6xl mx-auto px-6 sm:px-8">
                    <div className="grid lg:grid-cols-12 gap-12 items-start">

                        {/* Info Cards */}
                        <div className="lg:col-span-5 space-y-6">
                            <h2 className="font-heading font-bold text-2xl text-ink-navy dark:text-paper">
                                Contact Information
                            </h2>
                            <p className="text-xs text-slate dark:text-paper/60 leading-relaxed">
                                Connect with our team directly. We resolve queries and admissions requests within 24 hours on working days.
                            </p>

                            <div className="space-y-4 pt-4">

                                {/* Whatsapp Support */}
                                <div className="p-5 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 flex gap-4 group">
                                    <div className="w-10 h-10 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-signal-emerald/10 flex items-center justify-center text-signal-emerald flex-shrink-0">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-heading font-bold text-sm text-ink-navy dark:text-paper">WhatsApp Coordinator</h3>
                                        <p className="text-xs text-slate dark:text-paper/60 mt-1 leading-relaxed">
                                            Instant query resolution regarding course validation.
                                        </p>
                                        <a
                                            href="https://wa.me/919988776655"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-signal-emerald hover:underline mt-2.5"
                                        >
                                            Chat on WhatsApp &rarr;
                                        </a>
                                    </div>
                                </div>

                                {/* Email Support */}
                                <div className="p-5 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 flex gap-4">
                                    <div className="w-10 h-10 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex items-center justify-center text-ink-navy dark:text-paper flex-shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="w-full min-w-0">
                                        <h3 className="font-heading font-bold text-sm text-ink-navy dark:text-paper">Email Support</h3>
                                        <p className="text-xs text-slate dark:text-paper/60 mt-1 leading-relaxed">
                                            Write to us for business inquiries & invoice issues.
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 bg-paper dark:bg-ink-navy border border-line-gray-light dark:border-line-gray-dark rounded-lg p-2 text-xs">
                                            <span className="font-mono text-ink-navy dark:text-paper truncate select-all">
                                                support@calibereducation.com
                                            </span>
                                            <button
                                                onClick={handleCopyEmail}
                                                className="p-1 hover:bg-line-gray-light dark:hover:bg-line-gray-dark rounded transition-colors text-slate dark:text-paper/60 flex-shrink-0"
                                            >
                                                {copiedEmail ? <Check className="w-3.5 h-3.5 text-signal-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Call Support */}
                                <div className="p-5 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 flex gap-4">
                                    <div className="w-10 h-10 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex items-center justify-center text-ink-navy dark:text-paper flex-shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-heading font-bold text-sm text-ink-navy dark:text-paper">Phone Support</h3>
                                        <p className="text-xs text-slate dark:text-paper/60 mt-1 leading-relaxed">
                                            Available Mon-Sat (10:00 AM - 6:00 PM IST)
                                        </p>
                                        <p className="text-xs font-semibold text-ink-navy dark:text-paper mt-1.5">+91 98888 77777</p>
                                    </div>
                                </div>

                                {/* Office Location */}
                                <div className="p-5 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 flex gap-4">
                                    <div className="w-10 h-10 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex items-center justify-center text-ink-navy dark:text-paper flex-shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-heading font-bold text-sm text-ink-navy dark:text-paper">Caliber Education Headquarters</h3>
                                        <p className="text-xs text-slate dark:text-paper/60 mt-1 leading-relaxed">
                                            5th Floor, 80 Feet Road, Koramangala Stage 3,<br />
                                            Bengaluru, Karnataka 560034
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Form Column */}
                        <div className="lg:col-span-7">
                            <div className="p-6 sm:p-8 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 space-y-6">
                                <div>
                                    <h2 className="font-heading font-bold text-2xl text-ink-navy dark:text-paper">
                                        Send a Message
                                    </h2>
                                    <p className="text-xs text-slate dark:text-paper/60 mt-1">
                                        Fill the form below and we will contact you as soon as possible.
                                    </p>
                                </div>

                                <AnimatePresence mode="wait">
                                    {submitted ? (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="p-6 rounded-xl border border-signal-emerald/20 bg-signal-emerald/5 text-center space-y-3"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-signal-emerald/10 border border-signal-emerald/30 flex items-center justify-center text-signal-emerald mx-auto">
                                                <Check className="w-5 h-5" />
                                            </div>
                                            <h3 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">Message Sent!</h3>
                                            <p className="text-xs text-slate dark:text-paper/60 max-w-sm mx-auto leading-relaxed">
                                                Thank you for contacting Caliber. One of our course advisors will reply back to your email at <strong className="text-ink-navy dark:text-paper">{formState.email}</strong> shortly.
                                            </p>
                                            <button
                                                onClick={() => setSubmitted(false)}
                                                className="text-xs font-semibold text-ink-navy dark:text-paper underline hover:opacity-85 mt-2"
                                            >
                                                Send another message
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <motion.form
                                            key="form"
                                            onSubmit={handleSubmit}
                                            className="space-y-4"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/75 mb-1.5 block">
                                                        Full Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Enter your name"
                                                        value={formState.name}
                                                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                                        className="w-full px-3.5 py-2.5 text-xs border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/75 mb-1.5 block">
                                                        Email Address
                                                    </label>
                                                    <input
                                                        type="email"
                                                        required
                                                        placeholder="Enter your email"
                                                        value={formState.email}
                                                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                                        className="w-full px-3.5 py-2.5 text-xs border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/75 mb-1.5 block">
                                                    Exam Level / Target Group
                                                </label>
                                                <select
                                                    value={formState.examLevel}
                                                    onChange={(e) => setFormState({ ...formState, examLevel: e.target.value })}
                                                    className="w-full px-3.5 py-2.5 text-xs border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors appearance-none cursor-pointer"
                                                >
                                                    <option value="CA Foundation">CA Foundation</option>
                                                    <option value="CA Intermediate">CA Intermediate</option>
                                                    <option value="CA Final">CA Final</option>
                                                    <option value="General Query">General / Other</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/75 mb-1.5 block">
                                                    Your Message
                                                </label>
                                                <textarea
                                                    required
                                                    rows={5}
                                                    placeholder="How can we help you?"
                                                    value={formState.message}
                                                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                                                    className="w-full px-3.5 py-2.5 text-xs border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors resize-none"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="w-full flex items-center justify-center gap-2 py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy text-xs font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
                                            >
                                                <Send className="w-3.5 h-3.5" /> Send Message
                                            </button>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ─── MINI FOOTER ─── */}
            <footer className="py-6 border-t border-line-gray-light dark:border-line-gray-dark bg-paper dark:bg-ink-navy text-center text-[10px] text-slate/40 dark:text-paper/40">
                <span>© 2026 Caliber Education. All rights reserved.</span>
            </footer>
        </div>
    );
}

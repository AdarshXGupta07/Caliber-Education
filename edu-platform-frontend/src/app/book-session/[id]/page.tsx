"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Video, CheckCircle2, ChevronRight, User, MessageSquare, Loader2 } from "lucide-react";
import { courses } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";
import { Toast, type ToastState } from "@/components/Toast";

interface Mentor {
    id: string;
    name: string;
    specialty: string;
}

export default function BookSessionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: mentorId } = use(params);
    const router = useRouter();
    const { isAuthenticated, isMounted } = useAuth();

    const [mentor, setMentor] = useState<Mentor | null>(null);
    const [loadingMentor, setLoadingMentor] = useState(true);

    const [topic, setTopic] = useState("");
    const [preferredTiming, setPreferredTiming] = useState("");
    const [note, setNote] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [toast, setToast] = useState<ToastState | null>(null);

    // Find mentor — try API, fall back to mockData
    useEffect(() => {
        // Wait for AuthContext to finish reading localStorage before
        // deciding to redirect — otherwise a hard refresh on this page
        // bounces a logged-in student to /login, same class of bug already
        // guarded against on /admin, /dashboard, and /profile.
        if (!isMounted) return;
        if (!isAuthenticated) { router.push("/login"); return; }

        const fetchMentor = async () => {
            try {
                const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
                const res = await fetch(`${apiURL}/api/mentors`);
                if (res.ok) {
                    const data: Mentor[] = await res.json();
                    const found = data.find(m => m.id === mentorId || m.name.toLowerCase().replace(/\s+/g, "-") === mentorId);
                    setMentor(found || null);
                } else throw new Error();
            } catch {
                const allMentors = courses.flatMap(c => (c.mentors || []) as any[]);
                const found = allMentors.find(m => m.name.toLowerCase().replace(/\s+/g, "-") === mentorId);
                setMentor(found ? { id: mentorId, name: found.name, specialty: found.specialty } : {
                    id: mentorId,
                    name: mentorId.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                    specialty: "CA Mentor Expert",
                });
            } finally {
                setLoadingMentor(false);
            }
        };
        fetchMentor();
    }, [mentorId, isAuthenticated, isMounted, router]);

    const handleSubmit = async () => {
        if (!topic.trim() || !preferredTiming.trim()) return;
        setSubmitting(true);

        try {
            const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
            const token = localStorage.getItem("caliber_jwt") || "";

            const res = await fetch(`${apiURL}/api/sessions/request`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    mentorId: mentor?.id || mentorId,
                    topic,
                    preferredTiming,
                    note,
                }),
            });

            if (res.ok) {
                setConfirmed(true);
            } else {
                const err = await res.json();
                setToast({ type: "error", message: err.detail || "Failed to submit request. Please try again." });
            }
        } catch {
            // Offline fallback
            setConfirmed(true);
        } finally {
            setSubmitting(false);
        }
    };

    if (confirmed) {
        return (
            <div className="pt-24 pb-20 min-h-screen bg-paper dark:bg-ink-navy/10 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 rounded-2xl p-8 space-y-6 text-center shadow-lg"
                >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-signal-emerald flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/40">Request Submitted</span>
                        <h1 className="font-heading font-extrabold text-2xl text-ink-navy dark:text-paper leading-tight">You're on the list!</h1>
                        <p className="text-xs text-slate dark:text-paper/60 leading-relaxed max-w-sm mx-auto">
                            Your session request with <strong className="text-ink-navy dark:text-paper">{mentor?.name}</strong> has been sent.
                            <br className="my-1" />
                            Once your mentor schedules a time, you'll receive a <strong>Google Meet link via email</strong>.
                        </p>
                    </div>

                    <div className="py-4 px-5 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-paper dark:bg-line-gray-dark/10 text-left space-y-2.5">
                        <div className="flex items-start gap-2.5 text-xs text-slate dark:text-paper/70">
                            <Video className="w-4 h-4 text-slate dark:text-paper/40 flex-shrink-0 mt-0.5" />
                            <span>Your mentor will email you a Google Meet link with the confirmed date and time.</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-xs text-slate dark:text-paper/70">
                            <Clock className="w-4 h-4 text-slate dark:text-paper/40 flex-shrink-0 mt-0.5" />
                            <span>Sessions are typically scheduled within 24–48 hours.</span>
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                        <Link
                            href="/dashboard"
                            className="w-full py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2"
                        >
                            Go to Dashboard <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    const mentorColor = "from-blue-500 to-blue-700";
    const mentorInitials = mentor?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "M";

    return (
        <div className="pt-24 pb-20 min-h-screen bg-paper dark:bg-ink-navy/10">
            <Toast toast={toast} onDismiss={() => setToast(null)} />
            <div className="max-w-2xl mx-auto px-6 sm:px-8 space-y-6">

                <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate dark:text-paper/60 hover:text-ink-navy dark:hover:text-paper transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                {/* Mentor Card */}
                {!loadingMentor && mentor && (
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-6 rounded-2xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 shadow-xs">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mentorColor} flex items-center justify-center text-white text-base font-bold font-heading flex-shrink-0 shadow-xs`}>
                            {mentorInitials}
                        </div>
                        <div className="text-center sm:text-left space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/30">Request a 1:1 Session</span>
                            <h1 className="font-heading font-extrabold text-xl text-ink-navy dark:text-paper">{mentor.name}</h1>
                            <p className="text-xs text-slate dark:text-paper/50">{mentor.specialty}</p>
                        </div>
                    </div>
                )}

                {/* Request Form */}
                <div className="p-6 bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-5">
                    <h2 className="font-heading font-bold text-sm text-ink-navy dark:text-paper flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-slate dark:text-paper/50" /> Session Details
                    </h2>

                    {/* Topic */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate dark:text-paper/50 uppercase tracking-wider">
                            What do you want to discuss? <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Audit procedures, SFM problems, Law case studies..."
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            className="w-full px-4 py-3 text-sm rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-paper dark:bg-ink-navy/10 text-ink-navy dark:text-paper placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-ink-navy/20 dark:focus:ring-paper/20 transition"
                        />
                    </div>

                    {/* Preferred Timing */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate dark:text-paper/50 uppercase tracking-wider">
                            Preferred timing <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Weekday evenings after 7 PM, Saturday mornings..."
                            value={preferredTiming}
                            onChange={e => setPreferredTiming(e.target.value)}
                            className="w-full px-4 py-3 text-sm rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-paper dark:bg-ink-navy/10 text-ink-navy dark:text-paper placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-ink-navy/20 dark:focus:ring-paper/20 transition"
                        />
                    </div>

                    {/* Note */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate dark:text-paper/50 uppercase tracking-wider">
                            Additional notes <span className="text-slate/30">(optional)</span>
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Any specific doubts, chapters, or background context for the mentor..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            className="w-full px-4 py-3 text-sm rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-paper dark:bg-ink-navy/10 text-ink-navy dark:text-paper placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-ink-navy/20 dark:focus:ring-paper/20 transition resize-none"
                        />
                    </div>

                    {/* Info note */}
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 text-[11px] text-slate dark:text-paper/60">
                        <Video className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>Your mentor will review this request and <strong>email you a Google Meet link</strong> with the confirmed time. Usually within 24–48 hours.</span>
                    </div>

                    {/* Submit */}
                    <div className="pt-2 border-t border-line-gray-light dark:border-line-gray-dark flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={!topic.trim() || !preferredTiming.trim() || submitting}
                            className="px-8 py-2.5 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...</> : "Send Request"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

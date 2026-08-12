"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, AlertCircle, RotateCcw } from "lucide-react";

export default function ProfilePage() {
    const { user, isAuthenticated, isMounted, purchasedCourseIds } = useAuth();
    const router = useRouter();

    const [savingProfile, setSavingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        full_name: "", phone_number: "", address: "", stage: "CA Final", attempt_status: "First Attempt"
    });
    const [courses, setCourses] = useState<any[]>([]);

    const [saveStatus, setSaveStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);
    // Blank form on a slow connection reads identically to "you have no
    // data" — track loading/error explicitly instead of leaving it ambiguous.
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        if (isMounted && !isAuthenticated) router.push("/login");
    }, [isMounted, isAuthenticated, router]);

    const fetchProfile = useCallback(async () => {
        if (!isAuthenticated) return;
        setIsLoading(true);
        setLoadError("");
        try {
            const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
            const token = localStorage.getItem("caliber_jwt") || "";

            const [res, coursesRes] = await Promise.all([
                fetch(`${apiURL}/api/auth/me`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`${apiURL}/api/courses`),
            ]);

            if (!res.ok) throw new Error("Couldn't load your profile.");
            const data = await res.json();
            setProfileForm({
                full_name: data.user.full_name || "",
                phone_number: data.user.phone_number || "",
                address: data.user.address || "",
                stage: data.user.stage || "CA Final",
                attempt_status: data.user.attempt_status || "First Attempt"
            });

            if (coursesRes.ok) {
                const allCourses = await coursesRes.json();
                setCourses(allCourses.filter((c: any) => purchasedCourseIds.includes(c.id)));
            } else {
                setCourses([]);
            }
        } catch (err) {
            setLoadError("Couldn't load your profile. Check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, purchasedCourseIds]);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);

    // Save confirmation/error shouldn't linger on the page forever.
    useEffect(() => {
        if (!saveStatus) return;
        const id = setTimeout(() => setSaveStatus(null), 4000);
        return () => clearTimeout(id);
    }, [saveStatus]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const digitCount = profileForm.phone_number.replace(/\D/g, "").length;
        if (digitCount < 7 || digitCount > 15) {
            setSaveStatus({ message: "Enter a valid phone number.", type: "error" });
            return;
        }
        setSavingProfile(true);
        setSaveStatus(null);
        try {
            const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
            const token = localStorage.getItem("caliber_jwt") || "";
            const profileData = {
                full_name: profileForm.full_name,
                phone_number: profileForm.phone_number,
                address: profileForm.address,
                stage: profileForm.stage,
                attempt_status: profileForm.attempt_status
            };
            const res = await fetch(`${apiURL}/api/auth/profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(profileData)
            });
            if (res.ok) {
                const data = await res.json().catch(() => ({}));
                // Sync from what the server actually stored (e.g. trimmed
                // whitespace) rather than trusting our own optimistic values.
                if (data.profile) {
                    setProfileForm((prev) => ({ ...prev, ...data.profile }));
                }
                setSaveStatus({ message: "Profile updated successfully!", type: "success" });
            } else {
                const err = await res.json().catch(() => ({}));
                setSaveStatus({ message: err.detail || "Could not update profile.", type: "error" });
            }
        } catch (err) {
            setSaveStatus({ message: "Network error saving profile.", type: "error" });
        } finally {
            setSavingProfile(false);
        }
    };

    if (!isMounted || !isAuthenticated) return null;

    return (
        <div className="pt-16 pb-20 min-h-screen bg-paper dark:bg-ink-navy/10 mt-10">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 space-y-8">

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line-gray-light dark:border-line-gray-dark pb-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate dark:text-paper/40">Profile Dashboard</p>
                            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink-navy dark:text-paper leading-none">
                                My Profile
                            </h1>
                            <p className="text-xs font-semibold text-slate dark:text-paper/60">{user?.email}</p>
                        </div>
                        <Link href="/dashboard" className="text-xs font-bold text-ink-navy dark:text-paper hover:underline flex items-center gap-1 bg-white dark:bg-line-gray-dark/20 px-4 py-2 rounded-lg border border-line-gray-light dark:border-line-gray-dark">
                            Back to Dashboard <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </motion.div>

                {loadError ? (
                    <div className="flex flex-col items-center text-center gap-3 py-16 border border-dashed border-line-gray-light dark:border-line-gray-dark rounded-xl bg-white dark:bg-line-gray-dark/10">
                        <AlertCircle className="w-8 h-8 text-alert-coral" />
                        <p className="text-sm text-slate dark:text-paper/60 max-w-xs">{loadError}</p>
                        <button onClick={fetchProfile} className="flex items-center gap-1.5 text-xs font-bold text-ink-navy dark:text-paper hover:underline">
                            <RotateCcw className="w-3.5 h-3.5" /> Try again
                        </button>
                    </div>
                ) : isLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-4 border-line-gray-light dark:border-line-gray-dark border-t-signal-emerald rounded-full animate-spin" />
                    </div>
                ) : (
                <div className="grid lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-line-gray-dark/10 border border-line-gray-light dark:border-line-gray-dark rounded-xl p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-heading font-bold text-base text-ink-navy dark:text-paper">Personal Details</h2>
                            </div>
                            <form onSubmit={handleSaveProfile} className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-xs font-bold text-slate dark:text-paper/60 mb-1.5 block">Full Name</label>
                                        <input required value={profileForm.full_name} onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-paper/50 dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg outline-none focus:border-signal-emerald/50 transition-colors"
                                            placeholder="e.g. John Doe" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate dark:text-paper/60 mb-1.5 block">Phone or WhatsApp</label>
                                        <input required value={profileForm.phone_number} onChange={e => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-paper/50 dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg outline-none focus:border-signal-emerald/50 transition-colors"
                                            placeholder="+91..." />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate dark:text-paper/60 mb-1.5 block">Address / City</label>
                                    <textarea required value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                                        className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-paper/50 dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg outline-none focus:border-signal-emerald/50 transition-colors resize-none"
                                        rows={2} placeholder="Your residential address" />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-xs font-bold text-slate dark:text-paper/60 mb-1.5 block">Stage</label>
                                        <select required value={profileForm.stage} onChange={e => setProfileForm({ ...profileForm, stage: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-paper/50 dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg outline-none focus:border-signal-emerald/50 transition-colors">
                                            <option>CA Foundation</option>
                                            <option>CA Intermediate</option>
                                            <option>CA Final</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate dark:text-paper/60 mb-1.5 block">Attempt Status</label>
                                        <select required value={profileForm.attempt_status} onChange={e => setProfileForm({ ...profileForm, attempt_status: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-paper/50 dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg outline-none focus:border-signal-emerald/50 transition-colors">
                                            <option>First Attempt</option>
                                            <option>Repeater (2nd)</option>
                                            <option>Repeater (3rd+)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button type="submit" disabled={savingProfile} className="px-6 py-2.5 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy text-sm font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center gap-2">
                                        {savingProfile ? "Saving Details..." : "Save Changes"}
                                    </button>
                                    {savingProfile && <span className="ml-3 text-xs text-signal-emerald animate-pulse">Updating database...</span>}
                                    {!savingProfile && saveStatus && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                                            className={`ml-3 text-xs font-bold ${saveStatus.type === "success" ? "text-signal-emerald" : "text-alert-coral"}`}
                                        >
                                            {saveStatus.message}
                                        </motion.span>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="font-heading font-bold text-base text-ink-navy dark:text-paper">Past & Enrolled Courses</h2>
                        {courses.length === 0 ? (
                            <div className="p-6 text-center border border-dashed border-line-gray-light dark:border-line-gray-dark rounded-xl bg-white dark:bg-line-gray-dark/10">
                                <p className="text-xs text-slate dark:text-paper/50 mb-3">You haven't enrolled in any courses yet.</p>
                                <Link href="/courses" className="text-xs font-bold text-ink-navy dark:text-paper hover:underline">Browse Courses</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {courses.map(c => (
                                    <div key={c.id} className="p-4 border border-line-gray-light dark:border-line-gray-dark rounded-xl bg-white dark:bg-line-gray-dark/20 flex flex-col gap-3">
                                        <h3 className="font-heading font-bold text-sm text-ink-navy dark:text-paper leading-snug">{c.title}</h3>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-slate dark:text-paper/50">{c.level}</p>
                                            <span className="text-[10px] font-bold text-signal-emerald">Purchased</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
                )}
            </div>
        </div>
    );
}

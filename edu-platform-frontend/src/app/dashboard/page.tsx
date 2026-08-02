"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { mcqSets, courses } from "@/lib/mockData";
import {
  BookOpen,
  Lock,
  Unlock,
  Zap,
  Star,
  TrendingUp,
  Calendar,
  Shield,
  ArrowRight,
  ChevronRight,
  BarChart2,
  Clock,
  MessageCircle,
  X,
  Copy,
  Check,
  AlertTriangle,
  Video
} from "lucide-react";

export default function DashboardPage() {
  const {
    user,
    isAuthenticated,
    isMounted,
    toggleRole,
    purchasedCourseIds,
    verifications
  } = useAuth();

  const router = useRouter();

  const [accessCourseId, setAccessCourseId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"courses" | "mcqs" | "results">("courses");

  // 1:1 Sessions States
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Test Evaluation States
  const [tests, setTests] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [uploadingTestId, setUploadingTestId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [submittingTest, setSubmittingTest] = useState(false);

  // Profile States
  const [profileDetails, setProfileDetails] = useState<any>({});
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "", phone_number: "", address: "", stage: "CA Final", attempt_status: "First Attempt"
  });

  const [dbScrapedSeries, setDbScrapedSeries] = useState<any[]>([]);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${apiURL}/api/mcq-series`);
        if (res.ok) {
          const data = await res.json();
          setDbScrapedSeries(data);
        }
      } catch (e) {
        console.warn("Failed to fetch MCQ series", e);
      }
    };
    fetchSeries();
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) router.push("/login");
  }, [isMounted, isAuthenticated, router]);

  // Load User Profile Data
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchProfile = async () => {
      try {
        const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
        const token = localStorage.getItem("caliber_jwt") || "";
        const res = await fetch(`${apiURL}/api/auth/me`, { headers: { "Authorization": `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setProfileDetails(data.user);
          setProfileForm({
            full_name: data.user.full_name || "",
            phone_number: data.user.phone_number || "",
            address: data.user.address || "",
            stage: data.user.stage || "CA Final",
            attempt_status: data.user.attempt_status || "First Attempt"
          });
        }
      } catch (err) {
        console.warn("Could not load user profile details");
      }
    };
    fetchProfile();
  }, [isAuthenticated]);

  // Load Sessions
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchSessions = async () => {
      setLoadingSessions(true);
      try {
        const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
        const token = localStorage.getItem("caliber_jwt") || "";

        const res = await fetch(`${apiURL}/api/sessions`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || data);
        } else {
          throw new Error("Unable to fetch sessions");
        }
      } catch (err) {
        console.warn("API request failed:", err);
        setSessions([]);
      } finally {
        setLoadingSessions(false);
      }
    };
    fetchSessions();
  }, [isAuthenticated]);

  // Load Prep Tests & Student Submissions
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchTestsAndSubmissions = async () => {
      setLoadingTests(true);
      try {
        const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
        const token = localStorage.getItem("caliber_jwt") || "";

        const resTests = await fetch(`${apiURL}/api/tests`, { headers: { "Authorization": `Bearer ${token}` } });
        const resSubs = await fetch(`${apiURL}/api/tests/submissions`, { headers: { "Authorization": `Bearer ${token}` } });

        if (resTests.ok && resSubs.ok) {
          const testsData = await resTests.json();
          const subsData = await resSubs.json();
          setTests(testsData);
          setSubmissions(subsData);
        } else {
          throw new Error("Unable to fetch tests data from server");
        }
      } catch (err) {
        console.warn("API fetch tests failed:", err);
        setTests([]);
        setSubmissions([]);
      } finally {
        setLoadingTests(false);
      }
    };
    fetchTestsAndSubmissions();
  }, [isAuthenticated]);

  const handleCancelSession = async (sessionId: string) => {
    const confirm = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirm) return;

    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";

      const res = await fetch(`${apiURL}/api/sessions/${sessionId}/cancel`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      } else {
        throw new Error("Failed to cancel session");
      }
    } catch (err) {
      console.warn("Cancelling booking locally");
      const updated = sessions.filter(s => s.id !== sessionId);
      setSessions(updated);
      localStorage.setItem("caliber_sessions", JSON.stringify(updated));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent, testId: string) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) return;
    setSubmittingTest(true);

    const fileNames = Array.from(selectedFiles).map(f => f.name);

    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";

      const formData = new FormData();
      Array.from(selectedFiles).forEach(f => {
        formData.append("files", f);
      });

      const res = await fetch(`${apiURL}/api/tests/${testId}/submit`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const newSubObj = await res.json();
        setSubmissions(prev => [...prev, newSubObj]);
      } else {
        throw new Error("API submit test order failed");
      }
    } catch (err) {
      console.warn("Adding mock test submission logic");
      const newSubMock = {
        id: `sub-mock-${Date.now()}`,
        testId,
        status: "pending",
        submittedAt: new Date().toISOString(),
        studentFiles: fileNames,
        marksAwarded: null,
        maxMarks: 100,
        remarks: null,
        checkedCopyLink: null
      };

      const updatedList = [...submissions, newSubMock];
      setSubmissions(updatedList);
      localStorage.setItem("caliber_submissions_tests", JSON.stringify(updatedList));

      const savedAdminList = JSON.parse(localStorage.getItem("caliber_admin_pending_evaluations") || "[]");
      savedAdminList.push({
        id: newSubMock.id,
        testId,
        studentEmail: user?.email || "student@caliber.com",
        studentName: user?.email.split("@")[0] || "Student",
        testTitle: tests.find(t => t.id === testId)?.title || "Evaluation sheet",
        submittedAt: newSubMock.submittedAt,
        studentFiles: newSubMock.studentFiles,
      });
      localStorage.setItem("caliber_admin_pending_evaluations", JSON.stringify(savedAdminList));
    } finally {
      setSubmittingTest(false);
      setSelectedFiles(null);
      setUploadingTestId(null);
    }
  };

  if (!isMounted || !isAuthenticated || !user) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-paper/40 dark:bg-ink-navy/40 backdrop-blur-md transition-all duration-500">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-line-gray-light dark:border-line-gray-dark border-t-ink-navy dark:border-t-signal-emerald rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold font-heading text-ink-navy dark:text-paper uppercase tracking-widest animate-pulse">
            Preparing your workspace
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === "admin";

  const userPendingVerifications = verifications.filter(
    (v) => v.studentEmail.toLowerCase() === user.email.toLowerCase() && v.status === "pending"
  );

  const userPurchasedCourses = courses.filter((c) => purchasedCourseIds.includes(c.id));
  const userPendingCourses = courses.filter((c) =>
    userPendingVerifications.some((v) => v.courseTitle === c.title)
  );

  const totalMyCourses = userPurchasedCourses.length + userPendingCourses.length;

  const activeAccessCourse = courses.find(c => c.id === accessCourseId);
  const activeWhatsappLink = activeAccessCourse
    ? `https://chat.whatsapp.com/invite/CA-${activeAccessCourse.id.split("-").slice(1).join("-").toUpperCase()}-2026`
    : "";

  const handleCopyLink = () => {
    if (!activeWhatsappLink) return;
    navigator.clipboard.writeText(activeWhatsappLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";
      const res = await fetch(`${apiURL}/api/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        setProfileDetails((prev: any) => ({ ...prev, ...profileForm }));
        setShowProfileModal(false);
      } else {
        alert("Could not update profile because database schema was not updated yet. Please contact support.");
      }
    } catch (err) {
      alert("Error saving profile");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="pt-16 pb-20 min-h-screen bg-paper dark:bg-ink-navy/10">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 space-y-8">

        {/* Greeting Banner */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate dark:text-paper/40">Dashboard</p>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink-navy dark:text-paper leading-none">
                Welcome back{profileDetails?.full_name ? `, ${profileDetails.full_name.split(' ')[0]}` : ''} 👋
              </h1>
              <div className="flex items-center gap-3">
                <p className="text-xs font-semibold text-slate dark:text-paper/60">{user.email}</p>
              </div>
            </div>

            {/* Admin Toggle switch */}
            <div className="flex flex-col items-start sm:items-end gap-2">
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all ${isAdmin
                ? "bg-alert-coral/5 border-alert-coral/25"
                : "bg-white dark:bg-line-gray-dark/20 border-line-gray-light dark:border-line-gray-dark"
                }`}>
                <Shield className={`w-4 h-4 ${isAdmin ? "text-alert-coral" : "text-slate/50"}`} />
                <span className={`text-xs font-semibold ${isAdmin ? "text-alert-coral" : "text-slate dark:text-paper/60"}`}>
                  Admin Mode
                </span>
                <button
                  type="button"
                  onClick={toggleRole}
                  className={`relative w-8 h-4 rounded-full transition-colors ${isAdmin ? "bg-alert-coral" : "bg-line-gray-light dark:bg-line-gray-dark"
                    }`}
                  aria-label="Toggle admin mode"
                >
                  <motion.span
                    layout
                    className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-xs"
                    animate={{ left: isAdmin ? "calc(100% - 0.875rem)" : "0.125rem" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 text-[10px] font-bold text-alert-coral uppercase tracking-wider hover:underline"
                >
                  Go to Admin panel <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Summary Panel - Temporarily removed because it uses mock data and student hasn't attempted anything yet */}

        {/* Dynamic Tab Selector Switch */}
        <div className="flex gap-4 border-b border-line-gray-light dark:border-line-gray-dark pb-px pt-2">
          {[
            { id: "courses", label: "My Courses" },
            { id: "mcqs", label: "My MCQs" },
            { id: "results", label: "My Results Analysis" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-1 transition-all ${activeTab === tab.id
                ? "border-ink-navy dark:border-paper text-ink-navy dark:text-paper"
                : "border-transparent text-slate/50 dark:text-paper/40 hover:text-slate dark:hover:text-paper/70"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Render Active Tab Panels */}
        <AnimatePresence mode="wait">
          {activeTab === "courses" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
              {/* My Courses */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-line-gray-light dark:border-line-gray-dark pb-3 gap-4">
                  <div>
                    <h2 className="font-heading font-bold text-base text-ink-navy dark:text-paper">Current Courses</h2>
                    <span className="text-[10px] text-slate dark:text-paper/45 mt-0.5 block">{totalMyCourses} enrolled</span>
                  </div>

                  <div className="bg-gradient-to-r from-signal-emerald/20 to-emerald-400/10 px-4 py-2.5 rounded-xl border border-signal-emerald/30 inline-flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 leading-tight">Buy single course or buy more and get discount!</p>
                      <p className="text-[9px] text-emerald-700/70 dark:text-emerald-400/70">Group 1 & 2 combinations are available.</p>
                    </div>
                    <Link href="/courses" className="px-3 py-1.5 bg-signal-emerald text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all whitespace-nowrap shadow-sm border border-emerald-600/50">
                      View Bundles
                    </Link>
                  </div>
                </div>

                {totalMyCourses === 0 ? (
                  <div className="p-8 text-center border border-dashed border-line-gray-light dark:border-line-gray-dark rounded-xl bg-white dark:bg-line-gray-dark/10 space-y-3">
                    <p className="text-xs text-slate dark:text-paper/50">You haven't enrolled in any CA prep courses yet.</p>
                    <Link href="/courses" className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy text-xs font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all">
                      Browse Courses <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Enrolled Courses */}
                    {userPurchasedCourses.map((c) => (
                      <div key={c.id} className="p-5 border border-line-gray-light dark:border-line-gray-dark rounded-xl bg-white dark:bg-line-gray-dark/20 flex flex-col justify-between gap-4">
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-signal-emerald">Active Access</span>
                          <h3 className="font-heading font-bold text-sm text-ink-navy dark:text-paper">{c.title}</h3>
                          <p className="text-[10px] text-slate dark:text-paper/50">{c.level} · {c.duration}</p>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-line-gray-light/30 dark:border-line-gray-dark/30">
                          <button
                            onClick={() => setAccessCourseId(c.id)}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1 active:scale-[0.98]"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Access
                          </button>
                          <Link
                            href={`/courses/${c.id}`}
                            className="px-3 py-1.5 border border-line-gray-light dark:border-line-gray-dark text-slate dark:text-paper/70 hover:text-ink-navy dark:hover:text-paper rounded-lg text-xs font-semibold transition-all text-center"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}

                    {/* Pending Verification list */}
                    {userPendingCourses.map((c) => {
                      const verification = userPendingVerifications.find(v => v.courseTitle === c.title);
                      return (
                        <div key={c.id} className="p-5 border border-line-gray-light dark:border-line-gray-dark rounded-xl bg-white dark:bg-line-gray-dark/20 flex flex-col justify-between gap-4 opacity-80">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">
                              <Clock className="w-3.5 h-3.5 animate-pulse" /> Verification Pending
                            </div>
                            <h3 className="font-heading font-bold text-sm text-ink-navy dark:text-paper">{c.title}</h3>
                            <p className="text-[10px] text-slate dark:text-paper/40">UTR: {verification?.utrNumber}</p>
                          </div>
                          <div className="pt-2 border-t border-line-gray-light/30 dark:border-line-gray-dark/30 flex items-center justify-between">
                            <span className="text-[10px] text-slate dark:text-paper/40 font-mono">Submitting on {verification?.date}</span>
                            <Link
                              href={`/courses/${c.id}`}
                              className="px-3 py-1.5 border border-line-gray-light dark:border-line-gray-dark text-slate dark:text-paper/70 hover:text-ink-navy dark:hover:text-paper rounded-lg text-xs font-semibold transition-all"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "mcqs" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              {/* Today's Set */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-ink-navy dark:text-paper" />
                  <h2 className="font-heading font-bold text-base text-ink-navy dark:text-paper">Today&apos;s Set</h2>
                </div>
                <div className="relative rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 overflow-hidden">
                  <div className="relative px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate dark:text-paper/40">Daily Upload</span>
                      <h3 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">Accounting Fundamentals</h3>
                      <p className="text-xs text-slate dark:text-paper/50">30 questions · ~25 min · Accounting</p>
                    </div>
                    <Link
                      href="/quiz/ca-accounting-free"
                      className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-xs"
                    >
                      Start Now <Zap className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Practice Library */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-line-gray-light dark:border-line-gray-dark pb-2">
                  <h2 className="font-heading font-bold text-base text-ink-navy dark:text-paper">Practice Library</h2>
                  <span className="text-xs text-slate dark:text-paper/45">{dbScrapedSeries.length} series</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {dbScrapedSeries.map((series, i) => (
                    <div
                      key={series.id}
                      className="flex items-center justify-between p-4 bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark rounded-xl hover:border-slate/50 dark:hover:border-paper transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 rounded bg-line-gray-light/60 dark:bg-line-gray-dark/40 border border-line-gray-light/35 text-ink-navy dark:text-paper flex items-center justify-center text-xs font-bold font-mono">
                          {(series.subject || "QQ").slice(0, 2).toUpperCase()}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-semibold text-xs text-ink-navy dark:text-paper truncate">{series.title}</p>
                            {!series.isLocked && !series.is_locked ? (
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-line-gray-light/50 dark:bg-line-gray-dark/60 text-slate dark:text-paper/70 flex-shrink-0">
                                Free
                              </span>
                            ) : (
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-line-gray-light/50 dark:bg-line-gray-dark/60 text-slate dark:text-paper/70 flex-shrink-0">
                                Paid
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate dark:text-paper/40">
                            {series.subject}
                          </p>
                        </div>
                      </div>

                      <div className="flex-shrink-0 pl-3">
                        <Link
                          href={`/mcq/${series.id}`}
                          className="flex items-center gap-1 text-xs font-semibold text-ink-navy dark:text-paper hover:underline"
                        >
                          {!series.isLocked && !series.is_locked ? (
                            <Unlock className="w-3 h-3 text-slate/50" />
                          ) : (
                            <Lock className="w-3 h-3 text-slate/50" />
                          )}
                          Enter
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === "results" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

              <div className="border-b border-line-gray-light dark:border-line-gray-dark pb-2">
                <h3 className="font-heading font-bold text-sm text-ink-navy dark:text-paper font-heading">Mock Tests & Checked Evaluations</h3>
                <p className="text-[10px] text-slate dark:text-paper/40 mt-0.5">Download questions, upload answer papers, and inspect evaluations.</p>
              </div>

              {loadingTests ? (
                <div className="text-center py-6 text-xs text-slate/50">Loading test catalog...</div>
              ) : tests.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate/50 italic border border-dashed border-line-gray-light dark:border-line-gray-dark rounded-xl">No active test evaluation systems configured currently.</div>
              ) : (
                <div className="space-y-4">
                  {tests.map(test => {
                    const sub = submissions.find(s => s.testId === test.id);
                    return (
                      <div key={test.id} className="p-5 border border-line-gray-light dark:border-line-gray-dark rounded-xl bg-white dark:bg-line-gray-dark/20 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

                        <div className="space-y-1.5 col-span-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-alert-coral bg-alert-coral/10 px-2 py-0.5 rounded">
                            {test.subject} · {test.duration}
                          </span>
                          <h4 className="font-heading font-extrabold text-sm text-ink-navy dark:text-paper leading-tight">{test.title}</h4>
                          <a
                            href={test.questionPaperLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-signal-emerald font-bold hover:underline"
                          >
                            📥 Download Question Paper
                          </a>
                        </div>

                        <div className="col-span-1">
                          {sub ? (
                            <div className="p-3.5 rounded-lg bg-paper dark:bg-line-gray-dark/30 border border-line-gray-light dark:border-line-gray-dark space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate dark:text-paper/40">Status:</span>
                                <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${sub.status === "reviewed"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-450"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-450"
                                  }`}>
                                  {sub.status === "reviewed" ? "Reviewed" : "Pending Review"}
                                </span>
                              </div>

                              {sub.status === "reviewed" ? (
                                <div className="space-y-2 text-xs">
                                  <div>
                                    <span className="text-slate/60 dark:text-paper/40 text-[10px] block">Score:</span>
                                    <strong className="text-ink-navy dark:text-paper text-sm font-bold font-mono">{sub.marksAwarded}</strong> / {sub.maxMarks}
                                  </div>
                                  {sub.remarks && (
                                    <div>
                                      <span className="text-slate/60 dark:text-paper/40 text-[10px] block">Remarks:</span>
                                      <p className="text-[10px] text-slate dark:text-paper/85 leading-normal italic py-1 border-l-2 border-line-gray-light dark:border-line-gray-dark pl-2">{sub.remarks}</p>
                                    </div>
                                  )}
                                  {sub.checkedCopyLink && (
                                    <a
                                      href={sub.checkedCopyLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-full mt-1.5 py-1.5 text-center bg-signal-emerald hover:bg-signal-emerald/90 text-white font-bold rounded text-[10px] flex items-center justify-center gap-1 active:scale-[98] transition-all"
                                    >
                                      📂 Download Evaluated Copy
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate dark:text-paper/50 leading-relaxed">
                                  Submitted on {new Date(sub.submittedAt).toLocaleDateString("en-IN")}. Reviews take 24-48 hours.
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-4 bg-paper/20 rounded-lg border border-dashed border-line-gray-light dark:border-line-gray-dark text-[10px] text-slate dark:text-paper/40">
                              You haven't submitted your answers yet.
                            </div>
                          )}
                        </div>

                        <div className="col-span-1 text-right">
                          {!sub && (
                            <>
                              {uploadingTestId === test.id ? (
                                <form onSubmit={(e) => handleUploadSubmit(e, test.id)} className="space-y-2 text-left">
                                  <label className="text-[10px] font-bold text-slate dark:text-paper/60 uppercase">Upload sheets (PDF/Images)</label>
                                  <input
                                    type="file"
                                    multiple
                                    required
                                    onChange={e => setSelectedFiles(e.target.files)}
                                    className="w-full text-xs text-slate dark:text-paper/50 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-line-gray-light file:text-ink-navy dark:file:bg-line-gray-dark dark:file:text-paper hover:file:opacity-90"
                                  />
                                  <div className="flex gap-2 pt-1">
                                    <button
                                      type="submit"
                                      disabled={submittingTest || !selectedFiles}
                                      className="flex-1 py-1.5 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded text-[10px] active:scale-[0.98] transition-all disabled:opacity-40"
                                    >
                                      {submittingTest ? "Submitting..." : "Submit File"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { setUploadingTestId(null); setSelectedFiles(null); }}
                                      className="px-2 py-1.5 border border-line-gray-light dark:border-line-gray-dark font-semibold text-slate dark:text-paper/50 rounded text-[10px]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <button
                                  onClick={() => setUploadingTestId(test.id)}
                                  className="w-full py-2 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-1.5"
                                >
                                  🚀 Upload Answer Copy
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* WhatsApp Access Modal popup */}
      <AnimatePresence>
        {accessCourseId && activeAccessCourse && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-navy/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setAccessCourseId(null)}>
            <motion.div initial={{ scale: 0.96, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 15 }}
              className="bg-paper dark:bg-ink-navy border border-line-gray-light dark:border-line-gray-dark rounded-xl p-6 max-w-sm w-full shadow-lg space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-ink-navy dark:text-paper">WhatsApp Access</h3>
                  <p className="text-[10px] font-bold text-slate dark:text-paper/50 mt-0.5">{activeAccessCourse.title}</p>
                </div>
                <button onClick={() => setAccessCourseId(null)} className="p-1 rounded hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors">
                  <X className="w-4 h-4 text-slate dark:text-paper/60" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/50 block">Your Access Link</span>

                  <div className="flex items-center justify-between p-2.5 rounded border border-line-gray-light dark:border-line-gray-dark bg-paper dark:bg-ink-navy text-xs">
                    <span className="font-mono text-slate dark:text-paper/85 overflow-hidden truncate select-all">{activeWhatsappLink}</span>
                    <button onClick={handleCopyLink} className="ml-2 p-1 hover:bg-line-gray-light dark:hover:bg-line-gray-dark rounded transition-colors text-slate dark:text-paper/60 flex-shrink-0">
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-signal-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <a
                    href={activeWhatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4.5 h-4.5" /> Join WhatsApp Group
                  </a>
                </div>

                <div className="flex gap-2 p-3 rounded bg-amber-500/5 border border-amber-500/15 text-[10px] text-amber-700 dark:text-amber-500 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    This link is tied to your account batch and must not be shared. Sharing links is a direct violation of our terms and will suspend course access.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div >
  );
}

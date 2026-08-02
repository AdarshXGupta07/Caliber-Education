"use client";

import React, { Fragment, useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  pendingVerifications, mcqSets, courses as initialCourses,
  registeredUsers, mcqSeries,
  type PaymentVerification, type MCQSet, type Question,
  type Course, type Mentor, type MCQSeries,
} from "@/lib/mockData";
import {
  Shield, ShieldOff, CheckCircle, XCircle, Upload, Plus, BookOpen,
  Users, Clock, CheckCheck, AlertTriangle, Trash2, ChevronDown,
  ChevronRight, Edit2, X, GripVertical, RefreshCw, Download, Tag, UserCheck
} from "lucide-react";

const inp = "w-full px-3 py-2 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-xl focus:outline-none focus:border-signal-emerald transition-colors";

const ConfirmContext = createContext<{ confirm: (msg: string) => Promise<boolean> } | null>(null);
const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) return async () => window.confirm("Please confirm action.");
  return ctx.confirm;
};

function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [resolver, setResolver] = useState<{ resolve: (val: boolean) => void } | null>(null);

  const confirm = (msg: string) => {
    setMessage(msg);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver({ resolve });
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) resolver.resolve(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver) resolver.resolve(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink-navy/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-line-gray-dark border border-line-gray-light dark:border-line-gray-dark rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
              <h3 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">Confirm Action</h3>
              <p className="text-sm text-slate dark:text-paper/60">{message}</p>
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={handleCancel} className="px-4 py-2 text-sm font-semibold rounded-xl text-slate dark:text-paper/60 border border-line-gray-light dark:border-line-gray-dark hover:bg-line-gray-light dark:hover:bg-line-gray-dark/50 transition-colors">Cancel</button>
                <button onClick={handleConfirm} className="px-4 py-2 text-sm font-semibold rounded-xl bg-alert-coral text-white hover:opacity-90 transition-colors">Confirm</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, isAuthenticated, toggleRole } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isAuthenticated) router.push("/login"); }, [isAuthenticated, router]);
  if (!isAuthenticated || !user) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-paper/40 dark:bg-ink-navy/40 backdrop-blur-md transition-all duration-500">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-line-gray-light dark:border-line-gray-dark border-t-alert-coral rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold font-heading text-ink-navy dark:text-paper uppercase tracking-widest animate-pulse">
            Authenticating Admin
          </p>
        </div>
      </div>
    );
  }
  if (user.role !== "admin") return <AccessDenied onToggle={toggleRole} />;
  return (
    <ConfirmProvider>
      <AdminDashboard />
    </ConfirmProvider>
  );
}

function AccessDenied({ onToggle }: { onToggle: () => void }) {
  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-alert-coral/10 border border-alert-coral/30 flex items-center justify-center mx-auto">
          <ShieldOff className="w-9 h-9 text-alert-coral" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-2xl text-ink-navy dark:text-paper">Access Denied</h2>
          <p className="text-sm text-slate dark:text-paper/60 mt-2 leading-relaxed">Enable Admin Mode from your dashboard to access this page.</p>
        </div>
        <button onClick={onToggle} className="w-full flex items-center justify-center gap-2 py-3 bg-alert-coral text-white font-bold rounded-xl hover:bg-alert-coral/90 transition-colors">
          <Shield className="w-4 h-4" /> Enable Admin Mode
        </button>
      </motion.div>
    </div>
  );
}

type AdminTab = "payments" | "users" | "mcq" | "series" | "courses" | "evaluations" | "coupons" | "affiliates";

interface PendingEvaluation {
  id: string;
  studentEmail: string;
  studentName: string;
  testTitle: string;
  submittedAt: string;
  studentFiles: string[];
}

function EvaluationsTab() {
  const [pending, setPending] = useState<PendingEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<PendingEvaluation | null>(null);
  const [marks, setMarks] = useState("");
  const [remarks, setRemarks] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchPendingSubmissions = async () => {
      setLoading(true);
      try {
        const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
        const token = localStorage.getItem("caliber_jwt") || "";
        const res = await fetch(`${apiURL}/api/admin/submissions/pending`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPending(data.submissions || data);
        } else {
          throw new Error("Unable to fetch submissions");
        }
      } catch (err) {
        console.warn("Loading mock pending evaluations roster");
        const defaultMock = [
          {
            id: "sub-2",
            studentEmail: "student@caliber.com",
            studentName: "Aditya Jain",
            testTitle: "Advanced Financial Reporting Test",
            submittedAt: "2026-07-28T09:00:00Z",
            studentFiles: ["FR_consolidation_sheets.pdf", "FR_working_notes.jpg"]
          },
          {
            id: "sub-3",
            studentEmail: "tester@gmail.com",
            studentName: "Karan Gupta",
            testTitle: "Corporate Law Assessment",
            submittedAt: "2026-07-29T11:45:00Z",
            studentFiles: ["CorpLaw_Answers_Draft1.pdf"]
          }
        ];
        const saved = localStorage.getItem("caliber_admin_pending_evaluations");
        if (saved) {
          setPending(JSON.parse(saved));
        } else {
          setPending(defaultMock);
          localStorage.setItem("caliber_admin_pending_evaluations", JSON.stringify(defaultMock));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPendingSubmissions();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewing) return;
    setSubmittingReview(true);

    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";

      const formData = new FormData();
      formData.append("marks", marks);
      formData.append("remarks", remarks);
      if (uploadedFile) {
        formData.append("checkedFile", uploadedFile);
      }

      const res = await fetch(`${apiURL}/api/admin/submissions/${reviewing.id}/review`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setPending(prev => prev.filter(p => p.id !== reviewing.id));
      } else {
        throw new Error("Review submission endpoint rejected evaluation payload");
      }
    } catch (err) {
      console.warn("Review submission completed locally");
      const updatedPending = pending.filter(p => p.id !== reviewing.id);
      setPending(updatedPending);
      localStorage.setItem("caliber_admin_pending_evaluations", JSON.stringify(updatedPending));

      const studentSubs = JSON.parse(localStorage.getItem("caliber_submissions_tests") || "[]");
      const targetSub = studentSubs.find((s: any) => s.id === reviewing.id || s.testId === "t1");
      if (targetSub) {
        targetSub.status = "reviewed";
        targetSub.marksAwarded = Number(marks);
        targetSub.remarks = remarks;
        targetSub.checkedCopyLink = uploadedFile ? `/files/${uploadedFile.name}` : "https://caliber.education/downloads/checked-copy-demo.pdf";
      }
      localStorage.setItem("caliber_submissions_tests", JSON.stringify(studentSubs));
    } finally {
      setSubmittingReview(false);
      setReviewing(null);
      setMarks("");
      setRemarks("");
      setUploadedFile(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-heading font-extrabold text-lg text-ink-navy dark:text-paper">Paper Evaluations</h2>
          <p className="text-xs text-slate dark:text-paper/50">Assess student mocks and upload evaluated papers.</p>
        </div>
      </div>

      {reviewing ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-line-gray-light dark:border-line-gray-dark pb-3">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate dark:text-paper/40">Evaluating Submission</span>
              <h3 className="font-heading font-bold text-sm text-ink-navy dark:text-paper">{reviewing.testTitle}</h3>
              <p className="text-xs text-slate dark:text-paper/50 mt-0.5">Student: {reviewing.studentName} ({reviewing.studentEmail})</p>
            </div>
            <button onClick={() => setReviewing(null)} className="p-1 rounded hover:bg-line-gray-light dark:hover:bg-line-gray-dark text-slate dark:text-paper/60"><X className="w-4 h-4" /></button>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate dark:text-paper/60 uppercase">Student Answer Sheets</p>
            <div className="flex flex-wrap gap-2">
              {reviewing.studentFiles.map(file => (
                <a
                  key={file}
                  href={`#download-${file}`}
                  className="px-3 py-1.5 border border-line-gray-light dark:border-line-gray-dark rounded bg-paper dark:bg-line-gray-dark/65 hover:opacity-85 text-xs text-ink-navy dark:text-paper font-medium flex items-center gap-1.5"
                  onClick={() => alert(`Downloading student copy: ${file}`)}
                >
                  📄 {file}
                </a>
              ))}
            </div>
          </div>

          <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2 border-t border-line-gray-light dark:border-line-gray-dark">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Marks Awarded (out of 100)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="105"
                  placeholder="e.g. 78"
                  value={marks}
                  onChange={e => setMarks(e.target.value)}
                  className={inp}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Upload Checked Answer Sheet</label>
                <input
                  type="file"
                  required
                  onChange={e => setUploadedFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate dark:text-paper/50 file:mr-2 file:py-1.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-line-gray-light file:text-ink-navy dark:file:bg-line-gray-dark dark:file:text-paper hover:file:opacity-90"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block font-heading">Feedback & Remarks</label>
              <textarea
                required
                rows={4}
                placeholder="Give constructive feedback on errors, presentation style..."
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className={`${inp} resize-none`}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-2 bg-signal-emerald text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-40"
              >
                {submittingReview ? "Submitting Review..." : "Submit Review & Send Email Notify"}
              </button>
              <button
                type="button"
                onClick={() => setReviewing(null)}
                className="px-6 py-2 border border-line-gray-light dark:border-line-gray-dark text-xs font-semibold text-slate dark:text-paper/70 rounded-lg hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      ) : loading ? (
        <div className="text-center py-10 text-xs text-slate/50">Fetching student submissions lists...</div>
      ) : pending.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/10 rounded-2xl text-xs text-slate/50">
          No pending test submissions needing review right now. Nice job!
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-line-gray-light/50 dark:bg-line-gray-dark/50 text-slate dark:text-paper/40 font-semibold uppercase tracking-wider">
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Test Title</th>
                <th className="px-5 py-3">Submitted On</th>
                <th className="px-5 py-3">Uploaded Sheets</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-gray-light dark:divide-line-gray-dark">
              {pending.map(item => (
                <tr key={item.id} className="hover:bg-line-gray-light/10 dark:hover:bg-line-gray-dark/10 font-medium">
                  <td className="px-5 py-3.5">
                    <div className="text-ink-navy dark:text-paper font-semibold">{item.studentName}</div>
                    <div className="text-[10px] text-slate dark:text-paper/40 font-normal">{item.studentEmail}</div>
                  </td>
                  <td className="px-5 py-3.5 text-ink-navy dark:text-paper">{item.testTitle}</td>
                  <td className="px-5 py-3.5 font-mono text-[10px] text-slate dark:text-paper/40">
                    {new Date(item.submittedAt).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </td>
                  <td className="px-5 py-3.5 text-slate dark:text-paper/50">{item.studentFiles.length} file(s)</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setReviewing(item)}
                      className="px-3 py-1.5 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy text-[10px] font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("payments");
  const [series, setSeries] = useState<MCQSeries[]>([]);
  const { verifications } = useAuth();

  useEffect(() => {
    async function loadSeries() {
      try {
        const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
        const token = localStorage.getItem("caliber_jwt") || "";
        const res = await fetch(`${apiURL}/api/admin/mcq-series`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Map DB snake_case if necessary, or just standard fields
          setSeries(data.map((s: any) => ({
            id: s.id,
            title: s.title,
            subject: s.subject || "",
            description: s.description || "",
            price: s.price || 0,
            isLocked: s.is_locked || false
          })));
        }
      } catch (e) { }
    }
    loadSeries();
  }, []);

  const tabs: { id: AdminTab; label: string }[] = [
    { id: "payments", label: "Payments" },
    { id: "users", label: "Users" },
    { id: "coupons", label: "Coupons" },
    { id: "affiliates", label: "Affiliates" },
    { id: "mcq", label: "MCQ Sets" },
    { id: "series" as any, label: "Series" },
    { id: "courses" as any, label: "Courses" },
    { id: "bundles" as any, label: "Bundles" },
    { id: "evaluations" as any, label: "Evaluations" },
  ];

  return (
    <div className="pt-16 min-h-screen bg-line-gray-light/20 dark:bg-line-gray-dark/10 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-alert-coral/10 border border-alert-coral/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-alert-coral" />
            </div>
            <div>
              <p className="text-xs font-mono text-alert-coral uppercase tracking-widest">Admin View</p>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink-navy dark:text-paper">Admin Dashboard</h1>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <Users className="w-4 h-4" />, value: registeredUsers.length.toString(), label: "Registered Users", color: "text-signal-emerald" },
            { icon: <BookOpen className="w-4 h-4" />, value: initialCourses.length.toString(), label: "Active Courses", color: "text-blue-500" },
            { icon: <Clock className="w-4 h-4" />, value: verifications.filter(v => v.status === "pending").length.toString(), label: "Pending Payments", color: "text-yellow-500" },
            { icon: <Upload className="w-4 h-4" />, value: "Active", label: "MCQ Sets", color: "text-purple-500" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl p-4">
              <div className={`w-8 h-8 rounded-lg bg-current/10 flex items-center justify-center ${s.color} mb-2`}>{s.icon}</div>
              <div className={`font-heading font-bold text-2xl ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate dark:text-paper/50 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-1 p-1 bg-line-gray-light dark:bg-line-gray-dark rounded-xl w-full sm:w-fit overflow-x-auto whitespace-nowrap" style={{ scrollbarWidth: "none" }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${(activeTab as string) === t.id ? "bg-white dark:bg-ink-navy text-ink-navy dark:text-paper shadow-sm" : "text-slate dark:text-paper/60 hover:text-ink-navy dark:hover:text-paper"
                }`}>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {(activeTab as string) === "payments" && <PaymentsTab key="payments" />}
          {(activeTab as string) === "users" && <UsersTab key="users" />}
          {(activeTab as string) === "coupons" && <CouponsTab key="coupons" />}
          {(activeTab as string) === "affiliates" && <AffiliatesTab key="affiliates" />}
          {(activeTab as string) === "mcq" && <MCQSetsTab key="mcq" series={series} />}
          {(activeTab as string) === "series" && <SeriesTab key="series" items={series} setItems={setSeries} />}
          {(activeTab as string) === "courses" && <CoursesTab key="courses" series={series} />}
          {(activeTab as string) === "bundles" && <BundlesTab key="bundles" />}
          {(activeTab as string) === "evaluations" && <EvaluationsTab key="evaluations" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: PaymentVerification["status"] }) {
  const map = {
    approved: { cls: "bg-signal-emerald/10 text-signal-emerald", icon: <CheckCircle className="w-3 h-3" />, label: "Approved" },
    rejected: { cls: "bg-alert-coral/10 text-alert-coral", icon: <XCircle className="w-3 h-3" />, label: "Rejected" },
    refunded: { cls: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400", icon: <RefreshCw className="w-3 h-3" />, label: "Refunded" },
    pending: { cls: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400", icon: <AlertTriangle className="w-3 h-3" />, label: "Pending" },
  };
  const s = map[status];
  return <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${s.cls}`}>{s.icon} {s.label}</span>;
}

// ─── PAYMENTS TAB ────────────────────────────────────────────────────────
function PaymentsTab() {
  const { verifications, approveVerification, rejectVerification } = useAuth();
  const [statusFilter, setStatusFilter] = useState<PaymentVerification["status"] | "all">("all");
  const filtered = statusFilter === "all" ? verifications : verifications.filter(v => v.status === statusFilter);

  return (
    <motion.div key="payments" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">Transaction History</h2>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "pending", "approved", "rejected", "refunded"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors capitalize ${statusFilter === s ? "bg-signal-emerald text-white" : "bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/60 hover:bg-signal-emerald/10 hover:text-signal-emerald"
                }`}>
              {s === "all" ? `All (${verifications.length})` : `${s} (${verifications.filter(v => v.status === s).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-line-gray-light dark:border-line-gray-dark">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-line-gray-light/50 dark:bg-line-gray-dark/50 text-left text-xs text-slate dark:text-paper/50 uppercase tracking-wider">
              {["Student Email", "Course / Set", "Amount", "UTR", "Date", "Status", "Actions"].map(h => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-line-gray-light dark:divide-line-gray-dark bg-white dark:bg-line-gray-dark/20">
            {filtered.map((v, i) => (
              <motion.tr key={v.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="hover:bg-line-gray-light/30 dark:hover:bg-line-gray-dark/30 transition-colors">
                <td className="px-5 py-3.5 text-ink-navy dark:text-paper font-medium">{v.studentEmail}</td>
                <td className="px-5 py-3.5 text-slate dark:text-paper/70 max-w-[160px] truncate">{v.courseTitle}</td>
                <td className="px-5 py-3.5 font-mono font-semibold text-ink-navy dark:text-paper">₹{v.amount.toLocaleString()}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-slate dark:text-paper/60">{v.utrNumber}</td>
                <td className="px-5 py-3.5 text-slate dark:text-paper/60">{v.date}</td>
                <td className="px-5 py-3.5"><StatusBadge status={v.status} /></td>
                <td className="px-5 py-3.5">
                  {v.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => approveVerification(v.id)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-signal-emerald border border-signal-emerald/30 rounded-lg hover:bg-signal-emerald/10 transition-colors"><CheckCheck className="w-3 h-3" /> Approve</button>
                      <button onClick={() => rejectVerification(v.id)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-alert-coral border border-alert-coral/30 rounded-lg hover:bg-alert-coral/10 transition-colors"><XCircle className="w-3 h-3" /> Reject</button>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden space-y-3">
        {filtered.map((v, i) => (
          <motion.div key={v.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="p-4 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-xl space-y-3">
            <div className="flex items-start justify-between">
              <div><p className="font-semibold text-sm text-ink-navy dark:text-paper">{v.studentEmail}</p><p className="text-xs text-slate dark:text-paper/60 mt-0.5">{v.courseTitle}</p></div>
              <StatusBadge status={v.status} />
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate dark:text-paper/60">
              <span className="font-mono font-bold text-ink-navy dark:text-paper">₹{v.amount.toLocaleString()}</span>
              <span>{v.utrNumber}</span><span>{v.date}</span>
            </div>
            {v.status === "pending" && (
              <div className="flex gap-2">
                <button onClick={() => approveVerification(v.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-signal-emerald border border-signal-emerald/30 rounded-lg hover:bg-signal-emerald/10 transition-colors"><CheckCheck className="w-3 h-3" /> Approve</button>
                <button onClick={() => rejectVerification(v.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-alert-coral border border-alert-coral/30 rounded-lg hover:bg-alert-coral/10 transition-colors"><XCircle className="w-3 h-3" /> Reject</button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── USERS TAB ───────────────────────────────────────────────────────────
function UsersTab() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [localUsers, setLocalUsers] = useState(registeredUsers);
  const confirm = useConfirm();

  const handleUnenrollFromUser = async (userId: string, pIndex: number, cTitle: string) => {
    if (!(await confirm(`Are you sure you want to unenroll student from ${cTitle}?`))) return;
    const newUsers = [...localUsers];
    const uIndex = newUsers.findIndex(u => u.id === userId);
    if (uIndex !== -1) {
      const userCopy = { ...newUsers[uIndex] };
      userCopy.purchases = [...userCopy.purchases];
      userCopy.purchases.splice(pIndex, 1);
      newUsers[uIndex] = userCopy;
      setLocalUsers(newUsers);
    }
  };

  const handleExportCSV = async () => {
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";
      const res = await fetch(`${apiURL}/api/admin/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      let usersToExport = localUsers;
      if (res.ok) {
        usersToExport = await res.json();
      }

      const cMap = new Map<string, string>();
      initialCourses.forEach(c => cMap.set(c.title, c.duration));

      const headers = [
        "ID", "Email", "Full Name", "Phone", "Address", "Stage", "Attempt Status",
        "User Joined At", "Course Selected", "Enrollment Date", "End Date", "Total Duration"
      ];
      const csvRows = [headers.join(",")];

      for (const user of usersToExport) {
        const u = user as any;
        const id = u.id || "";
        const email = u.email || "";
        const fullName = u.full_name || u.fullName || "";
        const phone = u.phone_number || u.phoneNumber || "";
        const address = `"${(u.address || "").replace(/"/g, '""')}"`;
        const stage = u.stage || "";
        const attempt = u.attempt_status || u.attemptStatus || "";
        const joined = u.created_at || u.joinDate || "";

        if (u.purchases && u.purchases.length > 0) {
          for (const purchase of u.purchases) {
            const courseTitle = `"${(purchase.courseTitle || "").replace(/"/g, '""')}"`;
            const enrollDate = purchase.date || "";

            let duration = cMap.get(purchase.courseTitle) || "";
            let endDate = "";

            if (duration && enrollDate) {
              const dNum = parseInt(duration);
              if (!isNaN(dNum)) {
                const dateObj = new Date(enrollDate);
                if (!isNaN(dateObj.getTime())) {
                  if (duration.toLowerCase().includes("week")) {
                    dateObj.setDate(dateObj.getDate() + dNum * 7);
                    endDate = dateObj.toLocaleDateString("en-CA");
                  } else if (duration.toLowerCase().includes("month")) {
                    dateObj.setMonth(dateObj.getMonth() + dNum);
                    endDate = dateObj.toLocaleDateString("en-CA");
                  } else {
                    endDate = "N/A";
                  }
                } else {
                  endDate = "N/A";
                }
              } else {
                endDate = "N/A";
              }
            }

            csvRows.push([id, email, fullName, phone, address, stage, attempt, joined, courseTitle, enrollDate, endDate, duration].join(","));
          }
        } else {
          csvRows.push([id, email, fullName, phone, address, stage, attempt, joined, "None", "", "", ""].join(","));
        }
      }

      const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `caliber_students_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to export CSV. Try again later.");
    }
  };

  return (
    <motion.div key="users" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">Registered Users</h2>
        <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-signal-emerald text-white rounded-xl hover:bg-signal-emerald/90 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export to CSV
        </button>
      </div>
      <div className="space-y-2">
        {localUsers.map((u, i) => (
          <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-line-gray-light dark:border-line-gray-dark overflow-hidden bg-white dark:bg-line-gray-dark/20">
            <button onClick={() => setExpanded(expanded === u.id ? null : u.id)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-line-gray-light/30 dark:hover:bg-line-gray-dark/30 transition-colors text-left">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-signal-emerald/20 flex items-center justify-center text-signal-emerald text-xs font-bold">{u.email[0].toUpperCase()}</div>
                <div><p className="text-sm font-semibold text-ink-navy dark:text-paper">{u.email}</p><p className="text-xs text-slate dark:text-paper/50">Joined {u.joinDate}</p></div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate dark:text-paper/50 mr-2">
                <span>{u.purchases.length} purchase{u.purchases.length !== 1 ? "s" : ""}</span>
                <span>{u.quizAttempts.length} attempt{u.quizAttempts.length !== 1 ? "s" : ""}</span>
                {expanded === u.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </button>
            <AnimatePresence initial={false}>
              {expanded === u.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="px-5 pb-5 pt-1 border-t border-line-gray-light dark:border-line-gray-dark space-y-4 bg-line-gray-light/10 dark:bg-line-gray-dark/10">
                    <div>
                      <p className="text-xs font-semibold text-ink-navy dark:text-paper uppercase tracking-wide mb-2">Purchases</p>
                      {u.purchases.length === 0 ? <p className="text-xs text-slate dark:text-paper/50">No purchases yet.</p> : (
                        <div className="space-y-1.5">{u.purchases.map((p, pi) => (
                          <div key={pi} className="flex items-center justify-between text-xs p-2 rounded border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/40">
                            <span className="text-ink-navy dark:text-paper font-medium">{p.courseTitle}</span>
                            <div className="flex items-center gap-3 text-slate dark:text-paper/50">
                              <span className="font-mono font-semibold text-ink-navy dark:text-paper">₹{p.amount.toLocaleString()}</span>
                              <span>{p.date}</span>
                              <button onClick={() => handleUnenrollFromUser(u.id, pi, p.courseTitle)} className="p-1 rounded bg-alert-coral/10 text-alert-coral hover:bg-alert-coral/20 hover:text-alert-coral transition-colors" title="Unenroll student">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}</div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ink-navy dark:text-paper uppercase tracking-wide mb-2">Quiz Attempts</p>
                      {u.quizAttempts.length === 0 ? <p className="text-xs text-slate dark:text-paper/50">No attempts yet.</p> : (
                        <div className="space-y-1.5">{u.quizAttempts.map((q, qi) => (
                          <div key={qi} className="flex items-center justify-between text-xs">
                            <span className="text-ink-navy dark:text-paper">{q.setTitle}</span>
                            <div className="flex items-center gap-3 text-slate dark:text-paper/50">
                              <span className={`font-mono font-bold ${q.score / q.total >= 0.6 ? "text-signal-emerald" : "text-alert-coral"}`}>{String(q.score).padStart(2, "0")}/{q.total}</span>
                              <span>{q.date}</span>
                            </div>
                          </div>
                        ))}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
// ─── MCQ SETS TAB — Set builder with Sections ────────────────────────────
type SetDraft = Omit<MCQSet, "sections"> & { sections: SectionDraft[] };
type SectionDraft = { id: string; title: string; questions: Question[] };

const emptyQuestion = (): Question => ({
  id: crypto.randomUUID(), type: "case", caseText: "", text: "", options: ["", "", "", ""], correctOptionIndex: 0, explanation: ""
});

const emptySection = (sIndex: number): SectionDraft => ({
  id: crypto.randomUUID(), title: `Section ${String.fromCharCode(65 + sIndex)}`, questions: [emptyQuestion()]
});

function MCQSetsTab({ series }: { series: MCQSeries[] }) {
  const confirm = useConfirm();
  const [sets, setSets] = useState<SetDraft[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SetDraft | null>(null);
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);

  useEffect(() => {
    async function loadSets() {
      try {
        const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
        const token = localStorage.getItem("caliber_jwt") || "";
        const res = await fetch(`${apiURL}/api/admin/mcq-sets`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Enriched sets mapped nicely by backend 
          setSets(data);
        }
      } catch (e) { }
    }
    loadSets();
  }, []);

  function openNew() {
    const d: SetDraft = {
      id: crypto.randomUUID(), seriesId: series[0]?.id ?? "", title: "", isLocked: false, price: 0,
      description: "", subject: "",
      sections: [emptySection(0)],
      topperStats: { score: 0, totalTimeSeconds: 0, perQuestionTimes: [0] },
    };
    setDraft(d); setEditingId("__new__");
  }

  function openEdit(set: SetDraft) {
    setDraft(JSON.parse(JSON.stringify(set)));
    setEditingId(set.id);
  }

  function closeEditor() { setEditingId(null); setDraft(null); }

  async function saveSet() {
    if (!draft) return;
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";
      const res = await fetch(`${apiURL}/api/admin/mcq-sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(draft)
      });
      if (!res.ok) throw new Error();
      if (editingId === "__new__") setSets(prev => [...prev, draft]);
      else setSets(prev => prev.map(s => s.id === editingId ? draft : s));
      closeEditor();
    } catch {
      alert("Error saving set to database.");
    }
  }

  async function deleteSet(id: string) {
    if (!(await confirm("Delete MCQ Set permanently?"))) return;
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";
      const res = await fetch(`${apiURL}/api/admin/mcq-sets/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setSets(prev => prev.filter(s => s.id !== id));
      } else alert("Delete failed");
    } catch {
      alert("Error contacting server");
    }
  }

  // ── Draft helpers — sections ──
  function addSection() {
    if (!draft) return;
    setDraft({ ...draft, sections: [...draft.sections, emptySection(draft.sections.length)] });
  }
  function removeSection(si: number) {
    if (!draft || draft.sections.length <= 1) return;
    setDraft({ ...draft, sections: draft.sections.filter((_, i) => i !== si) });
  }
  function updateSectionTitle(si: number, title: string) {
    if (!draft) return;
    const sections = draft.sections.map((s, i) => i === si ? { ...s, title } : s);
    setDraft({ ...draft, sections });
  }

  // ── Draft helpers — questions ──
  function addQuestion(si: number) {
    if (!draft) return;
    const updated = [...draft.sections];
    updated[si].questions = [...updated[si].questions, emptyQuestion()];
    setDraft({ ...draft, sections: updated });
  }
  function removeQuestion(si: number, qi: number) {
    if (!draft) return;
    const sections = draft.sections.map((s, i) => i === si ? { ...s, questions: s.questions.filter((_, j) => j !== qi) } : s);
    setDraft({ ...draft, sections });
  }
  function updateQuestion(si: number, qi: number, updated: Question) {
    if (!draft) return;
    const sections = draft.sections.map((s, i) => {
      if (i !== si) return s;
      const questions = s.questions.map((q, j) => j === qi ? updated : q);
      return { ...s, questions };
    });
    setDraft({ ...draft, sections });
  }
  function moveQuestion(si: number, qi: number, dir: -1 | 1) {
    if (!draft) return;
    const sections = draft.sections.map((s, i) => {
      if (i !== si) return s;
      const qs = [...s.questions];
      const target = qi + dir;
      if (target < 0 || target >= qs.length) return s;
      [qs[qi], qs[target]] = [qs[target], qs[qi]];
      return { ...s, questions: qs };
    });
    setDraft({ ...draft, sections });
  }

  // ── Builder view ──
  if (editingId !== null && draft) {
    const totalQs = draft.sections.reduce((sum, s) => sum + s.questions.length, 0);
    return (
      <motion.div key="set-builder" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">{editingId === "__new__" ? "New Set" : "Edit Set"}</h2>
          <button onClick={closeEditor} className="p-2 rounded-lg hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors"><X className="w-4 h-4 text-slate dark:text-paper/60" /></button>
        </div>

        {/* Set-level fields */}
        <div className="p-5 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-4">
          <p className="text-xs font-semibold text-slate dark:text-paper/60 uppercase tracking-wide">Set Details</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Title</label><input className={inp} placeholder="e.g. Accounting Fundamentals" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} /></div>
            <div><label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Series</label>
              <select className={inp} value={draft.seriesId} onChange={e => setDraft({ ...draft, seriesId: e.target.value })}>
                {series.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2"><label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Description</label><textarea className={`${inp} resize-none`} rows={2} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" checked={!draft.isLocked} onChange={() => setDraft({ ...draft, isLocked: false, price: 0 })} className="accent-signal-emerald" /><span className="text-ink-navy dark:text-paper">Free</span></label>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" checked={draft.isLocked} onChange={() => setDraft({ ...draft, isLocked: true, price: draft.price || 49 })} className="accent-signal-emerald" /><span className="text-ink-navy dark:text-paper">Locked</span></label>
            {draft.isLocked && (
              <div className="flex items-center gap-2"><span className="text-sm text-slate dark:text-paper/60">₹</span><input type="number" className={`${inp} w-24`} value={draft.price} onChange={e => setDraft({ ...draft, price: Number(e.target.value) })} /></div>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-navy dark:text-paper">{draft.sections.length} Section{draft.sections.length !== 1 ? "s" : ""} · {totalQs} Question{totalQs !== 1 ? "s" : ""}</p>
            <button onClick={addSection} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy rounded-xl hover:opacity-90 transition-all"><Plus className="w-3.5 h-3.5" /> Add Section</button>
          </div>

          {draft.sections.map((section, si) => (
            <div key={section.id} className="rounded-2xl border border-line-gray-light dark:border-line-gray-dark overflow-hidden bg-white dark:bg-line-gray-dark/20">
              {/* Section header */}
              <div className="flex items-center gap-3 px-5 py-3 bg-line-gray-light/30 dark:bg-line-gray-dark/30 border-b border-line-gray-light dark:border-line-gray-dark">
                <span className="font-mono text-xs font-bold text-slate dark:text-paper/50 w-5">{si + 1}</span>
                <input className={`${inp} flex-1 text-sm font-semibold`} value={section.title} onChange={e => updateSectionTitle(si, e.target.value)} placeholder={`Section ${String.fromCharCode(65 + si)} — name`} />
                <button onClick={() => removeSection(si)} disabled={draft.sections.length <= 1} className="p-1.5 text-slate/40 hover:text-alert-coral hover:bg-alert-coral/10 rounded-lg transition-colors disabled:opacity-20"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>

              {/* Questions in this section */}
              <div className="p-4 space-y-4">
                {section.questions.map((q, qi) => (
                  <div key={qi} className="p-4 bg-line-gray-light/20 dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-signal-emerald font-bold w-6">Q{qi + 1}</span>
                      <div className="flex gap-1 ml-auto">
                        <button onClick={() => moveQuestion(si, qi, -1)} disabled={qi === 0} className="p-1 rounded hover:bg-line-gray-light dark:hover:bg-line-gray-dark disabled:opacity-30 transition-colors">
                          <GripVertical className="w-3.5 h-3.5 text-slate dark:text-paper/50 rotate-90" />
                        </button>
                        <button onClick={() => removeQuestion(si, qi)} className="p-1 rounded hover:bg-alert-coral/10 text-slate dark:text-paper/50 hover:text-alert-coral transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <label className="text-xs font-medium text-slate dark:text-paper/70">Question Type:</label>
                      <select className={`${inp} w-auto`} value={q.type || "case"} onChange={e => updateQuestion(si, qi, { ...q, type: e.target.value as "case" | "normal" })}>
                        <option value="case">Case Based (Default)</option>
                        <option value="normal">Normal MCQ</option>
                      </select>
                    </div>
                    {(!q.type || q.type === "case") && (
                      <div className="mb-3"><label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Case / Passage Text</label><textarea className={`${inp} resize-y`} minLength={20} rows={4} value={q.caseText || ""} onChange={e => updateQuestion(si, qi, { ...q, caseText: e.target.value })} /></div>
                    )}
                    <div><label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Question Text</label><textarea className={`${inp} resize-none`} rows={2} value={q.text} onChange={e => updateQuestion(si, qi, { ...q, text: e.target.value })} /></div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input type="radio" name={`correct-${si}-${qi}`} checked={q.correctOptionIndex === oi} onChange={() => updateQuestion(si, qi, { ...q, correctOptionIndex: oi })} className="accent-signal-emerald flex-shrink-0" title={`Mark option ${String.fromCharCode(65 + oi)} as correct`} />
                          <input className={inp} placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt} onChange={e => { const opts = [...q.options]; opts[oi] = e.target.value; updateQuestion(si, qi, { ...q, options: opts }); }} />
                        </div>
                      ))}
                    </div>
                    <div><label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Explanation (optional)</label><textarea className={`${inp} resize-none`} rows={2} value={q.explanation} onChange={e => updateQuestion(si, qi, { ...q, explanation: e.target.value })} /></div>
                  </div>
                ))}
                <button onClick={() => addQuestion(si)} className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-signal-emerald border border-signal-emerald/30 rounded-xl hover:bg-signal-emerald/5 transition-colors"><Plus className="w-3.5 h-3.5" /> Add Question to this Section</button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={saveSet} className="px-6 py-2.5 bg-signal-emerald text-white text-sm font-bold rounded-xl hover:bg-signal-emerald/90 transition-colors">Save Set</button>
          <button onClick={closeEditor} className="px-6 py-2.5 border border-line-gray-light dark:border-line-gray-dark text-sm font-semibold text-slate dark:text-paper/60 rounded-xl hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors">Cancel</button>
        </div>
      </motion.div>
    );
  }

  // ── Table grouped by Series ──
  return (
    <motion.div key="sets-list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">MCQ Sets</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-signal-emerald text-white rounded-xl hover:bg-signal-emerald/90 transition-colors"><Plus className="w-3.5 h-3.5" /> New Set</button>
      </div>
      <div className="space-y-1">
        {series.map((seriesItem) => {
          const seriesSets = sets.filter(s => s.seriesId === seriesItem.id);
          return (
            <div key={seriesItem.id} className="rounded-2xl border border-line-gray-light dark:border-line-gray-dark overflow-hidden">
              <button onClick={() => setExpandedSeries(expandedSeries === seriesItem.id ? null : seriesItem.id)}
                className="w-full flex items-center gap-2 px-5 py-3 bg-line-gray-light/40 dark:bg-line-gray-dark/40 hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors text-left">
                {expandedSeries === seriesItem.id ? <ChevronDown className="w-3.5 h-3.5 text-slate dark:text-paper/50" /> : <ChevronRight className="w-3.5 h-3.5 text-slate dark:text-paper/50" />}
                <span className="text-xs font-bold text-ink-navy dark:text-paper">{seriesItem.title}</span>
                <span className="text-xs font-normal text-slate dark:text-paper/50">· {seriesItem.subject} · {seriesSets.length} set{seriesSets.length !== 1 ? "s" : ""}</span>
              </button>
              <AnimatePresence initial={false}>
                {expandedSeries === seriesItem.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    {seriesSets.length === 0 ? (
                      <p className="px-5 py-4 text-xs text-slate dark:text-paper/50">No sets in this series yet.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-line-gray-light/20 dark:bg-line-gray-dark/20 text-left text-xs text-slate dark:text-paper/50 uppercase tracking-wider">
                            {["Title", "Sections", "Questions", "Access", "Actions"].map(h => <th key={h} className="px-5 py-2 font-semibold">{h}</th>)}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line-gray-light dark:divide-line-gray-dark bg-white dark:bg-line-gray-dark/20">
                          {seriesSets.map((s, i) => (
                            <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                              className="hover:bg-line-gray-light/30 dark:hover:bg-line-gray-dark/30 transition-colors">
                              <td className="px-5 py-3 font-medium text-ink-navy dark:text-paper">{s.title}</td>
                              <td className="px-5 py-3 font-mono text-slate dark:text-paper/60">{s.sections.length}</td>
                              <td className="px-5 py-3 font-mono text-slate dark:text-paper/60">{s.sections.reduce((sum, sec) => sum + sec.questions.length, 0)}</td>
                              <td className="px-5 py-3">
                                {!s.isLocked
                                  ? <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-signal-emerald/10 text-signal-emerald">Free</span>
                                  : <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate/10 text-slate dark:text-paper/60">₹{s.price}</span>}
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex gap-2">
                                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-slate/50 hover:text-signal-emerald hover:bg-signal-emerald/10 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => deleteSet(s.id)} className="p-1.5 rounded-lg text-slate/50 hover:text-alert-coral hover:bg-alert-coral/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── SERIES TAB ──────────────────────────────────────────────────────────
function SeriesTab({ items, setItems }: { items: MCQSeries[]; setItems: React.Dispatch<React.SetStateAction<MCQSeries[]>> }) {
  const confirm = useConfirm();
  const [draft, setDraft] = useState<MCQSeries | null>(null);
  const startNew = () => setDraft({ id: crypto.randomUUID(), title: "", subject: "", description: "", price: 0, isLocked: false });
  const save = async () => {
    if (!draft) return;
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";
      const res = await fetch(`${apiURL}/api/admin/mcq-series`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(draft)
      });
      if (!res.ok) throw new Error();
      setItems(current =>
        current.some(item => item.id === draft.id)
          ? current.map(item => item.id === draft.id ? draft : item)
          : [...current, draft]
      );
      setDraft(null);
    } catch {
      alert("Error saving series to database");
    }
  };

  const removeSeries = async (id: string) => {
    if (!(await confirm("Delete series permanently?"))) return;
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";
      const res = await fetch(`${apiURL}/api/admin/mcq-series/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setItems(current => current.filter(s => s.id !== id));
      } else alert("Delete failed");
    } catch {
      alert("Error contacting server");
    }
  };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">MCQ Series</h2>
        <button onClick={startNew} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-signal-emerald text-white rounded-xl"><Plus className="w-3.5 h-3.5" /> New Series</button>
      </div>
      {draft && (
        <div className="p-5 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input className={inp} placeholder="Series title" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />
            <input className={inp} placeholder="Subject" value={draft.subject} onChange={e => setDraft({ ...draft, subject: e.target.value })} />
            <textarea className={`${inp} sm:col-span-2 resize-none`} rows={2} placeholder="Description" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" checked={!draft.isLocked} onChange={() => setDraft({ ...draft, isLocked: false, price: 0 })} className="accent-signal-emerald" /><span className="text-ink-navy dark:text-paper">Free</span></label>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" checked={draft.isLocked} onChange={() => setDraft({ ...draft, isLocked: true, price: draft.price || 999 })} className="accent-signal-emerald" /><span className="text-ink-navy dark:text-paper">Locked</span></label>
            {draft.isLocked && (
              <div className="flex items-center gap-2"><span className="text-sm text-slate dark:text-paper/60">₹</span><input type="number" className={`${inp} w-32`} value={draft.price} onChange={e => setDraft({ ...draft, price: Number(e.target.value) })} /></div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="px-4 py-2 text-xs font-bold bg-signal-emerald text-white rounded-xl">Save Series</button>
            <button onClick={() => setDraft(null)} className="px-4 py-2 text-xs font-bold border border-line-gray-light dark:border-line-gray-dark rounded-xl text-slate dark:text-paper/60">Cancel</button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="p-4 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-xl flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-ink-navy dark:text-paper">{item.title}</p>
              <p className="text-xs text-slate dark:text-paper/55 mt-1">{item.subject} · {item.description}</p>
              <p className="text-[10px] text-slate dark:text-paper/40 mt-1.5">{item.isLocked ? `₹${item.price} — locked` : "Free access"}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setDraft(item)} className="p-1.5 text-slate hover:text-signal-emerald transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => removeSeries(item.id)} className="p-1.5 text-slate hover:text-alert-coral transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── COURSES TAB ─────────────────────────────────────────────────────────
type CourseDraft = Course & { _new?: boolean };

function emptyMentor(): Mentor {
  return { name: "", specialty: "", initials: "", color: "from-signal-emerald to-emerald-700", bio: "" };
}
function emptyModule() { return { module: "", topics: [""] }; }

interface EnrolledStudentItem {
  id: string;
  email: string;
  purchaseDate: string;
  addedBy: "purchase" | "admin";
  notes?: string;
}

function EnrolledStudentsPanel({ courseId }: { courseId: string }) {
  const confirm = useConfirm();
  const [enrolled, setEnrolled] = useState<EnrolledStudentItem[]>([]);
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
        const token = localStorage.getItem("caliber_jwt") || "";

        const resEnrollments = await fetch(`${apiURL}/api/admin/courses/${courseId}/enrollments`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        const resUsers = await fetch(`${apiURL}/api/admin/users`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (resEnrollments.ok && resUsers.ok) {
          const enrollmentsData = await resEnrollments.json();
          const usersData = await resUsers.json();
          setEnrolled(enrollmentsData);
          setUsers(usersData);
        } else {
          throw new Error("Failed to load admin enrollment rosters");
        }
      } catch (err: any) {
        console.warn("Using mock enrollment lists:", err.message);
        setEnrolled([
          { id: "e1", email: "student@caliber.com", purchaseDate: "2026-07-28T09:00:00Z", addedBy: "purchase", notes: "Regular purchase" },
          { id: "e2", email: "demo@caliber.com", purchaseDate: "2026-07-29T10:30:00Z", addedBy: "admin", notes: "Scholarship entry" },
        ]);
        setUsers([
          { id: "u1", email: "student@caliber.com" },
          { id: "u2", email: "demo@caliber.com" },
          { id: "u3", email: "john.doe@example.com" },
          { id: "u4", email: "jane.smith@example.com" },
          { id: "u5", email: "caliber_tester@gmail.com" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [courseId]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserEmail) return;

    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";
      const res = await fetch(`${apiURL}/api/admin/courses/${courseId}/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email: selectedUserEmail, notes })
      });
      if (res.ok) {
        const newEnrollment = await res.json();
        setEnrolled(prev => [...prev, newEnrollment]);
      } else {
        throw new Error("Add student request failed");
      }
    } catch (err) {
      console.warn("Adding mock enrollment locally");
      const exists = enrolled.some(e => e.email.toLowerCase() === selectedUserEmail.toLowerCase());
      if (exists) {
        alert("User is already enrolled in this course.");
        return;
      }
      const newMockItem: EnrolledStudentItem = {
        id: `mock-e-${Date.now()}`,
        email: selectedUserEmail,
        purchaseDate: new Date().toISOString(),
        addedBy: "admin",
        notes
      };
      setEnrolled(prev => [...prev, newMockItem]);
    }

    setSelectedUserEmail("");
    setNotes("");
    setShowAddForm(false);
  };

  const handleRemoveStudent = async (enrollmentId: string) => {
    if (!(await confirm("Are you sure you want to remove this student's access?"))) return;

    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";
      const res = await fetch(`${apiURL}/api/admin/courses/${courseId}/enrollments/${enrollmentId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setEnrolled(prev => prev.filter(item => item.id !== enrollmentId));
      } else {
        throw new Error("Remove request failed");
      }
    } catch (err) {
      console.warn("Removing mock enrollment locally");
      setEnrolled(prev => prev.filter(item => item.id !== enrollmentId));
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !enrolled.some(e => e.email.toLowerCase() === u.email.toLowerCase())
  );

  return (
    <div className="p-5 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate dark:text-paper/60 uppercase tracking-wide font-heading">Enrolled Students</p>
          <p className="text-[10px] text-slate dark:text-paper/40 mt-0.5">Manage student access rules for this course.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-signal-emerald text-white rounded-lg hover:bg-signal-emerald/90 transition-colors"
        >
          {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showAddForm ? "Close Panel" : "Add Student"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddStudent} className="p-4 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-paper/20 dark:bg-line-gray-dark/20 space-y-3">
          <p className="text-xs font-semibold text-ink-navy dark:text-paper">Manual Enrollment Provision</p>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1 block">Search & Select Student</label>
              <input
                type="text"
                placeholder="Type email to search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg mb-2"
              />
              <select
                required
                className="w-full px-3 py-1.5 text-xs border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg"
                value={selectedUserEmail}
                onChange={e => setSelectedUserEmail(e.target.value)}
              >
                <option value="">-- Choose User --</option>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(u => (
                    <option key={u.id} value={u.email}>{u.email}</option>
                  ))
                ) : (
                  <option disabled>No users found matching query</option>
                )}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1 block">Internal Enrollment Notes</label>
              <textarea
                placeholder="e.g. Free scholarship, offline batch offset..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-1.5 text-xs border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg resize-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!selectedUserEmail}
            className="px-4 py-2 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy text-xs font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-40"
          >
            Confirm Enrollment
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-4 text-xs text-slate/50">Loading student rosters...</div>
      ) : enrolled.length === 0 ? (
        <div className="text-center py-4 text-xs text-slate/50 bg-paper/10 rounded-xl border border-dashed border-line-gray-light dark:border-line-gray-dark">No students currently enrolled in this course.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line-gray-light dark:border-line-gray-dark">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-line-gray-light/30 dark:bg-line-gray-dark/30 text-slate dark:text-paper/40 font-semibold border-b border-line-gray-light dark:border-line-gray-dark">
                <th className="px-4 py-2">Student Email</th>
                <th className="px-4 py-2">Date Added</th>
                <th className="px-4 py-2">Provision Context</th>
                <th className="px-4 py-2">Notes</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-gray-light dark:divide-line-gray-dark bg-white dark:bg-line-gray-dark/10">
              {enrolled.map(item => (
                <tr key={item.id} className="hover:bg-line-gray-light/20 dark:hover:bg-line-gray-dark/10">
                  <td className="px-4 py-2.5 font-medium text-ink-navy dark:text-paper">{item.email}</td>
                  <td className="px-4 py-2.5 text-slate/60 dark:text-paper/40 font-mono text-[10px]">
                    {new Date(item.purchaseDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.addedBy === "admin"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/35 dark:text-purple-400"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-400"
                      }`}>
                      {item.addedBy === "admin" ? "Admin Override" : "Purchase Portal"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate/75 dark:text-paper/60 italic max-w-[150px] truncate" title={item.notes}>
                    {item.notes || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveStudent(item.id)}
                      className="p-1 rounded text-slate/40 hover:text-alert-coral hover:bg-alert-coral/10 transition-colors"
                      title="Revoke access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CoursesTab({ series }: { series: MCQSeries[] }) {
  const confirm = useConfirm();
  const [courseList, setCourseList] = useState<CourseDraft[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CourseDraft | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("caliber_admin_courses");
    if (saved) {
      setCourseList(JSON.parse(saved));
    } else {
      setCourseList(initialCourses);
    }
  }, []);

  useEffect(() => {
    if (courseList.length > 0) {
      localStorage.setItem("caliber_admin_courses", JSON.stringify(courseList));
    }
  }, [courseList]);

  function openNew() {
    const d: CourseDraft = {
      id: `new-${Date.now()}`,
      title: "",
      description: "",
      price: 0,
      level: "Foundation",
      duration: "",
      tag: "",
      enrolledCount: 0,
      rating: 4.5,
      outcomes: [""],
      curriculum: [emptyModule()],
      mentors: [emptyMentor()],
      deliveryType: "whatsapp",
      whatsappLink: "",
      status: "coming_soon",
      _new: true
    };
    setDraft(d); setEditingId("__new__");
  }
  function openEdit(c: CourseDraft) { setDraft({ ...c, outcomes: [...c.outcomes], curriculum: c.curriculum.map(m => ({ ...m, topics: [...m.topics] })), mentors: c.mentors.map(m => ({ ...m })) }); setEditingId(c.id); }
  function closeEditor() { setEditingId(null); setDraft(null); }
  async function saveCourse() {
    if (!draft) return;
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";
      const res = await fetch(`${apiURL}/api/admin/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(draft)
      });

      if (!res.ok) throw new Error("Failed to save to Supabase database");

      if (editingId === "__new__") setCourseList(prev => [...prev, { ...draft, _new: false }]);
      else setCourseList(prev => prev.map(c => c.id === editingId ? { ...draft, _new: false } : c));

      closeEditor();
    } catch (e) {
      alert("Error saving course to database. Make sure backend is running.");
    }
  }

  async function deleteCourse(id: string) {
    if (!(await confirm("Delete course permanently from database?"))) return;
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";
      const res = await fetch(`${apiURL}/api/admin/courses/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setCourseList(prev => prev.filter(c => c.id !== id));
      } else {
        alert("Delete failed on server");
      }
    } catch (e) {
      alert("Error contacting server");
    }
  }

  const setD = (patch: Partial<CourseDraft>) => draft && setDraft({ ...draft, ...patch });
  function updateOutcome(i: number, val: string) { if (!draft) return; const o = [...draft.outcomes]; o[i] = val; setDraft({ ...draft, outcomes: o }); }
  function addOutcome() { draft && setDraft({ ...draft, outcomes: [...draft.outcomes, ""] }); }
  function removeOutcome(i: number) { draft && setDraft({ ...draft, outcomes: draft.outcomes.filter((_, idx) => idx !== i) }); }
  function updateModule(mi: number, field: "module" | "topics", val: string | string[]) { if (!draft) return; const c = draft.curriculum.map((m, i) => i === mi ? { ...m, [field]: val } : m); setDraft({ ...draft, curriculum: c }); }
  function addModuleTopic(mi: number) { if (!draft) return; const c = draft.curriculum.map((m, i) => i === mi ? { ...m, topics: [...m.topics, ""] } : m); setDraft({ ...draft, curriculum: c }); }
  function removeModuleTopic(mi: number, ti: number) { if (!draft) return; const c = draft.curriculum.map((m, i) => i === mi ? { ...m, topics: m.topics.filter((_, j) => j !== ti) } : m); setDraft({ ...draft, curriculum: c }); }
  function addModule() { draft && setDraft({ ...draft, curriculum: [...draft.curriculum, emptyModule()] }); }
  function removeModule(mi: number) { draft && setDraft({ ...draft, curriculum: draft.curriculum.filter((_, i) => i !== mi) }); }
  function updateMentor(mi: number, patch: Partial<Mentor>) { if (!draft) return; const m = draft.mentors.map((men, i) => i === mi ? { ...men, ...patch } : men); setDraft({ ...draft, mentors: m }); }
  function addMentor() { draft && setDraft({ ...draft, mentors: [...draft.mentors, emptyMentor()] }); }
  function removeMentor(mi: number) { draft && setDraft({ ...draft, mentors: draft.mentors.filter((_, i) => i !== mi) }); }

  if (editingId !== null && draft) {
    return (
      <motion.div key="course-builder" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">{editingId === "__new__" ? "New Course" : "Edit Course"}</h2>
          <button onClick={closeEditor} className="p-2 rounded-lg hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors"><X className="w-4 h-4 text-slate dark:text-paper/60" /></button>
        </div>
        <div className="p-5 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-4">
          <p className="text-xs font-semibold text-slate dark:text-paper/60 uppercase tracking-wide">Basic Info</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Title</label><input className={inp} value={draft.title} onChange={e => setD({ title: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Description</label><textarea className={`${inp} resize-none`} rows={2} value={draft.description} onChange={e => setD({ description: e.target.value })} /></div>
            <div><label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Price (₹)</label><input type="number" className={inp} value={draft.price} onChange={e => setD({ price: Number(e.target.value) })} /></div>
            <div><label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Level</label><select className={inp} value={draft.level ?? ""} onChange={e => setD({ level: e.target.value as Course["level"] })}><option value="">None</option><option>Foundation</option><option>Intermediate</option><option>Final</option><option>All Levels</option></select></div>
            <div><label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Duration</label><input className={inp} placeholder="e.g. 8 weeks" value={draft.duration} onChange={e => setD({ duration: e.target.value })} /></div>
            <div><label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Tag (optional)</label><select className={inp} value={draft.tag ?? ""} onChange={e => setD({ tag: e.target.value || undefined })}><option value="">None</option>{["Bestseller", "Popular", "Premium", "Top Rated", "Free"].map(t => <option key={t}>{t}</option>)}</select></div>
          </div>
        </div>
        <div className="p-5 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-3">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold text-slate dark:text-paper/60 uppercase tracking-wide">Outcomes</p><button onClick={addOutcome} className="text-xs text-signal-emerald font-semibold hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button></div>
          {draft.outcomes.map((o, i) => (<div key={i} className="flex gap-2 items-center"><input className={`${inp} flex-1`} value={o} onChange={e => updateOutcome(i, e.target.value)} /><button onClick={() => removeOutcome(i)} className="p-1.5 text-slate/40 hover:text-alert-coral hover:bg-alert-coral/10 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div>))}
        </div>
        <div className="p-5 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-4">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold text-slate dark:text-paper/60 uppercase tracking-wide">Curriculum</p><button onClick={addModule} className="text-xs text-signal-emerald font-semibold hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Module</button></div>
          {draft.curriculum.map((m, mi) => (<div key={mi} className="space-y-2 p-3 rounded-xl border border-line-gray-light dark:border-line-gray-dark"><div className="flex gap-2 items-center"><input className={`${inp} flex-1`} placeholder="Module name" value={m.module} onChange={e => updateModule(mi, "module", e.target.value)} /><button onClick={() => removeModule(mi)} className="p-1.5 text-slate/40 hover:text-alert-coral hover:bg-alert-coral/10 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div>{m.topics.map((t, ti) => (<div key={ti} className="flex gap-2 items-center ml-4"><input className={`${inp} flex-1 text-xs`} placeholder={`Topic ${ti + 1}`} value={t} onChange={e => { const ts = [...m.topics]; ts[ti] = e.target.value; updateModule(mi, "topics", ts); }} /><button onClick={() => removeModuleTopic(mi, ti)} className="p-1.5 text-slate/40 hover:text-alert-coral hover:bg-alert-coral/10 rounded-lg transition-colors"><X className="w-3 h-3" /></button></div>))}<button onClick={() => addModuleTopic(mi)} className="ml-4 text-xs text-signal-emerald font-semibold hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Topic</button></div>))}
        </div>
        <div className="p-5 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-4">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold text-slate dark:text-paper/60 uppercase tracking-wide">Mentors</p><button onClick={addMentor} className="text-xs text-signal-emerald font-semibold hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add Mentor</button></div>
          {draft.mentors.map((m, mi) => (<div key={mi} className="space-y-2 p-3 rounded-xl border border-line-gray-light dark:border-line-gray-dark"><div className="flex items-center justify-between mb-1"><span className="text-xs font-semibold text-ink-navy dark:text-paper">Mentor {mi + 1}</span><button onClick={() => removeMentor(mi)} className="p-1 text-slate/40 hover:text-alert-coral transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div><div className="grid sm:grid-cols-2 gap-2"><input className={inp} placeholder="Name" value={m.name} onChange={e => updateMentor(mi, { name: e.target.value })} /><input className={inp} placeholder="Specialty" value={m.specialty} onChange={e => updateMentor(mi, { specialty: e.target.value })} /><input className={inp} placeholder="Initials (e.g. SD)" value={m.initials} onChange={e => updateMentor(mi, { initials: e.target.value })} /><select className={inp} value={m.color} onChange={e => updateMentor(mi, { color: e.target.value })}><option value="from-signal-emerald to-emerald-700">Green</option><option value="from-blue-500 to-blue-700">Blue</option><option value="from-purple-500 to-purple-700">Purple</option><option value="from-orange-500 to-orange-700">Orange</option></select><div className="sm:col-span-2"><textarea className={`${inp} resize-none`} rows={2} placeholder="Short bio" value={m.bio} onChange={e => updateMentor(mi, { bio: e.target.value })} /></div></div></div>))}
        </div>
        <div className="p-5 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-4">
          <p className="text-xs font-semibold text-slate dark:text-paper/60 uppercase tracking-wide">Delivery</p>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" checked={draft.deliveryType === "whatsapp"} onChange={() => setD({ deliveryType: "whatsapp", linkedSeriesId: undefined })} className="accent-signal-emerald" />
                <span className="text-ink-navy dark:text-paper">WhatsApp Group</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" checked={draft.deliveryType === "mcq-series"} onChange={() => setD({ deliveryType: "mcq-series", whatsappLink: undefined })} className="accent-signal-emerald" />
                <span className="text-ink-navy dark:text-paper">MCQ Series</span>
              </label>
            </div>
            {draft.deliveryType === "whatsapp" && (
              <div>
                <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">WhatsApp Group Link</label>
                <input className={inp} placeholder="https://chat.whatsapp.com/..." value={draft.whatsappLink ?? ""} onChange={e => setD({ whatsappLink: e.target.value })} />
              </div>
            )}
            {draft.deliveryType === "mcq-series" && (
              <div>
                <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Linked MCQ Series</label>
                <select className={inp} value={draft.linkedSeriesId ?? ""} onChange={e => setD({ linkedSeriesId: e.target.value })}>
                  <option value="">Select a series</option>
                  {series.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>
        <div className="p-5 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-4">
          <p className="text-xs font-semibold text-slate dark:text-paper/60 uppercase tracking-wide">Availability</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex items-start gap-2 cursor-pointer p-3 rounded-xl border border-line-gray-light dark:border-line-gray-dark hover:border-signal-emerald/40 transition-colors flex-1">
              <input type="radio" checked={draft.status === "available"} onChange={() => setD({ status: "available" })} className="accent-signal-emerald mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-ink-navy dark:text-paper">Available</p>
                <p className="text-[10px] text-slate dark:text-paper/50 mt-0.5">Shows the Buy Now button — purchase flow active.</p>
              </div>
            </label>
            <label className="flex items-start gap-2 cursor-pointer p-3 rounded-xl border border-line-gray-light dark:border-line-gray-dark hover:border-amber-400/40 transition-colors flex-1">
              <input type="radio" checked={draft.status === "coming_soon"} onChange={() => setD({ status: "coming_soon" })} className="accent-signal-emerald mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-ink-navy dark:text-paper">Coming Soon</p>
                <p className="text-[10px] text-slate dark:text-paper/50 mt-0.5">Product is visible but buy button is hidden. Use to publish before launch.</p>
              </div>
            </label>
          </div>
        </div>
        {!draft._new && (
          <EnrolledStudentsPanel courseId={draft.id} />
        )}
        <div className="flex gap-3">
          <button onClick={saveCourse} className="px-6 py-2.5 bg-signal-emerald text-white text-sm font-bold rounded-xl hover:bg-signal-emerald/90 transition-colors">Save Course</button>
          <button onClick={closeEditor} className="px-6 py-2.5 border border-line-gray-light dark:border-line-gray-dark text-sm font-semibold text-slate dark:text-paper/60 rounded-xl hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors">Cancel</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div key="courses-list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">Courses</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-signal-emerald text-white rounded-xl hover:bg-signal-emerald/90 transition-colors"><Plus className="w-3.5 h-3.5" /> Add Course</button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line-gray-light dark:border-line-gray-dark">
        <table className="w-full text-sm">
          <thead><tr className="bg-line-gray-light/50 dark:bg-line-gray-dark/50 text-left text-xs text-slate dark:text-paper/50 uppercase tracking-wider">{["Course", "Level", "Price", "Enrolled", "Status", "Mentors", "Actions"].map(h => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line-gray-light dark:divide-line-gray-dark bg-white dark:bg-line-gray-dark/20">
            {courseList.map((c, i) => (
              <motion.tr key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="hover:bg-line-gray-light/30 dark:hover:bg-line-gray-dark/30 transition-colors">
                <td className="px-5 py-3.5 font-medium text-ink-navy dark:text-paper max-w-[180px]"><div className="truncate">{c.title}</div><div className="text-xs text-slate dark:text-paper/50 font-normal">{c.duration}</div></td>
                <td className="px-5 py-3.5"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.level === "Foundation" ? "bg-signal-emerald/10 text-signal-emerald" : c.level === "Final" ? "bg-alert-coral/10 text-alert-coral" : c.level === "All Levels" ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"}`}>{c.level ?? "—"}</span></td>
                <td className="px-5 py-3.5 font-mono font-semibold text-ink-navy dark:text-paper">{c.price === 0 ? "Free" : typeof c.price === "string" ? c.price : `₹${c.price.toLocaleString()}`}</td>
                <td className="px-5 py-3.5 font-mono text-slate dark:text-paper/60">{c.enrolledCount.toLocaleString()}</td>
                <td className="px-5 py-3.5">
                  {c.status === "available"
                    ? <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-signal-emerald/10 text-signal-emerald">Live</span>
                    : <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">Soon</span>}
                </td>
                <td className="px-5 py-3.5"><div className="flex gap-1">{c.mentors.map(m => <div key={m.name} title={m.name} className={`w-6 h-6 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-[9px] font-bold`}>{m.initials}</div>)}</div></td>
                <td className="px-5 py-3.5"><div className="flex gap-2"><button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-slate/50 hover:text-signal-emerald hover:bg-signal-emerald/10 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button><button onClick={() => deleteCourse(c.id)} className="p-1.5 rounded-lg text-slate/50 hover:text-alert-coral hover:bg-alert-coral/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ─── COUPONS TAB ─────────────────────────────────────────────────────────
interface CouponItem {
  id: string;
  code: string;
  discount_type: "percent" | "flat";
  discount_value: number;
  affiliate_id: string | null;
  affiliates?: { name: string; email: string } | null;
  max_uses: number | null;
  used_count: number;
  max_uses_per_user: number;
  valid_from: string | null;
  valid_until: string | null;
  applicable_course_ids: string[];
  is_active: boolean;
  created_at: string;
}

interface CouponDraft {
  code: string;
  discount_type: "percent" | "flat";
  discount_value: number;
  affiliate_id: string;
  max_uses: string;
  max_uses_per_user: number;
  valid_from: string;
  valid_until: string;
  applicable_course_ids: string[];
  is_active: boolean;
}

function CouponsTab() {
  const confirm = useConfirm();
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [affiliates, setAffiliates] = useState<{ id: string; name: string; email: string }[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CouponDraft>({
    code: "", discount_type: "percent", discount_value: 10,
    affiliate_id: "", max_uses: "", max_uses_per_user: 1,
    valid_from: "", valid_until: "", applicable_course_ids: [], is_active: true,
  });

  const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
  const token = typeof window !== "undefined" ? localStorage.getItem("caliber_jwt") || "" : "";
  const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cRes, aRes, coRes] = await Promise.all([
          fetch(`${apiURL}/api/admin/coupons`, { headers }),
          fetch(`${apiURL}/api/admin/affiliates`, { headers }),
          fetch(`${apiURL}/api/admin/courses`, { headers }),
        ]);
        if (cRes.ok) setCoupons(await cRes.json());
        if (aRes.ok) setAffiliates(await aRes.json());
        if (coRes.ok) {
          const courseData = await coRes.json();
          setCourses(courseData.map((c: any) => ({ id: c.id, title: c.title })));
        }
      } catch { /* fallback */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const resetDraft = () => {
    setDraft({
      code: "", discount_type: "percent", discount_value: 10,
      affiliate_id: "", max_uses: "", max_uses_per_user: 1,
      valid_from: "", valid_until: "", applicable_course_ids: [], is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (c: CouponItem) => {
    setDraft({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      affiliate_id: c.affiliate_id || "",
      max_uses: c.max_uses?.toString() || "",
      max_uses_per_user: c.max_uses_per_user,
      valid_from: c.valid_from?.slice(0, 16) || "",
      valid_until: c.valid_until?.slice(0, 16) || "",
      applicable_course_ids: c.applicable_course_ids || [],
      is_active: c.is_active,
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!draft.code.trim()) return;
    const payload: any = {
      code: draft.code.trim(),
      discount_type: draft.discount_type,
      discount_value: draft.discount_value,
      affiliate_id: draft.affiliate_id || null,
      max_uses: draft.max_uses ? parseInt(draft.max_uses) : null,
      max_uses_per_user: draft.max_uses_per_user,
      valid_from: draft.valid_from || null,
      valid_until: draft.valid_until || null,
      applicable_course_ids: draft.applicable_course_ids,
      is_active: draft.is_active,
    };
    try {
      const url = editingId ? `${apiURL}/api/admin/coupons/${editingId}` : `${apiURL}/api/admin/coupons`;
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (res.ok) {
        const saved = await res.json();
        if (editingId) {
          setCoupons(prev => prev.map(c => c.id === editingId ? { ...c, ...saved } : c));
        } else {
          setCoupons(prev => [saved, ...prev]);
        }
        resetDraft();
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to save coupon.");
      }
    } catch { alert("Error contacting server."); }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm("Delete this coupon permanently?"))) return;
    try {
      const res = await fetch(`${apiURL}/api/admin/coupons/${id}`, { method: "DELETE", headers });
      if (res.ok) setCoupons(prev => prev.filter(c => c.id !== id));
    } catch { alert("Error deleting coupon."); }
  };

  const toggleCourseInDraft = (courseId: string) => {
    setDraft(prev => ({
      ...prev,
      applicable_course_ids: prev.applicable_course_ids.includes(courseId)
        ? prev.applicable_course_ids.filter(id => id !== courseId)
        : [...prev.applicable_course_ids, courseId],
    }));
  };

  return (
    <motion.div key="coupons" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">Coupon Codes</h2>
          <p className="text-xs text-slate dark:text-paper/50">Create discount codes and link them to affiliates.</p>
        </div>
        <button onClick={() => { resetDraft(); setShowForm(true); }} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-signal-emerald text-white rounded-xl hover:bg-signal-emerald/90 transition-colors">
          <Plus className="w-3.5 h-3.5" /> New Coupon
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="p-5 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate dark:text-paper/60 uppercase tracking-wide">{editingId ? "Edit Coupon" : "Create Coupon"}</p>
                <button onClick={resetDraft} className="p-1 rounded hover:bg-line-gray-light dark:hover:bg-line-gray-dark"><X className="w-4 h-4 text-slate dark:text-paper/60" /></button>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Code</label>
                  <input className={inp} placeholder="e.g. RAHUL20" value={draft.code} onChange={e => setDraft({ ...draft, code: e.target.value.toUpperCase() })} disabled={!!editingId} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Discount Type</label>
                  <select className={inp} value={draft.discount_type} onChange={e => setDraft({ ...draft, discount_type: e.target.value as "percent" | "flat" })}>
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Discount Value</label>
                  <input type="number" min="0" className={inp} value={draft.discount_value} onChange={e => setDraft({ ...draft, discount_value: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Linked Affiliate</label>
                  <select className={inp} value={draft.affiliate_id} onChange={e => setDraft({ ...draft, affiliate_id: e.target.value })}>
                    <option value="">None (standalone coupon)</option>
                    {affiliates.map(a => <option key={a.id} value={a.id}>{a.name} ({a.email})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Max Total Uses</label>
                  <input type="number" min="0" className={inp} placeholder="Unlimited" value={draft.max_uses} onChange={e => setDraft({ ...draft, max_uses: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Max Uses / User</label>
                  <input type="number" min="1" className={inp} value={draft.max_uses_per_user} onChange={e => setDraft({ ...draft, max_uses_per_user: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Valid From</label>
                  <input type="datetime-local" className={inp} value={draft.valid_from} onChange={e => setDraft({ ...draft, valid_from: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Valid Until</label>
                  <input type="datetime-local" className={inp} value={draft.valid_until} onChange={e => setDraft({ ...draft, valid_until: e.target.value })} />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={draft.is_active} onChange={e => setDraft({ ...draft, is_active: e.target.checked })} className="accent-signal-emerald w-4 h-4" />
                    <span className="text-ink-navy dark:text-paper font-medium">Active</span>
                  </label>
                </div>
              </div>
              {courses.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-slate dark:text-paper/70 mb-2 block">Applicable Courses (empty = all courses)</label>
                  <div className="flex flex-wrap gap-2">
                    {courses.map(c => (
                      <button key={c.id} type="button" onClick={() => toggleCourseInDraft(c.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${draft.applicable_course_ids.includes(c.id) ? "bg-signal-emerald/10 border-signal-emerald/40 text-signal-emerald" : "border-line-gray-light dark:border-line-gray-dark text-slate dark:text-paper/60 hover:border-signal-emerald/30"}`}>
                        {c.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={handleSave} className="px-5 py-2 text-xs font-bold bg-signal-emerald text-white rounded-xl hover:bg-signal-emerald/90 transition-colors">{editingId ? "Update Coupon" : "Create Coupon"}</button>
                <button onClick={resetDraft} className="px-5 py-2 text-xs font-bold border border-line-gray-light dark:border-line-gray-dark text-slate dark:text-paper/60 rounded-xl hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-xs text-slate/50">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-line-gray-light dark:border-line-gray-dark rounded-2xl text-xs text-slate/50">No coupons created yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-line-gray-light/50 dark:bg-line-gray-dark/50 text-slate dark:text-paper/40 font-semibold uppercase tracking-wider">
                {["Code", "Discount", "Affiliate", "Uses", "Status", "Validity", "Actions"].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-line-gray-light dark:divide-line-gray-dark">
              {coupons.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-line-gray-light/20 dark:hover:bg-line-gray-dark/20">
                  <td className="px-4 py-3 font-mono font-bold text-ink-navy dark:text-paper">{c.code}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-ink-navy dark:text-paper">{c.discount_type === "percent" ? `${c.discount_value}%` : `₹${c.discount_value}`}</span>
                  </td>
                  <td className="px-4 py-3 text-slate dark:text-paper/60">{c.affiliates?.name || "—"}</td>
                  <td className="px-4 py-3 font-mono">
                    <span className="text-ink-navy dark:text-paper">{c.used_count}</span>
                    <span className="text-slate dark:text-paper/40">/{c.max_uses ?? "∞"}</span>
                  </td>
                  <td className="px-4 py-3">
                    {c.is_active ? (
                      <span className="px-2 py-0.5 rounded-full bg-signal-emerald/10 text-signal-emerald font-bold text-[10px]">Active</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate/10 text-slate font-bold text-[10px]">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[10px] text-slate dark:text-paper/40 font-mono">
                    {c.valid_until ? new Date(c.valid_until).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "No expiry"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-slate/50 hover:text-signal-emerald hover:bg-signal-emerald/10 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-slate/50 hover:text-alert-coral hover:bg-alert-coral/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}


// ─── AFFILIATES TAB ─────────────────────────────────────────────────────
interface AffiliateItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  commission_type: "percent" | "flat";
  commission_value: number;
  payout_details: string | null;
  is_active: boolean;
}

interface AffPerf {
  affiliate_id: string;
  name: string;
  email: string;
  sales: number;
  revenue: number;
  commission_owed: number;
}

function AffiliatesTab() {
  const confirm = useConfirm();
  const [affiliates, setAffiliates] = useState<AffiliateItem[]>([]);
  const [performance, setPerformance] = useState<AffPerf[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "performance">("list");
  const [draft, setDraft] = useState({
    name: "", email: "", phone: "", commission_type: "percent" as "percent" | "flat",
    commission_value: 10, payout_details: "",
  });

  const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
  const token = typeof window !== "undefined" ? localStorage.getItem("caliber_jwt") || "" : "";
  const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [aRes, pRes] = await Promise.all([
          fetch(`${apiURL}/api/admin/affiliates`, { headers }),
          fetch(`${apiURL}/api/admin/affiliates/performance`, { headers }),
        ]);
        if (aRes.ok) setAffiliates(await aRes.json());
        if (pRes.ok) setPerformance(await pRes.json());
      } catch { /* fallback */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const resetDraft = () => {
    setDraft({ name: "", email: "", phone: "", commission_type: "percent", commission_value: 10, payout_details: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (a: AffiliateItem) => {
    setDraft({
      name: a.name, email: a.email, phone: a.phone || "",
      commission_type: a.commission_type, commission_value: a.commission_value,
      payout_details: a.payout_details || "",
    });
    setEditingId(a.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!draft.name.trim() || !draft.email.trim()) return;
    try {
      const url = editingId ? `${apiURL}/api/admin/affiliates/${editingId}` : `${apiURL}/api/admin/affiliates`;
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers, body: JSON.stringify(draft) });
      if (res.ok) {
        const saved = await res.json();
        if (editingId) setAffiliates(prev => prev.map(a => a.id === editingId ? { ...a, ...saved } : a));
        else setAffiliates(prev => [saved, ...prev]);
        resetDraft();
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to save affiliate.");
      }
    } catch { alert("Error contacting server."); }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm("Delete this affiliate permanently?"))) return;
    try {
      const res = await fetch(`${apiURL}/api/admin/affiliates/${id}`, { method: "DELETE", headers });
      if (res.ok) setAffiliates(prev => prev.filter(a => a.id !== id));
    } catch { alert("Error deleting affiliate."); }
  };

  const handleExportPerformance = () => {
    const csvHeaders = ["Affiliate Name", "Email", "Total Sales", "Total Revenue (₹)", "Commission Owed (₹)"];
    const rows = [csvHeaders.join(",")];
    for (const p of performance) {
      rows.push([
        `"${p.name}"`, `"${p.email}"`, p.sales.toString(),
        p.revenue.toFixed(2), p.commission_owed.toFixed(2),
      ].join(","));
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `affiliate_performance_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div key="affiliates" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">Affiliates</h2>
          <p className="text-xs text-slate dark:text-paper/50">Manage affiliate partners and track their performance.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 p-0.5 bg-line-gray-light dark:bg-line-gray-dark rounded-lg">
            <button onClick={() => setViewMode("list")} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === "list" ? "bg-white dark:bg-ink-navy text-ink-navy dark:text-paper shadow-sm" : "text-slate dark:text-paper/60"}`}>Manage</button>
            <button onClick={() => setViewMode("performance")} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === "performance" ? "bg-white dark:bg-ink-navy text-ink-navy dark:text-paper shadow-sm" : "text-slate dark:text-paper/60"}`}>Performance</button>
          </div>
          {viewMode === "list" && (
            <button onClick={() => { resetDraft(); setShowForm(true); }} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-signal-emerald text-white rounded-xl hover:bg-signal-emerald/90 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Affiliate
            </button>
          )}
          {viewMode === "performance" && performance.length > 0 && (
            <button onClick={handleExportPerformance} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-signal-emerald text-white rounded-xl hover:bg-signal-emerald/90 transition-colors">
              <Download className="w-3.5 h-3.5" /> Export to Excel
            </button>
          )}
        </div>
      </div>

      {/* Affiliate Form */}
      <AnimatePresence>
        {showForm && viewMode === "list" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="p-5 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate dark:text-paper/60 uppercase tracking-wide">{editingId ? "Edit Affiliate" : "Add Affiliate"}</p>
                <button onClick={resetDraft} className="p-1 rounded hover:bg-line-gray-light dark:hover:bg-line-gray-dark"><X className="w-4 h-4 text-slate dark:text-paper/60" /></button>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div><label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Name</label><input className={inp} placeholder="Rahul Sharma" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></div>
                <div><label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Email</label><input type="email" className={inp} placeholder="rahul@example.com" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} /></div>
                <div><label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Phone</label><input className={inp} placeholder="+91 98765 43210" value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })} /></div>
                <div>
                  <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Commission Type</label>
                  <select className={inp} value={draft.commission_type} onChange={e => setDraft({ ...draft, commission_type: e.target.value as "percent" | "flat" })}>
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div><label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Commission Value</label><input type="number" min="0" className={inp} value={draft.commission_value} onChange={e => setDraft({ ...draft, commission_value: Number(e.target.value) })} /></div>
                <div><label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Payout Details (UPI/Bank)</label><input className={inp} placeholder="UPI: rahul@upi" value={draft.payout_details} onChange={e => setDraft({ ...draft, payout_details: e.target.value })} /></div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} className="px-5 py-2 text-xs font-bold bg-signal-emerald text-white rounded-xl hover:bg-signal-emerald/90 transition-colors">{editingId ? "Update" : "Add Affiliate"}</button>
                <button onClick={resetDraft} className="px-5 py-2 text-xs font-bold border border-line-gray-light dark:border-line-gray-dark text-slate dark:text-paper/60 rounded-xl hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-center py-10 text-xs text-slate/50">Loading affiliates...</div>
      ) : viewMode === "list" ? (
        /* ─── Affiliate List ─── */
        affiliates.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-line-gray-light dark:border-line-gray-dark rounded-2xl text-xs text-slate/50">No affiliates added yet.</div>
        ) : (
          <div className="space-y-2">
            {affiliates.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between p-4 bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-navy dark:text-paper">{a.name}</p>
                    <p className="text-[10px] text-slate dark:text-paper/40">{a.email}{a.phone ? ` · ${a.phone}` : ""}</p>
                    <p className="text-[10px] text-slate dark:text-paper/40 mt-0.5">
                      Commission: <span className="font-bold text-ink-navy dark:text-paper">{a.commission_type === "percent" ? `${a.commission_value}%` : `₹${a.commission_value}`}</span>
                      {a.payout_details && <> · Payout: {a.payout_details}</>}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg text-slate/50 hover:text-signal-emerald hover:bg-signal-emerald/10 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg text-slate/50 hover:text-alert-coral hover:bg-alert-coral/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        /* ─── Performance Dashboard ─── */
        performance.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-line-gray-light dark:border-line-gray-dark rounded-2xl text-xs text-slate/50">No affiliate sales recorded yet. Performance data will appear once coupons are used in transactions.</div>
        ) : (
          <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Affiliate Sales", value: performance.reduce((s, p) => s + p.sales, 0).toString(), color: "text-signal-emerald" },
                { label: "Total Revenue via Affiliates", value: `₹${performance.reduce((s, p) => s + p.revenue, 0).toLocaleString()}`, color: "text-blue-500" },
                { label: "Total Commission Owed", value: `₹${performance.reduce((s, p) => s + p.commission_owed, 0).toLocaleString()}`, color: "text-purple-500" },
              ].map(card => (
                <div key={card.label} className="p-4 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl">
                  <div className={`font-heading font-bold text-2xl ${card.color}`}>{card.value}</div>
                  <div className="text-xs text-slate dark:text-paper/50 mt-0.5">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Leaderboard table */}
            <div className="overflow-x-auto rounded-2xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-line-gray-light/50 dark:bg-line-gray-dark/50 text-slate dark:text-paper/40 font-semibold uppercase tracking-wider">
                    {["#", "Affiliate", "Email", "Sales", "Revenue (₹)", "Commission Owed (₹)"].map(h => <th key={h} className="px-5 py-3">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-gray-light dark:divide-line-gray-dark">
                  {performance.map((p, i) => (
                    <motion.tr key={p.affiliate_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="hover:bg-line-gray-light/20 dark:hover:bg-line-gray-dark/20">
                      <td className="px-5 py-3 font-mono font-bold text-slate dark:text-paper/50">{i + 1}</td>
                      <td className="px-5 py-3 font-semibold text-ink-navy dark:text-paper">{p.name}</td>
                      <td className="px-5 py-3 text-slate dark:text-paper/60">{p.email}</td>
                      <td className="px-5 py-3 font-mono font-bold text-ink-navy dark:text-paper">{p.sales}</td>
                      <td className="px-5 py-3 font-mono font-bold text-signal-emerald">₹{p.revenue.toLocaleString()}</td>
                      <td className="px-5 py-3 font-mono font-bold text-purple-600 dark:text-purple-400">₹{p.commission_owed.toLocaleString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </motion.div>
  );
}

// ─── BUNDLES TAB ────────────────────────────────────────────────────────

function BundlesTab() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
        const token = localStorage.getItem("caliber_jwt") || "";
        const resB = await fetch(`${apiURL}/api/admin/course-bundles`, { headers: { "Authorization": `Bearer ${token}` } });
        const resC = await fetch(`${apiURL}/api/courses`, { headers: { "Authorization": `Bearer ${token}` } });
        if (resB.ok) setBundles(await resB.json());
        if (resC.ok) setCourses(await resC.json());
      } catch (e) { }
      setLoading(false);
    }
    load();
  }, []);

  async function saveBundle() {
    if (!draft.title || !draft.price) return;
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";
      const res = await fetch(`${apiURL}/api/admin/course-bundles`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(draft)
      });
      if (res.ok) {
        const data = await res.json();
        setBundles(prev => {
          const exists = prev.find(b => b.id === draft.id);
          if (exists) return prev.map(b => b.id === draft.id ? draft : b);
          return [...prev, { ...draft, id: data.id }];
        });
        setDraft(null);
      }
    } catch (e) {
      alert("Save failed");
    }
  }

  async function deleteBundle(id: string) {
    if (!window.confirm("Delete this bundle pricing module?")) return;
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";
      await fetch(`${apiURL}/api/admin/course-bundles/${id}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      setBundles(prev => prev.filter(b => b.id !== id));
    } catch (e) { }
  }

  function toggleCourse(courseId: string) {
    setDraft((prev: any) => {
      const ids = prev.courseIds || [];
      if (ids.includes(courseId)) return { ...prev, courseIds: ids.filter((id: string) => id !== courseId) };
      return { ...prev, courseIds: [...ids, courseId] };
    });
  }

  if (loading) return <div className="p-10 text-center text-xs">Loading bundles...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {!draft ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">Tiered Pricing Modules</h2>
            <button onClick={() => setDraft({ title: "", description: "", level: "Multiple", courseIds: [], price: 0 })} className="flex items-center gap-1.5 px-4 py-2 bg-signal-emerald text-white font-bold text-xs rounded-lg hover:bg-emerald-600 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Create Bundle
            </button>
          </div>
          <div className="grid gap-4">
            {bundles.length === 0 ? (
              <p className="text-xs text-slate dark:text-paper/50 italic py-6 text-center bg-white dark:bg-line-gray-dark/20 rounded-xl border border-line-gray-light dark:border-line-gray-dark border-dashed">No bundles configured.</p>
            ) : bundles.map(b => (
              <div key={b.id} className="p-4 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-xl flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-ink-navy dark:text-paper">{b.title}</h3>
                  <p className="text-xs text-slate dark:text-paper/60 mt-1">{b.description || "No description"} — {b.courseIds?.length || 0} courses included</p>
                  <p className="font-mono text-sm font-bold text-signal-emerald mt-2">₹{b.price}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setDraft(b)} className="p-1.5 text-slate hover:text-signal-emerald"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => deleteBundle(b.id)} className="p-1.5 text-slate hover:text-alert-coral"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-5 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg">Edit Bundle</h3>
            <button onClick={() => setDraft(null)} className="p-1.5 hover:bg-line-gray-light dark:hover:bg-line-gray-dark rounded-xl"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold mb-1 block">Bundle Title</label>
              <input className={inp} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. CA Inter Group 1 Complete" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Discounted Price (₹)</label>
              <input type="number" className={inp} value={draft.price} onChange={e => setDraft({ ...draft, price: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Bundle Level</label>
              <select className={inp} value={draft.level || "Intermediate"} onChange={e => setDraft({ ...draft, level: e.target.value })}>
                <option value="Foundation">Foundation</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Final">Final</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold mb-1 block">Description</label>
              <textarea className={`${inp} resize-none`} rows={2} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-2 block border-t border-line-gray-light dark:border-line-gray-dark pt-4">Select Courses to Bundle</label>
            <div className="grid sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
              {courses.filter(c => (draft.level === "Others" ? c.level === null : c.level === (draft.level || "Intermediate"))).map(c => (
                <div key={c.id} onClick={() => toggleCourse(c.id)} className={`p-3 rounded-lg border flex gap-3 items-start cursor-pointer transition-colors ${draft.courseIds?.includes(c.id) ? "border-signal-emerald bg-signal-emerald/5" : "border-line-gray-light dark:border-line-gray-dark hover:border-slate/40"}`}>
                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${draft.courseIds?.includes(c.id) ? "bg-signal-emerald border-signal-emerald text-white" : "border-slate/40"}`}>
                    {draft.courseIds?.includes(c.id) && <CheckCircle className="w-3 h-3" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold">{c.title}</p>
                    <p className="text-[10px] text-slate opacity-70">₹{c.price}</p>
                  </div>
                </div>
              ))}
              {courses.filter(c => (draft.level === "Others" ? c.level === null : c.level === (draft.level || "Intermediate"))).length === 0 && (
                <p className="text-xs text-slate/50 py-4 col-span-2 text-center border border-dashed rounded-lg">No courses available for this level.</p>
              )}
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button onClick={saveBundle} className="px-5 py-2 bg-ink-navy text-white font-bold text-sm rounded-xl hover:bg-opacity-90">Save Bundle</button>
          </div>
        </div>
      )}
    </motion.div>
  );
}


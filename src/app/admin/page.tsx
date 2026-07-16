"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  pendingVerifications, mcqSets, courses as initialCourses,
  registeredUsers, type PaymentVerification, type MCQSet,
  type Question, type Course, type Mentor,
} from "@/lib/mockData";
import {
  Shield, ShieldOff, CheckCircle, XCircle, Upload, Plus, BookOpen,
  Users, Clock, CheckCheck, AlertTriangle, Trash2, ChevronDown,
  ChevronRight, Edit2, X, GripVertical, RefreshCw,
} from "lucide-react";

// ─── Shared input style ───────────────────────────────────────────────────
const inp = "w-full px-3 py-2 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-xl focus:outline-none focus:border-signal-emerald transition-colors";

// ─── Root page ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, isAuthenticated, toggleRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;
  if (user.role !== "admin") return <AccessDenied onToggle={toggleRole} />;
  return <AdminDashboard />;
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
          <p className="text-sm text-slate dark:text-paper/60 mt-2 leading-relaxed">
            Enable Admin Mode from your dashboard to access this page.
          </p>
        </div>
        <button onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-3 bg-alert-coral text-white font-bold rounded-xl hover:bg-alert-coral/90 transition-colors">
          <Shield className="w-4 h-4" /> Enable Admin Mode
        </button>
      </motion.div>
    </div>
  );
}

type AdminTab = "payments" | "users" | "mcq" | "courses";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("payments");

  const tabs: { id: AdminTab; label: string }[] = [
    { id: "payments", label: "Payments" },
    { id: "users",    label: "Users" },
    { id: "mcq",      label: "MCQ Sets" },
    { id: "courses",  label: "Courses" },
  ];

  return (
    <div className="pt-16 min-h-screen bg-line-gray-light/20 dark:bg-line-gray-dark/10 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
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

        {/* Stat row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <Users className="w-4 h-4" />, value: registeredUsers.length.toString(), label: "Registered Users", color: "text-signal-emerald" },
            { icon: <BookOpen className="w-4 h-4" />, value: initialCourses.length.toString(), label: "Active Courses", color: "text-blue-500" },
            { icon: <Clock className="w-4 h-4" />, value: pendingVerifications.filter(v => v.status === "pending").length.toString(), label: "Pending Payments", color: "text-yellow-500" },
            { icon: <Upload className="w-4 h-4" />, value: mcqSets.length.toString(), label: "MCQ Sets", color: "text-purple-500" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl p-4">
              <div className={`w-8 h-8 rounded-lg bg-current/10 flex items-center justify-center ${s.color} mb-2`}>{s.icon}</div>
              <div className={`font-heading font-bold text-2xl ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate dark:text-paper/50 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-line-gray-light dark:bg-line-gray-dark rounded-xl w-fit flex-wrap">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === t.id
                  ? "bg-white dark:bg-ink-navy text-ink-navy dark:text-paper shadow-sm"
                  : "text-slate dark:text-paper/60 hover:text-ink-navy dark:hover:text-paper"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "payments" && <PaymentsTab key="payments" />}
          {activeTab === "users"    && <UsersTab    key="users" />}
          {activeTab === "mcq"      && <MCQTab      key="mcq" />}
          {activeTab === "courses"  && <CoursesTab  key="courses" />}
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
    pending:  { cls: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400", icon: <AlertTriangle className="w-3 h-3" />, label: "Pending" },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

// ─── PAYMENTS TAB ────────────────────────────────────────────────────────
function PaymentsTab() {
  const [verifications, setVerifications] = useState<PaymentVerification[]>(pendingVerifications);
  const [statusFilter, setStatusFilter] = useState<PaymentVerification["status"] | "all">("all");

  const filtered = statusFilter === "all" ? verifications : verifications.filter(v => v.status === statusFilter);

  const approve = (id: string) => setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: "approved" } : v));
  const reject  = (id: string) => setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: "rejected" } : v));

  return (
    <motion.div key="payments" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">Transaction History</h2>
        {/* Status filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "pending", "approved", "rejected", "refunded"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors capitalize ${
                statusFilter === s ? "bg-signal-emerald text-white" : "bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/60 hover:bg-signal-emerald/10 hover:text-signal-emerald"
              }`}>
              {s === "all" ? `All (${verifications.length})` : `${s} (${verifications.filter(v => v.status === s).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-line-gray-light dark:border-line-gray-dark">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-line-gray-light/50 dark:bg-line-gray-dark/50 text-left text-xs text-slate dark:text-paper/50 uppercase tracking-wider">
              {["Student Email", "Course / Set", "Amount", "UTR", "Date", "Status", "Actions"].map(h => (
                <th key={h} className="px-5 py-3 font-semibold">{h}</th>
              ))}
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
                      <button onClick={() => approve(v.id)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-signal-emerald border border-signal-emerald/30 rounded-lg hover:bg-signal-emerald/10 transition-colors">
                        <CheckCheck className="w-3 h-3" /> Approve
                      </button>
                      <button onClick={() => reject(v.id)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-alert-coral border border-alert-coral/30 rounded-lg hover:bg-alert-coral/10 transition-colors">
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((v, i) => (
          <motion.div key={v.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="p-4 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm text-ink-navy dark:text-paper">{v.studentEmail}</p>
                <p className="text-xs text-slate dark:text-paper/60 mt-0.5">{v.courseTitle}</p>
              </div>
              <StatusBadge status={v.status} />
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate dark:text-paper/60">
              <span className="font-mono font-bold text-ink-navy dark:text-paper">₹{v.amount.toLocaleString()}</span>
              <span>{v.utrNumber}</span>
              <span>{v.date}</span>
            </div>
            {v.status === "pending" && (
              <div className="flex gap-2">
                <button onClick={() => approve(v.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-signal-emerald border border-signal-emerald/30 rounded-lg hover:bg-signal-emerald/10 transition-colors">
                  <CheckCheck className="w-3 h-3" /> Approve
                </button>
                <button onClick={() => reject(v.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-alert-coral border border-alert-coral/30 rounded-lg hover:bg-alert-coral/10 transition-colors">
                  <XCircle className="w-3 h-3" /> Reject
                </button>
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

  return (
    <motion.div key="users" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">Registered Users</h2>

      <div className="space-y-2">
        {registeredUsers.map((u, i) => (
          <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-line-gray-light dark:border-line-gray-dark overflow-hidden bg-white dark:bg-line-gray-dark/20">
            {/* Row */}
            <button onClick={() => setExpanded(expanded === u.id ? null : u.id)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-line-gray-light/30 dark:hover:bg-line-gray-dark/30 transition-colors text-left">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-signal-emerald/20 flex items-center justify-center text-signal-emerald text-xs font-bold">
                  {u.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-navy dark:text-paper">{u.email}</p>
                  <p className="text-xs text-slate dark:text-paper/50">Joined {u.joinDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate dark:text-paper/50 mr-2">
                <span>{u.purchases.length} purchase{u.purchases.length !== 1 ? "s" : ""}</span>
                <span>{u.quizAttempts.length} attempt{u.quizAttempts.length !== 1 ? "s" : ""}</span>
                {expanded === u.id
                  ? <ChevronDown className="w-4 h-4" />
                  : <ChevronRight className="w-4 h-4" />}
              </div>
            </button>

            {/* Expanded detail */}
            <AnimatePresence initial={false}>
              {expanded === u.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="px-5 pb-5 pt-1 border-t border-line-gray-light dark:border-line-gray-dark space-y-4 bg-line-gray-light/10 dark:bg-line-gray-dark/10">
                    {/* Purchases */}
                    <div>
                      <p className="text-xs font-semibold text-ink-navy dark:text-paper uppercase tracking-wide mb-2">Purchases</p>
                      {u.purchases.length === 0 ? (
                        <p className="text-xs text-slate dark:text-paper/50">No purchases yet.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {u.purchases.map((p, pi) => (
                            <div key={pi} className="flex items-center justify-between text-xs">
                              <span className="text-ink-navy dark:text-paper">{p.courseTitle}</span>
                              <div className="flex items-center gap-3 text-slate dark:text-paper/50">
                                <span className="font-mono font-semibold text-ink-navy dark:text-paper">₹{p.amount.toLocaleString()}</span>
                                <span>{p.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Quiz attempts */}
                    <div>
                      <p className="text-xs font-semibold text-ink-navy dark:text-paper uppercase tracking-wide mb-2">Quiz Attempts</p>
                      {u.quizAttempts.length === 0 ? (
                        <p className="text-xs text-slate dark:text-paper/50">No attempts yet.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {u.quizAttempts.map((q, qi) => (
                            <div key={qi} className="flex items-center justify-between text-xs">
                              <span className="text-ink-navy dark:text-paper">{q.setTitle}</span>
                              <div className="flex items-center gap-3 text-slate dark:text-paper/50">
                                <span className={`font-mono font-bold ${q.score / q.total >= 0.6 ? "text-signal-emerald" : "text-alert-coral"}`}>
                                  {String(q.score).padStart(2, "0")}/{q.total}
                                </span>
                                <span>{q.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
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

// ─── MCQ TAB — Sheet Builder ─────────────────────────────────────────────
type SetDraft = Omit<MCQSet, "questions"> & { questions: Question[]; _deleted?: boolean };

function emptyQuestion(id: number): Question {
  return { id, questionText: "", options: ["", "", "", ""], correctOptionIndex: 0, explanation: "" };
}

function MCQTab() {
  const [sets, setSets] = useState<SetDraft[]>(mcqSets.map(s => ({ ...s })));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SetDraft | null>(null);

  function openNew() {
    const newSet: SetDraft = { id: `new-${Date.now()}`, title: "", subject: "", description: "", isFree: true, price: undefined, questions: [emptyQuestion(1)] };
    setDraft(newSet);
    setEditingId("__new__");
  }

  function openEdit(set: SetDraft) {
    setDraft({ ...set, questions: set.questions.map(q => ({ ...q, options: [...q.options] })) });
    setEditingId(set.id);
  }

  function closeEditor() { setEditingId(null); setDraft(null); }

  function saveSet() {
    if (!draft) return;
    if (editingId === "__new__") {
      setSets(prev => [...prev, { ...draft }]);
    } else {
      setSets(prev => prev.map(s => s.id === editingId ? { ...draft } : s));
    }
    closeEditor();
  }

  function deleteSet(id: string) {
    setSets(prev => prev.filter(s => s.id !== id));
  }

  // Draft helpers
  function addQuestion() {
    if (!draft) return;
    const newQ = emptyQuestion(draft.questions.length + 1);
    setDraft({ ...draft, questions: [...draft.questions, newQ] });
  }

  function removeQuestion(idx: number) {
    if (!draft) return;
    setDraft({ ...draft, questions: draft.questions.filter((_, i) => i !== idx) });
  }

  function updateQuestion(idx: number, updated: Question) {
    if (!draft) return;
    const qs = [...draft.questions];
    qs[idx] = updated;
    setDraft({ ...draft, questions: qs });
  }

  function moveQuestion(idx: number, dir: -1 | 1) {
    if (!draft) return;
    const qs = [...draft.questions];
    const target = idx + dir;
    if (target < 0 || target >= qs.length) return;
    [qs[idx], qs[target]] = [qs[target], qs[idx]];
    setDraft({ ...draft, questions: qs });
  }

  // ── Builder panel ──
  if (editingId !== null && draft) {
    return (
      <motion.div key="builder" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">
            {editingId === "__new__" ? "New MCQ Set" : "Edit MCQ Set"}
          </h2>
          <button onClick={closeEditor} className="p-2 rounded-lg hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors">
            <X className="w-4 h-4 text-slate dark:text-paper/60" />
          </button>
        </div>

        {/* Set-level fields */}
        <div className="p-5 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-4">
          <p className="text-xs font-semibold text-slate dark:text-paper/60 uppercase tracking-wide">Set Details</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Title</label>
              <input className={inp} placeholder="e.g. Accounting Fundamentals" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Subject</label>
              <input className={inp} placeholder="e.g. Accounting" value={draft.subject} onChange={e => setDraft({ ...draft, subject: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Description</label>
              <textarea className={`${inp} resize-none`} rows={2} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" checked={draft.isFree} onChange={() => setDraft({ ...draft, isFree: true, price: undefined })} className="accent-signal-emerald" />
              <span className="text-ink-navy dark:text-paper">Free</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" checked={!draft.isFree} onChange={() => setDraft({ ...draft, isFree: false, price: 49 })} className="accent-signal-emerald" />
              <span className="text-ink-navy dark:text-paper">Locked</span>
            </label>
            {!draft.isFree && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate dark:text-paper/60">₹</span>
                <input type="number" className={`${inp} w-24`} value={draft.price ?? ""} onChange={e => setDraft({ ...draft, price: Number(e.target.value) })} />
              </div>
            )}
          </div>
        </div>

        {/* Question list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-navy dark:text-paper">{draft.questions.length} Question{draft.questions.length !== 1 ? "s" : ""}</p>
            <button onClick={addQuestion} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-signal-emerald text-white rounded-xl hover:bg-signal-emerald/90 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Question
            </button>
          </div>

          {draft.questions.map((q, qi) => (
            <div key={qi} className="p-5 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-signal-emerald font-bold w-6">Q{qi + 1}</span>
                <div className="flex gap-1 ml-auto">
                  <button onClick={() => moveQuestion(qi, -1)} disabled={qi === 0} className="p-1 rounded hover:bg-line-gray-light dark:hover:bg-line-gray-dark disabled:opacity-30 transition-colors">
                    <GripVertical className="w-3.5 h-3.5 text-slate dark:text-paper/50 rotate-90" />
                  </button>
                  <button onClick={() => removeQuestion(qi)} className="p-1 rounded hover:bg-alert-coral/10 text-slate dark:text-paper/50 hover:text-alert-coral transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Question Text</label>
                <textarea className={`${inp} resize-none`} rows={2} value={q.questionText}
                  onChange={e => updateQuestion(qi, { ...q, questionText: e.target.value })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input type="radio" name={`correct-${qi}`} checked={q.correctOptionIndex === oi}
                      onChange={() => updateQuestion(qi, { ...q, correctOptionIndex: oi })}
                      className="accent-signal-emerald flex-shrink-0" title={`Mark option ${String.fromCharCode(65 + oi)} as correct`} />
                    <input className={inp} placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt}
                      onChange={e => { const opts = [...q.options]; opts[oi] = e.target.value; updateQuestion(qi, { ...q, options: opts }); }} />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Explanation (optional)</label>
                <textarea className={`${inp} resize-none`} rows={2} value={q.explanation}
                  onChange={e => updateQuestion(qi, { ...q, explanation: e.target.value })} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={saveSet} className="px-6 py-2.5 bg-signal-emerald text-white text-sm font-bold rounded-xl hover:bg-signal-emerald/90 transition-colors">
            Save Set
          </button>
          <button onClick={closeEditor} className="px-6 py-2.5 border border-line-gray-light dark:border-line-gray-dark text-sm font-semibold text-slate dark:text-paper/60 rounded-xl hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors">
            Cancel
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Table view ──
  return (
    <motion.div key="mcq-list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">MCQ Sets</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-signal-emerald text-white rounded-xl hover:bg-signal-emerald/90 transition-colors">
          <Plus className="w-3.5 h-3.5" /> New Set
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line-gray-light dark:border-line-gray-dark">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-line-gray-light/50 dark:bg-line-gray-dark/50 text-left text-xs text-slate dark:text-paper/50 uppercase tracking-wider">
              {["Title", "Subject", "Questions", "Access", "Actions"].map(h => (
                <th key={h} className="px-5 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line-gray-light dark:divide-line-gray-dark bg-white dark:bg-line-gray-dark/20">
            {sets.map((s, i) => (
              <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="hover:bg-line-gray-light/30 dark:hover:bg-line-gray-dark/30 transition-colors">
                <td className="px-5 py-3.5 font-medium text-ink-navy dark:text-paper">{s.title}</td>
                <td className="px-5 py-3.5 text-slate dark:text-paper/70">{s.subject}</td>
                <td className="px-5 py-3.5 font-mono text-slate dark:text-paper/60">{s.questions.length}</td>
                <td className="px-5 py-3.5">
                  {s.isFree
                    ? <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-signal-emerald/10 text-signal-emerald">Free</span>
                    : <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate/10 text-slate dark:text-paper/60">₹{s.price}</span>}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-slate/50 hover:text-signal-emerald hover:bg-signal-emerald/10 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteSet(s.id)} className="p-1.5 rounded-lg text-slate/50 hover:text-alert-coral hover:bg-alert-coral/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ─── COURSES TAB — full CRUD ─────────────────────────────────────────────
type CourseDraft = Course & { _new?: boolean };

function emptyMentor(): Mentor {
  return { name: "", specialty: "", initials: "", color: "from-signal-emerald to-emerald-700", bio: "" };
}

function emptyModule() {
  return { module: "", topics: [""] };
}

function CoursesTab() {
  const [courseList, setCourseList] = useState<CourseDraft[]>(initialCourses.map(c => ({ ...c })));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CourseDraft | null>(null);

  function openNew() {
    const d: CourseDraft = {
      id: `new-${Date.now()}`, title: "", description: "", price: 0,
      level: "Foundation", duration: "", tag: "", enrolledCount: 0, rating: 4.5,
      outcomes: [""], curriculum: [emptyModule()], mentors: [emptyMentor()], _new: true,
    };
    setDraft(d); setEditingId("__new__");
  }

  function openEdit(c: CourseDraft) {
    setDraft({ ...c, outcomes: [...c.outcomes], curriculum: c.curriculum.map(m => ({ ...m, topics: [...m.topics] })), mentors: c.mentors.map(m => ({ ...m })) });
    setEditingId(c.id);
  }

  function closeEditor() { setEditingId(null); setDraft(null); }

  function saveCourse() {
    if (!draft) return;
    if (editingId === "__new__") {
      setCourseList(prev => [...prev, { ...draft, _new: false }]);
    } else {
      setCourseList(prev => prev.map(c => c.id === editingId ? { ...draft, _new: false } : c));
    }
    closeEditor();
  }

  function deleteCourse(id: string) { setCourseList(prev => prev.filter(c => c.id !== id)); }

  // Helpers for draft mutations
  const setD = (patch: Partial<CourseDraft>) => draft && setDraft({ ...draft, ...patch });

  function updateOutcome(i: number, val: string) {
    if (!draft) return;
    const o = [...draft.outcomes]; o[i] = val; setDraft({ ...draft, outcomes: o });
  }
  function addOutcome() { draft && setDraft({ ...draft, outcomes: [...draft.outcomes, ""] }); }
  function removeOutcome(i: number) { draft && setDraft({ ...draft, outcomes: draft.outcomes.filter((_, idx) => idx !== i) }); }

  function updateModule(mi: number, field: "module" | "topics", val: string | string[]) {
    if (!draft) return;
    const c = draft.curriculum.map((m, i) => i === mi ? { ...m, [field]: val } : m);
    setDraft({ ...draft, curriculum: c });
  }
  function addModuleTopic(mi: number) {
    if (!draft) return;
    const c = draft.curriculum.map((m, i) => i === mi ? { ...m, topics: [...m.topics, ""] } : m);
    setDraft({ ...draft, curriculum: c });
  }
  function removeModuleTopic(mi: number, ti: number) {
    if (!draft) return;
    const c = draft.curriculum.map((m, i) => i === mi ? { ...m, topics: m.topics.filter((_, j) => j !== ti) } : m);
    setDraft({ ...draft, curriculum: c });
  }
  function addModule() { draft && setDraft({ ...draft, curriculum: [...draft.curriculum, emptyModule()] }); }
  function removeModule(mi: number) { draft && setDraft({ ...draft, curriculum: draft.curriculum.filter((_, i) => i !== mi) }); }

  function updateMentor(mi: number, patch: Partial<Mentor>) {
    if (!draft) return;
    const m = draft.mentors.map((men, i) => i === mi ? { ...men, ...patch } : men);
    setDraft({ ...draft, mentors: m });
  }
  function addMentor() { draft && setDraft({ ...draft, mentors: [...draft.mentors, emptyMentor()] }); }
  function removeMentor(mi: number) { draft && setDraft({ ...draft, mentors: draft.mentors.filter((_, i) => i !== mi) }); }

  // ── Builder ──
  if (editingId !== null && draft) {
    return (
      <motion.div key="course-builder" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">
            {editingId === "__new__" ? "New Course" : "Edit Course"}
          </h2>
          <button onClick={closeEditor} className="p-2 rounded-lg hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors">
            <X className="w-4 h-4 text-slate dark:text-paper/60" />
          </button>
        </div>

        {/* Basic fields */}
        <div className="p-5 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-4">
          <p className="text-xs font-semibold text-slate dark:text-paper/60 uppercase tracking-wide">Basic Info</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Title</label>
              <input className={inp} value={draft.title} onChange={e => setD({ title: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Description</label>
              <textarea className={`${inp} resize-none`} rows={2} value={draft.description} onChange={e => setD({ description: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Price (₹)</label>
              <input type="number" className={inp} value={draft.price} onChange={e => setD({ price: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Level</label>
              <select className={inp} value={draft.level} onChange={e => setD({ level: e.target.value as Course["level"] })}>
                <option>Foundation</option>
                <option>Intermediate</option>
                <option>Final</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Duration</label>
              <input className={inp} placeholder="e.g. 8 weeks" value={draft.duration} onChange={e => setD({ duration: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate dark:text-paper/70 mb-1 block">Tag (optional)</label>
              <select className={inp} value={draft.tag ?? ""} onChange={e => setD({ tag: e.target.value || undefined })}>
                <option value="">None</option>
                {["Bestseller", "Popular", "Premium", "Top Rated", "Free"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Outcomes */}
        <div className="p-5 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate dark:text-paper/60 uppercase tracking-wide">Outcomes</p>
            <button onClick={addOutcome} className="text-xs text-signal-emerald font-semibold hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
          </div>
          {draft.outcomes.map((o, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className={`${inp} flex-1`} value={o} onChange={e => updateOutcome(i, e.target.value)} />
              <button onClick={() => removeOutcome(i)} className="p-1.5 text-slate/40 hover:text-alert-coral hover:bg-alert-coral/10 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>

        {/* Curriculum */}
        <div className="p-5 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate dark:text-paper/60 uppercase tracking-wide">Curriculum</p>
            <button onClick={addModule} className="text-xs text-signal-emerald font-semibold hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Module</button>
          </div>
          {draft.curriculum.map((m, mi) => (
            <div key={mi} className="space-y-2 p-3 rounded-xl border border-line-gray-light dark:border-line-gray-dark">
              <div className="flex gap-2 items-center">
                <input className={`${inp} flex-1`} placeholder="Module name" value={m.module} onChange={e => updateModule(mi, "module", e.target.value)} />
                <button onClick={() => removeModule(mi)} className="p-1.5 text-slate/40 hover:text-alert-coral hover:bg-alert-coral/10 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              {m.topics.map((t, ti) => (
                <div key={ti} className="flex gap-2 items-center ml-4">
                  <input className={`${inp} flex-1 text-xs`} placeholder={`Topic ${ti + 1}`} value={t} onChange={e => { const ts = [...m.topics]; ts[ti] = e.target.value; updateModule(mi, "topics", ts); }} />
                  <button onClick={() => removeModuleTopic(mi, ti)} className="p-1.5 text-slate/40 hover:text-alert-coral hover:bg-alert-coral/10 rounded-lg transition-colors"><X className="w-3 h-3" /></button>
                </div>
              ))}
              <button onClick={() => addModuleTopic(mi)} className="ml-4 text-xs text-signal-emerald font-semibold hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Topic</button>
            </div>
          ))}
        </div>

        {/* Mentors */}
        <div className="p-5 bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate dark:text-paper/60 uppercase tracking-wide">Mentors</p>
            <button onClick={addMentor} className="text-xs text-signal-emerald font-semibold hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add Mentor</button>
          </div>
          {draft.mentors.map((m, mi) => (
            <div key={mi} className="space-y-2 p-3 rounded-xl border border-line-gray-light dark:border-line-gray-dark">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-ink-navy dark:text-paper">Mentor {mi + 1}</span>
                <button onClick={() => removeMentor(mi)} className="p-1 text-slate/40 hover:text-alert-coral transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <input className={inp} placeholder="Name" value={m.name} onChange={e => updateMentor(mi, { name: e.target.value })} />
                <input className={inp} placeholder="Specialty" value={m.specialty} onChange={e => updateMentor(mi, { specialty: e.target.value })} />
                <input className={inp} placeholder="Initials (e.g. SD)" value={m.initials} onChange={e => updateMentor(mi, { initials: e.target.value })} />
                <select className={inp} value={m.color} onChange={e => updateMentor(mi, { color: e.target.value })}>
                  <option value="from-signal-emerald to-emerald-700">Green</option>
                  <option value="from-blue-500 to-blue-700">Blue</option>
                  <option value="from-purple-500 to-purple-700">Purple</option>
                  <option value="from-orange-500 to-orange-700">Orange</option>
                </select>
                <div className="sm:col-span-2">
                  <textarea className={`${inp} resize-none`} rows={2} placeholder="Short bio" value={m.bio} onChange={e => updateMentor(mi, { bio: e.target.value })} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={saveCourse} className="px-6 py-2.5 bg-signal-emerald text-white text-sm font-bold rounded-xl hover:bg-signal-emerald/90 transition-colors">Save Course</button>
          <button onClick={closeEditor} className="px-6 py-2.5 border border-line-gray-light dark:border-line-gray-dark text-sm font-semibold text-slate dark:text-paper/60 rounded-xl hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors">Cancel</button>
        </div>
      </motion.div>
    );
  }

  // ── Table ──
  return (
    <motion.div key="courses-list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">Courses</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-signal-emerald text-white rounded-xl hover:bg-signal-emerald/90 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Course
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line-gray-light dark:border-line-gray-dark">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-line-gray-light/50 dark:bg-line-gray-dark/50 text-left text-xs text-slate dark:text-paper/50 uppercase tracking-wider">
              {["Course", "Level", "Price", "Enrolled", "Rating", "Mentors", "Actions"].map(h => (
                <th key={h} className="px-5 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line-gray-light dark:divide-line-gray-dark bg-white dark:bg-line-gray-dark/20">
            {courseList.map((c, i) => (
              <motion.tr key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="hover:bg-line-gray-light/30 dark:hover:bg-line-gray-dark/30 transition-colors">
                <td className="px-5 py-3.5 font-medium text-ink-navy dark:text-paper max-w-[180px]">
                  <div className="truncate">{c.title}</div>
                  <div className="text-xs text-slate dark:text-paper/50 font-normal">{c.duration}</div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    c.level === "Foundation" ? "bg-signal-emerald/10 text-signal-emerald" :
                    c.level === "Final" ? "bg-alert-coral/10 text-alert-coral" :
                    "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  }`}>{c.level}</span>
                </td>
                <td className="px-5 py-3.5 font-mono font-semibold text-ink-navy dark:text-paper">{c.price === 0 ? "Free" : `₹${c.price.toLocaleString()}`}</td>
                <td className="px-5 py-3.5 font-mono text-slate dark:text-paper/60">{c.enrolledCount.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-slate dark:text-paper/60">{c.rating}★</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1">
                    {c.mentors.map(m => (
                      <div key={m.name} title={m.name} className={`w-6 h-6 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-[9px] font-bold`}>
                        {m.initials}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-slate/50 hover:text-signal-emerald hover:bg-signal-emerald/10 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteCourse(c.id)} className="p-1.5 rounded-lg text-slate/50 hover:text-alert-coral hover:bg-alert-coral/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

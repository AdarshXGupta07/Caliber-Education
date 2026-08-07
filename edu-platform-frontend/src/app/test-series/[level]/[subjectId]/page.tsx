"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Upload, CheckCircle2, Clock, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Paper {
  id: string;
  title: string;
  description: string | null;
  question_file_url: string;
}

interface Submission {
  id: string;
  testId: string;
  status: "pending" | "reviewed";
  submittedAt: string;
  marksAwarded?: number | null;
  remarks?: string | null;
  checkedFileUrl?: string | null;
}

export default function TestSeriesSubjectPage({ params }: { params: Promise<{ level: string; subjectId: string }> }) {
  const { level, subjectId } = use(params);
  const { isAuthenticated, isMounted } = useAuth();

  const [papers, setPapers] = useState<Paper[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isMounted) return;
    const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
    const token = localStorage.getItem("caliber_jwt") || "";
    fetch(`${apiURL}/api/test-series/subjects/${subjectId}/papers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (r.status === 403) { setLocked(true); return []; }
        return r.ok ? r.json() : [];
      })
      .then((d) => setPapers(d || []))
      .catch(() => { })
      .finally(() => setLoading(false));

    fetch(`${apiURL}/api/tests/submissions`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setSubmissions(Array.isArray(d) ? d : (d?.submissions || [])))
      .catch(() => { });
  }, [subjectId, isMounted]);

  async function handleUpload(paperId: string, file: File) {
    setError("");
    if (file.type !== "application/pdf") {
      setError("Only PDF files are accepted. Please combine your answer sheet into a single PDF.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("File is too large — please keep it under 15MB.");
      return;
    }
    setUploadingFor(paperId);
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";
      const fd = new FormData();
      fd.append("files", file);
      const res = await fetch(`${apiURL}/api/tests/${paperId}/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.detail || "Upload failed.");
      }
      setSubmissions((prev) => [
        ...prev,
        { id: `tmp-${paperId}`, testId: paperId, status: "pending", submittedAt: new Date().toISOString() },
      ]);
    } catch (e: any) {
      setError(e.message || "Upload failed. Please try again.");
    } finally {
      setUploadingFor(null);
    }
  }

  if (isMounted && !isAuthenticated) {
    return (
      <div className="pt-32 text-center">
        <p className="text-sm text-slate dark:text-paper/60">Please sign in to view your papers.</p>
        <Link href="/login" className="text-sm font-bold text-signal-emerald hover:underline mt-2 inline-block">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link href={`/test-series/${level}`} className="inline-flex items-center gap-1.5 text-xs text-slate dark:text-paper/60 hover:text-ink-navy dark:hover:text-paper mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </Link>

      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="font-heading font-extrabold text-2xl sm:text-3xl text-ink-navy dark:text-paper mb-2">
        Your papers
      </motion.h1>
      <p className="text-sm text-slate dark:text-paper/60 mb-8">
        Download a paper, attempt it on paper under exam conditions, then upload your answer sheet as a single PDF.
      </p>

      {error && <p className="text-xs text-alert-coral mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate dark:text-paper/50">Loading papers...</p>
      ) : locked ? (
        <div className="border border-line-gray-light dark:border-line-gray-dark rounded-2xl p-10 text-center">
          <p className="text-sm text-slate dark:text-paper/60 mb-3">You haven't purchased this test series yet.</p>
          <Link href={`/test-series/${level}`} className="text-sm font-bold text-signal-emerald hover:underline">
            View pricing
          </Link>
        </div>
      ) : papers.length === 0 ? (
        <div className="border border-line-gray-light dark:border-line-gray-dark rounded-2xl p-10 text-center">
          <FileText className="w-8 h-8 mx-auto text-slate/40 mb-3" />
          <p className="text-sm text-slate dark:text-paper/60">Papers for this subject are being uploaded. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {papers.map((p) => {
            const sub = submissions.find((s) => s.testId === p.id);
            return (
              <div key={p.id} className="border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-bold text-sm text-ink-navy dark:text-paper">{p.title}</h3>
                    {p.description && <p className="text-xs text-slate dark:text-paper/60 mt-1">{p.description}</p>}
                  </div>

                  {sub?.status === "reviewed" ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-signal-emerald shrink-0">
                      <CheckCircle2 className="w-4 h-4" /> Evaluated{typeof sub.marksAwarded === "number" ? ` — ${sub.marksAwarded} marks` : ""}
                    </span>
                  ) : sub ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 shrink-0">
                      <Clock className="w-4 h-4" /> Under evaluation
                    </span>
                  ) : null}
                </div>

                {sub?.status === "reviewed" && sub.remarks && (
                  <p className="mt-3 text-xs text-slate dark:text-paper/70 bg-line-gray-light/40 dark:bg-line-gray-dark/30 p-3 rounded-lg">
                    <b>Mentor feedback:</b> {sub.remarks}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  {p.question_file_url && (
                    <a href={p.question_file_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border border-line-gray-light dark:border-line-gray-dark rounded-xl hover:border-ink-navy dark:hover:border-paper transition-colors">
                      <Download className="w-3.5 h-3.5" /> Question paper
                    </a>
                  )}

                  {sub?.checkedFileUrl && (
                    <a href={sub.checkedFileUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-signal-emerald/10 text-signal-emerald rounded-xl hover:bg-signal-emerald/20 transition-colors">
                      <Download className="w-3.5 h-3.5" /> Checked copy
                    </a>
                  )}

                  {!sub && (
                    <label className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy rounded-xl cursor-pointer hover:opacity-90 transition-opacity">
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingFor === p.id ? "Uploading..." : "Upload answer (PDF)"}
                      <input type="file" accept="application/pdf" className="hidden"
                        disabled={uploadingFor === p.id}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(p.id, f); }} />
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

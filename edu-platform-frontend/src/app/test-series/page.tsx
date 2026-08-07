"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface TSSubject {
  id: string;
  level: string;
  group_name: string;
  name: string;
  code: string;
  description: string;
  price: number | null;
}

const LEVELS = [
  { key: "FOUNDATION", label: "CA Foundation", blurb: "Build your base with examiner-checked mock papers." },
  { key: "INTERMEDIATE", label: "CA Intermediate", blurb: "Group-wise mock tests with detailed evaluation." },
  { key: "FINAL", label: "CA Final", blurb: "Exam-standard papers marked by qualified CAs." },
];

export default function TestSeriesLandingPage() {
  const { isAuthenticated } = useAuth();
  const [subjects, setSubjects] = useState<TSSubject[]>([]);
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
    fetch(`${apiURL}/api/test-series/catalog`)
      .then((r) => (r.ok ? r.json() : { subjects: [] }))
      .then((d) => setSubjects(d.subjects || []))
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
    const token = localStorage.getItem("caliber_jwt") || "";
    fetch(`${apiURL}/api/test-series/my-subjects`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setOwnedIds((d || []).map((s: TSSubject) => s.id)))
      .catch(() => setOwnedIds([]));
  }, [isAuthenticated]);

  return (
    <div className="pt-24 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate dark:text-paper/50">Test Series</p>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink-navy dark:text-paper mt-2">
          Written mock tests, checked by CAs
        </h1>
        <p className="text-sm text-slate dark:text-paper/60 mt-3 max-w-2xl">
          Attempt full-length papers under exam conditions, upload your answer sheet as a PDF, and get it evaluated
          with marks, corrections and improvement notes from a qualified mentor.
        </p>
      </motion.div>

      {loading ? (
        <p className="text-sm text-slate dark:text-paper/50">Loading test series...</p>
      ) : subjects.length === 0 ? (
        <div className="border border-line-gray-light dark:border-line-gray-dark rounded-2xl p-10 text-center">
          <FileText className="w-8 h-8 mx-auto text-slate/40 mb-3" />
          <p className="text-sm text-slate dark:text-paper/60">Test series are being set up. Check back shortly.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {LEVELS.map((lvl) => {
            const levelSubjects = subjects.filter((s) => s.level === lvl.key);
            if (levelSubjects.length === 0) return null;
            return (
              <section key={lvl.key}>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <h2 className="font-heading font-bold text-xl text-ink-navy dark:text-paper">{lvl.label}</h2>
                    <p className="text-xs text-slate dark:text-paper/60 mt-0.5">{lvl.blurb}</p>
                  </div>
                  <Link href={`/test-series/${lvl.key.toLowerCase()}`}
                    className="text-xs font-bold text-signal-emerald hover:underline flex items-center gap-1 shrink-0">
                    View &amp; buy <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {levelSubjects.map((s) => {
                    const owned = ownedIds.includes(s.id);
                    return (
                      <Link key={s.id} href={owned ? `/test-series/${lvl.key.toLowerCase()}/${s.id}` : `/test-series/${lvl.key.toLowerCase()}`}
                        className="group border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 rounded-2xl p-5 hover:border-ink-navy dark:hover:border-paper transition-all">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/50">{s.code}</span>
                          {owned ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-signal-emerald">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Purchased
                            </span>
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate/40" />
                          )}
                        </div>
                        <h3 className="font-heading font-bold text-sm text-ink-navy dark:text-paper leading-snug">{s.name}</h3>
                        <p className="text-xs text-slate dark:text-paper/60 mt-1.5 line-clamp-2">{s.description}</p>
                        <p className="mt-3 font-mono font-bold text-sm text-ink-navy dark:text-paper">
                          {owned ? "Open papers →" : s.price ? `₹${Number(s.price).toLocaleString()}` : "Coming soon"}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

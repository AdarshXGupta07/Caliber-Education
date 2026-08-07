"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface TSSubject {
  id: string; level: string; group_name: string; name: string; code: string;
  description: string; price: number | null;
}
interface TSBundle {
  id: string; title: string; level: string; group_name: string;
  subject_ids: string[]; price: number | null;
}

const LEVEL_LABELS: Record<string, string> = {
  foundation: "CA Foundation", intermediate: "CA Intermediate", final: "CA Final",
};

export default function TestSeriesLevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const levelKey = level.toUpperCase();

  const [subjects, setSubjects] = useState<TSSubject[]>([]);
  const [bundles, setBundles] = useState<TSBundle[]>([]);
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
    fetch(`${apiURL}/api/test-series/catalog`)
      .then((r) => (r.ok ? r.json() : { subjects: [], bundles: [] }))
      .then((d) => {
        setSubjects((d.subjects || []).filter((s: TSSubject) => s.level === levelKey));
        setBundles((d.bundles || []).filter((b: TSBundle) => b.level === levelKey));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [levelKey]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
    const token = localStorage.getItem("caliber_jwt") || "";
    fetch(`${apiURL}/api/test-series/my-subjects`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setOwnedIds((d || []).map((s: TSSubject) => s.id)))
      .catch(() => { });
  }, [isAuthenticated]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const selectBundle = (b: TSBundle) => setSelected(b.subject_ids.filter((id) => !ownedIds.includes(id)));

  // Mirrors the backend's calculate_test_series_cart: sums the selection,
  // then checks whether any bundle covering a subset of it is cheaper than
  // buying those papers individually — same number the server will charge.
  const cart = (() => {
    const subMap = new Map(subjects.map((s) => [s.id, s]));
    const selectedRows = selected.map((id) => subMap.get(id)).filter(Boolean) as TSSubject[];
    const realTotal = selectedRows.reduce((sum, s) => sum + Number(s.price || 0), 0);
    const selectedSet = new Set(selected);

    let discounted = realTotal;
    let appliedBundle: TSBundle | null = null;
    for (const b of bundles) {
      const bundleSet = new Set(b.subject_ids);
      const isSubset = b.subject_ids.length > 0 && b.subject_ids.every((id) => selectedSet.has(id));
      if (!isSubset) continue;
      const remaining = selected.filter((id) => !bundleSet.has(id));
      const remPrice = remaining.reduce((sum, id) => sum + Number(subMap.get(id)?.price || 0), 0);
      const candidate = Number(b.price || 0) + remPrice;
      if (candidate < discounted) { discounted = candidate; appliedBundle = b; }
    }
    return { total: discounted, savings: Math.max(0, realTotal - discounted), appliedBundle };
  })();
  const total = cart.total;

  async function handleBuy() {
    if (!isAuthenticated) { router.push("/login"); return; }
    if (selected.length === 0) return;
    setBuying(true);
    setError("");
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";
      const res = await fetch(`${apiURL}/api/payments/create-test-series-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ level: levelKey, subjectIds: selected }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.detail || "Couldn't start checkout.");
      }
      const order = await res.json();

      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Failed to load payment gateway"));
          document.body.appendChild(s);
        });
      }

      const rzp = new (window as any).Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "CAliber Education",
        description: `${LEVEL_LABELS[level] || levelKey} Test Series`,
        order_id: order.orderId,
        handler: async (resp: any) => {
          const vr = await fetch(`${apiURL}/api/payments/verify-test-series-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            }),
          });
          if (vr.ok) {
            window.location.href = "/dashboard?tab=test-series";
          } else {
            setError("Payment verification failed. Please contact support.");
          }
        },
        theme: { color: "#10b981" },
        modal: { ondismiss: () => setBuying(false) },
      });
      rzp.open();
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setBuying(false);
    }
  }

  const groups = Array.from(new Set(subjects.map((s) => s.group_name)));

  return (
    <div className="pt-24 pb-32 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link href="/test-series" className="inline-flex items-center gap-1.5 text-xs text-slate dark:text-paper/60 hover:text-ink-navy dark:hover:text-paper mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> All levels
      </Link>

      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="font-heading font-extrabold text-3xl text-ink-navy dark:text-paper">
        {LEVEL_LABELS[level] || levelKey} Test Series
      </motion.h1>
      <p className="text-sm text-slate dark:text-paper/60 mt-2 mb-8">
        Pick the papers you want evaluated. Buying a full group is cheaper than picking each paper separately.
      </p>

      {loading ? (
        <p className="text-sm text-slate dark:text-paper/50">Loading...</p>
      ) : subjects.length === 0 ? (
        <p className="text-sm text-slate dark:text-paper/60">No test series available for this level yet.</p>
      ) : (
        <>
          {bundles.length > 0 && (
            <div className="mb-8">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate dark:text-paper/50 mb-3">Quick select</h2>
              <div className="flex flex-wrap gap-2">
                {bundles.map((b) => (
                  <button key={b.id} onClick={() => selectBundle(b)}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl border border-line-gray-light dark:border-line-gray-dark hover:border-signal-emerald hover:text-signal-emerald transition-colors">
                    {b.title}{b.price ? ` — ₹${Number(b.price).toLocaleString()}` : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          {groups.map((g) => (
            <section key={g} className="mb-8">
              {g !== "NONE" && (
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate dark:text-paper/50 mb-3">
                  {g.replace("_", " ")}
                </h2>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                {subjects.filter((s) => s.group_name === g).map((s) => {
                  const owned = ownedIds.includes(s.id);
                  const isSel = selected.includes(s.id);
                  return (
                    <button key={s.id} disabled={owned} onClick={() => toggle(s.id)}
                      className={`text-left p-4 rounded-2xl border transition-all ${owned
                        ? "border-signal-emerald/30 bg-signal-emerald/5 cursor-default"
                        : isSel
                          ? "border-signal-emerald bg-signal-emerald/5"
                          : "border-line-gray-light dark:border-line-gray-dark hover:border-ink-navy dark:hover:border-paper"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-heading font-bold text-sm text-ink-navy dark:text-paper">{s.name}</p>
                          <p className="text-[11px] text-slate dark:text-paper/55 mt-0.5">{s.code}</p>
                        </div>
                        {owned ? <CheckCircle2 className="w-4 h-4 text-signal-emerald shrink-0" />
                          : isSel ? <CheckCircle2 className="w-4 h-4 text-signal-emerald shrink-0" />
                            : <Lock className="w-3.5 h-3.5 text-slate/40 shrink-0" />}
                      </div>
                      <p className="mt-2 font-mono font-bold text-sm text-ink-navy dark:text-paper">
                        {owned ? "Purchased" : s.price ? `₹${Number(s.price).toLocaleString()}` : "Only sold as part of a Group"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          {error && <p className="text-xs text-alert-coral mb-3">{error}</p>}

          {selected.length > 0 && (
            <motion.div initial={{ y: 60 }} animate={{ y: 0 }}
              className="fixed bottom-0 left-0 right-0 border-t border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-ink-navy px-4 py-4 shadow-lg">
              <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate dark:text-paper/50">
                    {selected.length} paper{selected.length > 1 ? "s" : ""} selected
                    {cart.appliedBundle ? ` · ${cart.appliedBundle.title} rate applied` : ""}
                  </p>
                  <p className="font-mono font-extrabold text-xl text-ink-navy dark:text-paper">
                    ₹{total.toLocaleString()}
                    {cart.savings > 0 && (
                      <span className="ml-2 text-xs font-bold text-signal-emerald">you save ₹{cart.savings.toLocaleString()}</span>
                    )}
                  </p>
                </div>
                <button onClick={handleBuy} disabled={buying || total <= 0}
                  className="flex items-center gap-2 px-6 py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-xl text-sm disabled:opacity-50">
                  <ShieldCheck className="w-4 h-4" /> {buying ? "Starting..." : "Buy with Razorpay"}
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { markProfileComplete } = useAuth();
  const [form, setForm] = useState({
    full_name: "", phone_number: "", address: "", stage: "CA Final", attempt_status: "First Attempt",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";
      const res = await fetch(`${apiURL}/api/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Couldn't save your details. Please try again.");
      markProfileComplete();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell progressStep={1} progressTotal={1}>
      <div className="text-center mb-6">
        <h1 className="font-heading font-bold text-xl text-ink-navy dark:text-paper">One more step</h1>
        <p className="text-xs text-slate dark:text-paper/60 mt-1.5">
          We need a few details before you can continue — this helps mentors reach you for sessions and evaluations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1.5 block">Full Name</label>
          <input required autoFocus value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
            className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg outline-none focus:border-signal-emerald/50 transition-colors"
            placeholder="e.g. John Doe" />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1.5 block">Phone / WhatsApp</label>
          <input required value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })}
            className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg outline-none focus:border-signal-emerald/50 transition-colors"
            placeholder="+91..." />
          <p className="text-[10px] text-slate dark:text-paper/50 mt-1.5 leading-relaxed">
            Use a real, reachable WhatsApp number — mentors contact you here for 1:1 sessions and test evaluations.
          </p>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1.5 block">Address / City</label>
          <textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
            className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg outline-none focus:border-signal-emerald/50 transition-colors resize-none"
            rows={2} placeholder="Your residential address" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1.5 block">Stage</label>
            <select required value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}
              className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg outline-none focus:border-signal-emerald/50 transition-colors">
              <option>CA Foundation</option>
              <option>CA Intermediate</option>
              <option>CA Final</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/70 mb-1.5 block">Attempt Status</label>
            <select required value={form.attempt_status} onChange={e => setForm({ ...form, attempt_status: e.target.value })}
              className="w-full px-4 py-2.5 text-sm border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-ink-navy dark:text-paper rounded-lg outline-none focus:border-signal-emerald/50 transition-colors">
              <option>First Attempt</option>
              <option>Repeater (2nd)</option>
              <option>Repeater (3rd+)</option>
            </select>
          </div>
        </div>

        {error && <p className="text-xs text-alert-coral">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm mt-6 disabled:opacity-50">
          {loading ? "Saving..." : "Continue"} <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </AuthShell>
  );
}

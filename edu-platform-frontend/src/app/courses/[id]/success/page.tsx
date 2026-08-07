"use client";

import { use, useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Copy, Check, MessageCircle, ArrowRight, LayoutDashboard, AlertTriangle, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface CourseSummary {
  id: string;
  title: string;
  deliveryType?: "whatsapp" | "mcq-series";
}

export default function PaymentSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [notFoundCourse, setNotFoundCourse] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState("");
  const [linkPending, setLinkPending] = useState(false);
  const [loadingLink, setLoadingLink] = useState(true);
  const [autoOpened, setAutoOpened] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!id) return;
    const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
    fetch(`${apiURL}/api/courses/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setCourse({ id: data.id, title: data.title, deliveryType: data.deliveryType }))
      .catch(() => setNotFoundCourse(true))
      .finally(() => setCourseLoading(false));
  }, [id]);

  useEffect(() => {
    if (!mounted || !id || !course || course.deliveryType !== "whatsapp") {
      setLoadingLink(false);
      return;
    }
    const getAccessLink = async () => {
      try {
        const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
        const token = localStorage.getItem("caliber_jwt") || "";
        const res = await fetch(`${apiURL}/api/courses/${id}/whatsapp-access`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setWhatsappLink(data.whatsappLink || "");
        } else {
          // Enrolled but the admin hasn't set the group link yet — a real,
          // known state (not an error), never fall back to a fake link.
          setLinkPending(true);
        }
      } catch {
        setLinkPending(true);
      } finally {
        setLoadingLink(false);
      }
    };
    getAccessLink();
  }, [id, mounted, course]);

  // Best-effort auto-redirect to WhatsApp — browsers may block a popup this
  // far from a direct click, so the "Join WhatsApp Group" button below stays
  // as the reliable fallback either way.
  useEffect(() => {
    if (!whatsappLink || autoOpened) return;
    setAutoOpened(true);
    window.open(whatsappLink, "_blank", "noopener,noreferrer");
  }, [whatsappLink, autoOpened]);

  if (notFoundCourse) return notFound();
  if (courseLoading || !course) {
    return <div className="pt-24 text-center text-sm text-slate dark:text-paper/50">Loading...</div>;
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(whatsappLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (mounted && !isAuthenticated) {
    router.push("/login");
    return null;
  }

  return (
    <div className="pt-16 pb-24 min-h-screen bg-paper dark:bg-ink-navy/10 flex items-center justify-center px-4">
      <div className="max-w-md w-full border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 rounded-xl p-8 shadow-sm space-y-8">

        {/* Success Moment */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex items-center justify-center mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring" }}
            >
              <CheckCircle className="w-8 h-8 text-signal-emerald" />
            </motion.div>
          </motion.div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/40">Enrollment Confirmed</span>
            <h1 className="font-heading font-extrabold text-2xl text-ink-navy dark:text-paper leading-tight">
              Payment Successful
            </h1>
            <p className="text-xs text-slate dark:text-paper/60 max-w-xs mx-auto pt-1">
              You are now enrolled in <span className="font-semibold text-ink-navy dark:text-paper">{course.title}</span>.
            </p>
          </div>
        </div>

        {/* WhatsApp Block */}
        {course.deliveryType === "whatsapp" && (
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-paper dark:bg-line-gray-dark/10 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-emerald-600/10 flex items-center justify-center text-emerald-600">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-xs text-ink-navy dark:text-paper">Your WhatsApp access link</h3>
                <p className="text-[9px] text-slate/50 dark:text-paper/45">Join your class doubt-resolution group</p>
              </div>
            </div>

            {loadingLink ? (
              <div className="text-center py-4 text-xs text-slate dark:text-paper/40 animate-pulse">
                Retrieving invite link...
              </div>
            ) : linkPending ? (
              <div className="flex gap-2 p-3 rounded bg-line-gray-light/45 dark:bg-line-gray-dark/20 text-[11px] text-slate dark:text-paper/60 leading-relaxed">
                <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Your enrollment is confirmed — we're setting up your group invite and will email it to{" "}
                  <span className="font-semibold">{user?.email}</span> shortly.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center justify-between p-2.5 rounded border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/50 text-[11px] select-all font-mono text-slate dark:text-paper/80 overflow-hidden truncate">
                    <span>{whatsappLink}</span>
                    <button
                      onClick={handleCopyLink}
                      className="ml-2 p-1 hover:bg-line-gray-light dark:hover:bg-line-gray-dark rounded transition-colors text-slate dark:text-paper/60 flex-shrink-0"
                      aria-label="Copy link"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-signal-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs active:scale-[0.98]"
                >
                  <MessageCircle className="w-4.5 h-4.5" /> Join WhatsApp Group
                </a>

                <p className="text-[10px] text-center text-slate dark:text-paper/50 bg-line-gray-light/45 dark:bg-line-gray-dark/20 p-2 rounded leading-normal">
                  📲 <strong>Setup Note:</strong> Tap the button above and request to join the group inside WhatsApp — you'll be approved within a few hours.
                </p>

                {/* Restriction Note */}
                <div className="flex gap-2 p-3 rounded bg-amber-500/5 border border-amber-500/15 text-[10px] text-amber-700 dark:text-amber-500 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    This link is uniquely tied to your registered email (<span className="font-semibold">{user?.email}</span>) and must not be shared. Doing so will result in removal from the batch.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Test Series Upsell */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-lg border border-signal-emerald/25 bg-signal-emerald/5 space-y-2"
        >
          <h3 className="font-heading font-bold text-xs text-ink-navy dark:text-paper">Round out your prep with Test Series</h3>
          <p className="text-[11px] text-slate dark:text-paper/60 leading-relaxed">
            Real exam-condition mock papers with mentor evaluation, marks, and feedback — priced per subject or as a discounted Group bundle.
          </p>
          <Link
            href="/test-series"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-signal-emerald hover:underline pt-1"
          >
            Browse Test Series <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Dashboard Navigation */}
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="w-full py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/courses/${course.id}`}
            className="w-full py-2 text-center text-xs text-slate dark:text-paper/50 hover:text-ink-navy dark:hover:text-paper transition-colors"
          >
            View course details
          </Link>
        </div>

      </div>
    </div>
  );
}

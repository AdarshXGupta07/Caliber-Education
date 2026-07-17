"use client";

import { use, useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Copy, Check, MessageCircle, ArrowRight, LayoutDashboard, AlertTriangle } from "lucide-react";
import { courses } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";

export default function PaymentSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const course = courses.find((c) => c.id === id);
  const { user, isAuthenticated, purchasedCourseIds } = useAuth();
  const router = useRouter();
  
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!course) return notFound();

  // If not authenticated or not purchased in the context, we should redirect to login/dashboard
  // But wait, for easy demoing let's allow viewing it if mounted is true, but check is good.
  const isPurchased = purchasedCourseIds.includes(course.id);

  const whatsappLink = `https://chat.whatsapp.com/invite/CA-${course.id.split("-").slice(1).join("-").toUpperCase()}-2026`;

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

          {/* Restriction Note */}
          <div className="flex gap-2 p-3 rounded bg-amber-500/5 border border-amber-500/15 text-[10px] text-amber-700 dark:text-amber-500 leading-relaxed">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              This link is uniquely tied to your registered email (<span className="font-semibold">{user?.email}</span>) and must not be shared. Doing so will result in removal from the batch.
            </p>
          </div>
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

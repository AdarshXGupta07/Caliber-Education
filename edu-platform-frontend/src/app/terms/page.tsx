"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TermsContent } from "@/components/TermsContent";

export default function TermsPage() {
  return (
    <div className="pt-24 pb-20 max-w-3xl mx-auto px-4 sm:px-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate dark:text-paper/60 hover:text-ink-navy dark:hover:text-paper transition-colors mb-8">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to home
      </Link>
      <div className="bg-white dark:bg-line-gray-dark/40 border border-line-gray-light dark:border-line-gray-dark rounded-2xl p-6 sm:p-8">
        <TermsContent />
      </div>
    </div>
  );
}

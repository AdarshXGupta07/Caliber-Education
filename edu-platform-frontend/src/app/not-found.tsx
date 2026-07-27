"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="pt-16 min-h-screen bg-paper dark:bg-ink-navy flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        
        {/* Visual symbol */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="w-16 h-16 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 flex items-center justify-center mx-auto text-ink-navy dark:text-paper"
        >
          <AlertCircle className="w-8 h-8 text-slate/50 dark:text-paper/40" />
        </motion.div>

        {/* Content */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate/40 dark:text-paper/40">Error 404</span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink-navy dark:text-paper leading-none">
            Page Not Found
          </h1>
          <p className="text-xs text-slate dark:text-paper/60 max-w-xs mx-auto leading-relaxed">
            The page you are looking for does not exist or has been relocated to another path.
          </p>
        </div>

        {/* Navigation */}
        <div className="pt-4 flex flex-col gap-2 max-w-xs mx-auto">
          <Link 
            href="/"
            className="w-full py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" /> Return Home
          </Link>
          <Link 
            href="/courses"
            className="w-full py-2 border border-line-gray-light dark:border-line-gray-dark text-slate dark:text-paper/70 hover:text-ink-navy dark:hover:text-paper rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            Browse Courses <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}

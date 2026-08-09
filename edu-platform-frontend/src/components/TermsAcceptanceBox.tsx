"use client";

import { useState } from "react";
import Link from "next/link";
import { TermsContent } from "./TermsContent";

// Requires scrolling the embedded terms to the bottom before the acceptance
// checkbox becomes checkable — the full text is also always reachable at
// /terms (opened in a new tab) for anyone who'd rather read it full-size.
export function TermsAcceptanceBox({
  accepted, onAcceptedChange,
}: {
  accepted: boolean;
  onAcceptedChange: (value: boolean) => void;
}) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 24) {
      setScrolledToBottom(true);
    }
  }

  return (
    <div className="space-y-2">
      <div
        onScroll={handleScroll}
        className="h-56 overflow-y-auto rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/20 dark:bg-line-gray-dark/20 p-4 text-xs [&_h1]:text-base [&_h2]:text-xs"
      >
        <TermsContent />
      </div>
      {!scrolledToBottom && (
        <p className="text-[10px] text-slate dark:text-paper/50 text-center">Scroll to the bottom to continue</p>
      )}
      <label className={`flex items-start gap-2 ${scrolledToBottom ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
        <input
          type="checkbox"
          checked={accepted}
          disabled={!scrolledToBottom}
          onChange={(e) => onAcceptedChange(e.target.checked)}
          className="accent-signal-emerald w-4 h-4 mt-0.5 flex-shrink-0"
        />
        <span className="text-xs text-ink-navy dark:text-paper">
          I have read and agree to the{" "}
          <Link href="/terms" target="_blank" className="text-signal-emerald font-semibold hover:underline">
            Terms &amp; Conditions
          </Link>
          , including the non-refundable payment policy.
        </span>
      </label>
    </div>
  );
}

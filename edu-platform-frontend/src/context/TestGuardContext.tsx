"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LeaveTestModal } from "@/components/LeaveTestModal";

type PendingNav = { type: "push"; href: string } | { type: "back" } | { type: "action"; run: () => void } | null;

interface TestGuardValue {
  isTestActive: boolean;
  setTestActive: (active: boolean) => void;
  guardNavigate: (href: string) => void;
  guardAction: (run: () => void) => void;
}

const TestGuardContext = createContext<TestGuardValue | null>(null);

export function TestGuardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isTestActive, setIsTestActiveState] = useState(false);
  const [pendingNav, setPendingNav] = useState<PendingNav>(null);
  const isTestActiveRef = useRef(false);
  // Counts synthetic history entries pushed while guarding, so "Leave" can
  // unwind exactly that many and land back on the true prior page, even
  // after several Stay/re-prompt cycles each added one more guard entry.
  const extraEntriesRef = useRef(0);

  const setTestActive = useCallback((active: boolean) => {
    isTestActiveRef.current = active;
    setIsTestActiveState(active);
  }, []);

  useEffect(() => {
    if (!isTestActive) return;
    window.history.pushState(null, "", window.location.href);
    extraEntriesRef.current = 1;

    const handlePopState = () => {
      if (!isTestActiveRef.current) return;
      // Neutralize the back-navigation that just happened — re-push so the
      // URL never actually leaves the current page — then prompt.
      window.history.pushState(null, "", window.location.href);
      extraEntriesRef.current += 1;
      setPendingNav({ type: "back" });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isTestActive]);

  const guardNavigate = useCallback((href: string) => {
    if (!isTestActiveRef.current) {
      router.push(href);
      return;
    }
    setPendingNav({ type: "push", href });
  }, [router]);

  const guardAction = useCallback((run: () => void) => {
    if (!isTestActiveRef.current) {
      run();
      return;
    }
    setPendingNav({ type: "action", run });
  }, []);

  const handleStay = useCallback(() => {
    setPendingNav(null);
  }, []);

  const handleLeave = useCallback(() => {
    const nav = pendingNav;
    setTestActive(false);
    setPendingNav(null);
    if (nav?.type === "back") {
      const unwind = extraEntriesRef.current;
      extraEntriesRef.current = 0;
      if (unwind > 0) window.history.go(-unwind);
    } else if (nav?.type === "push") {
      extraEntriesRef.current = 0;
      router.push(nav.href);
    } else if (nav?.type === "action") {
      nav.run();
    }
  }, [pendingNav, router, setTestActive]);

  return (
    <TestGuardContext.Provider value={{ isTestActive, setTestActive, guardNavigate, guardAction }}>
      {children}
      <LeaveTestModal open={pendingNav !== null} onStay={handleStay} onLeave={handleLeave} />
    </TestGuardContext.Provider>
  );
}

export function useTestGuard(): TestGuardValue {
  const ctx = useContext(TestGuardContext);
  if (!ctx) {
    // Passthrough default — shouldn't happen since TestGuardProvider is
    // mounted at the root layout, but keeps every consumer safe rather than
    // throwing if that ever changes.
    return {
      isTestActive: false,
      setTestActive: () => {},
      guardNavigate: (href: string) => { window.location.href = href; },
      guardAction: (run: () => void) => run(),
    };
  }
  return ctx;
}

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Paths where we must never force the redirect — the signup flow already has
// its own inline profile step, auth pages need to stay reachable, and
// /complete-profile is the destination itself.
const EXEMPT_PREFIXES = ["/login", "/signup", "/complete-profile", "/auth/callback", "/forgot-password", "/reset-password"];

export function ProfileCompletionGate() {
  const { user, isAuthenticated, isMounted } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isMounted || !isAuthenticated || !user) return;
    if (user.profileComplete) return;
    if (EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))) return;
    router.push("/complete-profile");
  }, [isMounted, isAuthenticated, user, pathname, router]);

  return null;
}

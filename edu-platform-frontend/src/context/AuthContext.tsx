"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { courses, registeredUsers, pendingVerifications, type PaymentVerification } from "@/lib/mockData";

interface User {
  id: string;
  email: string;
  role: "student" | "mentor" | "admin" | "super_admin";
  profileComplete: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isMounted: boolean;
  login: (email: string, password?: string, turnstileToken?: string) => Promise<void>;
  setSession: (token: string, user: User) => void;
  logout: () => void;
  markProfileComplete: () => void;
  verifications: PaymentVerification[];
  purchasedCourseIds: string[];
  enrollFreeCourse: (courseId: string) => void;
  submitUTR: (courseId: string, utr: string) => void;
  approveVerification: (id: string) => void;
  rejectVerification: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [verifications, setVerifications] = useState<PaymentVerification[]>([]);
  const [localPurchasedIds, setLocalPurchasedIds] = useState<string[]>([]);
  const [realPurchasedIds, setRealPurchasedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("caliber_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedVerifications = localStorage.getItem("caliber_verifications");
    if (savedVerifications) {
      setVerifications(JSON.parse(savedVerifications));
    } else {
      setVerifications(pendingVerifications);
    }
    const savedLocalPurchased = localStorage.getItem("caliber_local_purchased");
    if (savedLocalPurchased) {
      setLocalPurchasedIds(JSON.parse(savedLocalPurchased));
    }
    setMounted(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!mounted) return;
    if (user) {
      localStorage.setItem("caliber_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("caliber_user");
    }
  }, [user, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("caliber_verifications", JSON.stringify(verifications));
  }, [verifications, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("caliber_local_purchased", JSON.stringify(localPurchasedIds));
  }, [localPurchasedIds, mounted]);

  // Real, backend-verified course enrolments (Razorpay purchases stored in
  // the `enrollments` table) — this is the source of truth for "which
  // courses does this user actually own", separate from the local-only free
  // enrolments and mock verifications below.
  useEffect(() => {
    if (!mounted) return;
    if (!user) { setRealPurchasedIds([]); return; }
    const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
    const token = localStorage.getItem("caliber_jwt") || "";
    if (!token) { setRealPurchasedIds([]); return; }
    fetch(`${apiURL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : null))
      .then(data => setRealPurchasedIds(data?.purchases || []))
      .catch(() => setRealPurchasedIds([]));
  }, [user, mounted]);

  const login = async (email: string, password?: string, turnstileToken?: string) => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
    try {
      const res = await fetch(`${apiURL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, turnstileToken }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // FastAPI's HTTPException body is {"detail": "..."}, not {"error": "..."}
        throw new Error(err.detail || "Login failed");
      }
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("caliber_jwt", data.token);
      }
      setUser(data.user);
    } catch (err: any) {
      // No mock-user fallback: a failed login must surface as a failed
      // login, not silently sign the caller in (this previously let anyone
      // become an "admin" locally just by having "admin" in their email).
      throw err;
    }
  };

  // Hydrate the session directly from a token+user pair a backend call
  // already returned (e.g. register's response) — skips a second network
  // round trip, and avoids reusing a single-use Turnstile token twice.
  const setSession = (token: string, sessionUser: User) => {
    localStorage.setItem("caliber_jwt", token);
    setUser(sessionUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("caliber_user");
    localStorage.removeItem("caliber_jwt");
  };

  const markProfileComplete = () => {
    setUser((prev) => (prev ? { ...prev, profileComplete: true } : prev));
  };

  // Compute purchased courses for the current user
  const purchasedCourseIds = React.useMemo(() => {
    if (!user) return [];

    // 1. Initial mock purchases (Removed for pure production testing)
    const initialCourseIds: string[] = [];

    // 2. Approved verifications matching the user
    const approvedCourseIds = verifications
      .filter(v => v.studentEmail.toLowerCase() === user.email.toLowerCase() && v.status === "approved")
      .map(v => {
        const c = courses.find(course => course.title === v.courseTitle);
        return c ? c.id : "";
      })
      .filter(id => id !== "");

    // 3. Plus local free enrolments
    const userLocalFree = localPurchasedIds.filter(item => {
      const [email, courseId] = item.split("::");
      return email.toLowerCase() === user.email.toLowerCase();
    }).map(item => item.split("::")[1]);

    return Array.from(new Set([...initialCourseIds, ...approvedCourseIds, ...userLocalFree, ...realPurchasedIds]));
  }, [user, verifications, localPurchasedIds, realPurchasedIds]);

  const enrollFreeCourse = (courseId: string) => {
    if (!user) return;
    setLocalPurchasedIds(prev => {
      const key = `${user.email}::${courseId}`;
      if (prev.includes(key)) return prev;
      return [...prev, key];
    });
  };

  const submitUTR = (courseId: string, utr: string) => {
    if (!user) return;
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const newVerification: PaymentVerification = {
      id: `pv-${Date.now()}`,
      studentEmail: user.email,
      courseTitle: course.title,
      amount: typeof course.price === "number" ? course.price : 0,
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      utrNumber: utr
    };

    setVerifications(prev => [newVerification, ...prev]);
  };

  const approveVerification = (id: string) => {
    setVerifications(prev =>
      prev.map(v => (v.id === id ? { ...v, status: "approved" as const } : v))
    );
  };

  const rejectVerification = (id: string) => {
    setVerifications(prev =>
      prev.map(v => (v.id === id ? { ...v, status: "rejected" as const } : v))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isMounted: mounted,
        login,
        setSession,
        logout,
        markProfileComplete,
        verifications,
        purchasedCourseIds,
        enrollFreeCourse,
        submitUTR,
        approveVerification,
        rejectVerification
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { courses, registeredUsers, pendingVerifications, type PaymentVerification } from "@/lib/mockData";

interface User {
  email: string;
  role: "student" | "admin";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isMounted: boolean;
  login: (email: string, password?: string, botToken?: string) => Promise<void>;
  logout: () => void;
  toggleRole: () => void;
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

  const login = async (email: string, password?: string, botToken?: string) => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
    try {
      const res = await fetch(`${apiURL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, botToken }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Login failed");
      }
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("caliber_jwt", data.token);
      }
      setUser(data.user);
    } catch (err: any) {
      console.warn("API login failed, falling back to mock authentication:", err.message);
      const role = email.toLowerCase().includes("admin") ? ("admin" as const) : ("student" as const);
      setUser({ email, role });
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("caliber_user");
    localStorage.removeItem("caliber_jwt");
  };

  const toggleRole = () => {
    if (!user) return;
    setUser((prev) =>
      prev ? { ...prev, role: prev.role === "student" ? "admin" : "student" } : null
    );
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

    return Array.from(new Set([...initialCourseIds, ...approvedCourseIds, ...userLocalFree]));
  }, [user, verifications, localPurchasedIds]);

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
        logout,
        toggleRole,
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

"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  email: string;
  role: "student" | "admin";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  toggleRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string) => {
    setUser({ email, role: "student" });
  };

  const logout = () => {
    setUser(null);
  };

  const toggleRole = () => {
    if (!user) return;
    setUser((prev) =>
      prev ? { ...prev, role: prev.role === "student" ? "admin" : "student" } : null
    );
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, toggleRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

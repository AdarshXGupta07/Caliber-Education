"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { ProfileCompletionGate } from "@/components/ProfileCompletionGate";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <ProfileCompletionGate />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}

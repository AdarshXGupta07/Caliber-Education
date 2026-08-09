"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { TestGuardProvider } from "@/context/TestGuardContext";
import { ProfileCompletionGate } from "@/components/ProfileCompletionGate";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <TestGuardProvider>
          <ProfileCompletionGate />
          {children}
        </TestGuardProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader } from "lucide-react";
import { getPostLoginRedirect } from "@/lib/authRedirect";
import { apiFetch, ApiFetchError } from "@/lib/apiFetch";

export default function AuthCallbackPage() {
    const router = useRouter();
    // Every failure path used to silently bounce back to /login with only a
    // console.error — the user would just land back at login with no idea
    // why. Surface a real message instead.
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [slowHint, setSlowHint] = useState(false);

    useEffect(() => {
        // Supabase redirects with hash fragment: #access_token=XXX&refresh_token=YYY
        const hash = window.location.hash;
        if (!hash) {
            setErrorMessage("We didn't receive a response from Google. Please try signing in again.");
            return;
        }

        const params = new URLSearchParams(hash.replace("#", "?"));
        const accessToken = params.get("access_token");

        if (!accessToken) {
            setErrorMessage("We didn't receive a response from Google. Please try signing in again.");
            return;
        }

        // Exchange Supabase token for our custom JWT
        const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
        apiFetch(`${apiURL}/api/auth/google/exchange`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: accessToken }),
            onSlow: () => setSlowHint(true),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to exchange token");
                return res.json();
            })
            .then((data) => {
                if (data.token) {
                    localStorage.setItem("caliber_jwt", data.token);
                    if (data.user) {
                        localStorage.setItem("caliber_user", JSON.stringify(data.user));
                    }
                    window.location.href = getPostLoginRedirect(data.user?.role);
                } else {
                    setErrorMessage("We couldn't complete your sign-in. Please try again.");
                }
            })
            .catch((err) => {
                console.error("Auth callback error:", err);
                setErrorMessage(err instanceof ApiFetchError ? err.message : "We couldn't complete your sign-in. Please try again.");
            });
    }, [router]);

    if (errorMessage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-line-gray-light dark:bg-canvas px-4">
                <div className="text-center space-y-4 max-w-sm">
                    <div className="w-14 h-14 rounded-full bg-alert-coral/10 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-7 h-7 text-alert-coral" />
                    </div>
                    <h2 className="text-xl font-bold font-heading text-ink-navy dark:text-paper">Sign-in didn't go through</h2>
                    <p className="text-sm text-slate dark:text-paper/60">{errorMessage}</p>
                    <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm">
                        Try again
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-line-gray-light dark:bg-canvas px-4">
            <div className="text-center space-y-4">
                <Loader className="w-10 h-10 animate-spin text-ink-navy dark:text-paper mx-auto" />
                <h2 className="text-xl font-bold font-heading text-ink-navy dark:text-paper">Completing login...</h2>
                <p className="text-sm text-slate dark:text-paper/60">Please wait while we verify your account securely.</p>
                {slowHint && (
                    <p className="text-xs text-slate dark:text-paper/50 bg-white dark:bg-line-gray-dark/40 rounded-lg py-2 px-3 max-w-xs mx-auto">
                        Still connecting — this can take up to a minute if our server was asleep.
                    </p>
                )}
            </div>
        </div>
    );
}

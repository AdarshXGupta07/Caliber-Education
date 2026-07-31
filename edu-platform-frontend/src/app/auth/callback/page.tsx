"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader } from "lucide-react";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        // Supabase redirects with hash fragment: #access_token=XXX&refresh_token=YYY
        const hash = window.location.hash;
        if (!hash) {
            router.push("/login");
            return;
        }

        const params = new URLSearchParams(hash.replace("#", "?"));
        const accessToken = params.get("access_token");

        if (!accessToken) {
            router.push("/login");
            return;
        }

        // Exchange Supabase token for our custom JWT
        const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
        fetch(`${apiURL}/api/auth/google/exchange`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: accessToken }),
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
                    window.location.href = "/dashboard";
                } else {
                    router.push("/login");
                }
            })
            .catch((err) => {
                console.error("Auth callback error:", err);
                router.push("/login");
            });
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-line-gray-light dark:bg-canvas">
            <div className="text-center space-y-4">
                <Loader className="w-10 h-10 animate-spin text-ink-navy dark:text-paper mx-auto" />
                <h2 className="text-xl font-bold font-heading text-ink-navy dark:text-paper">Completing login...</h2>
                <p className="text-sm text-slate dark:text-paper/60">Please wait while we verify your account securely.</p>
            </div>
        </div>
    );
}

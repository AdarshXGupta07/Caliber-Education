"use client";

import { useEffect, useRef } from "react";

interface TurnstileProps {
    onVerify: (token: string) => void;
    className?: string;
}

export function Turnstile({ onVerify, className }: TurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    useEffect(() => {
        let active = true;

        const renderWidget = () => {
            if (!containerRef.current || !active) return;
            if (!(window as any).turnstile) {
                // script might not be loaded yet, retry in 200ms
                setTimeout(renderWidget, 200);
                return;
            }

            // Fallback key '1x00000000000000000000AA' is Cloudflare's always-pass testing key
            const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

            try {
                // Clean up previous widget instance if any
                if (widgetIdRef.current) {
                    try {
                        (window as any).turnstile.remove(widgetIdRef.current);
                    } catch (e) { }
                }

                widgetIdRef.current = (window as any).turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    size: "normal",
                    callback: (token: string) => {
                        if (active) {
                            onVerify(token);
                        }
                    },
                });
            } catch (err) {
                console.error("Turnstile render error:", err);
            }
        };

        renderWidget();

        return () => {
            active = false;
            if (widgetIdRef.current && (window as any).turnstile) {
                try {
                    (window as any).turnstile.remove(widgetIdRef.current);
                } catch (e) { }
            }
        };
    }, [onVerify]);

    return <div ref={containerRef} className={className} />;
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Netlify deployment with dynamic routes
  output: "standalone",
  images: {
    // Default optimizer quality (75) visibly washes out warm skin tones in
    // photos (chroma-subsampled WebP re-encode) — allow requesting higher.
    qualities: [75, 90, 95, 100],
  },
  // Proxy /api/* to the backend server-side, so the browser only ever talks
  // to this same origin. Avoids cross-origin requests entirely — sidesteps
  // any client-side network filter (browser policy, antivirus web-shield)
  // that treats a page silently calling out to a different port as
  // suspicious, and removes the need for CORS in production entirely.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  // None of these were set anywhere before. CSP is Report-Only rather than
  // enforced — this site loads Razorpay's checkout.js and opens its payment
  // modal, which needs real testing against a strict policy before turning
  // on enforcement, or checkout could silently break in production.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy-Report-Only",
            // frame-src/connect-src for Razorpay's checkout confirmed
            // necessary by an actual live violation report while testing
            // this policy (api.razorpay.com framing) — still Report-Only
            // since there's more to observe (Google OAuth, fonts, etc.)
            // before this is safe to enforce.
            value: "default-src 'self'; frame-ancestors 'none'; frame-src https://api.razorpay.com https://checkout.razorpay.com https://challenges.cloudflare.com; connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://lumberjack.razorpay.com https://challenges.cloudflare.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://challenges.cloudflare.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

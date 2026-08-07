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
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Netlify deployment with dynamic routes
  output: "standalone",
};

export default nextConfig;

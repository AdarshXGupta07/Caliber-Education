import type { MetadataRoute } from "next";

const SITE_URL = "https://caliber-edu.netlify.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private/behind-auth or duplicate-content routes — no SEO value, and
      // some (dashboard, profile, quiz attempts) shouldn't be publicly
      // discoverable at all.
      disallow: [
        "/admin",
        "/dashboard",
        "/profile",
        "/quiz",
        "/complete-profile",
        "/api",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

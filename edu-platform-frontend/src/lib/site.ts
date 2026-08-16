// Single source of truth for the site's canonical URL/name/description —
// previously duplicated as an independent string literal in layout.tsx,
// robots.ts, sitemap.ts, and courses/[id]/page.tsx, which made it easy to
// update three call sites during a domain cutover and miss the fourth.
//
// Swap SITE_URL for your real custom domain once you have one — a free
// .netlify.app subdomain is treated as lower-trust by search engines, and
// this value anchors every relative OG/canonical URL generated on the site.
export const SITE_URL = "https://caliber-edu.netlify.app";
export const SITE_NAME = "CAliber Education";
export const SITE_DESCRIPTION =
  "Premium MCQ practice platform for CA Foundation, Intermediate & Final droppers. Timed mock sets, detailed explanations, mentor-led test series, and WhatsApp group access.";

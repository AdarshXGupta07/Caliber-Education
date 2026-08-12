import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

// Swap for your real custom domain once you have one — a free .netlify.app
// subdomain is treated as lower-trust by search engines, and this value
// anchors every relative OG/canonical URL generated on the site.
const SITE_URL = "https://caliber-edu.netlify.app";
const SITE_NAME = "CAliber Education";
const SITE_DESCRIPTION =
  "Premium MCQ practice platform for CA Foundation, Intermediate & Final droppers. Timed mock sets, detailed explanations, mentor-led test series, and WhatsApp group access.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — CA Exam MCQ Practice & Mentorship`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "CA Foundation MCQ", "CA Intermediate MCQ", "CA Final MCQ practice",
    "Chartered Accountancy exam prep", "CA mock test series", "CA dropper mentorship",
    "ICAI exam practice", "CA exam mentorship India",
  ],
  authors: [{ name: "CAliber Education" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — CA Exam MCQ Practice & Mentorship`,
    description: SITE_DESCRIPTION,
    // Swap for a dedicated 1200x630 og-image.png once you have one designed —
    // this group photo is a reasonable real placeholder in the meantime.
    images: [{ url: "/CALIBER.jpg", width: 1200, height: 630, alt: SITE_NAME }],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — CA Exam MCQ Practice & Mentorship`,
    description: SITE_DESCRIPTION,
    images: ["/CALIBER.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  // Fill this in once you register at search.google.com/search-console —
  // Settings → Ownership verification → HTML tag → paste just the content
  // attribute's value here.
  // verification: { google: "" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-paper dark:bg-ink-navy text-ink-navy dark:text-paper transition-colors duration-300 font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: SITE_NAME,
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              sameAs: [
                "https://chat.whatsapp.com/IbzA4aKxYFwDw7zMUcZLNG",
                "https://t.me/calibermentorship",
                "https://www.instagram.com/calibermentorship/",
              ],
            }),
          }}
        />
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" />
      </body>
    </html>
  );
}


import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import Script from "next/script";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

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
            // See courses/[id]/page.tsx for why "<" is escaped before
            // embedding — these values are hardcoded constants today, not
            // exploitable, but keeping this consistent means it stays safe
            // if any of them ever becomes admin-editable.
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
            }).replace(/</g, "\\u003c"),
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


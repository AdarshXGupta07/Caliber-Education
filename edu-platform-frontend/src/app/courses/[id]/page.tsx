import type { Metadata } from "next";
import CourseDetailClient from "./CourseDetailClient";
import { SITE_URL } from "@/lib/site";

type Course = { id: string; title?: string; description?: string; price?: number; level?: string };

// Runs server-side — call the backend directly rather than through the
// client-only /api rewrite proxy, same as sitemap.ts.
async function getCourse(id: string): Promise<Course | null> {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
    const res = await fetch(`${backendUrl}/api/courses/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) return { title: "Course" };

  const title = course.title || "CA Course";
  const description = course.description
    ? course.description.slice(0, 155)
    : `${title} on CAliber Education — CA exam-pattern practice, mentor support, and structured preparation for droppers.`;

  return {
    title,
    description,
    alternates: { canonical: `/courses/${id}` },
    openGraph: { title, description, url: `/courses/${id}` },
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourse(id);

  return (
    <>
      {course && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // JSON.stringify does not escape "<", so a course title/description
            // containing "</script><script>...</script>" would otherwise break
            // out of this tag and execute on every visitor's browser — this
            // page is public and unauthenticated. < is valid inside a
            // JSON string and renders identically once parsed as JSON-LD.
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Course",
              name: course.title,
              description: course.description || course.title,
              provider: {
                "@type": "EducationalOrganization",
                name: "CAliber Education",
                sameAs: SITE_URL,
              },
              ...(course.price
                ? {
                    offers: {
                      "@type": "Offer",
                      price: course.price,
                      priceCurrency: "INR",
                    },
                  }
                : {}),
            }).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <CourseDetailClient id={id} />
    </>
  );
}

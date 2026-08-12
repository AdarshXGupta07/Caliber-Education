import type { Metadata } from "next";
import CourseDetailClient from "./CourseDetailClient";

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
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Course",
              name: course.title,
              description: course.description || course.title,
              provider: {
                "@type": "EducationalOrganization",
                name: "CAliber Education",
                sameAs: "https://caliber-edu.netlify.app",
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
            }),
          }}
        />
      )}
      <CourseDetailClient id={id} />
    </>
  );
}

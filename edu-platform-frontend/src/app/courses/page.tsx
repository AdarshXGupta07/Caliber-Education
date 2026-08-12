import type { Metadata } from "next";
import CoursesClient from "./CoursesClient";

export const metadata: Metadata = {
  title: "CA Foundation, Intermediate & Final Courses",
  description:
    "Browse CA Foundation, Intermediate & Final courses on CAliber Education — structured for droppers and repeaters, with mentor support and exam-pattern practice built in.",
  alternates: { canonical: "/courses" },
};

export default function CoursesPage() {
  return <CoursesClient />;
}

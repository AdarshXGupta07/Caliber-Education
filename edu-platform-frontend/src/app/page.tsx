import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "CA Exam MCQ Practice & Mentorship",
  description:
    "Join CAliber Education for timed CA Foundation, Intermediate & Final MCQ practice, mentor-led test series, and direct WhatsApp access to CAs who cleared their exams.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <HomeClient />;
}

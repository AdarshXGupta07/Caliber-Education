import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us — Meet Your CA Mentors",
  description:
    "CAliber Education was founded by CAs who cleared their own exams and now mentor CA Foundation, Intermediate & Final droppers with exam-pattern MCQ practice and 1:1 guidance.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutClient />;
}

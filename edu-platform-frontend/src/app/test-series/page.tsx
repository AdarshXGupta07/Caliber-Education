import type { Metadata } from "next";
import TestSeriesClient from "./TestSeriesClient";

export const metadata: Metadata = {
  title: "CA Test Series — Mentor-Evaluated Mock Papers",
  description:
    "Paper-based CA mock test series evaluated by real mentors, with detailed feedback — built for CA Foundation, Intermediate & Final students preparing for their next attempt.",
  alternates: { canonical: "/test-series" },
};

export default function TestSeriesPage() {
  return <TestSeriesClient />;
}

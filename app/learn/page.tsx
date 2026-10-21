import type { Metadata } from "next";
import { StudyMap } from "@/components/learn/study-map";

export const metadata: Metadata = {
  title: "Study map",
  description: "A mind map of what I have studied and what is still to study.",
};

export default function LearnPage() {
  return <StudyMap />;
}

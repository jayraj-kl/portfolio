import type { Metadata } from "next";
import { connection } from "next/server";
import { StudyMap } from "@/components/learn/study-map";
import { getLibrary } from "@/lib/learn/db";

export const metadata: Metadata = {
  title: "Study map",
  description: "A mind map of what I have studied and what is still to study.",
};

export default async function LearnPage() {
  // Read the maps on every visit, never once at build time.
  await connection();
  const library = await getLibrary();
  return <StudyMap initialLibrary={library} />;
}

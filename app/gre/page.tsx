import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GreTracker } from "@/components/gre/tracker";
import { isOwner } from "@/lib/auth";
import { getProgress } from "@/lib/gre/db";
import type { VerbalData } from "@/lib/gre/types";
import verbalData from "@/data/gre/text-completion.json";

// Metadata streams even when the page 404s, so it names nothing until you are signed in.
export async function generateMetadata(): Promise<Metadata> {
  if (!(await isOwner())) return {};
  return { title: "GRE tracker", robots: { index: false, follow: false } };
}

export default async function GrePage() {
  // Signed out, the route looks like any other missing page.
  if (!(await isOwner())) notFound();

  const progress = await getProgress();
  return (
    <GreTracker
      initialProgress={progress}
      verbalData={verbalData as VerbalData}
    />
  );
}

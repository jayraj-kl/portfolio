import type { Metadata } from "next";
import { connection } from "next/server";
import { GreTracker } from "@/components/gre/tracker";
import { getProgress } from "@/lib/gre/db";
import type { VerbalData } from "@/lib/gre/types";
import verbalData from "@/data/gre/text-completion.json";

export const metadata: Metadata = {
  title: "GRE tracker",
  robots: { index: false, follow: false },
};

// Open to anyone who has the address; it is kept out of sight by never being linked.
export default async function GrePage() {
  // Read the progress on every visit, never once at build time.
  await connection();
  const progress = await getProgress();
  return (
    <GreTracker
      initialProgress={progress}
      verbalData={verbalData as VerbalData}
    />
  );
}

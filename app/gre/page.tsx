import type { Metadata } from "next";
import { SignInForm } from "@/components/gre/sign-in-form";
import { GreTracker } from "@/components/gre/tracker";
import { isOwner } from "@/lib/auth";
import { getProgress } from "@/lib/gre/db";
import type { VerbalData } from "@/lib/gre/types";
import verbalData from "@/data/gre/text-completion.json";

// Signed out, the title names nothing, so the page doesn't say what it guards.
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: (await isOwner()) ? "GRE tracker" : "Sign in",
    robots: { index: false, follow: false },
  };
}

export default async function GrePage() {
  // Signed out, the route is just the passphrase form; signing in reloads it as the tracker.
  if (!(await isOwner())) {
    return (
      <div className="gre grid min-h-svh place-items-center bg-background px-4 text-foreground">
        <SignInForm />
      </div>
    );
  }

  const progress = await getProgress();
  return (
    <GreTracker
      initialProgress={progress}
      verbalData={verbalData as VerbalData}
    />
  );
}

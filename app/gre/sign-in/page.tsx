import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/gre/sign-in-form";
import { isOwner } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function SignInPage() {
  if (await isOwner()) redirect("/gre");

  return (
    <div className="gre grid min-h-svh place-items-center bg-background px-4 text-foreground">
      <SignInForm />
    </div>
  );
}

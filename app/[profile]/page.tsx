import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage, homeMetadata } from "@/components/home/home-page";
import { PROFILES, isProfile } from "@/lib/content";

// Both content sets are built ahead of time; any other first segment is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return PROFILES.map((profile) => ({ profile }));
}

type Props = { params: Promise<{ profile: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { profile } = await params;
  return isProfile(profile) ? homeMetadata(profile) : {};
}

export default async function ProfilePage({ params }: Props) {
  const { profile } = await params;
  if (!isProfile(profile)) notFound();
  return <HomePage profile={profile} />;
}

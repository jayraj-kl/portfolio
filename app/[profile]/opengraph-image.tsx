import { PROFILES } from "@/lib/content";

// Page metadata here sets its own openGraph, which drops the inherited image, so the root one is reused.
export { default, alt, size, contentType } from "../opengraph-image";

export function generateStaticParams() {
  return PROFILES.map((profile) => ({ profile }));
}

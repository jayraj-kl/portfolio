"use client";

import { useEffect } from "react";
import { sectionHydrated } from "@/lib/load-order";

// Reports that the Suspense boundary it sits in has been hydrated (see lib/load-order.ts). The
// element is in the server's HTML too, which is how the page counts how many to wait for.
export function HydrationMark() {
  useEffect(() => sectionHydrated(), []);
  return <span hidden data-hydration-mark="" />;
}

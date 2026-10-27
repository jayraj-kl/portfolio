"use client";

import { useSyncExternalStore } from "react";
import { todayKey } from "@/lib/gre/dates";

function subscribe(cb: () => void) {
  const id = setInterval(cb, 60_000);
  return () => clearInterval(id);
}

// Today in the browser's timezone, which is how days are logged. Null while
// rendering on the server, whose clock may sit in another day.
export function useToday(): string | null {
  return useSyncExternalStore(subscribe, todayKey, () => null);
}

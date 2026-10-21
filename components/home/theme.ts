"use client";

import { useSyncExternalStore } from "react";
import { INK_DARK, INK_LIGHT, type Ink } from "./halftone";

// next-themes puts `dark` on <html>; every canvas follows it without a reload.
function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}

const isDark = () => document.documentElement.classList.contains("dark");

export function useDark() {
  return useSyncExternalStore(subscribe, isDark, () => false);
}

export function useInk(): Ink {
  return useDark() ? INK_DARK : INK_LIGHT;
}

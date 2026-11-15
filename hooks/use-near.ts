"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Calls `then` once, when the element first comes within `margin` of the screen (a share of the
 * viewport's height, above and below it). For work that only matters where it can be seen (a
 * canvas to draw, a shader to compile, a script to fetch), so it waits for the reader to get
 * near instead of all running while the page loads. Returns the function that calls it off.
 */
export function whenNear(el: Element, then: () => void, margin = "100%") {
  if (typeof IntersectionObserver === "undefined") {
    then();
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      then();
    },
    { rootMargin: `${margin} 0px` },
  );
  io.observe(el);
  return () => io.disconnect();
}

/** The same as state: false until the element has come near the screen, true from then on. */
export function useNear(ref: RefObject<Element | null>, margin = "100%") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return whenNear(el, () => setNear(true), margin);
  }, [ref, margin]);
  return near;
}

/**
 * Runs `then` in a quiet moment, or after `timeout` ms at the latest, and returns the function
 * that calls it off. Safari has no requestIdleCallback, so there it is simply the next task.
 */
export function whenIdle(then: () => void, timeout = 1200) {
  if (typeof requestIdleCallback === "function") {
    const id = requestIdleCallback(then, { timeout });
    return () => cancelIdleCallback(id);
  }
  const id = window.setTimeout(then, 1);
  return () => window.clearTimeout(id);
}

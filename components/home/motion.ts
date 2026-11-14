import { useSyncExternalStore } from "react";

// The home page's shared springs, in Apple's terms: critically damped (no overshoot) unless a
// gesture carried momentum into the motion. `duration` here is the spring's response, not a
// fixed length; a new target mid-flight carries on from the live value and its velocity.

/** Glyph and label swaps. */
export const SPRING_QUICK = { type: "spring", bounce: 0, duration: 0.25 } as const;

/** The default for things that open, close or reflow. */
export const SPRING_UI = { type: "spring", bounce: 0, duration: 0.35 } as const;

/** A settle that follows a throw: the one place a little overshoot belongs. */
export const SPRING_FLICK = { type: "spring", bounce: 0.2, duration: 0.4 } as const;

/**
 * Where something released at `velocity` (units per second) would coast to a stop, as a distance
 * from where it is: Apple's scroll projection, with 0.998 per millisecond as the everyday rate.
 */
export function project(velocity: number, deceleration = 0.998) {
  return ((velocity / 1000) * deceleration) / (1 - deceleration);
}

/** Past an edge: the further it is pulled, the less it follows, so it resists instead of stopping dead. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

const REDUCE = "(prefers-reduced-motion: reduce)";

/**
 * The reduced-motion preference for anything that renders differently under it. It hydrates as
 * "motion allowed" (the server's answer) and then follows the media query, so the first client
 * render always matches the server's HTML.
 */
export function useReducedMotionSafe() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCE);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCE).matches,
    () => false,
  );
}

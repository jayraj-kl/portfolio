"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SIZE = 22;
// Up and to the left, like a system pointer.
const REST_ANGLE = -45;
// Seconds the arrow holds its heading after the pointer stops.
const SETTLE = 0.45;
const INTERACTIVE = "a, button, input, textarea, select, [role='button']";

const HIDE_NATIVE_CURSOR = `
@media (hover: hover) and (pointer: fine) {
  html[data-gyro-cursor], html[data-gyro-cursor] * { cursor: none !important; }
}`;

// An arrow pointer that turns to face the way it is moving.
export function GyroscopeCursor({
  scopedPaths = {},
}: {
  // Routes that bring their own pointer, mapped to the selector of the areas
  // where this arrow should still take over.
  scopedPaths?: Record<string, string>;
}) {
  const pathname = usePathname();
  const zone =
    Object.entries(scopedPaths).find(([path]) =>
      pathname.startsWith(path),
    )?.[1] ?? null;
  const [fine, setFine] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const heading = useMotionValue(REST_ANGLE);
  // Low damping lets the arrow swing slightly past its heading before settling.
  const rotate = useSpring(heading, { stiffness: 220, damping: 16, mass: 0.7 });

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const enabled = fine;

  useEffect(() => {
    if (!enabled) return;
    // A scoped route hides the system pointer itself, so only take it over elsewhere.
    if (!zone) document.documentElement.dataset.gyroCursor = "on";

    let last: { x: number; y: number } | null = null;
    let settle: ReturnType<typeof setTimeout> | undefined;

    // Moves to the nearest equivalent angle, so the arrow never spins the long way round.
    const turnTo = (angle: number) => {
      const current = heading.get();
      heading.set(current + ((((angle - current) % 360) + 540) % 360) - 180);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      x.set(event.clientX);
      y.set(event.clientY);
      const hit = event.target instanceof Element ? event.target : null;
      setVisible(!zone || (hit !== null && hit.closest(zone) !== null));
      setHovering(hit !== null && hit.closest(INTERACTIVE) !== null);

      if (last) {
        const dx = event.clientX - last.x;
        const dy = event.clientY - last.y;
        // Ignore jitter so the arrow does not twitch on tiny movements.
        if (Math.hypot(dx, dy) > 3) {
          turnTo((Math.atan2(dy, dx) * 180) / Math.PI + 90);
          last = { x: event.clientX, y: event.clientY };
        }
      } else {
        last = { x: event.clientX, y: event.clientY };
      }

      clearTimeout(settle);
      settle = setTimeout(() => turnTo(REST_ANGLE), SETTLE * 1000);
    };
    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      clearTimeout(settle);
      delete document.documentElement.dataset.gyroCursor;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, zone, x, y, heading]);

  if (!enabled) return null;

  return (
    <>
      <style>{HIDE_NATIVE_CURSOR}</style>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999]"
        style={{ x, y, opacity: visible ? 1 : 0 }}
      >
        {/* The tip sits on the pointer position and is the centre of rotation. */}
        <motion.svg
          width={SIZE}
          height={SIZE}
          viewBox="-11 -1 22 22"
          className="absolute -top-px left-0 -translate-x-1/2 overflow-visible drop-shadow-[0_2px_3px_rgb(0_0_0/0.35)]"
          style={{
            rotate,
            scale: pressed ? 0.82 : hovering ? 1.18 : 1,
            transformOrigin: "50% 1px",
            transition: "scale 140ms cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        >
          <path
            d="M0 0 L7.5 19 L0 14.5 L-7.5 19 Z"
            strokeWidth="1.5"
            strokeLinejoin="round"
            className="fill-foreground stroke-background"
          />
        </motion.svg>
      </motion.div>
    </>
  );
}

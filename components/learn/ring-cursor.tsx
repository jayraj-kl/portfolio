"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

const RING_SIZE = 34;
const DOT_SIZE = 5;
const TARGET_PADDING = 6;
// Anything the ring should wrap itself around.
const TARGETS =
  "[data-cursor-target], button, a, input, textarea, [role='radio']";

const ARROW_ZONE = "[data-arrow-cursor]";

const RING_SPRING = { stiffness: 260, damping: 26, mass: 0.6 };
const DOT_SPRING = { stiffness: 900, damping: 45, mass: 0.3 };

// A ring and dot that replace the pointer inside `scope`. The ring snaps around hovered targets.
export function RingCursor({ scope }: { scope: string }) {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [locked, setLocked] = useState(false);
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const width = useMotionValue(RING_SIZE);
  const height = useMotionValue(RING_SIZE);
  const radius = useMotionValue(RING_SIZE);
  const dotX = useMotionValue(0);
  const dotY = useMotionValue(0);

  const ringX = useSpring(x, RING_SPRING);
  const ringY = useSpring(y, RING_SPRING);
  const ringWidth = useSpring(width, RING_SPRING);
  const ringHeight = useSpring(height, RING_SPRING);
  const ringRadius = useSpring(radius, RING_SPRING);
  const springDotX = useSpring(dotX, DOT_SPRING);
  const springDotY = useSpring(dotY, DOT_SPRING);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(fine.matches);
    update();
    fine.addEventListener("change", update);
    return () => fine.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const root = document.querySelector<HTMLElement>(scope);
    if (!root) return;
    root.dataset.ringCursor = "on";

    let pointer = { x: 0, y: 0 };
    let target: Element | null = null;
    let frame = 0;

    // Runs every frame while locked, so the ring stays on a target that moves under it.
    const follow = () => {
      frame = 0;
      if (target && !target.isConnected) target = null;
      if (target) {
        const rect = target.getBoundingClientRect();
        x.set(rect.left + rect.width / 2);
        y.set(rect.top + rect.height / 2);
        width.set(rect.width + TARGET_PADDING * 2);
        height.set(rect.height + TARGET_PADDING * 2);
        radius.set(0);
        frame = requestAnimationFrame(follow);
      } else {
        x.set(pointer.x);
        y.set(pointer.y);
        width.set(RING_SIZE);
        height.set(RING_SIZE);
        radius.set(RING_SIZE);
      }
      setLocked(target !== null);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer = { x: event.clientX, y: event.clientY };
      dotX.set(pointer.x);
      dotY.set(pointer.y);
      const hit = event.target instanceof Element ? event.target : null;
      // Over these areas the site's arrow cursor takes over, so the ring steps aside.
      const yielded = hit?.closest(ARROW_ZONE) != null;
      target =
        hit && !yielded && root.contains(hit) ? hit.closest(TARGETS) : null;
      setVisible(!yielded);
      if (!frame) follow();
    };
    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      delete root.dataset.ringCursor;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, scope, x, y, width, height, radius, dotX, dotY]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] mix-blend-difference transition-opacity duration-200"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <motion.div
        className="absolute top-0 left-0 border-[1.5px] border-white"
        style={{
          x: ringX,
          y: ringY,
          width: ringWidth,
          height: ringHeight,
          borderRadius: ringRadius,
          translateX: "-50%",
          translateY: "-50%",
          scale: pressed ? 0.92 : 1,
          opacity: locked ? 0.9 : 0.6,
          transition: "scale 140ms cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      />
      <motion.div
        className="absolute top-0 left-0 bg-white"
        style={{
          x: springDotX,
          y: springDotY,
          width: DOT_SIZE,
          height: DOT_SIZE,
          translateX: "-50%",
          translateY: "-50%",
          scale: locked ? 0.6 : 1,
        }}
      />
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Burst = { x: number; y: number; start: number };

const CELL = 34;
const IDLE_SCALE = 0.09;
const PEAK_SCALE = 0.5;
const ATTACK = 0.25;
const RELEASE = 0.6;
const BURST_SPEED = 1200;
const BURST_THICKNESS = 180;

// A grid of small squares that swell and ripple around the pointer, and ring outward on click.
export function CursorWave({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let scales = new Float32Array(0);
    let pointer: { x: number; y: number } | null = null;
    let bursts: Burst[] = [];
    let frame = 0;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(width / CELL) + 1;
      rows = Math.ceil(height / CELL) + 1;
      scales = new Float32Array(columns * rows).fill(IDLE_SCALE);
      schedule();
    };

    const draw = (now: number) => {
      frame = 0;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const time = now / 1000;
      const radius = Math.min(width, height) * 0.3;
      bursts = bursts.filter(
        (burst) =>
          ((now - burst.start) / 1000) * BURST_SPEED <
          Math.hypot(width, height) + BURST_THICKNESS,
      );

      // Read the colours each frame so a theme change takes effect straight away.
      const styles = getComputedStyle(canvas);
      const base = styles.color;
      const accent = styles.getPropertyValue("--status-done").trim() || base;

      ctx.clearRect(0, 0, width, height);
      let moving = false;

      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const x = column * CELL;
          const y = row * CELL;
          let influence = 0;

          if (pointer && !still) {
            const distance = Math.hypot(x - pointer.x, y - pointer.y);
            if (distance < radius) {
              const falloff = 1 - distance / radius;
              // A wave travels outward from the pointer through the swell.
              influence =
                falloff *
                falloff *
                (0.65 + 0.35 * Math.sin(distance * 0.045 - time * 5));
            }
          }

          for (const burst of bursts) {
            const reach = ((now - burst.start) / 1000) * BURST_SPEED;
            const distance = Math.hypot(x - burst.x, y - burst.y);
            const offset = Math.abs(distance - reach) / (BURST_THICKNESS / 2);
            if (offset < 1) {
              const fade = Math.max(0, 1 - reach / Math.hypot(width, height));
              influence = Math.max(influence, (1 - offset) * fade);
            }
          }

          const index = row * columns + column;
          const target = IDLE_SCALE + (PEAK_SCALE - IDLE_SCALE) * influence;
          const rate = target > scales[index] ? ATTACK : RELEASE;
          scales[index] +=
            (target - scales[index]) * Math.min(1, dt / (rate / 3));
          if (Math.abs(target - scales[index]) > 0.002) moving = true;

          const size = CELL * scales[index];
          const lift = (scales[index] - IDLE_SCALE) / (PEAK_SCALE - IDLE_SCALE);
          ctx.globalAlpha = 0.13 + lift * 0.3;
          ctx.fillStyle = lift > 0.25 ? accent : base;
          ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }
      }

      if (moving || bursts.length > 0 || (pointer && !still)) schedule();
    };

    // Only runs while something is moving, so an idle page costs nothing.
    const schedule = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(draw);
    };

    const local = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const inside = ({ x, y }: { x: number; y: number }) =>
      x >= 0 && y >= 0 && x <= width && y <= height;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const point = local(event);
      pointer = inside(point) ? point : null;
      schedule();
    };
    const onLeave = () => {
      pointer = null;
      schedule();
    };
    const onDown = (event: PointerEvent) => {
      const point = local(event);
      // Only clicks on the canvas itself ripple, not ones on panels or controls laid over it.
      const onCanvas =
        event.target instanceof Node &&
        canvas.parentElement?.contains(event.target);
      if (still || !onCanvas || !inside(point)) return;
      bursts.push({ ...point, start: performance.now() });
      schedule();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 size-full text-foreground",
        className,
      )}
    />
  );
}

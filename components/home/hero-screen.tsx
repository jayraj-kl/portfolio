"use client";

import { useEffect, useRef } from "react";
import {
  createGLScreen,
  drawLineScreen,
  heroFrame,
  INK_DARK,
  imageField,
  loadImage,
  portraitField,
  type Field,
  type Ink,
} from "./halftone";
import { useInk } from "./theme";
import styles from "./home.module.css";

// The screen at rest: 45 degrees, a 6px pitch.
const REST = { angle: 45, period: 6 };
const ANGLE_RANGE = [15, 75] as const;
const PERIOD_RANGE = [4, 10] as const;

export function HeroScreen({
  src,
  label,
  fit = "portrait",
  className,
}: {
  src: string | null;
  label: string;
  /** "portrait" frames a head-and-shoulders photo in the hero; "cover" fills the plate with any image. */
  fit?: "portrait" | "cover";
  /** Replaces the hero plate's sizing. */
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const ink = useInk();
  const inkRef = useRef<Ink>(ink);
  const redrawRef = useRef<() => void>(() => {});

  // Theme change: same field, new ink, one redraw.
  useEffect(() => {
    inkRef.current = ink;
    redrawRef.current();
  }, [ink]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.closest<HTMLElement>("[data-screen-host]") ?? canvas;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const gl = createGLScreen(canvas);
    const cpu = gl ? null : canvas.getContext("2d");
    const still = () => reduce.matches || !gl;

    let img: HTMLImageElement | null = null;
    let field: Field | null = null;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let touchTimer = 0;
    let disposed = false;

    const cur = still() ? { ...REST } : { angle: 74, period: 15 };
    const target = { ...REST };

    const render = () => {
      if (!field) return;
      const a = (cur.angle * Math.PI) / 180;
      const dark = inkRef.current === INK_DARK;
      if (gl) gl.draw(a, cur.period * dpr, inkRef.current, dark);
      else if (cpu)
        drawLineScreen(
          cpu,
          field,
          canvas.width,
          canvas.height,
          a,
          cur.period * dpr,
          inkRef.current,
          dark,
        );
      if (readoutRef.current) {
        readoutRef.current.textContent = `${cur.angle.toFixed(1)}° / ${cur.period.toFixed(1)} px`;
      }
    };

    const tick = (t: number) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 1 / 60;
      last = t;
      // Exponential ease-out toward the target.
      const k = 1 - Math.exp(-dt / 0.17);
      cur.angle += (target.angle - cur.angle) * k;
      cur.period += (target.period - cur.period) * k;
      const settled =
        Math.abs(target.angle - cur.angle) < 0.03 &&
        Math.abs(target.period - cur.period) < 0.006;
      if (settled) {
        cur.angle = target.angle;
        cur.period = target.period;
      }
      render();
      if (settled) {
        raf = 0;
        last = 0;
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    const kick = () => {
      if (still()) {
        cur.angle = target.angle;
        cur.period = target.period;
        render();
        return;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const rebuild = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const fw = Math.round(Math.min(720, rect.width));
      const fh = Math.max(1, Math.round((fw * rect.height) / rect.width));
      const frame = heroFrame(fw, fh);
      if (fit === "cover") {
        // No generated stand-in for an arbitrary image: nothing is drawn until it loads.
        if (!img) return;
        field = imageField(img, fw, fh, { kind: "cover" });
      } else {
        field = img
          ? imageField(img, fw, fh, { kind: "portrait", frame })
          : portraitField(fw, fh, frame);
      }
      gl?.setField(field);
      render();
    };

    redrawRef.current = render;

    let resizeRaf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(rebuild);
    });
    ro.observe(canvas);
    rebuild();
    kick();

    if (src) {
      loadImage(src)
        .then((loaded) => {
          if (disposed) return;
          img = loaded;
          rebuild();
        })
        .catch(() => {
          // Keep the generated field.
        });
    }

    const aim = (clientX: number, clientY: number) => {
      const r = host.getBoundingClientRect();
      const fx = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      const fy = Math.min(1, Math.max(0, (clientY - r.top) / r.height));
      target.angle = ANGLE_RANGE[0] + (ANGLE_RANGE[1] - ANGLE_RANGE[0]) * fx;
      target.period =
        PERIOD_RANGE[0] + (PERIOD_RANGE[1] - PERIOD_RANGE[0]) * fy;
      kick();
    };
    const rest = () => {
      target.angle = REST.angle;
      target.period = REST.period;
      kick();
    };

    const onMove = (e: PointerEvent) => {
      if (reduce.matches || e.pointerType === "touch") return;
      aim(e.clientX, e.clientY);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      rest();
    };
    // Touch: a tap nudges the screen toward the tapped point, then it drifts back.
    const onDown = (e: PointerEvent) => {
      if (reduce.matches || e.pointerType !== "touch") return;
      aim(e.clientX, e.clientY);
      window.clearTimeout(touchTimer);
      touchTimer = window.setTimeout(rest, 2600);
    };
    const onReduce = () => {
      target.angle = REST.angle;
      target.period = REST.period;
      cur.angle = REST.angle;
      cur.period = REST.period;
      render();
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);
    reduce.addEventListener("change", onReduce);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      window.clearTimeout(touchTimer);
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
      reduce.removeEventListener("change", onReduce);
      redrawRef.current = () => {};
      gl?.dispose();
    };
  }, [src, fit]);

  return (
    <div className={className ?? styles.plate}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label={label}
      />
    </div>
  );
}

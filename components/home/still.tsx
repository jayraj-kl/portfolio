"use client";

import { useEffect, useRef } from "react";
import { INK_DARK, drawLineScreen, figureField, imageField, loadImage, projectField, type Field, type Ink } from "./halftone";
import { useInk } from "./theme";
import styles from "./home.module.css";

export type StillSource = { kind: "project"; slug: string } | { kind: "figure"; id: string };

// A still: the line screen at rest (45 degrees), finer than the hero's. Redraws on resize and theme.
export function Still({
  source,
  src,
  label,
  className,
  period = 3.2,
}: {
  source: StillSource;
  src: string | null;
  label: string;
  className?: string;
  period?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ink = useInk();
  const inkRef = useRef<Ink>(ink);
  const redrawRef = useRef<() => void>(() => {});
  const key = source.kind === "project" ? `p:${source.slug}` : `f:${source.id}`;

  useEffect(() => {
    inkRef.current = ink;
    redrawRef.current();
  }, [ink]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let img: HTMLImageElement | null = null;
    let disposed = false;
    let field: Field | null = null;
    let fieldKey = "";

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const fw = Math.round(Math.min(480, rect.width));
      const fh = Math.max(1, Math.round((fw * rect.height) / rect.width));
      const want = `${fw}x${fh}:${img ? "img" : "gen"}`;
      if (!field || fieldKey !== want) {
        const [kind, id] = [key.slice(0, 1), key.slice(2)];
        field = img
          ? imageField(img, fw, fh, { kind: "cover" })
          : kind === "p"
            ? projectField(id, fw, fh)
            : figureField(id, fw, fh);
        fieldKey = want;
      }
      drawLineScreen(ctx, field, canvas.width, canvas.height, Math.PI / 4, period * dpr, inkRef.current, inkRef.current === INK_DARK);
    };
    redrawRef.current = draw;

    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    });
    ro.observe(canvas);

    if (src) {
      loadImage(src)
        .then((loaded) => {
          if (disposed) return;
          img = loaded;
          draw();
        })
        .catch(() => {});
    }

    return () => {
      disposed = true;
      redrawRef.current = () => {};
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [key, src, period]);

  return (
    <div className={`${styles.still} ${className ?? ""}`}>
      <canvas ref={ref} className={styles.canvas} role="img" aria-label={label} />
    </div>
  );
}

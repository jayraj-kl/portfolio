"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./home.module.css";

// The footer scene's CRT surface (scanlines, vignette, flickering grain). The grain is an endless
// animation; it only runs while the scene is on screen, so it costs the page nothing while the
// reader is anywhere else, the first screen included.
export function FootCrt() {
  const ref = useRef<HTMLSpanElement>(null);
  const [live, setLive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <span ref={ref} className={styles.footCrt} data-live={live || undefined} aria-hidden="true" />;
}

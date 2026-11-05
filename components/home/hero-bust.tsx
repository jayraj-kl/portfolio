"use client";

// The hero portrait: a 3D bust drawn as a dot-matrix halftone. three.js loads only on the client, after
// the page, so it stays out of the first bundle; until then the plate holds its space empty.

import dynamic from "next/dynamic";
import styles from "./home.module.css";

const DotBust = dynamic(() => import("./dot-bust").then((m) => m.DotBust), { ssr: false });

export function HeroBust({ src, label }: { src: string; label: string }) {
  return (
    <div className={`${styles.plate} ${styles.bust}`}>
      <DotBust src={src} label={label} look="clay" cell={3} className={styles.canvas} />
    </div>
  );
}

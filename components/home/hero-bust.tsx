"use client";

// The hero portrait: a 3D bust drawn as a dot-matrix halftone. three.js loads only on the client, after
// the page, so it stays out of the first bundle; until then the plate holds its space empty.

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { warmLiquidMetal } from "@/components/ui/liquid-metal-border";
import styles from "./home.module.css";

const DotBust = dynamic(() => import("./dot-bust").then((m) => m.DotBust), { ssr: false });

// The same chunk, asked for as soon as this file runs in the browser: three.js then downloads
// while the page is still hydrating, instead of starting once React has worked down to the hero.
if (typeof window !== "undefined") void import("./dot-bust");

export function HeroBust({ src, label }: { src: string; label: string }) {
  // One job on the graphics card at a time. While it compiles the liquid-metal rims' shader
  // (about 300ms on a first visit), anything another canvas asks of it has to wait, and the bust
  // setting up its renderer in that window held the whole page for as long. The compile starts
  // with the page and is usually over before three.js has even arrived, so this costs nothing.
  const [clear, setClear] = useState(false);
  useEffect(() => {
    let on = true;
    warmLiquidMetal().then(() => {
      if (on) setClear(true);
    });
    return () => {
      on = false;
    };
  }, []);

  return (
    <div className={`${styles.plate} ${styles.bust}`}>
      {clear ? <DotBust src={src} label={label} look="clay" cell={4} className={styles.canvas} /> : null}
    </div>
  );
}

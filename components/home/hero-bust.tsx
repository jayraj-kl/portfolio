"use client";

// The hero portrait: a 3D bust drawn as a dot-matrix halftone. three.js loads only on the client, after
// the page, so it stays out of the first bundle; until then the plate holds its space empty.

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { whenIdle } from "@/hooks/use-near";
import { afterHydration, afterJobs, introSettled } from "@/lib/load-order";
import styles from "./home.module.css";

const DotBust = dynamic(() => import("./dot-bust").then((m) => m.DotBust), { ssr: false });

// The same chunk, asked for as soon as this file runs in the browser: three.js then downloads
// while the page is still hydrating, instead of starting once React has worked down to the hero.
if (typeof window !== "undefined") void import("./dot-bust");

export function HeroBust({ src, label }: { src: string; label: string }) {
  // The bust's intro (the dots shrinking into the portrait) is drawn frame by frame on the main
  // thread, so it only plays smoothly on a quiet one. Setting the bust up also costs a few
  // hundred milliseconds of its own (a WebGL context, the model, two shader programs). So it
  // waits for React to finish taking the page over (every section reports in; on a slow phone that
  // takes a few seconds) and then for an idle moment, sets up before any dot is drawn, and plays
  // the intro on a page with nothing else to do. The model and three.js are already downloading
  // meanwhile (lib/load-order.ts has the whole order).
  const [start, setStart] = useState(false);
  useEffect(() => {
    let cancel = () => {};
    let gone = false;
    void afterHydration().then(() => {
      if (!gone) cancel = whenIdle(() => setStart(true), 500);
    });
    return () => {
      gone = true;
      cancel();
    };
  }, []);

  return (
    <div className={`${styles.plate} ${styles.bust}`}>
      {start ? (
        <DotBust
          src={src}
          label={label}
          look="clay"
          cell={4}
          className={styles.canvas}
          // The liquid-metal rims start while the bust sets up; its dots wait for them, so the
          // intro never stutters over a rim starting.
          beforeIntro={afterJobs}
          onSettled={introSettled}
        />
      ) : null}
    </div>
  );
}

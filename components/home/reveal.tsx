"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import styles from "./home.module.css";

// A section drifts up while it sharpens from a soft blur and fades in, as on yo-hackyfolio:
// a focus-pull rather than a slide. Fires once, when about 15% of it is in view.
// Reduced motion shows it at rest (see .reveal in the stylesheet).
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      className={styles.reveal}
      initial={{ opacity: 0, y: 32, scale: 0.985, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.9,
        delay,
        ease: [0.22, 1, 0.36, 1],
        // Sharpens a touch slower than it travels, so it reads as a focus-pull.
        filter: { duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      {children}
    </motion.div>
  );
}

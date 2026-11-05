import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { AsciiArt } from "@/components/ui/sss";
import type { Link } from "@/lib/content";
// import { Dissolve } from "./dissolve";
import { Clock } from "./interactive";
import styles from "./home.module.css";

// After micro and helixa, in the "sss" recipe's CRT style: a full-bleed scene surfacing out of
// the page in scanlines, with the sign-off on a notched slab across its bottom edge.
export function SiteFooter({
  name,
  fullName,
  location,
  timeZone,
  socials,
  scene,
  dock,
}: {
  name: string;
  fullName: string;
  location: string;
  timeZone: string;
  socials: Link[];
  /** A still for the scene; without one it plays the "sss" ASCII recipe. */
  scene: { src: string; alt: string } | null;
  /** The floating dock, parked just above the scene. */
  dock?: ReactNode;
}) {
  const year = new Date().getFullYear();

  // The dock sits before the scene, as a child of the page root: a sticky element only travels
  // within its parent, and the root spans the whole page.
  return (
    <>
      {/* A short band of bare paper between the last section and the scene, so the picture
          doesn't arrive on the heels of the contact block. Reaching it retires the dock. */}
      <div className={styles.footLead} data-dock-retire aria-hidden="true" />

      {/* The floating dock parks above this edge rather than covering the scene. */}
      {dock}

      <div className={styles.footScene}>
        {/* The scene surfaces out of the paper in scanlines, then fills in. */}
        <div className={styles.footMedia}>
          {scene ? (
            <>
              <Image
                src={scene.src}
                alt={scene.alt}
                fill
                sizes="100vw"
                className={styles.footImage}
              />
              {/* The "sss" recipe's CRT look on the still: scanlines, grain, haze. */}
              <span className={styles.footCrt} aria-hidden="true" />
            </>
          ) : (
            <AsciiArt className={styles.footImage} />
          )}
        </div>

        {/* The sign-off: a slab over the scene's bottom edge, a trapezoid notched into its top. */}
        <footer className={styles.siteFooter}>
          <div className={styles.footTop}>
            <div className={styles.footHead}>
              <p className={styles.footName}>{name}.</p>
              <p className={styles.footAside}>
                {location} · <Clock timeZone={timeZone} /> IST
              </p>
            </div>
            <div className={styles.footMeta}>
              <ul className={styles.footLinks}>
                {socials.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} target="_blank" rel="noreferrer">
                      {l.label}
                      <ArrowUpRight size={12} strokeWidth={2} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
              <p className={styles.footCopy}>
                © {year} {fullName}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

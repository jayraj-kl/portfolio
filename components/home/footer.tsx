import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { AsciiArt } from "@/components/ui/sss";
import type { Link } from "@/lib/content";
// import { Dissolve } from "./dissolve";
import { Clock } from "./interactive";
import styles from "./home.module.css";

// After micro and helixa, in the "sss" recipe's CRT style: a sign-off on the page's paper,
// then a full-bleed scene surfacing out of it in scanlines.
export function SiteFooter({
  name,
  fullName,
  location,
  timeZone,
  socials,
  scene,
}: {
  name: string;
  fullName: string;
  location: string;
  timeZone: string;
  socials: Link[];
  /** A still for the scene; without one it plays the "sss" ASCII recipe. */
  scene: { src: string; alt: string } | null;
}) {
  const year = new Date().getFullYear();

  return (
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

      {/* The floating dock parks above this edge rather than covering the scene. */}
      <div className={styles.footScene} data-dock-stop>
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
      </div>
    </footer>
  );
}

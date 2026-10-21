"use client";

import { ArrowRight, Pause, Play } from "lucide-react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { Still } from "./still";
import styles from "./home.module.css";

export type WorkItem = {
  slug: string;
  name: string;
  tagline: string;
  year: string;
  what: string;
  how: string;
  stack: string[];
  link: { label: string; href: string } | null;
  categories: string[];
  poster: string | null;
  video: string | null;
  gallery: string[];
  label: string;
};

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
const shortUrl = (href: string) => href.replace(/^https?:\/\//, "").replace(/\/$/, "");

// The media well: halftone poster at rest; the demo clip, unprocessed, while it plays.
function MediaWell({ item }: { item: WorkItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const hasVideo = Boolean(item.video) && !failed;

  const fine = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const play = () => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => setPlaying(false));
  };
  const stop = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  };
  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) play();
    else stop();
  };

  return (
    <div
      className={styles.well}
      onMouseEnter={() => hasVideo && fine() && play()}
      onMouseLeave={() => hasVideo && fine() && stop()}
      onClick={hasVideo ? toggle : undefined}
    >
      <Still source={{ kind: "project", slug: item.slug }} src={item.poster} label={item.label} className={styles.wellStill} />
      {hasVideo ? (
        <>
          <video
            ref={videoRef}
            className={`${styles.wellVideo} ${playing ? styles.wellVideoOn : ""}`}
            src={item.video ?? undefined}
            muted
            playsInline
            preload="metadata"
            aria-label={`${item.name} demo clip`}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onError={() => setFailed(true)}
          />
          <button
            type="button"
            className={styles.playBtn}
            aria-label={playing ? `Pause the ${item.name} demo` : `Play the ${item.name} demo`}
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
          >
            {playing ? <Pause size={14} strokeWidth={1.75} aria-hidden="true" /> : <Play size={14} strokeWidth={1.75} aria-hidden="true" />}
            <span>{playing ? "Pause" : "Play demo"}</span>
          </button>
        </>
      ) : null}
    </div>
  );
}

export function WorkGrid({ items, categories }: { items: WorkItem[]; categories: string[] }) {
  const [active, setActive] = useState("All");
  const shown = useMemo(
    () => (active === "All" ? items : items.filter((p) => p.categories.includes(active))),
    [active, items],
  );
  const tabs = ["All", ...categories];
  const countFor = (t: string) => (t === "All" ? items.length : items.filter((p) => p.categories.includes(t)).length);

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.6, ease: EXPO_OUT }}>
      <div className={styles.filters} role="group" aria-label="Filter projects by stack">
        {tabs.map((t) => (
          <button key={t} type="button" className={styles.filter} aria-pressed={active === t} onClick={() => setActive(t)}>
            {t}
            <span className={styles.filterCount}>{countFor(t)}</span>
          </button>
        ))}
        <span className="sr-only" role="status" aria-live="polite">
          {`${shown.length} of ${items.length} projects shown`}
        </span>
      </div>

      <LayoutGroup>
        <ul className={styles.cards} aria-label="Selected work">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((p) => (
              <motion.li
                layout
                key={p.slug}
                className={styles.cardItem}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, transition: { duration: 0.25, ease: EXPO_OUT } }}
              >
                <div className={styles.cardTabs}>
                  <span className={styles.cardTab}>{p.categories[0] ?? "Build"}</span>
                  <span className={`${styles.cardTab} ${styles.cardTabSlug}`}>{p.slug}</span>
                </div>
                <article className={styles.card}>
                  <MediaWell item={p} />
                  {p.gallery.length ? (
                    <ul className={styles.gallery}>
                      {p.gallery.map((g, i) => (
                        <li key={g}>
                          <Still
                            source={{ kind: "project", slug: p.slug }}
                            src={g}
                            label={`${p.name}, gallery image ${i + 1}, rendered as a line-screen halftone.`}
                            className={styles.galleryStill}
                            period={2.8}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardName}>{p.name}</h3>
                    <p className={styles.cardTagline}>{p.tagline}</p>
                    <p className={styles.cardWhat}>{p.what}</p>
                    <p className={styles.grey}>{p.how}</p>
                  </div>
                  <div className={styles.fields}>
                    <div className={styles.field}>
                      <span className={styles.fieldLabel}>Year</span>
                      <span className={`${styles.fieldValue} ${styles.tabular}`}>{p.year}</span>
                    </div>
                    <div className={styles.field}>
                      <span className={styles.fieldLabel}>Kind</span>
                      <span className={styles.fieldValue}>{p.categories.join(" / ") || "Build"}</span>
                    </div>
                    <div className={styles.field}>
                      <span className={styles.fieldLabel}>Stack</span>
                      <span className={styles.fieldValue}>{p.stack.join(" / ")}</span>
                    </div>
                    <div className={styles.field}>
                      <span className={styles.fieldLabel}>Source</span>
                      <span className={styles.fieldValue}>{p.link ? shortUrl(p.link.href) : "Private"}</span>
                    </div>
                    {p.link ? (
                      <a
                        className={styles.arrowCell}
                        href={p.link.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${p.name}: ${p.link.label} on GitHub`}
                      >
                        <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
                      </a>
                    ) : (
                      <span className={styles.arrowCell} aria-hidden="true" />
                    )}
                  </div>
                </article>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </LayoutGroup>
    </MotionConfig>
  );
}

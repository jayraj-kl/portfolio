"use client";

import { FloatingDock } from "@/components/ui/floating-dock";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { LiquidMetalBorder } from "@/components/ui/liquid-metal-border";
import { links } from "@/lib/constants";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useDark } from "./theme";
import styles from "./home.module.css";

// ---------------------------------------------------------------------------
// Logos: monochrome by CSS filter; a monogram tile when the file is missing or fails.

const STOP = new Set(["of", "for", "and", "the", "in", "at"]);

function initials(name: string) {
  // An acronym the name already carries wins: "(C-DAC)" gives CDAC, "IEEE HiPC" gives IEEE.
  const paren = name.match(/\(([A-Z][A-Z-]{1,6})\)/);
  if (paren) return paren[1].replace(/-/g, "").slice(0, 4);
  const lead = name.match(/^([A-Z]{3,4})\b/);
  if (lead) return lead[1];
  const words = name
    .replace(/\(.*?\)/g, " ")
    .split(/[\s,/-]+/)
    .filter((w) => /^[A-Za-z]/.test(w) && !STOP.has(w.toLowerCase()));
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function Logo({ name, src }: { name: string; src: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className={styles.monogram} aria-hidden="true">
        {initials(name)}
      </span>
    );
  }
  return (
    <span className={styles.logo} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- a plain logo file, filtered to monochrome */}
      <img src={src} alt="" onError={() => setFailed(true)} />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Tech stack: a carousel of Simple Icons in the theme's ink (a static row under reduced motion),
// and the full grouped list on demand.

type Skill = { name: string; slug: string };

const REDUCE = "(prefers-reduced-motion: reduce)";

// Hydrates as "motion allowed" (the server's answer), then follows the media query.
function useReducedMotionSafe() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCE);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCE).matches,
    () => false,
  );
}

// With no hex the CDN serves the brand's own colour.
function StackIcon({ skill, hex }: { skill: Skill; hex?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className={styles.stackMono} role="img" aria-label={skill.name}>
        {initials(skill.name) || skill.name.slice(0, 2)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote SVG icon recoloured per theme by the CDN
    <img
      className={styles.stackIcon}
      src={`https://cdn.simpleicons.org/${skill.slug}${hex ? `/${hex}` : ""}`}
      alt={skill.name}
      title={skill.name}
      width={30}
      height={30}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export function TechStack({ groups }: { groups: { name: string; skills: Skill[] }[] }) {
  const dark = useDark();
  const reduce = useReducedMotionSafe();
  const [open, setOpen] = useState(false);
  const id = useId();
  // Brand colours in light; the ink in dark, where many brand marks are too dark to see.
  const hex = dark ? "ecece6" : undefined;
  const all = groups.flatMap((g) => g.skills);
  const icons = all.map((s) => <StackIcon key={s.slug} skill={s} hex={hex} />);
  return (
    <div>
      {/* The slider repeats its items, so assistive tech reads this list instead. */}
      <ul className="sr-only">
        {all.map((s) => (
          <li key={s.slug}>{s.name}</li>
        ))}
      </ul>
      <div className={`${styles.stackTrack} ${reduce ? "" : styles.stackFade}`} aria-hidden="true">
        {reduce ? (
          <div className={styles.stackRow}>{icons}</div>
        ) : (
          <InfiniteSlider gap={44} speed={32} speedOnHover={8}>
            {icons}
          </InfiniteSlider>
        )}
      </div>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Hide full stack" : "View full stack"}
        <ChevronDown size={14} strokeWidth={1.75} aria-hidden="true" className={open ? styles.chevOpen : undefined} />
      </button>
      <div id={id} hidden={!open} className={styles.tools}>
        {groups.map((g) => (
          <div key={g.name} className={styles.toolCol}>
            <h3 className={styles.miniLabel}>{g.name}</h3>
            <ul>
              {g.skills.map((s) => (
                <li key={s.slug}>{s.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Expand: a clamped block with "View more", shown only when the text overflows.

export function Expand({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const id = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 2);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div>
      <div
        ref={ref}
        id={id}
        className={`${styles.expand} ${open ? styles.expandOpen : ""} ${overflows && !open ? styles.expandFade : ""}`}
      >
        {children}
      </div>
      {overflows || open ? (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "View less" : "View more"}
          <ChevronDown size={14} strokeWidth={1.75} aria-hidden="true" className={open ? styles.chevOpen : undefined} />
        </button>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// GitHub contributions, five monochrome steps from the ground to the ink.

const GRAPH_THEME = {
  // GitHub's own greens in light; the page's greys in dark.
  light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
  dark: ["#1c1c1b", "#3b3b39", "#6f6f6b", "#a9a9a4", "#ecece6"],
};

// The calendar renders differently on the server, so it is drawn only in the browser, in a reserved
// box; loading it here also keeps it out of the page's first bundle.
const GitHubCalendar = dynamic(
  () => import("react-github-calendar").then((m) => m.GitHubCalendar),
  { ssr: false },
);

export function Contributions({ username }: { username: string }) {
  const dark = useDark();
  return (
    <div className={styles.graph}>
      <GitHubCalendar
        username={username}
        theme={GRAPH_THEME}
        colorScheme={dark ? "dark" : "light"}
        blockSize={10}
        blockMargin={3}
        blockRadius={2}
        fontSize={12}
        errorMessage="The contribution graph could not be loaded from GitHub."
        labels={{ totalCount: "{{count}} contributions in the last year" }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// The site's floating dock, re-skinned from here (the shared component is untouched).

// The dock follows the screen until the footer's scene rises to meet it, then parks just above
// the scene and scrolls away with the page, so the picture is never covered. A sticky rail does
// this rather than a scroll listener: the browser moves it with the scroll itself, so it never
// lags a frame behind and shudders as it parks.
// On opening it springs up from below and a shine runs once around its edge, as on yo-hackyfolio.
export function Dock() {
  return (
    <div className={styles.dockRail}>
      <div className={styles.dock}>
        <motion.div
          className={styles.dockPop}
          initial={{ opacity: 0, y: 60, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.35 }}
        >
          <LiquidMetalBorder radius={9999}>
            <FloatingDock items={links} desktopClassName={styles.dockDesktop} mobileClassName={styles.dockMobile} />
          </LiquidMetalBorder>
          <span className={styles.dockShine} aria-hidden="true" />
        </motion.div>
      </div>
    </div>
  );
}

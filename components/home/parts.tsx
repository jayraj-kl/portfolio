"use client";

import { FloatingDock } from "@/components/ui/floating-dock";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { LiquidMetalBorder } from "@/components/ui/liquid-metal-border";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { links } from "@/lib/dock-links";
import { ChevronDown } from "lucide-react";
import { animate, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { useNear } from "@/hooks/use-near";
import { SPRING_UI, useReducedMotionSafe } from "./motion";
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
      <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Tech stack: a carousel of Simple Icons in the theme's ink (a static row under reduced motion),
// and the full grouped list on demand.

type Skill = { name: string; slug: string };

// The marks kept under public/stack/ in their real colours. Simple Icons draws every brand as one
// flat silhouette, which is right for the dark theme's ink but wrong for a logo with several
// colours (Python, Linux, Hugging Face) once it's shown in "its" colour.
const COLOUR = new Set([
  "python", "typescript", "javascript", "c", "cplusplus", "react", "nextdotjs", "tailwindcss", "framer",
  "fastapi", "django", "flask", "nodedotjs", "postgresql", "mongodb", "redis", "firebase", "docker",
  "kubernetes", "prometheus", "grafana", "vercel", "git", "github", "linux", "huggingface",
  "tensorflow", "pytorch", "scikitlearn", "numpy", "pandas",
]);

// With a hex, the CDN's silhouette in that colour; with none, the real mark, or failing that the
// silhouette in the brand's own colour.
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
      src={
        !hex && COLOUR.has(skill.slug)
          ? `/stack/${skill.slug}.svg`
          : `https://cdn.simpleicons.org/${skill.slug}${hex ? `/${hex}` : ""}`
      }
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
      {/* Grows out from under its toggle, so it is plain where the list came from and what it
          pushed down. A second click partway reverses from where it is. Closed, it is inert:
          out of the tab order and unread, as `hidden` kept it. */}
      <motion.div
        id={id}
        className={styles.toolsWrap}
        inert={!open}
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={reduce ? { height: { duration: 0 }, opacity: { duration: 0.15 } } : SPRING_UI}
      >
        <div className={styles.tools}>
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
      </motion.div>
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
  const reduce = useReducedMotionSafe();
  const run = useRef<ReturnType<typeof animate> | null>(null);

  // The clamp and its release are both CSS rest states (a max-height, or none), so the height
  // is animated by hand between them: from wherever the block is on screen right now, which
  // makes a second click partway reverse in place, to where the new state leaves it.
  const toggle = () => {
    const el = ref.current;
    const next = !open;
    if (!el || reduce) {
      setOpen(next);
      return;
    }
    const from = el.getBoundingClientRect().height;
    run.current?.stop();
    el.style.height = "";
    el.style.maxHeight = "";
    flushSync(() => setOpen(next));
    const to = el.getBoundingClientRect().height;
    if (Math.abs(to - from) < 1) return;
    el.style.maxHeight = "none";
    const anim = animate(el, { height: [from, to] }, SPRING_UI);
    run.current = anim;
    anim.then(() => {
      if (run.current !== anim) return;
      run.current = null;
      el.style.height = "";
      el.style.maxHeight = "";
    });
  };

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
          onClick={toggle}
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
  const box = useRef<HTMLDivElement>(null);
  // The graph sits near the foot of the page: its script and its data are fetched as the reader
  // comes within a screen of it, not with the page.
  const near = useNear(box);
  return (
    <div ref={box} className={styles.graph}>
      {near ? (
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
      ) : null}
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
// Once the footer arrives it steps back down the way it came: the footer's slab carries the same
// links, so the end of the page lists them once, and keyboard users don't tab through them twice.
export function Dock() {
  const retired = useFooterInView();
  return (
    <>
    {/* The bottom scroll edge, under the dock; it leaves with the dock at the footer. */}
    <div className={`${styles.edge} ${styles.edgeBottom}`} data-off={retired || undefined} aria-hidden="true">
      <ProgressiveBlur direction="bottom" blurLayers={5} blurIntensity={1.6} className={styles.edgeBlur} />
    </div>
    <div className={styles.dockRail}>
      <div className={styles.dock} data-retired={retired || undefined} inert={retired}>
        <motion.div
          className={styles.dockPop}
          initial={{ opacity: 0, y: 60, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          // Nothing threw it, so it settles with only a trace of overshoot.
          transition={{ type: "spring", bounce: 0.15, duration: 0.5, delay: 0.35 }}
        >
          <LiquidMetalBorder radius={9999} hollow>
            <FloatingDock items={links} desktopClassName={styles.dockDesktop} mobileClassName={styles.dockMobile} />
          </LiquidMetalBorder>
          <span className={styles.dockShine} aria-hidden="true" />
        </motion.div>
      </div>
    </div>
    </>
  );
}

// True from the moment the footer's lead-in band enters the screen, and for as long as the
// reader stays at or below it.
function useFooterInView() {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const lead = document.querySelector("[data-dock-retire]");
    if (!lead) return;
    const io = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting || e.boundingClientRect.top < 0);
    });
    io.observe(lead);
    return () => io.disconnect();
  }, []);
  return inView;
}

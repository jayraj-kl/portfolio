"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { TextMorph } from "torph/react";
import { INTRO_ID, type NotchSection } from "./notch-sections";
import styles from "./home.module.css";

const SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.9 } as const;
const MORPH_EASE = "cubic-bezier(0.19, 1, 0.22, 1)";

// A section becomes current once its top passes this share of the viewport.
const ACTIVE_LINE = 0.35;

// The notch stays out of the way at the top of the page and drops in after a little scroll.
const SHOW_AFTER = 96;

function useScrolledPast(px: number) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const check = () => setPast(window.scrollY > px);
    // A reload partway down the page shows it straight away.
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [px]);
  return past;
}

function useActiveSection(sections: NotchSection[]) {
  const [active, setActive] = useState(INTRO_ID);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight * ACTIVE_LINE;
      let current = INTRO_ID;
      for (const s of sections) {
        if (s.id === INTRO_ID) continue;
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      // At the very bottom the last section is current even if it never reaches the line.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = sections[sections.length - 1]?.id ?? current;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);
  return active;
}

function ProgressArc({ size = 20 }: { size?: number }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 260, damping: 40, restDelta: 0.001 });
  const r = size / 2 - 2;
  return (
    <svg className={styles.notchArc} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} className={styles.notchArcTrack} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        className={styles.notchArcFill}
        style={{ pathLength: progress, rotate: -90, transformOrigin: "50% 50%" }}
      />
    </svg>
  );
}

/**
 * A notch at the top of the page: scroll progress as an arc, the current section's name
 * morphing as you move between sections. Clicking it opens a list of every section; picking
 * one scrolls there, and the notch closes once the scroll settles.
 */
export function Notch({ sections }: { sections: NotchSection[] }) {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolledPast(SHOW_AFTER);
  // Never hide it while it's open.
  const visible = scrolled || open;
  // "Sections" stays on the bar until the close has finished, so the label morph never changes
  // the notch's size in the middle of the close.
  const [titled, setTitled] = useState(false);
  const active = useActiveSection(sections);
  const reduce = useReducedMotion();
  const listId = useId();
  const root = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const label = sections.find((s) => s.id === active)?.label ?? sections[0]?.label ?? "";

  const close = useCallback((refocus = false) => {
    setOpen(false);
    if (refocus) toggle.current?.focus();
  }, []);

  // Escape or a click outside closes it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    const onPointer = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open, close]);

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
    const target = id === INTRO_ID ? null : document.getElementById(id);
    if (target) target.scrollIntoView({ behavior, block: "start" });
    else window.scrollTo({ top: 0, behavior });

    // Close once the page has arrived; the timeout covers browsers without scrollend
    // and the case where the page is already there and never scrolls.
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.removeEventListener("scrollend", finish);
      close();
      (target ?? document.getElementById("main"))?.focus({ preventScroll: true });
    };
    window.addEventListener("scrollend", finish, { once: true });
    window.setTimeout(finish, reduce ? 0 : 1100);
  };

  const transition = reduce ? { duration: 0 } : SPRING;
  const showTitle = reduce ? open : open || titled;

  const onToggle = () => {
    if (!open) setTitled(true);
    setOpen(!open);
  };

  return (
    <div className={styles.notchHost}>
      <AnimatePresence>
        {visible ? (
          <motion.nav
            key="notch"
            ref={root}
            aria-label="Sections"
            className={styles.notchPop}
            // Drops in from above the edge, sharpening as it lands; leaves the same way.
            initial={{ opacity: 0, y: -28, scale: 0.92, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -28, scale: 0.92, filter: "blur(6px)" }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
          >
            <motion.div
              layout
              layoutDependency={open}
              className={`${styles.notch} ${open ? styles.notchOpen : ""}`}
              // 20px is a full pill at the closed height, so the corners ease rather than jump.
              initial={false}
              animate={{ borderRadius: open ? 22 : 20 }}
              transition={transition}
              onLayoutAnimationComplete={() => {
                if (!open) setTitled(false);
              }}
            >
              <motion.button
                ref={toggle}
                layout="position"
                layoutDependency={open}
                transition={transition}
                type="button"
                className={styles.notchBar}
                aria-expanded={open}
                aria-controls={listId}
                onClick={onToggle}
              >
                <ProgressArc />
                <TextMorph as="span" className={styles.notchLabel} duration={420} ease={MORPH_EASE} locale="en">
                  {showTitle ? "Sections" : label}
                </TextMorph>
                <span className="sr-only">{open ? ", close the section list" : ", open the section list"}</span>
              </motion.button>

              {/* popLayout takes the closing list out of the flow at once, so the notch shrinks
                  straight to its closed height while the list fades inside it. */}
              <AnimatePresence initial={false} mode="popLayout">
                {open ? (
                  <motion.ul
                    key="list"
                    id={listId}
                    className={styles.notchList}
                    initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: reduce ? 0 : 0.08, duration: 0.24 } }}
                    exit={{ opacity: 0, y: -4, filter: "blur(4px)", transition: { duration: reduce ? 0 : 0.14 } }}
                  >
                    {sections.map((s) => (
                      <li key={s.id}>
                        <a
                          href={s.id === INTRO_ID ? "#main" : `#${s.id}`}
                          className={styles.notchLink}
                          aria-current={s.id === active ? "location" : undefined}
                          onClick={(e) => go(e, s.id)}
                        >
                          <span className={styles.notchDot} aria-hidden="true" />
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </motion.ul>
                ) : null}
              </AnimatePresence>
            </motion.div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

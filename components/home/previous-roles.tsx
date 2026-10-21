"use client";

import { ArrowUpRight, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { Experience } from "@/lib/content";
import { range } from "./dates";
import { Logo } from "./parts";
import styles from "./home.module.css";

// After Aceternity's expandable card: the row's logo, name, title and pill each fly into the
// modal on their own layoutId, so the row unfolds into the detail rather than a box growing.

const SPRING = { type: "spring", stiffness: 420, damping: 38 } as const;

type Role = Experience & { logo: string | null };

// The modal renders at the page's root: the section's reveal leaves a filter behind, which would
// make a fixed layer inside it fixed to the section instead of the screen. The root keeps the theme.
const noop = () => () => {};
const findRoot = () => document.querySelector<HTMLElement>("[data-home-root]");

export function PreviousRoles({ roles }: { roles: Role[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const uid = useId();
  const rows = useRef<(HTMLButtonElement | null)[]>([]);
  const last = useRef<number | null>(null);
  const root = useSyncExternalStore(noop, findRoot, () => null);
  const t = reduce ? { duration: 0 } : SPRING;
  const lid = (part: string, i: number) => `${part}-${i}-${uid}`;

  // Focus goes back to the row that opened the modal.
  useEffect(() => {
    if (open !== null) last.current = open;
    else if (last.current !== null) {
      rows.current[last.current]?.focus();
      last.current = null;
    }
  }, [open]);

  return (
    <>
      <ul className={styles.roleRows}>
        {roles.map((e, i) => (
          <li key={`${e.org}-${e.start}`}>
            <motion.button
              ref={(el) => {
                rows.current[i] = el;
              }}
              type="button"
              layoutId={lid("card", i)}
              transition={t}
              className={styles.roleRow}
              aria-haspopup="dialog"
              onClick={() => setOpen(i)}
            >
              <motion.span layoutId={lid("logo", i)} transition={t} className={styles.roleLogo}>
                <Logo name={e.org} src={e.logo} />
              </motion.span>
              <span className={styles.prevMain}>
                <motion.span layoutId={lid("org", i)} transition={t} className={styles.prevOrg}>
                  {e.org}
                </motion.span>
                <motion.span layoutId={lid("title", i)} transition={t} className={styles.small}>
                  {e.title}
                </motion.span>
              </span>
              <span className={styles.roleWhen}>
                <span className={styles.data}>{range(e.start, e.end)}</span>
                <span className={styles.small}>{e.place}</span>
              </span>
              <motion.span layoutId={lid("pill", i)} transition={t} className={styles.rolePill}>
                Details
              </motion.span>
            </motion.button>
          </li>
        ))}
      </ul>

      {root
        ? createPortal(
            <AnimatePresence>
              {open !== null ? (
                <RoleModal key={open} role={roles[open]} id={(p) => lid(p, open)} transition={t} onClose={() => setOpen(null)} />
              ) : null}
            </AnimatePresence>,
            root,
          )
        : null}
    </>
  );
}

function RoleModal({
  role: e,
  id,
  transition,
  onClose,
}: {
  role: Role;
  id: (part: string) => string;
  transition: object;
  onClose: () => void;
}) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const d = e.details;
  const link = d?.links?.[0];

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose();
      // Keep Tab inside the modal.
      if (ev.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("a[href], button");
        if (!f.length) return;
        const first = f[0], end = f[f.length - 1];
        if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); end.focus(); }
        else if (!ev.shiftKey && document.activeElement === end) { ev.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { delay: 0.1, duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.08 } },
  };

  return (
    <div className={styles.roleLayer}>
      <motion.div
        className={styles.roleScrim}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      <motion.div
        ref={panel}
        layoutId={id("card")}
        transition={transition}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={styles.roleModal}
      >
        {/* On phones the modal fills the screen, so it needs its own way out. */}
        <motion.button {...fade} ref={closeRef} type="button" className={styles.roleClose} onClick={onClose} aria-label="Close">
          <X size={16} strokeWidth={1.75} aria-hidden="true" />
        </motion.button>

        <div className={styles.roleHero}>
          {d?.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- a picture of the work, shown as given
            <img className={styles.roleImage} src={d.image.src} alt={d.image.alt} />
          ) : null}
          <motion.span layoutId={id("logo")} transition={transition} className={`${styles.roleLogo} ${styles.roleLogoBig}`}>
            <Logo name={e.org} src={e.logo} />
          </motion.span>
        </div>

        <div className={styles.roleHead}>
          <div className={styles.leadTitle}>
            <motion.h3 layoutId={id("org")} transition={transition} id={titleId} className={styles.roleOrg}>
              {e.org}
            </motion.h3>
            <motion.p layoutId={id("title")} transition={transition} className={styles.small}>
              {e.title}
            </motion.p>
          </div>
          {link ? (
            <motion.a layoutId={id("pill")} transition={transition} className={`${styles.rolePill} ${styles.rolePillSolid}`} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
              <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
            </motion.a>
          ) : null}
        </div>

        <motion.div {...fade} className={styles.roleBody}>
          <p className={styles.data}>
            {range(e.start, e.end)} · {e.place}
          </p>
          <div className={styles.prose}>
            <p>{e.what}</p>
            <p className={styles.grey}>{e.how}</p>
            {e.advisor ? <p className={styles.small}>Advised by {e.advisor}</p> : null}
          </div>

          {d?.highlights?.length ? (
            <ul className={styles.roleList}>
              {d.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          ) : null}

          {d?.stack?.length ? (
            <ul className={styles.roleStack} aria-label="Tools">
              {d.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : null}

          {d?.links && d.links.length > 1 ? (
            <p className={styles.roleLinks}>
              {d.links.slice(1).map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={styles.link}>
                  {l.label}
                  <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
                </a>
              ))}
            </p>
          ) : null}
        </motion.div>
      </motion.div>
    </div>
  );
}

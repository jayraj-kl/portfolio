"use client";

// The command palette: the notch grown into a search over the page. Sections, projects and
// papers to jump to, and the things a visitor comes to do (copy the email, open the résumé).
// It opens in the notch's place, in the notch's ink glass, and folds back up the same way.
// cmdk does the filtering, the arrow keys and the listbox semantics.

import { Command } from "cmdk";
import { ArrowUpRight, Copy, FileText, FolderGit2, Hash, Repeat2, Search, SunMoon, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { switchTheme } from "@/lib/theme-switch";
import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { writeClipboard } from "./interactive";
import { goToSection, notchStatus } from "./notch-sections";
import type { PaletteData, PaletteTarget } from "./palette-items";
import styles from "./home.module.css";

// The notch's own drop-in, so the two read as one object.
const SPRING = { type: "spring", stiffness: 380, damping: 30 } as const;

function Row({
  group,
  label,
  hint,
  keywords,
  icon: Icon,
  onSelect,
}: {
  group: string;
  label: string;
  hint?: string;
  keywords?: string[];
  icon: LucideIcon;
  onSelect: () => void;
}) {
  return (
    // The group's name is part of the value, so "work" or "papers" lists that group.
    <Command.Item value={`${group} ${label}`} keywords={keywords} onSelect={onSelect} className={styles.palItem}>
      <Icon size={16} strokeWidth={1.75} aria-hidden="true" className={styles.palIcon} />
      <span className={styles.palLabel}>{label}</span>
      {hint ? <span className={styles.palHint}>{hint}</span> : null}
    </Command.Item>
  );
}

export function Palette({
  open,
  onClose,
  data,
}: {
  open: boolean;
  /** `true` hands focus back to where it was; `false` when the action moves it itself. */
  onClose: (restoreFocus: boolean) => void;
  data: PaletteData;
}) {
  const reduce = useReducedMotion();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState("");
  // cmdk moves its highlight to whatever row is under the pointer. Under a mouse that is hover;
  // under a finger it is a scroll dragging the highlight from row to row. So a finger's moves stop
  // here, before they reach the rows; a tap still chooses its row.
  const onPointerMoveCapture = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") e.stopPropagation();
  };

  const close = (restoreFocus: boolean) => {
    setQuery("");
    onClose(restoreFocus);
  };

  // A jump closes the palette, then scrolls; focus lands on what it scrolled to. A card that the
  // work filter is hiding isn't on the page, so the jump goes to its section instead.
  const jump = (id: string, fallback?: string) => {
    close(false);
    goToSection(document.getElementById(id) || !fallback ? id : fallback, !reduce);
  };

  const external = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
    close(true);
  };

  const target = (t: PaletteTarget, group: string, icon: LucideIcon, fallback: string) => (
    <Row key={t.id} group={group} label={t.label} hint={t.hint} keywords={t.keywords} icon={icon} onSelect={() => jump(t.id, fallback)} />
  );

  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Escape clears the search first, then closes.
    if (e.key === "Escape") {
      e.preventDefault();
      if (query) setQuery("");
      else close(true);
    }
    // Focus stays in the search field; the arrow keys move through the list.
    if (e.key === "Tab") e.preventDefault();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="scrim"
          className={styles.palScrim}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          onPointerDown={() => close(true)}
        />
      ) : null}
      {open ? (
        <div key="palette" className={styles.palHost}>
          <motion.div
            className={styles.palPop}
            // Drops in from the notch's place, sharpening as it lands, as the notch does. The
            // filter is dropped once it lands: any filter here would cut the glass inside off
            // from the page behind it.
            // As one transform, so it runs on the compositor (see Reveal).
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(-16px) scale(0.94)", filter: "blur(6px)" }}
            animate={{
              opacity: 1,
              transform: "translateY(0px) scale(1)",
              filter: "blur(0px)",
              transitionEnd: { filter: "none", transform: "none" },
            }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(-10px) scale(0.96)", filter: "blur(4px)" }}
            transition={reduce ? { duration: 0 } : SPRING}
          >
            <div className={styles.palette} role="dialog" aria-modal="true" aria-label="Search the page">
              <Command
                label="Search the page"
                loop
                vimBindings={false}
                onKeyDown={onKeyDown}
                onPointerMoveCapture={onPointerMoveCapture}
              >
                <div className={styles.palInputRow}>
                  <Search size={16} strokeWidth={2} aria-hidden="true" className={styles.palIcon} />
                  <Command.Input
                    autoFocus
                    value={query}
                    onValueChange={setQuery}
                    placeholder="Search sections, work, papers and actions"
                    className={styles.palInput}
                  />
                  <kbd className={styles.palKbd}>esc</kbd>
                </div>

                <Command.List className={styles.palList}>
                  <Command.Empty className={styles.palEmpty}>Nothing on the page matches “{query}”.</Command.Empty>

                  <Command.Group heading="Actions">
                    <Row
                      group="Actions"
                      label="Copy email address"
                      hint={data.email}
                      keywords={["email", "mail", "contact", "write"]}
                      icon={Copy}
                      onSelect={() => {
                        // Started inside the key or click that chose it, so the browser allows it.
                        void writeClipboard(data.email).then((ok) => notchStatus(ok ? "Email copied" : "Copy failed"));
                        close(true);
                      }}
                    />
                    <Row
                      group="Actions"
                      // "Open résumé", "Open research CV": a leading capital drops mid-sentence,
                      // unless it starts an acronym.
                      label={`Open ${data.cv.label.replace(/^\p{Lu}(?=\p{Ll})/u, (c) => c.toLowerCase())}`}
                      hint="PDF"
                      keywords={["resume", "cv", "pdf"]}
                      icon={ArrowUpRight}
                      onSelect={() => external(data.cv.href)}
                    />
                    <Row
                      group="Actions"
                      label={`Switch to the ${nextTheme} theme`}
                      keywords={["theme", "dark", "light", "mode"]}
                      icon={SunMoon}
                      onSelect={() => {
                        switchTheme(setTheme, nextTheme);
                        notchStatus(nextTheme === "dark" ? "Dark theme" : "Light theme");
                        close(true);
                      }}
                    />
                    <Row
                      group="Actions"
                      label={data.otherProfile.label}
                      keywords={["profile", "version", "research", "engineering"]}
                      icon={Repeat2}
                      onSelect={() => {
                        close(false);
                        router.push(data.otherProfile.href);
                      }}
                    />
                  </Command.Group>

                  <Command.Group heading="Sections">
                    {data.sections.map((s) => (
                      <Row key={s.id} group="Sections" label={s.label} icon={Hash} onSelect={() => jump(s.id)} />
                    ))}
                  </Command.Group>

                  {data.work.length ? (
                    <Command.Group heading="Work">{data.work.map((t) => target(t, "Work", FolderGit2, "work"))}</Command.Group>
                  ) : null}

                  {data.papers.length ? (
                    <Command.Group heading="Papers">
                      {data.papers.map((t) => target(t, "Papers", FileText, "publications"))}
                    </Command.Group>
                  ) : null}

                  <Command.Group heading="Elsewhere">
                    {data.socials.map((l) => (
                      <Row key={l.href} group="Elsewhere" label={l.label} hint={l.href.replace(/^https?:\/\/(www\.)?/, "")} icon={ArrowUpRight} onSelect={() => external(l.href)} />
                    ))}
                  </Command.Group>
                </Command.List>

                <div className={styles.palFoot} aria-hidden="true">
                  <span>↑↓ to move</span>
                  <span>↵ to open</span>
                  <span>esc to close</span>
                </div>
              </Command>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

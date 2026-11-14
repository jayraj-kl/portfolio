"use client";

import { Check, Copy } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { TextMorph } from "torph/react";
import { LiquidMetalBorder } from "@/components/ui/liquid-metal-border";
import { SPRING_QUICK, useReducedMotionSafe } from "./motion";
import { notchStatus, STATUS_HOLD_MS } from "./notch-sections";
import styles from "./home.module.css";

type CopyState = "idle" | "copied" | "failed";

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

// `report` is what the notch says once the copy lands.
function useCopy(value: string, report: string) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async () => {
    const ok = await writeClipboard(value);
    if (ok) notchStatus(report);
    setState(ok ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), STATUS_HOLD_MS);
  };
  return { state, copy };
}

// The notch's own label curve, so the button and the notch confirm a copy in one voice.
const MORPH_EASE = "cubic-bezier(0.19, 1, 0.22, 1)";

// The copy glyph and the tick share one cell and cross over in place, as the notch's arc and
// tick do. Under reduced motion both stay full size and only cross-fade.
function CopyGlyph({ done, size }: { done: boolean; size: number }) {
  const reduce = useReducedMotionSafe();
  const transition = reduce ? { duration: 0.12 } : SPRING_QUICK;
  const shown = { opacity: 1, scale: 1 };
  const gone = { opacity: 0, scale: reduce ? 1 : 0.6 };
  return (
    <span className={styles.swap} aria-hidden="true">
      <motion.span initial={false} animate={done ? gone : shown} transition={transition}>
        <Copy size={size} strokeWidth={1.75} />
      </motion.span>
      <motion.span initial={false} animate={done ? shown : gone} transition={transition}>
        <Check size={size} strokeWidth={1.75} />
      </motion.span>
    </span>
  );
}

// The primary action: the address as text, and a copy action in the same black block.
export function EmailButton({ email }: { email: string }) {
  const { state, copy } = useCopy(email, "Email copied");
  return (
    <>
      <LiquidMetalBorder radius={10} press className={styles.press}>
        <button
          type="button"
          className={`${styles.btnPrimary} ${styles.onMetal}`}
          onClick={copy}
          aria-label={`Copy email address ${email}`}
        >
          <span className={styles.btnAddr}>{email}</span>
          <span className={styles.btnAct} aria-hidden="true">
            <CopyGlyph done={state === "copied"} size={16} />
            <TextMorph as="span" duration={320} ease={MORPH_EASE} locale="en">
              {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy"}
            </TextMorph>
          </span>
        </button>
      </LiquidMetalBorder>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied"
          ? "Email address copied."
          : state === "failed"
            ? `Copy failed. The address is ${email}.`
            : ""}
      </span>
    </>
  );
}

export function CopyText({ value, label, done }: { value: string; label: string; done: string }) {
  const { state, copy } = useCopy(value, done);
  return (
    <>
      <button type="button" className={styles.textBtn} onClick={copy}>
        <CopyGlyph done={state === "copied"} size={14} />
        <TextMorph as="span" duration={320} ease={MORPH_EASE} locale="en">
          {state === "copied" ? done : state === "failed" ? "Copy failed" : label}
        </TextMorph>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied" ? done : ""}
      </span>
    </>
  );
}

/**
 * Marks the link or button under a finger or the mouse with `data-pressed` from the instant it
 * goes down until it lifts. CSS :active alone is late on touch: Chrome applies it only once the
 * finger has lifted, so a held control would show nothing. The stylesheet's press rules answer to
 * either. A scroll that starts on a control cancels the pointer, which lifts the mark again.
 */
export function PressFeedback() {
  useEffect(() => {
    const root = document.querySelector("[data-home-root]");
    if (!root) return;
    let held: Element | null = null;
    const release = () => {
      held?.removeAttribute("data-pressed");
      held = null;
    };
    const onDown = (e: Event) => {
      release();
      const ev = e as PointerEvent;
      if (ev.button !== 0 || !(ev.target instanceof Element)) return;
      const control = ev.target.closest("a, button");
      if (!control || !root.contains(control)) return;
      held = control;
      control.setAttribute("data-pressed", "");
    };
    root.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", release);
    return () => {
      release();
      root.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("blur", release);
    };
  }, []);
  return null;
}

const fmtCache = new Map<string, Intl.DateTimeFormat>();

export function Clock({ timeZone }: { timeZone: string }) {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    let fmt = fmtCache.get(timeZone);
    if (!fmt) {
      fmt = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hour12: false });
      fmtCache.set(timeZone, fmt);
    }
    const f = fmt;
    const tick = () => setNow(f.format(new Date()));
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 15000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [timeZone]);
  if (!now) return <time className={styles.tabular}>--:--</time>;
  return (
    <time className={styles.tabular}>
      <span className="sr-only">{now}</span>
      <Rolling value={now} />
    </time>
  );
}

/**
 * Text whose digits turn on odometer wheels when they change. With `from`, it shows that first
 * and rolls up to `value` at `at` (a performance.now() time; a count-up as a widget lands).
 * Decorative: the caller gives the value to assistive tech.
 */
export function Rolling({ value, from, at = 0 }: { value: string; from?: string; at?: number }) {
  const [shown, setShown] = useState(from ?? value);
  useEffect(() => {
    const wait = from === undefined ? 0 : Math.max(0, at - performance.now());
    const id = window.setTimeout(() => setShown(value), wait);
    return () => window.clearTimeout(id);
  }, [value, from, at]);
  return (
    <span className={styles.roll} aria-hidden="true">
      {[...shown].map((ch, i) =>
        /\d/.test(ch) ? <RollDigit key={i} digit={Number(ch)} /> : <span key={i}>{ch}</span>,
      )}
    </span>
  );
}

/**
 * One odometer wheel, as on a Live Activity: a column of 0–9 twice over, so a change always rolls
 * forward (9 to 0 carries on to the second 0, then quietly resets to the first).
 */
function RollDigit({ digit }: { digit: number }) {
  const [wheel, setWheel] = useState({ digit, pos: digit, rolling: false });
  // A new digit sets the target during render, so the wheel never paints a frame at the old spot.
  if (wheel.digit !== digit) {
    setWheel({ digit, pos: digit > wheel.digit ? digit : digit + 10, rolling: true });
  }
  return (
    <span className={styles.rollWindow}>
      <span
        className={styles.rollReel}
        data-rolling={wheel.rolling || undefined}
        style={{ transform: `translateY(${-wheel.pos * 1.2}em)` }}
        onTransitionEnd={() => setWheel((w) => ({ ...w, pos: w.pos % 10, rolling: false }))}
      >
        {REEL.map((n, i) => (
          <span key={i}>{n}</span>
        ))}
      </span>
    </span>
  );
}

const REEL = Array.from({ length: 20 }, (_, i) => i % 10);

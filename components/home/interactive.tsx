"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LiquidMetalBorder } from "@/components/ui/liquid-metal-border";
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

function useCopy(value: string) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async () => {
    const ok = await writeClipboard(value);
    setState(ok ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2400);
  };
  return { state, copy };
}

// The primary action: the address as text, and a copy action in the same black block.
export function EmailButton({ email }: { email: string }) {
  const { state, copy } = useCopy(email);
  return (
    <>
      <LiquidMetalBorder radius={10}>
        <button
          type="button"
          className={`${styles.btnPrimary} ${styles.onMetal}`}
          onClick={copy}
          aria-label={`Copy email address ${email}`}
        >
          <span className={styles.btnAddr}>{email}</span>
          <span className={styles.btnAct} aria-hidden="true">
            {state === "copied" ? <Check size={16} strokeWidth={1.75} /> : <Copy size={16} strokeWidth={1.75} />}
            {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy"}
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
  const { state, copy } = useCopy(value);
  return (
    <>
      <button type="button" className={styles.textBtn} onClick={copy}>
        {state === "copied" ? <Check size={14} strokeWidth={1.75} aria-hidden /> : <Copy size={14} strokeWidth={1.75} aria-hidden />}
        {state === "copied" ? done : state === "failed" ? "Copy failed" : label}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied" ? done : ""}
      </span>
    </>
  );
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
  return <time className={styles.tabular}>{now ?? "--:--"}</time>;
}

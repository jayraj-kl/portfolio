"use client";

// The command palette's always-loaded part: the shortcut, and the open state. The palette itself
// (cmdk and its list) is fetched the first time it is wanted, or in a quiet moment after the
// page has loaded, so it adds nothing to the first load.

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { whenIdle } from "@/hooks/use-near";
import { PALETTE_OPENED_EVENT, PALETTE_OPEN_EVENT, type PaletteData } from "./palette-items";

const Palette = dynamic(() => import("./palette").then((m) => m.Palette), { ssr: false });

export function PaletteHost({ data }: { data: PaletteData }) {
  const [open, setOpen] = useState(false);
  // Mounted on first use and kept, so its exit can play and a second open is instant.
  const [wanted, setWanted] = useState(false);
  // Where focus was when the palette opened, to hand it back if nothing else takes it.
  const returnTo = useRef<HTMLElement | null>(null);

  const show = useCallback(() => {
    returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setWanted(true);
    setOpen(true);
    window.dispatchEvent(new Event(PALETTE_OPENED_EVENT));
  }, []);

  const hide = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) returnTo.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    // ⌘K on Apple devices, Ctrl+K elsewhere, from anywhere on the page; again to close.
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "k" || !(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
      e.preventDefault();
      if (open) hide(true);
      else show();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_OPEN_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_OPEN_EVENT, show);
    };
  }, [open, show, hide]);

  // Fetch the palette's code once the page has settled, so the first ⌘K opens without a wait.
  useEffect(() => whenIdle(() => void import("./palette"), 4000), []);

  return wanted ? <Palette open={open} onClose={hide} data={data} /> : null;
}

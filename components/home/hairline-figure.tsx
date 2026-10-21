"use client";

import { useEffect, useRef } from "react";
import styles from "./home.module.css";

// A hairline figure, mounted the way the hairline bench mounts one, without the bench's
// slider and play button. The files live in public/hairline: kernel.js is the package's
// engine, unchanged; <name>.js is the figure.

type Handle = { set(value: number): void; destroy(): void };
type Read = { textContent: string | null };
type Figure = {
  name: string;
  means: string;
  range: [number, number, number];
  mount(host: { stage: HTMLElement; svg: SVGSVGElement; read: Read }, value: number): Handle;
};
type Kernel = {
  inject(root: Document): void;
  mk(tag: string, attrs: Record<string, string>, parent: Element): SVGSVGElement;
};

const text = (src: string) =>
  fetch(src).then((r) => {
    if (!r.ok) throw new Error(`hairline: ${src} ${r.status}`);
    return r.text();
  });

// The kernel declares `var HL`; run once, in its own scope, and hand its value back.
let kernel: Promise<Kernel> | null = null;
const loadKernel = () =>
  (kernel ??= text("/hairline/kernel.js").then((src) => new Function(`${src}\nreturn HL;`)() as Kernel));

export function HairlineFigure({ name }: { name: string }) {
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = stage.current;
    if (!host) return;
    let handle: Handle | null = null;
    let cancelled = false;

    Promise.all([loadKernel(), text(`/hairline/${name}.js`)])
      .then(([HL, src]) => {
        if (cancelled) return;
        let figure: Figure | null = null;
        // The figure ends by calling hairline({...}); give it HL and that function as arguments.
        new Function("HL", "hairline", src)(HL, (f: Figure) => {
          figure = f;
        });
        if (!figure) return;
        const fig: Figure = figure;
        HL.inject(document);
        host.setAttribute("data-hairline", fig.name);
        host.setAttribute("aria-label", fig.means);
        const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, host);
        // The figure names what is under the pointer here; the page does not show it.
        let current: string | null = null;
        const read: Read = {
          get textContent() {
            return current;
          },
          set textContent(value) {
            current = value == null ? "" : String(value);
          },
        };
        handle = fig.mount({ stage: host, svg, read }, fig.range[1]);
      })
      .catch(() => {
        // Without the figure the close still reads; the space just stays empty.
      });

    return () => {
      cancelled = true;
      handle?.destroy();
      host.replaceChildren();
    };
  }, [name]);

  return (
    <figure className={styles.closeFig}>
      <div ref={stage} role="img" className={styles.closeStage} />
    </figure>
  );
}

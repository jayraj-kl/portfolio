"use client";

import { useRef, useState } from "react";
import { useTheme } from "next-themes";
import { DotBust, type DotBustHandle } from "@/components/home/dot-bust";

// Each model was generated from the same AI-made views of Jayraj's old avatar. An untextured model
// always renders as clay, whatever the toggle says.
const MODELS: {
  src: string;
  name: string;
  note: string;
  rotation: [number, number, number];
  untextured?: boolean;
}[] = [
  {
    src: "/home/bust.glb", // the home hero's model
    name: "Meshy",
    note: "Clay sculpt, simplified from 3.3M to 200k triangles.",
    rotation: [0, 0, 0],
    untextured: true,
  },
  {
    src: "/lab/models/trellis-multi.glb",
    name: "TRELLIS, four views",
    note: "Front, two three-quarter views and a profile.",
    rotation: [0, 0, 0],
  },
  {
    src: "/lab/models/trellis2-front.glb",
    name: "TRELLIS.2, front view",
    note: "Newer model, one image, higher resolution.",
    rotation: [0, 0, 0],
  },
];

export function Avatar3DLab() {
  const busts = useRef<(DotBustHandle | null)[]>([]);
  const [cell, setCell] = useState(6);
  const [raw, setRaw] = useState(false);
  const [look, setLook] = useState<"texture" | "clay">("texture");
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 px-4 py-8 text-foreground">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-medium">3D avatar lab</h1>
          <p className="text-sm text-muted-foreground">
            Drag sideways to turn the bust. Move quickly across it to scramble the dots; tap for a burst.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            Cell
            <input
              type="range"
              min={3}
              max={14}
              step={1}
              value={cell}
              onChange={(e) => setCell(Number(e.target.value))}
            />
            <span className="w-10 tabular-nums">{cell}px</span>
          </label>
          <button
            type="button"
            onClick={() => busts.current.forEach((b) => b?.replay())}
            className="rounded-md border border-border px-3 py-1.5 hover:bg-muted"
          >
            Replay intro
          </button>
          <button
            type="button"
            aria-pressed={look === "clay"}
            onClick={() => setLook((v) => (v === "clay" ? "texture" : "clay"))}
            className="rounded-md border border-border px-3 py-1.5 hover:bg-muted aria-pressed:bg-muted"
          >
            Clay
          </button>
          <button
            type="button"
            aria-pressed={raw}
            onClick={() => setRaw((v) => !v)}
            className="rounded-md border border-border px-3 py-1.5 hover:bg-muted aria-pressed:bg-muted"
          >
            Raw model
          </button>
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="rounded-md border border-border px-3 py-1.5 hover:bg-muted"
          >
            Theme
          </button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MODELS.map((m, i) => (
          <figure key={m.src} className="flex flex-col gap-2">
            <div className="relative aspect-[4/5] w-full cursor-grab overflow-hidden rounded-xl border border-border active:cursor-grabbing">
              <DotBust
                ref={(h) => {
                  busts.current[i] = h;
                }}
                src={m.src}
                cell={cell}
                raw={raw}
                look={m.untextured ? "clay" : look}
                rotation={m.rotation}
                label={`Jayraj's 3D bust as a dot-matrix halftone (${m.name})`}
              />
            </div>
            <figcaption className="text-sm">
              {m.name}
              <span className="block text-muted-foreground">{m.note}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { hostOf, previewSrc } from "@/lib/learn/preview";
import type { TopicLink } from "@/lib/learn/types";
import { cn } from "@/lib/utils";

const CARD_WIDTH = 300;
const IMAGE_HEIGHT = 188;
const CARD_HEIGHT = IMAGE_HEIGHT + 52;
const GAP = 12;
const EDGE = 8;
const SLIDE_MS = 2400;

export type PreviewAnchor = {
  left: number;
  top: number;
  width: number;
  height: number;
};

// A card showing what a topic's links lead to. With several links it cycles through them.
export function LinkPreview({
  links,
  anchor,
}: {
  links: TopicLink[];
  anchor: PreviewAnchor;
}) {
  const [index, setIndex] = useState(0);
  const [missing, setMissing] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    if (links.length < 2) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % links.length),
      SLIDE_MS,
    );
    return () => clearInterval(timer);
  }, [links.length]);

  const link = links[index % links.length];
  if (!link) return null;

  // Below the topic when there is room, otherwise above it.
  const below = anchor.top + anchor.height + GAP;
  const top =
    below + CARD_HEIGHT + EDGE <= window.innerHeight
      ? below
      : Math.max(EDGE, anchor.top - GAP - CARD_HEIGHT);
  const left = Math.min(
    Math.max(EDGE, anchor.left + anchor.width / 2 - CARD_WIDTH / 2),
    window.innerWidth - CARD_WIDTH - EDGE,
  );

  return (
    <div
      aria-hidden="true"
      className="sm-preview pointer-events-none fixed z-30 border border-foreground/30 bg-popover text-popover-foreground"
      style={{ left, top, width: CARD_WIDTH }}
    >
      <div
        className="relative overflow-hidden bg-muted"
        style={{ height: IMAGE_HEIGHT }}
      >
        {links.map((item, i) =>
          missing.has(item.url) ? (
            <div
              key={item.url}
              className={cn(
                "absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-muted-foreground transition-opacity duration-300",
                i === index ? "opacity-100" : "opacity-0",
              )}
            >
              {hostOf(item.url)}
            </div>
          ) : (
            // Local, pre-generated screenshots of arbitrary sites: next/image adds nothing here.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={item.url}
              src={previewSrc(item.url)}
              alt=""
              loading="eager"
              onError={() => setMissing((prev) => new Set(prev).add(item.url))}
              className={cn(
                "absolute inset-0 size-full object-cover object-top transition-opacity duration-300",
                i === index ? "opacity-100" : "opacity-0",
              )}
            />
          ),
        )}
      </div>
      <div className="flex items-center gap-3 border-t border-foreground/15 px-2.5 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{link.label}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {hostOf(link.url)}
          </p>
        </div>
        {links.length > 1 && (
          <div className="flex shrink-0 gap-1">
            {links.map((item, i) => (
              <span
                key={item.url}
                className={cn(
                  "size-1.5",
                  i === index ? "bg-foreground" : "bg-foreground/25",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/learn/types";

// Status is carried by fill as well as colour: empty, half, full.
export function StatusGlyph({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  // Animate only after the status changes, never on first paint.
  const [initial] = useState(status);
  const [changed, setChanged] = useState(false);
  if (!changed && status !== initial) setChanged(true);

  return (
    <span className={cn("relative inline-flex size-3.5 shrink-0", className)}>
      {changed && status === "done" && (
        <span
          key="burst"
          aria-hidden="true"
          className="sm-burst pointer-events-none absolute inset-0 rounded-full"
        />
      )}
      <svg
        key={status}
        viewBox="0 0 16 16"
        aria-hidden="true"
        className={cn("size-full", changed && "sm-pop")}
      >
        {status === "todo" && (
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            strokeWidth="1.5"
            strokeDasharray="2.2 2.5"
            className="stroke-muted-foreground"
          />
        )}
        {status === "doing" && (
          <g className="fill-(--status-doing) stroke-(--status-doing)">
            <circle cx="8" cy="8" r="6" fill="none" strokeWidth="1.5" />
            <path d="M8 2a6 6 0 0 1 0 12Z" stroke="none" />
          </g>
        )}
        {status === "done" && (
          <g>
            <circle cx="8" cy="8" r="6.75" className="fill-(--status-done)" />
            <path
              d="M5 8.3l2 2 4-4.4"
              fill="none"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-background"
            />
          </g>
        )}
      </svg>
    </span>
  );
}

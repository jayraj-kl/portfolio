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
          className="sm-burst pointer-events-none absolute inset-0"
        />
      )}
      <svg
        key={status}
        viewBox="0 0 16 16"
        aria-hidden="true"
        className={cn("size-full", changed && "sm-pop")}
      >
        {status === "todo" && (
          <rect
            x="2.5"
            y="2.5"
            width="11"
            height="11"
            fill="none"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            className="stroke-muted-foreground"
          />
        )}
        {status === "doing" && (
          <g className="fill-(--status-doing) stroke-(--status-doing)">
            <rect
              x="2.5"
              y="2.5"
              width="11"
              height="11"
              fill="none"
              strokeWidth="1.5"
            />
            <rect x="8" y="2.5" width="5.5" height="11" stroke="none" />
          </g>
        )}
        {status === "done" && (
          <g>
            <rect
              x="1.5"
              y="1.5"
              width="13"
              height="13"
              className="fill-(--status-done)"
            />
            <path
              d="M4.6 8.3l2.2 2.2 4.6-4.9"
              fill="none"
              strokeWidth="1.7"
              strokeLinecap="square"
              className="stroke-background"
            />
          </g>
        )}
      </svg>
    </span>
  );
}

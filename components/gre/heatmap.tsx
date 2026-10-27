"use client";

import { useMemo } from "react";
import { DAY_LABELS, MONTH_LABELS } from "@/lib/gre/constants";
import { dateKey } from "@/lib/gre/dates";
import { cn } from "@/lib/utils";

// Level 0 is an empty day; 1 to 4 deepen the done green.
const LEVEL = [
  "bg-muted",
  "bg-(--done)/25",
  "bg-(--done)/50",
  "bg-(--done)/75",
  "bg-(--done)",
];

type Cell = { key: string; level: number } | null;

export function Heatmap({
  today: todayKey,
  data,
  weeks = 20,
}: {
  today: string;
  // YYYY-MM-DD → level 1 to 4.
  data: Record<string, number>;
  weeks?: number;
}) {
  const { columns, months } = useMemo(() => {
    const [y, m, d] = todayKey.split("-").map(Number);
    const today = new Date(y, m - 1, d);
    // Columns are weeks from Sunday; the last one ends on this Saturday.
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() - (weeks - 1) * 7);

    const columns: Cell[][] = [];
    const months: (string | null)[] = [];
    let lastMonth = -1;

    for (let w = 0; w < weeks; w++) {
      const column: Cell[] = [];
      let month: string | null = null;
      for (let d = 0; d < 7; d++) {
        const day = new Date(start);
        day.setDate(start.getDate() + w * 7 + d);
        if (day.getMonth() !== lastMonth) {
          lastMonth = day.getMonth();
          month = MONTH_LABELS[lastMonth];
        }
        const key = dateKey(day);
        column.push(day > today ? null : { key, level: data[key] ?? 0 });
      }
      columns.push(column);
      months.push(month);
    }
    return { columns, months };
  }, [todayKey, data, weeks]);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-grid grid-flow-col grid-rows-[auto_repeat(7,0.75rem)] gap-0.75 font-mono text-[0.625rem] leading-none text-muted-foreground">
        <span />
        {DAY_LABELS.map((label, i) => (
          <span key={i} className="flex items-center pr-1.5">
            {label}
          </span>
        ))}
        {columns.map((column, w) => [
          <span
            key={`m${w}`}
            className="w-3 overflow-visible whitespace-nowrap pb-1"
          >
            {months[w]}
          </span>,
          ...column.map((cell, d) =>
            cell ? (
              <span
                key={cell.key}
                title={`${cell.key}: level ${cell.level}`}
                className={cn("size-3 rounded-[3px]", LEVEL[cell.level])}
              />
            ) : (
              <span key={`${w}-${d}`} className="size-3" />
            ),
          ),
        ])}
      </div>
      <div className="mt-2 flex items-center gap-1 text-[0.625rem] text-muted-foreground">
        Less
        {LEVEL.map((level) => (
          <span key={level} className={cn("size-2.5 rounded-[2px]", level)} />
        ))}
        More
      </div>
    </div>
  );
}

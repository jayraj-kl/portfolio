"use client";

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { Heatmap } from "@/components/gre/heatmap";
import {
  CAMPAIGN_START,
  DONE_DAY,
  MOCK_DAY,
  MOCK_DAYS,
  PHASES,
  TEST_DATES,
} from "@/lib/gre/campaign";
import { addDays, dateKey, daysBetween, formatDayLabel } from "@/lib/gre/dates";
import type {
  Phase,
  ProgressData,
  ScheduleBlock,
  VerbalData,
} from "@/lib/gre/types";
import { cn } from "@/lib/utils";

interface ResolvedDay {
  phase: Phase | null;
  blocks: ScheduleBlock[];
  title: string;
  focus: string;
  isMock: boolean;
}

function resolveDay(date: string): ResolvedDay {
  const phase = PHASES.find((p) => date >= p.start && date <= p.end) ?? null;
  const mockSource = MOCK_DAYS[date];

  if (mockSource) {
    return {
      phase,
      blocks: MOCK_DAY,
      title: "Mock day",
      focus: mockSource,
      isMock: true,
    };
  }
  if (!phase) {
    // Only reachable past the final attempt. Never render an empty day.
    return {
      phase: null,
      blocks: DONE_DAY,
      title: "Campaign complete",
      focus: "Both attempts are behind you. Send whichever score is better.",
      isMock: false,
    };
  }
  return {
    phase,
    blocks: phase.blocks,
    title: phase.name,
    focus: phase.focus,
    isMock: false,
  };
}

// Setup opens long before the campaign, so it has no length and its chip jumps to its end.
function phaseLength(phase: Phase): number | null {
  if (phase.start < CAMPAIGN_START) return null;
  return daysBetween(phase.start, phase.end) + 1;
}

function phaseJumpDate(phase: Phase): string {
  return phase.start < CAMPAIGN_START ? phase.end : phase.start;
}

function nextTestIn(date: string): { label: string; days: number } | null {
  const upcoming = TEST_DATES.find((t) => t >= date);
  if (!upcoming) return null;
  return {
    label: `Attempt #${TEST_DATES.indexOf(upcoming) + 1}`,
    days: daysBetween(date, upcoming),
  };
}

function formatClock(minutes: number): string {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hrs`;
}

// Study load is the emphasis blocks, each measured to the next block's start.
function studyMinutes(blocks: ScheduleBlock[]): number {
  let total = 0;
  for (let i = 0; i < blocks.length - 1; i++) {
    if (blocks[i].emphasis) total += blocks[i + 1].start - blocks[i].start;
  }
  return total;
}

function subscribeToClock(cb: () => void) {
  const id = setInterval(cb, 30_000);
  return () => clearInterval(id);
}

function minutesNow(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function useCurrentBlockIndex(blocks: ScheduleBlock[]): number | null {
  const now = useSyncExternalStore(subscribeToClock, minutesNow, () => null);
  if (now === null) return null;
  let current: number | null = null;
  for (let i = 0; i < blocks.length; i++) {
    if (now >= blocks[i].start) current = i;
  }
  return current;
}

const NAV =
  "gre-press border border-foreground/15 px-2 py-1 text-xs text-muted-foreground hover:border-foreground hover:text-foreground";

function DailySchedule({ today }: { today: string }) {
  const [viewDate, setViewDate] = useState<string | null>(null);
  const shown = viewDate ?? today;
  const isToday = shown === today;
  const offset = daysBetween(today, shown);

  const day = resolveDay(shown);
  const clockIndex = useCurrentBlockIndex(day.blocks);
  // The now marker only means anything on the actual current day.
  const currentIndex = isToday ? clockIndex : null;
  const countdown = nextTestIn(shown);
  const activePhaseIndex = day.phase ? PHASES.indexOf(day.phase) : null;
  const load = studyMinutes(day.blocks);

  // Mock days sit inside a phase, so the counter tracks the phase, not the day type.
  const length = day.phase ? phaseLength(day.phase) : null;
  const dayInPhase =
    day.phase && length !== null
      ? daysBetween(day.phase.start, shown) + 1
      : null;

  return (
    <section className="gre-card p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-lg font-semibold">
          {day.title}
          {day.isMock && day.phase ? ` · ${day.phase.name}` : ""}
          {dayInPhase !== null && (
            <span className="ml-2 font-mono text-xs font-normal tracking-normal text-muted-foreground">
              day {dayInPhase} of {length}
            </span>
          )}
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          {countdown
            ? `${countdown.label} in ${countdown.days} ${countdown.days === 1 ? "day" : "days"}`
            : "Campaign complete"}
          {load > 0 ? ` · ~${formatDuration(load)}` : ""}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-label="Previous day"
          onClick={() => setViewDate(addDays(shown, -1))}
          className={NAV}
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Next day"
          onClick={() => setViewDate(addDays(shown, 1))}
          className={NAV}
        >
          →
        </button>
        <span className="font-mono text-sm">{formatDayLabel(shown)}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {isToday
            ? "today"
            : `${offset > 0 ? "+" : ""}${offset} ${Math.abs(offset) === 1 ? "day" : "days"}`}
        </span>
        {!isToday && (
          <button
            type="button"
            onClick={() => setViewDate(null)}
            className={NAV}
          >
            Today
          </button>
        )}
      </div>

      <p className="mt-3 text-sm">{day.focus}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {PHASES.map((phase, index) => {
          const isActive = activePhaseIndex === index;
          const isPast = activePhaseIndex !== null && index < activePhaseIndex;
          const phaseDays = phaseLength(phase);
          return (
            <button
              key={`${phase.id}-${phase.start}`}
              type="button"
              aria-pressed={isActive}
              onClick={() => setViewDate(phaseJumpDate(phase))}
              title={`${phase.focus} (jump to ${formatDayLabel(phaseJumpDate(phase))})`}
              className={cn(
                "gre-press border px-2 py-1 text-xs whitespace-nowrap",
                isActive
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/15 hover:border-foreground hover:text-foreground",
                !isActive &&
                  (isPast
                    ? "text-muted-foreground/60"
                    : "text-muted-foreground"),
              )}
            >
              {phase.name}
              {phaseDays !== null && (
                <span className="ml-1 font-mono opacity-60">{phaseDays}d</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="w-2 py-2 pr-2" aria-label="Current block" />
              <th className="py-2 pr-4 font-medium whitespace-nowrap">Time</th>
              <th className="py-2 pr-4 font-medium whitespace-nowrap">
                Duration
              </th>
              <th className="py-2 font-medium">Activity</th>
            </tr>
          </thead>
          <tbody>
            {day.blocks.map((block, index) => {
              const next = day.blocks[index + 1];
              const isCurrent = currentIndex === index;
              const isPast = currentIndex !== null && index < currentIndex;
              return (
                <tr
                  key={block.start}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    isCurrent && "bg-muted",
                  )}
                >
                  <td className="py-2 pr-2 align-top">
                    <span
                      className={cn(
                        "mt-0.5 block h-4 w-1 rounded-full",
                        isCurrent
                          ? "bg-foreground"
                          : isPast
                            ? "bg-foreground/15"
                            : "bg-transparent",
                      )}
                    />
                  </td>
                  <td
                    className={cn(
                      "py-2 pr-4 align-top font-mono text-xs leading-5 whitespace-nowrap",
                      isCurrent ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {next
                      ? `${formatClock(block.start)} – ${formatClock(next.start)}`
                      : formatClock(block.start)}
                  </td>
                  <td className="py-2 pr-4 align-top font-mono text-xs leading-5 whitespace-nowrap text-muted-foreground">
                    {next ? formatDuration(next.start - block.start) : "—"}
                  </td>
                  <td
                    className={cn(
                      "py-2 align-top",
                      block.emphasis || isCurrent
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                      isPast && "opacity-50",
                    )}
                  >
                    {block.activity}
                    {isCurrent && (
                      <span className="ml-2 rounded-full bg-foreground px-1.5 py-0.5 align-middle font-mono text-[0.625rem] text-background">
                        NOW
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatCard({
  label,
  meta,
  children,
}: {
  label: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <div className="gre-card p-4 sm:p-5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-2">{children}</div>
      <p className="mt-2 text-xs text-muted-foreground">{meta}</p>
    </div>
  );
}

function BigNumber({
  value,
  unit,
  done,
}: {
  value: number;
  unit: string;
  done?: boolean;
}) {
  return (
    <p className="flex items-baseline gap-1.5">
      <span
        className={cn(
          "gre-display text-4xl font-semibold",
          done && "text-(--done)",
        )}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{unit}</span>
    </p>
  );
}

function HeatmapPanel({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <section className="gre-card min-w-0 p-4 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {meta && <span className="text-xs text-muted-foreground">{meta}</span>}
      </div>
      {children}
    </section>
  );
}

export function Dashboard({
  today,
  progress,
  verbalData,
}: {
  today: string;
  progress: ProgressData;
  verbalData: VerbalData;
}) {
  const totalWords = Object.values(verbalData.textCompletion).reduce(
    (sum, words) => sum + words.length,
    0,
  );
  const todayVerbal = progress.verbal[today]?.length ?? 0;
  const todayQuant = progress.quant[today] ?? false;

  const streak = useMemo(() => {
    const [y, m, d] = today.split("-").map(Number);
    const day = new Date(y, m - 1, d);
    let count = 0;
    for (;;) {
      const key = dateKey(day);
      if ((progress.verbal[key]?.length ?? 0) === 0 && !progress.quant[key])
        break;
      count++;
      day.setDate(day.getDate() - 1);
    }
    return count;
  }, [today, progress]);

  const { overall, verbal, quant } = useMemo(() => {
    const verbalLevel = (count: number) => {
      if (totalWords === 0) return 2;
      const ratio = count / totalWords;
      return ratio >= 1 ? 4 : ratio >= 0.75 ? 3 : ratio >= 0.5 ? 2 : 1;
    };

    const overall: Record<string, number> = {};
    const verbal: Record<string, number> = {};
    const quant: Record<string, number> = {};
    const dates = new Set([
      ...Object.keys(progress.verbal),
      ...Object.keys(progress.quant),
    ]);

    for (const date of dates) {
      const count = progress.verbal[date]?.length ?? 0;
      const practiced = progress.quant[date] ?? false;
      if (count > 0) verbal[date] = verbalLevel(count);
      if (practiced) quant[date] = 4;

      // Overall: verbal coverage out of three, plus one for quant.
      let level = 0;
      if (count > 0) {
        const ratio = totalWords > 0 ? count / totalWords : 0.5;
        level = ratio >= 1 ? 3 : ratio >= 0.5 ? 2 : 1;
      }
      if (practiced) level = Math.min(level + 1, 4);
      if (level > 0) overall[date] = level;
    }
    return { overall, verbal, quant };
  }, [progress, totalWords]);

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <DailySchedule today={today} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Current streak" meta="Consecutive study days">
          <BigNumber
            value={streak}
            unit={streak === 1 ? "day" : "days"}
            done={streak > 0}
          />
        </StatCard>

        <StatCard label="Today" meta="What is recorded for today">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Verbal</dt>
            <dd className={cn("font-mono", todayVerbal > 0 && "text-(--done)")}>
              {todayVerbal}/{totalWords}
            </dd>
            <dt className="text-muted-foreground">Quant</dt>
            <dd
              className={cn(
                "font-mono",
                todayQuant ? "text-(--done)" : "text-muted-foreground",
              )}
            >
              {todayQuant ? "✓" : "—"}
            </dd>
          </dl>
        </StatCard>

        <StatCard label="Library" meta="Text completion entries in the deck">
          <BigNumber value={totalWords} unit="words" />
        </StatCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <HeatmapPanel title="Overall activity" meta="last 20 weeks">
          <Heatmap today={today} data={overall} />
        </HeatmapPanel>
        <div className="grid min-w-0 gap-4">
          <HeatmapPanel title="Verbal">
            <Heatmap today={today} data={verbal} />
          </HeatmapPanel>
          <HeatmapPanel title="Quant">
            <Heatmap today={today} data={quant} />
          </HeatmapPanel>
        </div>
      </div>
    </div>
  );
}

"use client";

import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { MapCanvas } from "@/components/learn/map-canvas";
import { StatusGlyph } from "@/components/learn/status-glyph";
import { TopicList } from "@/components/learn/topic-list";
import { TopicPanel } from "@/components/learn/topic-panel";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useStudyMap } from "@/hooks/use-study-map";
import { ANIMATION_THEME_TOGGLER_DURATION, METADATA } from "@/lib/constants";
import {
  STATUS_LABEL,
  STATUS_ORDER,
  computeProgress,
  defaultCollapsed,
  getRoot,
  indexChildren,
} from "@/lib/learn/tree";
import { cn } from "@/lib/utils";

type View = "map" | "list";

export function StudyMap() {
  const { map, actions } = useStudyMap();
  const [view, setView] = useState<View>("map");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [collapsedOverride, setCollapsedOverride] =
    useState<ReadonlySet<string> | null>(null);

  const derived = useMemo(() => {
    if (!map) return null;
    return {
      root: getRoot(map),
      childIndex: indexChildren(map),
      progress: computeProgress(map),
      initialCollapsed: defaultCollapsed(map),
    };
  }, [map]);

  const collapsed = collapsedOverride ?? derived?.initialCollapsed;

  const setOpen = useCallback(
    (id: string, open: boolean | "toggle") => {
      if (!collapsed) return;
      const next = new Set(collapsed);
      const shouldOpen = open === "toggle" ? next.has(id) : open;
      if (shouldOpen) next.delete(id);
      else next.add(id);
      setCollapsedOverride(next);
    },
    [collapsed],
  );

  const toggle = useCallback((id: string) => setOpen(id, "toggle"), [setOpen]);

  const addChild = useCallback(
    (parentId: string) => {
      setOpen(parentId, true);
      setSelectedId(actions.addTopic(parentId));
    },
    [actions, setOpen],
  );

  const reset = async () => {
    if (
      !window.confirm(
        "Replace the map with the sample? Your changes in this browser will be lost.",
      )
    ) {
      return;
    }
    setSelectedId(null);
    setCollapsedOverride(null);
    await actions.reset();
  };

  const selected =
    map && selectedId
      ? (map.topics.find((topic) => topic.id === selectedId) ?? null)
      : null;
  const overall = derived?.progress.get(derived.root.id);

  return (
    <div className="study-map fixed inset-0 flex flex-col bg-background">
      <header className="relative z-10 flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-4 pt-4 pb-2 md:absolute md:inset-x-0 md:top-0 md:px-6 md:pt-5">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <IconArrowLeft className="size-3.5" />
            {METADATA.title}
          </Link>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">
            Study map
          </h1>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {STATUS_ORDER.map((status) => (
              <li key={status} className="flex items-center gap-1.5">
                <StatusGlyph status={status} />
                {STATUS_LABEL[status]}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="View"
            className="flex rounded-lg bg-muted p-1 text-sm"
          >
            {(["map", "list"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                onClick={() => setView(option)}
                className={cn(
                  "sm-press rounded-md px-3 py-1 font-medium text-muted-foreground capitalize",
                  view === option && "bg-background text-foreground shadow-sm",
                )}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={reset}
            className="sm-press rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Reset to sample
          </button>
          <div className="size-8 p-1.5 text-muted-foreground hover:text-foreground">
            <AnimatedThemeToggler
              aria-label="Switch between light and dark"
              duration={ANIMATION_THEME_TOGGLER_DURATION}
            />
          </div>
        </div>
      </header>

      <main className="relative min-h-0 flex-1">
        {map && derived && collapsed && (
          <>
            {view === "map" ? (
              <MapCanvas
                map={map}
                progress={derived.progress}
                collapsed={collapsed}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onToggle={toggle}
                onAdd={addChild}
              />
            ) : (
              <div className="h-full overflow-y-auto pt-2 md:pt-36">
                {overall && (
                  <p className="mx-auto mb-2 w-full max-w-2xl px-6 text-sm text-muted-foreground tabular-nums">
                    {overall.done} of {overall.total} topics studied
                  </p>
                )}
                <TopicList
                  root={derived.root}
                  childIndex={derived.childIndex}
                  progress={derived.progress}
                  collapsed={collapsed}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onToggle={toggle}
                  onStatusChange={(id, status) =>
                    actions.patchTopic(id, { status })
                  }
                />
              </div>
            )}

            {selected && (
              <TopicPanel
                topic={selected}
                progress={
                  derived.progress.get(selected.id) ?? {
                    done: 0,
                    total: 1,
                    status: selected.status,
                  }
                }
                hasChildren={derived.childIndex.has(selected.id)}
                isRoot={selected.parentId === null}
                actions={actions}
                onTopicsAdded={(parentId) => setOpen(parentId, true)}
                onClose={() => setSelectedId(null)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

"use client";

import { IconArrowLeft, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { MapCanvas } from "@/components/learn/map-canvas";
import { StatusGlyph } from "@/components/learn/status-glyph";
import { RingCursor } from "@/components/learn/ring-cursor";
import { TopicList } from "@/components/learn/topic-list";
import { TopicPanel } from "@/components/learn/topic-panel";
import { TopicSearch } from "@/components/learn/topic-search";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useStudyLibrary } from "@/hooks/use-study-map";
import { ANIMATION_THEME_TOGGLER_DURATION, METADATA } from "@/lib/constants";
import {
  STATUS_LABEL,
  STATUS_ORDER,
  computeProgress,
  defaultCollapsed,
  getRoot,
  indexChildren,
  type ChildIndex,
} from "@/lib/learn/tree";
import type { Progress, Topic } from "@/lib/learn/types";
import { cn } from "@/lib/utils";

type View = "map" | "list";

const CHIP =
  "sm-press sm-chip shrink-0 border px-3 py-1 text-sm font-medium whitespace-nowrap";

export function StudyMap() {
  const { library, actions } = useStudyLibrary();
  const [view, setView] = useState<View>("map");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeMapId, setActiveMapId] = useState<string | null>(null);
  const [collapsedOverride, setCollapsedOverride] =
    useState<ReadonlySet<string> | null>(null);
  // The topic last reached through search. The counter makes repeat visits replay the flight.
  const [focus, setFocus] = useState<{ id: string; token: number } | null>(
    null,
  );

  // Topic ids are unique across maps, so every map shares these lookups.
  const derived = useMemo(() => {
    if (!library) return null;
    const topics = new Map<string, Topic>();
    const childIndex: ChildIndex = new Map();
    const progress = new Map<string, Progress>();
    const initialCollapsed = new Set<string>();
    const roots: Topic[] = [];

    for (const map of library.maps) {
      roots.push(getRoot(map));
      for (const topic of map.topics) topics.set(topic.id, topic);
      for (const [id, kids] of indexChildren(map)) {
        if (id !== null) childIndex.set(id, kids);
      }
      for (const [id, value] of computeProgress(map)) progress.set(id, value);
      for (const id of defaultCollapsed(map)) initialCollapsed.add(id);
    }

    return { topics, childIndex, progress, initialCollapsed, roots };
  }, [library]);

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

  const activate = useCallback((mapId: string | null) => {
    setActiveMapId(mapId);
    setSelectedId(null);
  }, []);

  // Opens the topic's map and every branch above it, then flies to the topic.
  const goToTopic = (id: string) => {
    if (!derived || !collapsed) return;
    const next = new Set(collapsed);
    let rootId = id;
    for (
      let parent = derived.topics.get(id)?.parentId;
      parent;
      parent = derived.topics.get(parent)?.parentId
    ) {
      next.delete(parent);
      rootId = parent;
    }
    setCollapsedOverride(next);
    setView("map");
    setActiveMapId(rootId);
    setSelectedId(id);
    setFocus((current) => ({ id, token: (current?.token ?? 0) + 1 }));
  };

  const addMap = () => {
    const id = actions.addMap();
    setActiveMapId(id);
    // Open the details straight away so the new map can be named.
    setSelectedId(id);
  };

  const reset = async () => {
    if (
      !window.confirm(
        "Replace everything with the sample maps? Your changes in this browser will be lost.",
      )
    ) {
      return;
    }
    setSelectedId(null);
    setActiveMapId(null);
    setCollapsedOverride(null);
    await actions.reset();
  };

  const selected = (selectedId && derived?.topics.get(selectedId)) || null;
  const canDeleteMap = (library?.maps.length ?? 0) > 1;

  return (
    <>
      <div className="study-map fixed inset-0 flex flex-col bg-background">
        <header className="sm-navbar relative z-20 border-b border-foreground/15 bg-background/55 backdrop-blur-md md:absolute md:inset-x-0 md:top-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 pt-3 pb-2 md:px-6">
            <div className="flex min-w-0 items-baseline gap-3">
              <h1 className="text-lg font-semibold tracking-tight whitespace-nowrap">
                Study maps
              </h1>
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs whitespace-nowrap text-muted-foreground hover:text-foreground"
              >
                <IconArrowLeft className="size-3" />
                {METADATA.title}
              </Link>
            </div>

            {derived && (
              <TopicSearch
                topics={derived.topics}
                onPick={goToTopic}
                className="order-last w-full md:order-none md:mx-auto md:w-96"
              />
            )}

            <div className="ml-auto flex items-center gap-2">
              <div
                role="group"
                aria-label="View"
                className="flex bg-muted p-1 text-sm"
              >
                {(["map", "list"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={view === option}
                    onClick={() => setView(option)}
                    className={cn(
                      "sm-press px-3 py-1 font-medium text-muted-foreground capitalize",
                      view === option &&
                        "bg-background text-foreground shadow-sm",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={reset}
                className="sm-press px-2.5 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
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
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 pb-2.5 md:px-6">
            {derived && view === "map" && (
              <nav
                aria-label="Maps"
                className="-mx-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-1 py-1"
              >
                <button
                  type="button"
                  aria-pressed={activeMapId === null}
                  onClick={() => activate(null)}
                  className={cn(
                    CHIP,
                    activeMapId === null
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground/15 bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  All maps
                </button>
                {derived.roots.map((root) => (
                  <button
                    key={root.id}
                    type="button"
                    aria-pressed={activeMapId === root.id}
                    onClick={() => activate(root.id)}
                    className={cn(
                      CHIP,
                      activeMapId === root.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-foreground/15 bg-background text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {root.title || "Untitled"}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={addMap}
                  className={cn(
                    CHIP,
                    "flex items-center gap-1 border-dashed border-foreground/30 bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  <IconPlus className="size-3.5" />
                  New map
                </button>
              </nav>
            )}
            <ul className="ml-auto flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {STATUS_ORDER.map((status) => (
                <li key={status} className="flex items-center gap-1.5">
                  <StatusGlyph status={status} />
                  {STATUS_LABEL[status]}
                </li>
              ))}
            </ul>
          </div>
        </header>

        <main className="relative min-h-0 flex-1">
          {library && derived && collapsed && (
            <>
              {view === "map" ? (
                <MapCanvas
                  maps={library.maps}
                  topics={derived.topics}
                  childIndex={derived.childIndex}
                  progress={derived.progress}
                  collapsed={collapsed}
                  selectedId={selectedId}
                  activeMapId={activeMapId}
                  focus={focus}
                  onSelect={setSelectedId}
                  onToggle={toggle}
                  onAdd={addChild}
                  onActivate={activate}
                />
              ) : (
                <div className="flex h-full flex-col gap-6 overflow-y-auto pt-2 pb-24 md:pt-36">
                  {derived.roots.map((root) => (
                    <TopicList
                      key={root.id}
                      root={root}
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
                  ))}
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
                  onDeleteMap={
                    canDeleteMap
                      ? () => {
                          actions.removeMap(selected.id);
                          setActiveMapId(null);
                        }
                      : undefined
                  }
                  onClose={() => setSelectedId(null)}
                />
              )}
            </>
          )}
        </main>
      </div>
      <RingCursor scope=".study-map" />
    </>
  );
}

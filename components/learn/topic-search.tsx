"use client";

import { IconSearch } from "@tabler/icons-react";
import { useId, useMemo, useState } from "react";
import type { Topic } from "@/lib/learn/types";
import { cn } from "@/lib/utils";

const MAX_RESULTS = 8;

type Result = { topic: Topic; path: string };

// Finds topics by title or by the name of a resource attached to them.
export function TopicSearch({
  topics,
  onPick,
  className,
}: {
  topics: Map<string, Topic>;
  onPick: (id: string) => void;
  className?: string;
}) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];

    const pathOf = (topic: Topic) => {
      const parts: string[] = [];
      for (
        let parent = topic.parentId ? topics.get(topic.parentId) : undefined;
        parent;
        parent = parent.parentId ? topics.get(parent.parentId) : undefined
      ) {
        parts.unshift(parent.title);
      }
      return parts.join(" › ");
    };

    const ranked: { topic: Topic; rank: number }[] = [];
    for (const topic of topics.values()) {
      const title = topic.title.toLowerCase();
      const at = title.indexOf(needle);
      if (at === 0) ranked.push({ topic, rank: 0 });
      else if (at > 0) ranked.push({ topic, rank: 1 });
      else if (
        topic.links.some((link) => link.label.toLowerCase().includes(needle))
      ) {
        ranked.push({ topic, rank: 2 });
      }
    }

    return ranked
      .sort(
        (a, b) =>
          a.rank - b.rank || a.topic.title.length - b.topic.title.length,
      )
      .slice(0, MAX_RESULTS)
      .map(({ topic }): Result => ({ topic, path: pathOf(topic) }));
  }, [query, topics]);

  const showList = open && query.trim() !== "";

  const pick = (result: Result | undefined) => {
    if (!result) return;
    onPick(result.topic.id);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <IconSearch
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        role="combobox"
        aria-label="Search topics"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={
          showList && results[active] ? `${listId}-${active}` : undefined
        }
        autoComplete="off"
        placeholder="Search topics"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((i) => Math.min(i + 1, results.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (event.key === "Enter") {
            event.preventDefault();
            pick(results[active]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        className="h-9 w-full border border-foreground/25 bg-background/70 pr-3 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-foreground/60 [&::-webkit-search-cancel-button]:hidden"
      />

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Matching topics"
          className="sm-search-results absolute inset-x-0 top-full z-40 mt-1.5 border border-foreground/25 bg-popover text-popover-foreground"
        >
          {results.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              No topics match &ldquo;{query.trim()}&rdquo;
            </li>
          )}
          {results.map((result, index) => (
            <li
              key={result.topic.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              // Keeps focus in the input so the click lands before the list closes.
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => pick(result)}
              onPointerEnter={() => setActive(index)}
              className={cn(
                "flex flex-col gap-0.5 px-3 py-1.5",
                index === active && "bg-accent",
              )}
            >
              <span className="truncate text-sm">{result.topic.title}</span>
              {result.path && (
                <span className="truncate text-[11px] text-muted-foreground">
                  {result.path}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

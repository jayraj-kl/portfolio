"use client";

import { IconChevronRight } from "@tabler/icons-react";
import { StatusGlyph } from "@/components/learn/status-glyph";
import { STATUS_LABEL, nextStatus, type ChildIndex } from "@/lib/learn/tree";
import type { Progress, Status, Topic } from "@/lib/learn/types";
import { cn } from "@/lib/utils";

type TopicListProps = {
  root: Topic;
  childIndex: ChildIndex;
  progress: Map<string, Progress>;
  collapsed: ReadonlySet<string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
};

export function TopicList(props: TopicListProps) {
  return (
    <ul className="mx-auto w-full max-w-2xl px-4">
      <TopicRow {...props} topic={props.root} depth={0} />
    </ul>
  );
}

function TopicRow({
  topic,
  depth,
  ...props
}: TopicListProps & { topic: Topic; depth: number }) {
  const { childIndex, progress, collapsed, selectedId } = props;
  const kids = childIndex.get(topic.id) ?? [];
  const hasChildren = kids.length > 0;
  // The centre topic always stays open in the list.
  const open = depth === 0 || !collapsed.has(topic.id);
  const p = progress.get(topic.id) ?? {
    done: 0,
    total: 1,
    status: topic.status,
  };

  return (
    <li>
      <div
        className={cn(
          "flex min-h-11 items-center gap-1 rounded-lg pr-2",
          selectedId === topic.id && "bg-accent",
        )}
        style={{ paddingLeft: depth * 20 }}
      >
        {hasChildren && depth > 0 ? (
          <button
            type="button"
            aria-label={
              open
                ? `Hide subtopics of ${topic.title}`
                : `Show subtopics of ${topic.title}`
            }
            aria-expanded={open}
            onClick={() => props.onToggle(topic.id)}
            className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          >
            <IconChevronRight
              className={cn("size-4 transition-transform", open && "rotate-90")}
            />
          </button>
        ) : (
          <span className="size-9 shrink-0" />
        )}

        {hasChildren ? (
          <span className="flex size-9 shrink-0 items-center justify-center">
            <StatusGlyph status={p.status} className="size-4" />
          </span>
        ) : (
          <button
            type="button"
            aria-label={`${topic.title}: ${STATUS_LABEL[p.status]}. Change to ${STATUS_LABEL[nextStatus(p.status)]}`}
            onClick={() => props.onStatusChange(topic.id, nextStatus(p.status))}
            className="sm-press flex size-9 shrink-0 items-center justify-center rounded-md hover:bg-foreground/10"
          >
            <StatusGlyph status={p.status} className="size-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => props.onSelect(topic.id)}
          className={cn(
            "min-w-0 flex-1 py-2 text-left text-sm",
            depth === 0 && "text-base font-semibold",
            depth === 1 && "font-medium",
            p.status === "done" && !hasChildren && "text-muted-foreground",
          )}
        >
          {topic.title}
        </button>

        {hasChildren && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {p.done}/{p.total}
          </span>
        )}
      </div>

      {hasChildren && open && (
        <ul>
          {kids.map((kid) => (
            <TopicRow key={kid.id} {...props} topic={kid} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

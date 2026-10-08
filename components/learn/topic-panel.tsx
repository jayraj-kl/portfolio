"use client";

import { IconTrash, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { StatusGlyph } from "@/components/learn/status-glyph";
import type { StudyMapActions } from "@/hooks/use-study-map";
import { STATUS_LABEL, STATUS_ORDER } from "@/lib/learn/tree";
import type { Progress, Topic } from "@/lib/learn/types";
import { cn } from "@/lib/utils";

const FIELD =
  "w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40";
const LABEL = "mb-1.5 block text-xs font-medium text-muted-foreground";
const BUTTON =
  "sm-press rounded-md border border-input px-2.5 py-1.5 text-sm font-medium hover:bg-accent disabled:opacity-40 disabled:hover:bg-transparent";

type TopicPanelProps = {
  topic: Topic;
  progress: Progress;
  hasChildren: boolean;
  isRoot: boolean;
  actions: StudyMapActions;
  onTopicsAdded: (parentId: string) => void;
  onClose: () => void;
};

export function TopicPanel(props: TopicPanelProps) {
  return (
    <aside
      aria-label="Topic details"
      className="sm-panel absolute inset-x-0 bottom-0 z-20 flex max-h-[62dvh] flex-col rounded-t-2xl border border-border bg-card text-card-foreground shadow-xl md:inset-x-auto md:top-4 md:right-4 md:bottom-4 md:max-h-none md:w-88 md:rounded-xl"
    >
      <PanelBody key={props.topic.id} {...props} />
    </aside>
  );
}

function PanelBody({
  topic,
  progress,
  hasChildren,
  isRoot,
  actions,
  onTopicsAdded,
  onClose,
}: TopicPanelProps) {
  const [outline, setOutline] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const addLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    actions.patchTopic(topic.id, {
      links: [...topic.links, { label: linkLabel.trim() || url, url }],
    });
    setLinkLabel("");
    setLinkUrl("");
  };

  const addOutline = () => {
    if (actions.addOutline(topic.id, outline) > 0) {
      setOutline("");
      onTopicsAdded(topic.id);
    }
  };

  return (
    <>
      <div className="flex items-start gap-2 p-4 pb-3">
        <input
          aria-label="Topic title"
          value={topic.title}
          onChange={(event) =>
            actions.patchTopic(topic.id, { title: event.target.value })
          }
          className="min-w-0 flex-1 rounded-md bg-transparent px-1 py-0.5 text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />
        <button
          type="button"
          aria-label="Close details"
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <IconX className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
        <section>
          <span className={LABEL}>Status</span>
          {hasChildren ? (
            <p className="flex items-center gap-2 text-sm">
              <StatusGlyph status={progress.status} />
              <span>
                {progress.done} of {progress.total} subtopics studied
              </span>
            </p>
          ) : (
            <div
              role="radiogroup"
              aria-label="Status"
              className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1"
            >
              {STATUS_ORDER.map((status) => (
                <button
                  key={status}
                  type="button"
                  role="radio"
                  aria-checked={topic.status === status}
                  onClick={() => actions.patchTopic(topic.id, { status })}
                  className={cn(
                    "sm-press flex items-center justify-center gap-1.5 rounded-md px-1 py-1.5 text-xs font-medium text-muted-foreground",
                    topic.status === status &&
                      "bg-background text-foreground shadow-sm",
                  )}
                >
                  <StatusGlyph status={status} />
                  {STATUS_LABEL[status]}
                </button>
              ))}
            </div>
          )}
          {hasChildren && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              This follows its subtopics. Mark those to change it.
            </p>
          )}
        </section>

        <section>
          <label htmlFor="topic-notes" className={LABEL}>
            Notes
          </label>
          <textarea
            id="topic-notes"
            rows={4}
            value={topic.notes}
            onChange={(event) =>
              actions.patchTopic(topic.id, { notes: event.target.value })
            }
            placeholder="What to remember about this topic"
            className={cn(FIELD, "resize-y")}
          />
        </section>

        <section>
          <span className={LABEL}>Links</span>
          {topic.links.length > 0 && (
            <ul className="mb-2 flex flex-col gap-1">
              {topic.links.map((link, index) => (
                <li key={`${link.url}-${index}`} className="flex items-center gap-1">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 flex-1 truncate text-sm underline underline-offset-4 hover:text-(--status-done)"
                  >
                    {link.label}
                  </a>
                  <button
                    type="button"
                    aria-label={`Remove link ${link.label}`}
                    onClick={() =>
                      actions.patchTopic(topic.id, {
                        links: topic.links.filter((_, i) => i !== index),
                      })
                    }
                    className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <IconX className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form
            className="flex flex-col gap-1.5"
            onSubmit={(event) => {
              event.preventDefault();
              addLink();
            }}
          >
            <input
              aria-label="Link name"
              value={linkLabel}
              onChange={(event) => setLinkLabel(event.target.value)}
              placeholder="Name"
              className={FIELD}
            />
            <div className="flex gap-1.5">
              <input
                aria-label="Link address"
                type="url"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="https://"
                className={FIELD}
              />
              <button
                type="submit"
                disabled={!linkUrl.trim()}
                className={cn(BUTTON, "shrink-0")}
              >
                Add link
              </button>
            </div>
          </form>
        </section>

        <section>
          <label htmlFor="topic-outline" className={LABEL}>
            Add subtopics
          </label>
          <textarea
            id="topic-outline"
            rows={5}
            value={outline}
            onChange={(event) => setOutline(event.target.value)}
            placeholder={"One topic per line\n  Indent a line to nest it\n  Like this"}
            className={cn(FIELD, "resize-y font-mono text-[13px]")}
          />
          <button
            type="button"
            onClick={addOutline}
            disabled={!outline.trim()}
            className={cn(BUTTON, "mt-1.5")}
          >
            Add subtopics
          </button>
        </section>

        {!isRoot && (
          <button
            type="button"
            onClick={() => {
              const warning = hasChildren
                ? `Delete "${topic.title}" and all its subtopics?`
                : `Delete "${topic.title}"?`;
              if (window.confirm(warning)) {
                actions.removeTopic(topic.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 self-start rounded-md px-1 py-1 text-sm text-destructive hover:underline"
          >
            <IconTrash className="size-4" />
            Delete topic
          </button>
        )}
      </div>
    </>
  );
}

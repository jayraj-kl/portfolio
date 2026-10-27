"use client";

import { useState } from "react";
import { CheckBox } from "@/components/gre/check-box";
import { TC_CATEGORIES, VERBAL_TABS } from "@/lib/gre/constants";
import { highlightSentence } from "@/lib/gre/highlight-sentence";
import type {
  TextCompletionCategory,
  VerbalData,
  VerbalTab,
  Word,
} from "@/lib/gre/types";
import { cn } from "@/lib/utils";

const CHIP =
  "gre-press shrink-0 border px-2.5 py-1 text-xs font-medium whitespace-nowrap";

export function VerbalScreen({
  verbalData,
  reviewed,
  onToggleWord,
}: {
  verbalData: VerbalData;
  // The IDs of the words reviewed today.
  reviewed: string[];
  onToggleWord: (wordId: string) => void;
}) {
  const [verbalTab, setVerbalTab] = useState<VerbalTab>("text-completion");
  const [category, setCategory] = useState<TextCompletionCategory>(
    TC_CATEGORIES[0].key,
  );

  return (
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-label="Section"
        className="flex bg-muted p-1 text-sm"
      >
        {VERBAL_TABS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={verbalTab === option.id}
            onClick={() => setVerbalTab(option.id)}
            className={cn(
              "gre-press flex-1 px-3 py-1 font-medium text-muted-foreground hover:text-foreground",
              verbalTab === option.id &&
                "bg-background text-foreground shadow-sm",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {verbalTab === "text-completion" && (
        <>
          <nav
            aria-label="Categories"
            className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none]"
            onWheel={(e) => {
              if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            {TC_CATEGORIES.map((option) => (
              <button
                key={option.key}
                type="button"
                aria-pressed={category === option.key}
                onClick={() => setCategory(option.key)}
                className={cn(
                  CHIP,
                  category === option.key
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/15 bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </nav>

          <WordList
            words={verbalData.textCompletion[category] ?? []}
            reviewed={reviewed}
            onToggleWord={onToggleWord}
          />
        </>
      )}

      {verbalTab === "sentence-equivalence" && (
        <div className="grid min-h-48 place-items-center rounded-(--r-card) border border-dashed border-border text-sm text-muted-foreground">
          Sentence Equivalence is still to come.
        </div>
      )}
    </div>
  );
}

function WordList({
  words,
  reviewed,
  onToggleWord,
}: {
  words: Word[];
  reviewed: string[];
  onToggleWord: (wordId: string) => void;
}) {
  if (words.length === 0) {
    return (
      <p className="gre-card p-4 text-sm text-muted-foreground">
        No words yet. Add entries to{" "}
        <code className="font-mono text-foreground">
          data/gre/text-completion.json
        </code>
        .
      </p>
    );
  }

  const done = words.filter((w) => reviewed.includes(w.id)).length;

  return (
    <div className="flex flex-col gap-2">
      <p className="self-end text-xs text-muted-foreground">
        <span
          className={cn(
            "font-mono",
            done === words.length ? "text-(--done)" : "text-foreground",
          )}
        >
          {done}/{words.length}
        </span>{" "}
        reviewed today
      </p>

      <div className="gre-card overflow-hidden">
        <div className="hidden items-center gap-3 border-b border-border bg-muted px-3 py-2 text-xs font-medium text-muted-foreground sm:flex">
          <span className="w-5" />
          <span className="w-40">Word</span>
          <span className="flex-1">Example</span>
        </div>

        {words.map((word) => {
          const checked = reviewed.includes(word.id);
          return (
            <label
              key={word.id}
              className="flex cursor-pointer flex-wrap items-start gap-x-3 gap-y-1 border-b border-border px-3 py-2.5 transition-colors last:border-b-0 hover:bg-accent/60 sm:flex-nowrap"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleWord(word.id)}
                className="peer sr-only"
              />
              <CheckBox
                checked={checked}
                className="mt-0.5 size-4 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background"
              />
              <span className="w-40 text-sm font-medium">{word.word}</span>
              <span className="basis-full pl-7 text-sm leading-relaxed text-muted-foreground sm:basis-auto sm:flex-1 sm:pl-0">
                {highlightSentence(
                  word.sentence,
                  word.word,
                  word.idea1,
                  word.idea2,
                )}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

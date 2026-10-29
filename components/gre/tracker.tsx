"use client";

import { useState } from "react";
import { setQuantPracticed, setReviewedWords } from "@/app/gre/actions";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Dashboard } from "@/components/gre/dashboard";
import { QuantScreen } from "@/components/gre/quant-screen";
import { VerbalScreen } from "@/components/gre/verbal-screen";
import { ANIMATION_THEME_TOGGLER_DURATION } from "@/lib/constants";
import { useToday } from "@/hooks/use-today";
import { TABS } from "@/lib/gre/constants";
import type { ProgressData, Tab, VerbalData } from "@/lib/gre/types";
import { cn } from "@/lib/utils";

export function GreTracker({
  initialProgress,
  verbalData,
}: {
  initialProgress: ProgressData;
  verbalData: VerbalData;
}) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [progress, setProgress] = useState(initialProgress);
  const today = useToday();

  // Each change shows at once and saves only its own day; a failed save puts that day back.
  const toggleWord = (today: string, wordId: string) => {
    const before = progress.verbal[today] ?? [];
    const after = before.includes(wordId)
      ? before.filter((id) => id !== wordId)
      : [...before, wordId];
    const put = (ids: string[]) =>
      setProgress((p) => ({ ...p, verbal: { ...p.verbal, [today]: ids } }));

    put(after);
    setReviewedWords(today, after).catch((error) => {
      console.error("Could not save the verbal review:", error);
      put(before);
    });
  };

  const toggleQuant = (today: string) => {
    const before = progress.quant[today] ?? false;
    const put = (done: boolean) =>
      setProgress((p) => ({ ...p, quant: { ...p.quant, [today]: done } }));

    put(!before);
    setQuantPracticed(today, !before).catch((error) => {
      console.error("Could not save quant practice:", error);
      put(before);
    });
  };

  return (
    <div className="gre min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-foreground/15 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:px-6">
          <h1 className="text-xl font-semibold whitespace-nowrap">
            GRE tracker
          </h1>

          <div
            role="group"
            aria-label="Screen"
            className="order-last flex w-full bg-muted p-1 text-sm sm:order-none sm:w-auto"
          >
            {TABS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={tab === option.id}
                onClick={() => setTab(option.id)}
                className={cn(
                  "gre-press flex-1 px-3 py-1 font-medium text-muted-foreground hover:text-foreground sm:flex-none",
                  tab === option.id &&
                    "bg-background text-foreground shadow-sm",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-full border border-foreground/15 p-2 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
              <AnimatedThemeToggler
                aria-label="Switch between light and dark"
                duration={ANIMATION_THEME_TOGGLER_DURATION}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {today && tab === "dashboard" && (
          <Dashboard
            today={today}
            progress={progress}
            verbalData={verbalData}
          />
        )}
        {today && tab === "verbal" && (
          <VerbalScreen
            verbalData={verbalData}
            reviewed={progress.verbal[today] ?? []}
            onToggleWord={(wordId) => toggleWord(today, wordId)}
          />
        )}
        {today && tab === "quant" && (
          <QuantScreen
            done={progress.quant[today] ?? false}
            onToggle={() => toggleQuant(today)}
          />
        )}
      </main>
    </div>
  );
}

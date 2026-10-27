"use client";

import { CheckBox } from "@/components/gre/check-box";

export function QuantScreen({
  done,
  onToggle,
}: {
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold">Quantitative Reasoning</h2>
        <p className="text-sm text-muted-foreground">
          Daily practice checkpoint
        </p>
      </div>

      <div className="gre-card flex flex-col gap-3 p-4">
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          onClick={onToggle}
          className="gre-press -m-2 flex items-center gap-3 p-2 text-left hover:bg-accent"
        >
          <CheckBox checked={done} className="size-5" />
          <span className="font-medium">Quant practised today</span>
        </button>
        <p className="text-sm text-muted-foreground">
          Quant topics are still to come. For now this records whether you
          practised.
        </p>
      </div>
    </div>
  );
}

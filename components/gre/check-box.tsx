import { cn } from "@/lib/utils";

// The square a done item fills in green. The control around it carries the label and state.
export function CheckBox({
  checked,
  className,
}: {
  checked: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-[5px] border transition-colors",
        checked
          ? "border-(--done) bg-(--done) text-background"
          : "border-input bg-background",
        className,
      )}
    >
      {checked && (
        <svg
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[70%]"
        >
          <path d="M2 5.5L4 7.5L8 3" />
        </svg>
      )}
    </span>
  );
}

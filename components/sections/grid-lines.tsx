export function GridLines() {
  const columns = 5;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 mx-auto w-full max-w-7xl px-6"
      aria-hidden="true"
    >
      <div className="relative flex h-full w-full justify-between">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-full w-px border-l border-dashed border-foreground/60"
          />
        ))}
      </div>
    </div>
  );
}

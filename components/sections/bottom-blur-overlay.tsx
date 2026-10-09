import GradualBlur from "@/components/gradual-blur";

export function BottomBlurOverlay() {
  return (
    <div
      className="fixed left-0 bottom-0 w-full z-40 pointer-events-none"
      aria-hidden="true"
    >
      <GradualBlur
        target="page"
        position="bottom"
        height="17rem"
        strength={5}
        divCount={10}
        curve="bezier"
        opacity={1}
      />
    </div>
  );
}

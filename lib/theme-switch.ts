// Switching themes changes every colour on the page at once. Any of those colours with a CSS
// transition would fade on its own clock instead of switching with the rest, so transitions are
// held off for the moment of the switch.
//
// next-themes can do this itself (disableTransitionOnChange), but it also does it when the page
// loads: it adds a stylesheet, forces a style pass and takes the sheet out again, which makes the
// browser restyle the whole page twice while the first screen is animating in. Holding them off
// here instead, only when someone actually switches, keeps that cost off the load.

const NO_TRANSITIONS = "*,*::before,*::after{transition:none!important}";

/** Holds transitions off until the returned function is called. */
export function holdTransitions() {
  const css = document.createElement("style");
  css.textContent = NO_TRANSITIONS;
  document.head.appendChild(css);
  return () => {
    // next-themes applies the new class in an effect, so give it two frames to land, and let the
    // browser style the page in its new colours before transitions come back.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        void window.getComputedStyle(document.body).opacity;
        css.remove();
      }),
    );
  };
}

/** Sets the theme with the page's transitions held off for the switch. */
export function switchTheme(setTheme: (theme: string) => void, next: string) {
  const release = holdTransitions();
  setTheme(next);
  release();
}

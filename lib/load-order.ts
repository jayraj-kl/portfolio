// The order the home page loads in. The first screen's motion (the hero focusing in, the bust's
// dots shrinking into the portrait, the dock springing up) only looks smooth if nothing heavy
// lands on the main thread while it plays. So the page comes up in steps:
//
//   1. The HTML paints, and the hero's reveal runs from the stylesheet.
//   2. React takes the page over, one section at a time.
//   3. Once that is done, the liquid-metal rims on screen start, one at a time (each needs a
//      WebGL context of its own, about 60ms of blocking apiece), while the bust sets up out of
//      sight. The bust's intro waits for the rims, so the two never overlap: the metal is up
//      within about half a second, and the dots then shrink in on a quiet main thread.

// Step 2's end: each section's Suspense boundary holds a mark (HydrationMark) that reports once
// React has hydrated it. The marks are in the server's HTML, so the page knows from the start how
// many to wait for.
const MARK = "[data-hydration-mark]";
let hydrated = 0;
const hydrationWaiting = new Set<() => void>();

const allHydrated = () => hydrated >= document.querySelectorAll(MARK).length;

/** Called by each HydrationMark as React hydrates it. */
export function sectionHydrated() {
  hydrated++;
  if (!allHydrated()) return;
  for (const resolve of hydrationWaiting) resolve();
  hydrationWaiting.clear();
}

/**
 * Resolves once every section on the page has been hydrated, or after `timeout` ms in case one
 * never reports.
 */
export function afterHydration(timeout = 5000) {
  return new Promise<void>((resolve) => {
    if (allHydrated()) return resolve();
    const done = () => {
      hydrationWaiting.delete(done);
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(done, timeout);
    hydrationWaiting.add(done);
  });
}

let settled = false;

/** Called by the hero once its intro has finished, or once it knows it won't play one. */
export function introSettled() {
  if (settled) return;
  settled = true;
  // Marked for profiling: the load can be read against it in a performance trace.
  performance.mark("home:intro-settled");
}

// Costly start-up jobs that are on their way: reserved as soon as one is known to be coming, so
// the bust's intro can wait for them all, including the ones still waiting their turn.
let reserved = 0;
const jobsWaiting = new Set<() => void>();

/** Reserves a place for a job that will run soon; call the returned function once it has run. */
export function reserveJob() {
  reserved++;
  let done = false;
  return () => {
    if (done) return;
    done = true;
    reserved--;
    if (reserved > 0) return;
    for (const resolve of jobsWaiting) resolve();
    jobsWaiting.clear();
  };
}

/** Resolves once no reserved job is left, or after `timeout` ms. */
export function afterJobs(timeout = 1500) {
  return new Promise<void>((resolve) => {
    if (reserved === 0) return resolve();
    const done = () => {
      jobsWaiting.delete(done);
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(done, timeout);
    jobsWaiting.add(done);
  });
}

let queue: Promise<void> = Promise.resolve();

/**
 * Runs costly one-off jobs one at a time, each in its own quiet moment with a breath between
 * them, so a run of them reads as a few dropped frames spread out rather than one long stall.
 */
export function oneAtATime(job: () => void, gap = 120) {
  queue = queue.then(
    () =>
      new Promise<void>((resolve) => {
        const run = () => {
          try {
            job();
          } finally {
            window.setTimeout(resolve, gap);
          }
        };
        if (typeof requestIdleCallback === "function") requestIdleCallback(run, { timeout: 1500 });
        else window.setTimeout(run, 1);
      }),
  );
}

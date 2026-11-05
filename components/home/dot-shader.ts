// Used by the dot-matrix bust (dot-bust.tsx): the fragment shader that turns a source texture
// into one round dot per cell, and the pointer state that scrambles the dots.

export const INTRO_CELL = 24; // CSS px at the start of the intro
export const REVEAL_MS = 1500;
export const SHRINK_MS = 2000;
const HOVER_RADIUS = 0.15; // fraction of the canvas height
const BURST_RADIUS = 0.21;

export const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

// Low-end mobile GPUs can have as few as 64 fragment uniform vectors; keep the trail inside that.
export function trailCapacity(maxFragmentUniformVectors: number) {
  return Math.max(8, Math.min(64, maxFragmentUniformVectors - 24));
}

// u_tex is sampled at uv = (canvas uv - u_fit.zw) / u_fit.xy; outside [0, 1] counts as empty.
// The texture must be premultiplied (or opaque wherever alpha is 1). `linearSource` converts a
// linear-light source (a three.js render target) to sRGB before its tone is read.
export const dotFrag = (trail: number, { linearSource = false } = {}) => `
precision highp float;
#define TRAIL ${trail}
uniform sampler2D u_tex;
uniform vec2 u_res;        // canvas, device px
uniform float u_cell;      // cell size, device px
uniform vec4 u_fit;        // image rect in canvas uv: scale.xy, offset.zw
uniform vec2 u_levels;     // tone range of the source: lo, hi
uniform float u_gamma;     // applied after the levels; 1 leaves the tone as is
uniform vec3 u_ink;
uniform vec3 u_bg;         // page colour behind the canvas, sRGB; fills the silhouette
uniform float u_invert;    // 1: dot size follows darkness (dark ink on paper)
uniform float u_time;
uniform float u_reveal;    // 0..1, bottom to top
uniform vec2 u_mouse;      // device px, GL origin (bottom left)
uniform float u_vel;       // 0..1
uniform float u_radius;    // device px
uniform vec3 u_trail[TRAIL]; // x, y (device px), strength
uniform int u_trailCount;

float hash(vec2 s) { return fract(sin(dot(s, vec2(12.9898, 78.233))) * 43758.5453); }

vec4 tap(vec2 uv) {
  vec2 t = (uv - u_fit.zw) / u_fit.xy;
  if (t.x < 0.0 || t.x > 1.0 || t.y < 0.0 || t.y > 1.0) return vec4(0.0);
  return texture2D(u_tex, t);
}

void main() {
  vec2 cellId = floor(gl_FragCoord.xy / u_cell);
  vec2 centre = (cellId + 0.5) * u_cell;
  vec2 uv = centre / u_res;

  // Bottom-to-top wipe, a little ragged per column.
  if (uv.y > u_reveal * 1.06 - hash(vec2(cellId.x, 7.0)) * 0.06) discard;

  // Four taps inside the cell, so fine detail averages instead of flickering.
  vec2 q = vec2(u_cell * 0.25) / u_res;
  vec4 c = (tap(uv + vec2(-q.x, -q.y)) + tap(uv + vec2(q.x, -q.y)) +
            tap(uv + vec2(-q.x, q.y)) + tap(uv + vec2(q.x, q.y))) * 0.25;
  if (c.a < 0.04) discard;
  vec3 rgb = c.rgb / max(c.a, 0.001);
  ${linearSource ? "rgb = pow(rgb, vec3(1.0 / 2.2));" : ""}
  float lum = dot(rgb, vec3(0.299, 0.587, 0.114));
  lum = clamp((lum - u_levels.x) / max(u_levels.y - u_levels.x, 0.01), 0.0, 1.0);
  lum = pow(lum, u_gamma);

  // Scramble: fast pointer movement near the cell, then the fading trail.
  float scramble = 0.0;
  float t = u_time;
  float d = distance(centre, u_mouse);
  float r = u_radius * 1.2;
  if (d < r) {
    float k = smoothstep(r, 0.0, d) * u_vel;
    if (hash(cellId + t * 10.0) < k) scramble = (hash(cellId * 2.0 + t) - 0.5) * 2.0;
  }
  for (int i = 0; i < TRAIL; i++) {
    if (i >= u_trailCount) break;
    vec3 tr = u_trail[i];
    if (tr.z < 0.01) continue;
    float tr_r = u_radius * 0.8;
    float td = distance(centre, tr.xy);
    if (td < tr_r) {
      float k = smoothstep(tr_r, 0.0, td) * tr.z * 0.8;
      if (hash(cellId + t * 20.0 + float(i)) < k) {
        float s = (hash(cellId * 3.0 + t + float(i)) - 0.5) * 2.0;
        if (abs(s) > abs(scramble)) scramble = s;
      }
    }
  }

  float tone = mix(lum, 1.0 - lum, u_invert);
  tone = clamp(tone + scramble, 0.0, 1.0);

  // One round dot per cell: its radius and its opacity both follow the tone, and the edge is crisp,
  // so every dot reads as a circle. Faint tones give small, faint dots instead of grey speckle.
  vec2 local = gl_FragCoord.xy / u_cell - cellId - 0.5;
  float radius = tone * 0.48 * smoothstep(0.04, 0.9, c.a);
  float aa = 0.5 / u_cell;
  float disc = smoothstep(radius + aa, radius - aa, length(local)) * tone;
  float dotA = clamp(disc * 1.75, 0.0, 1.0);
  // The silhouette is filled with the background, so whatever is behind the canvas doesn't show
  // between the dots and the bust reads as one solid form.
  float fill = smoothstep(0.02, 0.2, c.a) * 0.94;
  float a = dotA + fill * (1.0 - dotA);
  if (a < 0.004) discard;
  gl_FragColor = vec4(u_ink * dotA + u_bg * fill * (1.0 - dotA), a); // premultiplied
}
`;

type Point = { x: number; y: number; s: number };

// Pointer state that scrambles the dots: velocity near the pointer, a fading trail behind it, and a
// ring thrown by a tap. Positions are in device px with the GL origin (bottom left).
export class Scramble {
  mouse = { x: -1e5, y: -1e5 };
  vel = 0;
  radiusScale = HOVER_RADIUS;
  readonly buf: Float32Array<ArrayBuffer>;
  private trail: Point[] = [];
  private prev = { x: 0, y: 0, t: 0 };
  private down: { x: number; y: number } | null = null;
  private burstTimer = 0;
  private detach: () => void = () => {};

  constructor(
    private canvas: HTMLCanvasElement,
    readonly capacity: number,
    private onChange: () => void,
    private disabled: () => boolean,
  ) {
    this.buf = new Float32Array(capacity * 3);
  }

  attach(host: HTMLElement) {
    const local = (e: PointerEvent) => {
      const r = this.canvas.getBoundingClientRect();
      const fx = (e.clientX - r.left) / r.width;
      const fy = (e.clientY - r.top) / r.height;
      const inside = fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1;
      return { inside, x: fx * this.canvas.width, y: (1 - fy) * this.canvas.height };
    };

    const onMove = (e: PointerEvent) => {
      if (this.disabled()) return;
      const p = local(e);
      if (!p.inside) return;
      const now = performance.now();
      const dtMs = Math.max(1, now - this.prev.t);
      // Speed in canvas-heights per second; below 1 it does nothing.
      const speed = (Math.hypot(p.x - this.prev.x, p.y - this.prev.y) / this.canvas.height / dtMs) * 1000;
      const k = speed > 1 ? Math.min((speed - 1) * 0.6, 1) : 0;
      this.vel = Math.max(this.vel, k);
      if (k > 0.05) {
        this.trail.push({ x: p.x, y: p.y, s: k });
        if (this.trail.length > this.capacity) this.trail.shift();
      }
      this.prev = { x: p.x, y: p.y, t: now };
      this.mouse = { x: p.x, y: p.y };
      this.onChange();
    };

    const onLeave = () => {
      this.mouse = { x: -1e5, y: -1e5 };
    };

    const onDown = (e: PointerEvent) => {
      this.down = { x: e.clientX, y: e.clientY };
    };

    // A tap (not a drag) throws a ring of scramble around the point and briefly widens the radius.
    const onUp = (e: PointerEvent) => {
      const start = this.down;
      this.down = null;
      if (this.disabled() || !start || Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) return;
      const p = local(e);
      if (!p.inside) return;
      this.vel = Math.max(this.vel, 0.88);
      const ring = 0.075 * this.canvas.height;
      const count = Math.min(24, this.capacity);
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + 0.35 * Math.random();
        const d = ring * (0.35 + 0.65 * Math.random());
        this.trail.push({ x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, s: 0.5 + 0.35 * Math.random() });
      }
      while (this.trail.length > this.capacity) this.trail.shift();
      this.mouse = { x: p.x, y: p.y };
      this.radiusScale = BURST_RADIUS;
      window.clearTimeout(this.burstTimer);
      this.burstTimer = window.setTimeout(() => {
        this.radiusScale = HOVER_RADIUS;
      }, 220);
      this.onChange();
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointerup", onUp);
    this.detach = () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerup", onUp);
    };
  }

  // Decays velocity and trail by dt seconds (rates are tuned per 60 Hz frame) and fills `buf`.
  // Returns how many trail points are live.
  step(dt: number) {
    const f = dt * 60;
    this.vel *= 0.88 ** f;
    if (this.vel < 0.001) this.vel = 0;
    const trail = this.trail;
    for (let i = trail.length - 1; i >= 0; i--) {
      trail[i].s *= 0.93 ** f;
      if (trail[i].s < 0.01) trail.splice(i, 1);
    }
    const n = Math.min(trail.length, this.capacity);
    const from = trail.length - n;
    for (let i = 0; i < n; i++) {
      const p = trail[from + i];
      this.buf[i * 3] = p.x;
      this.buf[i * 3 + 1] = p.y;
      this.buf[i * 3 + 2] = p.s;
    }
    return n;
  }

  reset() {
    this.trail.length = 0;
    this.vel = 0;
  }

  dispose() {
    window.clearTimeout(this.burstTimer);
    this.detach();
  }
}

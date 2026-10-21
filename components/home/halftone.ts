// Line-screen halftone for the home page, drawn by hand on canvas 2D and WebGL.
// A luminance field (0 = ink, 1 = paper) is sampled under a screen of parallel lines;
// each line's width follows the darkness beneath it, as on a photomechanical line screen.

// data: luminance (0 = ink, 1 = paper). alpha: how much of each pixel is image (0 = paper in both
// themes). photo: a real image, whose line weight follows luminance on the dark ground so it never
// reads as a negative; generated stand-ins keep the inverted "white-lit object" look.
export type Field = { w: number; h: number; data: Float32Array; alpha?: Float32Array; photo?: boolean };

// Line colour per theme: black ink on white paper, or white lines on the dark ground.
export type Ink = readonly [number, number, number];
export const INK_LIGHT: Ink = [17, 17, 17];
export const INK_DARK: Ink = [236, 236, 230];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, w);
  c.height = Math.max(1, h);
  return c;
}

function ctx2d(c: HTMLCanvasElement) {
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas unavailable");
  return ctx;
}

// ---------------------------------------------------------------------------
// Noise

function hash2(x: number, y: number, seed: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

function valueNoise(x: number, y: number, seed: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number, seed: number) {
  return (
    valueNoise(x, y, seed) * 0.55 +
    valueNoise(x * 2.03, y * 2.03, seed + 1) * 0.3 +
    valueNoise(x * 4.11, y * 4.11, seed + 2) * 0.15
  );
}

// ---------------------------------------------------------------------------
// Painting fields with canvas 2D, then texturing them like a worn plate

const grey = (v: number) => {
  const c = Math.round(clamp01(v) * 255);
  return `rgb(${c},${c},${c})`;
};

function paint(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, blur: number, ground = 1) {
  const out = makeCanvas(w, h);
  const ctx = ctx2d(out);
  ctx.fillStyle = grey(ground);
  ctx.fillRect(0, 0, w, h);
  const src = makeCanvas(w, h);
  const sctx = ctx2d(src);
  sctx.fillStyle = grey(ground);
  sctx.fillRect(0, 0, w, h);
  draw(sctx);
  if (blur > 0) ctx.filter = `blur(${blur.toFixed(2)}px)`;
  ctx.drawImage(src, 0, 0);
  ctx.filter = "none";
  return readLuma(ctx, w, h);
}

function readLuma(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const px = ctx.getImageData(0, 0, w, h).data;
  const out = new Float32Array(w * h);
  for (let i = 0; i < out.length; i++) {
    const j = i * 4;
    const a = px[j + 3] / 255;
    const l = (0.2126 * px[j] + 0.7152 * px[j + 1] + 0.0722 * px[j + 2]) / 255;
    out[i] = l * a + (1 - a);
  }
  return out;
}

// Grain inside the mass, and a scatter of loose specks around its edge (Selecta's ring sheds dots).
function texture(data: Float32Array, w: number, h: number, seed: number, grain = 0.16, scatter = 0.22) {
  const c = makeCanvas(w, h);
  const ctx = ctx2d(c);
  const img = ctx.createImageData(w, h);
  for (let i = 0; i < data.length; i++) {
    const d = Math.round((1 - data[i]) * 255);
    img.data[i * 4] = 0;
    img.data[i * 4 + 1] = 0;
    img.data[i * 4 + 2] = 0;
    img.data[i * 4 + 3] = d;
  }
  ctx.putImageData(img, 0, 0);
  const halo = makeCanvas(w, h);
  const hctx = ctx2d(halo);
  hctx.filter = `blur(${Math.max(2, w * 0.035).toFixed(1)}px)`;
  hctx.drawImage(c, 0, 0);
  const near = hctx.getImageData(0, 0, w, h).data;

  const f = 10 / Math.max(w, h);
  const out = new Float32Array(data.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let l = data[i];
      const dark = 1 - l;
      const n = fbm(x * f * 3, y * f * 3, seed);
      l += (n - 0.5) * grain * smooth(0.02, 0.3, dark);
      // Fine pits inside dark areas break the lines into dashes.
      if (dark > 0.35 && hash2(x, y, seed + 9) < 0.018) l += 0.45;
      const prox = near[i * 4 + 3] / 255;
      if (dark < 0.06 && prox > 0.02) {
        const s = hash2(x >> 1, y >> 1, seed + 5);
        if (s < prox * scatter * (0.6 + n)) l -= 0.4 + 0.4 * hash2(x, y, seed + 11);
      }
      out[i] = clamp01(l);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Portrait: a lit head-and-shoulders mass, used until /home/portrait.jpg exists

export type PortraitFrame = {
  // Scale unit in field pixels (the bust is drawn in multiples of it).
  u: number;
  // Field y where the top of the head sits.
  top: number;
};

export function heroFrame(w: number, h: number): PortraitFrame {
  return { u: Math.min(1.12 * h, 0.9 * w), top: 0.36 * h };
}

export function portraitField(w: number, h: number, frame: PortraitFrame, seed = 3, ground = 1): Field {
  const { u } = frame;
  const cx = w / 2;
  const Y = (k: number) => frame.top + (k - 0.44) * u;
  const data = paint(
    w,
    h,
    (ctx) => {
      const shW = Math.min(0.8 * u, Math.max(0.62 * w, 0.5 * u));
      // Shoulders and chest
      const sg = ctx.createLinearGradient(cx - shW, 0, cx + shW, 0);
      sg.addColorStop(0, grey(0.6));
      sg.addColorStop(0.45, grey(0.36));
      sg.addColorStop(1, grey(0.12));
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(cx - 0.085 * u, Y(0.84));
      ctx.quadraticCurveTo(cx - 0.1 * u, Y(0.93), cx - 0.32 * u, Y(0.95));
      ctx.quadraticCurveTo(cx - shW, Y(0.97), cx - shW, Y(1.4));
      ctx.lineTo(cx + shW, Y(1.4));
      ctx.quadraticCurveTo(cx + shW, Y(0.97), cx + 0.32 * u, Y(0.95));
      ctx.quadraticCurveTo(cx + 0.1 * u, Y(0.93), cx + 0.085 * u, Y(0.84));
      ctx.closePath();
      ctx.fill();
      // Collar shadow
      const cg = ctx.createLinearGradient(0, Y(0.9), 0, Y(1.05));
      cg.addColorStop(0, "rgba(0,0,0,0.35)");
      cg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.ellipse(cx, Y(0.95), 0.16 * u, 0.08 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      // Neck, in the shadow of the jaw
      const ng = ctx.createLinearGradient(cx - 0.08 * u, 0, cx + 0.08 * u, 0);
      ng.addColorStop(0, grey(0.42));
      ng.addColorStop(1, grey(0.18));
      ctx.fillStyle = ng;
      ctx.fillRect(cx - 0.075 * u, Y(0.76), 0.15 * u, 0.2 * u);
      // Ears
      ctx.fillStyle = grey(0.58);
      ctx.beginPath();
      ctx.ellipse(cx - 0.168 * u, Y(0.67), 0.03 * u, 0.055 * u, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = grey(0.2);
      ctx.beginPath();
      ctx.ellipse(cx + 0.168 * u, Y(0.67), 0.03 * u, 0.055 * u, -0.15, 0, Math.PI * 2);
      ctx.fill();
      // Head, key light from the upper left
      const hg = ctx.createRadialGradient(cx - 0.06 * u, Y(0.63), 0.01 * u, cx + 0.015 * u, Y(0.66), 0.25 * u);
      hg.addColorStop(0, grey(1));
      hg.addColorStop(0.45, grey(0.84));
      hg.addColorStop(0.75, grey(0.52));
      hg.addColorStop(1, grey(0.2));
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.ellipse(cx, Y(0.655), 0.165 * u, 0.215 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      // Hair, parted to one side
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, Y(0.665));
      ctx.lineTo(cx + 0.152 * u, Y(0.665));
      ctx.quadraticCurveTo(cx + 0.14 * u, Y(0.57), cx + 0.1 * u, Y(0.56));
      ctx.quadraticCurveTo(cx + 0.03 * u, Y(0.575), cx - 0.04 * u, Y(0.532));
      ctx.quadraticCurveTo(cx - 0.12 * u, Y(0.55), cx - 0.135 * u, Y(0.6));
      ctx.lineTo(cx - 0.152 * u, Y(0.665));
      ctx.lineTo(0, Y(0.665));
      ctx.closePath();
      ctx.clip();
      const hair = ctx.createLinearGradient(cx - 0.18 * u, Y(0.44), cx + 0.18 * u, Y(0.6));
      hair.addColorStop(0, grey(0.3));
      hair.addColorStop(1, grey(0.05));
      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.ellipse(cx + 0.004 * u, Y(0.615), 0.182 * u, 0.178 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    Math.max(0.6, u * 0.006),
    ground,
  );
  return { w, h, data: texture(data, w, h, seed) };
}

// ---------------------------------------------------------------------------
// Project stills: shaded solids, one per project, until /work/<slug>/poster.jpg exists

type Ctx = CanvasRenderingContext2D;

function sphere(ctx: Ctx, cx: number, cy: number, r: number) {
  const g = ctx.createRadialGradient(cx - 0.38 * r, cy - 0.42 * r, 0.02 * r, cx, cy, r);
  g.addColorStop(0, grey(0.97));
  g.addColorStop(0.35, grey(0.74));
  g.addColorStop(0.8, grey(0.3));
  g.addColorStop(1, grey(0.14));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function ribbedSphere(ctx: Ctx, cx: number, cy: number, r: number) {
  sphere(ctx, cx, cy, r);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  for (let k = -4; k <= 4; k++) {
    const y = cy + k * r * 0.24;
    const half = Math.sqrt(Math.max(0, 1 - ((y - cy) / r) ** 2)) * r;
    ctx.strokeStyle = "rgba(0,0,0,0.42)";
    ctx.lineWidth = r * 0.075;
    ctx.beginPath();
    ctx.ellipse(cx, y, half, half * 0.22, 0, 0, Math.PI);
    ctx.stroke();
  }
  ctx.restore();
}

type Tones = { top: number; left: number; right: number };
const LIT: Tones = { top: 0.9, left: 0.55, right: 0.2 };

// Isometric box from (0,0,0) to (a,b,c), with its footprint origin projected at (ox, oy).
function isoBox(ctx: Ctx, ox: number, oy: number, unit: number, a: number, b: number, c: number, z = 0, t: Tones = LIT) {
  const P = (x: number, y: number, zz: number): [number, number] => [
    ox + (x - y) * 0.866 * unit,
    oy + (x + y) * 0.5 * unit - (zz + z) * unit,
  ];
  const face = (pts: [number, number][], tone: number) => {
    ctx.fillStyle = grey(tone);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]);
    ctx.closePath();
    ctx.fill();
  };
  face([P(0, b, 0), P(a, b, 0), P(a, b, c), P(0, b, c)], t.left);
  face([P(a, 0, 0), P(a, 0, c), P(a, b, c), P(a, b, 0)], t.right);
  face([P(0, 0, c), P(a, 0, c), P(a, b, c), P(0, b, c)], t.top);
}

const PROJECT_PAINTERS: Record<string, (ctx: Ctx, w: number, h: number) => void> = {
  // Animation frames: a sphere banded like a stack of rendered frames
  dexterio: (ctx, w, h) => ribbedSphere(ctx, w / 2, h / 2, h * 0.36),
  // Deployment layers: three crates stacked with air between them
  "one-stop-deployment": (ctx, w, h) => {
    const unit = h * 0.25;
    const ox = w / 2;
    const oy = h * 0.5 + unit * 0.2;
    for (let i = 0; i < 3; i++) isoBox(ctx, ox, oy, unit, 1, 1, 0.42, i * 0.62 - 0.55);
  },
  // A link graph: nodes of different weight joined by edges
  demex: (ctx, w, h) => {
    const nodes: [number, number, number][] = [
      [0.5, 0.5, 0.17],
      [0.26, 0.28, 0.08],
      [0.76, 0.26, 0.11],
      [0.27, 0.76, 0.1],
      [0.73, 0.75, 0.07],
      [0.53, 0.13, 0.05],
      [0.1, 0.52, 0.045],
      [0.9, 0.53, 0.05],
    ];
    const at = (n: [number, number, number]) => [w / 2 + (n[0] - 0.5) * h * 1.25, n[1] * h] as const;
    const edges = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [2, 5], [1, 6], [3, 6], [2, 7], [4, 7], [1, 3]];
    ctx.strokeStyle = grey(0.3);
    ctx.lineWidth = h * 0.014;
    for (const [i, j] of edges) {
      const [x1, y1] = at(nodes[i]);
      const [x2, y2] = at(nodes[j]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    for (const n of nodes) {
      const [x, y] = at(n);
      sphere(ctx, x, y, n[2] * h);
    }
  },
  // Course material: a fanned stack of thin slabs
  studex: (ctx, w, h) => {
    const unit = h * 0.3;
    for (let i = 0; i < 5; i++) {
      const ox = w / 2 - unit * 0.1 + i * unit * 0.05;
      const oy = h * 0.52 - unit * 0.55 + i * unit * 0.02;
      isoBox(ctx, ox, oy, unit, 1.25, 0.95, 0.12, i * 0.2 - 0.3, {
        top: 0.92 - (i % 2) * 0.08,
        left: 0.5,
        right: 0.22,
      });
    }
  },
  // Generated sites: a 3x3 field of blocks of different heights
  "website-builder": (ctx, w, h) => {
    const unit = h * 0.15;
    const heights = [0.4, 1.1, 0.6, 0.8, 1.7, 0.3, 1.2, 0.5, 0.9];
    const ox = w / 2;
    const oy = h * 0.46 - unit * 1.05;
    const cells: [number, number][] = [];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cells.push([i, j]);
    cells.sort((p, q) => p[0] + p[1] - (q[0] + q[1]));
    for (const [i, j] of cells) {
      const P = (x: number, y: number) => [ox + (x - y) * 0.866 * unit, oy + (x + y) * 0.5 * unit] as const;
      const [px, py] = P(i * 1.08, j * 1.08);
      isoBox(ctx, px, py, unit, 0.92, 0.92, heights[i * 3 + j]);
    }
  },
};

export function projectField(slug: string, w: number, h: number): Field {
  const painter = PROJECT_PAINTERS[slug] ?? ((ctx: Ctx, ww: number, hh: number) => sphere(ctx, ww / 2, hh / 2, hh * 0.32));
  let seed = 17;
  for (let i = 0; i < slug.length; i++) seed = (seed * 31 + slug.charCodeAt(i)) | 0;
  const data = paint(w, h, (ctx) => painter(ctx, w, h), Math.max(0.5, h * 0.004));
  return { w, h, data: texture(data, w, h, seed, 0.14, 0.38) };
}

// Paper figures: one solid per paper, until /papers/<id>.jpg exists
const FIGURE_PAINTERS: Record<string, (ctx: Ctx, w: number, h: number) => void> = {
  // Mixed precision: a row of bars whose heights step like bit widths
  hipc2026: (ctx, w, h) => {
    const unit = h * 0.13;
    const heights = [2.6, 1.3, 3.4, 0.7, 2.0, 3.0, 1.0];
    const ox = w / 2 - unit * 3.1;
    const oy = h * 0.66;
    heights.forEach((ht, i) => {
      const x = ox + i * unit * 0.95;
      const y = oy + i * unit * 0.16;
      isoBox(ctx, x, y, unit, 0.7, 0.7, ht);
    });
  },
  // PostgreSQL at scale: three stacked disks
  icbds2025: (ctx, w, h) => {
    const rx = h * 0.42;
    const ry = rx * 0.32;
    const body = h * 0.17;
    for (let i = 2; i >= 0; i--) {
      const cy = h * 0.3 + i * (body + h * 0.04);
      const g = ctx.createLinearGradient(w / 2 - rx, 0, w / 2 + rx, 0);
      g.addColorStop(0, grey(0.62));
      g.addColorStop(0.5, grey(0.36));
      g.addColorStop(1, grey(0.14));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(w / 2, cy + body, rx, ry, 0, 0, Math.PI);
      ctx.lineTo(w / 2 - rx, cy);
      ctx.ellipse(w / 2, cy, rx, ry, 0, Math.PI, 0, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = grey(0.9);
      ctx.beginPath();
      ctx.ellipse(w / 2, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};

export function figureField(id: string, w: number, h: number): Field {
  const painter = FIGURE_PAINTERS[id] ?? ((ctx: Ctx, ww: number, hh: number) => sphere(ctx, ww / 2, hh / 2, hh * 0.32));
  const data = paint(w, h, (ctx) => painter(ctx, w, h), Math.max(0.5, h * 0.004));
  return { w, h, data: texture(data, w, h, 41 + id.length, 0.14, 0.32) };
}

export const FIGURE_FIELD_DESCRIPTIONS: Record<string, string> = {
  hipc2026: "a row of bars of stepped heights",
  icbds2025: "three stacked disks",
};

export const PROJECT_FIELD_DESCRIPTIONS: Record<string, string> = {
  dexterio: "a banded sphere",
  "one-stop-deployment": "three stacked crates",
  demex: "a graph of linked nodes",
  studex: "a fanned stack of slabs",
  "website-builder": "a field of blocks of different heights",
};

// ---------------------------------------------------------------------------
// Real images: read luminance, with a contrast curve so paper stays paper

export function imageField(
  img: HTMLImageElement,
  w: number,
  h: number,
  fit: { kind: "cover" } | { kind: "portrait"; frame: PortraitFrame },
): Field {
  const c = makeCanvas(w, h);
  const ctx = ctx2d(c);
  const iw = img.naturalWidth || 1;
  const ih = img.naturalHeight || 1;
  if (fit.kind === "cover") {
    const s = Math.max(w / iw, h / ih);
    ctx.drawImage(img, (w - iw * s) / 2, (h - ih * s) / 2, iw * s, ih * s);
  } else {
    // Head-and-shoulders source: the head's top sits ~8% down the photo.
    const dh = 1.15 * fit.frame.u;
    const dw = dh * (iw / ih);
    ctx.drawImage(img, (w - dw) / 2, fit.frame.top - 0.08 * dh, dw, dh);
  }
  const px = ctx.getImageData(0, 0, w, h).data;
  const raw = new Float32Array(w * h);
  const alpha = new Float32Array(w * h);
  for (let i = 0; i < raw.length; i++) {
    const j = i * 4;
    const a = px[j + 3] / 255;
    alpha[i] = a;
    // Transparent pixels carry no colour; treat them as paper so grain and specks stay off them.
    const l = a > 0 ? (0.2126 * px[j] + 0.7152 * px[j + 1] + 0.0722 * px[j + 2]) / 255 : 1;
    raw[i] = smooth(0.06, 0.94, l);
  }
  return { w, h, data: texture(raw, w, h, 29, 0.06, 0.2), alpha, photo: true };
}

// Composite an image field over a flat ground (used where every pixel must carry lines, as in the wordmark).
export function flattenField(field: Field, ground: number): Field {
  const data = new Float32Array(field.data.length);
  for (let i = 0; i < data.length; i++) {
    const a = field.alpha ? field.alpha[i] : 1;
    data[i] = ground + (field.data[i] - ground) * a;
  }
  return { w: field.w, h: field.h, data, photo: field.photo };
}

export function toneField(field: Field, lo: number, hi: number): Field {
  const data = new Float32Array(field.data.length);
  for (let i = 0; i < data.length; i++) data[i] = lo + (hi - lo) * field.data[i];
  return { w: field.w, h: field.h, data, alpha: field.alpha, photo: field.photo };
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

// ---------------------------------------------------------------------------
// The screen itself

// CPU: one pass over device pixels. Angle in radians, period in device pixels.
export function drawLineScreen(
  ctx: CanvasRenderingContext2D,
  field: Field,
  W: number,
  H: number,
  angle: number,
  period: number,
  ink: Ink = INK_LIGHT,
  dark = false,
) {
  // On the dark ground a photo's lines follow luminance (bright stays bright); otherwise they follow darkness.
  const flip = dark && Boolean(field.photo);
  const fa = field.alpha;
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  const fx = field.w / W;
  const fy = field.h / H;
  const fw = field.w;
  const fd = field.data;
  for (let y = 0; y < H; y++) {
    let sy = (y + 0.5) * fy - 0.5;
    if (sy < 0) sy = 0;
    if (sy > field.h - 1) sy = field.h - 1;
    const y0 = Math.floor(sy);
    const y1 = Math.min(field.h - 1, y0 + 1);
    const ty = sy - y0;
    for (let x = 0; x < W; x++) {
      let sx = (x + 0.5) * fx - 0.5;
      if (sx < 0) sx = 0;
      if (sx > fw - 1) sx = fw - 1;
      const x0 = Math.floor(sx);
      const x1 = Math.min(fw - 1, x0 + 1);
      const tx = sx - x0;
      const a = fd[y0 * fw + x0];
      const b = fd[y0 * fw + x1];
      const cc = fd[y1 * fw + x0];
      const dd = fd[y1 * fw + x1];
      const lum = a + (b - a) * tx + (cc - a) * ty + (a - b - cc + dd) * tx * ty;
      let cover = 1;
      if (fa) {
        const a0 = fa[y0 * fw + x0];
        const a1 = fa[y0 * fw + x1];
        const a2 = fa[y1 * fw + x0];
        const a3 = fa[y1 * fw + x1];
        cover = a0 + (a1 - a0) * tx + (a2 - a0) * ty + (a0 - a1 - a2 + a3) * tx * ty;
      }
      const weight = (flip ? lum : 1 - lum) * cover;
      const v = (x * s + y * c) / period;
      const t = v - Math.floor(v) - 0.5;
      const dist = (t < 0 ? -t : t) * period;
      // Coverage of a line of width dark * period, never more than the line's own width (so paper stays clean).
      const half = weight * period * 0.5;
      let alpha = half - dist + 0.5;
      if (alpha <= 0) continue;
      if (alpha > 1) alpha = 1;
      if (alpha > 2 * half) alpha = 2 * half;
      const i = (y * W + x) * 4;
      d[i] = ink[0];
      d[i + 1] = ink[1];
      d[i + 2] = ink[2];
      d[i + 3] = alpha * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `precision highp float;
uniform sampler2D u_lum;
uniform vec2 u_res;
uniform float u_angle;
uniform float u_period;
uniform vec3 u_ink;
uniform float u_flip;
void main(){
  vec2 p = gl_FragCoord.xy;
  vec4 t = texture2D(u_lum, vec2(p.x / u_res.x, 1.0 - p.y / u_res.y));
  float dark = mix(1.0 - t.r, t.r, u_flip) * t.a;
  float v = (-p.x * sin(u_angle) + p.y * cos(u_angle)) / u_period;
  float dist = abs(fract(v) - 0.5) * u_period;
  float halfW = dark * u_period * 0.5;
  float a = min(clamp(halfW - dist + 0.5, 0.0, 1.0), 2.0 * halfW);
  gl_FragColor = vec4(u_ink * a, a);
}`;

export type GLScreen = {
  setField: (f: Field) => void;
  draw: (angle: number, period: number, ink: Ink, dark: boolean) => void;
  dispose: () => void;
};

export function createGLScreen(canvas: HTMLCanvasElement): GLScreen | null {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return null;
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const uRes = gl.getUniformLocation(prog, "u_res");
  const uAngle = gl.getUniformLocation(prog, "u_angle");
  const uPeriod = gl.getUniformLocation(prog, "u_period");
  const uInk = gl.getUniformLocation(prog, "u_ink");
  const uFlip = gl.getUniformLocation(prog, "u_flip");
  let photo = false;

  return {
    setField(f) {
      const n = f.data.length;
      const bytes = new Uint8Array(n * 2);
      for (let i = 0; i < n; i++) {
        bytes[i * 2] = Math.round(clamp01(f.data[i]) * 255);
        bytes[i * 2 + 1] = Math.round(clamp01(f.alpha ? f.alpha[i] : 1) * 255);
      }
      photo = Boolean(f.photo);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE_ALPHA, f.w, f.h, 0, gl.LUMINANCE_ALPHA, gl.UNSIGNED_BYTE, bytes);
    },
    draw(angle, period, ink, dark) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uAngle, angle);
      gl.uniform1f(uPeriod, period);
      gl.uniform3f(uInk, ink[0] / 255, ink[1] / 255, ink[2] / 255);
      gl.uniform1f(uFlip, dark && photo ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    // The context stays with the canvas (a remount asks for it again), so only free our objects.
    dispose() {
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    },
  };
}

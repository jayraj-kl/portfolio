/**
 * Pokeball: a ball of two hemispheres, the lid hinged at the back of the seam,
 * with a band round the middle and a raised button on its front. The nearer
 * the pointer to the button, the further the lid swings open, on a spring; at
 * rest it sits a few degrees ajar. The button holds the bright stroke until the
 * ball is half open, then the lid's rim takes it. The slider is the button's
 * reach, in viewBox units.
 *
 * The pattern: one hinge, one spring, a hit test on the button, which never
 * moves, and an honest paint order: lower half, then the lid, then the button.
 */
const { Cam, clamp, fit, hull, mk, open, poly, proj, spring, stepS, disposer, pointer, register } = HL;

const R = 40, BW = 0.13 * R, HOUSE = 0.36 * R, BTN = 0.21 * R, FACE = 0.12 * R;
const ELEV = 0.3, REST = 7, OPEN = 104, LIT = 0.5, LIP = 1.8;
const SQ = Math.SQRT1_2;
const D = [SQ, SQ, 0], A = [SQ, -SQ, 0], UP = [0, 0, 1]; // to the viewer, the hinge's axis, up
const CE = Math.sqrt(1 - ELEV * ELEV);
const V = [CE * SQ, CE * SQ, ELEV]; // towards the camera
const H = [-R * SQ, -R * SQ, 0]; // the hinge, at the back of the seam

const add = (p, q, s = 1) => [p[0] + q[0] * s, p[1] + q[1] * s, p[2] + q[2] * s];
const dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
const rad = (d) => (d * Math.PI) / 180;

/** v turned by th radians about the hinge's axis: positive swings the top backwards. */
function rot(v, th) {
  const c = Math.cos(th), s = Math.sin(th), k = dot(A, v) * (1 - c);
  const x = [A[1] * v[2] - A[2] * v[1], A[2] * v[0] - A[0] * v[2], A[0] * v[1] - A[1] * v[0]];
  return [v[0] * c + x[0] * s + A[0] * k, v[1] * c + x[1] * s + A[1] * k, v[2] * c + x[2] * s + A[2] * k];
}
/** A point of the lid, opened by th. */
const lid = (p, th) => add(H, rot(add(p, H, -1), th));

/** Points over a band of the sphere, latitudes in degrees. */
function shell(lat0, lat1) {
  const pts = [];
  for (let la = lat0; la <= lat1; la += 10) for (let lo = 0; lo < 360; lo += 12) {
    const c = Math.cos(rad(la));
    pts.push([R * c * Math.cos(rad(lo)), R * c * Math.sin(rad(lo)), R * Math.sin(rad(la))]);
  }
  return pts;
}
/** A horizontal circle of the sphere at height z, as [point, outward normal] samples. */
function band(z, r = Math.sqrt(R * R - z * z), n = 64) {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * 2 * Math.PI, u = [Math.cos(t), Math.sin(t), 0];
    return [[r * u[0], r * u[1], z], u];
  });
}
/** The one cyclic run of samples that pass vis, as points; all of them when every one does. */
function runOf(pts, vis) {
  const n = pts.length, start = vis.findIndex((v, i) => v && !vis[(i + n - 1) % n]);
  if (start < 0) return vis[0] ? pts.concat([pts[0]]) : [];
  const out = [];
  for (let i = start; vis[i % n] && out.length < n; i++) out.push(pts[i % n]);
  return out;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value;
  const C = Cam(45, ELEV, 2.25);
  const dome = shell(0, 90), bowl = shell(-90, 0);
  fit(C, bowl.concat(dome, dome.map((p) => lid(p, rad(OPEN)))), 200, 166);
  const P = proj(C), S = (p) => P(p[0], p[1], p[2]);

  const g = mk("g", {}, svg);
  // The lower half: its body, the band's lower edge, and the cavity's rim and lip.
  mk("path", { d: poly(hull(bowl.map(S))), class: "sil" }, g);
  const lowEdge = band(-BW);
  mk("path", { d: open(runOf(lowEdge.map(([p]) => S(p)), lowEdge.map(([, n]) => dot(n, V) > 0))), class: "nf" }, g);
  mk("path", { d: poly(band(0).map(([p]) => S(p))) }, g);
  mk("path", { d: poly(band(-LIP, R - LIP).map(([p]) => S(p))), class: "nf lo" }, g);

  // The lid, redrawn as it swings.
  const lg = mk("g", {}, g);
  const domeEl = mk("path", { class: "sil" }, lg);
  const edgeEl = mk("path", { class: "nf" }, lg);
  const rimEl = mk("path", {}, lg);
  const lipEl = mk("path", { class: "nf lo" }, lg);

  // The button, raised on the front of the seam: its housing, the button, and the button's face.
  const disc = (r, out) => {
    const c = add(D, D, R + out - 1).map((v, i) => v - D[i]);
    return poly(Array.from({ length: 41 }, (_, i) => {
      const t = (i / 40) * 2 * Math.PI;
      return S(add(add(c, A, r * Math.cos(t)), UP, r * Math.sin(t)));
    }));
  };
  mk("path", { d: disc(HOUSE, 0.6), class: "sil" }, g);
  const btn = mk("path", { d: disc(BTN, 2.2), class: "hi" }, g);
  mk("path", { d: disc(FACE, 2.6), class: "nf lo" }, g);

  const topEdge = band(BW), rim = band(0), lip = band(LIP, R - LIP);
  let drawn = NaN, lit = false;
  function drawLid(deg) {
    if (deg === drawn) return;
    drawn = deg;
    const th = rad(deg);
    domeEl.setAttribute("d", poly(hull(dome.map((p) => S(lid(p, th))))));
    edgeEl.setAttribute("d", open(runOf(topEdge.map(([p]) => S(lid(p, th))), topEdge.map(([, n]) => dot(rot(n, th), V) > 0))));
    // The inside of the lid faces the camera once it has opened past the camera's height.
    const inside = dot(rot([0, 0, -1], th), V) > 0;
    const rp = rim.map(([p]) => S(lid(p, th)));
    if (inside) {
      rimEl.setAttribute("d", poly(rp));
      rimEl.classList.remove("nf");
      lipEl.setAttribute("d", poly(lip.map(([p]) => S(lid(p, th)))));
    } else {
      rimEl.setAttribute("d", open(runOf(rp, rim.map(([, n]) => dot(rot(n, th), V) > 0))));
      rimEl.classList.add("nf");
      lipEl.setAttribute("d", "");
    }
  }

  const angle = spring(REST, { eps: 0.05 });
  const B = register(stage, (dt) => {
    const moving = stepS(angle, dt);
    drawLid(clamp(angle.x, 0, OPEN));
    return moving;
  });
  bag.add(B.unregister);
  drawLid(REST);

  // One highlight: the button, until the ball is half open; then the lid's rim.
  function setLit(on) {
    if (on === lit) return;
    lit = on;
    btn.classList.toggle("hi", !on);
    rimEl.classList.toggle("hi", on);
  }

  const bs = S(add(D, D, R + 1.2).map((v, i) => v - D[i]));
  bag.add(pointer(stage, {
    move: (p) => {
      // The button never moves, so how far the lid has swung can't change what the pointer is near.
      const o = clamp(1 - Math.hypot(p[0] - bs[0], p[1] - bs[1]) / reach, 0, 1);
      angle.t = REST + (OPEN - REST) * o;
      read.textContent = `open ${Math.round(o * 100)}%`;
      setLit(o >= LIT);
      B.wake();
    },
    leave: () => { angle.t = REST; read.textContent = "rest"; setLit(false); B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { reach = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "pokeball",
  means: "A Pokéball, a few degrees ajar: the nearer the pointer comes to its button, the further the lid swings open.",
  rules: [1, 4, 5, 6],
  range: [70, 110, 160],
  tour: [[60, 260], [130, 200], [200, 210], null],
  mount,
});

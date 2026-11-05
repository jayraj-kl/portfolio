"use client";

// The 3D take on the dot-matrix avatar: a GLB bust rendered with three.js into an offscreen target,
// then drawn as one dot per cell by the shader in dot-shader.ts. The bust sways slowly and turns
// freely when dragged sideways; fast pointer movement scrambles the dots and a tap throws a ring.

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { useDark } from "@/components/home/theme";
import { INK_DARK, INK_LIGHT } from "@/components/home/halftone";
import {
  INTRO_CELL,
  REVEAL_MS,
  SHRINK_MS,
  Scramble,
  dotFrag,
  easeInOutQuad,
  easeOutCubic,
  trailCapacity,
} from "./dot-shader";

export type DotBustHandle = { replay: () => void };

// Turning works like three.js OrbitControls held level: a drag the canvas height long is one full
// turn, with no limit, and the turn trails the pointer and glides to a stop (DAMPING per 60 Hz frame).
const DRAG_TURN = Math.PI * 2;
const DAMPING = 0.05;
const DRAG_SLOP = 6; // px before a press counts as a drag rather than a tap
const SHOWN = 0.8; // share of the bust height in frame, from the top of the head; the rest of the chest runs off the bottom edge
const TAU = Math.PI * 2;
const MIN_SPAN = 0.4; // narrowest tone range the levels stretch to the full dot range
const MAX_GAMMA = 1.6;

// Tone of a rendered frame, over the covered pixels: the 2nd and 98th percentile of sRGB luma, and
// the gamma that puts the median halfway, so a mostly lit surface still spreads across dot sizes.
function renderLevels(renderer: THREE.WebGLRenderer, rt: THREE.WebGLRenderTarget): [number, number, number] {
  const { width: w, height: h } = rt;
  const px = new Uint8Array(w * h * 4);
  renderer.readRenderTargetPixels(rt, 0, 0, w, h, px);
  const hist = new Uint32Array(256);
  let n = 0;
  for (let i = 0; i < px.length; i += 16) {
    const a = px[i + 3];
    if (a < 200) continue;
    const lin = (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / a;
    hist[Math.min(255, Math.round(Math.pow(lin, 1 / 2.2) * 255))]++;
    n++;
  }
  if (!n) return [0, 1, 1];
  const at = (q: number) => {
    let acc = 0;
    for (let v = 0; v < 256; v++) {
      acc += hist[v];
      if (acc >= q * n) return v / 255;
    }
    return 1;
  };
  // A narrow range (an evenly lit clay sculpt) is stretched to at most MIN_SPAN, so faint shading
  // doesn't turn into hard contrast. The gamma only brightens, or darkens a little: darkening hard
  // to centre a mostly bright render crushes the mid-tones of the face.
  const hi = at(0.98);
  const lo = Math.min(at(0.02), hi - MIN_SPAN);
  const mid = Math.min(0.95, Math.max(0.05, (at(0.5) - lo) / (hi - lo)));
  return [lo, hi, Math.min(MAX_GAMMA, Math.log(0.5) / Math.log(mid))];
}

// The colour the canvas sits on: the first opaque background up the tree, else the body's.
function pageColour(el: HTMLElement): [number, number, number] {
  for (let n: HTMLElement | null = el; n; n = n.parentElement) {
    const m = getComputedStyle(n).backgroundColor.match(/[\d.]+/g);
    if (m && (m.length < 4 || Number(m[3]) > 0.5)) return [Number(m[0]), Number(m[1]), Number(m[2])];
  }
  return [255, 255, 255];
}

export function DotBust({
  src,
  label,
  cell = 6,
  raw = false,
  look = "texture",
  rotation = [0, 0, 0],
  className,
  ref,
}: {
  src: string;
  label: string;
  /** Resting cell size in CSS px. */
  cell?: number;
  /** Show the plain 3D render instead of the dots. */
  raw?: boolean;
  /** "texture" keeps the model's colours; "clay" renders it as a plain sculpture, so only light and form drive the dots. */
  look?: "texture" | "clay";
  /** Corrects the model's orientation (radians, XYZ) so it faces the camera upright. */
  rotation?: [number, number, number];
  className?: string;
  ref?: Ref<DotBustHandle>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dark = useDark();
  const live = useRef({ dark, cell, raw, look });
  const replayRef = useRef<() => void>(() => {});
  const wakeRef = useRef<() => void>(() => {});
  const [rx, ry, rz] = rotation;

  useImperativeHandle(ref, () => ({ replay: () => replayRef.current() }), []);

  useEffect(() => {
    live.current = { dark, cell, raw, look };
    wakeRef.current();
  }, [dark, cell, raw, look]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement ?? canvas;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const still = () => reduce.matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);
    const TRAIL = trailCapacity(renderer.capabilities.maxFragmentUniforms);

    // The bust.
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.1);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 2.8);
    key.position.set(-2, 3, 4);
    const fill = new THREE.DirectionalLight(0xffffff, 0.9);
    fill.position.set(3, 1, 3);
    const top = new THREE.DirectionalLight(0xffffff, 0.5);
    top.position.set(0, 6, 1);
    const back = new THREE.DirectionalLight(0xffffff, 0.4);
    back.position.set(0, 1, -5);
    scene.add(key, fill, top, back);
    const pivot = new THREE.Group(); // sway and drag turn this
    scene.add(pivot);

    const rt = new THREE.WebGLRenderTarget(1, 1, { samples: 4 });

    // The dot pass: a full-screen triangle through the shared shader.
    const uniforms = {
      u_tex: { value: rt.texture },
      u_res: { value: new THREE.Vector2(1, 1) },
      u_cell: { value: 6 },
      u_fit: { value: new THREE.Vector4(1, 1, 0, 0) },
      u_levels: { value: new THREE.Vector2(0, 1) },
      u_gamma: { value: 1 },
      u_ink: { value: new THREE.Vector3(1, 1, 1) },
      u_bg: { value: new THREE.Vector3(0, 0, 0) },
      u_invert: { value: 0 },
      u_time: { value: 0 },
      u_reveal: { value: 1 },
      u_mouse: { value: new THREE.Vector2(-1e5, -1e5) },
      u_vel: { value: 0 },
      u_radius: { value: 100 },
      u_trail: { value: new Float32Array(TRAIL * 3) },
      u_trailCount: { value: 0 },
    };
    const tri = new THREE.BufferGeometry();
    tri.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
    const dotMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: "void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: dotFrag(TRAIL, { linearSource: true }),
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    const quad = new THREE.Mesh(tri, dotMat);
    quad.frustumCulled = false;
    const quadScene = new THREE.Scene();
    quadScene.add(quad);
    const quadCam = new THREE.Camera();

    let model: THREE.Object3D | null = null;
    let size = new THREE.Vector3(1, 1, 1);
    let dpr = 1;
    let disposed = false;
    let raf = 0;
    let lastFrame = 0;
    let introStart = -1;
    let visible = true;
    let levelsSet = false;
    let bgFor: boolean | null = null; // the theme u_bg was read for
    // After a turn the tone is measured again from the new view and eased to, so the back of the head
    // gets its own contrast without a snap. 0 means no measurement is waiting.
    let remeasureAt = 0;
    const toneGoal = { lo: 0, hi: 1, gamma: 1 };
    const measureTone = () => {
      const [lo, hi, gamma] = renderLevels(renderer, rt);
      toneGoal.lo = lo;
      toneGoal.hi = hi;
      toneGoal.gamma = gamma;
    };
    let lookNow: "texture" | "clay" | null = null;
    const textured = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
    const clay = new THREE.MeshStandardMaterial({ color: 0xb4b4b4, roughness: 0.9, metalness: 0 });
    // Per look: [hemisphere, key, fill, top, back]. Textures are dark and need even light; clay needs
    // a strong key and little fill, so the form reads as light against shadow without clipping.
    const LIGHTS = { texture: [1.1, 2.8, 0.9, 0.5, 0.4], clay: [0.35, 2.4, 0.3, 0.35, 0.8] } as const;
    const applyLook = (want: "texture" | "clay") => {
      if (want === lookNow) return;
      for (const [mesh, mat] of textured) mesh.material = want === "clay" ? clay : mat;
      // Plain assignments: the production minifier mangles destructuring into properties.
      const l = LIGHTS[want];
      hemi.intensity = l[0];
      key.intensity = l[1];
      fill.intensity = l[2];
      top.intensity = l[3];
      back.intensity = l[4];
      lookNow = want;
      levelsSet = false;
    };
    let yaw = 0;
    let yawTarget = 0;
    let drag: { x: number; yaw: number; moved: boolean } | null = null;

    // Fit the camera so the whole bust fits the canvas with a little margin, slightly above centre.
    // Frame the top SHOWN of the bust so it draws large, with the cut on the
    // bottom edge; back off only if the shoulders would be cut at the sides.
    const frame = () => {
      const aspect = canvas.width / Math.max(1, canvas.height);
      camera.aspect = aspect;
      const vFov = (camera.fov * Math.PI) / 180;
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
      const front = size.z / 2;
      const byWidth = (size.x / 2) * 0.98 / Math.tan(hFov / 2);
      const byHeight = (size.y * SHOWN / 2) * 1.04 / Math.tan(vFov / 2);
      const dist = Math.max(byWidth, byHeight) + front;
      const halfH = (dist - front) * Math.tan(vFov / 2);
      const y = size.y / 2 - size.y * SHOWN + halfH; // view centre that puts the cut on the bottom edge
      camera.position.set(0, y, dist);
      camera.lookAt(0, y, 0);
      camera.updateProjectionMatrix();
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(rect.width, rect.height, false);
      rt.setSize(canvas.width, canvas.height);
      uniforms.u_res.value.set(canvas.width, canvas.height);
      frame();
      return true;
    };

    const draw = (now: number) => {
      if (!model) return false;
      const { dark, cell, raw, look } = live.current;
      applyLook(look);
      const dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 1 / 60;
      lastFrame = now;
      const t = now / 1000;

      // Idle sway (as on the reference: a few slow, small sines) plus the drag turn, damped.
      yaw += (yawTarget - yaw) * (still() ? 1 : 1 - (1 - DAMPING) ** (dt * 60));
      const sway = still() ? 0 : 1;
      pivot.rotation.y = yaw + sway * (0.03 * Math.sin(0.15 * t * TAU) + 0.018 * Math.sin(0.07 * t * TAU));
      pivot.rotation.x = sway * (0.01 * Math.sin(0.12 * t * TAU) + 0.007 * Math.sin(0.05 * t * TAU));
      pivot.rotation.z = sway * 0.005 * Math.sin(0.09 * t * TAU);
      pivot.position.y = sway * 0.002 * size.y * Math.sin(0.25 * t * TAU);

      if (raw) {
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
        return !still();
      }

      renderer.setRenderTarget(rt);
      renderer.clear();
      renderer.render(scene, camera);
      const levels = uniforms.u_levels.value;
      if (!levelsSet) {
        measureTone();
        levels.set(toneGoal.lo, toneGoal.hi);
        uniforms.u_gamma.value = toneGoal.gamma;
        levelsSet = true;
      } else if (remeasureAt && now >= remeasureAt) {
        measureTone();
        remeasureAt = 0;
        if (still()) {
          levels.set(toneGoal.lo, toneGoal.hi);
          uniforms.u_gamma.value = toneGoal.gamma;
        }
      }
      const ease = 1 - Math.exp(-dt / 0.3);
      levels.x += (toneGoal.lo - levels.x) * ease;
      levels.y += (toneGoal.hi - levels.y) * ease;
      uniforms.u_gamma.value += (toneGoal.gamma - uniforms.u_gamma.value) * ease;

      let reveal = 1;
      let cellPx = cell;
      if (!still() && introStart >= 0) {
        const e = now - introStart;
        reveal = easeInOutQuad(Math.min(e / REVEAL_MS, 1));
        cellPx = INTRO_CELL + (cell - INTRO_CELL) * easeOutCubic(Math.min(e / SHRINK_MS, 1));
        if (e >= SHRINK_MS) introStart = -1;
      }
      const n = scramble.step(dt);
      const ink = dark ? INK_DARK : INK_LIGHT;
      uniforms.u_cell.value = Math.max(2, cellPx * dpr);
      uniforms.u_ink.value.set(ink[0] / 255, ink[1] / 255, ink[2] / 255);
      if (bgFor !== dark) {
        const [r, g, b] = pageColour(canvas);
        uniforms.u_bg.value.set(r / 255, g / 255, b / 255);
        bgFor = dark;
      }
      uniforms.u_invert.value = 0; // dot size follows the light in both themes, as on the reference
      uniforms.u_time.value = t % 1000;
      uniforms.u_reveal.value = reveal;
      uniforms.u_mouse.value.set(scramble.mouse.x, scramble.mouse.y);
      uniforms.u_vel.value = still() ? 0 : scramble.vel;
      uniforms.u_radius.value = scramble.radiusScale * canvas.height;
      uniforms.u_trail.value = scramble.buf;
      uniforms.u_trailCount.value = still() ? 0 : n;

      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(quadScene, quadCam);
      return !still();
    };

    const loop = (now: number) => {
      raf = 0;
      const moving = draw(now);
      if (moving && visible && !disposed) raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (disposed) return;
      if (still()) {
        lastFrame = 0;
        draw(performance.now());
        return;
      }
      if (!raf && visible) raf = requestAnimationFrame(loop);
    };
    wakeRef.current = wake;

    const scramble = new Scramble(canvas, TRAIL, wake, still);
    scramble.attach(host);

    const replay = () => {
      introStart = still() ? -1 : performance.now();
      wake();
    };
    replayRef.current = replay;

    // Drag sideways to turn the bust, all the way round if wanted. The pointer is captured, so the
    // turn carries on when it leaves the plate; a vertical swipe on touch still scrolls the page.
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag = { x: e.clientX, yaw: yawTarget, moved: false };
      host.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < DRAG_SLOP) return;
      drag.moved = true;
      const h = canvas.getBoundingClientRect().height || 1;
      yawTarget = drag.yaw + (dx / h) * DRAG_TURN;
      wake();
    };
    const onUp = (e: PointerEvent) => {
      // Measure once the damped turn has settled.
      if (drag?.moved) {
        remeasureAt = performance.now() + (still() ? 0 : 900);
        wake();
      }
      drag = null;
      if (host.hasPointerCapture?.(e.pointerId)) host.releasePointerCapture(e.pointerId);
    };
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onUp);

    const ro = new ResizeObserver(() => {
      if (resize()) wake();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    io.observe(canvas);

    // Meshopt-compressed models (EXT_meshopt_compression) need the decoder; others load as before.
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
      src,
      (gltf) => {
        if (disposed) return;
        const root = gltf.scene;
        root.rotation.set(rx, ry, rz);
        root.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          // Some generators (TRELLIS v1) ship no normals; lit materials then render black.
          if (!mesh.geometry.attributes.normal) mesh.geometry.computeVertexNormals();
          textured.set(mesh, mesh.material);
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const m of mats) {
            // Generated models often come out metallic; without an environment map that renders black.
            const std = m as THREE.MeshStandardMaterial;
            if (std.isMeshStandardMaterial) {
              std.metalness = 0;
              std.roughness = Math.max(std.roughness, 0.7);
            }
          }
        });
        // Centre the model on the origin.
        const box = new THREE.Box3().setFromObject(root);
        size = box.getSize(new THREE.Vector3());
        const centre = box.getCenter(new THREE.Vector3());
        const holder = new THREE.Group();
        root.position.sub(centre);
        holder.add(root);
        pivot.add(holder);
        model = holder;
        resize();
        replay();
      },
      undefined,
      (err) => console.error("could not load", src, err),
    );

    const onReduce = () => {
      if (still()) {
        introStart = -1;
        scramble.reset();
      }
      wake();
    };
    reduce.addEventListener("change", onReduce);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      scramble.dispose();
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      reduce.removeEventListener("change", onReduce);
      wakeRef.current = () => {};
      replayRef.current = () => {};
      for (const [mesh, mat] of textured) mesh.material = mat;
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) {
          for (const v of Object.values(m)) if (v instanceof THREE.Texture) v.dispose();
          m.dispose();
        }
      });
      clay.dispose();
      tri.dispose();
      dotMat.dispose();
      rt.dispose();
      renderer.dispose();
    };
  }, [src, rx, ry, rz]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", touchAction: "pan-y" }}
    />
  );
}

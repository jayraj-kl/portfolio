"use client";

import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";
import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { whenIdle, whenNear } from "@/hooks/use-near";
import { cn } from "@/lib/utils";
// The package keeps its vertex shader to itself, and the warm-up below has to compile exactly
// the pair of shaders ShaderMount will, so it is read from the package's own file.
import { vertexShaderSource } from "../../node_modules/@paper-design/shaders/dist/vertex-shader.js";

// ShaderMount compiles its program in step with the page, and through Direct3D (Chrome on
// Windows) the liquid-metal program takes about 300ms, during which nothing else on the page
// moves. But the browser keeps compiled programs for the whole page: a second context asking
// for the same two shaders gets its program in a few milliseconds. So the pair is compiled
// once beforehand on a spare context, where KHR_parallel_shader_compile lets that happen off
// the main thread, and every rim mounts after it. Measured on Iris Xe: 290ms held, down to 10.
// Without the extension, or if anything here fails, it settles at once and the rims mount as
// they always did.
let warmed: Promise<void> | null = null;

export function warmLiquidMetal() {
  return (warmed ??= new Promise<void>((resolve) => {
    try {
      const gl = document
        .createElement("canvas")
        .getContext("webgl2", { antialias: false, depth: false, stencil: false });
      const parallel = gl?.getExtension("KHR_parallel_shader_compile");
      if (!gl || !parallel) return resolve();
      // As ShaderMount does where mediump is too coarse (many phones): the sources must be its.
      let vertex = vertexShaderSource;
      let fragment = liquidMetalFragmentShader;
      const precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT)?.precision;
      if (precision && precision < 23) {
        vertex = vertex.replace(/precision\s+(lowp|mediump)\s+float;/g, "precision highp float;");
        fragment = fragment
          .replace(/precision\s+(lowp|mediump)\s+float/g, "precision highp float")
          .replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g, "$1 highp $3");
      }
      const program = gl.createProgram();
      for (const [type, source] of [
        [gl.VERTEX_SHADER, vertex],
        [gl.FRAGMENT_SHADER, fragment],
      ] as const) {
        const shader = gl.createShader(type);
        if (!shader) return resolve();
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        gl.attachShader(program, shader);
      }
      gl.linkProgram(program);
      const giveUp = performance.now() + 4000;
      const poll = () => {
        if (gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR) || performance.now() > giveUp) resolve();
        else window.setTimeout(poll, 16);
      };
      poll();
    } catch {
      resolve();
    }
  }));
}

// The liquid-metal look from LiquidMetalButton, with every uniform the shader declares set
// (the button's original list left the colour, image and sizing uniforms out).
export const LIQUID_METAL_UNIFORMS = {
  u_colorBack: [0, 0, 0, 0] as [number, number, number, number],
  u_colorTint: [1, 1, 1, 1] as [number, number, number, number],
  u_isImage: false,
  u_repetition: 4,
  u_softness: 0.5,
  u_shiftRed: 0.3,
  u_shiftBlue: 0.3,
  u_distortion: 0,
  u_contour: 0,
  u_angle: 45,
  u_shape: 1,
  // Sizing: a pattern that fills the box, zoomed in so the shape covers it edge to edge.
  u_fit: 0,
  u_scale: 8,
  u_rotation: 0,
  u_offsetX: 0.1,
  u_offsetY: -0.1,
  u_originX: 0.5,
  u_originY: 0.5,
  u_worldWidth: 0,
  u_worldHeight: 0,
};

export const LIQUID_METAL_SPEED = { rest: 0.6, hover: 1, press: 2.4 };

/**
 * Mounts the shader into a div and returns a ref to it, plus a speed setter.
 * Under reduced motion it renders one still frame and ignores speed changes.
 */
export function useLiquidMetal(speed = LIQUID_METAL_SPEED.rest) {
  const ref = useRef<HTMLDivElement>(null);
  const mount = useRef<ShaderMount | null>(null);
  const still = useRef(false);
  // The speed last asked for, so a rim that is hovered before its shader is up starts at it.
  const wanted = useRef(speed);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    wanted.current = speed;
    // A rim's shader is set up once it is near the screen and the program has been compiled in
    // the background (see warmLiquidMetal), and then in a quiet moment, so the rims on a page
    // don't all take their turn in one go while it loads. Until then the fallback gradient shows.
    let gone = false;
    let cancelIdle = () => {};
    const warm = warmLiquidMetal();
    const cancelNear = whenNear(
      el,
      async () => {
        await warm;
        if (gone) return;
        cancelIdle = whenIdle(() => {
          try {
            mount.current = new ShaderMount(
              el,
              liquidMetalFragmentShader,
              LIQUID_METAL_UNIFORMS,
              undefined,
              still.current ? 0 : wanted.current,
            );
          } catch {
            // No WebGL: the static fallback gradient on the element stays.
            mount.current = null;
          }
        });
      },
      "50%",
    );
    return () => {
      gone = true;
      cancelNear();
      cancelIdle();
      mount.current?.dispose();
      mount.current = null;
    };
  }, [speed]);

  const setSpeed = useCallback((next: number) => {
    wanted.current = next;
    if (!still.current) mount.current?.setSpeed(next);
  }, []);

  return { ref, setSpeed };
}

// Seen before the shader draws, or instead of it without WebGL.
const FALLBACK = "linear-gradient(135deg, #f4f4f4 0%, #9a9a9a 35%, #ededed 55%, #7c7c7c 80%, #e6e6e6 100%)";

// Cuts the metal down to the rim: everything inside the padding box is masked away.
const RING_MASK: CSSProperties = {
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
};

/**
 * Wraps an element in a liquid-metal rim: the shader fills the box behind it and the child sits
 * inset by `rim`, so only a thin animated band shows. The child brings its own background.
 * `hollow` masks the metal to the rim alone, for a translucent child (glass) that would
 * otherwise show the metal through its middle.
 */
export function LiquidMetalBorder({
  children,
  radius,
  rim = 2,
  hollow = false,
  press = false,
  className,
  style,
}: {
  children: ReactNode;
  /** Outer corner radius in px; the child's should be `radius - rim`. Use 9999 for a pill. */
  radius: number;
  rim?: number;
  hollow?: boolean;
  /** For a rim around one control: the metal races while the control is held down. */
  press?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const { ref, setSpeed } = useLiquidMetal();
  return (
    <div
      className={cn("relative isolate", className)}
      style={{ borderRadius: radius, padding: rim, ...style }}
      onPointerEnter={() => setSpeed(LIQUID_METAL_SPEED.hover)}
      onPointerLeave={() => setSpeed(LIQUID_METAL_SPEED.rest)}
      onPointerDown={press ? () => setSpeed(LIQUID_METAL_SPEED.press) : undefined}
      // A mouse is still over the rim after the press; a finger has gone.
      onPointerUp={
        press
          ? (e) => setSpeed(e.pointerType === "mouse" ? LIQUID_METAL_SPEED.hover : LIQUID_METAL_SPEED.rest)
          : undefined
      }
      onPointerCancel={press ? () => setSpeed(LIQUID_METAL_SPEED.rest) : undefined}
    >
      <div
        ref={ref}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden [&>canvas]:!absolute [&>canvas]:inset-0 [&>canvas]:!h-full [&>canvas]:!w-full"
        style={{ borderRadius: radius, background: FALLBACK, ...(hollow ? { padding: rim, ...RING_MASK } : null) }}
      />
      {children}
    </div>
  );
}

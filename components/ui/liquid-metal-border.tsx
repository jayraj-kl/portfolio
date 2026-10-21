"use client";

import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";
import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      mount.current = new ShaderMount(
        el,
        liquidMetalFragmentShader,
        LIQUID_METAL_UNIFORMS,
        undefined,
        still.current ? 0 : speed,
      );
    } catch {
      // No WebGL: the static fallback gradient on the element stays.
      mount.current = null;
    }
    return () => {
      mount.current?.dispose();
      mount.current = null;
    };
  }, [speed]);

  const setSpeed = useCallback((next: number) => {
    if (!still.current) mount.current?.setSpeed(next);
  }, []);

  return { ref, setSpeed };
}

// Seen before the shader draws, or instead of it without WebGL.
const FALLBACK = "linear-gradient(135deg, #f4f4f4 0%, #9a9a9a 35%, #ededed 55%, #7c7c7c 80%, #e6e6e6 100%)";

/**
 * Wraps an element in a liquid-metal rim: the shader fills the box behind it and the child sits
 * inset by `rim`, so only a thin animated band shows. The child brings its own background.
 */
export function LiquidMetalBorder({
  children,
  radius,
  rim = 2,
  className,
  style,
}: {
  children: ReactNode;
  /** Outer corner radius in px; the child's should be `radius - rim`. Use 9999 for a pill. */
  radius: number;
  rim?: number;
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
    >
      <div
        ref={ref}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden [&>canvas]:!absolute [&>canvas]:inset-0 [&>canvas]:!h-full [&>canvas]:!w-full"
        style={{ borderRadius: radius, background: FALLBACK }}
      />
      {children}
    </div>
  );
}

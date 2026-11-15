'use client';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

export type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  /** Pixels per second. */
  speed?: number;
  /** Pixels per second while the pointer is over it. */
  speedOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

// A marquee: the children twice over, sliding by one copy's length and starting again, so it
// never ends. It runs as a single Web Animation of `transform`, which the browser plays on its
// compositor: it keeps moving at full frame rate however busy the page's main thread is (the
// earlier version stepped it from JavaScript every frame, so it stuttered while the page loaded).
// Hovering eases it to `speedOnHover` by changing the animation's rate, which keeps its place.
export function InfiniteSlider({
  children,
  gap = 16,
  speed = 100,
  speedOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const track = useRef<HTMLDivElement>(null);
  const anim = useRef<Animation | null>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const horizontal = direction === 'horizontal';

    const start = () => {
      // Both copies plus the gap between them; one copy and one gap is a full cycle.
      const size = horizontal ? el.scrollWidth : el.scrollHeight;
      const distance = (size + gap) / 2;
      if (!distance) return;
      const duration = (distance / speed) * 1000;
      // A new size (fonts or icons landing) restarts it at the same point in its cycle.
      const prev = anim.current;
      const prevDuration = Number(prev?.effect?.getTiming().duration) || 0;
      const progress = prev && prevDuration ? ((Number(prev.currentTime) || 0) % prevDuration) / prevDuration : 0;
      const rate = prev?.playbackRate ?? 1;
      prev?.cancel();
      const to = horizontal ? `translateX(${-distance}px)` : `translateY(${-distance}px)`;
      const next = el.animate([{ transform: 'translate(0, 0)' }, { transform: to }], {
        duration,
        iterations: Infinity,
        easing: 'linear',
        direction: reverse ? 'reverse' : 'normal',
      });
      next.currentTime = progress * duration;
      next.playbackRate = rate;
      anim.current = next;
    };

    // Fires once as it starts observing, which starts the marquee, and again on any resize.
    const ro = new ResizeObserver(start);
    ro.observe(el);
    return () => {
      ro.disconnect();
      anim.current?.cancel();
      anim.current = null;
    };
  }, [gap, speed, direction, reverse]);

  const setRate = (pxPerSecond: number) => {
    const a = anim.current;
    if (!a) return;
    // updatePlaybackRate changes the rate without a jump; older browsers set it outright.
    if (typeof a.updatePlaybackRate === 'function') a.updatePlaybackRate(pxPerSecond / speed);
    else a.playbackRate = pxPerSecond / speed;
  };

  return (
    <div className={cn('overflow-hidden', className)}>
      <div
        ref={track}
        className='flex w-max'
        style={{
          gap: `${gap}px`,
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
          willChange: 'transform',
        }}
        onPointerEnter={speedOnHover ? () => setRate(speedOnHover) : undefined}
        onPointerLeave={speedOnHover ? () => setRate(speed) : undefined}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

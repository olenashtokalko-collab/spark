// Layout 5's figure (13 Nov, review): Spark's four shapes in jelly glass, rendered in Blender (blender/morph_four.py)
// and played as a loop: the spark (Ember orange) → the prism (violet) → the orb (magenta) → the key (Cobalt blue) →
// the spark again, each pouring into the next. "We bring Sparks to Light": find the spark, power it up (the prism,
// one idea every format), bring it to light (the orb); the key is the five capabilities. Rendered on black and laid
// over the dark band with `mix-blend-mode: screen`, so only the glass and its light show. The glow behind it (--mc on
// its box) follows the video's colour. With reduced motion it holds the first frame (the poster).
import { useEffect, useRef } from 'react';

// the render's timing (morph_four.py): 42 frames on a shape, 36 pouring into the next, at 30 fps
const HOLD = 42 / 30;
const MELT = 36 / 30;
const COLS: [number, number, number][] = [
  [255, 106, 31], // spark, Ember orange
  [106, 60, 240], // prism, violet
  [210, 58, 200], // orb, magenta
  [42, 85, 255], // key, Cobalt blue
];

/** light: the same loop rendered on Sand, for a light page (Layout 5 · Scenes); it sits on the page with no blending. */
export function MorphVideo({ className, light }: { className?: string; light?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const base = light ? 'morph-sand' : 'morph';
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const box = v.parentElement;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still) {
      v.pause();
      v.removeAttribute('autoplay');
    }
    let raf = 0;
    const tick = () => {
      const per = HOLD + MELT;
      const t = v.currentTime % (per * COLS.length);
      const i = Math.floor(t / per);
      const ph = t - i * per;
      const x = ph < HOLD ? 0 : (ph - HOLD) / MELT;
      const e = x * x * (3 - 2 * x);
      const a = COLS[i], b = COLS[(i + 1) % COLS.length];
      box?.style.setProperty('--mc', `rgb(${a.map((c, k) => Math.round(c + (b[k] - c) * e)).join(' ')})`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [light]);
  return (
    <video key={light ? 'light' : 'dark'} ref={ref} className={className} autoPlay muted loop playsInline preload="auto" poster={`brand/morph/${base}-poster.webp`} aria-hidden>
      <source src={`brand/morph/${base}.webm`} type="video/webm" />
      <source src={`brand/morph/${base}.mp4`} type="video/mp4" />
    </video>
  );
}

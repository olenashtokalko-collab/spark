// The assistant's presence: a rotating sphere of dots (from the shared
// references, and a nod to Spark's dot-matrix type). A band of blue drifts
// slowly across the neutral white dots; it spins faster while the assistant
// works. Pure canvas, no dependencies.
import { useEffect, useRef } from 'react';

interface Props {
  size?: number;
  active?: boolean;
  density?: number;
  className?: string;
  /** Draw one frame and stop: for static illustrations (e.g. chat excerpts). */
  still?: boolean;
}

export function DotSphere({ size = 120, active = false, density = 260, className, still = false }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    el.width = size * dpr;
    el.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Fibonacci sphere with a little jitter so it reads as organic, not a grid.
    const pts = Array.from({ length: density }, (_, i) => {
      const y = 1 - (i / (density - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = i * Math.PI * (3 - Math.sqrt(5));
      const j = 0.06;
      return {
        x: Math.cos(th) * r + (Math.random() - 0.5) * j,
        y: y + (Math.random() - 0.5) * j,
        z: Math.sin(th) * r + (Math.random() - 0.5) * j,
        s: 0.6 + Math.random() * 0.8,
      };
    });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let angle = 0;
    let speed = 0.004;
    let energy = 0;
    let raf = 0;
    let light = false;
    let frame = 0;
    const readTheme = () => {
      light = document.documentElement.dataset.theme === 'sand';
    };
    readTheme();

    const draw = (t: number) => {
      if (++frame % 45 === 0) readTheme(); // follow theme switches
      const target = activeRef.current ? 1 : 0;
      energy += (target - energy) * 0.05;
      speed = 0.003 + energy * 0.022;
      if (!reduce) angle += speed;
      ctx.clearRect(0, 0, size, size);
      const R = size * 0.42 * (1 + energy * 0.04 * Math.sin(t / 240));
      const cx = size / 2;
      const cy = size / 2;
      const tilt = 0.38;
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);
      for (const p of pts) {
        const x1 = p.x * ca - p.z * sa;
        const z1 = p.x * sa + p.z * ca;
        const y2 = p.y * ct - z1 * st;
        const z2 = p.y * st + z1 * ct;
        const depth = (z2 + 1) / 2; // 0 back, 1 front
        const px = cx + x1 * R;
        const py = cy + y2 * R;
        const rad = Math.max(0.35, (size / 150) * p.s * (0.55 + depth * 0.9));
        ctx.globalAlpha = 0.12 + depth * 0.85;
        // Neutral flowing into blue: a gradient band drifts across the surface.
        // Dark theme: white to blue. Light theme: slate to blue.
        const f = (Math.sin(x1 * 1.4 + y2 * 0.9 + t / 2400) + 1) / 2;
        ctx.fillStyle = light ? `hsl(222 ${20 + f * 75}% ${28 + f * 22}%)` : `hsl(222 ${f * 95}% ${92 - f * 26 + depth * 4}%)`;
        ctx.shadowColor = 'hsl(222 90% 60%)';
        ctx.shadowBlur = depth > 0.75 ? size / 60 : 0;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      if (!still) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [size, density, still]);

  return (
    <canvas
      ref={canvas}
      className={['dot-sphere', active && 'is-active', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

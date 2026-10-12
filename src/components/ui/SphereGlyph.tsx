// Spark AI's icon: a still, small version of the landing sphere, used where
// the sparkles icon used to be (AI buttons, the Spark AI tag).

/** A still, icon-sized drawing of the landing sphere, built the same way:
 *  a jittered Fibonacci sphere, the same tilt and size ratio, dots that grow
 *  and brighten towards the front, and the same white-to-blue flow. Fewer and
 *  slightly larger dots than the big one so it still reads at 14–20px. */
const GLYPH = (() => {
  const n = 96;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; // stable jitter
  const tilt = 0.38;
  const turn = 0.9;
  const R = 24 * 0.42;
  return Array.from({ length: n }, (_, i) => {
    const y0 = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y0 * y0);
    const th = i * Math.PI * (3 - Math.sqrt(5));
    const j = 0.06;
    const x = Math.cos(th) * r + (rnd() - 0.5) * j;
    const y = y0 + (rnd() - 0.5) * j;
    const z = Math.sin(th) * r + (rnd() - 0.5) * j;
    const sz = 0.6 + rnd() * 0.8;
    const x1 = x * Math.cos(turn) - z * Math.sin(turn);
    const z1 = x * Math.sin(turn) + z * Math.cos(turn);
    const y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt);
    const z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);
    const depth = (z2 + 1) / 2;
    const f = (Math.sin(x1 * 1.4 + y2 * 0.9 + 1.2) + 1) / 2;
    return {
      cx: 12 + x1 * R,
      cy: 12 + y2 * R,
      r: Math.max(0.3, 0.42 * sz * (0.55 + depth * 0.9)),
      o: 0.12 + depth * 0.85,
      fill: `hsl(222 ${f * 95}% ${92 - f * 26 + depth * 4}%)`,
      depth,
    };
  }).sort((a, b) => a.depth - b.depth); // back dots first, front on top
})();

export function SphereGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="sphere-glyph">
      {GLYPH.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} opacity={d.o} />
      ))}
    </svg>
  );
}

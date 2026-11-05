import type { CSSProperties, ReactNode } from 'react';

/** Spark's light going round the input's edge (5 Nov, "Rotate · soft" of #/demo/mascot, after Border beam on
 *  libraries.dev): colour flares inside the edge where the light passes, no line on the border, one turn in
 *  3.5 seconds. Wraps the box; `radius` matches the box's corners. */
export function BeamEdge({ children, radius = 24, seconds = 3.5, className }: { children: ReactNode; radius?: number; seconds?: number; className?: string }) {
  return (
    <div className={['msc-beam msc-beam--soft is-on', className].filter(Boolean).join(' ')} style={{ '--beam-r': `${radius}px`, '--beam-dur': `${seconds}s` } as CSSProperties}>
      <span className="msc-beam__glow" aria-hidden />
      {children}
    </div>
  );
}

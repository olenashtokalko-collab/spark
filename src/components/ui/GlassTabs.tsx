// Filter tabs in glass (picked on #/demo/brand-glass, 04 · Tabs, D): a clear glass bubble marks the picked tab and
// slides to the next one; hovering another tab leaves a frosted trace under it and the bubble leans towards it, as
// a drop of liquid would. Used for the filter tabs on Requests and Documents, the grid / list switch on Documents
// (icons, `title` names them) and the amount in Top up credits (`kind="radio"`, `fill` to the width).
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from './primitives';

export type GlassTab<T extends string> = { value: T; label: ReactNode; count?: number; you?: boolean; title?: string };

export function GlassTabs<T extends string>({
  items,
  value,
  onChange,
  label,
  className,
  kind = 'tabs',
  fill,
}: {
  items: GlassTab<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
  /** `radio` for a choice of values (an amount), not of views. */
  kind?: 'tabs' | 'radio';
  /** Stretch to the width, the options sharing it. */
  fill?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const [pos, setPos] = useState({ x: 0, w: 0 });
  const [hpos, setHpos] = useState({ x: 0, w: 0 });
  const [tick, setTick] = useState(0);
  const on = Math.max(0, items.findIndex((i) => i.value === value));

  // Measure again once the brand font has loaded and whenever the tabs change size (a count changes, the page
  // narrows): the first measure can run on the fallback face.
  useEffect(() => {
    const again = () => setTick((t) => t + 1);
    document.fonts?.ready.then(again);
    const ro = new ResizeObserver(again);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, []);
  useLayoutEffect(() => {
    const b = refs.current[on];
    if (b) setPos({ x: b.offsetLeft, w: b.offsetWidth });
  }, [on, tick, items.length]);
  useLayoutEffect(() => {
    const b = hover === null ? null : refs.current[hover];
    if (b) setHpos({ x: b.offsetLeft, w: b.offsetWidth });
  }, [hover, tick]);

  const away = hover !== null && hover !== on;
  const lean = away ? 8 : 0;
  const marker = away && hover! < on ? { x: pos.x - lean, w: pos.w + lean } : { x: pos.x, w: pos.w + lean };

  return (
    <div ref={box} className={cx('gtabs', fill && 'gtabs--fill', className)} role={kind === 'radio' ? 'radiogroup' : 'tablist'} aria-label={label} onMouseLeave={() => setHover(null)}>
      <span className={cx('gtabs__trace', away && 'is-on')} style={{ transform: `translateX(${hpos.x}px)`, width: hpos.w }} aria-hidden />
      <span className={cx('gtabs__bubble', hover === on && 'is-hover', pos.w === 0 && 'is-unset')} style={{ transform: `translateX(${marker.x}px)`, width: marker.w }} aria-hidden />
      {items.map((it, i) => (
        <button
          key={it.value}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role={kind === 'radio' ? 'radio' : 'tab'}
          aria-selected={kind === 'radio' ? undefined : i === on}
          aria-checked={kind === 'radio' ? i === on : undefined}
          aria-label={it.title}
          data-tip={it.title}
          className={cx(i === on && 'is-on', it.title && 'is-icon')}
          onClick={() => onChange(it.value)}
          onMouseEnter={() => setHover(i)}
        >
          {it.label}
          {it.count !== undefined && <span className={cx('gtabs__n', it.you && it.count > 0 && 'is-you')}>{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

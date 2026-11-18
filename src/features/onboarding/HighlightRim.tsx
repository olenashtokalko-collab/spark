// The next-step highlight in the Ask Dr.AI button's metal (17 Nov, review: "the highlight is dated: update it to the
// button's version, reuse its metal; show a few variants"). The same liquid metal, tinted Cobalt to Ember, drawn
// round the target as a rim with its halo; four looks to compare on #/demo/highlight-metal, the one picked used by
// Sparki's guide (kept in this browser).
import { useSyncExternalStore, type CSSProperties } from 'react';
import { MetalRim } from '../../components/ui/MetalButton';
import { cx } from '../../components/ui/primitives';

export type HlLook = 'metal' | 'fine' | 'glass' | 'chrome';

export const HL_LOOKS: { id: HlLook; name: string; note: string }[] = [
  { id: 'metal', name: 'A · As the button', note: 'The Ask Dr.AI button’s own rim: 2.5 px of the Noor-tinted metal, its lines flowing, the soft halo round it.' },
  { id: 'fine', name: 'B · Fine', note: 'The same metal at 1.5 px with a fainter halo: the quietest; the target reads first, the light second.' },
  { id: 'glass', name: 'C · Metal under glass', note: 'A wider band of metal, 5 px, under clear glass with a bright top edge, as the button’s face; more of an object.' },
  { id: 'chrome', name: 'D · Chrome', note: 'The metal untinted, grey chrome with only its thin red and blue edge split for colour; neutral on any page.' },
];

const KEY = 'spark-hl-look';
const subs = new Set<() => void>();
const read = (): HlLook => {
  try {
    const v = localStorage.getItem(KEY) as HlLook | null;
    return v && HL_LOOKS.some((l) => l.id === v) ? v : 'fine';
  } catch {
    return 'fine';
  }
};
export function setHlLook(v: HlLook) {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* the pick lasts this visit only */
  }
  subs.forEach((f) => f());
}
export function useHlLook() {
  return useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    read,
    () => 'fine' as HlLook,
  );
}

const WIDTH: Record<HlLook, number> = { metal: 2.5, fine: 1.5, glass: 5, chrome: 2 };

/** The rim round a target: `style` places it (6 px outside the target) and gives it the target's corners. */
export function HighlightRim({ look, style, className, still }: { look: HlLook; style?: CSSProperties; className?: string; /** the metal held still, no flowing lines (the guide's rim) */ still?: boolean }) {
  return (
    <span className={cx('hlm', `hlm--${look}`, className)} style={style} aria-hidden>
      <MetalRim key={look} tone={look === 'chrome' ? 'chrome' : 'spark'} width={WIDTH[look]} still={still} />
      {look === 'glass' && <span className="hlm__glass" />}
    </span>
  );
}

// A folder on the Documents page (picked on #/demo/folders, D with the card in the page colour): a
// pastel folder glyph, the name and one line, and template sheets standing in a frosted folder front.
import type { CSSProperties, ReactNode } from 'react';
import type { Folder } from '../../data/types';
import { cx } from '../../components/ui/primitives';

// A tint per folder from the palette: Cobalt, Haze, the Noor mixes (violet, pink) and Ember.
// The client's own folder is Ink, so it never reads as one of Spark's.
const TINT: Record<string, string> = {
  'f-guidelines': 'var(--cobalt)',
  'f-strategy': 'color-mix(in srgb, var(--haze) 45%, var(--cobalt))',
  'f-proposals': 'color-mix(in oklch, var(--cobalt) 65%, var(--ember))',
  'f-creative': 'var(--ember)',
  'f-research': 'color-mix(in oklch, var(--cobalt) 40%, var(--ember))',
  'f-uploads': 'var(--ink)',
};

/** A folder's tint; a subfolder takes its top folder's. */
export function folderTint(folders: Folder[], id: string): string {
  let f = folders.find((x) => x.id === id);
  while (f?.parentId) f = folders.find((x) => x.id === f!.parentId);
  return (f && TINT[f.id]) ?? 'var(--cobalt)';
}

// The folder front: a rounded tab on the left that runs into the top edge in a soft S-curve, and
// sides that draw in slightly towards the foot (in 0..100). The same path masks .fcard__pocket in CSS.
const POCKET = 'M0 7 Q0 0 6 0 L31 0 C37 0 38 26 47 26 L95.5 26 Q100 26 100 32 L97 100 L3 100 Z';

export function FolderCard({ href, name, sub, tint, mark, badge }: { href: string; name: string; sub?: string; tint: string; mark?: ReactNode; badge?: ReactNode }) {
  return (
    <a className="fcard" href={href} style={{ '--tint': tint } as CSSProperties}>
      <span className="fcard__top">
        <svg className="fcard__glyph" width="32" height="26" viewBox="0 0 32 26" aria-hidden>
          <path d="M1 4.5A3.5 3.5 0 0 1 4.5 1h7.2a3 3 0 0 1 2.3 1.1L15.6 4H27.5A3.5 3.5 0 0 1 31 7.5V10H1V4.5Z" className="fcard__glyph-back" />
          <rect x="1" y="7" width="30" height="18" rx="3.5" className="fcard__glyph-front" />
        </svg>
        {badge && <span className="fcard__badge">{badge}</span>}
        {mark}
      </span>
      <span className="fcard__name">{name}</span>
      {sub && <span className="fcard__desc">{sub}</span>}
      <span className="fcard__peek" aria-hidden>
        {(['left', 'front', 'right'] as const).map((pos) => (
          <span key={pos} className={cx('fcard__sheet', `fcard__sheet--${pos}`)}>
            <i />
            <i />
            <i />
            <i />
          </span>
        ))}
        <span className="fcard__pocket" />
        <svg className="fcard__edge" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d={POCKET} vectorEffect="non-scaling-stroke" />
        </svg>
      </span>
    </a>
  );
}

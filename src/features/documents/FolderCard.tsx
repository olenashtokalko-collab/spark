// A folder on the Documents page (picked on #/demo/glass-folders, B · Glass tile): a compact frosted glass tile
// with a small glass folder holding the folder's light, the name and one line, and how many files it holds.
// The styles (.gfo, .gfo--tile, .gfo-mini…) are in glass.css with the demo's.
import type { CSSProperties, ReactNode } from 'react';
import type { Folder } from '../../data/types';

// A folder's light: two neighbours on the spectrum (p. 34, “frosted, never flat”), so the folder holds a glow
// rather than a flat colour. The client's own folder is grey glass, so it never reads as one of Spark's.
const LIGHT: Record<string, [string, string]> = {
  'f-guidelines': ['var(--cobalt)', '#7a45e6'],
  'f-strategy': ['color-mix(in srgb, var(--haze) 45%, var(--cobalt))', 'var(--cobalt)'],
  'f-proposals': ['#7a45e6', '#e9588e'],
  'f-creative': ['var(--ember)', '#e9588e'],
  'f-research': ['#e9588e', 'var(--ember)'],
  'f-uploads': ['#9aa6bd', 'var(--haze)'],
};

/** A folder's light; a subfolder takes its top folder's. */
export function folderLight(folders: Folder[], id: string): [string, string] {
  let f = folders.find((x) => x.id === id);
  while (f?.parentId) f = folders.find((x) => x.id === f!.parentId);
  return (f && LIGHT[f.id]) ?? LIGHT['f-guidelines'];
}

export function FolderCard({
  href,
  name,
  sub,
  light,
  count,
  mark,
  badge,
}: {
  href: string;
  name: string;
  sub?: string;
  light: [string, string];
  /** Files inside, its subfolders' too. */
  count: number;
  mark?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <a className="gfo gfo--tile" href={href} style={{ '--c1': light[0], '--c2': light[1] } as CSSProperties}>
      <span className="gfo-head">
        {/* A glass folder: its back with the tab holds the light, a page stands in it, a frosted front. */}
        <span className="gfo-mini" aria-hidden>
          <span className="gfo-mini__back" />
          <span className="gfo-mini__sheet" />
          <span className="gfo-mini__front" />
        </span>
        {badge && <span className="gfo-badge">{badge}</span>}
        {mark}
      </span>
      <span className="gfo-text">
        <b>{name}</b>
        {sub && <span>{sub}</span>}
      </span>
      <span className="gfo-count gfo-count--tile">
        {count} {count === 1 ? 'file' : 'files'}
      </span>
    </a>
  );
}

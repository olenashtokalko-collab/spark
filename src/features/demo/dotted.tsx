// Shared by Home's layouts: a figure's digits in the client's dotted Doto, its marks in the classic face.
import type { ReactNode } from 'react';
import { cx } from '../../components/ui/primitives';

/** A figure's digits stay in the client's dotted Doto; its marks (. , % / + −) are set in the classic face, so a
 *  comma reads as a comma and a slash as a slash (13 Nov, review). Where the figure isn't in Doto the classic face is
 *  the figure's own, so nothing changes. */
// The point is drawn as a round dot the size of one of Doto's own dots (13 Nov, review: the classic face's point is
// square, then a big ● read as too heavy), a small ● so it still takes the figure's colour or spectrum. The figure is
// read aloud whole from its label (role img), so the ● isn't.
const MARK_CLASS: Record<string, string> = { '.': 'dp--point', ',': 'dp--comma', '%': 'dp--pct', '/': 'dp--slash' };
export function dotted(text: string): ReactNode {
  return text.split(/([^0-9]+)/).map((part, k) =>
    !part ? null : /^[0-9]+$/.test(part) ? part : (
      <span key={k} className="dp-run">
        {Array.from(part).map((c, j) =>
          c === '.' ? (
            <span key={j} className="dp dp--point">
              ●
            </span>
          ) : (
            <span key={j} className={cx('dp', MARK_CLASS[c])}>
              {c}
            </span>
          ),
        )}
      </span>
    ),
  );
}

// Icons for a sent proposal on the Spark request page, after the reference of a hand holding
// up an envelope: the envelope three ways (glass tile, flat illustration, held up by a hand),
// and a bell that joins it when the client has answered.
import { useId } from 'react';
import { cx } from '../../components/ui/primitives';

/** The brand's glass tile, as in the "No proposal yet" icon. */
function Tile({ gid, children }: { gid: string; children: React.ReactNode }) {
  return (
    <>
      <defs>
        <linearGradient id={`g-${gid}`} gradientUnits="userSpaceOnUse" x1="3" y1="38" x2="38" y2="3">
          <stop offset="0" stopColor="#1e3bd6" />
          <stop offset="0.5" stopColor="#8a3cf0" />
          <stop offset="1" stopColor="#ff5c7c" />
        </linearGradient>
        <linearGradient id={`m-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="34" height="34" rx="11" fill={`url(#g-${gid})`} />
      <rect x="3" y="3" width="34" height="34" rx="11" fill={`url(#m-${gid})`} />
      <rect x="3.4" y="3.4" width="33.2" height="33.2" rx="10.6" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.8" />
      {children}
    </>
  );
}

/** A · the envelope drawn in white on the glass tile, floating a little. */
export function EnvelopeTile({ size = 40 }: { size?: number }) {
  const gid = useId().replace(/:/g, '');
  return (
    <span className="aei sic" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 40 40" width={size} height={size}>
        <g className="aei__float">
          <Tile gid={gid}>
            <g className="sic__env" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="10" y="13" width="20" height="14" rx="2.5" />
              <path d="M10.8 14.2 20 21l9.2-6.8" />
            </g>
          </Tile>
        </g>
      </svg>
    </span>
  );
}

/** B · a flat illustration after the reference: a white envelope tilted on a soft blue blob. */
export function EnvelopeFlat({ size = 46 }: { size?: number }) {
  return (
    <span className="sic sic--flat" style={{ width: size * 1.3, height: size }} aria-hidden>
      <svg viewBox="0 0 52 40" width={size * 1.3} height={size}>
        <rect x="0" y="0" width="52" height="40" rx="10" fill="#a9bfd9" />
        <path d="M8 30c-4-9 2-21 13-23s19 1 23 9-1 18-11 20-21 3-25-6z" fill="#fff" opacity="0.22" />
        <g className="sic__lift">
          <g transform="rotate(-9 26 19)">
            <rect x="14" y="11" width="24" height="16" rx="1.6" fill="#f4f4f2" />
            <path d="M14.6 11.8 26 20l11.4-8.2" fill="none" stroke="#c9ccd2" strokeWidth="1.1" strokeLinejoin="round" />
            <path d="M14.6 26.4 23 19.6M37.4 26.4 29 19.6" fill="none" stroke="#dcdfe3" strokeWidth="0.9" />
          </g>
        </g>
      </svg>
    </span>
  );
}

/** C · the reference itself, small: a hand from below holding the envelope up on one finger. */
export function EnvelopeHand({ size = 46 }: { size?: number }) {
  return (
    <span className="sic sic--flat" style={{ width: size * 1.3, height: size }} aria-hidden>
      <svg viewBox="0 0 52 40" width={size * 1.3} height={size}>
        <defs>
          <clipPath id="sic-hand-clip">
            <rect x="0" y="0" width="52" height="40" rx="10" />
          </clipPath>
        </defs>
        <g clipPath="url(#sic-hand-clip)">
          <rect x="0" y="0" width="52" height="40" fill="#a9bfd9" />
          <path d="M6 32c-4-10 3-24 15-26s20 2 24 10-1 20-12 22-23 4-27-6z" fill="#fff" opacity="0.22" />
          <g className="sic__lift">
            <g transform="rotate(-8 26 13)">
              <rect x="15" y="5" width="22" height="14" rx="1.5" fill="#f4f4f2" />
              <path d="M15.6 5.8 26 13l10.4-7.2" fill="none" stroke="#c9ccd2" strokeWidth="1" strokeLinejoin="round" />
            </g>
            {/* finger, fist, cuff, sleeve */}
            <rect x="24.4" y="18.5" width="3.4" height="9" rx="1.7" fill="#e3a982" />
            <rect x="20" y="25" width="11" height="9" rx="3.5" fill="#e3a982" />
            <path d="M21 27.5h6M21 30h6" stroke="#c98c66" strokeWidth="0.7" strokeLinecap="round" />
            <rect x="20.5" y="33" width="10.5" height="2.2" rx="0.6" fill="#f4f4f2" />
            <rect x="19.5" y="35" width="12.5" height="6" fill="#2d4378" />
          </g>
        </g>
      </svg>
    </span>
  );
}

/** The bell: a small dark round badge that rings now and then. */
export function BellBadge({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <span className={cx('sic-bell', className)} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    </span>
  );
}

/** The bell on its own glass tile, to sit after the envelope. */
export function BellTile({ size = 40 }: { size?: number }) {
  const gid = useId().replace(/:/g, '');
  return (
    <span className="aei sic sic--bell-tile" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 40 40" width={size} height={size}>
        <Tile gid={gid}>
          <g className="sic__ring" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" transform="translate(9 9) scale(0.92)">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </g>
        </Tile>
      </svg>
    </span>
  );
}

// ---- The flat set, one per moment of a proposal (the style of B) ------------------------------

/** The soft blue tile with a lighter blob, under every flat illustration. */
function FlatTile({ size, w = 52, still, bg = '#a9bfd9', fill, children }: { size: number; w?: number; still?: boolean; bg?: string; fill?: string; children: React.ReactNode }) {
  return (
    <span className="sic sic--flat" style={{ width: (size * w) / 40, height: size }} aria-hidden>
      <svg viewBox={`0 0 ${w} 40`} width={(size * w) / 40} height={size}>
        <rect x="0" y="0" width={w} height="40" rx="10" fill={fill ?? bg} />
        <path d={w === 52 ? 'M8 30c-4-9 2-21 13-23s19 1 23 9-1 18-11 20-21 3-25-6z' : 'M6 29c-3-8 1-19 10-21s15 1 18 8-1 16-9 18-16 3-19-5z'} fill="#fff" opacity="0.22" />
        <g className={still ? undefined : 'sic__lift'}>{children}</g>
      </svg>
    </span>
  );
}

/** No proposal yet: a blank page, tilted, with a small plus. */
export function DocFlat({ size = 46 }: { size?: number }) {
  return (
    <FlatTile size={size}>
      <g transform="rotate(-7 26 20)">
        <path d="M19 7h11l6 6v19a1.5 1.5 0 0 1-1.5 1.5h-15.5A1.5 1.5 0 0 1 17.5 32V8.5A1.5 1.5 0 0 1 19 7z" fill="#f4f4f2" />
        <path d="M30 7v6h6" fill="#dcdfe3" />
        <path d="M21.5 18h10M21.5 22h10M21.5 26h6" stroke="#dcdfe3" strokeWidth="1.3" strokeLinecap="round" />
      </g>
      <circle cx="37" cy="30" r="5" fill="#2d4378" />
      <path d="M37 27.6v4.8M34.6 30h4.8" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </FlatTile>
  );
}

/** A draft: the page being written, a pencil on it. */
export function DraftFlat({ size = 46 }: { size?: number }) {
  return (
    <FlatTile size={size}>
      <g transform="rotate(-7 26 20)">
        <path d="M19 7h11l6 6v19a1.5 1.5 0 0 1-1.5 1.5h-15.5A1.5 1.5 0 0 1 17.5 32V8.5A1.5 1.5 0 0 1 19 7z" fill="#f4f4f2" />
        <path d="M30 7v6h6" fill="#dcdfe3" />
        <path d="M21.5 18h10M21.5 22h7" stroke="#c9ccd2" strokeWidth="1.3" strokeLinecap="round" />
      </g>
      {/* pencil */}
      <g transform="rotate(40 34 26)">
        <rect x="31.5" y="14" width="5" height="16" rx="1" fill="#2d4378" />
        <rect x="31.5" y="14" width="5" height="3" rx="1" fill="#e3a982" />
        <path d="M31.5 30h5l-2.5 4z" fill="#f1d9c0" />
        <path d="M33.4 33.1h1.2L34 34z" fill="#2d4378" />
      </g>
    </FlatTile>
  );
}

/** The client answered: a white bell on the same tile, ringing now and then. */
export function BellFlat({ size = 46 }: { size?: number }) {
  return (
    <FlatTile size={size} w={40}>
      <g className="sic__ring" transform="translate(9 8) scale(0.92)">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9z" fill="#f4f4f2" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" fill="none" stroke="#f4f4f2" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <circle cx="29" cy="11" r="3" fill="#2d4378" />
    </FlatTile>
  );
}

/** Sent, and the client has answered: the envelope, then the bell coming in after it. */
export function AnsweredFlat({ size = 46 }: { size?: number }) {
  return (
    <span className="sic-pair">
      <EnvelopeFlat size={size} />
      <span className="sic-pair__in">
        <BellFlat size={size} />
      </span>
    </span>
  );
}

/** Sent, and the client has answered, in one tile: the envelope with a dark bell over its corner,
 *  the way the draft has a pencil over the page. */
export function EnvelopeBellFlat({ size = 46 }: { size?: number }) {
  return (
    <FlatTile size={size}>
      {/* the envelope in the middle of the tile */}
      <g transform="rotate(-8 26 20)">
        <rect x="14" y="12" width="24" height="16" rx="1.6" fill="#f4f4f2" />
        <path d="M14.6 12.8 26 21l11.4-8.2" fill="none" stroke="#c9ccd2" strokeWidth="1.1" strokeLinejoin="round" />
        <path d="M14.6 27.4 23 20.6M37.4 27.4 29 20.6" fill="none" stroke="#dcdfe3" strokeWidth="0.9" />
      </g>
      {/* a small bell in the top right corner, swaying softly */}
      <g transform="translate(35 5.5) scale(0.5)">
        <g className="sic__sway">
          <rect x="11" y="0" width="2" height="3" rx="1" fill="#2d4378" />
          <path d="M6 9a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9z" fill="#2d4378" />
          <circle cx="12" cy="20.6" r="1.9" fill="#2d4378" />
        </g>
      </g>
    </FlatTile>
  );
}

/** Sent, and the client has answered: the envelope with a round navy badge and a white bell in it,
 *  in the same place and style as the plus on "No proposal yet". */
/** Colours for the answered illustration: the tile, and the badge with its bell. */
export interface FlatPalette {
  bg: string;
  /** A gradient or other paint for the tile, drawn instead of bg. */
  gradient?: [string, string];
  badge: string;
  bell: string;
}
export const BLUE: FlatPalette = { bg: '#a9bfd9', badge: '#2d4378', bell: '#fff' };
/** News from the client (any answer): one dusty rose, so it stands apart from the blue "sent". */
export const ROSE: FlatPalette = { bg: '#dcb4b0', badge: '#8e3b36', bell: '#fff' };
/** Approved: a muted green with a thumb up. Rejected: a clearer red with a thumb down. */
export const GREEN: FlatPalette = { bg: '#b5cdb8', badge: '#2f6b45', bell: '#fff' };
export const RED: FlatPalette = { bg: '#e6aca5', badge: '#b3332b', bell: '#fff' };

export function EnvelopeBellBadgeFlat({ size = 46, palette = BLUE, glyph = 'bell' }: { size?: number; palette?: FlatPalette; glyph?: 'bell' | 'up' | 'down' }) {
  const gid = useId().replace(/:/g, '');
  return (
    <FlatTile size={size} still bg={palette.bg} fill={palette.gradient ? `url(#pg-${gid})` : undefined}>
      {palette.gradient && (
        <defs>
          <linearGradient id={`pg-${gid}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor={palette.gradient[0]} />
            <stop offset="1" stopColor={palette.gradient[1]} />
          </linearGradient>
        </defs>
      )}
      <g transform="rotate(-8 26 21)">
        <rect x="14" y="13" width="24" height="16" rx="1.6" fill="#f4f4f2" />
        <path d="M14.6 13.8 26 22l11.4-8.2" fill="none" stroke="#c9ccd2" strokeWidth="1.1" strokeLinejoin="round" />
        <path d="M14.6 28.4 23 21.6M37.4 28.4 29 21.6" fill="none" stroke="#dcdfe3" strokeWidth="0.9" />
      </g>
      <circle cx="38" cy="10" r="6.2" fill={palette.badge} />
      {glyph === 'bell' ? (
        <g transform="translate(34.3 6) scale(0.31)">
          <path d="M6 9a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9z" fill={palette.bell} />
          <circle cx="12" cy="20.8" r="2" fill={palette.bell} />
        </g>
      ) : (
        // A thumb up (approved) or down (rejected), drawn in white in the badge.
        <g transform="translate(34.4 6.4) scale(0.3)" fill="none" stroke={palette.bell} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {glyph === 'up' ? (
            <>
              <path d="M7 10v12" />
              <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
            </>
          ) : (
            <>
              <path d="M17 14V2" />
              <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
            </>
          )}
        </g>
      )}
    </FlatTile>
  );
}

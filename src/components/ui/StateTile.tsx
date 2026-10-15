import { useId } from 'react';
import { cx } from './primitives';

const THUMB = 'M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z';
const CUFF = 'M7 10v12';
const HOURGLASS = ['M5 22h14', 'M5 2h14', 'M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22', 'M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2'];

export type TileTone = 'cobalt' | 'green';
const PAL: Record<TileTone, [string, string, string]> = {
  cobalt: ['#1e3bd6', '#6d5cf0', '#c8d8f0'],
  green: ['#0a6a47', '#19a672', '#9af0c6'],
};

/**
 * The brand's icon tile (brand book p. 16; picked on #/demo/thumb and #/demo/states): a frosted
 * glass squircle holding light and a white glyph on top; the hourglass glyph turns over now and then.
 * Cobalt while a decision waits, green once it is approved.
 */
export function StateTile({ glyph, tone, size = 40, className }: { glyph: 'thumb' | 'hourglass'; tone: TileTone; size?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `stt-${n}-${id}`;
  const [a, b, c] = PAL[tone];
  return (
    <svg className={cx('st__tile', className)} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <defs>
        <clipPath id={u('clip')}>
          <rect width="24" height="24" rx="7.5" />
        </clipPath>
        <linearGradient id={u('spec')} gradientUnits="userSpaceOnUse" x1="2" y1="24" x2="24" y2="0">
          <stop offset="0" stopColor={a} />
          <stop offset="0.5" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
        <linearGradient id={u('milk')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id={u('rim')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.9" />
        </linearGradient>
        <filter id={u('b')} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
        <filter id={u('grain')} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
        </filter>
      </defs>
      <rect width="24" height="24" rx="7.5" fill="rgba(255,255,255,0.3)" />
      <g clipPath={`url(#${u('clip')})`}>
        <rect width="24" height="24" fill={`url(#${u('spec')})`} filter={`url(#${u('b')})`} />
        <rect width="24" height="24" fill={`url(#${u('milk')})`} opacity="0.7" />
        <ellipse cx="9" cy="3.5" rx="8" ry="3" fill="#ffffff" opacity="0.5" filter={`url(#${u('b')})`} />
        <rect width="24" height="24" filter={`url(#${u('grain')})`} opacity="0.35" style={{ mixBlendMode: 'soft-light' }} />
      </g>
      <rect x="0.3" y="0.3" width="23.4" height="23.4" rx="7.2" fill="none" stroke={`url(#${u('rim')})`} strokeWidth="0.6" />
      <g transform="translate(5.4 5.4) scale(0.55)" fill="none" stroke="#ffffff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        {glyph === 'thumb' ? (
          // The thumb is pressed down and springs up once, like a like being given.
          <g className="st__like">
            <path d={THUMB} />
            <path d={CUFF} />
          </g>
        ) : (
          // The hourglass turns over now and then: a heap of sand at the bottom goes to the top.
          <g className="st__flip">
            {HOURGLASS.map((d) => (
              <path key={d} d={d} />
            ))}
            <path d="M8.4 20.6 Q12 14.6 15.6 20.6 Z" fill="#ffffff" stroke="none" />
            <path d="M12 12.4 V16" strokeWidth="1" opacity="0.85" />
          </g>
        )}
      </g>
    </svg>
  );
}

/** The time ring of the decision card: its arc is the share of the time used (1 = closed), the tile sits in it. */
export function StateRing({ used, glyph, tone, size = 92, celebrate }: { used: number; glyph: 'thumb' | 'hourglass'; tone: TileTone; size?: number; celebrate?: boolean }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className={cx('st__ring', `is-${tone}`, celebrate && 'is-celebrate')} style={{ width: size, height: size, ['--c' as string]: c }}>
      {/* Success, once: thin green circles pulse out from the thumb, then the ring settles around it. */}
      {celebrate && (
        <>
          <span className="st__halo" aria-hidden />
          {[0, 1, 2].map((i) => (
            <span key={i} className="st__wave" style={{ ['--i' as string]: i }} aria-hidden />
          ))}
        </>
      )}
      <svg className="st__ringsvg" viewBox="0 0 100 100" aria-hidden>
        <circle className="st__track" cx="50" cy="50" r={r} />
        <circle className="st__arc" cx="50" cy="50" r={r} strokeDasharray={c} strokeDashoffset={c * (1 - used)} />
      </svg>
      <StateTile glyph={glyph} tone={tone} size={Math.round(size * 0.5)} />
    </div>
  );
}

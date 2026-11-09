// Small still pictures for empty cards (6 Nov, review): Brand Analysis with no reports, Latest from Spark with nothing
// yet. One language: soft lilac glass shapes, the bars' gradient (Cobalt to violet, light), no motion. Latest moves
// away from Sparki, who reads as a live conversation, to pictures of waiting. Picked on #/demo/empty-art.
import { useEffect, useId, useState, type ReactNode } from 'react';

export const BA_ARTS = [
  { v: 'bars', label: 'Bars' },
  { v: 'ring', label: 'Score ring' },
  { v: 'sheets', label: 'Report pages' },
  { v: 'line', label: 'Line chart' },
] as const;
export const LATEST_ARTS = [
  { v: 'clock', label: 'Clock' },
  { v: 'hourglass', label: 'Hourglass' },
  { v: 'stack', label: 'Empty feed' },
  { v: 'envelope', label: 'Envelope' },
  { v: 'sparki', label: 'Sparki (now)' },
] as const;
export type BaArt = (typeof BA_ARTS)[number]['v'];
export type LatestArt = (typeof LATEST_ARTS)[number]['v'];

const KEYS = { ba: 'spark-art-ba', latest: 'spark-art-latest' } as const;
const EVENT = 'spark-art';
function read<T extends string>(key: string, list: readonly { v: T }[], dflt: T): T {
  try {
    return list.find((x) => x.v === localStorage.getItem(key))?.v ?? dflt;
  } catch {
    return dflt;
  }
}
export function setArt(which: keyof typeof KEYS, v: string) {
  try {
    localStorage.setItem(KEYS[which], v);
  } catch {
    /* this visit only */
  }
  window.dispatchEvent(new Event(EVENT));
}
export function useArt() {
  const get = () => ({ ba: read<BaArt>(KEYS.ba, BA_ARTS, 'bars'), latest: read<LatestArt>(KEYS.latest, LATEST_ARTS, 'clock') });
  const [v, setV] = useState(get);
  useEffect(() => {
    const f = () => setV(get());
    window.addEventListener(EVENT, f);
    return () => window.removeEventListener(EVENT, f);
  }, []);
  return v;
}

/** The shared fills: the bars' lilac, top to bottom, and a fainter one for what sits behind. */
function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}a`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#9a55ec" stopOpacity="0.36" />
        <stop offset="1" stopColor="#3c64f0" stopOpacity="0.12" />
      </linearGradient>
      <linearGradient id={`${id}b`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#9a55ec" stopOpacity="0.18" />
        <stop offset="1" stopColor="#3c64f0" stopOpacity="0.06" />
      </linearGradient>
      <linearGradient id={`${id}s`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#7a5be8" stopOpacity="0.55" />
        <stop offset="1" stopColor="#9a55ec" stopOpacity="0.35" />
      </linearGradient>
    </defs>
  );
}

export function BrandArt({ v }: { v: BaArt }) {
  const id = useId().replace(/:/g, '');
  const A = `url(#${id}a)`;
  const B = `url(#${id}b)`;
  const S = `url(#${id}s)`;
  return (
    <svg className="ea" viewBox="0 0 120 72" width="120" height="72" aria-hidden>
      <Defs id={id} />
      {v === 'bars' && (
        <g>
          <rect x="0" y="34" width="22" height="38" rx="7" fill={A} />
          <rect x="30" y="16" width="22" height="56" rx="7" fill={A} />
          <rect x="60" y="26" width="22" height="46" rx="7" fill={A} />
          <rect x="90" y="4" width="22" height="68" rx="7" fill={A} />
        </g>
      )}
      {v === 'ring' && (
        <g transform="translate(24 0)">
          <circle cx="36" cy="36" r="29" fill="none" stroke={B} strokeWidth="11" />
          <circle cx="36" cy="36" r="29" fill="none" stroke={S} strokeWidth="11" strokeLinecap="round" strokeDasharray="118 200" transform="rotate(-90 36 36)" />
          <rect x="26" y="31" width="20" height="10" rx="5" fill={A} />
        </g>
      )}
      {v === 'sheets' && (
        <g>
          <rect x="34" y="2" width="50" height="64" rx="9" fill={B} transform="rotate(8 59 34)" />
          <rect x="26" y="6" width="50" height="64" rx="9" fill={A} />
          <rect x="35" y="18" width="22" height="5" rx="2.5" fill={S} />
          <rect x="35" y="30" width="32" height="5" rx="2.5" fill={B} />
          <rect x="35" y="40" width="28" height="5" rx="2.5" fill={B} />
          <rect x="35" y="50" width="18" height="5" rx="2.5" fill={B} />
        </g>
      )}
      {v === 'line' && (
        <g>
          <rect x="0" y="2" width="118" height="68" rx="12" fill={B} />
          <path d="M12 54 C 28 52, 32 34, 48 38 S 72 50, 82 30 S 100 16, 108 14 L108 70 L12 70 Z" fill={A} />
          <path d="M12 54 C 28 52, 32 34, 48 38 S 72 50, 82 30 S 100 16, 108 14" fill="none" stroke={S} strokeWidth="3" strokeLinecap="round" />
          <circle cx="108" cy="14" r="4.5" fill="#fff" stroke={S} strokeWidth="2.5" />
        </g>
      )}
    </svg>
  );
}

export function LatestArtView({ v, sparki }: { v: LatestArt; sparki?: ReactNode }) {
  const id = useId().replace(/:/g, '');
  const A = `url(#${id}a)`;
  const B = `url(#${id}b)`;
  const S = `url(#${id}s)`;
  if (v === 'sparki') return <>{sparki}</>;
  return (
    <svg className="ea" viewBox="0 0 120 72" width="120" height="72" aria-hidden>
      <Defs id={id} />
      {v === 'clock' && (
        <g transform="translate(4 0)">
          <circle cx="36" cy="36" r="34" fill={A} />
          <circle cx="36" cy="36" r="25" fill={B} />
          {[0, 90, 180, 270].map((a) => (
            <rect key={a} x="34.5" y="7" width="3" height="6" rx="1.5" fill={S} transform={`rotate(${a} 36 36)`} />
          ))}
          <rect x="34.5" y="18" width="3.5" height="20" rx="1.75" fill={S} />
          <rect x="34.5" y="34" width="3.5" height="15" rx="1.75" fill={S} transform="rotate(-60 36 36)" />
          <circle cx="36" cy="36" r="3.5" fill="#fff" />
        </g>
      )}
      {v === 'hourglass' && (
        <g transform="translate(20 0)">
          <rect x="6" y="0" width="44" height="7" rx="3.5" fill={S} />
          <rect x="6" y="65" width="44" height="7" rx="3.5" fill={S} />
          <path d="M11 9 H45 C45 24 32 30 30 36 C32 42 45 48 45 63 H11 C11 48 24 42 26 36 C24 30 11 24 11 9 Z" fill={B} />
          <path d="M18 63 C18 54 26 50 28 46 C30 50 38 54 38 63 Z" fill={A} />
          <path d="M20 16 H36 C34 22 30 26 28 28 C26 26 22 22 20 16 Z" fill={A} />
        </g>
      )}
      {v === 'stack' && (
        <g>
          <rect x="22" y="2" width="76" height="18" rx="7" fill={B} />
          <rect x="14" y="26" width="92" height="20" rx="8" fill={B} />
          <rect x="6" y="52" width="108" height="20" rx="8" fill={A} />
          <rect x="16" y="59" width="40" height="6" rx="3" fill={S} />
        </g>
      )}
      {v === 'envelope' && (
        <g transform="translate(16 4)">
          <rect x="0" y="6" width="88" height="58" rx="10" fill={A} />
          <path d="M6 12 L44 40 L82 12" fill="none" stroke={S} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="82" cy="8" r="8" fill="#fff" />
          <circle cx="82" cy="8" r="5" fill={B} />
        </g>
      )}
    </svg>
  );
}

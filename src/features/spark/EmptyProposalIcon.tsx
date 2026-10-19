// Animated icons for the "No proposal yet" block. Variants for #/spark/icons; the chosen one stays.
import { useId } from 'react';

export type IconVariant = 'plane' | 'write' | 'envelope' | 'pen' | 'tile';

const DOC = 'M11 5h13l8 8v21a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z';
const FOLD = 'M24 5v8h8';

export function EmptyProposalIcon({ variant, size = 40 }: { variant: IconVariant; size?: number }) {
  const gid = useId().replace(/:/g, '');
  if (variant === 'plane')
    return (
      <span className="aei aei--plane" style={{ width: size, height: size }} aria-hidden>
        <svg viewBox="0 0 40 40" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path className="aei__trail" d="M6 34l7-7M9 37l4-4" strokeDasharray="1 4" />
          <g className="aei__fly" transform="translate(7 7) scale(1.25)">
            <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
            <path d="m21.854 2.147-10.94 10.939" />
          </g>
        </svg>
      </span>
    );
  if (variant === 'write')
    return (
      <span className="aei aei--write" style={{ width: size, height: size }} aria-hidden>
        <svg viewBox="0 0 40 40" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d={DOC} />
          <path d={FOLD} />
          <path className="aei__l aei__l1" pathLength="1" d="M14 21h14" />
          <path className="aei__l aei__l2" pathLength="1" d="M14 26h14" />
          <path className="aei__l aei__l3" pathLength="1" d="M14 31h8" />
        </svg>
      </span>
    );
  if (variant === 'envelope')
    return (
      <span className="aei aei--env" style={{ width: size, height: size }} aria-hidden>
        <svg viewBox="0 0 40 40" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path className="aei__sheet" d="M12 17V9a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 28 9v8M16 12h8M16 15h5" />
          <rect x="5" y="15" width="30" height="20" rx="3" />
          <path className="aei__flap" d="M5.8 16.2 20 27l14.2-10.8" />
        </svg>
      </span>
    );
  if (variant === 'pen')
    return (
      <span className="aei aei--pen" style={{ width: size, height: size }} aria-hidden>
        <svg viewBox="0 0 40 40" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d={DOC} />
          <path d={FOLD} />
          <path className="aei__l aei__p1" pathLength="1" d="M14 21h14" />
          <path className="aei__l aei__p2" pathLength="1" d="M14 26h14" />
          <path className="aei__l aei__p3" pathLength="1" d="M14 31h10" />
          <g className="aei__pencil">
            <path d="M0 0l3.5-3.5 5 5-3.5 3.5-5.5 1.2z" fill="var(--bg, #f3f1ed)" />
            <path d="M-0.5 0.5l2 2" />
          </g>
        </svg>
      </span>
    );
  // tile: a glass tile with the document, as the product's other lit icons
  return (
    <span className="aei aei--tile" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 40 40" width={size} height={size}>
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
        <g className="aei__float">
          <rect x="3" y="3" width="34" height="34" rx="11" fill={`url(#g-${gid})`} />
          <rect x="3" y="3" width="34" height="34" rx="11" fill={`url(#m-${gid})`} />
          <rect x="3.4" y="3.4" width="33.2" height="33.2" rx="10.6" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.8" />
          <g fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" transform="translate(5 5) scale(0.75)">
            <path d={DOC} />
            <path d={FOLD} />
            <path className="aei__l aei__l1" pathLength="1" d="M14 21h14" />
            <path className="aei__l aei__l2" pathLength="1" d="M14 26h14" />
            <path className="aei__l aei__l3" pathLength="1" d="M14 31h8" />
          </g>
          <path className="aei__spark" d="M32 5.5c.3 2 1.2 2.9 3.2 3.2-2 .3-2.9 1.2-3.2 3.2-.3-2-1.2-2.9-3.2-3.2 2-.3 2.9-1.2 3.2-3.2z" fill="#fff" />
        </g>
      </svg>
    </span>
  );
}

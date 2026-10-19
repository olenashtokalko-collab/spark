// The icon of the "No proposal yet" block (picked on #/spark/icons, E): the brand's glass tile with a document
// whose lines draw themselves in white and a small spark that twinkles.
import { useId } from 'react';

const DOC = 'M11 5h13l8 8v21a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z';
const FOLD = 'M24 5v8h8';

export function EmptyProposalIcon({ size = 40 }: { size?: number }) {
  const gid = useId().replace(/:/g, '');
  return (
    <span className="aei" style={{ width: size, height: size }} aria-hidden>
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

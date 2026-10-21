// A small 3D speech bubble with a face (picked on #/demo/changes-banner, B: spectrum glass), on top of a proposal
// the client asked to change. One shape; each look sets its colours and how it moves.
import { useId } from 'react';

export type BuddyLook = 'lavender' | 'spectrum' | 'cobalt' | 'peach' | 'typing';

const BODY = 'M32 6C46.4 6 58 14.6 58 27c0 8.4-5 14.6-12.4 17.8l3.9 11.6c.3 1-.8 1.7-1.6 1.1L37.6 48.4c-1.8.4-3.7.6-5.6.6C17.6 49 6 39.4 6 27S17.6 6 32 6z';

const COLORS: Record<BuddyLook, { top: string; mid?: string; bottom: string; side: string; face: string }> = {
  lavender: { top: '#d3cef3', bottom: '#8c86c6', side: '#77719f', face: '#3f3a5c' },
  spectrum: { top: '#ff7a94', mid: '#8a3cf0', bottom: '#1e3bd6', side: '#2a1f8f', face: '#ffffff' },
  cobalt: { top: '#7d92ff', bottom: '#1e3bd6', side: '#13248f', face: '#ffffff' },
  peach: { top: '#ffd3b8', bottom: '#ff8d6b', side: '#d9634a', face: '#6b2b20' },
  typing: { top: '#ecebf6', bottom: '#bdb8db', side: '#9d98c0', face: '#1e3bd6' },
};

export function ChatBuddy({ look, size = 48 }: { look: BuddyLook; size?: number }) {
  const id = useId().replace(/:/g, '');
  const c = COLORS[look];
  return (
    <span className={`cb cb--${look}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={`b-${id}`} x1="0.2" y1="0" x2="0.7" y2="1">
            <stop offset="0" stopColor={c.top} />
            {c.mid && <stop offset="0.5" stopColor={c.mid} />}
            <stop offset="1" stopColor={c.bottom} />
          </linearGradient>
          <radialGradient id={`s-${id}`} cx="0.3" cy="0.2" r="0.7">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse className="cb__shadow" cx="32" cy="61" rx="17" ry="2" fill="#0e1116" opacity="0.12" />
        <g className="cb__float">
          <g className="cb__tilt">
            {/* The side of the bubble, under it and to the right: what makes it look solid. */}
            <path d={BODY} fill={c.side} transform="translate(1.6 2.6)" />
            <path d={BODY} fill={`url(#b-${id})`} />
            <path d={BODY} fill={`url(#s-${id})`} />
            <ellipse cx="45" cy="13.5" rx="6" ry="2.6" transform="rotate(24 45 13.5)" fill="#fff" opacity="0.6" />
            <circle cx="51.5" cy="18" r="1.2" fill="#fff" opacity="0.55" />
            {look === 'typing' ? (
              <g fill={c.face}>
                <circle className="cb__dot cb__dot1" cx="22" cy="28" r="3" />
                <circle className="cb__dot cb__dot2" cx="32" cy="28" r="3" />
                <circle className="cb__dot cb__dot3" cx="42" cy="28" r="3" />
              </g>
            ) : (
              <g className="cb__face">
                {look === 'peach' && (
                  <g fill="#ff5c7c" opacity="0.35">
                    <ellipse cx="19" cy="31.5" rx="3.2" ry="2" />
                    <ellipse cx="45" cy="31.5" rx="3.2" ry="2" />
                  </g>
                )}
                <g className="cb__eyes" fill={c.face}>
                  <ellipse cx="24" cy="26" rx="2.3" ry="2.8" />
                  <ellipse cx="40" cy="26" rx="2.3" ry="2.8" />
                </g>
                <path className="cb__mouth" d="M27.5 32.5q4.5 3.6 9 0" fill="none" stroke={c.face} strokeWidth="1.9" strokeLinecap="round" />
              </g>
            )}
          </g>
        </g>
      </svg>
    </span>
  );
}

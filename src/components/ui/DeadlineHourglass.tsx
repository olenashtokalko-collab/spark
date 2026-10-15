import { useEffect, useId, useState } from 'react';
import { daysUntil } from '../../lib/format';
import { cx } from './primitives';

/** Days between two ISO dates, at least 1. */
function spanDays(from: string, to: string) {
  const a = new Date(from.slice(0, 10) + 'T00:00:00').getTime();
  const b = new Date(to.slice(0, 10) + 'T00:00:00').getTime();
  return Math.max(1, Math.round((b - a) / 86400000));
}

/** How far along a deadline is: days left (never below 0) and the share of the time used (0–1). */
export function deadline(sentAt: string, due: string) {
  const total = spanDays(sentAt, due);
  const daysLeft = Math.max(0, daysUntil(due));
  const progress = Math.min(1, Math.max(0, (total - daysLeft) / total));
  return { daysLeft, progress, urgent: daysLeft <= 1 };
}

/**
 * The time to a deadline (picked on #/demo/decision, 5b): a ring whose line
 * runs on as the time is used, around a 3D glass hourglass holding the Noor
 * light. The top bulb is the time left, sinking towards the neck; the bottom
 * collects the time gone; a glowing stream falls between them. On mount it
 * starts full at the top and pours down to today. Both surfaces are waves
 * running sideways (crests at the level, so the light never rises), and the
 * colours drift slowly through the glass.
 */
export function DeadlineHourglass({ progress, daysLeft, className }: { progress: number; daysLeft: number; className?: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(progress));
    return () => cancelAnimationFrame(t);
  }, [progress]);
  // Several on a page must not share gradient or clip ids.
  const id = useId().replace(/:/g, '');
  const u = (n: string) => `dl-${n}-${id}`;

  const r = 44;
  const c = 2 * Math.PI * r;
  const glass = 'M18 15 C18 42 37 51 37 60 C37 69 18 78 18 105 L62 105 C62 78 43 69 43 60 C43 51 62 42 62 15 Z';
  // Top bulb (y 15–60) holds the time left; bottom bulb (y 60–105) the time gone.
  const top = 15 + shown * 45;
  const bottom = 105 - shown * 42;
  // A wave with a 22-unit period, crests at y 0 and troughs at 2.4, wide enough to slide.
  const wave = `M-44 0 ${'c4 0 7 2.4 11 2.4 c4 0 7 -2.4 11 -2.4 '.repeat(7)} V130 H-44 Z`;

  return (
    <div className={cx('dl', daysLeft <= 1 && 'is-urgent', className)} aria-hidden>
      <svg className="dl__ring" viewBox="0 0 100 100">
        <circle className="dl__track" cx="50" cy="50" r={r} />
        <circle className="dl__arc" cx="50" cy="50" r={r} strokeDasharray={c} strokeDashoffset={c * (1 - shown)} />
      </svg>
      <svg className="dl__glass" viewBox="14 12 52 96">
        <defs>
          <clipPath id={u('in')}>
            <path d={glass} />
          </clipPath>
          <clipPath id={u('top')}>
            <rect x="0" y="0" width="80" height="60" />
          </clipPath>
          <clipPath id={u('bottom')}>
            <rect x="0" y="60" width="80" height="60" />
          </clipPath>
          <linearGradient id={u('light')} gradientUnits="userSpaceOnUse" x1="0" y1="10" x2="60" y2="110" spreadMethod="reflect">
            <stop offset="0%" stopColor="#1e3bd6" />
            <stop offset="35%" stopColor="#b35ad8" />
            <stop offset="65%" stopColor="#f0642c" />
            <stop offset="100%" stopColor="#b35ad8" />
            <animateTransform attributeName="gradientTransform" type="translate" values="0 0; -30 -45; 0 0" dur="14s" repeatCount="indefinite" />
          </linearGradient>
          <linearGradient id={u('tint')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={u('edge')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1e3bd6" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#e8501f" />
          </linearGradient>
        </defs>

        <path d={glass} className="dl__body" />

        <g clipPath={`url(#${u('in')})`} className="dl__light">
          <g clipPath={`url(#${u('top')})`}>
            <g className="dl__level" style={{ transform: `translateY(${top}px)` }}>
              <path d={wave} fill={`url(#${u('light')})`}>
                <animateTransform attributeName="transform" type="translate" from="0 0" to="22 0" dur="1.8s" repeatCount="indefinite" />
              </path>
            </g>
          </g>
          <g clipPath={`url(#${u('bottom')})`}>
            <g className="dl__level" style={{ transform: `translateY(${bottom}px)` }}>
              <path d={wave} fill={`url(#${u('light')})`}>
                <animateTransform attributeName="transform" type="translate" from="22 0" to="0 0" dur="2.4s" repeatCount="indefinite" />
              </path>
            </g>
          </g>
          {daysLeft > 0 && (
            <>
              <line x1="40" y1="58" x2="40" y2={bottom + 1} className="dl__stream" />
              <g className="dl__grains">
                <circle cx="40" cy="60" r="1.1" />
                <circle cx="40" cy="60" r="0.9" />
                <circle cx="40" cy="60" r="1" />
              </g>
            </>
          )}
        </g>

        <path d={glass} fill={`url(#${u('tint')})`} />
        <path d={glass} className="dl__edge" stroke={`url(#${u('edge')})`} clipPath={`url(#${u('in')})`} />
        <path d={glass} className="dl__rim" />
        <path d="M22.5 20 C22.5 36 30 45 34 51" className="dl__glint" />
        <path d="M34 69 C29 75 22.5 86 22.5 100" className="dl__glint" />
        <path d="M58 22 C57 33 52 41 47 47" className="dl__glint dl__glint--soft" />
        <path d="M47 73 C52 79 57 88 58 99" className="dl__glint dl__glint--soft" />
      </svg>
    </div>
  );
}

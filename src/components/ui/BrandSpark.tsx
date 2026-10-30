// The spark as the brand draws it (the cut from the wordmark, p. 29; the app icon, p. 36), traced from the
// brand file, filled with Noor: the light from Cobalt through violet and pink to Ember and a warm foot
// (p. 31, "glow and glass only, never flat" — so only ever on a lit mark, never as a fill behind text).
import { useId } from 'react';
import { cx } from './primitives';

export const SPARK_PATH =
  'M12.27 0.00 12.40 3.29 12.55 4.59 12.79 5.91 13.00 6.68 13.31 7.46 13.61 8.03 14.10 8.72 14.55 9.21 15.17 9.71 15.92 10.14 16.82 10.49 17.92 10.82 19.17 11.08 20.28 11.25 21.86 11.38 20.66 11.48 19.48 11.69 18.46 11.97 17.40 12.39 16.41 12.90 15.54 13.48 14.93 14.00 14.15 14.85 13.73 15.49 13.28 16.51 12.94 17.56 12.74 18.40 12.58 19.54 12.42 21.48 12.30 24.02 12.23 22.32 12.09 20.51 11.99 19.72 11.61 17.64 11.35 16.74 11.08 16.07 10.67 15.30 10.19 14.66 9.60 14.07 8.81 13.49 8.03 13.07 7.06 12.67 5.86 12.29 4.53 12.00 3.40 11.85 2.04 11.76 3.57 11.64 4.73 11.45 6.10 11.08 7.23 10.69 8.34 10.23 8.85 9.95 9.61 9.37 10.23 8.74 10.80 7.97 11.20 7.30 11.50 6.59 11.70 5.88 11.95 4.48 12.12 3.02 12.23 1.29Z';

export function BrandSpark({ size = 20, className, flat }: { size?: number; className?: string; /** Ink, no light. */ flat?: boolean }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={cx('brand-spark', className)} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {!flat && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a37d9" />
            <stop offset="0.28" stopColor="#7a45e6" />
            <stop offset="0.55" stopColor="#e9588e" />
            <stop offset="0.78" stopColor="#e8501f" />
            <stop offset="1" stopColor="#f3b38a" />
          </linearGradient>
        </defs>
      )}
      <path d={SPARK_PATH} fill={flat ? 'currentColor' : `url(#${id})`} />
    </svg>
  );
}

/** The brand's spark in Ember on a pale warm disc: the mark at the start of Ask Spark. Ember because asking
 *  Spark is an AI action (p. 39: Ember for AI); Noor stays for light and glass. */
export function SparkDisc({ size = 28 }: { size?: number }) {
  return (
    <span className="spark-disc" style={{ width: size, height: size }} aria-hidden>
      <BrandSpark size={Math.round(size * 0.68)} flat />
    </span>
  );
}

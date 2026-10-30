// The spark as an icon: the brand's own shape (the one in the logo and on Ask Spark), filled in the
// current colour, so every spark in the portal is the same mark (29 Oct; it was a wider outline star
// after the horizon post). Used wherever the portal marks Spark or AI. Takes the same props as a Lucide
// icon, so it can stand in for one (menus, icon maps); the stroke width is ignored.
import { forwardRef } from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react';
import { cx } from './primitives';
import { SPARK_PATH } from './BrandSpark';

export const SparkStar = forwardRef<SVGSVGElement, LucideProps>(function SparkStar(
  { size = 24, strokeWidth, color = 'currentColor', className, ...rest },
  ref,
) {
  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={cx('spark-star', className)}
      aria-hidden
      {...rest}
    >
      <path d={SPARK_PATH} />
    </svg>
  );
}) as unknown as LucideIcon;

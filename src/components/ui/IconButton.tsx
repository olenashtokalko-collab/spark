// The icon button of Health's system (18 Nov, the consistency audit): a round see-through glass button for an action
// shown by its icon alone. 40 px on surfaces (close, expand), 36 px in the chat box and under answers, 28 px in rows.
// Its look lives in health-system.css (.hs-icon-btn); the portal's existing close and "…" buttons wear the same look.
import type { ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx } from './primitives';

export type IconButtonSize = 28 | 36 | 40;

export function IconButton({
  icon: Icon,
  label,
  size = 40,
  turn,
  className,
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: LucideIcon;
  /** what it does, said to screen readers and in its tip */
  label: string;
  size?: IconButtonSize;
  /** a close turns a quarter on hover */
  turn?: boolean;
}) {
  return (
    <button type="button" aria-label={label} title={label} className={cx('hs-icon-btn', `hs-icon-btn--${size}`, turn && 'hs-icon-btn--turn', className)} {...rest}>
      <Icon size={size === 28 ? 14 : 18} strokeWidth={1.8} aria-hidden />
    </button>
  );
}

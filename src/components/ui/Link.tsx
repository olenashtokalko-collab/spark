// Link in Health's system (18 Nov): two kinds. "text" is a word in a sentence that leads somewhere (See proposal):
// Ink at 500, a fine underline always there, full Ink on hover; `onDark` for Dr.AI's Ink tip. "nav" is a way to
// another page (← Requests, You and 2 colleagues →): secondary grey with an arrow that steps its way on hover.
// Its look lives in health-system.css; the portal's older .link-btn wears the text kind.
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cx } from './primitives';

type Common = { kind?: 'text' | 'nav'; back?: boolean; onDark?: boolean; children: ReactNode; className?: string };

export function Link({ kind = 'text', back, onDark, children, className, ...rest }: Common & (AnchorHTMLAttributes<HTMLAnchorElement> | ButtonHTMLAttributes<HTMLButtonElement>)) {
  const cls = cx(kind === 'nav' ? 'hs-link--nav' : onDark ? 'hs-link--on-dark' : 'hs-link', back && 'hs-link--back', className);
  const inner =
    kind === 'nav' ? (
      <>
        {back && <ArrowLeft size={14} strokeWidth={1.8} aria-hidden />}
        <span>{children}</span>
        {!back && <ArrowRight size={14} strokeWidth={1.8} aria-hidden />}
      </>
    ) : (
      children
    );
  if ('href' in rest && rest.href !== undefined)
    return (
      <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {inner}
      </a>
    );
  return (
    <button type="button" className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {inner}
    </button>
  );
}

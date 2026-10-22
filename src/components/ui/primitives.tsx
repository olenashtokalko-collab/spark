import { forwardRef, useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import type { Person } from '../../data/types';
import { initials } from '../../lib/format';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
export { cx };

// ---- Button --------------------------------------------------------------

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'quiet' | 'ai';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  lead?: ReactNode; // any leading graphic, e.g. the Spark AI glyph
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', icon: Icon, iconRight: IconR, lead, loading, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx('btn', `btn--${variant}`, `btn--${size}`, !children && 'btn--icon', className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 className="spin" size={15} /> : Icon ? <Icon size={size === 'sm' ? 14 : 16} strokeWidth={1.8} /> : lead}
      {children && <span>{children}</span>}
      {IconR && <IconR size={size === 'sm' ? 14 : 16} strokeWidth={1.8} />}
    </button>
  );
});

// ---- Badges & status -------------------------------------------------------

export type Tone = 'neutral' | 'accent' | 'positive' | 'warning' | 'danger';

export function Badge({ tone = 'neutral', children, dot, className }: { tone?: Tone; children: ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={cx('badge', `badge--${tone}`, className)}>
      {dot && <span className="badge__dot" />}
      {children}
    </span>
  );
}

export function Count({ n, tone = 'neutral' }: { n: number; tone?: Tone }) {
  if (!n) return null;
  return <span className={cx('count', `count--${tone}`)}>{n}</span>;
}

// ---- Avatar --------------------------------------------------------------

export function Avatar({ person, size = 28, ring }: { person: Pick<Person, 'name' | 'hue' | 'org'>; size?: number; ring?: boolean }) {
  return (
    <span
      className={cx('avatar', `avatar--${person.org}`, ring && 'avatar--ring')}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38), ['--hue' as string]: person.hue }}
      title={person.name}
      aria-hidden
    >
      {initials(person.name)}
    </span>
  );
}

export function AvatarStack({ people, size = 24, max = 4 }: { people: Pick<Person, 'name' | 'hue' | 'org' | 'id'>[]; size?: number; max?: number }) {
  const shown = people.slice(0, max);
  return (
    <span className="avatar-stack">
      {shown.map((p) => (
        <Avatar key={p.id} person={p} size={size} ring />
      ))}
      {people.length > max && (
        <span className="avatar avatar--more" style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}>
          +{people.length - max}
        </span>
      )}
    </span>
  );
}

// ---- Form fields -------------------------------------------------------------

export function Field({ label, hint, error, children, htmlFor, optional }: { label: string; hint?: ReactNode; error?: string; children: ReactNode; htmlFor?: string; optional?: boolean }) {
  return (
    <div className={cx('field', error && 'field--error')}>
      <label className="field__label" htmlFor={htmlFor}>
        {label}
        {optional && <span className="field__optional">Optional</span>}
      </label>
      {children}
      {error ? <div className="field__error" role="alert">{error}</div> : hint && <div className="field__hint">{hint}</div>}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { icon?: LucideIcon }>(function Input(
  { icon: Icon, className, ...rest },
  ref,
) {
  if (!Icon) return <input ref={ref} className={cx('input', className)} {...rest} />;
  return (
    <span className={cx('input-wrap', className)}>
      <Icon size={15} strokeWidth={1.8} className="input-wrap__icon" />
      <input ref={ref} className="input input--with-icon" {...rest} />
    </span>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cx('input', 'textarea', className)} {...rest} />;
});

/** A native select; `icon` shows the chosen option's icon at the start of the field. */
export function Select({ className, children, icon: Icon, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { icon?: LucideIcon }) {
  return (
    <span className={cx('select', Icon && 'select--icon', className)}>
      {Icon && <Icon size={16} strokeWidth={1.7} className="select__icon" aria-hidden />}
      <select {...rest}>{children}</select>
    </span>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={cx('switch', checked && 'is-on')} onClick={() => onChange(!checked)}>
      <span className="switch__thumb" />
    </button>
  );
}

export function Checkbox({ checked, onChange, label, children }: { checked: boolean; onChange: (v: boolean) => void; label?: string; children?: ReactNode }) {
  const id = useId();
  return (
    <label className="checkbox" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={label} />
      <span className="checkbox__box" aria-hidden />
      {children && <span className="checkbox__label">{children}</span>}
    </label>
  );
}

// ---- Tabs & segmented ------------------------------------------------------------

export function Tabs<T extends string>({ value, onChange, items, className }: { value: T; onChange: (v: T) => void; items: { value: T; label: string; count?: number }[]; className?: string }) {
  return (
    <div className={cx('tabs', className)} role="tablist">
      {items.map((it) => (
        <button key={it.value} role="tab" aria-selected={value === it.value} className={cx('tabs__tab', value === it.value && 'is-active')} onClick={() => onChange(it.value)}>
          {it.label}
          {it.count !== undefined && <span className="tabs__count">{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: { value: T; label?: string; icon?: LucideIcon; title?: string }[]; label: string }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {items.map((it) => (
        <button key={it.value} role="radio" aria-checked={value === it.value} data-tip={it.label ? undefined : it.title} aria-label={it.title ?? it.label} className={cx('segmented__item', value === it.value && 'is-active')} onClick={() => onChange(it.value)}>
          {it.icon && <it.icon size={15} strokeWidth={1.8} />}
          {it.label && <span>{it.label}</span>}
        </button>
      ))}
    </div>
  );
}

// ---- States ------------------------------------------------------------------

export function Skeleton({ w = '100%', h = 14, r = 6, className }: { w?: number | string; h?: number; r?: number; className?: string }) {
  return <span className={cx('skeleton', className)} style={{ width: w, height: h, borderRadius: r }} />;
}

/** Quiet by design: a short line of muted text, an optional hint and action.
 *  `panel` sets it in a filled card, for empty sections inside a page. */
export function EmptyState({ title, body, action, panel }: { title: string; body?: ReactNode; action?: ReactNode; panel?: boolean }) {
  return (
    <div className={cx('empty', panel && 'empty--panel')}>
      <div className="empty__title">{title}</div>
      {body && <div className="empty__body">{body}</div>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}

export function SectionHeader({ title, meta, action, id }: { title: ReactNode; meta?: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="section-head">
      <h2 className="section-head__title" id={id}>
        {title}
        {meta !== undefined && <span className="section-head__meta">{meta}</span>}
      </h2>
      {action}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('eyebrow', className)}>{children}</div>;
}

export function PageHeader({ eyebrow, title, sub, actions }: { eyebrow?: ReactNode; title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="page-head">
      <div className="page-head__text">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="page-head__title">{title}</h1>
        {sub && <p className="page-head__sub">{sub}</p>}
      </div>
      {actions && <div className="page-head__actions">{actions}</div>}
    </header>
  );
}

export function Progress({ value, tone = 'accent' }: { value: number; tone?: Tone }) {
  return (
    <span className={cx('progress', `progress--${tone}`)} role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </span>
  );
}

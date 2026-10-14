import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cx } from './primitives';

// ---- Dialog --------------------------------------------------------------

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  bare?: boolean;
  /** With an icon the dialog takes the success-screen head: a lit icon tile
   *  above a centred title. */
  icon?: LucideIcon;
  tone?: IconTileTone;
}

/** 'ai' marks moments where Spark's AI takes over; Brand A gives it the Noor spectrum. */
export type IconTileTone = 'accent' | 'danger' | 'neutral' | 'ai';

/** A small rounded tile built like the primary button: lit top edge, soft drop. */
export function IconTile({ icon: Icon, tone = 'accent', className }: { icon: LucideIcon; tone?: IconTileTone; className?: string }) {
  return (
    <span className={cx('icon-tile', `icon-tile--${tone}`, className)} aria-hidden>
      <Icon size={26} strokeWidth={2.2} />
    </span>
  );
}

export function Dialog({ open, onClose, title, description, children, footer, size = 'md', bare, icon, tone }: DialogProps) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      // With stacked dialogs only the topmost one reacts to keys.
      const all = document.querySelectorAll('.dialog');
      if (all[all.length - 1] !== ref.current) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
      }
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => {
      const target = ref.current?.querySelector<HTMLElement>('[data-autofocus]') ?? ref.current?.querySelector<HTMLElement>('input, textarea, select');
      (target ?? ref.current)?.focus();
    });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
      prev?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="dialog-root">
      <div className="dialog-overlay" onClick={onClose} />
      <div ref={ref} className={cx('dialog', `dialog--${size}`, bare && 'dialog--bare', icon && 'dialog--hero')} role="dialog" aria-modal="true" tabIndex={-1}>
        {!bare && (title || description) && (
          <div className="dialog__head">
            <div>
              {icon && <IconTile icon={icon} tone={tone} />}
              {title && <h2 className="dialog__title">{title}</h2>}
              {description && <p className="dialog__desc">{description}</p>}
            </div>
            <button className="btn btn--ghost btn--sm btn--icon" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
          </div>
        )}
        <div className={cx(!bare && 'dialog__body')}>{children}</div>
        {footer && <div className="dialog__foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

// ---- Popover (anchored) ---------------------------------------------------------

interface PopoverProps {
  trigger: (p: { open: boolean; toggle: () => void; ref: (el: HTMLElement | null) => void }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: 'start' | 'end';
  side?: 'bottom' | 'top' | 'right'; // right: beside the anchor, bottoms aligned (rail items)
  width?: number;
  className?: string;
}

export function Popover({ trigger, children, align = 'end', side = 'bottom', width = 240, className }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !anchor) return;
    const place = () => {
      const r = anchor.getBoundingClientRect();
      const ph = panel.current?.offsetHeight ?? 0;
      const w = Math.min(width, window.innerWidth - 16);
      if (side === 'right') {
        const left = Math.min(r.right + 10, window.innerWidth - w - 8);
        const top = Math.max(8, Math.min(r.bottom - ph, window.innerHeight - ph - 8));
        setPos({ top, left });
        return;
      }
      let left = align === 'end' ? r.right - w : r.left;
      left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
      let top = side === 'bottom' ? r.bottom + 6 : r.top - ph - 6;
      if (side === 'bottom' && top + ph > window.innerHeight - 8 && r.top - ph - 6 > 8) top = r.top - ph - 6;
      if (side === 'top' && top < 8) top = r.bottom + 6;
      setPos({ top, left });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, anchor, align, side, width]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panel.current?.contains(t) || anchor?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        anchor?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, anchor]);

  const close = () => setOpen(false);
  return (
    <>
      {trigger({ open, toggle: () => setOpen((o) => !o), ref: setAnchor })}
      {open &&
        createPortal(
          <div
            ref={panel}
            className={cx('popover', className)}
            style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999, width: Math.min(width, window.innerWidth - 16) }}
          >
            {children(close)}
          </div>,
          document.body,
        )}
    </>
  );
}

// ---- Menu ------------------------------------------------------------------------

export interface MenuItem {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
  hint?: string;
  selected?: boolean; // single-choice menus mark the current option
}

export function Menu({ trigger, items, align = 'end', width = 220, header }: { trigger: PopoverProps['trigger']; items: (MenuItem | 'divider')[]; align?: 'start' | 'end'; width?: number; header?: ReactNode }) {
  return (
    <Popover trigger={trigger} align={align} width={width}>
      {(close) => (
        <div className="menu" role="menu">
          {header}
          {items.map((it, i) =>
            it === 'divider' ? (
              <div key={i} className="menu__divider" />
            ) : (
              <button
                key={it.label}
                role="menuitem"
                className={cx('menu__item', it.danger && 'menu__item--danger')}
                disabled={it.disabled}
                onClick={() => {
                  close();
                  it.onSelect();
                }}
              >
                {it.icon && <it.icon size={15} strokeWidth={1.8} />}
                <span>{it.label}</span>
                {it.hint && <span className="menu__hint">{it.hint}</span>}
                {it.selected && <Check size={14} className="menu__check" />}
              </button>
            ),
          )}
        </div>
      )}
    </Popover>
  );
}

// ---- Filter button ---------------------------------------------------------

/** A filled filter button with an icon ("Type", "Date"…). The first option
 *  means "any"; picking another shows it on the button. */
export function FilterMenu<T extends string>({
  icon: Icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const current = options.find((o) => o.value === value);
  const set = value !== options[0].value;
  return (
    <Menu
      align="start"
      width={200}
      trigger={({ toggle, ref }) => (
        <button ref={ref} className={cx('filter-btn', set && 'is-set')} onClick={toggle} aria-haspopup="menu" aria-label={`${label}: ${current?.label}`}>
          <Icon size={16} strokeWidth={1.8} />
          <span>{label}</span>
          {set && <span className="filter-btn__value">{current?.label}</span>}
          <ChevronDown size={14} className="filter-btn__chev" />
        </button>
      )}
      items={options.map((o) => ({ label: o.label, selected: o.value === value, onSelect: () => onChange(o.value) }))}
    />
  );
}

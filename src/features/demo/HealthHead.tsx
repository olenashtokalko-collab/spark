// Health's head (17 Nov, Jean's sketch and call; the head kept of three tried): the brand's name is the switcher.
//   · Brands: a group's lead sees every brand of the group; Spark's team sees every client. One list, one pick.
//   · A role is per brand and set by the admin, so it's a tag, not a picker (17 Nov: "for each of the people they
//     will only have one mode"): Admin (the client's lead: credits, team), a member (analysis, reports, requests; no
//     tag), Spark (Spark's team, looking at a client's page).
// Prototype: the brands are mock data. Add ?as=view or ?as=user to the address to see the other modes.
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Eye, ShieldCheck, UserRound, X } from 'lucide-react';
import { cx } from '../../components/ui/primitives';
import markImg from '../concepts/assets/img/mark.png';

export type Mode = 'admin' | 'user' | 'view';
export const MODE_NAME: Record<Mode, string> = { admin: 'Admin', user: 'User', view: 'View' };
export interface BrandItem {
  id: string;
  name: string;
  /** one sentence under the name, what the company is */
  line: string;
  /** what kind of company, in the switcher's list */
  kind: string;
  /** when Spark last changed something on this brand's page */
  updated: string;
  hue: number;
  /** your role in this brand (17 Nov, review: a role is per brand, as a seat is per workspace); Admin when not set */
  role?: 'admin' | 'user';
}

// a group's brands, as its lead sees them (Brand Co. is the one with data)
const GROUP: BrandItem[] = [
  { id: 'b-brandco', name: 'Brand Co.', line: '', kind: 'Everyday products', updated: '2026-11-17', hue: 228 },
  { id: 'b-home', name: 'Bayt & Co.', line: 'Bayt & Co. makes furniture and homeware for Gulf homes.', kind: 'Homeware', updated: '2026-11-12', hue: 262 },
  { id: 'b-kids', name: 'Little Ghaf', line: 'Little Ghaf makes clothes and toys for children up to 10.', kind: 'Kidswear', updated: '2026-11-04', hue: 16, role: 'user' },
  { id: 'b-saffron', name: 'Saffron & Salt', line: 'Saffron & Salt runs six cafés across Dubai and Abu Dhabi.', kind: 'Cafés', updated: '2026-10-28', hue: 38, role: 'user' },
];
// Spark's clients, as Spark's team sees them
const CLIENTS: BrandItem[] = [
  ...GROUP,
  { id: 'b-dune', name: 'Dune Supply', line: 'Dune Supply makes outdoor gear for desert heat.', kind: 'Outdoor', updated: '2026-11-15', hue: 30 },
  { id: 'b-noor', name: 'Noor Clinics', line: 'Noor Clinics runs 11 dental clinics in the UAE.', kind: 'Healthcare', updated: '2026-11-10', hue: 196 },
  { id: 'b-aster', name: 'Aster Living', line: 'Aster Living builds homes for young families in Riyadh.', kind: 'Real estate', updated: '2026-11-02', hue: 150 },
];
export const brandsFor = (mode: Mode) => (mode === 'view' ? CLIENTS : GROUP);

/** Your role in a brand (17 Nov, review: a role is per brand): Spark staff are Spark everywhere, ?as=user a member
 *  everywhere, otherwise each brand's own (Admin when not set). */
type Role = 'admin' | 'user' | 'spark';
const roleOf = (mode: Mode, b: BrandItem): Role => (mode === 'view' ? 'spark' : mode === 'user' ? 'user' : (b.role ?? 'admin'));
const ROLE: Record<Role, { name: string; Icon: typeof Eye }> = {
  admin: { name: 'Admin', Icon: ShieldCheck },
  user: { name: 'Member', Icon: UserRound },
  spark: { name: 'Spark team', Icon: Eye },
};
/** the tag for a role, every role tagged (18 Nov, review: "a tag for everyone"): Admin, Member, Spark */
const tagOf = (mode: Mode, b: BrandItem) => ({ admin: 'Admin', spark: 'Spark', user: 'Member' })[roleOf(mode, b)];
const ROLE_HINT: Record<Role, string> = {
  admin: 'You manage this brand’s credits and team.',
  user: 'You see the analysis and reports, and send requests. An admin manages credits and the team.',
  spark: 'You see this client’s page as they do.',
};

/** The mode from the address (?as=view|user), Admin otherwise. A prototype's way to show all three. */
export function useMode(): Mode {
  const read = (): Mode => {
    const m = /[?&]as=(view|user|admin)\b/.exec(window.location.hash + window.location.search);
    return (m?.[1] as Mode) ?? 'admin';
  };
  const [mode, setMode] = useState<Mode>(read);
  useEffect(() => {
    const on = () => setMode(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return mode;
}

const initials = (name: string) =>
  name
    .replace(/[^A-Za-z& ]/g, '')
    .split(/\s+/)
    .filter((w) => w && w !== '&')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

/** A brand's mark: its initials on a soft glass tile in its own hue. `glass`: the Console concept's warm glass avatar
 *  (17 Nov: "reuse the avatar"), turned to each brand's hue. */
export function BrandMark({ b, size = 28, glass }: { b: BrandItem; size?: number; glass?: boolean }) {
  if (glass)
    return (
      <span className="hb-mark hb-mark--glass" style={{ width: size, height: size, fontSize: size * 0.42 }} aria-hidden>
        <span className="hb-mark__bg" style={{ backgroundImage: `url(${markImg})`, filter: b.id === 'b-brandco' ? undefined : `hue-rotate(${b.hue - 10}deg)` }} />
        <b>{b.name[0]}</b>
      </span>
    );
  return (
    <span className="hb-mark" style={{ ['--h' as string]: b.hue, width: size, height: size, fontSize: size * 0.4 }} aria-hidden>
      {initials(b.name)}
    </span>
  );
}

/** Our version (17 Nov, after Slack's workspace switcher): the brand's avatar, its name with a caret, one line of what
 *  it is; a click opens the other brands (17 Nov, review: on click, not on hover). */
export function CompanySwitch({ brands, current, onPick, mode, meta, email, fixed }: { brands: BrandItem[]; current: string; onPick: (id: string) => void; mode: Mode; meta?: ReactNode; email?: string; /** the switcher lives in the sidebar: the name alone, no caret, no list */ fixed?: boolean }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', down);
    window.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', down);
      window.removeEventListener('keydown', key);
    };
  }, [open]);
  const cur = brands.find((b) => b.id === current) ?? brands[0];
  const role = ROLE[roleOf(mode, cur)];
  return (
    <div className={cx('hc-switch', open && 'is-open')} ref={box}>
      <span className="hc-switch__top">
        <button
          type="button"
          className="hc-switch__btn"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => !fixed && setOpen((o) => !o)}
          disabled={fixed}
        >
          {/* no logo in the head (17 Nov, review): the name leads; the marks stay in the list; the caret right by it */}
          <h1 className="hc-switch__name hh-swap" key={cur.id}>{cur.name}</h1>
          {/* 17 Nov, review (Notion's switcher): the role back as a tag by the name, said in words on hover; a member,
              the usual case, gets none */}
          {tagOf(mode, cur) && (
            <span className={`hb-mode-sm hc-tag is-${roleOf(mode, cur)}`}>
              {tagOf(mode, cur)}
              <span className="hc-role__tip" role="tooltip">
                <b>Your role: {role.name}</b>
                {ROLE_HINT[roleOf(mode, cur)]}
              </span>
            </span>
          )}
          {!fixed && <ChevronDown className="hc-switch__caret" size={18} strokeWidth={1.8} aria-hidden />}
        </button>
      </span>
      <span className="hc-switch__line hh-swap" key={`l-${cur.id}`}>{cur.line}</span>
      {meta && <span className="hc-switch__meta">{meta}</span>}
      {open && !fixed && (
        <div className="hb-menu hc-menu" role="listbox" aria-label={mode === 'view' ? 'Your clients' : 'Your brands'}>
          {/* 17 Nov, review (Notion's switcher): the email your roles are given to, then each brand: a small mark,
              its name, your role as a tag, a check on the one you're in */}
          {email && <span className="hc-email">{email}</span>}
          <span className="hb-menu__head hc-list-head">{mode === 'view' ? 'Your clients' : 'Your brands'}</span>
          <div className="hb-menu__list hc-list">
            {brands.map((b) => (
              <button
                key={b.id}
                type="button"
                role="option"
                aria-selected={b.id === cur.id}
                className={cx('hc-opt', b.id === cur.id && 'is-on')}
                onClick={() => {
                  onPick(b.id);
                  setOpen(false);
                }}
              >
                <BrandMark b={b} size={24} glass />
                <b className="hc-opt__name">{b.name}</b>
                {tagOf(mode, b) && <span className={`hb-mode-sm is-${roleOf(mode, b)}`}>{tagOf(mode, b)}</span>}
                {b.id === cur.id && <Check className="hc-opt__check" size={18} strokeWidth={2} aria-hidden />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export type ProfileTab = 'company' | 'audience' | 'voice';
const PROFILE_TABS: { id: ProfileTab; label: string }[] = [
  { id: 'company', label: 'The company' },
  { id: 'audience', label: 'Who it sells to' },
  { id: 'voice', label: 'How it speaks' },
];

/** Company profile as a drawer from the right (17 Nov, review: reference to glance at, so it stays on Home): "Company
 *  profile" and a close button (not the name again, it's on the page), tabs between its parts, the part picked. Closes
 *  on ×, Esc or a click outside; focus goes in on open and back to the button on close. */
export function ProfileDrawer({ open, onClose, tab, onTab, children }: { open: boolean; onClose: () => void; tab: ProfileTab; onTab: (t: ProfileTab) => void; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(open);
  const [out, setOut] = useState(false);
  useEffect(() => {
    if (open) {
      setShown(true);
      setOut(false);
      return;
    }
    if (!shown) return;
    // let it slide away before it leaves the page
    setOut(true);
    const t = window.setTimeout(() => setShown(false), 260);
    return () => window.clearTimeout(t);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('keydown', key);
      prev?.focus?.();
    };
  }, [open, onClose]);
  if (!shown) return null;
  return createPortal(
    <div className={cx('hp-drawer', out && 'is-out')}>
      <div className="hp-drawer__scrim" onClick={onClose} aria-hidden />
      <div className="hp-drawer__panel" role="dialog" aria-modal="true" aria-label="Company profile" tabIndex={-1} ref={panel}>
        <header className="hp-drawer__head">
          <h2 className="hp-drawer__title">Company profile</h2>
          <button type="button" className="hp-drawer__close" aria-label="Close" onClick={onClose}>
            <X size={18} strokeWidth={1.8} />
          </button>
        </header>
        <div className="hp-tabs" role="tablist" aria-label="Profile sections">
          {PROFILE_TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={cx('hp-tab', tab === t.id && 'is-on')} onClick={() => onTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="hp-drawer__body" role="tabpanel" key={tab}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}



/* ---- the brand open now, shared (17 Nov, review: "a version with the switcher in the left panel, as Claude Code
   does"): Home reads it and the sidebar's account menu can set it, so a brand picked in either place changes the page.
   `inSidebar` is on while the Sidebar version of Health is open; the account menu shows the brands only then. ---- */
let activeBrand = 'b-brandco';
let inSidebar = false;
// Brand bar (concept 3): whether Home shows that version, and whether its strip is open
let inBar = false;
// open by default (18 Nov, review: "show the brands by default; the user folds them if they want"); a fold is kept
let barOpen = (() => {
  try {
    return localStorage.getItem('spark-brandbar') !== 'folded';
  } catch {
    return true;
  }
})();
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
export const brandStore = {
  get: () => activeBrand,
  set: (id: string) => {
    if (id === activeBrand) return;
    activeBrand = id;
    emit();
  },
  setSidebar: (on: boolean) => {
    inSidebar = on;
    emit();
  },
  setBar: (on: boolean) => {
    inBar = on;
    emit();
  },
  setBarOpen: (on: boolean) => {
    barOpen = on;
    try {
      localStorage.setItem('spark-brandbar', on ? 'open' : 'folded');
    } catch {
      /* this visit only */
    }
    emit();
  },
  subscribe: (f: () => void) => {
    subs.add(f);
    return () => {
      subs.delete(f);
    };
  },
};
/** The brand open now, and whether the switcher lives in the sidebar. */
export function useActiveBrand(): [string, boolean] {
  const snap = useSyncExternalStore(brandStore.subscribe, () => `${activeBrand}|${inSidebar ? 1 : 0}`);
  const [id, side] = snap.split('|');
  return [id, side === '1'];
}

/** The brands in the sidebar's account menu, as Claude's (17 Nov, review): under "Your brands" each brand's small
 *  mark, its name, your role as a tag where it isn't a member's, a check on the one open. */
export function SidebarBrands({ onPicked, names }: { onPicked?: () => void; names?: Record<string, string> }) {
  const mode = useMode();
  const [cur] = useActiveBrand();
  const brands = brandsFor(mode);
  return (
    <div className="sb-brands" role="listbox" aria-label={mode === 'view' ? 'Your clients' : 'Your brands'}>
      <span className="sb-brands__head">{mode === 'view' ? 'Your clients' : 'Your brands'}</span>
      {brands.map((b) => (
        <button
          key={b.id}
          type="button"
          role="option"
          aria-selected={b.id === cur}
          className={cx('sb-brand', b.id === cur && 'is-on')}
          onClick={() => {
            brandStore.set(b.id);
            onPicked?.();
          }}
        >
          <BrandMark b={b} size={22} glass />
          <span className="sb-brand__name">{names?.[b.id] ?? b.name}</span>
          {tagOf(mode, b) && <span className={`hb-mode-sm is-${roleOf(mode, b)}`}>{tagOf(mode, b)}</span>}
          {b.id === cur && <Check className="sb-brand__check" size={16} strokeWidth={2} aria-hidden />}
        </button>
      ))}
    </div>
  );
}
/** The open brand's name, for the sidebar's account row. */
export function useActiveBrandName(fallback: string) {
  const mode = useMode();
  const [id] = useActiveBrand();
  const b = brandsFor(mode).find((x) => x.id === id);
  return b && b.id !== 'b-brandco' ? b.name : fallback;
}

/** Your role in the brand open now (17 Nov, review: what each role can do on Home): 'admin' tops up credits, invites
 *  people and approves proposals; 'user' (a member) sees everything and sends requests, but doesn't pay or approve;
 *  'spark' (Spark's team) only looks. */
export function useRoleHere(): Role {
  const mode = useMode();
  const [id] = useActiveBrand();
  const b = brandsFor(mode).find((x) => x.id === id) ?? brandsFor(mode)[0];
  return roleOf(mode, b);
}
export type { Role };

/** Company profile asked for from the sidebar's account menu (Health · Sidebar, 18 Nov, review): the menu asks, and
 *  Home opens its drawer, at once or as soon as Home is shown. */
let profileAsked = false;
const profileSubs = new Set<() => void>();
export function requestProfile() {
  profileAsked = true;
  profileSubs.forEach((f) => f());
}
export function useProfileRequest(on: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const f = () => {
      if (!profileAsked) return;
      profileAsked = false;
      on();
    };
    profileSubs.add(f);
    f();
    return () => {
      profileSubs.delete(f);
    };
  }, [on, enabled]);
}

/** Brand bar's state: whether Home shows the version, and whether the strip is open. */
export function useBrandBar(): [boolean, boolean] {
  const snap = useSyncExternalStore(brandStore.subscribe, () => `${inBar ? 1 : 0}|${barOpen ? 1 : 0}`);
  const [a, b] = snap.split('|');
  return [a === '1', b === '1'];
}

/** Concept 3, Brand bar (18 Nov, review, after Covey's strip of apps): a grid button in the window's top right corner;
 *  it opens a strip across the top of the page, the brands in a row, each its glass mark with its name under it, the
 *  open one underlined; the page moves down under it. Open by default; a pick changes the brand, the grid button
 *  folds it. */
export function BrandStrip({ names }: { names?: Record<string, string> }) {
  const mode = useMode();
  const [cur] = useActiveBrand();
  const [, open] = useBrandBar();
  const brands = brandsFor(mode);
  return (
    <>
      <div className={cx('hb-strip', open && 'is-open')} aria-hidden={!open}>
        <div className="hb-strip__in">
          <nav className="hb-strip__row" aria-label={mode === 'view' ? 'Your clients' : 'Your brands'}>
            {brands.map((b) => (
              <button
                key={b.id}
                type="button"
                tabIndex={open ? 0 : -1}
                className={cx('hb-strip__brand', b.id === cur && 'is-on')}
                aria-current={b.id === cur ? 'true' : undefined}
                onClick={() => brandStore.set(b.id)}
              >
                <BrandMark b={b} size={18} glass />
                <span>{names?.[b.id] ?? b.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      <button
        type="button"
        className={cx('hs-icon-btn hs-icon-btn--36 hb-grid', open && 'is-on')}
        aria-expanded={open}
        aria-label={open ? 'Hide your brands' : 'Your brands'}
        onClick={() => brandStore.setBarOpen(!open)}
      >
        {/* what it is, on hover (18 Nov, review) */}
        <span className="hb-grid__tip" role="tooltip">
          {open ? 'Hide your brands' : 'Switch brand'}
        </span>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
          {[3, 9, 15].flatMap((y) => [3, 9, 15].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.6" fill="currentColor" />))}
        </svg>
      </button>
    </>
  );
}

/** The brand open now as the sidebar's account row shows it in Brand bar (18 Nov, review): its coloured mark, its name,
 *  and your role in it with your email under them. */
export function useActiveBrandRow(fallbackName: string) {
  const mode = useMode();
  const [id] = useActiveBrand();
  const b = brandsFor(mode).find((x) => x.id === id) ?? brandsFor(mode)[0];
  const role = roleOf(mode, b);
  return { b, name: b.id === 'b-brandco' ? fallbackName : b.name, role: ROLE[role].name === 'Spark team' ? 'Spark' : ROLE[role].name };
}

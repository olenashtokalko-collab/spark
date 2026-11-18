import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  FileText,
  Folder,
  Inbox,
  House,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
  Building2,
  UserPlus,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { useStore } from '../../state/store';
import { navigate, useRoute } from '../../lib/router';
import { Avatar, cx } from '../ui/primitives';
import { Popover } from '../ui/overlay';
import { CreditsOverlay, TopUpDialog } from './Credits';
import { DrAiNavIcon, useDrAi } from '../ui/DrAi';
import { MetalParts, metalClass, useMetalUi } from '../ui/MetalButton';
import { DrAiDock } from '../../features/assistant/DrAiDock';
import { fmtRelative } from '../../lib/format';
import type { Notification } from '../../data/types';
import { PageArtView, useArt } from '../../features/onboarding/EmptyArt';
import { BrandMark, BrandStrip, SidebarBrands, requestProfile, useActiveBrand, useActiveBrandName, useActiveBrandRow, useBrandBar } from '../../features/demo/HealthHead';
import { HomeSwitch, readHomeLook } from '../../features/demo/HomeBentoDemo';

// Home is the start page after sign-in: the company, Spark's analysis and the work (feedback 23 Oct).
// Chats is its own page, with the history in a column on the left and "New chat" on top of it.
/** Prototype (#/demo/home-rethink?v=g…, 5 Nov): look G puts Brand Analysis in the sidebar as its own section,
 *  Home keeping the work (what needs you, the latest). Only on that demo; the portal's sidebar is unchanged. */
function navFor(path: string, query: URLSearchParams) {
  // G is the demo's default (5 Nov): no v means G's Home.
  const v = query.get('v') ?? 'g';
  if (path !== '/demo/home-rethink' || !v.startsWith('g')) return NAV;
  return [{ ...NAV[0], path: '/demo/home-rethink?v=g', match: () => v.startsWith('g') }, ...NAV.slice(1)];
}

const NAV = [
  {
    path: '/',
    label: 'Home',
    icon: House,
    // Home is the brand analysis since 9 Nov (the tab only repeated it, Jean #25): a report and the company
    // profile open from Home and go back there, so Home stays lit on them.
    match: (p: string) => p === '/' || p === '/home' || p.startsWith('/brand-analysis') || p.startsWith('/analysis'),
  },
  {
    path: '/assistant',
    label: 'Chats',
    icon: MessageSquare,
    match: (p: string) => p.startsWith('/assistant'),
  },
  {
    path: '/requests',
    label: 'Requests',
    icon: Inbox,
    match: (p: string) => p.startsWith('/requests'),
  },
  {
    path: '/documents',
    label: 'Documents',
    icon: Folder,
    match: (p: string) => p.startsWith('/documents'),
  },
  // Monitoring is hidden for now; the page still opens at #/monitoring.
  // { path: '/monitoring', label: 'Monitoring', icon: Radar, match: (p: string) => p.startsWith('/monitoring') },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { state, me } = useStore();
  const route = useRoute();
  const [inBar, barOpenNow] = useBrandBar();
  const barMode = inBar || readHomeLook() === 'healthBar';
  // Brand bar: the sidebar joins the strip, flush under it (18 Nov, review, as Covey): the shell is told on <html>
  useEffect(() => {
    const el = document.documentElement;
    if (barMode) el.dataset.brandbar = barOpenNow ? 'open' : 'folded';
    else delete el.dataset.brandbar;
    return () => {
      delete el.dataset.brandbar;
    };
  }, [barMode, barOpenNow]);

  const counts = useMemo(() => {
    const decisions = state.requests.filter((r) => r.status === 'proposal').length;
    const reviews = state.docs.filter((d) => d.review?.status === 'open').length;
    return { requests: decisions, documents: reviews };
  }, [state.requests, state.docs]);

  // The sidebar shows each icon with its name by default (feedback 21 Oct); it can be collapsed to icons,
  // and the choice is remembered on this device.
  const [railOpen, setRailOpen] = useState(() => {
    try {
      return localStorage.getItem('spark-rail') !== 'icons';
    } catch {
      return true;
    }
  });
  const toggleRail = () =>
    setRailOpen((o) => {
      try {
        localStorage.setItem('spark-rail', o ? 'icons' : 'labels');
      } catch {
        /* storage unavailable */
      }
      return !o;
    });
  const tip = (label: string) => (railOpen ? undefined : label);
  const drai = useDrAi();
  const metalUi = useMetalUi();

  // The sidebar holds everything around the work: logo, sections, notifications, and the person with
  // their company at the foot (feedback 21 Oct). The page sits beside it on its own rounded panel.
  return (
    <>
    {/* Brand bar (concept 3): the strip of brands across the top, its grid button in the corner, on every page */}
    {barMode && <BrandStrip names={{ 'b-qindeel': state.brand.name }} />}
    <div className={cx('shell', railOpen && 'shell--rail-open')}>
      {/* Spotlight background behind every page (light from above, grain). */}
      <div className="app-bg" aria-hidden>
        <span className="app-bg__light" />
        <span className="app-bg__grain" />
      </div>
      {/* A strip above the panel, so the page scrolls under its top edge. The credits live on Home. */}
      <header className="topbar" />

      <nav className="rail" aria-label="Main">
        <div className="rail__head">
          <a className="rail__logo" href="#/" aria-label="Spark, home">
            <span className="brand-hide">SPARK</span>
            {/* By the book: the wordmark (p. 26, Ink on Sand, at least 120px wide) when the sidebar is open; the
                app icon, the spark lit from inside (p. 29), when it is folded to icons. */}
            <img className="rail__wordmark brand-only" src="/brand/spark-logo-ink.png" alt="Spark Studios" />
            <img className="topbar__icon rail__appicon brand-only" src="/brand/spark-app-icon.jpg" alt="" />
          </a>
          {/* Collapse to icons; when collapsed it shows over the logo on hover. */}
          <button className="rail__toggle" onClick={toggleRail} aria-label={railOpen ? 'Collapse sidebar' : 'Expand sidebar'} data-tip={railOpen ? 'Collapse' : 'Expand'}>
            {railOpen ? <PanelLeftClose size={18} strokeWidth={1.7} /> : <PanelLeftOpen size={18} strokeWidth={1.7} />}
          </button>
        </div>
        {/* the sections in one glass pill, as the nav on sparkstudios.ae (13 Nov, review), stood upright */}
        <nav className="rail__nav" aria-label="Sections">
        {navFor(route.path, route.query)
          // Dr.AI on (#/demo/mascot): Chats leaves the list and comes back under a line as Ask Dr.AI.
          .filter((n) => !(drai && n.path.startsWith('/assistant')))
          .map((n) => {
          const active = n.match(route.path);
          const count = n.path === '/requests' ? counts.requests : n.path === '/documents' ? counts.documents : 0;
          // Requests and Documents open again (18 Nov, review: aligned to the Storybook's system)
          return (
            <a
              key={n.path}
              href={'#' + n.path}
              className={cx('rail__btn', active && 'is-active')}
              aria-current={active ? 'page' : undefined}
              aria-label={count ? `${n.label}, ${count} need you` : n.label}
              data-tip={tip(n.label)}
            >
              <n.icon size={18} strokeWidth={1.7} />
              <span className="rail__label">{n.label}</span>
              {count > 0 && <span className="rail__dot" aria-hidden />}
            </a>
          );
        })}
        </nav>
        {/* Dr.AI on: Spark's assistant apart from the sections, under a fine line, his head for its icon (after
            the Clara AI reference, 5 Nov). */}
        {drai && (
          <>
            {!metalUi && <span className="rail__rule" aria-hidden />}
            {metalUi ? (
              <a
                href="#/assistant"
                className={cx('rail__drai-metal', metalClass('spark', 'menu'), route.path.startsWith('/assistant') && 'is-active')}
                aria-current={route.path.startsWith('/assistant') ? 'page' : undefined}
                aria-label="Ask Dr.AI"
                data-tip={tip('Ask Dr.AI')}
              >
                <MetalParts tone="spark" profile="menu" />
                <span className="metal__label">{railOpen ? 'Ask Dr.AI' : <img className="rail__drai-head" src="brand/drai-head.png" alt="" width={28} height={28} />}</span>
              </a>
            ) : (
            <a
              href="#/assistant"
              className={cx('rail__btn rail__btn--drai', route.path.startsWith('/assistant') && 'is-active')}
              aria-current={route.path.startsWith('/assistant') ? 'page' : undefined}
              data-tip={tip('Ask Dr.AI')}
            >
              <DrAiNavIcon size={24} />
              <span className="rail__label">Ask Dr.AI</span>
            </a>
            )}
          </>
        )}
        {/* Notifications and the account sit at the foot, away from the daily sections. */}
        <span className="rail__end">
          <Notifications labels={railOpen} />
        </span>
        <AccountMenu labels={railOpen} active={route.path.startsWith('/settings') || route.path.startsWith('/team')} />
      </nav>

      <main className="content" id="content">
        {/* Dr.AI's dock (6 Nov, #/demo/dock): the strip at the top, the bar at the foot, or the corner. */}
        <DrAiDock place="top" />
        {children}
        <DrAiDock place="foot" />
      </main>
      <DrAiDock place="fixed" />
      {/* the version switch on every page (18 Nov, review: "it disappears on the other pages; keep it"); Home draws
          its own, which also switches the page in place */}
      {route.path !== '/' && <HomeSwitch current={readHomeLook()} />}
      <Shortcuts />
      {/* keep me in scope for screen readers */}
      <span className="sr-only">Signed in as {me.name}</span>
    </div>
    </>
  );
}

function Shortcuts() {
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) && !t.isContentEditable && !document.querySelector('.dialog')) {
        e.preventDefault();
        navigate('/assistant');
        setTimeout(() => document.querySelector<HTMLTextAreaElement>('.composer textarea')?.focus(), 60);
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);
  return null;
}

const notifIcon: Record<Notification['kind'], typeof Bell> = {
  proposal: FileText,
  request: Inbox,
  file: Folder,
  team: Users,
  decision: Check,
};

function Notifications({ labels }: { labels?: boolean }) {
  const { state, actions } = useStore();
  const list = state.notifications.filter((n) => n.audience === 'client').sort((a, b) => b.at.localeCompare(a.at));
  const unread = list.filter((n) => !n.read).length;
  const art = useArt();
  return (
    <Popover
      width={380}
      side="right"
      trigger={({ toggle, ref, open }) => (
        <button
          ref={ref}
          className={cx('rail__btn bell', open && 'is-active')}
          onClick={toggle}
          aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
          data-tip={open || labels ? undefined : 'Notifications'}
        >
          <Bell size={18} strokeWidth={1.7} />
          <span className="rail__label">Notifications</span>
          {unread > 0 && <span className="bell__dot">{unread}</span>}
        </button>
      )}
    >
      {(close) => (
        <div className="notifs">
          <div className="notifs__head">
            <span>Notifications</span>
            <button className="link-btn" onClick={actions.markAllRead} disabled={!unread}>
              <CheckCheck size={14} /> Mark all read
            </button>
          </div>
          {list.length === 0 ? (
            <div className="notifs__empty">
              <PageArtView v={art.notifs} small />
              You're all caught up.
            </div>
          ) : (
            <div className="notifs__list">
              {list.slice(0, 12).map((n) => {
                const I = notifIcon[n.kind];
                return (
                  <button
                    key={n.id}
                    className={cx('notif', !n.read && 'is-unread')}
                    onClick={() => {
                      actions.markRead(n.id);
                      close();
                      navigate(n.route);
                    }}
                  >
                    <span className="notif__icon">
                      <I size={15} strokeWidth={1.7} />
                    </span>
                    <span className="notif__text">
                      <span className="notif__title">{n.title}</span>
                      <span className="notif__body">{n.body}</span>
                      <span className="notif__time">{fmtRelative(n.at)}</span>
                    </span>
                    {!n.read && <span className="notif__dot" aria-label="Unread" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Popover>
  );
}

/** The person and their company at the foot of the sidebar. The menu follows the reference's workspace
 *  menu: the company, its credits with Top up, the team and company profile, settings, log out. */
function AccountMenu({ labels, active }: { labels: boolean; active: boolean }) {
  const { state, me, actions } = useStore();
  // Hovering the credits row shows Home's credits card beside the menu. It lives outside the menu, with
  // the Top up dialog, so both outlive the menu closing; a short delay lets the pointer cross to the card.
  const [creditsRow, setCreditsRow] = useState<HTMLElement | null>(null);
  const [topUp, setTopUp] = useState(false);
  const hideTimer = useRef<number>();
  const showCredits = (el: HTMLElement) => {
    window.clearTimeout(hideTimer.current);
    setCreditsRow(el);
  };
  const hideCredits = () => {
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setCreditsRow(null), 160);
  };
  const go = (close: () => void, path: string) => {
    close();
    navigate(path);
  };
  const left = Math.max(0, Math.min(1, state.credits / Math.max(state.creditsTotal, 1)));
  // Health · Sidebar (17 Nov, review: "the switcher in the left panel, as Claude Code does"): the row names the brand
  // open now, and the menu lists the brands first, as Claude lists its workspaces
  const [, brandsHere] = useActiveBrand();
  const brandName = useActiveBrandName(state.brand.name);
  // Home in Health's look, either version (18 Nov, review): the brand before your role ("Qindeel · Head of Brand"),
  // and no credits in this menu (they're on Home)
  const health = (() => {
    try {
      return ['health', 'healthSide'].includes(localStorage.getItem('spark-home-look') ?? 'health');
    } catch {
      return true;
    }
  })();
  const [inBarHere] = useBrandBar();
  const barHere = inBarHere || (() => {
    try {
      return localStorage.getItem('spark-home-look') === 'healthBar';
    } catch {
      return false;
    }
  })();
  const brandRow = useActiveBrandRow(state.brand.name);
  const roleLine = health ? `${brandName} · ${me.title}` : `${me.title} · ${state.brand.name}`;
  return (
    <>
      <Popover
        width={300}
        side="top"
        align="start"
        className="acct-pop"
        trigger={({ toggle, ref, open }) => (
          <button
            ref={ref}
            className={cx('rail__me', (open || active) && 'is-active')}
            onClick={toggle}
            aria-haspopup="dialog"
            aria-label="Account, team and settings"
            data-tip={labels || open ? undefined : me.name}
          >
            {/* Brand bar (18 Nov, review): the brand open now leads the row, its coloured mark and name, your role in it
                and your email under them; elsewhere you lead, with your brand and title */}
            {barHere ? <BrandMark b={brandRow.b} size={32} glass /> : <Avatar person={me} size={32} />}
            <span className="rail__me-text">
              <span className="rail__me-name">{barHere ? brandRow.name : me.name}</span>
              <span className="rail__me-sub" title={barHere ? `${brandRow.role} · ${me.email}` : undefined}>
                {barHere ? `${brandRow.role} · ${me.email}` : roleLine}
              </span>
            </span>
            <ChevronsUpDown size={15} className="rail__me-chev" />
          </button>
        )}
      >
        {(close) => (
          <div className={cx('acct', (brandsHere || barHere) && 'acct--brands')}>
            {(brandsHere || barHere) && (
              <>
                {/* who you are first (18 Nov, review): your face, your name, your role and the brand open now; the
                    email under it. In Brand bar the brand leads, as in the row: its mark and name, your role and email */}
                {barHere ? (
                  <div className="acct__ws acct__ws--top">
                    <BrandMark b={brandRow.b} size={40} glass />
                    <div className="acct__ws-text">
                      <b>{brandRow.name}</b>
                      <span className="acct__role acct__role--line" title={`${brandRow.role} · ${me.email}`}>{`${brandRow.role} · ${me.email}`}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="acct__ws acct__ws--top">
                      <Avatar person={me} size={40} />
                      <div className="acct__ws-text">
                        <b>{me.name}</b>
                        <span className="acct__role">{roleLine}</span>
                      </div>
                    </div>
                    <span className="acct__email">{me.email}</span>
                  </>
                )}
                {/* Brand bar: the brands are in the strip at the top, not here (18 Nov, review) */}
                {!barHere && <SidebarBrands onPicked={close} names={{ 'b-qindeel': state.brand.name }} />}
                <div className="acct__divider" />
              </>
            )}
            <div className="acct__ws">
              <Avatar person={me} size={40} />
              <div className="acct__ws-text">
                <b>{me.name}</b>
                <span className="acct__role">{roleLine}</span>
              </div>
            </div>
            {/* The company's credits, as beside its name on Home: the spark, the balance, "credits". The
                row shows the same credits card as on Home, beside the menu, on hover. */}
            {/* no credits here in either Health version (18 Nov, review): they stay on Home */}
            {!brandsHere && !barHere && !health && (
            <button
              type="button"
              className={cx('acct__credits', left < 0.2 && 'is-low')}
              aria-label={`Credits: USD ${state.credits.toFixed(2)}. Details and Top up`}
              onMouseEnter={(e) => showCredits(e.currentTarget)}
              onMouseLeave={hideCredits}
              onFocus={(e) => showCredits(e.currentTarget)}
              onClick={(e) => showCredits(e.currentTarget)}
            >
              {/* no ring before the amount (13 Nov, review) */}
              <span className="acct__credits-amount">
                USD{' '}
                {state.credits.toLocaleString('en-US', {
                  minimumFractionDigits: Number.isInteger(state.credits) ? 0 : 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="acct__credits-word">{left < 0.2 ? 'left · running low' : 'credits'}</span>
            </button>
            )}
            {/* the team and the company's profile shown but not open while the client approves the look (13 Nov,
                review), as Requests and Documents in the sidebar: a tip beside them on hover, the names unchanged */}
            {/* the team opens (18 Nov, review: "make Manage my team clickable") */}
            <button className="acct__item" onClick={() => go(close, '/team')}>
              <UserPlus size={18} strokeWidth={1.6} />
              <span>Manage my team</span>
            </button>
            {[...(brandsHere || barHere ? [] : [{ label: 'Company profile', Icon: Building2 }])].map(({ label, Icon }) => (
              <span
                key={label}
                className="acct__item acct__item--off"
                tabIndex={0}
                aria-disabled="true"
                aria-label={`${label}, coming soon`}
                data-tip="Coming soon"
              >
                <Icon size={18} strokeWidth={1.6} />
                <span>{label}</span>
              </span>
            ))}
            {/* Health · Sidebar: Company profile opens Home's profile drawer (18 Nov, review), Home first if elsewhere */}
            {(brandsHere || barHere) && (
              <button
                className="acct__item"
                onClick={() => {
                  close();
                  if (!/^\/?$/.test(window.location.hash.replace(/^#/, '').split('?')[0])) navigate('/');
                  requestProfile();
                }}
              >
                <Building2 size={18} strokeWidth={1.6} />
                <span>Company profile</span>
              </button>
            )}
            <div className="acct__divider" />
            <button className="acct__item" onClick={() => go(close, '/settings')}>
              <Settings size={18} strokeWidth={1.6} />
              <span>Settings</span>
            </button>
            <div className="acct__divider" />
            <button
              className="acct__item"
              onClick={() => {
                close();
                actions.signOut();
              }}
            >
              <LogOut size={18} strokeWidth={1.6} />
              <span>Log out</span>
            </button>
          </div>
        )}
      </Popover>
      {creditsRow && (
        <CreditsOverlay
          anchor={creditsRow}
          onClose={() => setCreditsRow(null)}
          onEnter={() => window.clearTimeout(hideTimer.current)}
          onLeave={hideCredits}
          onTopUp={() => {
            setCreditsRow(null);
            setTopUp(true);
          }}
        />
      )}
      <TopUpDialog open={topUp} onClose={() => setTopUp(false)} />
    </>
  );
}

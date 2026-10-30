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
import { CreditRing, CreditsOverlay, TopUpDialog } from './Credits';
import { fmtRelative } from '../../lib/format';
import type { Notification } from '../../data/types';

// Home is the start page after sign-in: the company, Spark's analysis and the work (feedback 23 Oct).
// Chats is its own page, with the history in a column on the left and "New chat" on top of it.
const NAV = [
  {
    path: '/',
    label: 'Home',
    icon: House,
    // An analysis page belongs to Home: it opens from there and goes back there.
    match: (p: string) => p === '/' || p === '/home' || p.startsWith('/analysis'),
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

  // The sidebar holds everything around the work: logo, sections, notifications, and the person with
  // their company at the foot (feedback 21 Oct). The page sits beside it on its own rounded panel.
  return (
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
        {NAV.map((n) => {
          const active = n.match(route.path);
          const count = n.path === '/requests' ? counts.requests : n.path === '/documents' ? counts.documents : 0;
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
        {/* Notifications and the account sit at the foot, away from the daily sections. */}
        <span className="rail__end">
          <Notifications labels={railOpen} />
        </span>
        <AccountMenu labels={railOpen} active={route.path.startsWith('/settings') || route.path.startsWith('/team')} />
      </nav>

      <main className="content" id="content">
        {children}
      </main>
      <Shortcuts />
      {/* keep me in scope for screen readers */}
      <span className="sr-only">Signed in as {me.name}</span>
    </div>
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
            <div className="notifs__empty">You're all caught up.</div>
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
            <Avatar person={me} size={32} />
            <span className="rail__me-text">
              <span className="rail__me-name">{me.name}</span>
              <span className="rail__me-sub">
                {me.title} · {state.brand.name}
              </span>
            </span>
            <ChevronsUpDown size={15} className="rail__me-chev" />
          </button>
        )}
      >
        {(close) => (
          <div className="acct">
            <div className="acct__ws">
              <Avatar person={me} size={40} />
              <div className="acct__ws-text">
                <b>{me.name}</b>
                <span className="acct__role">
                  {me.title} · {state.brand.name}
                </span>
              </div>
            </div>
            {/* The company's credits, as beside its name on Home: the spark, the balance, "credits". The
                row shows the same credits card as on Home, beside the menu, on hover. */}
            <button
              type="button"
              className={cx('acct__credits', left < 0.2 && 'is-low')}
              aria-label={`Credits: USD ${state.credits.toFixed(2)}. Details and Top up`}
              onMouseEnter={(e) => showCredits(e.currentTarget)}
              onMouseLeave={hideCredits}
              onFocus={(e) => showCredits(e.currentTarget)}
              onClick={(e) => showCredits(e.currentTarget)}
            >
              <CreditRing left={state.credits} total={state.creditsTotal} size={18} />
              <span className="acct__credits-amount">
                USD{' '}
                {state.credits.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="acct__credits-word">{left < 0.2 ? 'left · running low' : 'credits'}</span>
            </button>
            <button className="acct__item" onClick={() => go(close, '/team')}>
              <UserPlus size={18} strokeWidth={1.6} />
              <span>Manage my team</span>
            </button>
            {/* The company's basics and Spark's analysis, on Home. */}
            <button className="acct__item" onClick={() => go(close, '/?show=company')}>
              <Building2 size={18} strokeWidth={1.6} />
              <span>Company profile</span>
            </button>
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

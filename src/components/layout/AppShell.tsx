import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  FileText,
  Folder,
  Inbox,
  SquarePen,
  PanelLeftClose,
  PanelLeftOpen,
  History,
  ChevronsUpDown,
  Sparkles,
  Building2,
  UserPlus,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { useStore } from '../../state/store';
import { navigate, useRoute } from '../../lib/router';
import { ChatHistory } from '../../features/assistant/ChatHistory';
import { Avatar, cx } from '../ui/primitives';
import { Popover } from '../ui/overlay';
import { fmtRelative } from '../../lib/format';
import type { Notification } from '../../data/types';

const NAV = [
  { path: '/requests', label: 'Requests', icon: Inbox, match: (p: string) => p.startsWith('/requests') },
  { path: '/documents', label: 'Documents', icon: Folder, match: (p: string) => p.startsWith('/documents') },
  // Monitoring is hidden for now; the page still opens at #/monitoring.
  // { path: '/monitoring', label: 'Monitoring', icon: Radar, match: (p: string) => p.startsWith('/monitoring') },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { state, me } = useStore();
  const route = useRoute();
  const [historyOpen, setHistoryOpen] = useState(false);
  useEffect(() => setHistoryOpen(false), [route.path]);
  useEffect(() => {
    if (!historyOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setHistoryOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [historyOpen]);



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
  const onChat = route.path === '/' || route.path === '/assistant';

  // The sidebar holds everything around the work: logo, sections, notifications, and the person with
  // their company at the foot (feedback 21 Oct). The page sits beside it on its own rounded panel.
  // Chat history opens from the sidebar as a panel.
  return (
    <div className={cx('shell', railOpen && 'shell--rail-open')}>
      {/* Spotlight background behind every page (light from above, grain). */}
      <div className="app-bg" aria-hidden>
        <span className="app-bg__light" />
        <span className="app-bg__grain" />
      </div>
      {/* A strip above the panel, so the page scrolls under its top edge. */}
      <header className="topbar" />

      <nav className="rail" aria-label="Main">
        <div className="rail__head">
          <a className="rail__logo" href="#/assistant" aria-label="Spark, new chat">
            <span className="brand-hide">SPARK</span>
            {/* Brand A: the app icon from the brand book, the spark lit from inside (p. 9). */}
            <img className="topbar__icon brand-only" src="/brand/spark-app-icon.jpg" alt="" />
          </a>
          {/* Collapse to icons; when collapsed it shows over the logo on hover. */}
          <button className="rail__toggle" onClick={toggleRail} aria-label={railOpen ? 'Collapse sidebar' : 'Expand sidebar'} data-tip={railOpen ? 'Collapse' : 'Expand'}>
            {railOpen ? <PanelLeftClose size={18} strokeWidth={1.7} /> : <PanelLeftOpen size={18} strokeWidth={1.7} />}
          </button>
        </div>
        <a className={cx('rail__btn', onChat && !historyOpen && 'is-active')} href="#/assistant" aria-label="New chat" data-tip={tip('New chat')} aria-current={onChat ? 'page' : undefined}>
          <SquarePen size={18} strokeWidth={1.7} />
          <span className="rail__label">New chat</span>
        </a>
        <button className={cx('rail__btn', historyOpen && 'is-active')} onClick={() => setHistoryOpen((o) => !o)} aria-expanded={historyOpen} aria-label="Chats" data-tip={tip('Chats')}>
          <History size={18} strokeWidth={1.7} />
          <span className="rail__label">Chats</span>
        </button>
        {NAV.map((n) => {
          const active = n.match(route.path) && !historyOpen;
          const count = n.path === '/requests' ? counts.requests : n.path === '/documents' ? counts.documents : 0;
          return (
            <a key={n.path} href={'#' + n.path} className={cx('rail__btn', active && 'is-active')} aria-current={active ? 'page' : undefined} aria-label={count ? `${n.label}, ${count} need you` : n.label} data-tip={tip(n.label)}>
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

      {historyOpen && (
        <>
          <div className="history-scrim" onClick={() => setHistoryOpen(false)} />
          <aside className="history-flyout" aria-label="Chat history">
            <ChatHistory />
          </aside>
        </>
      )}

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

export function Notifications({ audience = 'client', routeFor = (r: string) => r, labels }: { audience?: 'client' | 'spark'; routeFor?: (route: string) => string; labels?: boolean }) {
  const { state, actions } = useStore();
  const list = state.notifications.filter((n) => n.audience === audience).sort((a, b) => b.at.localeCompare(a.at));
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
            <button className="link-btn" onClick={() => actions.markAllRead(audience)} disabled={!unread}>
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
                      navigate(routeFor(n.route));
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

// The company's credit balance. New companies start with USD 100 free (feedback 21 Oct); fixed for the prototype.
const CREDITS = { left: 100, of: 100 };

/** The person and their company at the foot of the sidebar. The menu follows the reference's workspace
 *  menu: the company, its credits, the team and company profile, settings, log out. */
function AccountMenu({ labels, active }: { labels: boolean; active: boolean }) {
  const { state, me, actions } = useStore();
  const go = (close: () => void, path: string) => {
    close();
    navigate(path);
  };
  return (
    <Popover
      width={300}
      side="top"
      align="start"
      className="acct-pop"
      trigger={({ toggle, ref, open }) => (
        <button ref={ref} className={cx('rail__me', (open || active) && 'is-active')} onClick={toggle} aria-haspopup="dialog" aria-label="Account, team and settings" data-tip={labels || open ? undefined : me.name}>
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
          <div className="acct__credits">
            <div className="acct__credits-row">
              <div>
                <div className="acct__credits-label">
                  <Sparkles size={17} strokeWidth={1.8} /> Credits
                </div>
                <div className={cx('acct__credits-amount', CREDITS.left === 0 && 'is-out')}>USD {CREDITS.left.toFixed(2)}</div>
              </div>
              {/* Top-ups come with point 3 of the feedback; no action yet. */}
              <button className="acct__topup" type="button">
                Top up
              </button>
            </div>
            <div className="acct__bar">
              <span style={{ width: `${(CREDITS.left / CREDITS.of) * 100}%` }} />
            </div>
          </div>
          <button className="acct__item" onClick={() => go(close, '/team')}>
            <UserPlus size={18} strokeWidth={1.6} />
            <span>Manage my team</span>
          </button>
          {/* The company's basics (website, social, competitors), kept by Spark. Opens later. */}
          <button className="acct__item" type="button">
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
  );
}

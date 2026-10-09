import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  FileText,
  Folder,
  Inbox,
  Monitor,
  Moon,
  SquarePen,
  History,
  Sun,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { useStore } from '../../state/store';
import { navigate, useRoute } from '../../lib/router';
import { ChatHistory } from '../../features/assistant/ChatHistory';
import { Avatar, Count, cx } from '../ui/primitives';
import { Popover } from '../ui/overlay';
import { fmtRelative } from '../../lib/format';
import type { Notification } from '../../data/types';

const NAV = [
  { path: '/requests', label: 'Requests', icon: Inbox, match: (p: string) => p.startsWith('/requests') },
  { path: '/documents', label: 'Documents', icon: Folder, match: (p: string) => p.startsWith('/documents') },
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


  // Theme: resolve "system" to the OS preference.
  useEffect(() => {
    const apply = () => {
      const t = state.theme === 'system' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : state.theme;
      document.documentElement.dataset.theme = t;
    };
    apply();
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [state.theme]);

  const counts = useMemo(() => {
    const decisions = state.requests.filter((r) => r.status === 'proposal').length;
    const reviews = state.docs.filter((d) => d.review?.status === 'open').length;
    return { requests: decisions, documents: reviews };
  }, [state.requests, state.docs]);

  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Main">
        {/* Like Waldo: the logo starts a new chat. */}
        <a className="sidebar__brand sidebar__brand--link" href="#/assistant" title="New chat">
          <span className="brand-mark" aria-hidden>
            B
          </span>
          <div className="sidebar__brand-text">
            <div className="sidebar__brand-name">{state.brand.name}</div>
          </div>
        </a>
        <a className={cx('new-chat', (route.path === '/' || route.path === '/assistant') && 'is-active')} href="#/assistant" title="New chat" aria-current={route.path === '/' || route.path === '/assistant' ? 'page' : undefined}>
          <SquarePen size={16} strokeWidth={1.8} />
          <span>New chat</span>
        </a>

        <nav className="nav">
          {NAV.map((n) => {
            const active = n.match(route.path);
            const count = n.path === '/requests' ? counts.requests : n.path === '/documents' ? counts.documents : 0;
            return (
              <a key={n.path} href={'#' + n.path} title={n.label} className={cx('nav__item', active && 'is-active')} aria-current={active ? 'page' : undefined}>
                <n.icon size={17} strokeWidth={1.7} />
                <span>{n.label}</span>
                <Count n={count} tone="warning" />
              </a>
            );
          })}
        </nav>

        {/* Narrow screens: the list is hidden in the icon rail, so it opens as a panel. */}
        <button
          className={cx('nav__item history-toggle', historyOpen && 'is-active')}
          onClick={() => setHistoryOpen((o) => !o)}
          aria-expanded={historyOpen}
          aria-label="Chat history"
          title="Chat history"
        >
          <History size={17} strokeWidth={1.7} />
        </button>

        <div className="sidebar__history">
          <ChatHistory />
        </div>

      </aside>
      {historyOpen && (
        <>
          <div className="history-scrim" onClick={() => setHistoryOpen(false)} />
          <aside className="history-flyout" aria-label="Chat history">
            <ChatHistory />
          </aside>
        </>
      )}

      <div className="main">
        <header className="topbar">
          <div className="topbar__spacer" />
          <Notifications />
          <a className={cx('btn btn--ghost btn--icon', route.path.startsWith('/settings') && 'is-pressed')} href="#/settings" aria-label="Settings" title="Settings">
            <Settings size={18} strokeWidth={1.7} />
          </a>
          <UserMenu />
        </header>
        <main className="content" id="content">
          {children}
        </main>
      </div>
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

function Notifications() {
  const { state, actions } = useStore();
  const list = state.notifications.filter((n) => n.audience === 'client').sort((a, b) => b.at.localeCompare(a.at));
  const unread = list.filter((n) => !n.read).length;
  return (
    <Popover
      width={380}
      trigger={({ toggle, ref, open }) => (
        <button ref={ref} className={cx('btn btn--ghost btn--icon bell', open && 'is-pressed')} onClick={toggle} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
          <Bell size={18} strokeWidth={1.7} />
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

function UserMenu() {
  const { state, me, actions } = useStore();
  const themes = [
    { v: 'dark' as const, icon: Moon, label: 'Dark' },
    { v: 'light' as const, icon: Sun, label: 'Light' },
    { v: 'system' as const, icon: Monitor, label: 'System' },
  ];
  return (
    <Popover
      width={300}
      trigger={({ toggle, ref }) => (
        <button ref={ref} className="user-btn" onClick={toggle} aria-label="Account and prototype controls">
          <Avatar person={me} size={30} />
        </button>
      )}
    >
      {(close) => (
        <div className="menu user-menu">
          <div className="user-menu__who">
            <Avatar person={me} size={36} />
            <div>
              <div className="user-menu__name">{me.name}</div>
              <div className="user-menu__mail">
                {me.title} · {state.brand.name}
              </div>
            </div>
          </div>
          <button
            className="menu__item"
            onClick={() => {
              close();
              navigate('/team');
            }}
          >
            <Users size={15} />
            <span>Team</span>
            <span className="menu__hint">{state.people.filter((p) => p.org === 'client').length} members</span>
          </button>
          <div className="menu__divider" />
          <div className="menu__label">Appearance</div>
          <div className="theme-pick">
            {themes.map((t) => (
              <button key={t.v} className={cx(state.theme === t.v && 'is-active')} onClick={() => actions.setTheme(t.v)} aria-pressed={state.theme === t.v}>
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>
          <div className="menu__divider" />
          <button
            className="menu__item"
            onClick={() => {
              close();
              actions.signOut();
            }}
          >
            <LogOut size={15} />
            <span>Log out</span>
          </button>
        </div>
      )}
    </Popover>
  );
}

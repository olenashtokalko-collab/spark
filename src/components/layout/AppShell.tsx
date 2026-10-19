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
  ChevronDown,
  Sun,
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


  // Theme: resolve "system" to the OS preference.
  useEffect(() => {
    const apply = () => {
      const t = state.theme === 'system' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'sand' : 'dark') : state.theme;
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

  const team = state.people.filter((p) => p.org === 'client');
  const onChat = route.path === '/' || route.path === '/assistant';

  // Layout after the Waldo home: logo and account in a top bar, sections in a
  // slim icon rail. Chat history opens from the rail as a panel.
  return (
    <div className="shell">
      {/* Spotlight background behind every page (light from above, grain). */}
      <div className="app-bg" aria-hidden>
        <span className="app-bg__light" />
        <span className="app-bg__grain" />
      </div>
      <header className="topbar">
        <a className="topbar__logo" href="#/assistant" aria-label="Spark, new chat">
          <span className="brand-hide">SPARK</span>
          {/* Brand A: the app icon from the brand book, the spark lit from inside (p. 9). */}
          <img className="topbar__icon brand-only" src="/brand/spark-app-icon.jpg" alt="" />
        </a>
        <div className="topbar__spacer" />
        <TeamMenu team={team} />
        <UserMenu />
      </header>

      <nav className="rail" aria-label="Main">
        <a className={cx('rail__btn', onChat && !historyOpen && 'is-active')} href="#/assistant" aria-label="New chat" data-tip="New chat" aria-current={onChat ? 'page' : undefined}>
          <SquarePen size={18} strokeWidth={1.7} />
        </a>
        <button className={cx('rail__btn', historyOpen && 'is-active')} onClick={() => setHistoryOpen((o) => !o)} aria-expanded={historyOpen} aria-label="Chats" data-tip="Chats">
          <History size={18} strokeWidth={1.7} />
        </button>
        {NAV.map((n) => {
          const active = n.match(route.path) && !historyOpen;
          const count = n.path === '/requests' ? counts.requests : n.path === '/documents' ? counts.documents : 0;
          return (
            <a key={n.path} href={'#' + n.path} className={cx('rail__btn', active && 'is-active')} aria-current={active ? 'page' : undefined} aria-label={count ? `${n.label}, ${count} need you` : n.label} data-tip={n.label}>
              <n.icon size={18} strokeWidth={1.7} />
              {count > 0 && <span className="rail__dot" aria-hidden />}
            </a>
          );
        })}
        {/* Notifications and settings sit at the foot of the rail, away from the daily sections. */}
        <span className="rail__end">
          <Notifications />
        </span>
        <a
          className={cx('rail__btn', route.path.startsWith('/settings') && 'is-active')}
          href="#/settings"
          aria-label="Settings"
          data-tip="Settings"
          aria-current={route.path.startsWith('/settings') ? 'page' : undefined}
        >
          <Settings size={18} strokeWidth={1.7} />
        </a>
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

/** "Brand Co. · My team": who shares this workspace, with a way to manage it. */
function TeamMenu({ team }: { team: ReturnType<typeof useStore>['state']['people'] }) {
  const { state } = useStore();
  return (
    <Popover
      width={280}
      trigger={({ toggle, ref, open }) => (
        <button ref={ref} className={cx('team-btn', open && 'is-open')} onClick={toggle} aria-haspopup="dialog">
          {state.brand.name} · My team
          <ChevronDown size={14} />
        </button>
      )}
    >
      {(close) => (
        <div className="menu team-menu">
          <div className="menu__label">{state.brand.name} · {team.length} people</div>
          {team.map((p) => (
            <div key={p.id} className="team-menu__row">
              <Avatar person={p} size={26} />
              <span className="team-menu__name">{p.name}</span>
              <span className="faint team-menu__role">{p.role === 'owner' ? 'Owner' : p.role === 'viewer' ? 'Viewer' : 'Member'}</span>
            </div>
          ))}
          <div className="menu__divider" />
          <button
            className="menu__item"
            onClick={() => {
              close();
              navigate('/team');
            }}
          >
            <Users size={15} />
            <span>Manage team</span>
          </button>
        </div>
      )}
    </Popover>
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

export function Notifications({ audience = 'client', routeFor = (r: string) => r }: { audience?: 'client' | 'spark'; routeFor?: (route: string) => string }) {
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
          data-tip={open ? undefined : 'Notifications'}
        >
          <Bell size={18} strokeWidth={1.7} />
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

function UserMenu() {
  const { state, me, actions } = useStore();
  const themes = [
    { v: 'sand' as const, icon: Sun, label: 'Light' },
    // Dark is switched off for now (and System, which could resolve to it).
    { v: 'dark' as const, icon: Moon, label: 'Dark', off: true },
    { v: 'system' as const, icon: Monitor, label: 'System', off: true },
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
          <div className="menu__label">Appearance</div>
          <div className="theme-pick">
            {themes.map((t) => (
              <button
                key={t.v}
                className={cx(state.theme === t.v && 'is-active')}
                onClick={() => actions.setTheme(t.v)}
                aria-pressed={state.theme === t.v}
                disabled={t.off}
                data-tip={t.off ? 'Coming soon' : undefined}
              >
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

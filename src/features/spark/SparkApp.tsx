// The Spark team view (prototype): a separate shell for Spark staff, next to the client portal.
// Routes: #/spark (inbox) · #/spark/requests/:id[/conversation] · #/spark/requests/:id/proposal/new · #/spark/clients
import { useEffect } from 'react';
import { Building2, Inbox as InboxIcon, ArrowUpRight } from 'lucide-react';
import { Avatar, cx } from '../../components/ui/primitives';
import { useRoute } from '../../lib/router';
import { useStore } from '../../state/store';
import { dana } from './data';
import { SparkInbox } from './SparkInbox';
import { SparkRequestPage } from './SparkRequestPage';
import { NewProposal } from './NewProposal';
import { SparkClients } from './SparkClients';

export function SparkApp() {
  const { parts, query } = useRoute();
  const { state } = useStore();
  // The same theme as the client portal (the AppShell sets it there).
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme === 'system' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'sand' : 'dark') : state.theme;
  }, [state.theme]);
  const [, section, id, sub, sub2] = parts;
  let screen;
  if (section === 'clients') screen = <SparkClients />;
  else if (section === 'requests' && id && sub === 'proposal' && sub2 === 'new') screen = <NewProposal id={id} />;
  else if (section === 'requests' && id) screen = <SparkRequestPage id={id} tab={sub === 'conversation' ? 'conversation' : sub === 'files' ? 'files' : sub === 'activity' ? 'activity' : 'overview'} />;
  else screen = <SparkInbox initialClient={query.get('client') ?? undefined} />;
  const onClients = section === 'clients';
  return (
    <div className="shell spk">
      <div className="app-bg" aria-hidden>
        <span className="app-bg__light" />
        <span className="app-bg__grain" />
      </div>
      <header className="topbar">
        <a className="topbar__logo" href="#/spark" aria-label="Spark team view">
          <img className="topbar__icon brand-only" src="/brand/spark-app-icon.jpg" alt="" />
        </a>
        <span className="spk__badge">Spark team view</span>
        <div className="topbar__spacer" />
        <a className="spk__switch" href="#/requests">
          Open client view <ArrowUpRight size={14} />
        </a>
        <span className="spk__me">
          <Avatar person={dana} size={28} />
          <span>{dana.name}</span>
        </span>
      </header>
      <nav className="rail" aria-label="Spark team">
        <a className={cx('rail__btn', !onClients && 'is-active')} href="#/spark" aria-label="Inbox" data-tip="Inbox">
          <InboxIcon size={18} strokeWidth={1.7} />
          <span className="rail__dot" aria-hidden />
        </a>
        <a className={cx('rail__btn', onClients && 'is-active')} href="#/spark/clients" aria-label="Clients" data-tip="Clients">
          <Building2 size={18} strokeWidth={1.7} />
        </a>
      </nav>
      <main className="content" id="content">
        <div className="screen" key={parts.slice(0, 4).join('/')}>
          {screen}
        </div>
      </main>
    </div>
  );
}

// The Spark team view (prototype): a separate shell for Spark staff, next to the client portal.
// Routes: #/spark (inbox) · #/spark/requests/:id[/conversation] · #/spark/requests/:id/proposal/new · #/spark/clients
import { useEffect } from 'react';
import { Building2, Inbox as InboxIcon } from 'lucide-react';
import { Avatar, cx } from '../../components/ui/primitives';
import { useRoute } from '../../lib/router';
import { useStore } from '../../state/store';
import { Notifications } from '../../components/layout/AppShell';
import { dana } from './data';
import { SparkInbox } from './SparkInbox';
import { SparkRequestPage } from './SparkRequestPage';
import { SparkProposalView } from './SparkProposalView';
import { sampleProposalOf } from './sampleProposal';
import { sampleRequests } from './data';
import { SparkClients } from './SparkClients';

/** A notification's route is a client-portal one; the Spark team opens the same request in its own view. */
const sparkRoute = (route: string) => {
  const m = route.match(/^\/requests\/([^/]+)/);
  return route.startsWith('/spark') ? route : m ? `/spark/requests/${m[1]}` : '/spark';
};

export function SparkApp() {
  const { parts, query } = useRoute();
  const { state } = useStore();
  // The same theme as the client portal (the AppShell sets it there).
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme === 'system' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'sand' : 'dark') : state.theme;
  }, [state.theme]);
  const [, section, id, sub] = parts;
  let screen;
  if (section === 'clients') screen = <SparkClients />;
  // Every request writes and edits its proposal on the proposal page; a sample request (another client)
  // brings its versions from the sample row.
  else if (section === 'requests' && id && sub === 'proposal') {
    const live = state.requests.some((r) => r.id === id);
    const base = sampleRequests.find((r) => r.id === id);
    screen = <SparkProposalView key={id} id={id} sample={!live && base ? sampleProposalOf(base) : undefined} />;
  }
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
        <div className="topbar__spacer" />
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
        <span className="rail__end">
          <Notifications audience="spark" routeFor={sparkRoute} />
        </span>
      </nav>
      <main className="content" id="content">
        <div className="screen" key={parts.slice(0, 4).join('/')}>
          {screen}
        </div>
      </main>
    </div>
  );
}

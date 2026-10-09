import { useEffect } from 'react';
import { useRoute } from './lib/router';
import { AppShell } from './components/layout/AppShell';
import { SignIn } from './features/auth/SignIn';
import { useStore } from './state/store';
import { Assistant } from './features/assistant/Assistant';
import { Requests } from './features/requests/Requests';
import { RequestDetail } from './features/requests/RequestDetail';
import { ProposalView } from './features/requests/ProposalView';
import { Documents } from './features/documents/Documents';
import { Settings, TeamPage } from './features/team/Settings';
import { EmptyState, Button } from './components/ui/primitives';
import { Compass } from 'lucide-react';
import { navigate } from './lib/router';

function Screen() {
  const { parts, query } = useRoute();
  const [section, a, b] = parts;

  switch (section) {
    case undefined:
    case 'assistant':
      return <Assistant convId={a} />;
    case 'requests':
      if (a && b === 'proposal') return <ProposalView requestId={a} version={query.get('v') ? Number(query.get('v')) : undefined} />;
      if (a) return <RequestDetail id={a} />;
      return <Requests />;
    case 'documents':
      return <Documents folderId={a} docId={query.get('doc')} />;
    case 'team':
      return <TeamPage />;
    case 'settings':
      if (a === 'team') return <Redirect to="/team" />;
      if (a) return <Redirect to="/settings" />;
      return <Settings />;
  }
  return (
    <EmptyState icon={Compass} title="Page not found" body="This link doesn't match anything in the workspace." action={<Button onClick={() => navigate('/')}>Go to chats</Button>} />
  );
}

function Redirect({ to }: { to: string }) {
  useEffect(() => navigate(to, { replace: true }), [to]);
  return null;
}

export default function App() {
  const { path } = useRoute();
  const { state } = useStore();
  useEffect(() => {
    if (!path.startsWith('/assistant')) window.scrollTo({ top: 0 });
  }, [path]);
  if (!state.signedIn) return <SignIn />;
  return (
    <AppShell>
      <div className="screen" key={path.split('/').slice(0, 3).join('/')}>
        <Screen />
      </div>
    </AppShell>
  );
}

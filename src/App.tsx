import { useEffect } from 'react';
import { useRoute } from './lib/router';
import { AppShell } from './components/layout/AppShell';
import { SignIn } from './features/auth/SignIn';
import { useStore } from './state/store';
import { Assistant } from './features/assistant/Assistant';
import { Requests } from './features/requests/Requests';
import { Monitoring } from './features/monitoring/Monitoring';
import { ChatDemo } from './features/demo/ChatDemo';
import { ThreadDemo } from './features/demo/ThreadDemo';
import { DocsDemo } from './features/demo/DocsDemo';
import { ButtonsDemo } from './features/demo/ButtonsDemo';
import { ComposerDemo } from './features/demo/ComposerDemo';
import { GlassDemo } from './features/demo/GlassDemo';
import { BubblesDemo } from './features/demo/BubblesDemo';
import { TableDemo } from './features/demo/TableDemo';
import { AiButtonDemo } from './features/demo/AiButtonDemo';
import { RequestDetail } from './features/requests/RequestDetail';
import { ProposalView } from './features/requests/ProposalView';
import { Documents } from './features/documents/Documents';
import { Settings, TeamPage } from './features/team/Settings';
import { EmptyState, Button } from './components/ui/primitives';

import { navigate } from './lib/router';

function Screen() {
  const { parts, query } = useRoute();
  const [section, a, b] = parts;

  switch (section) {
    case undefined:
    case 'assistant':
      return <Assistant convId={a} />;
    case 'requests':
      if (a && b === 'proposal') return <ProposalView requestId={a} />;
      if (a) return <RequestDetail id={a} />;
      return <Requests />;
    case 'documents':
      return <Documents folderId={a} docId={query.get('doc')} />;
    case 'demo':
      if (a === 'chat') return <ChatDemo />;
      if (a === 'thread') return <ThreadDemo />;
      if (a === 'docs') return <DocsDemo />;
      if (a === 'buttons') return <ButtonsDemo />;
      if (a === 'composer') return <ComposerDemo />;
      if (a === 'glass') return <GlassDemo />;
      if (a === 'bubbles') return <BubblesDemo />;
      if (a === 'table') return <TableDemo />;
      if (a === 'ai-button') return <AiButtonDemo />;
      break;
    case 'monitoring':
      return <Monitoring />;
    case 'team':
      return <TeamPage />;
    case 'settings':
      if (a === 'team') return <Redirect to="/team" />;
      if (a) return <Redirect to="/settings" />;
      return <Settings />;
  }
  return (
    <EmptyState title="Page not found" body="This link doesn't match anything in the workspace." action={<Button onClick={() => navigate('/')}>Go to chats</Button>} />
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

import { FeedbackDemo } from './features/demo/FeedbackDemo';
import { FoldersDemo } from './features/demo/FoldersDemo';
import { RequestsUiDemo } from './features/demo/RequestsUiDemo';
import { IntroDemo } from './features/demo/IntroDemo';
import { HomeDemo } from './features/demo/HomeDemo';
import { HomeHubDemo } from './features/demo/HomeHubDemo';
import { HomeLayoutsDemo } from './features/demo/HomeLayoutsDemo';
import { HomeRequestsDemo } from './features/demo/HomeRequestsDemo';
import { HomeNextDemo } from './features/demo/HomeNextDemo';
import { HomeHeroDemo } from './features/demo/HomeHeroDemo';
import { RecentDemo } from './features/demo/RecentDemo';
import { useEffect } from 'react';
import { useRoute } from './lib/router';
import { AppShell } from './components/layout/AppShell';
import { SignIn } from './features/auth/SignIn';
import { Invite } from './features/auth/Invite';
import { STORAGE_KEY, useStore } from './state/store';
import { Assistant } from './features/assistant/Assistant';
import { HomePage } from './features/home/HomeLayouts';
import { AnalysisPage } from './features/home/AnalysisPage';
import { ComposerColorDemo } from './features/demo/ComposerColorDemo';
import { NoteStripDemo } from './features/demo/NoteStripDemo';
import { ModalSpacingDemo } from './features/demo/ModalSpacingDemo';
import { Requests } from './features/requests/Requests';
import { Monitoring } from './features/monitoring/Monitoring';
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
    case 'home':
      return <HomePage />;
    case 'analysis':
      return <AnalysisPage kind={a} />;
    case 'assistant':
      return <Assistant convId={a} />;
    case 'requests':
      if (a && b === 'proposal') return <ProposalView requestId={a} />;
      if (a) return <RequestDetail id={a} />;
      return <Requests />;
    case 'documents':
      return <Documents folderId={a} docId={query.get('doc')} />;
    case 'demo':
      if (a === 'composer-color') return <ComposerColorDemo />;
      if (a === 'note-strip') return <NoteStripDemo />;
      if (a === 'modal-spacing') return <ModalSpacingDemo />;
      if (a === 'feedback') return <FeedbackDemo />;
      if (a === 'folders') return <FoldersDemo />;
      if (a === 'requests-ui') return <RequestsUiDemo />;
      if (a === 'intro') return <IntroDemo />;
      if (a === 'home') return <HomeDemo />;
      if (a === 'home-hub') return <HomeHubDemo />;
      if (a === 'home-layouts') return <HomeLayoutsDemo />;
      if (a === 'home-requests') return <HomeRequestsDemo />;
      if (a === 'home-next') return <HomeNextDemo />;
      if (a === 'home-hero') return <HomeHeroDemo />;
      if (a === 'recent') return <RecentDemo />;
      break;
    case 'reset':
      // For rehearsals: forget everything that was done in the prototype and start from the seed data again.
      return <Reset />;
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
    <EmptyState title="Page not found" body="This link doesn't match anything in the workspace." action={<Button onClick={() => navigate('/')}>Go to Home</Button>} />
  );
}

function Reset() {
  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage can be blocked; the reload below still gives a fresh state in memory */
    }
    window.location.hash = '#/requests';
    window.location.reload();
  }, []);
  return null;
}

function Redirect({ to }: { to: string }) {
  useEffect(() => navigate(to, { replace: true }), [to]);
  return null;
}

const INVITE_ONLY = import.meta.env.VITE_INVITE_ONLY === '1';

export default function App() {
  const { path } = useRoute();
  const { state } = useStore();
  useEffect(() => {
    if (!path.startsWith('/assistant')) window.scrollTo({ top: 0 });
  }, [path]);
  // Theme: resolve "system" to the OS preference. Set here, not in the shell, so the sign-in page
  // (shown without the shell) opens in the brand theme too.
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
  // The page an invitation email links to, signed in or not.
  if (path === '/invite') return <Invite standalone={INVITE_ONLY} />;
  // A build with only the invitation (VITE_INVITE_ONLY=1, for sharing that flow on its own): every page is it.
  if (INVITE_ONLY) return <Invite standalone />;
  // Signed out: the sign-in page, except for the sign-in options demo, which is about that page.
  if (!state.signedIn)
    return path.startsWith('/demo/intro') ? (
      <div className="signed-out-demo">
        <IntroDemo />
      </div>
    ) : (
      <SignIn />
    );
  return (
    <AppShell>
      <div className="screen" key={path.split('/').slice(0, 3).join('/')}>
        <Screen />
      </div>
    </AppShell>
  );
}

import { FeedbackDemo } from './features/demo/FeedbackDemo';
import { FoldersDemo } from './features/demo/FoldersDemo';
import { RequestsUiDemo } from './features/demo/RequestsUiDemo';
import { IntroDemo } from './features/demo/IntroDemo';
import { HomeDemo } from './features/demo/HomeDemo';
import { RecentDemo } from './features/demo/RecentDemo';
import { useEffect } from 'react';
import { useRoute } from './lib/router';
import { AppShell } from './components/layout/AppShell';
import { SignIn } from './features/auth/SignIn';
import { STORAGE_KEY, useStore } from './state/store';
import { Assistant } from './features/assistant/Assistant';
import { SparkApp } from './features/spark/SparkApp';
import { ComposerColorDemo } from './features/demo/ComposerColorDemo';
import { NoteStripDemo } from './features/demo/NoteStripDemo';
import { SectionChangesDemo } from './features/demo/SectionChangesDemo';
import { ChangesBannerDemo } from './features/demo/ChangesBannerDemo';
import { ModalSpacingDemo } from './features/demo/ModalSpacingDemo';
import { CommentDemo } from './features/demo/CommentDemo';
import { RequestFlowDemo } from './features/demo/RequestFlowDemo';
import { CommentMarkDemo } from './features/demo/CommentMarkDemo';
import { ChangeHighlightDemo } from './features/demo/ChangeHighlightDemo';
import { TocCommentsDemo } from './features/demo/TocCommentsDemo';
import { VersionPickerDemo } from './features/demo/VersionPickerDemo';
import { ProposalFlowDemo } from './features/demo/ProposalFlowDemo';
import { PrevCommentDemo } from './features/demo/PrevCommentDemo';
import { ProposalStatesDemo } from './features/demo/ProposalStatesDemo';
import { ProposalSentDemo } from './features/demo/ProposalSentDemo';
import { ReviewedColorsDemo } from './features/demo/ReviewedColorsDemo';
import { StatusDeadlineDemo } from './features/demo/StatusDeadlineDemo';
import { StagesRowDemo } from './features/demo/StagesRowDemo';
import { VersionInfoDemo } from './features/demo/VersionInfoDemo';
import { CommentsPanelDemo } from './features/demo/CommentsPanelDemo';
import { ProposalDocDemo } from './features/demo/ProposalDocDemo';
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
      // On this branch the Spark team's view is the start page.
      return <Redirect to="/spark" />;
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
      if (a === 'section-changes') return <SectionChangesDemo />;
      if (a === 'changes-banner') return <ChangesBannerDemo />;
      if (a === 'modal-spacing') return <ModalSpacingDemo />;
      if (a === 'comment') return <CommentDemo />;
      if (a === 'request-flow') return <RequestFlowDemo />;
      if (a === 'comment-mark') return <CommentMarkDemo />;
      if (a === 'change-highlight') return <ChangeHighlightDemo />;
      if (a === 'toc-comments') return <TocCommentsDemo />;
      if (a === 'version-picker') return <VersionPickerDemo />;
      if (a === 'proposal-flow') return <ProposalFlowDemo />;
      if (a === 'prev-comment') return <PrevCommentDemo />;
      if (a === 'proposal-states') return <ProposalStatesDemo />;
      if (a === 'proposal-sent') return <ProposalSentDemo />;
      if (a === 'reviewed-colors') return <ReviewedColorsDemo />;
      if (a === 'status-deadline') return <StatusDeadlineDemo />;
      if (a === 'stages-row') return <StagesRowDemo />;
      if (a === 'version-info') return <VersionInfoDemo />;
      if (a === 'comments-panel') return <CommentsPanelDemo />;
      if (a === 'proposal-doc') return <ProposalDocDemo />;
      if (a === 'feedback') return <FeedbackDemo />;
      if (a === 'folders') return <FoldersDemo />;
      if (a === 'requests-ui') return <RequestsUiDemo />;
      if (a === 'intro') return <IntroDemo />;
      if (a === 'home') return <HomeDemo />;
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
    <EmptyState title="Page not found" body="This link doesn't match anything in the workspace." action={<Button onClick={() => navigate('/')}>Go to chats</Button>} />
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
  // Signed out: the sign-in page, except for the sign-in options demo, which is about that page.
  if (!state.signedIn)
    return path.startsWith('/demo/intro') ? (
      <div className="signed-out-demo">
        <IntroDemo />
      </div>
    ) : (
      <SignIn />
    );
  if (path === '/spark' || path.startsWith('/spark/')) return <SparkApp />;
  return (
    <AppShell>
      <div className="screen" key={path.split('/').slice(0, 3).join('/')}>
        <Screen />
      </div>
    </AppShell>
  );
}

// One of Spark's analyses of the company, on a page of its own (#/analysis/website|social|brand|pr). Opened
// from "Where we think you have issues" on Home; back goes to Home. The layout is look I from
// #/demo/analysis (after the client's reference): the verdict, the figures, then Issues to fix,
// Recommendations and What works as grids of small cards, each with Spark's mark to ask about it, and what
// the analysis rests on. Questions open the chat drawer with questions about this analysis.
import { navigate, useRoute } from '../../lib/router';
import { analyses } from '../../data/mock';
import { Button, EmptyState } from '../../components/ui/primitives';
import { AnalysisView } from './AnalysisLooks';

export function AnalysisPage({ kind }: { kind?: string }) {
  const a = analyses.find((x) => x.kind === kind);
  // ?issue= names the issue the client clicked on Home: the page brings it into view and marks it.
  const issue = useRoute().query.get('issue') ?? undefined;
  if (!a)
    return (
      <EmptyState
        title="Analysis not found"
        body="Spark hasn’t shared this analysis yet, or the link is wrong."
        action={<Button onClick={() => navigate('/')}>Back to Home</Button>}
      />
    );
  return <AnalysisView key={a.kind} a={a} look="tabs" focus={issue} />;
}

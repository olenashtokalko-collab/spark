// One of Spark's analyses of the company, on a page of its own (#/analysis/website|social|brand|pr). Opened
// from "Where we think you have issues" on Home; back goes to Home. The layout is look I from
// #/demo/analysis (after the client's reference): the verdict, the figures, then Issues to fix,
// Recommendations and What works as grids of small cards, each with Spark's mark to ask about it, and what
// the analysis rests on. Questions open the chat drawer with questions about this analysis.
import { useEffect } from 'react';
import { navigate, useRoute } from '../../lib/router';
import { analyses, prAnalysis } from '../../data/mock';
import { Button, EmptyState } from '../../components/ui/primitives';
import { HealthReport } from './AnalysisLooks';

// Reports with a page in Brand Analysis (5 Nov) open there, so there is one way to each report; this page stays only for
// analyses without a tab.
const ON_HOME = ['social', 'website'];

export function AnalysisPage({ kind }: { kind?: string }) {
  // the PR report kept apart from `analyses` (19 Nov)
  const a = [...analyses, prAnalysis].find((x) => x.kind === kind);
  // ?issue= names the issue the client clicked on Home: the page brings it into view and marks it.
  const issue = useRoute().query.get('issue') ?? undefined;
  useEffect(() => {
    if (kind && ON_HOME.includes(kind)) navigate(`/brand-analysis/${kind}${issue ? `?issue=${encodeURIComponent(issue)}` : ''}`, { replace: true });
  }, [kind, issue]);
  if (kind && ON_HOME.includes(kind)) return null;
  if (!a)
    return (
      <EmptyState
        title="Analysis not found"
        body="Spark hasn’t shared this analysis yet, or the link is wrong."
        action={<Button onClick={() => navigate('/')}>Back to Home</Button>}
      />
    );
  // Health's report page (19 Nov), as Website and Social
  return <HealthReport key={a.kind} a={a} focus={issue} />;
}

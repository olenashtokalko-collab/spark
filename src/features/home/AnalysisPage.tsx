// One of Spark's analyses of the company, on a page of its own (#/analysis/website|social|brand|pr). Opened
// from "Where we think you have issues" on Home; back goes to Home. The summary, every finding (what works
// and where it gets lost), what it rests on and that a Spark strategist reviewed it (trust signals from the
// research dossier: raw AI reports read as generic), the report file when there is one, and a chat about it.
// The client sees Spark as one team, so the reviewer is named by role, not by name.
import { useState } from 'react';
import { ArrowLeft, ArrowUpRight, BadgeCheck, FileText, Search } from 'lucide-react';
import { useStore } from '../../state/store';
import { navigate } from '../../lib/router';
import { analyses } from '../../data/mock';
import { useUI } from '../../state/ui';
import { Button, EmptyState, cx } from '../../components/ui/primitives';
import { fmtDate } from '../../lib/format';
import { ANALYSIS_ICON } from '../assistant/Home';
import { ChatDrawer, Mascot } from '../assistant/ChatDrawer';

const ORIGIN = { spark: 'Prepared by Spark', requested: 'You requested' } as const;

export function AnalysisPage({ kind }: { kind?: string }) {
  const { state } = useStore();
  // The report opens in the preview over this page, so closing it comes back here.
  const { openDoc } = useUI();
  // Ask Spark to fix opens the chat drawer with the issue already written in, to edit and send.
  const [ask, setAsk] = useState<string | null>(null);
  const a = analyses.find((x) => x.kind === kind);

  if (!a)
    return (
      <EmptyState
        title="Analysis not found"
        body="Spark hasn’t shared this analysis yet, or the link is wrong."
        action={<Button onClick={() => navigate('/')}>Back to Home</Button>}
      />
    );

  const I = ANALYSIS_ICON[a.kind];
  const doc = a.docId ? state.docs.find((d) => d.id === a.docId) : undefined;
  // Ask Spark opens the chat drawer over the page with the question written in, as from a proposal.
  const discuss = () => setAsk(`Walk me through the ${a.title.toLowerCase()} and what we should do first.`);
  // What works first, then where it gets lost, as a reader would want to hear it.
  const findings = [...a.findings].sort((x, y) => Number(!!y.good) - Number(!!x.good));

  return (
    <article className="anp">
      <a className="back" href="#/">
        <ArrowLeft size={15} /> Home
      </a>

      <header className="anp__head">
        <span className="anp__kind">
          <I size={14} strokeWidth={1.8} /> {a.title}
        </span>
        <h1 className="anp__title">{a.summary}</h1>
        <div className="anp__meta">
          <span className="anp__by">
            <img src="/brand/spark-app-icon.jpg" alt="" />
            {ORIGIN[a.origin]}
          </span>
          <span>Updated {fmtDate(a.updatedAt)}</span>
          <span className="anp__reviewed">
            <BadgeCheck size={15} strokeWidth={1.9} /> Reviewed by a Spark strategist
          </span>
        </div>
        <div className="anp__actions">
          <button type="button" className="hl-mchat" onClick={discuss}>
            <Mascot size={28} />
            Ask Spark about this analysis
          </button>
          {doc && (
            <Button variant="secondary" icon={FileText} onClick={() => openDoc(doc.id)}>
              Open the report file
            </Button>
          )}
        </div>
      </header>

      <section className="anp__findings" aria-label="Findings">
        {findings.map((f) => (
          <div key={f.title} className={cx('anp__finding', f.good ? 'is-good' : 'is-issue')}>
            <span className="anp__tag">{f.good ? 'What works' : 'Where it gets lost'}</span>
            <h2>{f.title}</h2>
            <p>{f.body}</p>
            {!f.good && (
              <button
                type="button"
                className="hl-issue__fix anp__fix"
                onClick={() => setAsk(`How would you fix this? ${a.title.replace(' analysis', '')}: “${f.title}”. What should we do first, and can Spark take it on?`)}
              >
                <Mascot size={18} /> Ask Spark to fix
              </button>
            )}
          </div>
        ))}
      </section>

      {/* What the analysis rests on. */}
      <section className="anp__basis" aria-label="How Spark did this">
        <Search size={16} strokeWidth={1.8} />
        <div>
          <b>How Spark did this</b>
          <p>{a.basis}.</p>
          <p className="anp__note">AI gathered and sorted the data; a Spark strategist checked it before sharing. Figures are indicative.</p>
        </div>
      </section>

      {doc && (
        <button type="button" className="anp__report" onClick={() => openDoc(doc.id)}>
          <FileText size={18} strokeWidth={1.7} />
          <span>
            <b>{doc.name}</b>
            <span>The full report</span>
          </span>
          <ArrowUpRight size={16} />
        </button>
      )}
      <ChatDrawer open={ask !== null} initial={ask ?? undefined} onClose={() => setAsk(null)} />
    </article>
  );
}

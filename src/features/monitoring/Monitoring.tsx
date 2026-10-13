// Social media monitoring (Hassan, 8 Oct: "a section about social media
// results"). Shown as the weekly summaries Spark shares, without charts, until
// Spark confirms its data source and metrics (see docs, open questions).
import { FileText, Inbox, Sparkles } from 'lucide-react';
import { useStore } from '../../state/store';
import { useUI } from '../../state/ui';
import { digests } from '../../data/mock';
import { Badge, Button, PageHeader, cx } from '../../components/ui/primitives';
import { fmtDate } from '../../lib/format';
import { navigate } from '../../lib/router';

export function Monitoring() {
  const { actions } = useStore();
  const { openDoc, openRequest } = useUI();
  const ask = (q: string) => {
    const id = actions.ask(null, q);
    navigate(`/assistant/${id}`);
  };
  return (
    <div className="monitoring">
      <PageHeader title="Monitoring" sub="What people say about your brand on social media. Spark shares a short summary every week." />
      <div className="digests">
        {digests.map((d, i) => (
          <article key={d.id} className={cx('digest', i === 0 && 'digest--latest')}>
            <div className="digest__head">
              <div>
                <div className="digest__week">
                  {d.week}
                  {i === 0 && <Badge tone="accent">Latest</Badge>}
                </div>
                <div className="faint">
                  {d.range} · shared {fmtDate(d.sharedAt)}
                </div>
              </div>
              <Badge>Sample data</Badge>
            </div>
            <p className="digest__summary">{d.summary}</p>
            <ul className="digest__list">
              {d.highlights.map((h) => (
                <li key={h.text} className={`digest__item digest__item--${h.tone}`}>
                  <span className="digest__dot" aria-hidden />
                  {h.text}
                </li>
              ))}
            </ul>
            <div className="digest__actions">
              <Button size="sm" icon={FileText} onClick={() => openDoc(d.docId)}>
                Full digest
              </Button>
              <Button size="sm" variant="ghost" icon={Sparkles} onClick={() => ask(d.prompt)}>
                Ask about this
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={Inbox}
                onClick={() => openRequest({ type: 'Social', title: '', description: `${d.week} (${d.range}): ${d.summary}\n\nWhat we'd like from Spark: ` })}
              >
                Create request
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

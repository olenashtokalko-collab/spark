// Home, the start page after sign-in (feedback of 23 Oct: "we don't have a homepage"). The client sees
// Spark's work before asking anything: the three figures to act on, the company's profile, the analysis
// Spark did on the company (only what exists), and the things touched last. A chat starts from the button.
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowRight, AtSign, ChevronDown, CircleAlert, FileText, Gem, Globe, MessageSquare, Newspaper, Paperclip, SquarePen } from 'lucide-react';
import { useStore } from '../../state/store';
import { analyses } from '../../data/mock';
import { NeedsYou, isOpen, needsYou } from '../../components/domain';
import { Button, cx } from '../../components/ui/primitives';
import { navigate, useRoute } from '../../lib/router';
import { fmtDate } from '../../lib/format';
import { TYPE_ICON } from '../requests/CreateRequestDialog';
import type { CompanyAnalysis, WorkRequest } from '../../data/types';

export const ANALYSIS_ICON: Record<CompanyAnalysis['kind'], typeof Globe> = { website: Globe, social: AtSign, brand: Gem, pr: Newspaper };

const onYou = (r: WorkRequest) => needsYou(r);


/** The four things touched last: requests, files to approve and chats, newest first. Each has an icon for its
 *  kind, the title, the attention mark when it waits on you, and when it was touched. */
export function useRecent(n = 4) {
  const { state } = useStore();
  const toApprove = state.docs.filter((d) => d.review?.status === 'open');
  return [
    ...state.requests.map((r) => ({ key: r.id, kind: 'Request', icon: TYPE_ICON[r.type] ?? FileText, title: r.title, mark: <NeedsYou request={r} /> as ReactNode, when: r.updatedAt, href: `#/requests/${r.id}` })),
    ...toApprove.map((d) => ({
      key: d.id,
      kind: 'File',
      icon: Paperclip,
      title: d.name,
      mark: (
        <span className="needs-you" title="Needs your approval" aria-label="Needs your approval" role="img">
          <CircleAlert size={15} strokeWidth={2.2} />
        </span>
      ) as ReactNode,
      when: d.uploadedAt,
      href: `#/documents/${d.folderId}?doc=${d.id}`,
    })),
    ...state.conversations
      .filter((c) => c.messages.length > 0)
      .map((c) => ({ key: c.id, kind: 'Chat', icon: MessageSquare, title: c.title, mark: null as ReactNode, when: c.updatedAt, href: `#/assistant/${c.id}` })),
  ]
    .sort((a, b) => b.when.localeCompare(a.when))
    .slice(0, n);
}

export function HomeFigures({ className }: { className?: string }) {
  const { state } = useStore();
  const needYou = state.requests.filter(onYou);
  const active = state.requests.filter((r) => isOpen(r.status) && !onYou(r));
  const toApprove = state.docs.filter((d) => d.review?.status === 'open');
  // The statuses "In progress" counts (everything with Spark), in the order of the work, each shown once as its dot.
  const sparkStatuses = (['submitted', 'in_review', 'changes_requested', 'approved', 'in_progress'] as const).filter((st) => active.some((r) => r.status === st));
  const attn = (
    <span className="needs-you" aria-hidden>
      <CircleAlert size={15} strokeWidth={2.2} />
    </span>
  );
  // The figures in Ink; what each means is a mark before its label, in the tables' language: the amber
  // attention mark for what waits on you, the status dots for what's with Spark, a file with the mark.
  const tiles: { n: number; label: string; href: string; mark: ReactNode }[] = [
    { n: needYou.length, label: 'Awaiting your decision', href: '#/requests', mark: attn },
    {
      n: active.length,
      label: 'In progress',
      href: '#/requests',
      mark: (
        <span className="lf-dots" aria-hidden>
          {sparkStatuses.map((st) => (
            <span key={st} className={`rstatus rstatus--${st}`}>
              <span className="rstatus__dot" />
            </span>
          ))}
        </span>
      ),
    },
    {
      n: toApprove.length,
      label: 'Files to review',
      href: '#/documents',
      mark: (
        <span className="lf-file" aria-hidden>
          <FileText size={15} strokeWidth={1.8} />
          <span className="lf-file__dot" />
        </span>
      ),
    },
  ];

  return (
    <div className={cx('bt bt--mono home__figures lf', className)}>
      {tiles.map((t) => (
        <a key={t.label} className="bt__tile" href={t.href}>
          <span className="bt__n">{t.n}</span>
          <span className="bt__label">
            {t.mark}
            {t.label}
            <ArrowRight size={14} />
          </span>
        </a>
      ))}
    </div>
  );
}

export function Home({ list = analyses }: { list?: CompanyAnalysis[] }) {
  const { me } = useStore();
  const { query } = useRoute();
  const recent = useRecent(5);

  // "Company profile" in the account menu opens Home at the profile.
  const show = query.get('show');
  useEffect(() => {
    if (!show) return;
    // After the shell's scroll to the top on a new page.
    const t = setTimeout(() => document.getElementById(show)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <div className="home home--hub">
      <div className="home__top">
        <div>
          <h1 className="home__title">Good to see you, {me.name.split(' ')[0]}</h1>
          <p className="home__sub">Here’s what needs your attention today.</p>
        </div>
        <Button variant="primary" icon={SquarePen} onClick={() => navigate('/assistant')}>
          New chat
        </Button>
      </div>

      <HomeFigures />

      <div className="home__grid">
        <div className="home__main">
          {list.length > 0 && (
            <section className="home__section" id="analysis" aria-labelledby="home-analysis">
              <div className="home__section-head">
                <h2 className="home__label" id="home-analysis">
                  Company analysis
                </h2>
                <span className="home__note">By Spark</span>
              </div>
              <div className="ca-list">
                {list.map((a) => (
                  <AnalysisItem key={a.id} a={a} />
                ))}
              </div>
            </section>
          )}

          {recent.length > 0 && (
            <section className="home__section">
              <div className="home__section-head">
                <h2 className="home__label">Continue where you left off</h2>
              </div>
              <div className="home__rows">
                {recent.map((i) => (
                  <a key={i.key} className="home__row" href={i.href}>
                    <i.icon size={15} strokeWidth={1.7} className="home__icon" aria-hidden />
                    <span className="rq-row3__name">
                      <span className="rq-row3__title">{i.title}</span>
                      {i.mark}
                    </span>
                    <ArrowRight size={15} className="home-recent__go" aria-hidden />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        <CompanyProfile />
      </div>
    </div>
  );
}

/** One piece of Spark's analysis: the summary always shows; the findings open under it. */
export function AnalysisItem({ a }: { a: CompanyAnalysis }) {
  const { state, actions } = useStore();
  const [open, setOpen] = useState(false);
  const Icon = ANALYSIS_ICON[a.kind];
  const doc = a.docId ? state.docs.find((d) => d.id === a.docId) : undefined;
  const discuss = () => {
    const id = actions.ask(null, `Walk me through the ${a.title.toLowerCase()} and what we should do first.`);
    navigate(`/assistant/${id}`);
  };
  return (
    <div className={cx('ca', open && 'is-open')}>
      <button type="button" className="ca__head" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={`${a.id}-body`}>
        <span className="ca__icon" aria-hidden>
          <Icon size={17} strokeWidth={1.7} />
        </span>
        <span className="ca__text">
          <span className="ca__title">{a.title}</span>
          <span className="ca__summary">{a.summary}</span>
        </span>
        {/* Always there, so the chevrons line up when a piece has no figure. */}
        <span className="ca__score">
          {a.score && (
            <>
              <span className="ca__score-value">{a.score.value}</span>
              <span className="ca__score-label">{a.score.label}</span>
            </>
          )}
        </span>
        <ChevronDown size={17} className="ca__chev" aria-hidden />
      </button>
      {open && (
        <div className="ca__body" id={`${a.id}-body`}>
          <ol className="ca__findings">
            {a.findings.map((f) => (
              <li key={f.title}>
                <b>{f.title}</b>
                <p>{f.body}</p>
              </li>
            ))}
          </ol>
          <div className="ca__foot">
            <span className="ca__date">
              Updated {fmtDate(a.updatedAt)}
              {doc && (
                <>
                  {' · '}
                  <a href={`#/documents/${doc.folderId}?doc=${doc.id}`}>Full report</a>
                </>
              )}
            </span>
            <button type="button" className="ca__ask" onClick={discuss}>
              <MessageSquare size={14} strokeWidth={1.8} />
              Discuss in a chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** The company's basics, kept by Spark. */
export function CompanyProfile() {
  const { state } = useStore();
  const b = state.brand;
  const rows: [string, ReactNode][] = [
    ['Website', <a href={`https://${b.website}`} target="_blank" rel="noreferrer">{b.website}</a>],
    ['Category', b.category],
    ['Founded', b.founded],
    ['Head office', b.hq],
    ['Footprint', b.footprint],
  ];
  return (
    <aside className="cp" id="company" aria-labelledby="home-company">
      <div className="cp__head">
        <span className="cp__tile" aria-hidden>
          {b.name.charAt(0)}
        </span>
        <div>
          <h2 className="cp__name" id="home-company">
            {b.name}
          </h2>
          <p className="cp__tagline">{b.tagline}</p>
        </div>
      </div>
      <p className="cp__positioning">{b.positioning}</p>
      <dl className="cp__facts">
        {rows.map(([k, v]) => (
          <div key={k} className="cp__fact">
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="cp__block">
        <span className="cp__label">Audiences</span>
        <ul className="cp__audiences">
          {b.audiences.map((x) => (
            <li key={x.name}>
              <b>{x.name}</b>
              <span>{x.detail}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="cp__updated">Kept by Spark · updated {fmtDate(b.updatedAt)}</p>
    </aside>
  );
}

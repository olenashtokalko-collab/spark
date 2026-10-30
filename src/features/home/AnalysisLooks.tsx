// The analysis page, four ways (compared on #/demo/analysis). Each one gives the page a hierarchy (the
// verdict, then what to fix first by impact, then what works, then what it rests on) and a way to talk
// to Spark about it: about the whole analysis, about one issue, or by turning an issue into a request.
//   A · Priorities   one column: verdict, figures, "Fix first" as numbered rows with Spark's fix
//   B · Side panel   the same content, with a sticky panel of ready questions; each opens the chat drawer
//   C · Conversation Spark presents the analysis as a message you can answer, the box always at the foot
//   D · Report       a document with "On this page", as the proposal, and a question beside each section
//   E · Found → fix  each issue as a row of two columns: what Spark found, and what Spark would do
//   F · By impact    the issues in three columns, High, Medium, Low, as cards; what works as a fourth
//   G · One by one   one issue at a time, large, with the list of all of them beside it to jump
//   H · Ink cover    an Ink card with the verdict and figures, then the issues folded to one line each
//   I · Cards        Issues to fix (each with Spark's recommendation) and What works, as grids of small
//                    cards with Spark's mark to ask about it (the analysis page)
//   J · Agent        after the client's control-centre reference: a header card with a band and figures,
//                    each issue as a "decision" (impact, the evidence quoted, Spark's recommendation in a
//                    tinted box), and what it's based on as signals in a column beside
//   K · Featured     the same header; the most important issue large with its signals, the others as
//                    smaller tinted cards under it, what works in green
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, Check, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, Clock, FileSearch, FileText, Plus, TriangleAlert } from 'lucide-react';
import { SparkStar } from '../../components/ui/SparkStar';
import { useStore } from '../../state/store';
import { useUI } from '../../state/ui';
import { navigate } from '../../lib/router';
import { cx } from '../../components/ui/primitives';
import { fmtDate } from '../../lib/format';
import { ANALYSIS_ICON } from '../assistant/Home';
import { ChatDrawer, Mascot, type DrawerTopic } from '../assistant/ChatDrawer';
import { Composer } from '../assistant/Composer';
import type { CompanyAnalysis } from '../../data/types';
import { SparkDisc } from '../../components/ui/BrandSpark';

export type AnalysisLook = 'priorities' | 'side' | 'conversation' | 'report' | 'compare' | 'board' | 'focus' | 'ink' | 'tabs' | 'agent' | 'featured';
type Finding = CompanyAnalysis['findings'][number];

const ORIGIN = { spark: 'Prepared by Spark', requested: 'You requested' } as const;
const RANK = { High: 0, Medium: 1, Low: 2 } as const;

/** What every look needs: the issues by impact, what works, the report file, and the ways to ask Spark. */
function useAnalysis(a: CompanyAnalysis) {
  const { state, actions } = useStore();
  const { openDoc, openRequest } = useUI();
  const [ask, setAsk] = useState<string | null>(null);
  const kind = a.title.replace(' analysis', '');
  const issues = a.findings.filter((f) => !f.good).sort((x, y) => RANK[x.impact ?? 'Low'] - RANK[y.impact ?? 'Low']);
  const works = a.findings.filter((f) => f.good);
  const doc = a.docId ? state.docs.find((d) => d.id === a.docId) : undefined;
  return {
    kind,
    issues,
    works,
    doc,
    openDoc,
    askAll: () => setAsk(`Walk me through the ${a.title.toLowerCase()} and what we should do first.`),
    askFix: (f: Finding) => setAsk(`How would you fix this? ${kind}: “${f.title}”. What should we do first, and can Spark take it on?`),
    ask: (text: string) => setAsk(text),
    // A question sent from the page starts the chat at once and opens it on Chats.
    send: (text: string) => navigate(`/assistant/${actions.ask(null, `${text}\n\n(About the ${a.title.toLowerCase()}.)`)}`),
    request: (f: Finding) => openRequest({ title: f.title, type: a.kind === 'social' ? 'Social' : a.kind === 'brand' ? 'Strategy' : 'Digital', description: `${f.body}\n\nWhat we'd like from Spark: ${f.fix ?? ''}` }),
    drawer: <ChatDrawer open={ask !== null} initial={ask ?? undefined} onClose={() => setAsk(null)} topic={analysisTopic(a)} />,
  };
}

/** The chat drawer's suggestions on an analysis page: questions about this analysis, its top issue first.
 *  Each sends its question with the analysis named, so Spark knows what it's about. */
export function analysisTopic(a: CompanyAnalysis): DrawerTopic {
  const first = a.findings.filter((f) => !f.good).sort((x, y) => RANK[x.impact ?? 'Low'] - RANK[y.impact ?? 'Low'])[0];
  const about = ` (About the ${a.title.toLowerCase()}.)`;
  const qs = [
    ...(first ? [`What would fixing “${first.title}” take?`] : []),
    'What should we do first?',
    'What would this cost, roughly?',
    'How do we compare with competitors?',
  ];
  return { label: a.title.toLowerCase(), questions: qs.map((q) => ({ label: q, prompt: q + about })) };
}

/** Questions a client would ask about this analysis, as one-click starts. */
const QUESTIONS = (first?: Finding) => [
  first ? `What would fixing “${first.title}” take?` : 'What should we do first?',
  'What would this cost, roughly?',
  `How do we compare with competitors?`,
];

function Back() {
  return (
    <a className="back" href="#/">
      <ArrowLeft size={15} /> Home
    </a>
  );
}

function Meta({ a }: { a: CompanyAnalysis }) {
  return (
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
  );
}

/** The title is the verdict in a few words; the full sentence follows as a lead. */
function Verdict({ a }: { a: CompanyAnalysis }) {
  return (
    <div className="anx-verdict">
      <h1>{a.headline ?? a.title}</h1>
      <p>{a.summary}</p>
    </div>
  );
}

function Kind({ a }: { a: CompanyAnalysis }) {
  const I = ANALYSIS_ICON[a.kind];
  return (
    <span className="anp__kind">
      <I size={14} strokeWidth={1.8} /> {a.title}
    </span>
  );
}

/** The figures under the verdict: how many to fix, how many work, and the analysis's one measure. */
function Figures({ a, issues, works }: { a: CompanyAnalysis; issues: Finding[]; works: Finding[] }) {
  const cells: [ReactNode, string][] = [
    [issues.length, issues.length === 1 ? 'thing to fix' : 'things to fix'],
    [works.length, works.length === 1 ? 'thing that works' : 'things that work'],
    ...(a.score ? ([[a.score.value, a.score.label]] as [ReactNode, string][]) : []),
  ];
  return (
    <ul className="anx-figs">
      {cells.map(([n, l]) => (
        <li key={l}>
          <b>{n}</b>
          <span>{l}</span>
        </li>
      ))}
    </ul>
  );
}

function Impact({ f }: { f: Finding }) {
  return f.impact ? <span className={cx('anx-impact', `anx-impact--${f.impact.toLowerCase()}`)}>{f.impact} impact</span> : null;
}

/** One issue: number, title and impact, what Spark found, what Spark would do, and the two actions. */
function IssueRow({ f, n, askFix, request, compact }: { f: Finding; n: number; askFix: () => void; request: () => void; compact?: boolean }) {
  return (
    <li className={cx('anx-issue', compact && 'anx-issue--compact')}>
      <span className="anx-issue__n">{n}</span>
      <div className="anx-issue__body">
        <div className="anx-issue__head">
          <h3>{f.title}</h3>
          <Impact f={f} />
        </div>
        <p>{f.body}</p>
        {f.fix && (
          <p className="anx-issue__fix">
            <span className="anx-label">What we’d do</span>
            {f.fix}
          </p>
        )}
        <div className="anx-issue__acts">
          <button type="button" className="hl-issue__fix" onClick={askFix}>
            <Mascot size={18} /> Ask Spark to fix
          </button>
          <button type="button" className="link-btn anx-link" onClick={request}>
            <Plus size={14} /> Make it a request
          </button>
        </div>
      </div>
    </li>
  );
}

function WorksList({ works }: { works: Finding[] }) {
  return (
    <ul className="anx-works">
      {works.map((f) => (
        <li key={f.title}>
          <span className="anx-works__mark">
            <Check size={14} strokeWidth={2.4} />
          </span>
          <div>
            <b>{f.title}</b>
            <p>{f.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Basis({ a, doc, openDoc }: { a: CompanyAnalysis; doc?: { id: string; name: string }; openDoc: (id: string) => void }) {
  return (
    <div className="anx-basis">
      <dl>
        <div>
          <dt>Based on</dt>
          <dd>{a.basis}</dd>
        </div>
        <div>
          <dt>How</dt>
          <dd>AI gathered and sorted the data; a Spark strategist checked it before sharing. Figures are indicative.</dd>
        </div>
      </dl>
      {doc && (
        <button type="button" className="hl-latest__row anx-report" onClick={() => openDoc(doc.id)}>
          <FileText size={16} strokeWidth={1.7} />
          <span className="hl-latest__text">
            <b>{doc.name.replace(/\.[a-z0-9]+$/i, '')}</b>
            <span>The full report</span>
          </span>
          <span />
          <ArrowRight size={15} className="hl-latest__go" />
        </button>
      )}
    </div>
  );
}

function SectionTitle({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <h2 className="anx-h2">
      {children}
      {count !== undefined && <span className="hl-count">{count}</span>}
    </h2>
  );
}

export function AnalysisView({ a, look, focus }: { a: CompanyAnalysis; look: AnalysisLook; focus?: string }) {
  const x = useAnalysis(a);
  const issueRows = (compact?: boolean) => (
    <ol className="anx-issues">
      {x.issues.map((f, i) => (
        <IssueRow key={f.title} f={f} n={i + 1} compact={compact} askFix={() => x.askFix(f)} request={() => x.request(f)} />
      ))}
    </ol>
  );

  const head = (
    <header className="anx-head">
      <Kind a={a} />
      <Verdict a={a} />
      <Meta a={a} />
      <button type="button" className="hl-mchat anx-ask" onClick={x.askAll}>
        <SparkDisc size={28} /> Ask Spark about this analysis
      </button>
    </header>
  );
  const acts = (f: Finding) => (
    <div className="anx-issue__acts">
      <button type="button" className="hl-issue__fix" onClick={() => x.askFix(f)}>
        <Mascot size={18} /> Ask Spark to fix
      </button>
      <button type="button" className="link-btn anx-link" onClick={() => x.request(f)}>
        <Plus size={14} /> Make it a request
      </button>
    </div>
  );
  const tail = (
    <>
      <section>
        <SectionTitle>What already works</SectionTitle>
        <WorksList works={x.works} />
      </section>
      <section>
        <SectionTitle>How Spark did this</SectionTitle>
        <Basis a={a} doc={x.doc} openDoc={x.openDoc} />
      </section>
    </>
  );

  // ---- E · Found → fix: two columns per issue -------------------------------------------------------
  if (look === 'compare')
    return (
      <article className="anx anx--e">
        <Back />
        {head}
        <Figures a={a} issues={x.issues} works={x.works} />
        <section>
          <SectionTitle count={x.issues.length}>Fix first</SectionTitle>
          <div className="anx-cmp">
            <div className="anx-cmp__labels" aria-hidden>
              <span />
              <span className="anx-label">What we found</span>
              <span className="anx-label">What we’d do</span>
            </div>
            {x.issues.map((f, i) => (
              <div key={f.title} className="anx-cmp__row">
                <span className="anx-issue__n">{i + 1}</span>
                <div className="anx-cmp__found">
                  <div className="anx-issue__head">
                    <h3>{f.title}</h3>
                    <Impact f={f} />
                  </div>
                  <p>{f.body}</p>
                </div>
                <div className="anx-cmp__fix">
                  <p>{f.fix}</p>
                  {acts(f)}
                </div>
              </div>
            ))}
          </div>
        </section>
        {tail}
        {x.drawer}
      </article>
    );

  // ---- F · By impact: columns of cards ----------------------------------------------------------------
  if (look === 'board') {
    const cols = (['High', 'Medium', 'Low'] as const).map((lvl) => ({ lvl, items: x.issues.filter((f) => (f.impact ?? 'Low') === lvl) })).filter((c) => c.items.length);
    return (
      <article className="anx anx--f">
        <Back />
        {head}
        <div className="anx-board">
          {cols.map((c) => (
            <section key={c.lvl} className="anx-board__col">
              <h2 className="anx-board__title">
                <span className={cx('anx-dot', `anx-dot--${c.lvl.toLowerCase()}`)} /> {c.lvl} impact <span className="hl-count">{c.items.length}</span>
              </h2>
              {c.items.map((f) => (
                <div key={f.title} className="anx-card">
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                  {f.fix && (
                    <p className="anx-issue__fix">
                      <span className="anx-label">What we’d do</span>
                      {f.fix}
                    </p>
                  )}
                  {acts(f)}
                </div>
              ))}
            </section>
          ))}
          <section className="anx-board__col">
            <h2 className="anx-board__title">
              <span className="anx-dot anx-dot--works" /> Works <span className="hl-count">{x.works.length}</span>
            </h2>
            {x.works.map((f) => (
              <div key={f.title} className="anx-card anx-card--works">
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </section>
        </div>
        <section>
          <SectionTitle>How Spark did this</SectionTitle>
          <Basis a={a} doc={x.doc} openDoc={x.openDoc} />
        </section>
        {x.drawer}
      </article>
    );
  }

  // ---- G · One by one ---------------------------------------------------------------------------------
  if (look === 'focus') return <FocusLook x={x} head={head} acts={acts} tail={tail} />;

  // ---- J and K · after the control-centre reference ---------------------------------------------------
  if (look === 'agent' || look === 'featured') return <AgentLook a={a} x={x} featured={look === 'featured'} focus={focus} />;

  // ---- I · Tabs over a grid of small cards -----------------------------------------------------------
  if (look === 'tabs') return <TabsLook a={a} x={x} head={head} focus={focus} />;

  // ---- H · Ink cover, folded issues -------------------------------------------------------------------
  if (look === 'ink') return <InkLook a={a} x={x} acts={acts} tail={tail} />;

  // ---- A · Priorities ------------------------------------------------------------------------------
  if (look === 'priorities')
    return (
      <article className="anx anx--a">
        <Back />
        <header className="anx-head">
          <Kind a={a} />
          <Verdict a={a} />
          <Meta a={a} />
          <button type="button" className="hl-mchat anx-ask" onClick={x.askAll}>
            <SparkDisc size={28} /> Ask Spark about this analysis
          </button>
        </header>
        <Figures a={a} issues={x.issues} works={x.works} />
        <section>
          <SectionTitle count={x.issues.length}>Fix first</SectionTitle>
          {issueRows()}
        </section>
        <section>
          <SectionTitle>What already works</SectionTitle>
          <WorksList works={x.works} />
        </section>
        <section>
          <SectionTitle>How Spark did this</SectionTitle>
          <Basis a={a} doc={x.doc} openDoc={x.openDoc} />
        </section>
        {x.drawer}
      </article>
    );

  // ---- B · Side panel --------------------------------------------------------------------------------
  if (look === 'side')
    return (
      <article className="anx anx--b">
        <Back />
        <div className="anx-cols">
          <div className="anx-main">
            <header className="anx-head">
              <Kind a={a} />
              <Verdict a={a} />
              <Meta a={a} />
            </header>
            <Figures a={a} issues={x.issues} works={x.works} />
            <section>
              <SectionTitle count={x.issues.length}>Fix first</SectionTitle>
              {issueRows()}
            </section>
            <section>
              <SectionTitle>What already works</SectionTitle>
              <WorksList works={x.works} />
            </section>
          </div>
          {/* Beside the page: ready questions and Ask Spark. Each opens the chat drawer, as everywhere else,
              with the question written in. */}
          <aside className="anx-side">
            <div className="anx-panel">
              <div className="anx-panel__head">
                <Mascot size={28} />
                <b>Ask Spark about this</b>
              </div>
              <div className="anx-qs">
                {QUESTIONS(x.issues[0]).map((q) => (
                  <button key={q} type="button" className="anx-q" onClick={() => x.ask(`${q} (About the ${a.title.toLowerCase()}.)`)}>
                    {q}
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
              <button type="button" className="hl-mchat anx-panel__ask" onClick={x.askAll}>
                <SparkDisc size={28} /> Ask your own question
              </button>
            </div>
            <div className="anx-panel anx-panel--quiet">
              <SectionTitle>How Spark did this</SectionTitle>
              <Basis a={a} doc={x.doc} openDoc={x.openDoc} />
            </div>
          </aside>
        </div>
        {x.drawer}
      </article>
    );

  // ---- C · Conversation ------------------------------------------------------------------------------
  if (look === 'conversation')
    return (
      <article className="anx anx--c">
        <Back />
        <Kind a={a} />
        {/* Spark presents the analysis as a message: the verdict, then the issues, then what works. */}
        <div className="anx-msg">
          <img className="anx-msg__avatar" src="/brand/spark-app-icon.jpg" alt="" />
          <div className="anx-msg__body">
            <div className="anx-msg__meta">
              <b>Spark</b> {fmtDate(a.updatedAt)} · <BadgeCheck size={13} strokeWidth={1.9} /> reviewed by a strategist
            </div>
            <Verdict a={a} />
            <p className="anx-msg__lead">
              Here’s what I’d fix first, most important at the top. I can explain any of it, or turn it into a request for the team.
            </p>
            {issueRows(true)}
            <p className="anx-msg__lead">What already works, and is worth keeping:</p>
            <WorksList works={x.works} />
            <p className="anx-msg__foot">
              Based on {a.basis}.{' '}
              {x.doc && (
                <button type="button" className="link-btn" onClick={() => x.openDoc(x.doc!.id)}>
                  Open the full report
                </button>
              )}
            </p>
          </div>
        </div>
        {/* The reply: ready questions and the box, at the foot of the page. */}
        <div className="anx-reply">
          <div className="home__prompts">
            {QUESTIONS(x.issues[0]).map((q) => (
              <button key={q} type="button" className="home__prompt" onClick={() => x.send(q)}>
                {q}
              </button>
            ))}
          </div>
          <Composer placeholder="Reply to Spark about this analysis" onSubmit={(t) => x.send(t)} />
        </div>
        {x.drawer}
      </article>
    );

  // ---- D · Report ------------------------------------------------------------------------------------
  const sections = [
    ['summary', 'Summary'],
    ['fix', 'Fix first'],
    ['works', 'What works'],
    ['how', 'How Spark did this'],
  ] as const;
  return (
    <article className="anx anx--d">
      <Back />
      <div className="anx-doc">
        <nav className="anx-toc" aria-label="On this page">
          <span className="anx-label">On this page</span>
          {sections.map(([id, label]) => (
            <a key={id} href={`#anx-${id}`} onClick={(e) => (e.preventDefault(), document.getElementById(`anx-${id}`)?.scrollIntoView({ behavior: 'smooth' }))}>
              {label}
            </a>
          ))}
          <button type="button" className="hl-mchat anx-toc__ask" onClick={x.askAll}>
            <SparkDisc size={24} /> Ask Spark
          </button>
        </nav>
        <div className="anx-doc__body">
          <section id="anx-summary" className="anx-sec">
            <Kind a={a} />
            <Verdict a={a} />
            <Meta a={a} />
            <Figures a={a} issues={x.issues} works={x.works} />
          </section>
          {(
            [
              ['fix', 'Fix first', issueRows()],
              ['works', 'What works', <WorksList works={x.works} />],
              ['how', 'How Spark did this', <Basis a={a} doc={x.doc} openDoc={x.openDoc} />],
            ] as const
          ).map(([id, title, body]) => (
            <section key={id} id={`anx-${id}`} className="anx-sec">
              {/* A question about the section, beside its title, as comments on a proposal. */}
              <div className="anx-sec__head">
                <SectionTitle>{title}</SectionTitle>
                <button type="button" className="anx-sec__ask" onClick={() => x.ask(`About “${title}” in the ${a.title.toLowerCase()}: `)}>
                  <Mascot size={18} /> Ask about this
                </button>
              </div>
              {body}
            </section>
          ))}
        </div>
      </div>
      {x.drawer}
    </article>
  );
}

type Ctx = ReturnType<typeof useAnalysis>;

/** G: one issue at a time, large, with every issue listed beside it; arrows step through them. */
function FocusLook({ x, head, acts, tail }: { x: Ctx; head: ReactNode; acts: (f: Finding) => ReactNode; tail: ReactNode }) {
  const [i, setI] = useState(0);
  const f = x.issues[i];
  return (
    <article className="anx anx--g">
      <Back />
      {head}
      <section>
        <SectionTitle count={x.issues.length}>Fix first</SectionTitle>
        <div className="anx-focus">
          <ol className="anx-focus__list">
            {x.issues.map((g, n) => (
              <li key={g.title}>
                <button type="button" className={cx('anx-focus__item', n === i && 'is-on')} onClick={() => setI(n)}>
                  <span className="anx-issue__n">{n + 1}</span>
                  <span>
                    <b>{g.title}</b>
                    <span>{g.impact} impact</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          {f && (
            <div className="anx-focus__card">
              <div className="anx-focus__top">
                <span className="anx-label">
                  {i + 1} of {x.issues.length} · {f.impact} impact
                </span>
                <span className="anx-focus__nav">
                  <button type="button" aria-label="Previous" disabled={i === 0} onClick={() => setI(i - 1)}>
                    <ChevronLeft size={16} />
                  </button>
                  <button type="button" aria-label="Next" disabled={i === x.issues.length - 1} onClick={() => setI(i + 1)}>
                    <ChevronRight size={16} />
                  </button>
                </span>
              </div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
              {f.fix && (
                <p className="anx-issue__fix">
                  <span className="anx-label">What we’d do</span>
                  {f.fix}
                </p>
              )}
              {acts(f)}
            </div>
          )}
        </div>
      </section>
      {tail}
      {x.drawer}
    </article>
  );
}

/** H: the verdict and figures on an Ink card (an Ink object carries the spark), then the issues folded
 *  to one line each; opening one shows what Spark found, what it would do and the actions. */
function InkLook({ a, x, acts, tail }: { a: CompanyAnalysis; x: Ctx; acts: (f: Finding) => ReactNode; tail: ReactNode }) {
  const [open, setOpen] = useState<string | null>(x.issues[0]?.title ?? null);
  const I = ANALYSIS_ICON[a.kind];
  return (
    <article className="anx anx--h">
      <Back />
      <header className="anx-ink">
        <span className="anx-ink__kind">
          <I size={14} strokeWidth={1.8} /> {a.title}
        </span>
        <h1>{a.headline ?? a.title}</h1>
        <p>{a.summary}</p>
        <ul className="anx-ink__figs">
          <li>
            <b>{x.issues.length}</b> to fix
          </li>
          <li>
            <b>{x.works.length}</b> working
          </li>
          {a.score && (
            <li>
              <b>{a.score.value}</b> {a.score.label}
            </li>
          )}
        </ul>
        <div className="anx-ink__foot">
          <span>
            <BadgeCheck size={14} strokeWidth={1.9} /> Reviewed by a Spark strategist · {fmtDate(a.updatedAt)}
          </span>
          <button type="button" className="hl-mchat" onClick={x.askAll}>
            <SparkDisc size={28} /> Ask Spark
          </button>
        </div>
      </header>
      <section>
        <SectionTitle count={x.issues.length}>Fix first</SectionTitle>
        <ol className="anx-acc">
          {x.issues.map((f, n) => {
            const on = open === f.title;
            return (
              <li key={f.title} className={cx('anx-acc__item', on && 'is-open')}>
                <button type="button" className="anx-acc__row" aria-expanded={on} onClick={() => setOpen(on ? null : f.title)}>
                  <span className="anx-issue__n">{n + 1}</span>
                  <b>{f.title}</b>
                  <Impact f={f} />
                  <ChevronDown size={16} className="anx-acc__chev" />
                </button>
                {on && (
                  <div className="anx-acc__body">
                    <p>{f.body}</p>
                    {f.fix && (
                      <p className="anx-issue__fix">
                        <span className="anx-label">What we’d do</span>
                        {f.fix}
                      </p>
                    )}
                    {acts(f)}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>
      {tail}
      {x.drawer}
    </article>
  );
}

/** I: after the client's reference, a grid of small white cards: a grey label (what it is) and one line
 *  (what we found, or what we'd do), with Spark's mark beside it that opens the chat about it. The three
 *  groups follow one another (no tabs): issues to fix, recommendations, what works. */
function TabsLook({ a, x, head, focus }: { a: CompanyAnalysis; x: Ctx; head: ReactNode; focus?: string }) {
  // The issue opened from Home: scrolled into view and marked, so the page continues the card clicked.
  const focusRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => focusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
    return () => clearTimeout(t);
  }, [focus]);
  // An issue and Spark's recommendation in one card: what we found, then what we'd do and the actions.
  return (
    <article className="anx anx--i">
      <Back />
      {head}
      <Figures a={a} issues={x.issues} works={x.works} />
      <section>
        <SectionTitle count={x.issues.length}>Issues to fix</SectionTitle>
        <div className="anx-grid">
          {x.issues.map((f) => (
            <div key={f.title} ref={f.title === focus ? focusRef : undefined} className={cx('anx-tile anx-tile--issue', f.title === focus && 'is-focus')}>
              <span className="anx-tile__head">
                <h3>{f.title}</h3>
                <Impact f={f} />
              </span>
              <p className="anx-tile__text">{f.body}</p>
              {f.fix && (
                <p className="anx-tile__fix">
                  <span className="anx-label">What we’d do</span>
                  {f.fix}
                </p>
              )}
              <div className="anx-tile__acts">
                <button type="button" className="hl-issue__fix" onClick={() => x.askFix(f)}>
                  <Mascot size={18} /> Ask Spark to fix
                </button>
                <button type="button" className="link-btn anx-link" onClick={() => x.request(f)}>
                  <Plus size={14} /> Make it a request
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      {x.works.length > 0 && (
        <section>
          <SectionTitle count={x.works.length}>What works</SectionTitle>
          <div className="anx-grid">
            {x.works.map((f) => (
              <div key={f.title} className="anx-tile">
                <span className="anx-tile__label">{f.title}</span>
                <p className="anx-tile__text">
                  {f.body}
                  <button type="button" className="anx-tile__ai" onClick={() => x.ask(`Tell me more about “${f.title}” and how we build on it.`)} aria-label={`Ask Spark about ${f.title}`} data-tip="Ask Spark">
                    <SparkStar size={16} strokeWidth={1.8} />
                  </button>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
      <section>
        <SectionTitle>How Spark did this</SectionTitle>
        <Basis a={a} doc={x.doc} openDoc={x.openDoc} />
      </section>
      {x.drawer}
    </article>
  );
}

/** J and K's header: a card with Spark's light along its top (the kind, reviewed, the actions), the
 *  verdict, and the figures as cells with an icon, a mono label and a value. */
function AgentHero({ a, x }: { a: CompanyAnalysis; x: Ctx }) {
  const I = ANALYSIS_ICON[a.kind];
  const cells: [typeof Check, string, string][] = [
    [CircleAlert, 'Things to fix', String(x.issues.length)],
    [Check, 'What works', String(x.works.length)],
    ...(a.score ? ([[FileSearch, a.score.label, a.score.value]] as [typeof Check, string, string][]) : []),
    [Clock, 'Updated', fmtDate(a.updatedAt)],
  ];
  return (
    <header className="anr-hero">
      <div className="anr-hero__band">
        <span className="anr-hero__icon">
          <I size={20} strokeWidth={1.8} />
        </span>
        <span className="anr-hero__name">
          <b>
            {a.title}
            <span className="anr-chip">
              <BadgeCheck size={13} strokeWidth={2} /> Reviewed
            </span>
          </b>
          <span>{ORIGIN[a.origin]} · checked by a Spark strategist</span>
        </span>
        <span className="anr-hero__acts">
          {x.doc && (
            <button type="button" className="anr-btn" onClick={() => x.openDoc(x.doc!.id)}>
              <FileText size={15} strokeWidth={1.8} /> Report
            </button>
          )}
          <button type="button" className="hl-mchat" onClick={x.askAll}>
            <SparkDisc size={28} /> Ask Spark
          </button>
        </span>
      </div>
      <div className="anr-hero__body">
        <h1>{a.headline ?? a.title}</h1>
        <p>{a.summary}</p>
        <ul className="anr-stats">
          {cells.map(([Icon, label, value]) => (
            <li key={label}>
              <span className="anr-stats__icon">
                <Icon size={16} strokeWidth={1.8} />
              </span>
              <span>
                <span className="anr-mono">{label}</span>
                <b>{value}</b>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

/** One issue as a "decision": the impact and where it was found, the number and title, the evidence as a
 *  quote, and Spark's recommendation in a tinted box with the actions. */
function DecisionCard({ f, n, kind, x, big, focused, innerRef }: { f: Finding; n: number; kind: string; x: Ctx; big?: boolean; focused?: boolean; innerRef?: React.Ref<HTMLDivElement> }) {
  const lvl = (f.impact ?? 'Low').toLowerCase();
  return (
    <div ref={innerRef} className={cx('anr-dec', big && 'anr-dec--big', focused && 'is-focus')}>
      <span className={cx('anr-sev', `anr-sev--${lvl}`)}>
        <TriangleAlert size={13} strokeWidth={2.2} /> {f.impact ?? 'Low'} impact <i>•</i> <span>{kind}</span>
      </span>
      <div className="anr-dec__title">
        <span className="anr-dec__n">{n}</span>
        <h3>{f.title}</h3>
      </div>
      <blockquote className="anr-quote">{f.body}</blockquote>
      {f.fix && (
        <div className="anr-rec">
          <span className="anr-rec__tag">
            <span className="anr-rec__arrow">
              <ArrowRight size={13} strokeWidth={2.4} />
            </span>
            What we’d do
          </span>
          <p>{f.fix}</p>
          <div className="anx-issue__acts">
            <button type="button" className="hl-issue__fix" onClick={() => x.askFix(f)}>
              <Mascot size={18} /> Ask Spark to fix
            </button>
            <button type="button" className="link-btn anx-link" onClick={() => x.request(f)}>
              <Plus size={14} /> Make it a request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Signals({ a }: { a: CompanyAnalysis }) {
  const list = a.signals ?? [{ label: 'Based on', value: a.basis }];
  return (
    <div className="anr-signals">
      <span className="anr-mono">What it’s based on</span>
      {list.map((s) => (
        <div key={s.label} className="anr-signal">
          <span className="anr-stats__icon">
            <FileSearch size={15} strokeWidth={1.8} />
          </span>
          <span>
            <span className="anr-mono">{s.label}</span>
            <b>{s.value}</b>
          </span>
        </div>
      ))}
    </div>
  );
}

function AgentLook({ a, x, featured, focus }: { a: CompanyAnalysis; x: Ctx; featured: boolean; focus?: string }) {
  const focusRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => focusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
    return () => clearTimeout(t);
  }, [focus]);
  const works = x.works.length > 0 && (
    <div className="anr-works">
      {x.works.map((f) => (
        <div key={f.title} className="anr-small anr-small--works">
          <span className="anr-small__tag">
            <span className="anr-small__dot">
              <Check size={12} strokeWidth={2.6} />
            </span>
            Works
          </span>
          <b>{f.title}</b>
          <p>{f.body}</p>
        </div>
      ))}
    </div>
  );

  // K: the most important issue (or the one opened from Home) large, with its signals; the rest smaller.
  if (featured) {
    const lead = x.issues.find((f) => f.title === focus) ?? x.issues[0];
    const rest = x.issues.filter((f) => f !== lead);
    return (
      <article className="anx anr">
        <Back />
        <AgentHero a={a} x={x} />
        {lead && (
          <section className="anr-panel">
            <div className="anr-panel__head">
              <h2>Most important</h2>
              <span className="anr-panel__count">{x.issues.length} things to fix</span>
            </div>
            <div className="anr-panel__cols">
              <DecisionCard f={lead} n={x.issues.indexOf(lead) + 1} kind={x.kind} x={x} big focused={lead.title === focus} innerRef={lead.title === focus ? focusRef : undefined} />
              <Signals a={a} />
            </div>
          </section>
        )}
        {(rest.length > 0 || x.works.length > 0) && (
          <section>
            <h2 className="anx-h2">Also worth fixing</h2>
            <div className="anr-grid">
              {rest.map((f) => (
                <div key={f.title} ref={f.title === focus ? focusRef : undefined} className={cx('anr-small', `anr-small--${(f.impact ?? 'Low').toLowerCase()}`)}>
                  <span className="anr-small__tag">
                    <span className="anr-small__dot">
                      <CircleAlert size={12} strokeWidth={2.4} />
                    </span>
                    {f.impact} impact
                  </span>
                  <b>{f.title}</b>
                  <p>{f.body}</p>
                  {f.fix && (
                    <p className="anr-small__fix">
                      <span className="anr-mono">What we’d do</span> {f.fix}
                    </p>
                  )}
                  <div className="anx-issue__acts">
                    <button type="button" className="hl-issue__fix" onClick={() => x.askFix(f)}>
                      <Mascot size={18} /> Ask Spark to fix
                    </button>
                    <button type="button" className="link-btn anx-link" onClick={() => x.request(f)}>
                      <Plus size={14} /> Make it a request
                    </button>
                  </div>
                </div>
              ))}
              {x.works.map((f) => (
                <div key={f.title} className="anr-small anr-small--works">
                  <span className="anr-small__tag">
                    <span className="anr-small__dot">
                      <Check size={12} strokeWidth={2.6} />
                    </span>
                    Works
                  </span>
                  <b>{f.title}</b>
                  <p>{f.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {x.drawer}
      </article>
    );
  }

  // J: every issue as a decision card, the signals and what works in a column beside.
  return (
    <article className="anx anr anr--j">
      <Back />
      <AgentHero a={a} x={x} />
      <section className="anr-panel">
        <div className="anr-panel__head">
          <h2>Issues to fix</h2>
          <span className="anr-panel__count">most important first</span>
        </div>
        <div className="anr-panel__cols">
          <div className="anr-decs">
            {x.issues.map((f, i) => (
              <DecisionCard key={f.title} f={f} n={i + 1} kind={x.kind} x={x} focused={f.title === focus} innerRef={f.title === focus ? focusRef : undefined} />
            ))}
          </div>
          <aside className="anr-aside">
            <Signals a={a} />
            {works && (
              <>
                <span className="anr-mono">What works</span>
                {works}
              </>
            )}
          </aside>
        </div>
      </section>
      {x.drawer}
    </article>
  );
}

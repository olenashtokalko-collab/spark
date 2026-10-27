// Home options in the brand book's own language (Spark Studios Brand Guidelines 2026, V3.0): Sand ground,
// mono labels in the corners, Ultra titles with the second line in Cobalt, Ember index numbers on hairline
// rows, Noor only as grainy glow, solid Cobalt / Ember / Ink bands for statements, one glass object per
// surface. Same content as the other options: the company, Spark's analysis, what waits on you.
import { useState, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, MessageSquare, Plus } from 'lucide-react';
import { useStore } from '../../state/store';
import { navigate } from '../../lib/router';
import { isOpen, needsYou } from '../../components/domain';
import { fmtDate, plural } from '../../lib/format';
import { cx } from '../../components/ui/primitives';
import type { CompanyAnalysis } from '../../data/types';

const pad = (n: number) => String(n).padStart(2, '0');
const issueOf = (a: CompanyAnalysis) => a.findings.find((f) => f.issue) ?? a.findings[0];
const strengthOf = (a: CompanyAnalysis) => a.findings.find((f) => f.good);
const subject = (a: CompanyAnalysis) => a.title.replace(' analysis', '');

/** What waits on the client: requests (decision or feedback) and files to review, newest date first. */
function useWaiting() {
  const { state } = useStore();
  const reqs = state.requests
    .filter((r) => needsYou(r) && isOpen(r.status))
    .map((r) => ({
      key: r.id,
      title: r.title,
      ask: r.status === 'proposal' ? 'Your decision on the proposal' : r.nextStep?.label ?? 'Your feedback',
      date: r.nextStep?.date,
      href: `#/requests/${r.id}`,
    }));
  const files = state.docs
    .filter((d) => d.review?.status === 'open')
    .map((d) => ({ key: d.id, title: d.name, ask: 'File to review', date: undefined as string | undefined, href: `#/documents/${d.folderId}?doc=${d.id}` }));
  return [...reqs, ...files];
}

function useCounts() {
  const { state } = useStore();
  const you = state.requests.filter((r) => needsYou(r) && isOpen(r.status)).length;
  return {
    you,
    progress: state.requests.filter((r) => isOpen(r.status) && !needsYou(r)).length,
    files: state.docs.filter((d) => d.review?.status === 'open').length,
  };
}

function useDiscuss() {
  const { actions } = useStore();
  return (a: CompanyAnalysis) => navigate(`/assistant/${actions.ask(null, `Walk me through the ${a.title.toLowerCase()} and what we should do first.`)}`);
}

/** The book's page frame: mono labels in the four corners (every page, pp. 2–41). */
function Frame({ section, children, noor }: { section: string; children: ReactNode; noor?: 'top' | 'ring' }) {
  const { state } = useStore();
  return (
    <div className={cx('bb', noor && `bb--noor-${noor}`)}>
      <div className="bb__corner bb__corner--tl">Spark Studios</div>
      <div className="bb__corner bb__corner--tr">
        {section} · {state.brand.name}
      </div>
      <div className="bb__body">{children}</div>
      <div className="bb__foot">
        <span>Abu Dhabi · 24.45° N 54.38° E</span>
        <button type="button" className="bb-btn bb-btn--ink" onClick={() => navigate('/assistant')}>
          <Plus size={15} strokeWidth={2} /> New chat
        </button>
      </div>
    </div>
  );
}

/** A two-line headline, the second line in Cobalt (p. 19, and pp. 4–7). */
function Headline({ eyebrow, one, two, size = 'xl' }: { eyebrow?: string; one: ReactNode; two?: ReactNode; size?: 'xl' | 'l' }) {
  return (
    <div className="bb-head">
      {eyebrow && <span className="bb-eyebrow">{eyebrow}</span>}
      <h1 className={cx('bb-title', `bb-title--${size}`)}>
        {one}
        {two && (
          <>
            <br />
            <span className="bb-cobalt">{two}</span>
          </>
        )}
      </h1>
    </div>
  );
}

/** "Waiting on you" as the book's numbered list: Ember index, Bold line, Light note, hairlines (p. 16). */
function WaitRows() {
  const rows = useWaiting();
  if (!rows.length) return <p className="bb-quiet">Nothing waits on you. We’ll let you know.</p>;
  return (
    <ol className="bb-rows">
      {rows.map((r, i) => (
        <li key={r.key}>
          <a className="bb-row" href={r.href}>
            <span className="bb-index">{pad(i + 1)}</span>
            <span className="bb-row__main">{r.title}</span>
            <span className="bb-row__note">
              {r.ask}
              {r.date && ` · by ${fmtDate(r.date)}`}
            </span>
            <ArrowRight size={16} className="bb-row__go" />
          </a>
        </li>
      ))}
    </ol>
  );
}

/** One analysis opened: summary, findings as hairline rows, the report and a chat about it. */
function AnalysisBody({ a }: { a: CompanyAnalysis }) {
  const { state } = useStore();
  const discuss = useDiscuss();
  const doc = a.docId ? state.docs.find((d) => d.id === a.docId) : undefined;
  return (
    <div className="bb-open">
      <p className="bb-lead">{a.summary}</p>
      <ol className="bb-rows bb-rows--plain">
        {a.findings.map((f, i) => (
          <li key={f.title} className="bb-row bb-row--static">
            <span className="bb-index">{pad(i + 1)}</span>
            <span className="bb-row__main">{f.title}</span>
            <span className="bb-row__note">{f.body}</span>
          </li>
        ))}
      </ol>
      <div className="bb-open__foot">
        <span className="bb-label">Updated {fmtDate(a.updatedAt)}</span>
        {doc && (
          <a className="bb-label bb-label--link" href={`#/documents/${doc.folderId}?doc=${doc.id}`}>
            Full report <ArrowUpRight size={12} />
          </a>
        )}
        <button type="button" className="bb-btn bb-btn--cobalt" onClick={() => discuss(a)}>
          <MessageSquare size={14} strokeWidth={1.9} /> Discuss with Spark
        </button>
      </div>
    </div>
  );
}

function NoAnalysisYet() {
  return (
    <div className="bb-empty">
      <span className="bb-eyebrow">Coming soon</span>
      <b>Your company, in the right light.</b>
      <span>Spark’s website, social media, brand and PR analysis appear here as we finish them.</span>
    </div>
  );
}

// ---- F · Hello (a chapter opener, pp. 3–4, 7) -----------------------------------------------------

export function BrandHello({ list }: { list: CompanyAnalysis[] }) {
  const { state, me } = useStore();
  const c = useCounts();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <Frame section="Home" noor="top">
      <Headline eyebrow={fmtDate(new Date().toISOString())} one={`Hello, ${me.name.split(' ')[0]}.`} two={`Here’s ${state.brand.name} today.`} />
      {/* The three figures as the book's "Three steps" cards: a coloured rule over each (p. 10). */}
      <div className="bb-steps">
        {(
          [
            ['cobalt', c.you, 'Awaiting your decision', 'Proposals and feedback that need you.', '#/requests'],
            ['violet', c.progress, 'In progress', 'With Spark now.', '#/requests'],
            ['ember', c.files, 'Files to review', 'Approve or comment.', '#/documents'],
          ] as const
        ).map(([tone, n, label, note, href]) => (
          <a key={label} className={`bb-step bb-step--${tone}`} href={href}>
            <span className="bb-step__n">{pad(n)}</span>
            <b>{label}</b>
            <span>{note}</span>
          </a>
        ))}
      </div>

      <section className="bb-section">
        <Headline eyebrow="What Spark found" one="Every brand has a spark." two="Here’s where yours gets lost." size="l" />
        {list.length ? (
          <ol className="bb-rows">
            {list.map((a, i) => (
              <li key={a.id}>
                <button type="button" className={cx('bb-row', open === a.id && 'is-open')} onClick={() => setOpen(open === a.id ? null : a.id)} aria-expanded={open === a.id}>
                  <span className="bb-index">{pad(i + 1)}</span>
                  <span className="bb-row__main">{a.title}</span>
                  <span className="bb-row__note">{issueOf(a).title}</span>
                  <span className="bb-row__fig">{a.score?.value ?? ''}</span>
                </button>
                {open === a.id && <AnalysisBody a={a} />}
              </li>
            ))}
          </ol>
        ) : (
          <NoAnalysisYet />
        )}
      </section>

      <section className="bb-section">
        <span className="bb-eyebrow">Waiting on you</span>
        <WaitRows />
      </section>
    </Frame>
  );
}

// ---- G · Contents (the index page, p. 2) ---------------------------------------------------------

export function BrandContents({ list }: { list: CompanyAnalysis[] }) {
  const { state } = useStore();
  const b = state.brand;
  const c = useCounts();
  const [open, setOpen] = useState<string | null>(null);
  const entries = [
    { id: 'wait', title: 'Waiting on you', note: `${plural(c.you, 'request')} · ${plural(c.files, 'file')} to review`, fig: pad(c.you + c.files) },
    ...list.map((a) => ({ id: a.id, title: a.title, note: issueOf(a).title, fig: a.score?.value ?? '' })),
  ];
  return (
    <Frame section="Home">
      <div className="bb-contents">
        <div className="bb-contents__left">
          <Headline one={b.name} size="l" />
          <p className="bb-lead">{b.positioning}</p>
          <dl className="bb-facts">
            {(
              [
                ['Website', b.website],
                ['Category', b.category],
                ['Head office', b.hq],
                ['Founded', b.founded],
                ['Footprint', b.footprint],
              ] as const
            ).map(([k, v]) => (
              <div key={k}>
                <dt className="bb-label">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="bb-contents__right">
          <span className="bb-eyebrow">Contents</span>
          <ol className="bb-rows bb-rows--index">
            {entries.map((e, i) => (
              <li key={e.id}>
                <button type="button" className={cx('bb-row', open === e.id && 'is-open')} onClick={() => setOpen(open === e.id ? null : e.id)} aria-expanded={open === e.id}>
                  <span className="bb-index">{pad(i + 1)}</span>
                  <span className="bb-row__stack">
                    <span className="bb-row__main">{e.title}</span>
                    <span className="bb-row__note">{e.note}</span>
                  </span>
                  <span className="bb-row__fig">{e.fig}</span>
                </button>
                {open === e.id && (e.id === 'wait' ? <div className="bb-open"><WaitRows /></div> : <AnalysisBody a={list.find((a) => a.id === e.id)!} />)}
              </li>
            ))}
          </ol>
          {!list.length && <NoAnalysisYet />}
        </div>
      </div>
    </Frame>
  );
}

// ---- H · Bands (Cobalt, Ember or Ink bands for statements, p. 39; the colour page, p. 30) ---------

export function BrandBands({ list }: { list: CompanyAnalysis[] }) {
  const { me } = useStore();
  const c = useCounts();
  const [open, setOpen] = useState<string | null>(list[0]?.id ?? null);
  const cur = list.find((a) => a.id === open);
  return (
    <Frame section="Home">
      <Headline one={`Good to see you, ${me.name.split(' ')[0]}.`} two="Three things today." />
      <div className="bb-bands">
        <a className="bb-band bb-band--ink" href="#/requests">
          <span className="bb-band__n">{c.you}</span>
          <span className="bb-band__label">Awaiting your decision</span>
        </a>
        <a className="bb-band bb-band--cobalt" href="#/requests">
          <span className="bb-band__n">{c.progress}</span>
          <span className="bb-band__label">In progress with Spark</span>
        </a>
        <a className="bb-band bb-band--ember" href="#/documents">
          <span className="bb-band__n">{c.files}</span>
          <span className="bb-band__label">Files to review</span>
        </a>
      </div>

      <section className="bb-section">
        <span className="bb-eyebrow">What Spark found</span>
        {list.length ? (
          <>
            <div className="bb-tiles">
              {list.map((a, i) => (
                <button key={a.id} type="button" className={cx('bb-tile', open === a.id && 'is-on')} onClick={() => setOpen(open === a.id ? null : a.id)} aria-expanded={open === a.id}>
                  <span className="bb-index">{pad(i + 1)}</span>
                  {/* The figure when the analysis has one; otherwise its lead issue in its place. */}
                  {a.score ? (
                    <>
                      <span className="bb-tile__fig">{a.score.value}</span>
                      <span className="bb-tile__sub">{a.score.label}</span>
                    </>
                  ) : (
                    <span className="bb-tile__lead">{issueOf(a).title}.</span>
                  )}
                  <b>{a.title}</b>
                  {a.score && <span className="bb-tile__note">{issueOf(a).title}</span>}
                </button>
              ))}
            </div>
            {cur && <AnalysisBody a={cur} />}
          </>
        ) : (
          <NoAnalysisYet />
        )}
      </section>

      <section className="bb-section">
        <span className="bb-eyebrow">Waiting on you</span>
        <WaitRows />
      </section>
    </Frame>
  );
}

// ---- I · Table ("Sounds like Spark" and "One idea. The right light for each.", pp. 17, 23) -------

export function BrandTable({ list }: { list: CompanyAnalysis[] }) {
  const { state } = useStore();
  const discuss = useDiscuss();
  return (
    <Frame section="Home">
      <Headline eyebrow="Company analysis" one={`${state.brand.name}, today.`} two="Seen in the right light." />
      {list.length ? (
        <div className="bb-table" role="table">
          <div className="bb-table__head" role="row">
            <span role="columnheader">Subject</span>
            <span role="columnheader">Key figure</span>
            <span role="columnheader" className="bb-cobalt">What works</span>
            <span role="columnheader" className="bb-ember">Where it gets lost</span>
            <span role="columnheader" />
          </div>
          {list.map((a) => (
            <div key={a.id} className="bb-table__row" role="row">
              <span role="cell" className="bb-table__subject">
                {subject(a)}
              </span>
              <span role="cell" className="bb-table__fig">
                {a.score ? (
                  <>
                    <b>{a.score.value}</b>
                    <small>{a.score.label}</small>
                  </>
                ) : (
                  <small>—</small>
                )}
              </span>
              <span role="cell">
                <b>{strengthOf(a)?.title ?? '—'}</b>
                {strengthOf(a) && <small>{strengthOf(a)!.body}</small>}
              </span>
              <span role="cell">
                <b>{issueOf(a).title}</b>
                <small>{issueOf(a).body}</small>
              </span>
              <span role="cell">
                <button type="button" className="bb-icon-btn" onClick={() => discuss(a)} aria-label={`Discuss the ${a.title.toLowerCase()} with Spark`}>
                  <MessageSquare size={15} strokeWidth={1.8} />
                </button>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <NoAnalysisYet />
      )}
      <section className="bb-section">
        <Headline eyebrow="Waiting on you" one="Your call." two="Spark is ready when you are." size="l" />
        <WaitRows />
      </section>
    </Frame>
  );
}

// ---- J · One glass object ("One idea per surface", pp. 33, 35, 37) -------------------------------

export function BrandGlass({ list }: { list: CompanyAnalysis[] }) {
  const { state, me } = useStore();
  const rows = useWaiting();
  const next = rows[0];
  const rest = rows.slice(1);
  const [open, setOpen] = useState<string | null>(null);
  return (
    <Frame section="Home" noor="ring">
      <div className="bb-hero">
        <span className="bb-eyebrow">One thing first</span>
        {/* The page's single glass object, with the Noor glow under it. */}
        {next ? (
          <a className="bb-glass" href={next.href}>
            <span className="bb-label">{next.ask}</span>
            <b className="bb-glass__title">{next.title}</b>
            <span className="bb-glass__foot">
              {next.date ? `By ${fmtDate(next.date)}` : 'Waiting on you'}
              <span className="bb-glass__go">
                Open <ArrowRight size={15} />
              </span>
            </span>
          </a>
        ) : (
          <div className="bb-glass">
            <b className="bb-glass__title">All clear, {me.name.split(' ')[0]}.</b>
            <span className="bb-label">Nothing waits on you</span>
          </div>
        )}
      </div>

      <div className="bb-two">
        <section>
          <span className="bb-eyebrow">Also waiting</span>
          {rest.length ? (
            <ol className="bb-rows">
              {rest.map((r, i) => (
                <li key={r.key}>
                  <a className="bb-row" href={r.href}>
                    <span className="bb-index">{pad(i + 2)}</span>
                    <span className="bb-row__stack">
                      <span className="bb-row__main">{r.title}</span>
                      <span className="bb-row__note">{r.ask}</span>
                    </span>
                    <ArrowRight size={16} className="bb-row__go" />
                  </a>
                </li>
              ))}
            </ol>
          ) : (
            <p className="bb-quiet">Nothing else.</p>
          )}
        </section>
        <section>
          <span className="bb-eyebrow">{state.brand.name} · What Spark found</span>
          {list.length ? (
            <ol className="bb-rows">
              {list.map((a, i) => (
                <li key={a.id}>
                  <button type="button" className={cx('bb-row', open === a.id && 'is-open')} onClick={() => setOpen(open === a.id ? null : a.id)} aria-expanded={open === a.id}>
                    <span className="bb-index">{pad(i + 1)}</span>
                    <span className="bb-row__stack">
                      <span className="bb-row__main">{subject(a)}</span>
                      <span className="bb-row__note">{issueOf(a).title}</span>
                    </span>
                    <span className="bb-row__fig">{a.score?.value ?? ''}</span>
                  </button>
                  {open === a.id && <AnalysisBody a={a} />}
                </li>
              ))}
            </ol>
          ) : (
            <NoAnalysisYet />
          )}
        </section>
      </div>
    </Frame>
  );
}

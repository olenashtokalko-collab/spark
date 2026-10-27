// Prototype-only page (#/demo/home-hub): ways to lay out Home after the call of 23 Oct. Hassan: Home is the
// start page, not "New chat"; it shows the company profile and the analysis Spark did on the company
// (website, social media, brand, PR; only what exists, as plain text, with the report when there is one),
// so the client "already has something to see" without asking anything; then the requests and what waits on
// them. A chat starts from a button. Real data from the store; links open the real pages.
import { useState, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, CircleAlert, FileText, MessageSquare, SquarePen } from 'lucide-react';
import { useStore } from '../../state/store';
import { navigate, useRoute } from '../../lib/router';
import { analyses as allAnalyses } from '../../data/mock';
import { Button, PageHeader, cx } from '../../components/ui/primitives';
import { NeedsYou, RequestStatus, isOpen, needsYou } from '../../components/domain';
import { fmtDate } from '../../lib/format';
import { TYPE_ICON } from '../requests/CreateRequestDialog';
import { ANALYSIS_ICON, AnalysisItem, Home, HomeFigures } from '../assistant/Home';
import { BrandBands, BrandContents, BrandGlass, BrandHello, BrandTable } from './BrandHomes';
import type { CompanyAnalysis } from '../../data/types';

type Variant = 'columns' | 'company' | 'briefing' | 'tabs' | 'bento' | 'hello' | 'contents' | 'bands' | 'table' | 'glass';
const VARIANTS: { v: Variant; label: string; note: string; brand?: boolean }[] = [
  {
    v: 'columns',
    label: 'A · Two columns',
    note: 'Home as it is now: the figures under the greeting, then Spark’s analysis as cards that open, with what you touched last under it; the company’s profile in a card on the right that stays in view.',
  },
  {
    v: 'company',
    label: 'B · Company first',
    note: 'The company leads: a band with its name, line and facts across the top. Under it, “What Spark found”: one card per analysis with its key figure; opening one shows the findings under the row. Then what waits on you.',
  },
  {
    v: 'briefing',
    label: 'C · Spark’s briefing',
    note: 'Reads as a note from Spark: “where we think you have issues”, the top finding of each analysis in one list, each with where it comes from. The analyses in full follow. On the right: what waits on you, then a short company card.',
  },
  {
    v: 'tabs',
    label: 'D · Company tabs',
    note: 'One large card for the company with tabs: Profile, then one tab per analysis Spark did. Everything is read in full, one subject at a time. The requests waiting on you sit under it.',
  },
  {
    v: 'bento',
    label: 'E · Overview grid',
    note: 'A dashboard of tiles: the company, the three figures, one tile per analysis with its key figure, and what waits on you. Everything at a glance on one screen; a tile opens its detail.',
  },
  // In the brand book's own language (Spark Studios Brand Guidelines 2026, V3.0).
  {
    v: 'hello',
    label: 'F · Hello',
    brand: true,
    note: 'A chapter opener, as “Hello. We’re Spark.” (p. 4): a Noor glow at the top, a two-line Ultra headline with the second line in Cobalt. The figures as the “Three steps” cards with a coloured rule (p. 10); the analysis and what waits on you as numbered hairline rows with Ember indexes (p. 16).',
  },
  {
    v: 'contents',
    label: 'G · Contents',
    brand: true,
    note: 'The index page (p. 2): the company on the left, its name as the title, the positioning and the facts with mono labels; on the right a contents list of everything on Home, each entry with its figure. An entry opens under itself.',
  },
  {
    v: 'bands',
    label: 'H · Bands',
    brand: true,
    note: '“Light grounds for ideas, Cobalt, Ember or Ink bands for statements” (p. 39), laid out like the colour page (p. 30): the three figures as solid Ink, Cobalt and Ember bands. The analysis as white tiles with a large figure; the first one is open.',
  },
  {
    v: 'table',
    label: 'I · Table',
    brand: true,
    note: 'The analysis as the book’s tables (“Sounds like Spark”, p. 17; “One idea. The right light for each.”, p. 23): one row per subject, what works in Cobalt, where it gets lost in Ember. What waits on you follows as numbered rows.',
  },
  {
    v: 'glass',
    label: 'J · One glass object',
    brand: true,
    note: '“One idea per surface” (p. 37), “one cluster per frame” (p. 33): the one thing that waits on you sits on a single frosted glass card over the Noor glow. Everything else stays flat: what else waits, and Spark’s analysis, side by side.',
  },
];

// ---- Shared bits ---------------------------------------------------------------------------------

function Greeting({ children }: { children?: ReactNode }) {
  const { me } = useStore();
  return (
    <div className="home__top">
      <div>
        <h1 className="home__title">Good to see you, {me.name.split(' ')[0]}</h1>
        <p className="home__sub">{children ?? 'Here’s what needs your attention today.'}</p>
      </div>
      <Button variant="primary" icon={SquarePen} onClick={() => navigate('/assistant')}>
        New chat
      </Button>
    </div>
  );
}

function SectionHead({ title, note, action }: { title: string; note?: string; action?: ReactNode }) {
  return (
    <div className="home__section-head">
      <h2 className="home__label">{title}</h2>
      {note && <span className="home__note">{note}</span>}
      {action && <span className="hh-head-action">{action}</span>}
    </div>
  );
}

/** Requests that wait on the client and files to review, as rows: what it is, what's asked, by when. */
function WaitingOnYou({ compact }: { compact?: boolean }) {
  const { state } = useStore();
  const reqs = state.requests.filter((r) => needsYou(r) && isOpen(r.status));
  const files = state.docs.filter((d) => d.review?.status === 'open');
  if (!reqs.length && !files.length) return <p className="hh-empty">Nothing waits on you. Spark will let you know.</p>;
  return (
    <div className={cx('hh-wait', compact && 'hh-wait--compact')}>
      {reqs.map((r) => {
        const I = TYPE_ICON[r.type] ?? FileText;
        return (
          <a key={r.id} className="hh-wait__row" href={`#/requests/${r.id}`}>
            <I size={16} strokeWidth={1.7} className="hh-wait__icon" />
            <span className="hh-wait__text">
              <span className="hh-wait__title">
                {r.title} <NeedsYou request={r} />
              </span>
              <span className="hh-wait__sub">
                {r.status === 'proposal' ? 'Your decision on the proposal' : r.nextStep?.label}
                {r.nextStep?.date && ` · by ${fmtDate(r.nextStep.date)}`}
              </span>
            </span>
            {!compact && <RequestStatus status={r.status} />}
            <ArrowRight size={15} className="hh-wait__go" />
          </a>
        );
      })}
      {files.map((d) => (
        <a key={d.id} className="hh-wait__row" href={`#/documents/${d.folderId}?doc=${d.id}`}>
          <FileText size={16} strokeWidth={1.7} className="hh-wait__icon" />
          <span className="hh-wait__text">
            <span className="hh-wait__title">
              {d.name}
              <span className="needs-you" aria-label="Needs your approval" role="img">
                <CircleAlert size={15} strokeWidth={2.2} />
              </span>
            </span>
            <span className="hh-wait__sub">File to review</span>
          </span>
          {!compact && <span />}
          <ArrowRight size={15} className="hh-wait__go" />
        </a>
      ))}
    </div>
  );
}

/** When Spark hasn't done any analysis yet: say what will appear, so the place isn't a mystery. */
function NoAnalysis() {
  return (
    <div className="hh-none">
      <b>Spark’s analysis of your company will appear here</b>
      <span>Website, social media, brand and PR, as Spark completes them.</span>
    </div>
  );
}

function useDiscuss() {
  const { actions } = useStore();
  return (a: CompanyAnalysis) => navigate(`/assistant/${actions.ask(null, `Walk me through the ${a.title.toLowerCase()} and what we should do first.`)}`);
}

function ReportLink({ a }: { a: CompanyAnalysis }) {
  const { state } = useStore();
  const doc = a.docId ? state.docs.find((d) => d.id === a.docId) : undefined;
  if (!doc) return null;
  return (
    <a className="hh-report" href={`#/documents/${doc.folderId}?doc=${doc.id}`}>
      <FileText size={14} strokeWidth={1.8} />
      {doc.name}
    </a>
  );
}

/** The findings in full. `summary` off where the card above already shows it. */
function Findings({ a, summary = true }: { a: CompanyAnalysis; summary?: boolean }) {
  const discuss = useDiscuss();
  return (
    <div className="hh-findings">
      {summary && <p className="hh-findings__summary">{a.summary}</p>}
      <ol className="ca__findings">
        {a.findings.map((f) => (
          <li key={f.title}>
            <b>{f.title}</b>
            <p>{f.body}</p>
          </li>
        ))}
      </ol>
      <div className="ca__foot">
        <span className="hh-foot-left">
          <span className="ca__date">Updated {fmtDate(a.updatedAt)}</span>
          <ReportLink a={a} />
        </span>
        <button type="button" className="ca__ask" onClick={() => discuss(a)}>
          <MessageSquare size={14} strokeWidth={1.8} />
          Discuss in a chat
        </button>
      </div>
    </div>
  );
}

// ---- B · Company first ---------------------------------------------------------------------------

function CompanyFirst({ list }: { list: CompanyAnalysis[] }) {
  const { state } = useStore();
  const b = state.brand;
  const [open, setOpen] = useState<string | null>(null);
  const cur = list.find((a) => a.id === open);
  return (
    <div className="home home--hub">
      <Greeting />
      <section className="hh-band" id="company">
        <span className="cp__tile hh-band__tile" aria-hidden>
          {b.name.charAt(0)}
        </span>
        <div className="hh-band__main">
          <div className="hh-band__name">
            <h2>{b.name}</h2>
            <span>{b.tagline}</span>
          </div>
          <p className="hh-band__pos">{b.positioning}</p>
          <div className="hh-band__facts">
            <a href={`https://${b.website}`} target="_blank" rel="noreferrer">
              {b.website} <ArrowUpRight size={13} />
            </a>
            <span>{b.category}</span>
            <span>{b.hq}</span>
            <span>Since {b.founded}</span>
          </div>
        </div>
      </section>

      <section className="home__section hh-gap">
        <SectionHead title="What Spark found" note="By Spark" />
        {list.length ? (
          <>
            <div className="hh-cards">
              {list.map((a) => {
                const I = ANALYSIS_ICON[a.kind];
                return (
                  <button key={a.id} type="button" className={cx('hh-card', open === a.id && 'is-on')} onClick={() => setOpen(open === a.id ? null : a.id)} aria-expanded={open === a.id}>
                    <span className="hh-card__top">
                      <span className="ca__icon">
                        <I size={17} strokeWidth={1.7} />
                      </span>
                      {a.score && (
                        <span className="hh-card__score">
                          <b>{a.score.value}</b>
                          <span>{a.score.label}</span>
                        </span>
                      )}
                    </span>
                    <span className="hh-card__title">{a.title}</span>
                    <span className="hh-card__sum">{a.summary}</span>
                    <span className="hh-card__more">{open === a.id ? 'Close' : 'Read the findings'}</span>
                  </button>
                );
              })}
            </div>
            {cur && (
              <div className="hh-open">
                <h3 className="hh-open__title">{cur.title}</h3>
                <Findings a={cur} summary={false} />
              </div>
            )}
          </>
        ) : (
          <NoAnalysis />
        )}
      </section>

      <section className="home__section hh-gap">
        <SectionHead title="Waiting on you" />
        <WaitingOnYou />
      </section>
    </div>
  );
}

// ---- C · Spark's briefing ------------------------------------------------------------------------

function Briefing({ list }: { list: CompanyAnalysis[] }) {
  const { state } = useStore();
  const discuss = useDiscuss();
  const b = state.brand;
  return (
    <div className="home home--hub">
      <Greeting>Here’s what Spark sees for {b.name}, and what waits on you.</Greeting>
      <HomeFigures />
      <div className="home__grid">
        <div className="home__main">
          <section className="home__section">
            <SectionHead title="Where we think you have issues" note="By Spark" />
            {list.length ? (
              <ol className="hh-issues">
                {list.map((a, i) => {
                  const f = a.findings.find((x) => x.issue) ?? a.findings[0];
                  return (
                    <li key={a.id} className="hh-issue">
                      <span className="hh-issue__n">{String(i + 1).padStart(2, '0')}</span>
                      <div className="hh-issue__text">
                        <span className="hh-issue__src">{a.title.replace(' analysis', '')}</span>
                        <b>{f.title}</b>
                        <p>{f.body}</p>
                      </div>
                      <button type="button" className="ca__ask hh-issue__ask" onClick={() => discuss(a)}>
                        <MessageSquare size={14} strokeWidth={1.8} />
                        Discuss
                      </button>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <NoAnalysis />
            )}
          </section>
          {list.length > 0 && (
            <section className="home__section">
              <SectionHead title="The analysis in full" />
              <div className="ca-list">
                {list.map((a) => (
                  <AnalysisItem key={a.id} a={a} />
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="hh-side">
          <div className="hh-panel">
            <SectionHead title="Waiting on you" />
            <WaitingOnYou compact />
          </div>
          <div className="hh-panel">
            <div className="cp__head">
              <span className="cp__tile" aria-hidden>
                {b.name.charAt(0)}
              </span>
              <div>
                <h2 className="cp__name">{b.name}</h2>
                <p className="cp__tagline">{b.tagline}</p>
              </div>
            </div>
            <p className="cp__positioning hh-mt">{b.positioning}</p>
            <a className="hh-link hh-mt" href={`https://${b.website}`} target="_blank" rel="noreferrer">
              {b.website} <ArrowUpRight size={13} />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ---- D · Company tabs ----------------------------------------------------------------------------

function Tabs({ list }: { list: CompanyAnalysis[] }) {
  const { state } = useStore();
  const b = state.brand;
  const [tab, setTab] = useState<string>('profile');
  const cur = list.find((a) => a.id === tab);
  return (
    <div className="home home--hub">
      <Greeting />
      <HomeFigures />
      <section className="hh-tabcard" id="company">
        <div className="hh-tabcard__head">
          <span className="cp__tile" aria-hidden>
            {b.name.charAt(0)}
          </span>
          <div>
            <h2 className="cp__name">{b.name}</h2>
            <p className="cp__tagline">{b.tagline}</p>
          </div>
        </div>
        <div className="hh-tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'profile'} className={cx(tab === 'profile' && 'is-on')} onClick={() => setTab('profile')}>
            Profile
          </button>
          {list.map((a) => (
            <button key={a.id} role="tab" aria-selected={tab === a.id} className={cx(tab === a.id && 'is-on')} onClick={() => setTab(a.id)}>
              {a.title}
            </button>
          ))}
        </div>
        <div className="hh-tabcard__body" role="tabpanel">
          {cur ? (
            <div className="hh-tabcard__analysis">
              {cur.score && (
                <div className="hh-bigscore">
                  <b>{cur.score.value}</b>
                  <span>{cur.score.label}</span>
                </div>
              )}
              <Findings a={cur} />
            </div>
          ) : (
            <div className="hh-profile">
              <p className="cp__positioning">{b.positioning}</p>
              <dl className="cp__facts hh-profile__facts">
                {(
                  [
                    ['Website', b.website],
                    ['Category', b.category],
                    ['Founded', b.founded],
                    ['Head office', b.hq],
                    ['Footprint', b.footprint],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="cp__fact">
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <span className="cp__label">Audiences</span>
                <ul className="cp__audiences hh-profile__aud">
                  {b.audiences.map((x) => (
                    <li key={x.name}>
                      <b>{x.name}</b>
                      <span>{x.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {!list.length && <NoAnalysis />}
            </div>
          )}
        </div>
      </section>
      <section className="home__section hh-gap">
        <SectionHead title="Waiting on you" />
        <WaitingOnYou />
      </section>
    </div>
  );
}

// ---- E · Overview grid ---------------------------------------------------------------------------

function Bento({ list }: { list: CompanyAnalysis[] }) {
  const { state } = useStore();
  const b = state.brand;
  const [open, setOpen] = useState<string | null>(null);
  const cur = list.find((a) => a.id === open);
  return (
    <div className="home home--hub">
      <Greeting />
      <div className="hh-bento">
        <section className="hh-tile hh-tile--company">
          <span className="cp__label">Your company</span>
          <div className="cp__head">
            <span className="cp__tile" aria-hidden>
              {b.name.charAt(0)}
            </span>
            <div>
              <h2 className="cp__name">{b.name}</h2>
              <p className="cp__tagline">{b.tagline}</p>
            </div>
          </div>
          <p className="cp__positioning">{b.positioning}</p>
          <div className="hh-band__facts">
            <span>{b.website}</span>
            <span>{b.hq}</span>
            <span>{b.footprint}</span>
          </div>
        </section>
        <HomeFigures className="hh-tile hh-tile--figures" />
        {list.map((a) => {
          const I = ANALYSIS_ICON[a.kind];
          return (
            <button key={a.id} type="button" className={cx('hh-tile hh-tile--an', open === a.id && 'is-on')} onClick={() => setOpen(open === a.id ? null : a.id)} aria-expanded={open === a.id}>
              <span className="hh-card__top">
                <span className="ca__icon">
                  <I size={17} strokeWidth={1.7} />
                </span>
                <span className="cp__label">{a.title}</span>
              </span>
              {a.score ? (
                <span className="hh-bigscore">
                  <b>{a.score.value}</b>
                  <span>{a.score.label}</span>
                </span>
              ) : (
                <span className="hh-tile__lead">{(a.findings.find((x) => x.issue) ?? a.findings[0]).title}</span>
              )}
              <span className="hh-card__sum">{a.summary}</span>
            </button>
          );
        })}
        {!list.length && <NoAnalysis />}
        {cur && (
          <div className="hh-tile hh-tile--wide">
            <h3 className="hh-open__title">{cur.title}</h3>
            <Findings a={cur} summary={false} />
          </div>
        )}
        <section className="hh-tile hh-tile--wide">
          <SectionHead title="Waiting on you" />
          <WaitingOnYou />
        </section>
      </div>
    </div>
  );
}

export function HomeHubDemo() {
  const { query } = useRoute();
  // The option lives in the address (?v=), so each one can be sent as a link.
  const v: Variant = VARIANTS.some((x) => x.v === query.get('v')) ? (query.get('v') as Variant) : 'columns';
  const setV = (next: Variant) => navigate(`/demo/home-hub?v=${next}`, { replace: true });
  const [withAnalysis, setWithAnalysis] = useState(true);
  const cur = VARIANTS.find((x) => x.v === v)!;
  const list = withAnalysis ? allAnalyses : [];
  return (
    <div className="cdemo">
      <PageHeader
        title="Home · options"
        sub="After the call of 23 Oct: Home is the start page. It shows the company profile and Spark’s analysis of the company (only what exists), then the requests and what waits on you. A chat starts from “New chat”. F–J show the same content in the brand book’s style."
      />
      {/* Two rows: the layouts in today's style, then the same content in the brand book's style. */}
      {[false, true].map((brand) => (
        <div key={String(brand)} className="fdm-switch hd-looks">
          <span className="faint">{brand ? 'Brand book style' : 'Layouts'}</span>
          {VARIANTS.filter((x) => !!x.brand === brand).map((x) => (
            <button key={x.v} className={cx(v === x.v && 'is-on')} onClick={() => setV(x.v)}>
              {x.label}
            </button>
          ))}
        </div>
      ))}
      <p className="fdm-about">{cur.note}</p>
      {/* Hassan: "If we have a report, it will show. If not, then it will not show." */}
      <div className="fdm-switch hd-looks">
        <span className="faint">Spark’s analysis</span>
        <button className={cx(withAnalysis && 'is-on')} onClick={() => setWithAnalysis(true)}>
          Done (3)
        </button>
        <button className={cx(!withAnalysis && 'is-on')} onClick={() => setWithAnalysis(false)}>
          Not yet
        </button>
      </div>
      <div className="hd-frame hh-frame">
        {v === 'columns' && <Home list={list} />}
        {v === 'company' && <CompanyFirst list={list} />}
        {v === 'briefing' && <Briefing list={list} />}
        {v === 'tabs' && <Tabs list={list} />}
        {v === 'bento' && <Bento list={list} />}
        {v === 'hello' && <BrandHello list={list} />}
        {v === 'contents' && <BrandContents list={list} />}
        {v === 'bands' && <BrandBands list={list} />}
        {v === 'table' && <BrandTable list={list} />}
        {v === 'glass' && <BrandGlass list={list} />}
      </div>
    </div>
  );
}

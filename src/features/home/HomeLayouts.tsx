// Home layouts, built on one content model so they can be compared on #/demo/home-layouts; D (Profile) is
// the Home page itself. After the call of 23 Oct: Home (not New chat) leads with what waits on the client, the work in progress,
// the company profile and the analysis Spark prepared; only what exists is shown; a chat is a secondary
// action. Analyses are demonstration content; no scores, percentages or charts are shown.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, Building2, Check, CircleDot, CheckCircle2, ChevronDown, CircleAlert, FileText, MessageSquare, Pencil, Plus, ScanSearch, Sparkles, SquarePen, X } from 'lucide-react';
import { useUI } from '../../state/ui';
import { ChatDrawer, Mascot } from '../assistant/ChatDrawer';
import { TopUpDialog } from '../../components/layout/Credits';
import { useStore } from '../../state/store';
import { navigate, useRoute } from '../../lib/router';
import { analyses as seedAnalyses } from '../../data/mock';
import { Avatar, Button, cx } from '../../components/ui/primitives';
import { Dialog } from '../../components/ui/overlay';
import { FileIcon, RequestStatus, isOpen, needsYou } from '../../components/domain';
import { fmtDate } from '../../lib/format';
import { ANALYSIS_ICON } from '../assistant/Home';
import { TYPE_ICON } from '../requests/CreateRequestDialog';
import type { CompanyAnalysis, Doc, WorkRequest } from '../../data/types';

// ---- One content model for every layout ----------------------------------------------------------

interface Waiting {
  key: string;
  title: string;
  type: 'Proposal' | 'Feedback' | 'File approval';
  status: WorkRequest['status'];
  /** What the item waits for, in the status colour of the request it belongs to. */
  statusLabel: string;
  date?: { label: string; iso: string };
  action: string;
  href: string;
  note?: string;
}
interface Ongoing {
  key: string;
  title: string;
  status: WorkRequest['status'];
  update: string;
  updatedAt: string;
  next?: string;
  href: string;
}
interface Done {
  key: string;
  title: string;
  at: string;
  href: string;
}

/** What waits on the client, what's with Spark, what's delivered; the company and its analyses. Only items
 *  that really ask the client for something count as waiting: a proposal, feedback Spark asked for, a file
 *  sent for approval. A file under a request already listed is that request's ask, not a second item. */
export function useModel(list: CompanyAnalysis[]) {
  const { state } = useStore();
  const reviewFor = (r: WorkRequest): Doc | undefined => state.docs.find((d) => d.requestId === r.id && d.review?.status === 'open');
  const lastUpdate = (r: WorkRequest) => {
    const a = [...r.activity].sort((x, y) => y.at.localeCompare(x.at))[0];
    const who = state.people.find((p) => p.id === a?.by);
    if (!a) return r.description;
    const name = who?.org === 'spark' ? 'Spark' : (who?.name.split(' ')[0] ?? 'Someone');
    return a.kind === 'comment' ? `${name}: “${a.text}”` : `${name} ${a.text}`;
  };

  const waitingReqs = state.requests.filter((r) => isOpen(r.status) && needsYou(r));
  const waiting: Waiting[] = waitingReqs.map((r) => {
    const doc = reviewFor(r);
    if (r.status === 'proposal')
      return {
        key: r.id,
        title: r.title,
        type: 'Proposal',
        status: r.status,
        statusLabel: 'Awaiting your decision',
        date: r.nextStep && { label: 'Decide by', iso: r.nextStep.date },
        action: 'Review proposal',
        href: `#/requests/${r.id}/proposal`,
      };
    return {
      key: r.id,
      title: r.title,
      type: 'Feedback',
      status: r.status,
      statusLabel: `${r.status === 'in_progress' ? 'In progress' : 'Open'} · awaiting your feedback`,
      date: r.nextStep && { label: 'Feedback by', iso: r.nextStep.date },
      action: doc ? 'Review the file' : 'Give feedback',
      href: doc ? `#/documents/${doc.folderId}?doc=${doc.id}` : `#/requests/${r.id}`,
      note: doc?.name,
    };
  });
  for (const d of state.docs.filter((x) => x.review?.status === 'open' && !waitingReqs.some((r) => r.id === x.requestId)))
    waiting.push({
      key: d.id,
      title: d.name,
      type: 'File approval',
      status: 'in_progress',
      statusLabel: 'Awaiting your approval',
      date: { label: 'Approve by', iso: d.review!.due },
      action: 'Review file',
      href: `#/documents/${d.folderId}?doc=${d.id}`,
    });
  waiting.sort((a, b) => (a.date?.iso ?? '9').localeCompare(b.date?.iso ?? '9'));

  const ongoing: Ongoing[] = state.requests
    .filter((r) => isOpen(r.status) && !needsYou(r))
    .map((r) => ({
      key: r.id,
      title: r.title,
      status: r.status,
      update: lastUpdate(r),
      updatedAt: r.updatedAt,
      next: r.nextStep && `${r.nextStep.label} · ${fmtDate(r.nextStep.date)}`,
      href: `#/requests/${r.id}`,
    }));

  const done: Done[] = state.requests.filter((r) => r.status === 'delivered').map((r) => ({ key: r.id, title: r.title, at: r.updatedAt, href: `#/requests/${r.id}` }));

  return { brand: state.brand, waiting, ongoing, done, analyses: list };
}
export type Model = ReturnType<typeof useModel>;

// ---- Shared pieces -------------------------------------------------------------------------------

const ORIGIN = { spark: 'Prepared by Spark', requested: 'You requested' } as const;

function Label({ children, tone }: { children: ReactNode; tone?: 'ember' | 'cobalt' }) {
  return <span className={cx('hl-label', tone && `hl-label--${tone}`)}>{children}</span>;
}

function NewChat({ variant = 'secondary' }: { variant?: 'secondary' | 'quiet' }) {
  return (
    <Button variant={variant} icon={SquarePen} onClick={() => navigate('/assistant')}>
      New chat
    </Button>
  );
}

/** The full analysis: opens the report file when Spark attached one, or reads in a dialog. */
function useReport() {
  const [open, setOpen] = useState<CompanyAnalysis | null>(null);
  const { state, actions } = useStore();
  const doc = open?.docId ? state.docs.find((d) => d.id === open.docId) : undefined;
  const dialog = (
    <Dialog
      open={!!open}
      onClose={() => setOpen(null)}
      size="md"
      title={open?.title}
      description={open && `${ORIGIN[open.origin]} · Updated ${fmtDate(open.updatedAt)}`}
      footer={
        open && (
          <>
            {doc && (
              <Button variant="secondary" icon={FileText} onClick={() => navigate(`/documents/${doc.folderId}?doc=${doc.id}`)}>
                Open the report file
              </Button>
            )}
            <Button variant="primary" icon={MessageSquare} onClick={() => navigate(`/assistant/${actions.ask(null, `Walk me through the ${open.title.toLowerCase()} and what we should do first.`)}`)}>
              Discuss with Spark
            </Button>
          </>
        )
      }
    >
      {open && (
        <div className="hl-report">
          <p className="hl-report__lead">{open.summary}</p>
          <ol className="hl-findings">
            {open.findings.map((f) => (
              <li key={f.title}>
                <b>{f.title}</b>
                <p>{f.body}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Dialog>
  );
  return { show: setOpen, dialog };
}

/** The whole company profile, read-only: Spark keeps it (there's no edit flow in the portal yet). */
function useProfile() {
  const [open, setOpen] = useState(false);
  const { state } = useStore();
  const b = state.brand;
  const dialog = (
    <Dialog open={open} onClose={() => setOpen(false)} size="md" title={b.name} description={`${b.tagline} · Kept by Spark, updated ${fmtDate(b.updatedAt)}`}>
      <div className="hl-profile-full">
        <p className="hl-report__lead">{b.positioning}</p>
        <Facts all />
        <Audiences />
        <div>
          <Label>Voice</Label>
          <ul className="hl-chips">
            {b.voice.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </div>
      </div>
    </Dialog>
  );
  return { show: () => setOpen(true), dialog };
}

function Facts({ all, profile }: { all?: boolean; profile?: boolean }) {
  const { state } = useStore();
  const b = state.brand;
  const rows: [string, ReactNode][] = [
    [
      'Website',
      <a href={`https://${b.website}`} target="_blank" rel="noreferrer" className="hl-link">
        {b.website}
      </a>,
    ],
    ['Category', b.category],
    ['Head office', b.hq],
    ...(all
      ? ([
          ['Founded', b.founded],
          ['Footprint', b.footprint],
        ] as [string, ReactNode][])
      : []),
    // The full profile: who it's for and how it speaks, as rows like the rest (no chips or separate blocks).
    ...(profile
      ? ([
          [
            'Audiences',
            <ul className="hl-facts__list">
              {b.audiences.map((a) => (
                <li key={a.name}>
                  {a.name}
                  <span>{a.detail}</span>
                </li>
              ))}
            </ul>,
          ],
          [
            'Voice',
            <ul className="hl-facts__list">
              {b.voice.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>,
          ],
        ] as [string, ReactNode][])
      : []),
  ];
  return (
    <dl className="hl-facts">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Audiences() {
  const { state } = useStore();
  return (
    <div>
      <Label>Audiences</Label>
      <ul className="hl-aud">
        {state.brand.audiences.map((a) => (
          <li key={a.name}>
            <b>{a.name}</b>
            <span>{a.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompanyTile({ size = 44 }: { size?: number }) {
  const { state } = useStore();
  return (
    <span className="hl-tile" style={{ width: size, height: size, fontSize: size * 0.42 }} aria-hidden>
      {state.brand.name.charAt(0)}
    </span>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="hl-empty">{children}</p>;
}

/** No analysis yet: a centred empty state after the client's reference, its picture in the brand book's
 *  icon recipe (p. 35: a frosted glass body, the spectrum underneath, white on top). The client can ask
 *  for one; otherwise Spark adds them as it completes them. */
function NoAnalysis() {
  const { openRequest } = useUI();
  return (
    <div className="hl-none">
      <span className="hl-none__art" aria-hidden>
        <span className="hl-none__glow" />
        <span className="hl-none__tile">
          <ScanSearch size={34} strokeWidth={1.8} />
        </span>
      </span>
      <h3 className="hl-none__title">Your company, in the right light</h3>
      <p className="hl-none__text">Spark’s website, social media, brand and PR analysis appear here as soon as they’re ready.</p>
      <Button
        variant="secondary"
        onClick={() =>
          openRequest({
            title: 'Company analysis',
            type: 'Research',
            description: 'An analysis of our website, social media, brand and PR: where we stand and where we lose people.',
          })
        }
      >
        Request an analysis
      </Button>
    </div>
  );
}

/** Waiting items as rows with a clear action. `compact` drops the action button for narrow columns. */
function WaitingRows({ items, compact }: { items: Waiting[]; compact?: boolean }) {
  if (!items.length) return <Empty>Nothing waits on you right now.</Empty>;
  return (
    <ul className={cx('hl-wait', compact && 'hl-wait--compact')}>
      {items.map((w) => (
        <li key={w.key}>
          <a className="hl-wait__row" href={w.href}>
            <span className="hl-wait__mark" aria-hidden>
              <CircleAlert size={16} strokeWidth={2.2} />
            </span>
            <span className="hl-wait__text">
              <span className="hl-wait__title">{w.title}</span>
              <span className="hl-wait__meta">
                <span className="hl-type">{w.type}</span>
                <span className={`rstatus rstatus--${w.status}`}>
                  <span className="rstatus__dot" />
                  {w.statusLabel}
                </span>
                {w.note && <span className="hl-wait__note">{w.note}</span>}
              </span>
            </span>
            {w.date && (
              <span className="hl-wait__date">
                <span>{w.date.label}</span>
                <b>{fmtDate(w.date.iso)}</b>
              </span>
            )}
            {!compact && (
              <span className="hl-wait__action">
                {w.action} <ArrowRight size={14} />
              </span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}

function OngoingRows({ items, compact }: { items: Ongoing[]; compact?: boolean }) {
  const { state } = useStore();
  if (!items.length) return <Empty>Nothing in progress with Spark.</Empty>;
  return (
    <ul className={cx('hl-ongoing', compact && 'hl-ongoing--compact')}>
      {items.map((o) => {
        const r = state.requests.find((x) => x.id === o.key)!;
        const I = TYPE_ICON[r.type] ?? FileText;
        return (
          <li key={o.key}>
            <a className="hl-ongoing__row" href={o.href}>
              <I size={16} strokeWidth={1.7} className="hl-ongoing__icon" />
              <span className="hl-ongoing__text">
                <span className="hl-ongoing__title">
                  {o.title} <RequestStatus status={o.status} />
                </span>
                <span className="hl-ongoing__update">
                  {o.update} · {fmtDate(o.updatedAt)}
                </span>
                {o.next && !compact && <span className="hl-ongoing__next">Next: {o.next}</span>}
              </span>
              <span className="hl-go">
                View <ArrowRight size={14} />
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function DoneRows({ items }: { items: Done[] }) {
  if (!items.length) return <Empty>Nothing delivered yet.</Empty>;
  return (
    <ul className="hl-done">
      {items.map((d) => (
        <li key={d.key}>
          <a href={d.href}>
            <CheckCircle2 size={15} strokeWidth={1.9} className="hl-done__icon" />
            <span className="hl-done__title">{d.title}</span>
            <span className="hl-done__at">Delivered {fmtDate(d.at)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function SectionHead({ title, count, children }: { title: string; count?: number; children?: ReactNode }) {
  return (
    <div className="hl-section-head">
      <h2>
        {title}
        {count !== undefined && <span className="hl-count">{count}</span>}
      </h2>
      {children}
    </div>
  );
}

// ---- A · Action-first --------------------------------------------------------------------------

export function ActionFirst({ m }: { m: Model }) {
  const { me } = useStore();
  const report = useReport();
  const profile = useProfile();
  const nearest = m.waiting.find((w) => w.date);
  const intro = m.waiting.length
    ? `${m.waiting.length === 1 ? 'One item waits' : `${m.waiting.length} items wait`} for your decision${nearest ? `, the first by ${fmtDate(nearest.date!.iso)}` : ''}. Spark is working on ${m.ongoing.length === 1 ? 'one request' : `${m.ongoing.length} requests`}.`
    : `Nothing waits on you. Spark is working on ${m.ongoing.length === 1 ? 'one request' : `${m.ongoing.length} requests`}.`;
  return (
    <div className="hl hl--action">
      <header className="hl-head">
        <div>
          <Label tone="ember">Home</Label>
          <h1 className="hl-title">Good to see you, {me.name.split(' ')[0]}</h1>
          <p className="hl-intro">{intro}</p>
        </div>
        <NewChat />
      </header>

      <section className="hl-block hl-block--primary">
        <SectionHead title="Waiting for your decision" count={m.waiting.length} />
        <WaitingRows items={m.waiting} />
      </section>

      <section className="hl-block">
        <SectionHead title="In progress" count={m.ongoing.length} />
        <OngoingRows items={m.ongoing} />
      </section>

      <div className="hl-pair">
        <section className="hl-block">
          <SectionHead title="Company profile">
            <button type="button" className="hl-link" onClick={profile.show}>
              Full profile
            </button>
          </SectionHead>
          <div className="hl-company-row">
            <CompanyTile />
            <div>
              <b className="hl-company-name">{m.brand.name}</b>
              <p className="hl-muted">{m.brand.tagline}</p>
            </div>
          </div>
          <p className="hl-body">{m.brand.positioning}</p>
          <Facts />
        </section>

        <section className="hl-block">
          <SectionHead title="Company analysis" count={m.analyses.length} />
          {m.analyses.length ? (
            <ul className="hl-an-list">
              {m.analyses.map((a) => {
                const I = ANALYSIS_ICON[a.kind];
                return (
                  <li key={a.id}>
                    <button type="button" className="hl-an-row" onClick={() => report.show(a)}>
                      <I size={16} strokeWidth={1.7} className="hl-an-row__icon" />
                      <span className="hl-an-row__text">
                        <b>{a.title}</b>
                        <span>{(a.findings.find((f) => f.issue) ?? a.findings[0]).title}</span>
                      </span>
                      <span className="hl-origin">{a.origin === 'spark' ? 'By Spark' : 'Requested'}</span>
                      <ArrowRight size={14} className="hl-an-row__go" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <NoAnalysis />
          )}
        </section>
      </div>
      {report.dialog}
      {profile.dialog}
    </div>
  );
}

// ---- B · Company intelligence --------------------------------------------------------------------

export function Intelligence({ m }: { m: Model }) {
  const report = useReport();
  const profile = useProfile();
  return (
    <div className="hl hl--intel">
      <header className="hl-identity">
        <div className="hl-identity__top">
          <CompanyTile size={64} />
          <div className="hl-identity__name">
            <Label tone="ember">Home · Your company</Label>
            <h1 className="hl-title hl-title--ultra">{m.brand.name}</h1>
            <p className="hl-muted">{m.brand.tagline}</p>
          </div>
          <NewChat />
        </div>
        <p className="hl-lead">{m.brand.positioning}</p>
        <div className="hl-identity__facts">
          <Facts />
          <button type="button" className="hl-link" onClick={profile.show}>
            <Building2 size={14} /> Full profile
          </button>
        </div>
      </header>

      <div className="hl-intel">
        <section className="hl-intel__main">
          <SectionHead title="What Spark found" count={m.analyses.length} />
          {m.analyses.length ? (
            <div className="hl-dossier">
              {m.analyses.map((a) => {
                const I = ANALYSIS_ICON[a.kind];
                const shown = [a.findings.find((f) => f.issue), a.findings.find((f) => f.good)].filter(Boolean) as CompanyAnalysis['findings'];
                return (
                  <article key={a.id} className="hl-dossier__item">
                    <div className="hl-dossier__side">
                      <span className="hl-dossier__icon">
                        <I size={18} strokeWidth={1.7} />
                      </span>
                      <span className="hl-origin">{ORIGIN[a.origin]}</span>
                      <span className="hl-muted hl-small">Updated {fmtDate(a.updatedAt)}</span>
                    </div>
                    <div className="hl-dossier__main">
                      <h3>{a.title}</h3>
                      <p className="hl-body">{a.summary}</p>
                      <ul className="hl-excerpts">
                        {(shown.length ? shown : a.findings.slice(0, 2)).map((f) => (
                          <li key={f.title} className={cx(f.issue && 'is-issue', f.good && 'is-good')}>
                            <Label tone={f.issue ? 'ember' : 'cobalt'}>{f.issue ? 'Where it gets lost' : 'What works'}</Label>
                            <b>{f.title}</b>
                            <span>{f.body}</span>
                          </li>
                        ))}
                      </ul>
                      <button type="button" className="hl-link hl-link--strong" onClick={() => report.show(a)}>
                        Open full report <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <NoAnalysis />
          )}
        </section>

        <aside className="hl-intel__side">
          <section className="hl-panel">
            <SectionHead title="Waiting for your decision" count={m.waiting.length} />
            <WaitingRows items={m.waiting} compact />
          </section>
          <section className="hl-panel">
            <SectionHead title="In progress" count={m.ongoing.length} />
            <OngoingRows items={m.ongoing} compact />
          </section>
          <section className="hl-panel">
            <SectionHead title="Recently delivered" />
            <DoneRows items={m.done} />
          </section>
        </aside>
      </div>
      {report.dialog}
      {profile.dialog}
    </div>
  );
}

// ---- C · Workspace -------------------------------------------------------------------------------

export function Workspace({ m }: { m: Model }) {
  const { me } = useStore();
  const report = useReport();
  const profile = useProfile();
  const groups = (['spark', 'requested'] as const).map((o) => ({ o, items: m.analyses.filter((a) => a.origin === o) })).filter((g) => g.items.length);
  return (
    <div className="hl hl--workspace">
      <header className="hl-bar">
        <CompanyTile size={36} />
        <div className="hl-bar__text">
          <b>{m.brand.name}</b>
          <span>Workspace with Spark Studios</span>
        </div>
        <NewChat variant="quiet" />
      </header>

      <div className="hl-welcome">
        <h1 className="hl-title">Welcome back, {me.name.split(' ')[0]}</h1>
        <p className="hl-intro">Where things stand between you and Spark.</p>
      </div>

      {/* Three lanes: who has the ball. */}
      <div className="hl-lanes">
        <section className="hl-lane hl-lane--you">
          <div className="hl-lane__head">
            <Label tone="ember">With you</Label>
            <span className="hl-lane__n">{m.waiting.length}</span>
          </div>
          <p className="hl-lane__sub">Decisions and feedback Spark is waiting for.</p>
          <WaitingRows items={m.waiting} compact />
        </section>
        <section className="hl-lane hl-lane--spark">
          <div className="hl-lane__head">
            <Label tone="cobalt">With Spark</Label>
            <span className="hl-lane__n">{m.ongoing.length}</span>
          </div>
          <p className="hl-lane__sub">Work in progress on Spark’s side.</p>
          <OngoingRows items={m.ongoing} compact />
        </section>
        <section className="hl-lane hl-lane--done">
          <div className="hl-lane__head">
            <Label>Delivered</Label>
            <span className="hl-lane__n">{m.done.length}</span>
          </div>
          <p className="hl-lane__sub">Finished work, ready to use.</p>
          <DoneRows items={m.done} />
        </section>
      </div>

      {/* The company, larger, as an editorial spread: the positioning on the left, facts and people on the right. */}
      <section className="hl-spread">
        <div className="hl-spread__left">
          <Label tone="ember">Company profile</Label>
          <p className="hl-quote">{m.brand.positioning}</p>
          <button type="button" className="hl-link hl-link--strong" onClick={profile.show}>
            Full profile <ArrowRight size={14} />
          </button>
        </div>
        <div className="hl-spread__right">
          <Facts all />
          <Audiences />
        </div>
      </section>

      <section className="hl-library">
        <SectionHead title="Analysis and reports" count={m.analyses.length} />
        {groups.length ? (
          <div className="hl-library__groups">
            {groups.map((g) => (
              <div key={g.o} className="hl-library__group">
                <Label tone={g.o === 'spark' ? 'ember' : 'cobalt'}>{ORIGIN[g.o]}</Label>
                <ul>
                  {g.items.map((a) => {
                    const I = ANALYSIS_ICON[a.kind];
                    return (
                      <li key={a.id}>
                        <button type="button" className="hl-lib-item" onClick={() => report.show(a)}>
                          <span className="hl-lib-item__icon">
                            <I size={18} strokeWidth={1.7} />
                          </span>
                          <span className="hl-lib-item__text">
                            <b>{a.title}</b>
                            <span>{a.summary}</span>
                            <span className="hl-muted hl-small">Updated {fmtDate(a.updatedAt)}</span>
                          </span>
                          <ArrowUpRight size={16} className="hl-lib-item__go" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <NoAnalysis />
        )}
      </section>
      {report.dialog}
      {profile.dialog}
    </div>
  );
}

const usd = (n: number) => `USD ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** The company's credits beside its name, after the client's reference: a soft pill (the spark, the
 *  balance, a chevron); hover or focus opens a card with what's available, where it came from, what's
 *  been used, a note on what credits pay for, and Top up (the same dialog as the corner pill elsewhere). */
const FREE_CREDITS = 100;
function CreditsIndicator({ balance }: { balance?: { left: number; total: number } }) {
  const { state } = useStore();
  const [topUp, setTopUp] = useState(false);
  const left = balance?.left ?? state.credits;
  const total = balance?.total ?? state.creditsTotal;
  const used = Math.max(0, total - left);
  const toppedUp = Math.max(0, total - FREE_CREDITS);
  // Under a fifth left: said in words with Top up beside it, calmly (no red, no Ember: it isn't an error).
  const low = left < total * 0.2;
  const rows: [string, string][] = [
    ['Free credits', usd(FREE_CREDITS)],
    ['Topped up', usd(toppedUp)],
    ['Used so far', usd(used)],
  ];
  return (
    <>
      <span className={cx('hl-cind', low && 'is-low')}>
        <button type="button" className="hl-cind__chip" aria-describedby="hl-cind-card">
          <Sparkles size={15} strokeWidth={1.9} className="hl-cind__icon" aria-hidden />
          <span className="hl-cind__amount">{usd(left)}</span>
          <span className="hl-cind__word">{low ? 'left · running low' : 'credits'}</span>
          <ChevronDown size={14} strokeWidth={2} className="hl-cind__chev" aria-hidden />
        </button>
        <span className="hl-cind__card" id="hl-cind-card" role="tooltip">
          <span className="hl-cind__big">{usd(left)}</span>
          <span className="hl-cind__sub">credits available</span>
          <dl className="hl-cind__rows">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <span className="hl-cind__note">
            <b>Credits pay for chats and research.</b> Work from the Spark team is quoted in its proposals.
          </span>
          <Button variant="primary" icon={Plus} onClick={() => setTopUp(true)}>
            Top up
          </Button>
        </span>
      </span>
      {low && (
        <button type="button" className="hl-cind__topup" onClick={() => setTopUp(true)}>
          <Plus size={14} strokeWidth={2} /> Top up
        </button>
      )}
      <TopUpDialog open={topUp} onClose={() => setTopUp(false)} />
    </>
  );
}

/** One row for every request: the title and one line that says what happens next and by when. Rows that
 *  wait on the client sit on a light orange tile, so they stand out without an icon. */
function ReqRow({ href, title, next, date, attention }: { href: string; title: string; next: string; date?: string; attention?: boolean }) {
  return (
    <li>
      <a className={cx('hl-req', attention && 'hl-req--attention')} href={href}>
        <span className="hl-req__text">
          <b>{title}</b>
          <span>
            {next}
            {date && <span className="hl-req__date"> · {fmtDate(date)}</span>}
          </span>
        </span>
        <ArrowRight size={15} className="hl-req__go" />
      </a>
    </li>
  );
}

function RequestsCard({ m }: { m: Model }) {
  const { state } = useStore();
  // Two tabs as pills (after the client's reference): what needs the client first, unless nothing does.
  const [tab, setTab] = useState<'attention' | 'progress'>(m.waiting.length ? 'attention' : 'progress');
  const tabs = [
    { k: 'attention' as const, label: 'Needs attention', n: m.waiting.length },
    { k: 'progress' as const, label: 'In progress', n: m.ongoing.length },
  ];
  return (
    <section className="hl-reqs">
      <h2 className="hl-reqs__title">Requests</h2>
      <div className="hl-reqs__tabs" role="tablist" aria-label="Requests">
        {tabs.map((t) => (
          <button key={t.k} type="button" role="tab" aria-selected={tab === t.k} className={cx('hl-reqs__tab', tab === t.k && 'is-on')} onClick={() => setTab(t.k)}>
            {t.label}
            <span className="hl-reqs__n">{t.n}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tab === 'attention' &&
          (m.waiting.length ? (
            <ul className="hl-reqs__list">
              {m.waiting.map((w) => (
                <ReqRow
                  key={w.key}
                  href={w.href}
                  title={w.title}
                  next={w.type === 'Proposal' ? 'Decide on the proposal' : w.type === 'Feedback' ? 'Give feedback on the concepts' : 'Approve the file'}
                  date={w.date ? w.date.iso : undefined}
                  attention
                />
              ))}
            </ul>
          ) : (
            <p className="hl-empty">Nothing needs you right now.</p>
          ))}
        {tab === 'progress' &&
          (m.ongoing.length ? (
            <ul className="hl-reqs__list">
              {m.ongoing.map((o) => {
                const r = state.requests.find((x) => x.id === o.key)!;
                return <ReqRow key={o.key} href={o.href} title={o.title} next={r.nextStep ? `Next: ${r.nextStep.label}` : 'Spark is on it'} date={r.nextStep?.date} />;
              })}
            </ul>
          ) : (
            <p className="hl-empty">Nothing in progress.</p>
          ))}
      </div>
      <a className="hl-reqs__all" href="#/requests">
        All requests <ArrowRight size={14} />
      </a>
    </section>
  );
}

// ---- D · Main and side (after a reference: a wide column of content, narrower cards beside it) -----

/** The company's own team under its description, after the client's reference: their faces, "Brand Co.
 *  team · you and 2 colleagues"; it opens Team. Only the client's people: Spark shows as one
 *  team, never by name. */
function TeamLine() {
  const { state, me } = useStore();
  const others = state.people.filter((p) => p.org === 'client' && p.id !== me.id);
  if (!others.length)
    return (
      <a className="hl-team" href="#/team?from=home">
        <span className="hl-team__text">
          <b>{state.brand.name} team</b> · just you so far, invite your colleagues
        </span>
      </a>
    );
  return (
    <a className="hl-team" href="#/team?from=home">
      <span className="hl-team__faces">
        {others.slice(0, 4).map((p) => (
          <Avatar key={p.id} person={p} size={26} ring />
        ))}
      </span>
      <span className="hl-team__text">
        <b>{state.brand.name} team</b> · you and {others.length} {others.length === 1 ? 'colleague' : 'colleagues'}
      </span>
    </a>
  );
}

/** The company's avatar on Home: its initial until a logo is added. Hovering shows an edit control that
 *  picks an image; the prototype shows it at once and keeps it for this visit only. */
function CompanyAvatar() {
  const { state } = useStore();
  const [src, setSrc] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  return (
    <span className="hl-hero__avatar">
      {src ? <img src={src} alt={`${state.brand.name} logo`} /> : <span aria-hidden>{state.brand.name.charAt(0)}</span>}
      <label
        className="hl-hero__edit"
        tabIndex={0}
        aria-label="Change the company’s logo"
        title="Change logo"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), input.current?.click())}
      >
        <Pencil size={20} strokeWidth={1.9} />
        <input
          ref={input}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setSrc(URL.createObjectURL(f));
          }}
        />
      </label>
    </span>
  );
}

/** What Spark did lately, as a feed (feedback 26 Oct): files it shared, replies on requests and work updates,
 *  newest first. Proposals are left out: they're a step of a request and wait in "Your requests". So are
 *  files sent for approval (also in the requests), supporting images, and updates that only point at a
 *  file (the file is its own row). One update per request, its latest. */
const NEW_SINCE = '2026-10-01'; // prototype: what happened in October is new until opened
// Status lines written for a request's history, said in full on Home.
const UPDATE_TEXT: Record<string, string> = { 'started reviewing': 'started reviewing your request', 'started work': 'started the work' };
type FeedItem = { id: string; at: string; kind: 'file' | 'reply' | 'update'; title: string; sub: string; doc?: Doc; reqId?: string };

function LatestFromSpark({ empty }: { empty?: boolean }) {
  const { state, actions } = useStore();
  // Files open in the preview over Home, so closing it (or going back) keeps the client on Home.
  const { openDoc } = useUI();
  const isSpark = (id: string) => state.people.find((p) => p.id === id)?.org === 'spark';

  const files: FeedItem[] = state.docs
    .filter((d) => isSpark(d.uploadedBy) && d.review?.status !== 'open' && d.kind !== 'image' && d.folderId !== 'f-proposals')
    .map((d) => {
      const folder = state.folders.find((f) => f.id === d.folderId);
      const req = d.requestId ? state.requests.find((r) => r.id === d.requestId) : undefined;
      return {
        id: d.id,
        at: d.uploadedAt,
        kind: 'file',
        title: d.name.replace(/\.[a-z0-9]+$/i, ''),
        sub: `Shared in ${folder?.name ?? 'Documents'}${req && !d.name.includes(req.title) ? ` · for ${req.title}` : ''}`,
        doc: d,
      };
    });
  const updates: FeedItem[] = state.requests.flatMap((r): FeedItem[] => {
    const a = r.activity.filter((x) => isSpark(x.by) && x.kind !== 'proposal' && x.kind !== 'file').sort((x, y) => y.at.localeCompare(x.at))[0];
    if (!a) return [];
    return a.kind === 'comment'
      ? [{ id: a.id, at: a.at, kind: 'reply', title: `Spark replied on ${r.title}`, sub: `“${a.text}”`, reqId: r.id }]
      : [{ id: a.id, at: a.at, kind: 'update', title: `Spark ${UPDATE_TEXT[a.text] ?? a.text}`, sub: r.title, reqId: r.id }];
  });
  const feed = [...files, ...updates].sort((a, b) => b.at.localeCompare(a.at)).slice(0, empty ? 0 : 5);

  if (!feed.length)
    return (
      <section className="hl-latest">
        <SectionHead title="Latest from Spark" />
        <div className="hl-quiet">
          <span>Spark’s files, replies and updates on your work will appear here.</span>
        </div>
      </section>
    );
  return (
    <section className="hl-latest">
      <SectionHead title="Latest from Spark" />
      <ul className="hl-latest__list">
        {feed.map((f) => {
          const fresh = f.at >= NEW_SINCE && !state.seenDocs.includes(f.id);
          return (
            <li key={f.id}>
              <button
                type="button"
                className={cx('hl-latest__row', fresh && 'is-new')}
                onClick={() => {
                  actions.seeDoc(f.id);
                  if (f.doc) openDoc(f.doc.id);
                  else if (f.reqId) navigate(`/requests/${f.reqId}${f.kind === 'reply' ? '?tab=messages' : ''}`);
                }}
              >
                {f.doc ? (
                  <FileIcon kind={f.doc.kind} size={16} />
                ) : (
                  <span className="hl-latest__kind" aria-hidden>
                    {f.kind === 'reply' ? <MessageSquare size={16} strokeWidth={1.7} /> : <CircleDot size={16} strokeWidth={1.7} />}
                  </span>
                )}
                <span className="hl-latest__text">
                  <b>
                    {f.title}
                    {fresh && <span className="hl-latest__dot" aria-label="New" />}
                  </b>
                  <span>{f.sub}</span>
                </span>
                <span className="hl-latest__date">{fmtDate(f.at)}</span>
                <ArrowRight size={15} className="hl-latest__go" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ---- What Spark is working on (#/demo/home-next) ----------------------------------------------------

export type ProgressLook = 'rows' | 'cards' | 'steps' | 'line';
const STAGES = ['Submitted', 'Scoping', 'Proposal', 'In progress', 'Delivered'] as const;
const stageOf = (s: WorkRequest['status']) => (s === 'submitted' ? 0 : s === 'in_review' ? 1 : s === 'proposal' || s === 'changes_requested' ? 2 : s === 'delivered' ? 4 : 3);

/** The requests Spark has in hand (nothing waits on the client), each with its stage and the next step:
 *  so the client sees the work move without opening Requests (feedback 23 Oct). With none, one line and a
 *  way to start one. */
function InProgress({ m, look }: { m: Model; look: ProgressLook }) {
  const { state } = useStore();
  const { openRequest } = useUI();
  const items = m.ongoing.map((o) => ({ o, r: state.requests.find((x) => x.id === o.key)! }));
  const nextOf = (r: WorkRequest) => (r.nextStep ? `Next: ${r.nextStep.label}` : 'Spark is on it');

  if (!items.length)
    return (
      <section className="hl-prog">
        <SectionHead title="In progress with Spark" />
        <div className="hl-quiet">
          <span>Nothing in progress yet. Ask Spark for something and follow it here, step by step.</span>
          <Button variant="secondary" icon={Plus} onClick={() => openRequest()}>
            New request
          </Button>
        </div>
      </section>
    );

  if (look === 'line') {
    const first = items.find((x) => x.r.nextStep) ?? items[0];
    return (
      <a className="hl-prog-line" href="#/requests">
        <span className="hl-prog-line__n">{items.length}</span>
        <span className="hl-prog-line__text">
          <b>{items.length === 1 ? 'request' : 'requests'} in progress with Spark</b>
          <span>
            {first.r.title} · {nextOf(first.r)}
            {first.r.nextStep && `, ${fmtDate(first.r.nextStep.date)}`}
          </span>
        </span>
        <span className="hl-go">
          See progress <ArrowRight size={14} />
        </span>
      </a>
    );
  }

  return (
    <section className="hl-prog">
      <SectionHead title="In progress with Spark" count={items.length}>
        <a className="hl-link" href="#/requests">
          All requests
        </a>
      </SectionHead>

      {look === 'rows' && (
        <ul className="hl-latest__list">
          {items.map(({ o, r }) => {
            const I = TYPE_ICON[r.type] ?? FileText;
            return (
              <li key={o.key}>
                <a className="hl-latest__row" href={o.href}>
                  <I size={16} strokeWidth={1.7} className="hl-prog__icon" />
                  <span className="hl-latest__text">
                    <b>{r.title}</b>
                    <span>
                      {nextOf(r)}
                      {r.nextStep && ` · ${fmtDate(r.nextStep.date)}`}
                    </span>
                  </span>
                  <span className="hl-prog__stage">{STAGES[stageOf(r.status)]}</span>
                  <ArrowRight size={15} className="hl-latest__go" />
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {look === 'cards' && (
        <ul className="hl-issues__list">
          {items.map(({ o, r }) => (
            <li key={o.key}>
              <a className="hl-issue hl-prog-card" href={o.href}>
                <span className="hl-issue__src">
                  {r.type} · {STAGES[stageOf(r.status)]}
                </span>
                <b>{r.title}</b>
                <span className="hl-issue__body">
                  {o.update} · {fmtDate(o.updatedAt)}
                </span>
                <span className="hl-prog-card__next">
                  {nextOf(r)}
                  {r.nextStep && <b> · {fmtDate(r.nextStep.date)}</b>}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {look === 'steps' && (
        <ul className="hl-latest__list">
          {items.map(({ o, r }) => {
            const at = stageOf(r.status);
            return (
              <li key={o.key}>
                <a className="hl-latest__row hl-prog-steps" href={o.href}>
                  <span className="hl-latest__text">
                    <b>{r.title}</b>
                    <span>
                      {nextOf(r)}
                      {r.nextStep && ` · ${fmtDate(r.nextStep.date)}`}
                    </span>
                  </span>
                  <span className="hl-track" aria-label={`Stage: ${STAGES[at]}`}>
                    <span className="hl-track__bar">
                      {STAGES.map((st, i) => (
                        <span key={st} className={cx(i < at && 'is-done', i === at && 'is-now')} />
                      ))}
                    </span>
                    <span className="hl-track__label">
                      {STAGES[at]}{' '}
                      <span>
                        · {at + 1} of {STAGES.length}
                      </span>
                    </span>
                  </span>
                  <ArrowRight size={15} className="hl-latest__go" />
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** Every request in one place, a column per stage (feedback 26 Oct): what needs the client, what Spark is
 *  working on, what's closed (delivered or declined, as on Requests). Each column: how many, the stage with its mark, and a link to that stage
 *  on Requests. With no requests at all, one line and New request. */
export type ReqIcons = 'line' | 'emoji';
function RequestsSummary({ m, icons = 'line' }: { m: Model; icons?: ReqIcons }) {
  const { state } = useStore();
  const { openRequest } = useUI();
  // Closed, as on Requests: delivered and declined together.
  const closed = state.requests.filter((r) => !isOpen(r.status)).length;
  // Each stage's mark on a soft tile of its colour, so it reads at a glance; or an emoji (demo).
  const emoji = icons === 'emoji';
  const cols = [
    { key: 'attention', n: m.waiting.length, label: 'Need your attention', icon: emoji ? '👀' : <CircleAlert size={15} strokeWidth={2.2} />, href: '#/requests?filter=decision' },
    { key: 'progress', n: m.ongoing.length, label: 'In progress', icon: emoji ? '⏳' : <span className="hl-col__dot" />, href: '#/requests?filter=active' },
    { key: 'done', n: closed, label: 'Closed', icon: emoji ? '🏁' : <Check size={15} strokeWidth={2.6} />, href: '#/requests?filter=closed' },
  ];

  if (!cols.some((c) => c.n))
    return (
      <div className="hl-quiet">
        <span>No requests yet. Ask Spark for something and follow it here, step by step.</span>
        <Button variant="secondary" icon={Plus} onClick={() => openRequest()}>
          New request
        </Button>
      </div>
    );
  return (
    <section className="hl-reqsum" aria-label="Your requests">
      <SectionHead title="Your requests">
        <a className="hl-link" href="#/requests">
          All requests
        </a>
      </SectionHead>
      <ul className="hl-cols">
        {cols.map((c) => (
          <li key={c.key}>
            <a className={cx('hl-col', `hl-col--${c.key}`)} href={c.href}>
              <span className="hl-col__n">{c.n}</span>
              <span className="hl-col__label">
                <span className={cx('hl-col__icon', emoji && 'hl-col__icon--emoji')} aria-hidden>
                  {c.icon}
                </span>
                {c.label}
                <ArrowRight size={15} className="hl-col__go" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---- Requests as a dashboard above the issues (#/demo/home-requests) -------------------------------

const askOf = (w: Waiting) => (w.type === 'Proposal' ? 'Decide on the proposal' : w.type === 'Feedback' ? 'Give feedback on the concepts' : 'Approve the file');

/** The requests moved from the side into the page, above "Where we think you have issues". Five ways
 *  to show them, all with what needs the client first and what Spark does next. */
function RequestsDash({ m, look, art = 'sheet' }: { m: Model; look: Exclude<ReqsLook, 'side'>; art?: BannerArt }) {
  const { state } = useStore();
  const nextOf = (o: Ongoing) => state.requests.find((r) => r.id === o.key)?.nextStep;
  const [open, setOpen] = useState(false);

  // Alert, after the client's reference: a banner that says how many requests have a new proposal, a
  // picture of a proposal, and Go to requests (opens Requests on "Needs you"). It can be closed for the
  // visit; nothing shows when nothing waits.
  // Status: one block, a row per stage of the work. Each row says how many, what they are, and where to go:
  // needs your decision (tinted, with Review), in progress with Spark (with the next step), waiting for Spark
  // to pick up (only when there are some), delivered. Clearer than a banner plus a line.
  if (look === 'status') {
    const proposals = m.waiting.filter((w) => w.type === 'Proposal').length;
    const others = m.waiting.length - proposals;
    const first = m.waiting.find((w) => w.date);
    const queued = m.ongoing.filter((o) => o.status === 'submitted');
    const working = m.ongoing.filter((o) => o.status !== 'submitted');
    const firstWork = working[0];
    const next = firstWork && nextOf(firstWork);
    const lastDone = m.done[0];
    const parts = [proposals && `${proposals} ${proposals === 1 ? 'proposal' : 'proposals'}`, others && `${others} ${others === 1 ? 'feedback request' : 'feedback requests'}`].filter(Boolean);
    const rows = [
      m.waiting.length > 0 && {
        key: 'you',
        n: m.waiting.length,
        label: 'Need your decision',
        detail: `${parts.join(' and ')}${first?.date ? ` · the first by ${fmtDate(first.date.iso)}` : ''}`,
        href: '#/requests?filter=decision',
        action: 'Review',
        attention: true,
      },
      working.length > 0 && {
        key: 'spark',
        n: working.length,
        label: 'In progress with Spark',
        detail: `${firstWork.title}${next ? ` · Next: ${next.label}, ${fmtDate(next.date)}` : ''}${working.length > 1 ? ` and ${working.length - 1} more` : ''}`,
        href: '#/requests?filter=active',
        action: 'View',
      },
      queued.length > 0 && {
        key: 'queue',
        n: queued.length,
        label: 'Waiting for Spark to pick up',
        detail: queued.map((q) => q.title).join(' · '),
        href: '#/requests?filter=active',
        action: 'View',
      },
      m.done.length > 0 && {
        key: 'done',
        n: m.done.length,
        label: 'Delivered',
        detail: lastDone ? `Latest: ${lastDone.title} · ${fmtDate(lastDone.at)}` : '',
        href: '#/requests?filter=closed',
        action: 'View',
      },
    ].filter(Boolean) as { key: string; n: number; label: string; detail: string; href: string; action: string; attention?: boolean }[];
    if (!rows.length) return null;
    return (
      <section className="rs">
        <SectionHead title="Your requests">
          <a className="hl-link" href="#/requests">
            All requests
          </a>
        </SectionHead>
        <ul className="rs-list">
          {rows.map((r) => (
            <li key={r.key}>
              <a className={cx('rs-row', r.attention && 'rs-row--attn')} href={r.href}>
                <span className="rs-row__n">{r.n}</span>
                <span className="rs-row__text">
                  <b>{r.label}</b>
                  <span>{r.detail}</span>
                </span>
                <span className={cx('rs-row__go', r.attention && 'rs-row__go--primary')}>
                  {r.action} <ArrowRight size={14} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  // Alert: the banner about what waits on the client, nothing else (what's with Spark is on Requests).
  if (look === 'alert') return <ProposalBanner m={m} art={art} />;

  // A · Figures: three counts as tiles; the first opens the list of what needs the client.
  if (look === 'figures')
    return (
      <section className="rd">
        <SectionHead title="Requests">
          <a className="hl-link" href="#/requests">
            All requests
          </a>
        </SectionHead>
        <div className="rd-figs">
          <button type="button" className={cx('rd-fig rd-fig--attn', open && 'is-on')} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            <span className="rd-fig__n">{m.waiting.length}</span>
            <span className="rd-fig__label">Need your decision</span>
            <span className="rd-fig__sub">{m.waiting[0]?.date ? `First by ${fmtDate(m.waiting[0].date.iso)}` : 'Nothing waits'}</span>
          </button>
          <a className="rd-fig" href="#/requests">
            <span className="rd-fig__n">{m.ongoing.length}</span>
            <span className="rd-fig__label">In progress with Spark</span>
            <span className="rd-fig__sub">{m.ongoing[0] ? `Next: ${nextOf(m.ongoing[0])?.label ?? 'Spark is on it'}` : 'Nothing in progress'}</span>
          </a>
          <a className="rd-fig" href="#/requests">
            <span className="rd-fig__n">{m.done.length}</span>
            <span className="rd-fig__label">Delivered</span>
            <span className="rd-fig__sub">{m.done[0] ? `${m.done[0].title} · ${fmtDate(m.done[0].at)}` : 'Nothing yet'}</span>
          </a>
        </div>
        {open && (
          <ul className="rd-rows">
            {m.waiting.map((w) => (
              <li key={w.key}>
                <a className="rd-row" href={w.href}>
                  <b>{w.title}</b>
                  <span>{askOf(w)}</span>
                  <span className="rd-row__date">{w.date && fmtDate(w.date.iso)}</span>
                  <ArrowRight size={15} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    );

  // B · Cards: one light orange card per decision, side by side; in progress as one line under them.
  if (look === 'cards')
    return (
      <section className="rd">
        <SectionHead title="Needs your decision" count={m.waiting.length}>
          <a className="hl-link" href="#/requests">
            All requests
          </a>
        </SectionHead>
        <div className="rd-cards">
          {m.waiting.map((w) => (
            <a key={w.key} className="rd-card" href={w.href}>
              <span className="rd-card__type">{w.type}</span>
              <b>{w.title}</b>
              <span className="rd-card__ask">{askOf(w)}</span>
              <span className="rd-card__foot">
                {w.date ? `By ${fmtDate(w.date.iso)}` : ''}
                <span className="rd-card__go">
                  {w.action} <ArrowRight size={13} />
                </span>
              </span>
            </a>
          ))}
        </div>
        {m.ongoing.length > 0 && (
          <p className="rd-line">
            <span className="rd-line__label">In progress</span>
            {m.ongoing.map((o, i) => (
              <a key={o.key} href={o.href}>
                {i > 0 && ' · '}
                <b>{o.title}</b>
                {nextOf(o) && (
                  <>
                    {' '}
                    — next: {nextOf(o)!.label.toLowerCase()}, {fmtDate(nextOf(o)!.date)}
                  </>
                )}
              </a>
            ))}
          </p>
        )}
      </section>
    );

  // C · Board: two columns side by side, what needs the client and what's with Spark.
  if (look === 'board')
    return (
      <section className="rd">
        <SectionHead title="Requests">
          <a className="hl-link" href="#/requests">
            All requests
          </a>
        </SectionHead>
        <div className="rd-board">
          <div className="rd-col rd-col--attn">
            <div className="rd-col__head">
              Needs your decision <span className="hl-count">{m.waiting.length}</span>
            </div>
            <ul className="hl-reqs__list">
              {m.waiting.map((w) => (
                <ReqRow key={w.key} href={w.href} title={w.title} next={askOf(w)} date={w.date?.iso} attention />
              ))}
            </ul>
          </div>
          <div className="rd-col">
            <div className="rd-col__head">
              In progress <span className="hl-count">{m.ongoing.length}</span>
            </div>
            <ul className="hl-reqs__list">
              {m.ongoing.map((o) => (
                <ReqRow key={o.key} href={o.href} title={o.title} next={nextOf(o) ? `Next: ${nextOf(o)!.label}` : 'Spark is on it'} date={nextOf(o)?.date} />
              ))}
            </ul>
          </div>
        </div>
      </section>
    );

  // D · Table: every open request in one table, the ones that need the client tinted and first.
  if (look === 'table')
    return (
      <section className="rd">
        <SectionHead title="Requests">
          <a className="hl-link" href="#/requests">
            All requests
          </a>
        </SectionHead>
        <div className="rd-table" role="table">
          <div className="rd-table__head" role="row">
            <span role="columnheader">Request</span>
            <span role="columnheader">What happens next</span>
            <span role="columnheader">By</span>
            <span role="columnheader">Status</span>
          </div>
          {m.waiting.map((w) => (
            <a key={w.key} className="rd-table__row is-attn" href={w.href} role="row">
              <b role="cell">{w.title}</b>
              <span role="cell">{askOf(w)}</span>
              <span role="cell">{w.date ? fmtDate(w.date.iso) : '—'}</span>
              <span role="cell" className="rd-pill rd-pill--attn">
                Needs you
              </span>
            </a>
          ))}
          {m.ongoing.map((o) => (
            <a key={o.key} className="rd-table__row" href={o.href} role="row">
              <b role="cell">{o.title}</b>
              <span role="cell">{nextOf(o)?.label ?? 'Spark is on it'}</span>
              <span role="cell">{nextOf(o) ? fmtDate(nextOf(o)!.date) : '—'}</span>
              <span role="cell" className="rd-pill">
                With Spark
              </span>
            </a>
          ))}
        </div>
      </section>
    );

  // E · Banner: one light orange strip that says what waits and by when; it opens the list.
  return (
    <section className="rd">
      <div className={cx('rd-banner', open && 'is-open')}>
        <button type="button" className="rd-banner__head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <span className="rd-banner__n">{m.waiting.length}</span>
          <span className="rd-banner__text">
            <b>{m.waiting.length === 1 ? 'request needs your decision' : 'requests need your decision'}</b>
            <span>
              {m.waiting.map((w) => w.title).join(' · ')}
              {m.waiting[0]?.date && ` — the first by ${fmtDate(m.waiting[0].date.iso)}`}
            </span>
          </span>
          <span className="rd-banner__btn">
            {open ? 'Hide' : 'Review'} <ChevronDown size={15} />
          </span>
        </button>
        {open && (
          <ul className="rd-rows rd-rows--banner">
            {m.waiting.map((w) => (
              <li key={w.key}>
                <a className="rd-row" href={w.href}>
                  <b>{w.title}</b>
                  <span>{askOf(w)}</span>
                  <span className="rd-row__date">{w.date && fmtDate(w.date.iso)}</span>
                  <ArrowRight size={15} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      {m.ongoing.length > 0 && (
        <p className="rd-line">
          <span className="rd-line__label">In progress</span>
          {m.ongoing.map((o) => (
            <a key={o.key} href={o.href}>
              <b>{o.title}</b>
              {nextOf(o) && (
                <>
                  {' '}
                  — next: {nextOf(o)!.label.toLowerCase()}, {fmtDate(nextOf(o)!.date)}
                </>
              )}
            </a>
          ))}
          <a className="hl-link rd-line__all" href="#/requests">
            All requests
          </a>
        </p>
      )}
    </section>
  );
}

/** The picture in the proposals banner. Options in the brand book's icon recipe (p. 35: a frosted glass
 *  body, the spectrum underneath, white on top) and its "Ink objects carry the spark" (p. 37); picked on
 *  #/demo/home-requests?v=alert. */
export type BannerArt = 'none' | 'sheet' | 'glass' | 'count' | 'ink' | 'stack' | 'spark';

function BannerArtView({ art, n }: { art: BannerArt; n: number }) {
  if (art === 'sheet')
    return (
      <span className="pb__art" aria-hidden>
        <span className="pb__sheet">
          <span className="pb__line pb__line--title" />
          <span className="pb__amount">AED</span>
          <span className="pb__line" />
          <span className="pb__line pb__line--short" />
        </span>
      </span>
    );
  if (art === 'glass' || art === 'count')
    return (
      <span className="pb__icon" aria-hidden>
        <span className="pb__glow" />
        <span className="pb__glass">{art === 'glass' ? <FileText size={22} strokeWidth={1.9} /> : <b>{n}</b>}</span>
      </span>
    );
  if (art === 'ink')
    return (
      <span className="pb__icon" aria-hidden>
        <span className="pb__ink">
          <Sparkles size={20} strokeWidth={1.9} />
        </span>
      </span>
    );
  if (art === 'stack')
    return (
      <span className="pb__icon pb__icon--stack" aria-hidden>
        <span className="pb__glow" />
        <span className="pb__frost pb__frost--back" />
        <span className="pb__frost pb__frost--front">
          <span className="pb__line pb__line--title" />
          <span className="pb__line" />
        </span>
      </span>
    );
  return (
    <span className="pb__icon" aria-hidden>
      <Mascot size={40} />
    </span>
  );
}

/** The banner about new proposals on Home: what waits, a picture, the way to Requests, and a close button. */
function ProposalBanner({ m, art = 'sheet' }: { m: Model; art?: BannerArt }) {
  const [closed, setClosed] = useState(false);
  const proposals = m.waiting.filter((w) => w.type === 'Proposal');
  const others = m.waiting.length - proposals.length;
  if (closed || !m.waiting.length) return null;
  const title = proposals.length
    ? `You have new proposals on ${proposals.length} ${proposals.length === 1 ? 'request' : 'requests'}`
    : `${m.waiting.length} ${m.waiting.length === 1 ? 'request waits' : 'requests wait'} for your feedback`;
  const sub = proposals.length
    ? `Review ${proposals.length === 1 ? 'it' : 'them'} and share your decision with Spark.${others ? ` ${others} more ${others === 1 ? 'request waits' : 'requests wait'} for your feedback.` : ''}`
    : 'Have a look and tell Spark what you think.';
  const leading = art !== 'sheet' && art !== 'none';
  return (
    <section className={cx('pb', leading && 'pb--lead', art === 'none' && 'pb--plain')} role="status">
      {leading && <BannerArtView art={art} n={proposals.length || m.waiting.length} />}
      <div className="pb__text">
        <b>{title}</b>
        <span>{sub}</span>
      </div>
      {art === 'sheet' && <BannerArtView art={art} n={proposals.length} />}
      <a className="pb__go" href="#/requests?filter=decision">
        Go to requests <ArrowRight size={15} />
      </a>
      <button type="button" className="pb__close" onClick={() => setClosed(true)} aria-label="Close">
        <X size={16} strokeWidth={1.8} />
      </button>
    </section>
  );
}

export type ReqsLook = 'side' | 'status' | 'alert' | 'figures' | 'cards' | 'board' | 'table' | 'banner' | 'summary';

export function MainSide({
  m,
  reqs = 'side',
  bannerArt = 'sheet',
  progress = 'rows',
  fresh,
  credits,
  team,
  framed,
  reqIcons,
}: {
  m: Model;
  reqs?: ReqsLook;
  bannerArt?: BannerArt;
  progress?: ProgressLook;
  /** A new client: nothing from Spark yet (demo only). */
  fresh?: boolean;
  /** Overrides the balance (demo only), e.g. to show it running low. */
  credits?: { left: number; total: number };
  /** The client's own team under the description (demo: #/demo/home-hero). */
  team?: boolean;
  /** The company's header (cover to requests) in one card with a stroke (demo: #/demo/home-hero). */
  framed?: boolean | 'divider' | 'split';
  /** The marks in the requests block (demo: emoji). */
  reqIcons?: ReqIcons;
}) {
  // "Company profile" in the account menu opens Home on the profile tab (#/?show=company).
  const { query } = useRoute();
  const [tab, setTab] = useState<'overview' | 'profile'>(query.get('show') === 'company' ? 'profile' : 'overview');
  // The chat drawer, empty from Ask Spark or with a question already written from an issue.
  const [chat, setChat] = useState<{ initial?: string } | null>(null);
  useEffect(() => {
    if (query.get('show') === 'company') setTab('profile');
  }, [query]);
  const b = m.brand;

  // Overview, after the call of 23 Oct: Spark's work at a glance. Where Spark thinks the company has
  // issues (the lead finding of each analysis; each opens its analysis page), then what Spark sent most
  // recently. The company's details live on their own tab; what waits on the client sits above the tabs.
  const overview = (
    <>
      {reqs !== 'summary' && progress === 'line' && <InProgress m={m} look="line" />}
      <section className="hl-issues">
        <SectionHead title="Where we think you have issues" />
        {m.analyses.length ? (
          <ol className="hl-issues__list">
            {m.analyses.map((a) => {
              const f = a.findings.find((x) => x.issue) ?? a.findings[0];
              const I = ANALYSIS_ICON[a.kind];
              const kind = a.title.replace(' analysis', '');
              return (
                <li key={a.id}>
                  {/* The whole card opens the analysis (the title's link covers it); asking Spark to fix an
                      issue happens there, next to each finding. */}
                  <div className="hl-issue">
                    <span className="hl-issue__src">
                      <I size={12} strokeWidth={1.8} /> {kind}
                    </span>
                    <b>
                      <a className="hl-issue__link" href={`#/analysis/${a.kind}`}>
                        {f.title}
                      </a>
                    </b>
                    <span className="hl-issue__body">{f.body}</span>
                    <ArrowRight size={15} className="hl-issue__arrow" aria-hidden />
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <NoAnalysis />
        )}
      </section>
      {reqs !== 'summary' && progress !== 'line' && <InProgress m={m} look={progress} />}
      <LatestFromSpark empty={fresh} />
    </>
  );

  return (
    <div className="hl hl--mainside hl--profile">
      {/* A profile page, after the client's reference: a cover in the brand's light (Noor, darkening to Ink
          at its foot), the company's avatar over its edge, the name with the credits and the positioning
          under the avatar, New chat on the right, then tabs. */}
      <header className={cx('hl-hero', framed && 'hl-hero--framed', framed === 'divider' && 'hl-hero--divider', framed === 'split' && 'hl-hero--split')}>
        <div className="hl-hero__card">
          <div className="hl-hero__band" />
          <CompanyAvatar />
          {/* The name and the positioning under it; the credits and New chat at the top right. */}
          <div className="hl-hero__meta">
            <div className="hl-hero__text">
              <h1 className="hl-hero__title">{b.name}</h1>
              <p>
                {b.positioning}
                <br />
                {b.reach}
              </p>
              {team && <TeamLine />}
            </div>
            {/* Top right, level with the name: the credits, then Ask Spark with the mascot (it opens the chat
              drawer; sending moves on to Chats). */}
            <div className="hl-hero__actions">
              <CreditsIndicator balance={credits} />
              <button type="button" className="hl-mchat" onClick={() => setChat({})}>
                <Mascot size={28} />
                Ask Spark
              </button>
            </div>
          </div>
          {/* What waits on the client, between the company and its tabs: it's about the whole account, so it
            shows on every tab. */}
          {reqs === 'summary' && framed !== 'split' && (
            <div className="hl-hero__alert">
              <RequestsSummary m={m} icons={reqIcons} />
            </div>
          )}
          {reqs !== 'side' && reqs !== 'summary' && (
            <div className="hl-hero__alert">
              <RequestsDash m={m} look={reqs} art={bannerArt} />
            </div>
          )}
        </div>
        {/* Split: the requests in a card of their own under the company's. */}
        {reqs === 'summary' && framed === 'split' && (
          <div className="hl-hero__alert hl-hero__reqcard">
            <RequestsSummary m={m} icons={reqIcons} />
          </div>
        )}
        <nav className="hl-tabs" aria-label="Home sections">
          {(
            [
              ['overview', 'Overview'],
              ['profile', 'Company profile'],
            ] as const
          ).map(([k, label]) => (
            <button key={k} type="button" className={cx(tab === k && 'is-on')} aria-current={tab === k ? 'page' : undefined} onClick={() => setTab(k)}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className={cx('hl-ms', reqs !== 'side' && 'hl-ms--full')}>
        <div className="hl-ms__main">
          {tab === 'overview' && overview}
          {tab === 'profile' && (
            <section className="hl-details hl-details--full">
              <SectionHead title="Company profile">
                <span className="hl-muted">Kept by Spark · updated {fmtDate(b.updatedAt)}</span>
              </SectionHead>
              <Facts all profile />
            </section>
          )}
        </div>

        {reqs === 'side' && (
          <aside className="hl-ms__side">
            {/* Requests in one card with two tabs: what needs a decision, then what's with Spark. */}
            <RequestsCard m={m} />
          </aside>
        )}
      </div>
      <ChatDrawer open={!!chat} initial={chat?.initial} onClose={() => setChat(null)} />
    </div>
  );
}

// ---- Home ----------------------------------------------------------------------------------------

/** The Home page: layout D (Profile), with the analyses Spark prepared. Above the issues, only the banner
 *  about what waits on the client (picked on #/demo/home-requests); the rest of the requests live on Requests. */
export function HomePage() {
  return <MainSide m={useModel(seedAnalyses)} reqs="summary" team framed="split" reqIcons="emoji" />;
}

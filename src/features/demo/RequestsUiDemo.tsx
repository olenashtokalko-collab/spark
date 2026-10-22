// Prototype-only page (#/demo/requests-ui): other ways the Requests page could look, quieter and more
// minimal (after the reference: a small title, one grey line, plain rows on hairlines, lots of air).
// Real requests from the store; the rows open the real request pages.
import { useState } from 'react';
import { BarChart3, Camera, FileText, Lightbulb, Megaphone, MoreHorizontal, Palette, Plus, Search, SlidersHorizontal, type LucideIcon } from 'lucide-react';
import { latestProposal, proposalTotal, useStore } from '../../state/store';
import { isOpen, requestStatusMeta } from '../../components/domain';
import { Button, PageHeader, cx } from '../../components/ui/primitives';
import { aed, fmtRelative } from '../../lib/format';
import type { RequestType, WorkRequest } from '../../data/types';

type Variant = 'quiet' | 'two-line' | 'grouped' | 'centered' | 'left';
type Tab = 'all' | 'decision' | 'active' | 'closed';

const TYPE_ICON: Record<RequestType, LucideIcon> = {
  Strategy: Lightbulb,
  Creative: Palette,
  Content: FileText,
  Research: BarChart3,
  Social: Megaphone,
  Other: Camera,
};

/** Status as a coloured dot and a word: no filled pill. */
function Status({ r }: { r: WorkRequest }) {
  const onYou = r.status === 'proposal' || (r.nextStep?.onClient && r.status !== 'delivered' && r.status !== 'declined');
  const label = r.status === 'proposal' ? requestStatusMeta.proposal.label : onYou ? 'Needs your feedback' : requestStatusMeta[r.status].label;
  return (
    <span className={cx('rq-st', onYou && 'is-you')}>
      <span className={cx('rq-st__dot', `rstatus--${onYou ? 'you' : r.status}`)} />
      {label}
    </span>
  );
}

function useLists() {
  const { state } = useStore();
  const decision = (r: WorkRequest) => r.status === 'proposal' || !!(r.nextStep?.onClient && isOpen(r.status));
  const sorted = [...state.requests].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return {
    state,
    all: sorted,
    decision: sorted.filter(decision),
    active: sorted.filter((r) => isOpen(r.status) && !decision(r)),
    closed: sorted.filter((r) => !isOpen(r.status)),
  };
}

function Head({ compact }: { compact?: boolean }) {
  return (
    <div className={cx('rq-head', compact && 'rq-head--compact')}>
      <div>
        <h2 className="rq-head__title">Requests</h2>
        <p className="rq-head__sub">Ask Spark for new work and follow it to delivery.</p>
      </div>
      <div className="rq-head__acts">
        <button className="rq-text-btn">Start a chat</button>
        <Button size="sm" variant="primary" icon={Plus}>
          New request
        </Button>
      </div>
    </div>
  );
}

function TextTabs({ value, onChange, counts }: { value: Tab; onChange: (t: Tab) => void; counts: Record<Tab, number> }) {
  const items: [Tab, string][] = [
    ['all', 'All'],
    ['decision', 'Needs you'],
    ['active', 'In progress'],
    ['closed', 'Closed'],
  ];
  return (
    <div className="rq-tabs" role="tablist">
      {items.map(([v, label]) => (
        <button key={v} role="tab" aria-selected={value === v} className={cx(value === v && 'is-on')} onClick={() => onChange(v)}>
          {label}
          <span>{counts[v]}</span>
        </button>
      ))}
    </div>
  );
}

function Tools() {
  return (
    <div className="rq-tools">
      <span className="rq-search">
        <Search size={15} /> Search
      </span>
      <button className="rq-icon-btn" aria-label="Filters">
        <SlidersHorizontal size={16} />
      </button>
    </div>
  );
}

// ---- 1 · Quiet list: one line per request, hairlines, no box, no pills ----------------------------
function Quiet() {
  const L = useLists();
  const [tab, setTab] = useState<Tab>('all');
  return (
    <>
      <Head />
      <div className="rq-bar">
        <TextTabs value={tab} onChange={setTab} counts={{ all: L.all.length, decision: L.decision.length, active: L.active.length, closed: L.closed.length }} />
        <Tools />
      </div>
      <div className="rq-list">
        {L[tab].map((r) => {
          const p = latestProposal(L.state, r.id);
          return (
            <a key={r.id} className="rq-row" href={`#/requests/${r.id}`}>
              <span className="rq-row__id">{r.id}</span>
              <span className="rq-row__title">{r.title}</span>
              <span className="rq-row__type">{r.type}</span>
              <Status r={r} />
              <span className="rq-row__amt">{p ? aed(proposalTotal(p)) : ''}</span>
              <span className="rq-row__when">{fmtRelative(r.updatedAt)}</span>
            </a>
          );
        })}
      </div>
    </>
  );
}

// ---- 2 · Two-line rows: the title first, everything else in one grey line -------------------------
function TwoLine() {
  const L = useLists();
  const [tab, setTab] = useState<Tab>('all');
  return (
    <>
      <Head />
      <div className="rq-bar">
        <TextTabs value={tab} onChange={setTab} counts={{ all: L.all.length, decision: L.decision.length, active: L.active.length, closed: L.closed.length }} />
        <Tools />
      </div>
      <div className="rq-list">
        {L[tab].map((r) => {
          const p = latestProposal(L.state, r.id);
          return (
            <a key={r.id} className="rq-row2" href={`#/requests/${r.id}`}>
              <span className="rq-row2__main">
                <span className="rq-row2__title">{r.title}</span>
                <span className="rq-row2__meta">
                  {r.id} · {r.type} · updated {fmtRelative(r.updatedAt)}
                  {p ? ` · ${aed(proposalTotal(p))}` : ''}
                </span>
              </span>
              <Status r={r} />
              <MoreHorizontal size={16} className="rq-row2__more" />
            </a>
          );
        })}
      </div>
    </>
  );
}

// ---- 3 · Grouped by what needs you: no tabs; what's on you first, closed folded away --------------
function Grouped() {
  const L = useLists();
  const [showClosed, setShowClosed] = useState(false);
  const group = (label: string, list: WorkRequest[], note?: string) =>
    list.length > 0 && (
      <section className="rq-group">
        <div className="rq-group__head">
          <span className="rq-group__label">{label}</span>
          <span className="rq-group__n">{list.length}</span>
          {note && <span className="rq-group__note">{note}</span>}
        </div>
        <div className="rq-list">
          {list.map((r) => {
            const p = latestProposal(L.state, r.id);
            return (
              <a key={r.id} className="rq-row rq-row--grouped" href={`#/requests/${r.id}`}>
                <span className="rq-row__id">{r.id}</span>
                <span className="rq-row__title">{r.title}</span>
                <span className="rq-row__type">{r.type}</span>
                <Status r={r} />
                <span className="rq-row__amt">{p ? aed(proposalTotal(p)) : ''}</span>
                <span className="rq-row__when">{fmtRelative(r.updatedAt)}</span>
              </a>
            );
          })}
        </div>
      </section>
    );
  return (
    <>
      <div className="rq-head">
        <div>
          <h2 className="rq-head__title">Requests</h2>
          <p className="rq-head__sub">What needs you comes first. Everything else follows by date.</p>
        </div>
        <div className="rq-head__acts">
          <Tools />
          <Button size="sm" variant="primary" icon={Plus}>
            New request
          </Button>
        </div>
      </div>
      {group('Needs you', L.decision, 'A proposal or a question from Spark')}
      {group('In progress', L.active)}
      {L.closed.length > 0 && (
        <button className="rq-fold" onClick={() => setShowClosed((o) => !o)}>
          {showClosed ? 'Hide' : 'Show'} {L.closed.length} closed
        </button>
      )}
      {showClosed && group('Closed', L.closed)}
    </>
  );
}

// ---- 4 · Centred column: after the reference's empty page, one calm column with an icon per row ----
function Centered({ left }: { left?: boolean }) {
  const L = useLists();
  const [tab, setTab] = useState<Tab>('all');
  return (
    <>
      <Head compact />
      <div className={cx('rq-centre', left && 'rq-centre--left')}>
        {L.decision.length > 0 && (
          <div className="rq-callout">
            <b>{L.decision.length === 1 ? 'One request needs you' : `${L.decision.length} requests need you`}</b>
            <span>{L.decision.map((r) => r.title).join(' · ')}</span>
          </div>
        )}
        <TextTabs value={tab} onChange={setTab} counts={{ all: L.all.length, decision: L.decision.length, active: L.active.length, closed: L.closed.length }} />
        <div className="rq-list rq-list--centre">
          {L[tab].map((r) => {
            const I = TYPE_ICON[r.type] ?? FileText;
            return (
              <a key={r.id} className="rq-row3" href={`#/requests/${r.id}`}>
                {!left && (
                  <span className="rq-row3__icon">
                    <I size={16} strokeWidth={1.7} />
                  </span>
                )}
                <span className="rq-row3__title">{r.title}</span>
                {/* Full width: the icon belongs to the type, so it sits beside the type's name. */}
                {left && (
                  <span className="rq-row3__type">
                    <I size={15} strokeWidth={1.7} />
                    {r.type}
                  </span>
                )}
                <Status r={r} />
                <span className="rq-row3__when">{fmtRelative(r.updatedAt)}</span>
              </a>
            );
          })}
        </div>
        <p className={cx('rq-foot', left && 'rq-foot--left')}>Start a chat with Spark and turn an answer into a request.</p>
      </div>
    </>
  );
}

const VARIANTS: { v: Variant; label: string; note: string }[] = [
  { v: 'quiet', label: '1 · Quiet list', note: 'A small title and one grey line. Text tabs, search and filters folded into two quiet controls. One line per request on hairlines: no box round the table, no column headers, the status as a dot and a word instead of a filled pill.' },
  { v: 'two-line', label: '2 · Two-line rows', note: 'The title leads each row; ID, type, date and amount sit in one grey line below it. The status on the right. Easier to scan by name.' },
  { v: 'grouped', label: '3 · Grouped', note: 'No tabs: what needs you comes first, then what’s in progress; closed requests are folded away behind one link.' },
  { v: 'centered', label: '4 · Centred column', note: 'After the reference: one calm centred column, an icon per request type, hairlines between rows, and a short note when something needs you.' },
  { v: 'left', label: '5 · Full width', note: 'Variant 4 across the page, aligned left: the note when something needs you, text tabs, the request type with its icon beside the title, hairlines between rows.' },
];

export function RequestsUiDemo() {
  const [v, setV] = useState<Variant>('quiet');
  const cur = VARIANTS.find((x) => x.v === v)!;
  return (
    <div className="cdemo rqd">
      <PageHeader title="Requests · other looks" sub="Quieter takes on the Requests page, after the reference: small title, plain rows, more air. Real requests; rows open the real pages." />
      <div className="fdm-switch">
        {VARIANTS.map((x) => (
          <button key={x.v} className={cx(v === x.v && 'is-on')} onClick={() => setV(x.v)}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{cur.note}</p>
      <div className="rq-frame">
        {v === 'quiet' && <Quiet />}
        {v === 'two-line' && <TwoLine />}
        {v === 'grouped' && <Grouped />}
        {v === 'centered' && <Centered />}
        {v === 'left' && <Centered left />}
      </div>
    </div>
  );
}

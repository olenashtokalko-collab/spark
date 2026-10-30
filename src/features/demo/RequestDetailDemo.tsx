// Prototype-only page (#/demo/request-detail): the request page as it is now, beside three looks that make it
// consistent with the Requests table and the guidelines: one card recipe, mono labels (p. 32), Ember for what
// waits on the client and nothing amber (p. 31), the deadline beside the decision, dates in one format.
// Shown on REQ-100 (a proposal waiting on the client).
import { useState } from 'react';
import { ArrowLeft, BadgeCheck, Check, Clock, FileText, Hammer, PackageCheck, ScanSearch, Send } from 'lucide-react';
import { latestProposal, personById, proposalTotal, proposalWeeks, useStore } from '../../state/store';
import { Avatar, PageHeader, cx } from '../../components/ui/primitives';
import { RequestStatus, STAGES, STAGE_INFO, stageIndex } from '../../components/domain';
import { aed, daysUntil, fmtDate } from '../../lib/format';
import { TYPE_ICON } from '../requests/CreateRequestDialog';
import { RequestDetail } from '../requests/RequestDetail';
import type { Proposal, WorkRequest } from '../../data/types';

type V = 'now' | 'tidy' | 'band' | 'single';
const VARIANTS: { v: V; label: string; note: string }[] = [
  {
    v: 'now',
    label: 'Now',
    note: 'The page as it is: three card looks, three label looks, the deadline in amber in the side card, away from the button.',
  },
  {
    v: 'tidy',
    label: 'A · Tidy',
    note: 'The same layout, made consistent: one card (white, hairline, no shadow), mono labels on every card, the deadline in Ember beside Review & decide, done stages ticked, Details on hairlines with the type icon.',
  },
  {
    v: 'band',
    label: 'B · Decision first',
    note: 'What waits on the client opens the page: one Ember band under the title with the deadline and the button. Below it no cards at all: sections on hairlines with mono labels, as the Requests table.',
  },
  {
    v: 'single',
    label: 'C · One column',
    note: 'No side column: the stages as one line under the title, the proposal as the one card with its decision, then the request and its details as a framed table like Requests.',
  },
];

const STAGE_ICONS = [Send, ScanSearch, FileText, BadgeCheck, Hammer, PackageCheck];

/** The deadline in one format: "11 days overdue · was due 18 Oct", or "Due 18 Oct · in 3 days". */
function deadline(iso: string) {
  const n = daysUntil(iso);
  if (n < 0)
    return {
      late: true,
      text: `${-n} day${n === -1 ? '' : 's'} overdue · was due ${fmtDate(iso)}`,
    };
  if (n === 0) return { late: false, text: 'Due today' };
  return {
    late: false,
    text: `Due ${fmtDate(iso)} · in ${n} day${n === 1 ? '' : 's'}`,
  };
}

function Head({ r, tabs = true, under }: { r: WorkRequest; tabs?: boolean; under?: React.ReactNode }) {
  return (
    <>
      <a className="back" href="#/requests">
        <ArrowLeft size={15} /> Requests
      </a>
      <header className="rdv-head">
        <div className="rdv-head__top">
          <span className="rdv-id">{r.id}</span>
          <RequestStatus status={r.status} />
        </div>
        <h1 className="rdv-head__title">{r.title}</h1>
      </header>
      {under}
      {tabs && (
        <div className="rdv-tabs" role="tablist">
          {[
            ['Overview', undefined],
            ['Messages', undefined],
            ['Files', undefined],
            ['Activity', r.activity.length],
          ].map(([l, n], i) => (
            <button key={l as string} role="tab" aria-selected={i === 0} className={cx(i === 0 && 'is-on')}>
              {l}
              {n !== undefined && <span>{n}</span>}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function Nums({ p }: { p: Proposal }) {
  return (
    <div className="rdv-nums">
      <div>
        <b>{aed(proposalTotal(p))}</b>
        <span>Investment, excl. VAT</span>
      </div>
      <div>
        <b>{proposalWeeks(p)} weeks</b>
        <span>from {fmtDate(p.startDate)}</span>
      </div>
      <div>
        <b>{p.scope.length}</b>
        <span>workstreams</span>
      </div>
    </div>
  );
}

/** Review & decide with its deadline beside it: the one place the client acts. */
function Decide({ r }: { r: WorkRequest }) {
  const d = r.nextStep?.onClient ? deadline(r.nextStep.date) : undefined;
  return (
    <div className="rdv-decide">
      <a className="btn btn--md btn--primary" href={`#/requests/${r.id}/proposal`}>
        Review & decide
      </a>
      {d && (
        <span className={cx('rdv-due', d.late && 'is-late')}>
          <Clock size={14} /> {d.text}
        </span>
      )}
    </div>
  );
}

function Stages({ r }: { r: WorkRequest }) {
  const idx = stageIndex(r.status);
  return (
    <ol className="rdv-stg">
      {STAGES.map((s, i) => {
        const st = i < idx ? 'done' : i === idx ? 'current' : 'todo';
        const I = st === 'done' ? Check : STAGE_ICONS[i];
        return (
          <li key={s} className={`is-${st}`}>
            <span className="rdv-stg__mark">
              <I size={14} strokeWidth={st === 'done' ? 2.4 : 1.8} />
            </span>
            <div>
              <div className="rdv-stg__label">{s}</div>
              {st !== 'done' && <div className="rdv-stg__info">{STAGE_INFO[s]}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Details({ r }: { r: WorkRequest }) {
  const { state } = useStore();
  const creator = personById(state, r.createdBy);
  const I = TYPE_ICON[r.type];
  const rows: [string, React.ReactNode][] = [
    [
      'Requested by',
      <>
        <Avatar person={creator} size={20} /> {creator.name}
      </>,
    ],
    ['Created', fmtDate(r.createdAt)],
    [
      'Type',
      <>
        <I size={15} strokeWidth={1.7} /> {r.type}
      </>,
    ],
    ['Timing', r.timing],
    ...(r.budget ? [['Budget', r.budget] as [string, React.ReactNode]] : []),
  ];
  return (
    <dl className="rdv-dl">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Tidy({ r, p }: { r: WorkRequest; p: Proposal }) {
  const idx = stageIndex(r.status);
  return (
    <div className="req-detail">
      <Head r={r} />
      <div className="req-layout rdv-layout">
        <div className="req-main">
          <section className="rdv-card">
            <span className="rdv-label">Your request</span>
            <p className="rdv-text">{r.description}</p>
          </section>
          <section className="rdv-card">
            <span className="rdv-label rdv-label--you">Proposal · your decision</span>
            <Nums p={p} />
            <p className="rdv-text">{p.summary}</p>
            <Decide r={r} />
          </section>
        </div>
        <aside className="req-side">
          <section className="rdv-card">
            <div className="rdv-card__head">
              <span className="rdv-label">Stages</span>
              <span className="rdv-count">
                {idx + 1} of {STAGES.length}
              </span>
            </div>
            <Stages r={r} />
          </section>
          <section className="rdv-card">
            <span className="rdv-label">Details</span>
            <Details r={r} />
          </section>
        </aside>
      </div>
    </div>
  );
}

function Band({ r, p }: { r: WorkRequest; p: Proposal }) {
  const idx = stageIndex(r.status);
  const d = r.nextStep?.onClient ? deadline(r.nextStep.date) : undefined;
  return (
    <div className="req-detail">
      <Head r={r} />
      {d && (
        <div className="rdv-band">
          <div>
            <b>{r.nextStep!.label}</b>
            <span className={cx(d.late && 'is-late')}>{d.text}</span>
          </div>
          <a className="btn btn--md btn--primary" href={`#/requests/${r.id}/proposal`}>
            Review & decide
          </a>
        </div>
      )}
      <div className="req-layout rdv-layout">
        <div className="req-main rdv-flat">
          <section>
            <span className="rdv-label">Proposal</span>
            <Nums p={p} />
            <p className="rdv-text">{p.summary}</p>
          </section>
          <section>
            <span className="rdv-label">Your request</span>
            <p className="rdv-text">{r.description}</p>
          </section>
        </div>
        <aside className="req-side rdv-flat">
          <section>
            <div className="rdv-card__head">
              <span className="rdv-label">Stages</span>
              <span className="rdv-count">
                {idx + 1} of {STAGES.length}
              </span>
            </div>
            <Stages r={r} />
          </section>
          <section>
            <span className="rdv-label">Details</span>
            <Details r={r} />
          </section>
        </aside>
      </div>
    </div>
  );
}

function Single({ r, p }: { r: WorkRequest; p: Proposal }) {
  const idx = stageIndex(r.status);
  return (
    <div className="req-detail rdv-single">
      <Head
        r={r}
        under={
          <ol className="rdv-line" aria-label="Stages">
            {STAGES.map((s, i) => (
              <li key={s} className={cx(i < idx && 'is-done', i === idx && 'is-current')}>
                <span className="rdv-line__bar" />
                <span className="rdv-line__label">
                  {i < idx && <Check size={12} strokeWidth={2.6} />}
                  {s}
                </span>
              </li>
            ))}
          </ol>
        }
      />
      <section className="rdv-card">
        <span className="rdv-label rdv-label--you">Proposal · your decision</span>
        <Nums p={p} />
        <p className="rdv-text">{p.summary}</p>
        <Decide r={r} />
      </section>
      <section className="rdv-flat">
        <section>
          <span className="rdv-label">Your request</span>
          <p className="rdv-text">{r.description}</p>
        </section>
      </section>
      <section>
        <span className="rdv-label rdv-label--pad">Details</span>
        <div className="rdv-frame">
          <Details r={r} />
        </div>
      </section>
    </div>
  );
}

export function RequestDetailDemo() {
  const { state } = useStore();
  const [v, setV] = useState<V>('tidy');
  const cur = VARIANTS.find((x) => x.v === v)!;
  const r = state.requests.find((x) => x.id === 'REQ-100')!;
  const p = latestProposal(state, r.id)!;
  return (
    <div className="cdemo">
      <PageHeader
        title="Request page · consistency"
        sub="The request page now, and three looks that match the Requests table and the guidelines. Shown on REQ-100. Prototype only."
      />
      <div className="fdm-switch">
        {VARIANTS.map((x) => (
          <button key={x.v} className={cx(v === x.v && 'is-on')} onClick={() => setV(x.v)}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{cur.note}</p>
      <div className="rdv-stage">
        {v === 'now' && <RequestDetail id={r.id} />}
        {v === 'tidy' && <Tidy r={r} p={p} />}
        {v === 'band' && <Band r={r} p={p} />}
        {v === 'single' && <Single r={r} p={p} />}
      </div>
    </div>
  );
}

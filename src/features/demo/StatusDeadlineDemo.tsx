// Prototype-only page (#/demo/status-deadline): statuses and stages in one vocabulary, and
// four ways to show the manager how long they have to send the proposal, while the request is
// New (nothing done yet) or In review (a draft started).
import { useState, type ReactNode } from 'react';
import { Clock } from 'lucide-react';
import { Button, PageHeader, Segmented, Tabs, cx } from '../../components/ui/primitives';
import { DocFlat, DraftFlat } from '../spark/SentIcons';

type Moment = 'new' | 'review';
type Urgency = 'plenty' | 'soon' | 'overdue';

const DUE: Record<Urgency, { short: string; long: string; send: string; tone: string }> = {
  plenty: { short: 'Proposal due in 3 days', long: 'Due Tue 20 Oct · in 3 days', send: 'Send by Tue 20 Oct', tone: 'calm' },
  soon: { short: 'Proposal due tomorrow', long: 'Due Sun 18 Oct · tomorrow', send: 'Send by tomorrow, Sun 18 Oct', tone: 'soon' },
  overdue: { short: 'Proposal 3 days overdue', long: 'Due Sat 17 Oct · 3 days overdue', send: 'Was due Sat 17 Oct · 3 days overdue', tone: 'late' },
};

/** One vocabulary: the status in the header is always the stage that is active on the right. */
const STAGES = [
  { id: 'new', label: 'New', info: 'The request just came in. Nothing sent to the client yet.' },
  { id: 'review', label: 'In review', info: 'You are scoping the work and writing the proposal.' },
  { id: 'sent', label: 'Proposal sent', info: 'Waiting for the client to approve, ask for changes or decline.' },
  { id: 'approved', label: 'Approved', info: 'Schedule the kick-off.' },
  { id: 'progress', label: 'In progress', info: 'Work on the deliverables.' },
  { id: 'delivered', label: 'Delivered', info: 'Final files land in the client’s Documents.' },
];

const VARIANTS = [
  { id: 'chip', name: 'A · In the status badge', note: 'The deadline joins the status in one badge: “New · Proposal due in 3 days”. One thing to read; the badge takes the urgency’s colour.' },
  { id: 'pill', name: 'B · A deadline pill next to the status', note: 'The status stays as it is; a separate pill with a clock says how long is left, grey, then amber, then red.' },
  { id: 'block', name: 'C · In the proposal block', note: 'The header keeps only the status. The deadline sits where the manager acts: under “Create proposal”, next to Create.' },
  { id: 'both', name: 'D · Pill and proposal block (recommended)', note: 'B and C together: the pill gives urgency at a glance, the block repeats the date by the button. Stages say “Send a proposal by…”.' },
] as const;
type Id = (typeof VARIANTS)[number]['id'];

function Status({ moment, deadline }: { moment: Moment; deadline?: Urgency }) {
  const label = moment === 'new' ? 'New' : 'In review';
  return (
    <span className={cx('rstatus', moment === 'new' ? 'rstatus--you' : 'rstatus--in_review', deadline && `sdd-chip sdd-chip--${DUE[deadline].tone}`)}>
      <span className="rstatus__dot" />
      {label}
      {deadline && <span className="sdd-chip__due">· {DUE[deadline].short}</span>}
    </span>
  );
}

function DuePill({ u }: { u: Urgency }) {
  return (
    <span className={cx('sdd-pill', `sdd-pill--${DUE[u].tone}`)}>
      <Clock size={13} /> {DUE[u].short}
    </span>
  );
}

function ProposalBlock({ moment, u, withDue }: { moment: Moment; u: Urgency; withDue: boolean }) {
  const due = withDue ? <span className={cx('sdd-due', `sdd-due--${DUE[u].tone}`)}>{DUE[u].send}</span> : null;
  return moment === 'new' ? (
    <div className="ask-empty">
      <DocFlat />
      <div>
        <div className="ask-empty__title">Create proposal</div>
        <div className="faint">
          Scope, timeline and price in one place.
          {due && <> {due}</>}
        </div>
      </div>
      <Button size="sm" variant="primary">
        Create
      </Button>
    </div>
  ) : (
    <div className="ask-empty">
      <DraftFlat />
      <div>
        <div className="ask-empty__title">Proposal draft</div>
        <div className="faint">
          2 of 6 sections ready
          {due && <> · {due}</>}
        </div>
      </div>
      <Button size="sm">Edit</Button>
    </div>
  );
}

function Stages({ moment, u, sendBy }: { moment: Moment; u: Urgency; sendBy: boolean }) {
  const at = moment === 'new' ? 0 : 1;
  return (
    <section className="sdd-stages">
      <div className="sdd-stages__head">
        Stages <span className="faint">{at + 1} of 6</span>
      </div>
      {STAGES.map((s, i) => (
        <div key={s.id} className={cx('sdd-stage', i < at && 'is-done', i === at && 'is-current')}>
          <i className="sdd-stage__mark" />
          <div>
            <div className="sdd-stage__label">{s.label}</div>
            {i === at && (
              <>
                <div className="sdd-stage__info">{s.info}</div>
                <div className={cx('sdd-due', `sdd-due--${DUE[u].tone}`)}>
                  <Clock size={12} /> {sendBy ? `Send a proposal by ${DUE[u].long.replace('Due ', '')}` : DUE[u].long}
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}

function Mock({ id, moment, u }: { id: Id; moment: Moment; u: Urgency }) {
  const right: ReactNode = id === 'chip' ? <Status moment={moment} deadline={u} /> : (
    <>
      <Status moment={moment} />
      {(id === 'pill' || id === 'both') && <DuePill u={u} />}
    </>
  );
  return (
    <div className="sdd-page">
      <div className="sdd-main">
        <div className="req-head__row">
          <h1 className="req-head__title sdd-title">New idea for the Riyadh launch</h1>
          {right}
        </div>
        <div className="req-meta">
          <span>
            Client: <b>Brand Co.</b>
          </span>
          <span className="req-meta__sep" aria-hidden />
          <span>
            Request: <b>REQ-116</b>
          </span>
          <span className="req-meta__sep" aria-hidden />
          <span>
            Type: <b>Strategy</b>
          </span>
        </div>
        <div className="sdd-gap" />
        <ProposalBlock moment={moment} u={u} withDue={id === 'block' || id === 'both'} />
      </div>
      <Stages moment={moment} u={u} sendBy={id === 'both' || id === 'block'} />
    </div>
  );
}

export function StatusDeadlineDemo() {
  const [moment, setMoment] = useState<Moment>('new');
  const [u, setU] = useState<Urgency>('overdue');
  return (
    <div className="cdemo cmddemo">
      <PageHeader
        title="Status, stages and time to send the proposal"
        sub="Statuses and stages now use the same words (New → In review → Proposal sent → Approved…). Four ways to show the manager how long is left to send the proposal."
      />
      <div className="psn-controls">
        <Tabs
          className="tabs--underline"
          value={moment}
          onChange={setMoment}
          items={[
            { value: 'new', label: 'New · nothing started' },
            { value: 'review', label: 'In review · draft started' },
          ]}
        />
        <Segmented
          label="Time left"
          value={u}
          onChange={setU}
          items={[
            { value: 'plenty', label: '3 days left' },
            { value: 'soon', label: 'Tomorrow' },
            { value: 'overdue', label: 'Overdue' },
          ]}
        />
      </div>
      <div className="psd-list sdd-list">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className="cmddemo__stage psd-stage">
              <Mock id={v.id} moment={moment} u={u} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

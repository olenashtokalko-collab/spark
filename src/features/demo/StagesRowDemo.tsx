// Prototype-only page (#/demo/stages-row): the request page with the stages across the top,
// the proposal under them, then the tabs. Four livelier looks for the stages, each carrying the
// time left to send the proposal.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Clock, FileText, Hammer, Package, Search, Send, ThumbsUp } from 'lucide-react';
import { Button, PageHeader, Segmented, Tabs, cx } from '../../components/ui/primitives';
import { FluidOrb } from '../../components/ui/FluidOrb';
import { DocFlat, DraftFlat } from '../spark/SentIcons';

type Moment = 'new' | 'review';
type Urgency = 'plenty' | 'soon' | 'overdue';

/** Days in October: when the request came in, when the proposal is due, and today. */
const TIME: Record<Urgency, { due: number; today: number; tone: string; big: string; small: string; line: string }> = {
  plenty: { due: 20, today: 17, tone: 'calm', big: '3', small: 'days left', line: 'Send a proposal by Tue 20 Oct' },
  soon: { due: 18, today: 17, tone: 'soon', big: '1', small: 'day left', line: 'Send a proposal by tomorrow, Sun 18 Oct' },
  overdue: { due: 17, today: 20, tone: 'late', big: '3', small: 'days overdue', line: 'Send a proposal · was due Sat 17 Oct' },
};
const CREATED = 14;

const STAGES = [
  { label: 'New', icon: FileText },
  { label: 'In review', icon: Search },
  { label: 'Proposal sent', icon: Send },
  { label: 'Approved', icon: ThumbsUp },
  { label: 'In progress', icon: Hammer },
  { label: 'Delivered', icon: Package },
];

const VARIANTS = [
  {
    id: 'tiles',
    name: '1 · Journey tiles',
    note: 'Six small tiles in the flat illustration style. Done ones carry a navy tick badge (like the proposal icons), the current one lifts out as a white card with the deadline, the rest wait in dashed outline.',
  },
  {
    id: 'orb',
    name: '2 · Track with the Spark orb',
    note: 'A track that fills with the brand gradient up to where the request is; the glass orb sits on the current stage and a dark bubble above it says how long is left.',
  },
  {
    id: 'ring',
    name: '3 · Countdown first',
    note: 'The deadline is the hero: a ring that empties as time runs out, the days left (or overdue) in the middle, the stages as a compact row beside it.',
  },
  {
    id: 'timeline',
    name: '4 · Timeline with dates',
    note: 'A strip of days for the New stage: when the request came in, when the proposal is due, and “Today”; time already lost is striped red. Scroll right to see the stages still waiting (Proposal, In progress, Delivered), without dates: how fast the client decides isn’t known.',
  },
] as const;
type Id = (typeof VARIANTS)[number]['id'];

// ---- 1 · journey tiles -----------------------------------------------------------------------

function TilesStages({ at, u }: { at: number; u: Urgency }) {
  const t = TIME[u];
  return (
    <div className="srx-tiles">
      {STAGES.map((s, i) => {
        const Icon = s.icon;
        const state = i < at ? 'done' : i === at ? 'current' : 'todo';
        return (
          <div key={s.label} className={cx('srx-tile', `is-${state}`)}>
            <span className="srx-tile__icon">
              <Icon size={16} strokeWidth={1.9} />
              {state === 'done' && (
                <i className="srx-tile__tick">
                  <Check size={9} strokeWidth={3.4} />
                </i>
              )}
            </span>
            <span className="srx-tile__label">{s.label}</span>
            {state === 'current' && (
              <span className={cx('srx-tile__due', `sdd-due--${t.tone}`)}>
                <Clock size={11} /> {t.big} {t.small}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---- 2 · track with the orb ------------------------------------------------------------------

function OrbStages({ at, u }: { at: number; u: Urgency }) {
  const t = TIME[u];
  const pos = (i: number) => (i / (STAGES.length - 1)) * 100;
  return (
    <div className="srx-orb">
      <div className="srx-orb__rail">
        <div className="srx-orb__fill" style={{ width: `${pos(at)}%` }} />
        {STAGES.map((s, i) => (
          <span key={s.label} className={cx('srx-orb__stop', i < at && 'is-done')} style={{ left: `${pos(i)}%` }} />
        ))}
        <span className="srx-orb__me" style={{ left: `${pos(at)}%` }}>
          <span className={cx('srx-orb__bubble', `is-${t.tone}`, at === 0 && 'is-start')}>
            <Clock size={12} /> {t.big} {t.small}
          </span>
          <FluidOrb size={26} />
        </span>
      </div>
      <div className="srx-orb__labels">
        {STAGES.map((s, i) => (
          <span key={s.label} className={cx(i === at && 'is-current', i < at && 'is-done')} style={{ left: `${pos(i)}%` }}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---- 3 · countdown first ---------------------------------------------------------------------

function RingStages({ at, u }: { at: number; u: Urgency }) {
  const t = TIME[u];
  // How much of the time to the due date is used up (full when overdue).
  const used = Math.min(1, (t.today - CREATED) / (t.due - CREATED));
  const R = 30;
  const C = 2 * Math.PI * R;
  return (
    <div className="srx-ring">
      <div className={cx('srx-ring__dial', `is-${t.tone}`)}>
        <svg viewBox="0 0 76 76" width="76" height="76">
          <circle cx="38" cy="38" r={R} fill="none" stroke="rgba(14,17,22,0.08)" strokeWidth="6" />
          <circle
            cx="38"
            cy="38"
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${C * (1 - used) || 0.001} ${C}`}
            transform="rotate(-90 38 38)"
          />
        </svg>
        <span className="srx-ring__num">
          {t.big}
          <small>{u === 'overdue' ? 'late' : t.big === '1' ? 'day' : 'days'}</small>
        </span>
      </div>
      <div className="srx-ring__text">
        <div className={cx('srx-ring__title', `sdd-due--${t.tone}`)}>
          {t.big} {t.small}
        </div>
        <div className="srx-ring__line">{t.line}</div>
        <div className="srx-mini">
          {STAGES.map((s, i) => (
            <span key={s.label} className={cx('srx-mini__step', i < at && 'is-done', i === at && 'is-current')}>
              <i />
              {i === at && s.label}
            </span>
          ))}
          <span className="srx-mini__count">
            {at + 1} of {STAGES.length}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- 4 · timeline with dates -----------------------------------------------------------------

/** The status inside the New stage: nothing done yet, or a draft started. */
export const flowStatus = (moment: Moment) => (moment === 'new' ? 'New' : 'Drafting proposal');

/** The stages after the proposal: no dates, because nobody knows how fast the client decides. */
const LATER = [
  { label: 'Proposal', note: 'Waiting for the client' },
  { label: 'In progress', note: 'After the client approves' },
  { label: 'Delivered', note: 'When the work is done' },
];

/** Scrolls the timeline sideways: arrows on the sides (only where there is more), drag with the mouse,
 *  or the trackpad. The edges fade where the strip continues. */
function TimelineScroller({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ left: false, right: true });
  const drag = useRef<{ x: number; at: number } | null>(null);
  const update = () => {
    const el = ref.current;
    if (!el) return;
    setEdge({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };
  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const by = (dx: number) => ref.current?.scrollBy({ left: dx, behavior: 'smooth' });
  return (
    <div className={cx('srx-scroll', edge.left && 'has-left', edge.right && 'has-right')}>
      <div
        ref={ref}
        className="srx-tl srx-tl--scroll"
        onScroll={update}
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse') return;
          drag.current = { x: e.clientX, at: ref.current!.scrollLeft };
          ref.current!.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current) ref.current!.scrollLeft = drag.current.at - (e.clientX - drag.current.x);
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        {children}
      </div>
      {edge.left && (
        <button className="srx-scroll__btn srx-scroll__btn--left" onClick={() => by(-260)} aria-label="Scroll the timeline back">
          <ChevronLeft size={16} />
        </button>
      )}
      {edge.right && (
        <button className="srx-scroll__btn srx-scroll__btn--right" onClick={() => by(260)} aria-label="Scroll the timeline forward">
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

function TimelineStages({ u }: { moment: Moment; u: Urgency }) {
  const t = TIME[u];
  // The dated part: the days of the New stage, from the request to a day past the due date or today.
  const from = CREATED - 2; // room for the first label, centred on its day
  const to = Math.max(t.today, t.due) + 1;
  const DAY = 34; // px per day
  const x = (d: number) => (d - from) * DAY;
  const days = Array.from({ length: to - from + 1 }, (_, k) => from + k);
  const dated = x(to);
  const STEP = 230; // px between the undated stages
  const late = t.today > t.due;
  return (
    <TimelineScroller>
      <div className="srx-tl__strip" style={{ width: dated + STEP * LATER.length + 40, ['--dated' as string]: `${dated}px` }}>
        {days.map((d) => (
          <i key={d} className={cx('srx-tl__day', d === t.today && 'is-today')} style={{ left: x(d) }} />
        ))}
        {/* time left (calm) or time lost (red), between today and the due date */}
        {/* Too narrow for words (a day or so): a red warning sign instead, the details on hover. */}
        {(() => {
          const w = Math.abs(x(t.today) - x(t.due));
          const text = late ? `${t.big} days late` : `${t.big} ${t.small}`;
          const tip = late ? `The proposal is ${t.big} days overdue. It was due ${t.due} Oct.` : `${t.big} ${t.small} to send the proposal (due ${t.due} Oct).`;
          return w < 80 ? (
            <span className="srx-tl__warn" style={{ left: x(Math.min(t.today, t.due)) + w / 2 }} data-tip={tip} aria-label={tip}>
              <AlertTriangle size={16} strokeWidth={2.2} />
            </span>
          ) : (
            <span className={cx('srx-tl__band', late ? 'is-late' : `is-${t.tone}`)} style={{ left: x(Math.min(t.today, t.due)), width: w }} data-tip={tip}>
              {text}
            </span>
          );
        })()}
        <span className="srx-tl__mark srx-tl__mark--px" style={{ left: x(CREATED) }}>
          <b>New request</b> 14 Oct
          <i className="srx-tl__dot is-done" />
        </span>
        <span className={cx('srx-tl__mark srx-tl__mark--px srx-tl__mark--due', `sdd-due--${t.tone}`)} style={{ left: x(t.due) }}>
          <b>Proposal due</b> {t.due} Oct
          <i className="srx-tl__dot is-due" />
        </span>
        <span className="srx-tl__today" style={{ left: x(t.today) }}>
          Today
        </span>
        {/* what still waits, undated */}
        <span className="srx-tl__later" style={{ left: dated, width: STEP * LATER.length }} />
        {LATER.map((st, i) => (
          <span key={st.label} className="srx-tl__mark srx-tl__mark--px srx-tl__mark--later" style={{ left: dated + STEP * (i + 0.5) }}>
            <b>{st.label}</b> {st.note}
            <i />
          </span>
        ))}
      </div>
    </TimelineScroller>
  );
}

// ---- Page ------------------------------------------------------------------------------------

function Proposal({ moment }: { moment: Moment }) {
  return moment === 'new' ? (
    <div className="ask-empty">
      <DocFlat />
      <div>
        <div className="ask-empty__title">Create proposal</div>
        <div className="faint">Scope, timeline and price in one place.</div>
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
        <div className="faint">2 of 6 sections ready</div>
      </div>
      <Button size="sm">Edit</Button>
    </div>
  );
}

function Page({ id, moment, u }: { id: Id; moment: Moment; u: Urgency }) {
  const at = moment === 'new' ? 0 : 1;
  const stages: ReactNode =
    id === 'tiles' ? <TilesStages at={at} u={u} /> : id === 'orb' ? <OrbStages at={at} u={u} /> : id === 'ring' ? <RingStages at={at} u={u} /> : <TimelineStages moment={moment} u={u} />;
  return (
    <div className="srd-page">
      <div className="req-head__row">
        <h1 className="req-head__title sdd-title">New idea for the Riyadh launch</h1>
        <span className={cx('rstatus', at === 0 ? 'rstatus--you' : 'rstatus--in_review')}>
          <span className="rstatus__dot" />
          {id === 'timeline' ? flowStatus(moment) : STAGES[at].label}
        </span>
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
      <div className="srx-stages">{stages}</div>
      <Proposal moment={moment} />
      <div className="srd-tabs">
        <Tabs
          className="tabs--underline"
          value="overview"
          onChange={() => {}}
          items={[
            { value: 'overview', label: 'Overview' },
            { value: 'conversation', label: 'Conversation' },
            { value: 'files', label: 'Files' },
            { value: 'activity', label: 'Activity', count: 1 },
          ]}
        />
      </div>
      <div className="srd-ghost">
        <span className="faint">Layla’s request</span>
        <i style={{ width: '70%' }} />
        <i style={{ width: '55%' }} />
      </div>
    </div>
  );
}

export function StagesRowDemo() {
  const [moment, setMoment] = useState<Moment>('new');
  const [u, setU] = useState<Urgency>('overdue');
  return (
    <div className="cdemo cmddemo">
      <PageHeader
        title="Stages across the top"
        sub="The request page with the stages under the title, the proposal under them, then the tabs. Four livelier looks, each carrying the time left to send the proposal."
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
              <Page id={v.id} moment={moment} u={u} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

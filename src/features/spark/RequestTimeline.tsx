// The request's timeline on the Spark request page (from #/demo/stages-row, variant 4): one line
// with a dot for every point. The dated part runs from the request to today (when it came in, the
// proposal sent, the client's answer, the next due date); after it, the stages still waiting sit
// undated, because nobody knows how fast the client decides. It scrolls sideways.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../../components/ui/primitives';
import { fmtDate } from '../../lib/format';
import type { SparkStatus } from './data';

/** A dated point on the line: done (filled), due (ring in the urgency's colour). */
export interface TimelinePoint {
  label: string;
  at: string; // ISO date
  kind: 'done' | 'due';
}

/** The four stages, and which statuses live inside each. */
const STAGES = ['New', 'Proposal', 'In progress', 'Delivered'] as const;
const stageOf = (s: SparkStatus) =>
  s === 'submitted' || s === 'in_review' ? 0 : s === 'proposal' || s === 'changes_requested' || s === 'declined' ? 1 : s === 'approved' || s === 'in_progress' ? 2 : 3;
const WAITING_NOTE: Record<(typeof STAGES)[number], string> = {
  New: 'The request comes in',
  Proposal: 'Waiting for the client',
  'In progress': 'After the client approves',
  Delivered: 'When the work is done',
};

const DAY_MS = 86_400_000;
const dayOf = (iso: string) => Math.floor(new Date(iso.length === 10 ? iso + 'T12:00:00' : iso).getTime() / DAY_MS);

export function RequestTimeline({ status, points }: { status: SparkStatus; points: TimelinePoint[] }) {
  const today = dayOf(new Date().toISOString());
  const days = points.map((p) => dayOf(p.at));
  const from = Math.min(...days, today) - 2;
  const to = Math.max(...days, today) + 1;
  // Fit the dated part into about 520px, no wider than 34px a day, but keep labels at least ~112px apart
  // (the strip scrolls when that makes it longer).
  // (Today's label sits under the line, so only the labelled points above it need the room.)
  const sorted = [...days].sort((a, b) => a - b);
  const gaps = sorted.slice(1).map((d, i) => d - sorted[i]).filter((g) => g > 0);
  const minGap = gaps.length ? Math.min(...gaps) : 1;
  const DAY = Math.min(120, Math.max(112 / minGap, Math.max(8, Math.min(34, 520 / Math.max(1, to - from)))));
  const x = (d: number) => (d - from) * DAY;
  const dated = x(to);
  const STEP = 230;
  // What still waits, undated: the stage under way now (if it's not the Spark team's turn), then the rest.
  const now =
    status === 'proposal'
      ? { label: 'Client decision', note: 'Waiting for the client', current: true }
      : status === 'approved' || status === 'in_progress'
        ? { label: 'In progress', note: status === 'approved' ? 'Kick-off next' : 'Under way', current: true }
        : null;
  const later = [
    ...(now ? [now] : []),
    ...(status === 'declined' ? [] : STAGES.slice(stageOf(status) + 1).map((st) => ({ label: st, note: WAITING_NOTE[st], current: false }))),
  ];
  const due = points.find((p) => p.kind === 'due');
  const dueDay = due ? dayOf(due.at) : undefined;
  const left = dueDay !== undefined ? dueDay - today : undefined;
  const tone = left === undefined ? 'calm' : left < 0 ? 'late' : left <= 1 ? 'soon' : 'calm';

  return (
    <TimelineScroller focus={x(today)}>
      <div className="srx-tl__strip" style={{ width: dated + STEP * later.length + 40 }}>
        {/* time left (calm) or time lost (red), between today and the due date */}
        {dueDay !== undefined && dueDay !== today && <Window x={x} today={today} due={dueDay} left={left!} tone={tone} label={due!.label} dueAt={due!.at} />}
        {points.map((p) => (
          <span
            key={p.label + p.at}
            className={cx('srx-tl__mark srx-tl__mark--px', p.kind === 'due' && `srx-tl__mark--due sdd-due--${tone}`)}
            style={{ left: x(dayOf(p.at)) }}
          >
            <b>{p.label}</b> {fmtDate(p.at)}
            <i className={cx('srx-tl__dot', p.kind === 'due' ? 'is-due' : 'is-done')} />
          </span>
        ))}
        <span className="srx-tl__today" style={{ left: x(today) }}>
          Today
        </span>
        {later.map((st, i) => (
          <span key={st.label} className={cx('srx-tl__mark srx-tl__mark--px srx-tl__mark--later', st.current && 'is-current')} style={{ left: dated + STEP * (i + 0.5) }}>
            <b>{st.label}</b> {st.note}
            <i />
          </span>
        ))}
      </div>
    </TimelineScroller>
  );
}

/** The days between today and the due date: a band with words, or a red sign when it's too narrow. */
function Window({ x, today, due, left, tone, label, dueAt }: { x: (d: number) => number; today: number; due: number; left: number; tone: string; label: string; dueAt: string }) {
  const w = Math.abs(x(today) - x(due));
  const late = left < 0;
  const n = Math.abs(left);
  const text = late ? `${n} ${n === 1 ? 'day' : 'days'} late` : `${n} ${n === 1 ? 'day' : 'days'} left`;
  const tip = late ? `${label}: ${n} ${n === 1 ? 'day' : 'days'} overdue (was due ${fmtDate(dueAt)}).` : `${label}: ${text} (due ${fmtDate(dueAt)}).`;
  return w < 80 ? (
    <span className="srx-tl__warn" style={{ left: x(Math.min(today, due)) + w / 2 }} data-tip={tip} aria-label={tip}>
      <AlertTriangle size={16} strokeWidth={2.2} />
    </span>
  ) : (
    <span className={cx('srx-tl__band', late ? 'is-late' : `is-${tone}`)} style={{ left: x(Math.min(today, due)), width: w }} data-tip={tip}>
      {text}
    </span>
  );
}

/** Scrolls the timeline sideways: arrows on hover (only where there is more), drag with the mouse,
 *  or the trackpad. The edges fade where the strip continues. */
export function TimelineScroller({ children, focus }: { children: ReactNode; focus?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ left: false, right: false });
  const drag = useRef<{ x: number; at: number } | null>(null);
  const update = () => {
    const el = ref.current;
    if (!el) return;
    setEdge({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };
  useEffect(() => {
    // Open with today in view (a little left of the middle), so the news is visible first.
    if (focus !== undefined && ref.current) ref.current.scrollLeft = Math.max(0, focus - ref.current.clientWidth * 0.45);
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

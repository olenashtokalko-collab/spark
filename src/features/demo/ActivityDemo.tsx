// Prototype-only page (#/demo/activity): two looks for the request's Activity tab,
// each after one of the references, on the same sample history (every kind of event,
// over a few days).
//   1 · Icon tiles: soft tiles on a thin line, sentences with the facts in bold,
//       the time beneath, a heading per day.
//   2 · Inline chips (picked, now on the request page): the real ActivityLog.
import { CircleX } from 'lucide-react';
import { PageHeader, cx } from '../../components/ui/primitives';
import { personById, useStore } from '../../state/store';
import type { Activity } from '../../data/types';
import { ActivityLog, activityIcon, byDay, describe, whenLine } from '../requests/RequestDetail';

// ---- Sample history: relative to now, so "Today" and "Yesterday" always exist ----------

const at = (daysAgo: number, h: number, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
};

const SAMPLE: Activity[] = [
  { id: 'x1', at: at(9, 9), by: 'u-layla', kind: 'created', text: 'created this request' },
  { id: 'x2', at: at(8, 10, 30), by: 's-mira', kind: 'status', text: 'started reviewing' },
  { id: 'x3', at: at(5, 11), by: 's-dana', kind: 'proposal', text: 'sent a proposal · AED 96,000 · 8 weeks' },
  { id: 'x4', at: at(4, 15, 20), by: 'u-omar', kind: 'comment', text: 'Can we add a gift card to the first round?' },
  { id: 'x5', at: at(3, 10, 20), by: 'u-layla', kind: 'decision', text: 'approved the proposal' },
  { id: 'x6', at: at(2, 9), by: 's-youssef', kind: 'status', text: 'started work' },
  { id: 'x7', at: at(1, 18), by: 's-youssef', kind: 'file', text: 'shared Packaging concepts — round 1.pdf for your review' },
  { id: 'x8', at: at(1, 18, 5), by: 's-youssef', kind: 'comment', text: 'Round 1 is in Documents. The tote and the gift box are the strongest.' },
  { id: 'x9', at: at(0, 9, 10), by: 'u-layla', kind: 'file', text: 'requested changes to Packaging concepts — round 1.pdf: "Please try a warmer gold on the tote, and keep the Arabic line larger."' },
  { id: 'x10', at: at(0, 9, 12), by: 'u-layla', kind: 'comment', text: 'Thanks, the box is lovely. Gold is the only thing to change.' },
];

const toneOf = (a: Activity) => {
  const d = describe(a);
  return a.kind === 'decision' && d.tone === 'negative' ? 'negative' : d.tone ?? (a.kind === 'proposal' ? 'accent' : 'neutral');
};

// ---- 1 · Icon tiles -----------------------------------------------------------------

function TilesLog({ items }: { items: Activity[] }) {
  const { state } = useStore();
  return (
    <div className="axa">
      {byDay(items).map((g) => (
        <section key={g.key} className="axa__day">
          <h4 className="axa__head">{g.label}</h4>
          <ol className="axa__list">
            {g.items.map((a) => {
              const p = personById(state, a.by);
              const { verb, chips, tail, quote } = describe(a);
              const tone = toneOf(a);
              const I = tone === 'negative' ? CircleX : activityIcon[a.kind];
              const comment = a.kind === 'comment';
              return (
                <li key={a.id} className={cx('axa__item', `tone-${tone}`)}>
                  <span className="axa__tile">
                    <I size={16} strokeWidth={2} />
                  </span>
                  <div className="axa__body">
                    <p className="axa__line">
                      <b>{p.name}</b>{' '}
                      {comment ? (
                        <>
                          commented <i>“{a.text}”</i>
                        </>
                      ) : (
                        <>
                          {verb}
                          {(a.kind === 'decision' ? chips.slice(1) : chips).map((c, i) => (
                            <span key={c.text}>
                              {i > 0 ? ' · ' : ' '}
                              <b>{c.text}</b>
                            </span>
                          ))}
                          {tail && <> {tail}</>}
                        </>
                      )}
                    </p>
                    {quote && !comment && <p className="axa__quote">“{quote}”</p>}
                    <span className="axa__when">{whenLine(a)}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

// ---- Page ---------------------------------------------------------------------------

const VARIANTS = [
  { id: 'tiles', name: '1 · Icon tiles', note: 'After the CRM timeline: a soft tile per event on a thin line, who and what in one sentence with the facts in bold, the time beneath, a heading for each day. Calm and easy to scan.' },
  { id: 'chips', name: '2 · Inline chips (chosen, now in the app)', note: 'The real Activity tab. Plain text throughout: statuses, files and facts are words, with text buttons (See proposal, Open file) where there is somewhere to go. A comment or a note is just a line of text under the sentence; older events fold.' },
] as const;

export function ActivityDemo() {
  return (
    <div className="cdemo axdemo">
      <PageHeader title="Activity" sub="Two looks for the Activity tab of a request, on the same sample history. Newest first, grouped by day; in look 2 the older events fold." />
      <div className="axdemo__grid">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className="axdemo__stage">{v.id === 'tiles' ? <TilesLog items={SAMPLE} /> : <ActivityLog items={SAMPLE} requestId="REQ-103" />}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

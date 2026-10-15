// Prototype-only page (#/demo/status): ways to colour-code request statuses
// on the live request list. The idea behind 2–5: colour says whose move it is
// (on you / Spark is working / done / closed), not which stage it is.
import { AlertCircle, Archive, Check, Hourglass } from 'lucide-react';
import { PageHeader, cx } from '../../components/ui/primitives';
import { RequestStatus, STAGES, requestStatusMeta, stageIndex } from '../../components/domain';
import { useStore } from '../../state/store';
import type { WorkRequest } from '../../data/types';

type Group = 'you' | 'spark' | 'done' | 'closed';

/** Whose move: on the client when a decision or a deadline waits on them. */
function groupOf(r: WorkRequest): Group {
  if (r.status === 'delivered') return 'done';
  if (r.status === 'declined') return 'closed';
  if (r.status === 'proposal' || r.nextStep?.onClient) return 'you';
  return 'spark';
}

/** The label: what the client has to do when it's on them, else the stage. */
function labelOf(r: WorkRequest) {
  if (r.status === 'proposal') return 'Needs your decision';
  if (r.nextStep?.onClient) return 'Needs your feedback';
  return requestStatusMeta[r.status].label;
}

// One request per status (and one waiting on the client's feedback), for the legend.
const ALL: WorkRequest[] = (['submitted', 'in_review', 'proposal', 'changes_requested', 'approved', 'in_progress', 'delivered', 'declined'] as const)
  .flatMap((status) => [{ status }, ...(status === 'in_progress' ? [{ status, nextStep: { label: '', date: '', onClient: true } }] : [])])
  .map((x, i) => ({ id: `L${i}`, ...x }) as unknown as WorkRequest);

const VARIANTS = [
  { id: 'today', name: '1 · Live', note: 'The real status pill, which now uses 2b.' },
  { id: 'move', name: '2 · Whose move', note: 'Only what’s on you is a filled amber pill. Spark’s stages are one Cobalt dot and text; done is green text; closed is faint.' },
  { id: 'hues', name: '2b · Whose move, a colour per status', note: 'Picked, now live. Every status the same filled pill, each in its own colour from the brand palette: amber for what’s on you, then one colour per stage. Every status below the table.' },
  { id: 'pips', name: '3 · Whose move + stage pips', note: 'As 2, with six small pips for how far along it is; the pips take the group’s colour.' },
  { id: 'bar', name: '4 · Progress bar', note: 'The stage as plain text over a thin bar of the six stages; amber when it’s on you, Cobalt while Spark works, green when done.' },
  { id: 'icons', name: '5 · Icons, one colour', note: 'Monochrome text with an icon for whose move (hourglass, alert, check, archive). Colour only for what’s on you.' },
] as const;

type VariantId = (typeof VARIANTS)[number]['id'];

function Status({ r, variant }: { r: WorkRequest; variant: VariantId }) {
  if (variant === 'today') return <RequestStatus status={r.status} onClient={r.nextStep?.onClient} />;
  const g = groupOf(r);
  const label = labelOf(r);
  const idx = stageIndex(r.status);
  const done = g === 'done' ? STAGES.length : idx + (g === 'closed' ? 0 : 1);
  if (variant === 'icons') {
    const I = g === 'you' ? AlertCircle : g === 'done' ? Check : g === 'closed' ? Archive : Hourglass;
    return (
      <span className={cx('st-ic', `is-${g}`)}>
        <I size={14} strokeWidth={2} />
        {label}
      </span>
    );
  }
  if (variant === 'bar')
    return (
      <span className={cx('st-bar', `is-${g}`)}>
        <span className="st-bar__label">{label}</span>
        <span className="st-bar__track">
          {STAGES.map((s, i) => (
            <span key={s} className={cx(i < done && 'is-on')} />
          ))}
        </span>
      </span>
    );
  if (variant === 'hues')
    return (
      <span className={cx('st st--pill', g === 'you' ? 'hue-you' : `hue-${r.status}`)}>
        <span className="st__dot" />
        {label}
      </span>
    );
  return (
    <span className="st-wrap">
      <span className={cx('st', `is-${g}`)}>
        {g !== 'closed' && <span className="st__dot" />}
        {label}
      </span>
      {variant === 'pips' && g !== 'closed' && (
        <span className={cx('st-pips', `is-${g}`)} aria-label={`Stage ${Math.min(done, 6)} of 6`}>
          {STAGES.map((s, i) => (
            <span key={s} className={cx(i < done && 'is-on')} />
          ))}
        </span>
      )}
    </span>
  );
}

export function StatusDemo() {
  const { state } = useStore();
  const list = [...state.requests].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return (
    <div className="cdemo stdemo">
      <PageHeader title="Status colours" sub="Ways to colour-code request statuses, on the live request list. In 2–5 colour says whose move it is, not which stage." />
      <div className="stdemo__grid">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className="stdemo__table">
              {list.map((r) => (
                <div key={r.id} className="stdemo__row">
                  <span className="stdemo__title">
                    <span className="mono faint">{r.id}</span> {r.title}
                  </span>
                  <Status r={r} variant={v.id} />
                </div>
              ))}
            </div>
            {v.id === 'hues' && (
              <div className="stdemo__legend">
                {ALL.map((r) => (
                  <Status key={r.id} r={r} variant="hues" />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

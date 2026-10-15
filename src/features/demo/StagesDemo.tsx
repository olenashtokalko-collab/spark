// Prototype-only page (#/demo/stages): looks for the request's Stages card,
// after a feature-list reference (icons in raised discs on a line, one row
// lit). The stages don't take hover, so the lit row is the stage the request
// is at. Each look shows REQ-100 at "Proposal", due in 4 days.
import { BadgeCheck, Check, Clock, FileText, Hammer, PackageCheck, ScanSearch, Send } from 'lucide-react';
import { PageHeader, cx } from '../../components/ui/primitives';
import { STAGES, STAGE_INFO } from '../../components/domain';
import { useStore } from '../../state/store';
import { StatusCard } from '../requests/RequestDetail';

const ICONS = [Send, ScanSearch, FileText, BadgeCheck, Hammer, PackageCheck];
const CURRENT = 2; // Proposal

const VARIANTS = [
  { id: 'today', name: '1 · Live card', note: 'The real Stages card, which now uses look 2.' },
  { id: 'discs', name: '2 · Icon discs', note: 'Picked, now on the request page. After the reference: each stage an icon in a raised white disc on the line. The current stage’s row is lit in soft Cobalt, its name in Cobalt.' },
  { id: 'glass', name: '3 · Glass disc for now', note: 'The same discs; the current one is a glossy Cobalt glass sphere with a white icon, its row a white card lifted off the line.' },
  { id: 'filled', name: '4 · Filled path', note: 'Done stages are solid Cobalt discs with a check, joined by a Cobalt line up to now; the current disc has a soft halo, the rest are outlines.' },
  { id: 'lifted', name: '5 · Current as a card', note: 'Small dots for every stage; the current one opens into a lifted card on the line with what’s happening and the deadline.' },
  { id: 'folded', name: '6 · Past folded', note: 'Stages done fold into one line (“2 done”), the current one is lit and open, what’s next stays compact. Shortest.' },
] as const;

type VariantId = (typeof VARIANTS)[number]['id'];

function Deadline() {
  return (
    <div className="stg__due">
      <Clock size={14} />
      <span>
        <span className="stg__due-what">Your decision on the proposal</span>
        <span className="stg__due-when">Due Sun 18 Oct · in 4 days</span>
      </span>
    </div>
  );
}

function Stages({ variant }: { variant: Exclude<VariantId, 'today'> }) {
  const rows = STAGES.map((s, i) => ({ s, i, st: i < CURRENT ? 'done' : i === CURRENT ? 'current' : 'todo' }));
  const shown = variant === 'folded' ? rows.filter((r) => r.st !== 'done') : rows;
  return (
    <section className={cx('side-card stg', `stg--${variant}`)} aria-label="Stages">
      <h3 className="side-card__title">
        Stages <span className="block__count status-card__step">Step {CURRENT + 1} of {STAGES.length}</span>
      </h3>
      <ol className="stg__list">
        {variant === 'folded' && (
          <li className="stg__item is-done stg__fold">
            <span className="stg__mark">
              <Check size={14} strokeWidth={2.5} />
            </span>
            <div className="stg__body">
              <div className="stg__label">Submitted · In review</div>
              <div className="stg__info">2 stages done</div>
            </div>
          </li>
        )}
        {shown.map(({ s, i, st }) => {
          const Icon = ICONS[i];
          const mark = variant === 'lifted' ? null : variant === 'filled' && st === 'done' ? <Check size={14} strokeWidth={2.5} /> : <Icon size={15} strokeWidth={1.8} />;
          return (
            <li key={s} className={cx('stg__item', `is-${st}`)} aria-current={st === 'current' ? 'step' : undefined}>
              <span className="stg__mark">{mark}</span>
              <div className="stg__body">
                <div className="stg__label">{s}</div>
                <div className="stg__info">{STAGE_INFO[s]}</div>
                {st === 'current' && (
                  <>
                    <div className="stg__when">Started 4 days ago</div>
                    <Deadline />
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function StagesDemo() {
  const { state } = useStore();
  const req = state.requests.find((r) => r.id === 'REQ-100');
  return (
    <div className="cdemo stgdemo">
      <PageHeader title="Stages" sub="Six looks for the request’s Stages card, after the feature-list reference: icons in raised discs on a line, one row lit. The stages don’t take hover, so the lit row is where the request is now." />
      <div className="stgdemo__grid">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className="stgdemo__stage">{v.id === 'today' ? req && <StatusCard r={req} /> : <Stages variant={v.id} />}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

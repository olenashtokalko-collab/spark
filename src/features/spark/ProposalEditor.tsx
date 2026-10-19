// The proposal editor (picked from the layouts on #/spark/layouts, A · Section rail): the sections as a list on
// the left, each with a mark (an amber ! while it is empty, a check when it is ready), and one section at a time
// on the right. An empty section is highlighted in the list and says so when it is open.
import { useState } from 'react';
import { AlertCircle, ArrowRight, Check } from 'lucide-react';
import { Button, cx } from '../../components/ui/primitives';
import { SECTIONS, SectionEditor, type ProposalForm, type SectionId } from './ProposalSections';

const Mark = ({ ok }: { ok: boolean }) =>
  ok ? (
    <span className="pe-mark pe-mark--ok" aria-label="Ready">
      <Check size={11} strokeWidth={3} />
    </span>
  ) : (
    <span className="pe-mark pe-mark--todo" aria-label="Needs content">
      <AlertCircle size={16} strokeWidth={2} />
    </span>
  );

const next = (id: SectionId) => SECTIONS[(SECTIONS.findIndex((s) => s.id === id) + 1) % SECTIONS.length].id;

export function ProposalProgress({ f }: { f: ProposalForm }) {
  return (
    <span className="pe-progress">
      <strong>{f.ready}</strong> of {SECTIONS.length} sections ready
      <span className="pe-progress__bar">
        <span style={{ width: `${(f.ready / SECTIONS.length) * 100}%` }} />
      </span>
    </span>
  );
}

export function RailEditor({ f }: { f: ProposalForm }) {
  // Open on the first section that still needs content.
  const [active, setActive] = useState<SectionId>(() => SECTIONS.find((s) => !f.done[s.id])?.id ?? 'overview');
  const s = SECTIONS.find((x) => x.id === active)!;
  return (
    <div className="pe-grid pe-grid--a">
      <ul className="pe-rail">
        {SECTIONS.map((x) => (
          <li key={x.id}>
            <button className={cx('pe-rail__item', active === x.id && 'is-active', !f.done[x.id] && 'is-empty')} onClick={() => setActive(x.id)}>
              <x.icon size={16} strokeWidth={1.7} />
              <span className="pe-rail__label">{x.label}</span>
              <Mark ok={f.done[x.id]} />
            </button>
          </li>
        ))}
      </ul>
      <section className={cx('pe-pane', !f.done[active] && 'is-empty')}>
        <header className="pe-pane__head">
          <div>
            <h3>{s.label}</h3>
            <p className="muted">{s.hint}</p>
          </div>
          <Mark ok={f.done[active]} />
        </header>
        {!f.done[active] && (
          <div className="pe-alert">
            <AlertCircle size={16} /> This section is still empty, so the client would see nothing here.
          </div>
        )}
        <SectionEditor id={active} f={f} />
        <footer className="pe-pane__foot">
          <Button size="sm" iconRight={ArrowRight} onClick={() => setActive(next(active))}>
            Next section
          </Button>
        </footer>
      </section>
    </div>
  );
}

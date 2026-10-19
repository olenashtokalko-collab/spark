// Prototype-only page (#/spark/layouts): four ways to lay out the proposal editor, after the contract-review
// reference (sections on the left, the section's content on the right, what is missing highlighted).
// The same form and the same section editors in every layout; only the arrangement changes.
//   A  Section rail: the reference. A list on the left, one section at a time on the right.
//   B  Rail, editor and what the client sees: the third column is the live proposal; empty blocks are dashed.
//   C  One page: every section as a card, a sticky index on the left; empty cards are outlined.
//   D  Needs content first: the left list is split into what is empty and what is ready.
import { useRef, useState } from 'react';
import { AlertCircle, ArrowRight, Check } from 'lucide-react';
import { Button, PageHeader, Segmented, cx } from '../../components/ui/primitives';
import { aed, fmtDate } from '../../lib/format';
import { SECTIONS, SectionEditor, useProposalForm, type ProposalForm, type SectionId } from './ProposalSections';

type Layout = 'a' | 'b' | 'c' | 'd';

const LAYOUTS: { value: Layout; label: string }[] = [
  { value: 'a', label: 'A · Section rail' },
  { value: 'b', label: 'B · With the client’s view' },
  { value: 'c', label: 'C · One page' },
  { value: 'd', label: 'D · Needs content first' },
];

const NOTES: Record<Layout, string> = {
  a: 'The reference: the sections as a list on the left, each with a mark (an amber ! while it is empty, a check when it is ready), and one section at a time on the right. The open section says so when it is empty.',
  b: 'The same rail and editor, plus a third column that is the proposal as the client will see it. A section that is not filled yet shows as a dashed amber block there; click it to open that section.',
  c: 'No switching: all sections are on one page as cards, with a sticky index on the left that jumps to a card. Empty cards have an amber outline and a “Needs content” tag.',
  d: 'The left list puts what is still empty on top, highlighted, and what is ready below. A strip above names the missing sections, so the manager always knows what stops the proposal from being sent.',
};

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

function SectionList({ f, active, onPick, numbered }: { f: ProposalForm; active?: SectionId; onPick: (id: SectionId) => void; numbered?: boolean }) {
  return (
    <ul className="pe-rail">
      {SECTIONS.map((s, i) => (
        <li key={s.id}>
          <button className={cx('pe-rail__item', active === s.id && 'is-active', !f.done[s.id] && 'is-empty')} onClick={() => onPick(s.id)}>
            {numbered ? <span className="pe-rail__n">{i + 1}</span> : <s.icon size={16} strokeWidth={1.7} />}
            <span className="pe-rail__label">{s.label}</span>
            <Mark ok={f.done[s.id]} />
          </button>
        </li>
      ))}
    </ul>
  );
}

function Pane({ id, f, onNext }: { id: SectionId; f: ProposalForm; onNext?: () => void }) {
  const s = SECTIONS.find((x) => x.id === id)!;
  return (
    <section className={cx('pe-pane', !f.done[id] && 'is-empty')}>
      <header className="pe-pane__head">
        <div>
          <h3>{s.label}</h3>
          <p className="muted">{s.hint}</p>
        </div>
        <Mark ok={f.done[id]} />
      </header>
      {!f.done[id] && (
        <div className="pe-alert">
          <AlertCircle size={16} /> This section is still empty, so the client would see nothing here.
        </div>
      )}
      <SectionEditor id={id} f={f} />
      {onNext && (
        <footer className="pe-pane__foot">
          <Button size="sm" iconRight={ArrowRight} onClick={onNext}>
            Next section
          </Button>
        </footer>
      )}
    </section>
  );
}

const next = (id: SectionId) => SECTIONS[(SECTIONS.findIndex((s) => s.id === id) + 1) % SECTIONS.length].id;

function LayoutA({ f }: { f: ProposalForm }) {
  const [active, setActive] = useState<SectionId>('objectives');
  return (
    <div className="pe-grid pe-grid--a">
      <SectionList f={f} active={active} onPick={setActive} />
      <Pane id={active} f={f} onNext={() => setActive(next(active))} />
    </div>
  );
}

/** One line of what a section says, for the client's view; null while it is empty. */
function gist(id: SectionId, f: ProposalForm): string | null {
  if (!f.done[id]) return null;
  switch (id) {
    case 'overview':
      return f.summary;
    case 'objectives':
      return f.objectives.filter((o) => o.trim()).join(' · ');
    case 'scope':
      return f.scope.filter((s) => s.title.trim()).map((s) => s.title).join(' · ');
    case 'timeline':
      return `${f.weeks} weeks · starts ${fmtDate(f.start)} · decide by ${fmtDate(f.until, { weekday: true })}`;
    case 'investment':
      return `${aed(f.total)} excl. VAT`;
    case 'terms':
      return f.terms.filter((t) => t.trim()).join(' ');
    case 'file':
      return f.file;
  }
}

function LayoutB({ f }: { f: ProposalForm }) {
  const [active, setActive] = useState<SectionId>('objectives');
  return (
    <div className="pe-grid pe-grid--b">
      <SectionList f={f} active={active} onPick={setActive} numbered />
      <Pane id={active} f={f} onNext={() => setActive(next(active))} />
      <aside className="pe-prev" aria-label="What the client sees">
        <div className="spk-preview__label">What Omar will see</div>
        <div className="pe-prev__card">
          <h4>{f.title || 'Untitled proposal'}</h4>
          {SECTIONS.filter((s) => s.id !== 'overview').map((s) => {
            const g = gist(s.id, f);
            return (
              <button key={s.id} className={cx('pe-prev__block', !g && 'is-empty', active === s.id && 'is-active')} onClick={() => setActive(s.id)}>
                <span className="pe-prev__label">{s.label}</span>
                <span className="pe-prev__text">{g ?? 'Not filled yet'}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

function LayoutC({ f }: { f: ProposalForm }) {
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const [active, setActive] = useState<SectionId>('overview');
  const go = (id: SectionId) => {
    setActive(id);
    refs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <div className="pe-grid pe-grid--c">
      <div className="pe-sticky">
        <SectionList f={f} active={active} onPick={go} />
      </div>
      <div className="pe-stack">
        {SECTIONS.map((s) => (
          <section key={s.id} ref={(el) => (refs.current[s.id] = el)} className={cx('pe-card', !f.done[s.id] && 'is-empty')}>
            <header className="pe-pane__head">
              <div>
                <h3>{s.label}</h3>
                <p className="muted">{s.hint}</p>
              </div>
              {f.done[s.id] ? <Mark ok /> : <span className="pe-tag">Needs content</span>}
            </header>
            <SectionEditor id={s.id} f={f} />
          </section>
        ))}
      </div>
    </div>
  );
}

function LayoutD({ f }: { f: ProposalForm }) {
  const [active, setActive] = useState<SectionId>(() => SECTIONS.find((s) => !f.done[s.id])?.id ?? 'overview');
  const missing = SECTIONS.filter((s) => !f.done[s.id]);
  const ready = SECTIONS.filter((s) => f.done[s.id]);
  const row = (s: (typeof SECTIONS)[number]) => (
    <li key={s.id}>
      <button className={cx('pe-rail__item', active === s.id && 'is-active', !f.done[s.id] && 'is-empty')} onClick={() => setActive(s.id)}>
        <s.icon size={16} strokeWidth={1.7} />
        <span className="pe-rail__label">{s.label}</span>
        <Mark ok={f.done[s.id]} />
      </button>
    </li>
  );
  return (
    <div>
      {missing.length > 0 && (
        <div className="pe-strip">
          <AlertCircle size={16} />
          <span>
            {missing.length} {missing.length === 1 ? 'section still needs' : 'sections still need'} content:
          </span>
          {missing.map((s) => (
            <button key={s.id} className="pe-chip" onClick={() => setActive(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      )}
      <div className="pe-grid pe-grid--a">
        <div className="pe-groups">
          {missing.length > 0 && (
            <>
              <div className="pe-group__title">Needs content · {missing.length}</div>
              <ul className="pe-rail">{missing.map(row)}</ul>
            </>
          )}
          {ready.length > 0 && (
            <>
              <div className="pe-group__title">Ready · {ready.length}</div>
              <ul className="pe-rail">{ready.map(row)}</ul>
            </>
          )}
        </div>
        <Pane id={active} f={f} />
      </div>
    </div>
  );
}

export function ProposalLayouts() {
  const f = useProposalForm();
  const [layout, setLayout] = useState<Layout>('a');
  const all = f.ready === SECTIONS.length;
  return (
    <div className="pe">
      <PageHeader
        title="Proposal editor: layouts"
        sub="Four ways to build the proposal section by section, after the reference. The form is shared, so type in one layout and switch to see the same data in another."
        actions={
          <>
            <Button>Save draft</Button>
            <Button variant="primary" disabled={!all}>
              Send to client
            </Button>
          </>
        }
      />
      <div className="pe-bar">
        <Segmented value={layout} onChange={setLayout} label="Layout" items={LAYOUTS} />
        <span className="pe-progress">
          <strong>{f.ready}</strong> of {SECTIONS.length} sections ready
          <span className="pe-progress__bar">
            <span style={{ width: `${(f.ready / SECTIONS.length) * 100}%` }} />
          </span>
        </span>
      </div>
      <p className="pe-note muted">{NOTES[layout]}</p>
      {layout === 'a' && <LayoutA f={f} />}
      {layout === 'b' && <LayoutB f={f} />}
      {layout === 'c' && <LayoutC f={f} />}
      {layout === 'd' && <LayoutD f={f} />}
    </div>
  );
}

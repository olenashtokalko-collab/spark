// Prototype-only page (#/spark/layouts): four ways to lay out the proposal editor, after the contract-review
// reference (sections on the left, the section's content on the right, what is missing highlighted).
// The same form and the same section editors in every layout; only the arrangement changes.
//   A  Section rail: the reference. A list on the left, one section at a time on the right.
//   B  Rail, editor and what the client sees: the third column is the live proposal; empty blocks are dashed.
//   C  One page: every section as a card, a sticky index on the left; empty cards are outlined.
//   D  Needs content first: the left list is split into what is empty and what is ready.
import { useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Banknote, Building2, Calendar, CalendarCheck, Check, Clock, FileText, LayoutGrid, Lightbulb, Pencil, Sparkles, Trash2, UserRound, History, StickyNote } from 'lucide-react';
import { Avatar, Button, PageHeader, Segmented, cx } from '../../components/ui/primitives';
import { aed, fmtDate } from '../../lib/format';
import { SECTIONS, SectionEditor, useProposalForm, type ProposalForm, type SectionId } from './ProposalSections';
import { dana, youssef } from './data';
import { navigate } from '../../lib/router';

type Layout = 'e' | 'a' | 'b' | 'c' | 'd';

const LAYOUTS: { value: Layout; label: string }[] = [
  { value: 'e', label: 'E · Like the reference' },
  { value: 'a', label: 'A · Section rail' },
  { value: 'b', label: 'B · With the client’s view' },
  { value: 'c', label: 'C · One page' },
  { value: 'd', label: 'D · Needs content first' },
];

const NOTES: Record<Layout, string> = {
  e: 'Built after the reference: a section menu attached to the left with a mark on each item, a header strip with the page’s purpose and actions, and on the right one large card. It opens on a key overview (title, status chips, the six key facts, the summary and a completeness box that works like the risk box) and each menu item opens that section for editing.',
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

function Pane({ id, f, onNext, bare }: { id: SectionId; f: ProposalForm; onNext?: () => void; bare?: boolean }) {
  const s = SECTIONS.find((x) => x.id === id)!;
  return (
    <section className={cx('pe-pane', !f.done[id] && 'is-empty', bare && 'pe-pane--bare')}>
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


const FACT_ICON = { client: Building2, owner: UserRound, total: Banknote, duration: Clock, starts: Calendar, decision: CalendarCheck };
// In this layout the sections are named like the reference's menu.
const NAME: Partial<Record<SectionId, string>> = { overview: 'General', file: 'Documents' };
const nameOf = (id: SectionId) => NAME[id] ?? SECTIONS.find((s) => s.id === id)!.label;

export interface EditorMeta {
  requestId: string;
  clientName: string;
  ownerName: string;
  requesterFirst: string;
  version: number;
}
const DEMO_META: EditorMeta = { requestId: 'REQ-105', clientName: 'Brand Co.', ownerName: 'Dana Kareem', requesterFirst: 'Omar', version: 1 };

/** The proposal editor after the reference: a section menu, a header strip and one large card.
 *  Used as a demo layout and as the real New proposal page (with `bleed`, where it fills the page). */
export function ReferenceEditor({ f, meta = DEMO_META, onSend, onBack, bleed }: { f: ProposalForm; meta?: EditorMeta; onSend?: () => void; onBack?: () => void; bleed?: boolean }) {
  const [active, setActive] = useState<SectionId | 'key'>('key');
  const [tab, setTab] = useState<'contents' | 'ideas'>('contents');
  const missing = SECTIONS.filter((s) => !f.done[s.id]);
  const facts: { k: keyof typeof FACT_ICON; label: string; value: string | null; to?: SectionId }[] = [
    { k: 'client', label: 'Client', value: meta.clientName },
    { k: 'owner', label: 'Owner', value: meta.ownerName },
    { k: 'total', label: 'Total value', value: f.done.investment ? aed(f.total) : null, to: 'investment' },
    { k: 'duration', label: 'Duration', value: f.done.timeline ? `${f.weeks} weeks` : null, to: 'timeline' },
    { k: 'starts', label: 'Work starts', value: f.start ? fmtDate(f.start) : null, to: 'timeline' },
    { k: 'decision', label: 'Decision needed by', value: f.until ? fmtDate(f.until, { weekday: true }) : null, to: 'timeline' },
  ];
  const item = (id: SectionId | 'key', label: string, Icon: typeof FileText, ok?: boolean) => (
    <li key={id}>
      <button className={cx('pe-ref__item', active === id && 'is-active')} onClick={() => setActive(id)}>
        <Icon size={16} strokeWidth={1.7} />
        <span>{label}</span>
        {ok === false && <Mark ok={false} />}
      </button>
    </li>
  );
  return (
    <div className={cx('pe-ref', bleed && 'pe-ref--bleed')}>
      <nav className="pe-ref__side" aria-label="Proposal sections">
        <h2 className="pe-ref__heading">Proposal</h2>
        <ul>
          {item('key', 'Key overview', LayoutGrid)}
          {SECTIONS.map((s) => item(s.id, nameOf(s.id), s.icon, f.done[s.id]))}
        </ul>
        <ul className="pe-ref__foot">
          <li><button className="pe-ref__item"><History size={16} strokeWidth={1.7} /><span>Activity</span></button></li>
          <li><button className="pe-ref__item"><StickyNote size={16} strokeWidth={1.7} /><span>Internal notes</span></button></li>
          <li><button className="pe-ref__item"><Trash2 size={16} strokeWidth={1.7} /><span>Discard draft</span></button></li>
        </ul>
      </nav>
      <div className="pe-ref__main">
        <header className="pe-ref__bar">
          <span className="pe-ref__badge"><FileText size={20} /></span>
          <div className="pe-ref__bartext">
            <strong>Proposal review</strong>
            <span>Here you can review all sections before sending to the client</span>
          </div>
          <div className="pe-ref__actions">
            <Button icon={ArrowLeft} onClick={onBack ?? (() => navigate('/spark'))}>Back to request</Button>
            <Button icon={Sparkles}>Ask Spark AI</Button>
            <Button variant="primary" disabled={missing.length > 0} onClick={onSend}>Send to client</Button>
            <span className="pe-ref__people">
              <Avatar person={dana} size={30} />
              <Avatar person={youssef} size={30} />
            </span>
          </div>
        </header>

        <div className="pe-ref__card">
          {active === 'key' ? (
            <>
              <h2 className="pe-ref__title">{f.title || 'Untitled proposal'}</h2>
              <div className="pe-ref__chips">
                <span className="pe-chip-s pe-chip-s--draft">DRAFT</span>
                <span className="pe-chip-s">V{meta.version}</span>
                <span className="pe-chip-s">{meta.requestId}</span>
                <span className="faint">Created today by Dana Kareem</span>
              </div>
              <div className="pe-ref__facts">
                {facts.map((x) => {
                  const Icon = FACT_ICON[x.k];
                  return (
                    <button key={x.k} className={cx('pe-fact', !x.value && 'is-empty')} onClick={() => x.to && setActive(x.to)} disabled={!x.to}>
                      <span className="pe-fact__ic"><Icon size={18} strokeWidth={1.6} /></span>
                      <span className="pe-fact__t">
                        <span className="pe-fact__l">{x.label}</span>
                        <span className="pe-fact__v">{x.value ?? 'Not filled yet'}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <h3 className="pe-ref__h">Summary <button className="pe-ref__pencil" aria-label="Edit the summary" onClick={() => setActive('overview')}><Pencil size={15} /></button></h3>
              <p className={cx('pe-ref__summary', !f.summary.trim() && 'is-empty')}>{f.summary.trim() || 'Not filled yet. Write the two sentences the client reads first.'}</p>

              <h3 className="pe-ref__h">Completeness <span className="muted">{f.ready} of {SECTIONS.length} sections ready</span></h3>
              <div className={cx('pe-ref__risk', missing.length === 0 && 'is-ok')}>
                {missing.length > 0 ? <AlertCircle size={20} /> : <Check size={20} />}
                <span className="pe-ref__risktext">
                  {missing.length > 0 ? <><strong>{missing.length} to fill:</strong> {missing.map((s) => nameOf(s.id)).join(' · ')}</> : 'Every section is ready. You can send the proposal.'}
                </span>
                {missing.length > 0 && (
                  <button className="link-btn" onClick={() => setActive(missing[0].id)}>
                    <ArrowRight size={14} /> Fill the next one
                  </button>
                )}
              </div>

              <div className="pe-ref__tabs" role="tablist">
                <button role="tab" aria-selected={tab === 'contents'} className={cx(tab === 'contents' && 'is-on')} onClick={() => setTab('contents')}>Contents</button>
                <button role="tab" aria-selected={tab === 'ideas'} className={cx(tab === 'ideas' && 'is-on')} onClick={() => setTab('ideas')}>Suggestions</button>
              </div>
              {tab === 'contents' ? (
                <div className="pe-ref__clauses">
                  {SECTIONS.filter((s) => s.id !== 'overview').map((s) => {
                    const g = gist(s.id, f);
                    return (
                      <button key={s.id} className={cx('pe-clause', !g && 'is-empty')} onClick={() => setActive(s.id)}>
                        <span className="pe-clause__l">{nameOf(s.id)}</span>
                        <span className="pe-clause__v">{g ?? 'Not filled yet'}</span>
                        <Pencil size={14} className="pe-clause__pen" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="pe-ref__clauses">
                  {[`${meta.requesterFirst} asked for a clear price in the conversation: show it as line items.`, 'The budget is up to AED 60,000: keep the total under it or explain the difference.', 'Add one objective that can be measured, such as a response time.', 'Attach last quarter’s delivery-fee mentions as an appendix.'].map((t) => (
                    <div key={t} className="pe-clause pe-clause--idea">
                      <span className="pe-clause__l"><Lightbulb size={14} /> Suggestion</span>
                      <span className="pe-clause__v">{t}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <button className="pe-ref__back" onClick={() => setActive('key')}><ArrowLeft size={14} /> Key overview</button>
              <Pane id={active} f={f} onNext={() => setActive(next(active))} bare />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const [layout, setLayout] = useState<Layout>('e');
  const all = f.ready === SECTIONS.length;
  return (
    <div className="pe">
      <PageHeader
        title="Proposal editor: layouts"
        sub="Four ways to build the proposal section by section, after the reference. The form is shared, so type in one layout and switch to see the same data in another."
        actions={
          layout === 'e' ? undefined : (
            <>
              <Button>Save draft</Button>
              <Button variant="primary" disabled={!all}>
                Send to client
              </Button>
            </>
          )
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
      {layout === 'e' && <ReferenceEditor f={f} />}
      {layout === 'a' && <LayoutA f={f} />}
      {layout === 'b' && <LayoutB f={f} />}
      {layout === 'c' && <LayoutC f={f} />}
      {layout === 'd' && <LayoutD f={f} />}
    </div>
  );
}

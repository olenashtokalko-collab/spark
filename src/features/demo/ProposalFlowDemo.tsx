// Prototype-only page (#/demo/proposal-flow): ways to bring creating a proposal
// (today the section editor at /proposal/new) together with the manager's proposal
// page (/proposal: the client's view with Edit, versions and tracked changes).
// Each variant shows two moments: a new proposal, and the next version as a draft.
import { useState, type ReactNode } from 'react';
import { AlignLeft, ChevronDown, Eye, PenLine, Plus, Send } from 'lucide-react';
import { Button, Input, PageHeader, Segmented, Tabs, Textarea, cx } from '../../components/ui/primitives';
import { Popover } from '../../components/ui/overlay';

type Variant = 'a' | 'b' | 'c';
type Moment = 'new' | 'next';

const VARIANTS: { id: Variant; name: string; note: string }[] = [
  {
    id: 'a',
    name: 'A · One page for everything (+ D · draft as a version)',
    note: 'A new proposal opens on the proposal page itself: empty sections show what to add, the side card counts what is ready. The next version is edited in place and shows up in the version menu as “Draft”, with changes tracked against the last sent version.',
  },
  {
    id: 'b',
    name: 'B · Editor for v1, the page after that',
    note: 'The first version is written in today’s editor (a card per section, empty ones marked). Once sent, everything happens on the proposal page: new versions are prepared with Edit on each section.',
  },
  {
    id: 'c',
    name: 'C · The page with an Edit mode',
    note: 'The proposal page is home. “Edit” turns the whole page into the editor’s form cards; a new proposal opens straight in Edit. View shows it as the client will see it.',
  },
];

// ---- Content (REQ-104, Riyadh launch campaign) -------------------------------------------------

const SUMMARY = 'A 10-week programme from positioning to opening week. Films move to a second wave around Ramadan and are quoted separately.';
const OBJECTIVES = ['Make Brand Co. the most talked-about store opening in Riyadh in January 2027.', 'Position Brand Co. on regional design and craft, not on being “from Dubai”.'];
const SCOPE = ['KSA positioning', 'Campaign idea and key visual', 'Launch content', 'Launch event identity'];
const LINES = [
  ['KSA positioning', 'AED 38,000'],
  ['Campaign idea and key visual', 'AED 52,000'],
  ['Launch content', 'AED 64,000'],
];
const SECTIONS = ['Overview', 'Objectives', 'Scope & deliverables', 'Timeline', 'Investment', 'Terms'] as const;
type Section = (typeof SECTIONS)[number];
/** In the "new proposal" moment, what has been filled in so far. */
const READY: Section[] = ['Overview', 'Objectives'];

function Content({ s }: { s: Section }) {
  if (s === 'Overview') return <p className="pfl-p">{SUMMARY}</p>;
  if (s === 'Objectives')
    return (
      <ol className="pfl-list">
        {OBJECTIVES.map((o) => (
          <li key={o}>{o}</li>
        ))}
      </ol>
    );
  if (s === 'Scope & deliverables')
    return (
      <div className="pfl-chips">
        {SCOPE.map((x) => (
          <span key={x}>{x}</span>
        ))}
      </div>
    );
  if (s === 'Timeline') return <p className="pfl-p">Discovery 2 wk · Concept 3 wk · Production 4 wk · Launch 1 wk · starts 16 Nov</p>;
  if (s === 'Investment')
    return (
      <table className="pfl-table">
        <tbody>
          {LINES.map(([a, b]) => (
            <tr key={a}>
              <td>{a}</td>
              <td>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  return <p className="pfl-p">Prices exclude VAT. 50% on approval, 50% on launch.</p>;
}

/** What an empty section says on the page, in place of its content. */
const ADD: Record<Section, string> = {
  Overview: 'Add a summary',
  Objectives: 'Add objectives',
  'Scope & deliverables': 'Add deliverables',
  Timeline: 'Add phases and a start date',
  Investment: 'Add the price lines',
  Terms: 'Add terms',
};

/** The next version as a draft: the timeline section as tracked changes against v2. */
function TrackedTimeline() {
  return (
    <p className="pfl-p">
      Discovery 2 wk · Concept 3 wk · Production 4 wk · Launch 1 wk · starts <s className="spv-cut">9 Nov</s> <span className="spv-ins">16 Nov</span>
    </p>
  );
}

// ---- Pieces --------------------------------------------------------------------------------------

function Toc({ marks }: { marks: Partial<Record<Section, ReactNode>> }) {
  return (
    <nav className="pfl-toc">
      <div className="ptoc__title">
        <AlignLeft size={14} strokeWidth={1.8} /> On this page
      </div>
      {SECTIONS.map((s, i) => (
        <div key={s} className={cx('pfl-toc__item', i === 0 && 'is-active')}>
          {s}
          {marks[s]}
        </div>
      ))}
    </nav>
  );
}

const EmptyMark = () => <i className="pfl-empty-mark" title="Not filled in yet" />;

function VersionMenu({ draft }: { draft?: boolean }) {
  const items = [
    { v: 'Version 1', meta: 'Changes requested · sent 29 Sep', total: 'AED 214,000' },
    { v: 'Version 2', meta: 'Changes requested · sent 6 Oct', total: 'AED 186,000' },
  ];
  return (
    <Popover
      width={350}
      className="vpd-menu"
      trigger={({ open, toggle, ref }) => (
        <button ref={ref} className={cx('vpd-trigger', open && 'is-open')} onClick={toggle}>
          {draft ? 'Draft' : 'v2'}
          <ChevronDown size={14} className="vpd-chev" />
        </button>
      )}
    >
      {(close) => (
        <div className="vpd-list vpd-list--timeline">
          {items.map((x) => (
            <button key={x.v} className="vpd-item" onClick={close}>
              <span className="vpd-node" />
              <span className="vpd-item__main">
                <span className="vpd-item__v">{x.v}</span>
                <span className="vpd-item__meta">
                  <i className="vpd-dot" /> {x.meta}
                </span>
              </span>
              <span className="vpd-item__total">{x.total}</span>
            </button>
          ))}
          {draft && (
            <button className="vpd-item is-current pfl-draft-item" onClick={close}>
              <span className="vpd-node" />
              <span className="vpd-item__main">
                <span className="vpd-item__v">Draft</span>
                <span className="vpd-item__meta">Not sent · edited today</span>
              </span>
              <span className="vpd-item__total">AED 184,000</span>
            </button>
          )}
        </div>
      )}
    </Popover>
  );
}

function Side({ children }: { children: ReactNode }) {
  return <section className="decision spv-card pfl-card">{children}</section>;
}

function Head({ title, right, meta }: { title: string; right?: ReactNode; meta?: ReactNode }) {
  return (
    <header className="pfl-head">
      <div className="vpd-row">
        <h1 className={cx('proposal__title vpd-title', title === 'Untitled proposal' && 'pfl-untitled')}>{title}</h1>
        {right}
      </div>
      {meta && <div className="vpd-meta">{meta}</div>}
    </header>
  );
}

/** A section on the proposal page: its title, then content, a placeholder, or (on hover) Edit. */
function PageSection({ s, filled, edit, tracked }: { s: Section; filled: boolean; edit?: boolean; tracked?: boolean }) {
  return (
    <section className="pfl-sec">
      <div className="pfl-sec__head">
        <h2 className="psec__title">
          {s}
          {tracked && <span className="spv-tag">Edited</span>}
        </h2>
        {edit && filled && (
          <span className="spv-edit">
            <PenLine size={13} /> Edit
          </span>
        )}
      </div>
      {filled ? (
        tracked ? (
          <TrackedTimeline />
        ) : (
          <Content s={s} />
        )
      ) : (
        <button className="pfl-add">
          <Plus size={15} /> {ADD[s]}
        </button>
      )}
    </section>
  );
}

/** A section as a form card, the way today's editor shows it. */
function FormCard({ s, filled }: { s: Section; filled: boolean }) {
  return (
    <section className={cx('pfl-form', !filled && 'is-empty')}>
      <div className="pfl-form__head">
        <strong>{s}</strong>
        {!filled && <span className="pfl-form__todo">To fill in</span>}
      </div>
      {s === 'Overview' ? (
        <>
          <Input defaultValue="Riyadh launch campaign" />
          <Textarea rows={2} defaultValue={filled ? SUMMARY : ''} placeholder="What the project is, in two or three sentences" />
        </>
      ) : s === 'Objectives' ? (
        OBJECTIVES.map((o) => <Input key={o} defaultValue={filled ? o : ''} />)
      ) : (
        <Input defaultValue="" placeholder={ADD[s]} />
      )}
    </section>
  );
}

// ---- Variants ----------------------------------------------------------------------------------

function VariantA({ m }: { m: Moment }) {
  if (m === 'new')
    return (
      <div className="pfl-page">
        <div className="pfl-doc">
          <Head title="Riyadh launch campaign" right={<span className="pfl-draft-pill">Draft</span>} meta={<span>Not sent yet · for Layla Haddad</span>} />
          {SECTIONS.map((s) => (
            <PageSection key={s} s={s} filled={READY.includes(s)} edit />
          ))}
        </div>
        <aside className="pfl-side">
          <Side>
            <span className="vpd-item__meta spv-card__status">
              <i className="vpd-dot" /> Draft · not sent
            </span>
            <div className="pfl-progress">
              <div className="pfl-progress__row">
                <strong>2 of 6</strong> sections ready
              </div>
              <div className="pfl-bar">
                <i style={{ width: '33%' }} />
              </div>
            </div>
            <Button variant="primary" icon={Send} disabled>
              Send v1 to client
            </Button>
            <p className="decision__note">Fill in the marked sections to send.</p>
          </Side>
          <Toc marks={Object.fromEntries(SECTIONS.filter((s) => !READY.includes(s)).map((s) => [s, <EmptyMark key={s} />]))} />
        </aside>
      </div>
    );
  return (
    <div className="pfl-page">
      <div className="pfl-doc">
        <Head
          title="Riyadh launch campaign"
          right={<VersionMenu draft />}
          meta={
            <>
              <span>Draft of version 3 · not sent</span>
              <span className="spv-toggle">
                <span className="pfl-switch is-on" /> Show changes from v2
              </span>
            </>
          }
        />
        {SECTIONS.slice(2, 5).map((s) => (
          <PageSection key={s} s={s} filled edit tracked={s === 'Timeline'} />
        ))}
      </div>
      <aside className="pfl-side">
        <Side>
          <span className="vpd-item__meta spv-card__status">
            <i className="vpd-dot" /> Draft · not sent
          </span>
          <div className="decision__total">AED 184,000</div>
          <div className="decision__meta">10 weeks · starts 16 Nov</div>
          <Button variant="primary" icon={Send}>
            Send v3 to client
          </Button>
          <p className="decision__note">1 section edited: Timeline</p>
        </Side>
        <Toc marks={{}} />
      </aside>
    </div>
  );
}

function VariantB({ m }: { m: Moment }) {
  if (m === 'new')
    return (
      <div className="pfl-page pfl-page--editor">
        <aside className="pfl-side pfl-side--left">
          <div className="pfl-progress">
            <div className="pfl-progress__row">
              <strong>33%</strong> filled in
            </div>
            <div className="pfl-bar">
              <i style={{ width: '33%' }} />
            </div>
          </div>
          <Toc marks={Object.fromEntries(SECTIONS.filter((s) => !READY.includes(s)).map((s) => [s, <EmptyMark key={s} />]))} />
        </aside>
        <div className="pfl-doc">
          <div className="pfl-editor-head">
            <span className="pfl-route">/proposal/new</span>
            <Button variant="primary" icon={Send} size="sm" disabled>
              Send to client
            </Button>
          </div>
          {SECTIONS.slice(0, 4).map((s) => (
            <FormCard key={s} s={s} filled={READY.includes(s)} />
          ))}
        </div>
      </div>
    );
  return (
    <div className="pfl-page">
      <div className="pfl-doc">
        <Head
          title="Riyadh launch campaign"
          right={<VersionMenu />}
          meta={
            <>
              <span>Sent 6 Oct to Layla</span>
              <span className="pfl-route">/proposal</span>
            </>
          }
        />
        {SECTIONS.slice(2, 5).map((s) => (
          <PageSection key={s} s={s} filled edit tracked={s === 'Timeline'} />
        ))}
      </div>
      <aside className="pfl-side">
        <Side>
          <span className="vpd-item__meta spv-card__status">
            <i className="vpd-dot" /> Changes requested
          </span>
          <div className="decision__total">AED 184,000</div>
          <Button variant="primary" icon={Send}>
            Send v3 to client
          </Button>
          <p className="decision__note">1 section edited: Timeline</p>
        </Side>
        <Toc marks={{}} />
      </aside>
    </div>
  );
}

function VariantC({ m }: { m: Moment }) {
  const [mode, setMode] = useState<'view' | 'edit'>(m === 'new' ? 'edit' : 'view');
  const switcher = (
    <Segmented
      label="Mode"
      value={mode}
      onChange={setMode}
      items={[
        { value: 'view', label: 'View', icon: Eye },
        { value: 'edit', label: 'Edit', icon: PenLine },
      ]}
    />
  );
  const filled = (s: Section) => m === 'next' || READY.includes(s);
  return (
    <div className="pfl-page">
      <div className="pfl-doc">
        <Head
          title="Riyadh launch campaign"
          right={
            <span className="pfl-head-tools">
              {switcher}
              {m === 'next' && <VersionMenu />}
            </span>
          }
          meta={<span>{m === 'new' ? 'Not sent yet · for Layla Haddad' : 'Sent 6 Oct to Layla'}</span>}
        />
        {mode === 'edit'
          ? SECTIONS.slice(0, 4).map((s) => <FormCard key={s} s={s} filled={filled(s)} />)
          : SECTIONS.slice(0, 4).map((s) => <PageSection key={s} s={s} filled={filled(s)} />)}
      </div>
      <aside className="pfl-side">
        <Side>
          <span className="vpd-item__meta spv-card__status">
            <i className="vpd-dot" /> {m === 'new' ? 'Draft · not sent' : 'Changes requested'}
          </span>
          {m === 'new' ? (
            <div className="pfl-progress">
              <div className="pfl-progress__row">
                <strong>2 of 6</strong> sections ready
              </div>
              <div className="pfl-bar">
                <i style={{ width: '33%' }} />
              </div>
            </div>
          ) : (
            <div className="decision__total">AED 186,000</div>
          )}
          <Button variant="primary" icon={Send} disabled={m === 'new'}>
            {m === 'new' ? 'Send v1 to client' : 'Send v3 to client'}
          </Button>
        </Side>
        <Toc marks={m === 'new' ? Object.fromEntries(SECTIONS.filter((s) => !READY.includes(s)).map((s) => [s, <EmptyMark key={s} />])) : {}} />
      </aside>
    </div>
  );
}

// ---- Page ---------------------------------------------------------------------------------------

export function ProposalFlowDemo() {
  const [moment, setMoment] = useState<Moment>('new');
  return (
    <div className="cdemo pfldemo">
      <PageHeader
        title="Creating and editing a proposal"
        sub="Three ways to bring the proposal editor and the manager’s proposal page together. Switch between a brand-new proposal and preparing the next version."
      />
      <Tabs
        className="tabs--underline"
        value={moment}
        onChange={setMoment}
        items={[
          { value: 'new', label: '1 · New proposal' },
          { value: 'next', label: '2 · Next version (after changes requested)' },
        ]}
      />
      <div className="pfldemo__list">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className="pfldemo__stage">
              {v.id === 'a' ? <VariantA m={moment} /> : v.id === 'b' ? <VariantB m={moment} /> : <VariantC key={moment} m={moment} />}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

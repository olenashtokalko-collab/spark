// Prototype-only page (#/demo/request-flow): the manager's flow on a request
// with a proposal the client asked to change (REQ-203). Step 1: how the
// proposal sits on the request page (one clickable block). Step 2: how the
// opened proposal shows the client's note and the comments on its sections.
import { useState, type ReactNode } from 'react';
import { ArrowRight, Check, ChevronRight, FileText, MessageSquareText } from 'lucide-react';
import { Avatar, PageHeader, Tabs } from '../../components/ui/primitives';
import { sampleRequests } from '../spark/data';
import { SECTIONS, type SectionId } from '../spark/ProposalSections';
import { aed } from '../../lib/format';

const req = sampleRequests.find((r) => r.id === 'REQ-203')!;
const prop = req.proposal!;
const f = prop.fields!;
const fb = prop.feedback!;
const SECTION_OF: Record<string, SectionId> = { Investment: 'investment', Timeline: 'timeline' };
const commentsOn = (id: SectionId) => fb.comments.filter((c) => c.section && SECTION_OF[c.section] === id);
const first = fb.by.name.split(' ')[0];
/** The comments in the order of the sections they belong to. */
const ordered = [...fb.comments].sort((a, b) => SECTIONS.findIndex((s) => s.id === SECTION_OF[a.section!]) - SECTIONS.findIndex((s) => s.id === SECTION_OF[b.section!]));

// ---- Step 1 · the proposal on the request page -------------------------------------------------

const CARDS = [
  {
    id: 'summary',
    name: 'A · Summary card',
    note: 'Title, version, status, price and the client’s note in one line. The whole card opens the proposal; a chevron says so.',
  },
  {
    id: 'status',
    name: 'B · Status first',
    note: 'A warm band on top says what happened and who acts next (“Hessa asked for changes · your move”). Facts below, the note as a quote.',
  },
  {
    id: 'row',
    name: 'C · Compact row',
    note: 'One row in the overview, like a file: icon, title and version, status pill, price, arrow. For managers scanning many requests.',
  },
] as const;

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rfd-pill">
      <i /> {children}
    </span>
  );
}

function Card({ id }: { id: (typeof CARDS)[number]['id'] }) {
  if (id === 'row')
    return (
      <a className="rfd-row" href="#/demo/request-flow">
        <span className="rfd-row__icon">
          <FileText size={18} />
        </span>
        <span className="rfd-row__title">
          {f.title} <span className="faint">· v{prop.version}</span>
        </span>
        <Pill>Changes requested</Pill>
        <span className="rfd-row__num">{aed(prop.total)}</span>
        <span className="rfd-row__comments">
          <MessageSquareText size={14} /> {fb.comments.length + 1}
        </span>
        <ChevronRight size={18} className="faint" />
      </a>
    );
  if (id === 'status')
    return (
      <a className="rfd-card rfd-card--status" href="#/demo/request-flow">
        <div className="rfd-band">
          <Avatar person={fb.by} size={22} />
          <span>
            <strong>{first} asked for changes</strong> · {fb.at}
          </span>
          <span className="rfd-band__next">Your move: send version {prop.version + 1}</span>
        </div>
        <div className="rfd-card__body">
          <div className="rfd-card__eyebrow">Proposal v{prop.version} · sent {prop.sent}</div>
          <div className="rfd-card__title">{f.title}</div>
          <div className="rfd-card__facts">
            <span>
              <b>{aed(prop.total)}</b> excl. VAT
            </span>
            <span>
              <b>{f.phases!.reduce((a, p) => a + Number(p.weeks), 0)}</b> weeks
            </span>
            <span>
              <b>{f.scope!.length}</b> deliverables
            </span>
          </div>
          <p className="rfd-quote">“{fb.note}”</p>
          <div className="rfd-card__foot">
            <span className="faint">{fb.comments.length} comments on Investment and Timeline</span>
            <span className="rfd-open">
              Open proposal <ArrowRight size={15} />
            </span>
          </div>
        </div>
      </a>
    );
  return (
    <a className="rfd-card" href="#/demo/request-flow">
      <div className="rfd-card__top">
        <div>
          <div className="rfd-card__eyebrow">Proposal v{prop.version}</div>
          <div className="rfd-card__title">{f.title}</div>
        </div>
        <Pill>Changes requested</Pill>
      </div>
      <div className="rfd-card__facts">
        <span>
          <b>{aed(prop.total)}</b> excl. VAT
        </span>
        <span className="faint">Sent {prop.sent}</span>
      </div>
      <div className="rfd-card__note">
        <Avatar person={fb.by} size={20} />
        <p>
          <strong>{first}:</strong> {fb.note}
        </p>
      </div>
      <ChevronRight size={20} className="rfd-card__chev" />
    </a>
  );
}

// ---- Step 2 · the opened proposal -------------------------------------------------------------

const VIEWS = [
  {
    id: 'inline',
    name: 'A · Note on top, comments in the section',
    note: 'The client’s note as a banner above the sections. The menu has no progress: sections with comments are marked with a warm dot and a count. Each comment sits at the foot of its section.',
  },
  {
    id: 'margin',
    name: 'B · Comments in the right margin',
    note: 'Like a document with comments: the proposal in the middle, each comment in a margin column on the right, level with its section. The note is pinned at the top of the margin.',
  },
  {
    id: 'checklist',
    name: 'C · Changes as a checklist',
    note: 'A “What to change” panel on top lists every comment with a link to its section and a tick to mark it handled. Commented sections get a warm edge.',
  },
] as const;

function SectionText({ id }: { id: SectionId }) {
  if (id === 'overview') return <p>{f.summary}</p>;
  if (id === 'objectives')
    return (
      <ul>
        {f.objectives!.map((o) => (
          <li key={o}>{o}</li>
        ))}
      </ul>
    );
  if (id === 'scope')
    return (
      <ul>
        {f.scope!.map((s) => (
          <li key={s.title}>
            <b>{s.title}.</b> {s.detail}
          </li>
        ))}
      </ul>
    );
  if (id === 'timeline')
    return (
      <p>
        {f.phases!.map((p) => `${p.name} ${p.weeks} wk`).join(' · ')} · starts 1 Jul 2027
      </p>
    );
  if (id === 'investment')
    return (
      <ul>
        {f.lines!.map((l) => (
          <li key={l.item}>
            {l.item} <span className="faint">AED {l.amount}</span>
          </li>
        ))}
      </ul>
    );
  if (id === 'terms')
    return (
      <ul>
        {f.terms!.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    );
  return <p className="faint">{f.file}</p>;
}

function Comment({ text }: { text: string }) {
  return (
    <div className="rfd-comment">
      <div className="rfd-comment__who">
        <Avatar person={fb.by} size={20} />
        <strong>{fb.by.name}</strong>
        <span className="faint">· {fb.at}</span>
      </div>
      <p>{text}</p>
    </div>
  );
}

function Menu({ edge }: { edge?: boolean }) {
  return (
    <nav className="rfd-menu">
      {SECTIONS.map((s, i) => {
        const n = commentsOn(s.id).length;
        return (
          <a key={s.id} className={`rfd-menu__item${i === 0 ? ' is-active' : ''}${n && edge ? ' has-edge' : ''}`} href={`#/demo/request-flow`}>
            <span>{s.label}</span>
            {n > 0 && (
              <span className="rfd-menu__count">
                <i /> {n}
              </span>
            )}
          </a>
        );
      })}
    </nav>
  );
}

function Banner() {
  return (
    <div className="rfd-banner">
      <Avatar person={fb.by} size={28} />
      <div>
        <div>
          <strong>{first} asked for changes</strong> <span className="faint">· {fb.at}</span>
        </div>
        <p>“{fb.note}”</p>
      </div>
    </div>
  );
}

function ProposalHead() {
  return (
    <div className="rfd-phead">
      <div>
        <div className="rfd-card__eyebrow">
          {req.id} · Proposal v{prop.version} · sent {prop.sent}
        </div>
        <div className="rfd-phead__title">{f.title}</div>
      </div>
      <div className="rfd-phead__right">
        <Pill>Changes requested</Pill>
        <span className="rfd-btn">Start version {prop.version + 1}</span>
      </div>
    </div>
  );
}

function View({ id }: { id: (typeof VIEWS)[number]['id'] }) {
  const [done, setDone] = useState<number[]>([]);
  const sections = SECTIONS.map((s) => {
    const cs = commentsOn(s.id);
    return (
      <section key={s.id} className={`rfd-sec${cs.length && id === 'checklist' ? ' has-edge' : ''}`}>
        <h4>{s.label}</h4>
        <SectionText id={s.id} />
        {id === 'inline' && cs.map((c, i) => <Comment key={i} text={c.text} />)}
      </section>
    );
  });
  return (
    <div className="rfd-view">
      <ProposalHead />
      {id === 'inline' && <Banner />}
      {id === 'checklist' && (
        <div className="rfd-todo">
          <div className="rfd-todo__head">
            <strong>What to change</strong>
            <span className="faint">
              {done.length} of {fb.comments.length + 1} handled
            </span>
          </div>
          {[{ section: 'Whole proposal', text: fb.note! }, ...ordered].map((c, i) => (
            <label key={i} className={`rfd-todo__item${done.includes(i) ? ' is-done' : ''}`}>
              <button
                type="button"
                className="rfd-tick"
                onClick={() => setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))}
                aria-label="Mark as handled"
              >
                {done.includes(i) && <Check size={12} />}
              </button>
              <span className="rfd-todo__where">{c.section}</span>
              <span className="rfd-todo__text">{c.text}</span>
            </label>
          ))}
        </div>
      )}
      <div className={`rfd-body rfd-body--${id}`}>
        <Menu edge={id === 'checklist'} />
        <div className="rfd-doc">{sections}</div>
        {id === 'margin' && (
          <aside className="rfd-margin">
            <div className="rfd-note">
              <div className="rfd-comment__who">
                <Avatar person={fb.by} size={20} />
                <strong>{first} asked for changes</strong>
              </div>
              <p>{fb.note}</p>
            </div>
            {ordered.map((c, i) => (
              <div key={i} className="rfd-mcomment">
                <span className="rfd-todo__where">{c.section}</span>
                <p>{c.text}</p>
                <span className="faint">
                  {first} · {fb.at}
                </span>
              </div>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}

// ---- Page ---------------------------------------------------------------------------------------

export function RequestFlowDemo() {
  const [step, setStep] = useState<'card' | 'view'>('card');
  return (
    <div className="cdemo rfdemo">
      <PageHeader
        title="Request → proposal"
        sub="The manager’s flow on a request whose proposal the client asked to change (REQ-203). Step 1: the proposal on the request page. Step 2: the opened proposal with the client’s note and comments."
      />
      <Tabs
        className="tabs--underline"
        value={step}
        onChange={setStep}
        items={[
          { value: 'card', label: '1 · On the request page' },
          { value: 'view', label: '2 · Opened proposal' },
        ]}
      />
      <div className="rfdemo__list">
        {(step === 'card' ? CARDS : VIEWS).map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className="rfdemo__stage">{step === 'card' ? <Card id={v.id as (typeof CARDS)[number]['id']} /> : <View id={v.id as (typeof VIEWS)[number]['id']} />}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

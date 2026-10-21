// Prototype-only page (#/demo/proposal-doc): the proposal as a document, after Google Docs. An editable
// title ("Untitled proposal" until named), a save state beside it that turns from "Draft saving…" to
// "Draft saved" as the manager types (nothing to save by hand), the sections written straight on the
// page, and the client's comments in a column on the right (one list, no Open/Resolved split).
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CornerDownRight, History, Search, Send, X } from 'lucide-react';
import { Avatar, Button, PageHeader, cx } from '../../components/ui/primitives';
import type { Person } from '../../data/types';
import { diffWords } from '../../lib/diffWords';

const layla: Person = { id: 'u-layla', name: 'Layla Haddad', email: '', title: '', org: 'client', hue: 20 };
const omar: Person = { id: 'u-omar', name: 'Omar Saeed', email: '', title: '', org: 'client', hue: 150 };
const dana: Person = { id: 's-dana', name: 'Dana Kareem', email: '', title: '', org: 'spark', hue: 230 };

type SectionId = 'overview' | 'objectives' | 'scope' | 'timeline' | 'investment' | 'terms';
const SECTIONS: { id: SectionId; label: string; placeholder: string; text: string }[] = [
  { id: 'overview', label: 'Overview', placeholder: 'What the project is, in two or three sentences', text: 'A 10-week programme from positioning to opening week. Films move to a second wave around Ramadan and are quoted separately.' },
  { id: 'objectives', label: 'Objectives', placeholder: 'What the client wants to achieve', text: 'Make Brand Co. the most talked-about store opening in Riyadh in January 2027.\nPosition Brand Co. on regional design and craft, not on being “from Dubai”.' },
  { id: 'scope', label: 'Scope & deliverables', placeholder: 'What the client gets, one line per deliverable', text: 'KSA positioning\nCampaign idea and key visual\nLaunch content\nLaunch event identity' },
  { id: 'timeline', label: 'Timeline', placeholder: 'The phases and when work starts', text: 'Discovery 2 wk · Concept 3 wk · Production 4 wk · Launch 1 wk\nStarts 9 Nov 2026' },
  { id: 'investment', label: 'Investment', placeholder: 'The price, line by line', text: 'KSA positioning · AED 38,000\nCampaign idea and key visual · AED 52,000\nLaunch content · AED 64,000' },
  { id: 'terms', label: 'Terms', placeholder: 'Payment, revisions and anything else that applies', text: '' },
];

interface Thread {
  n: number;
  section: SectionId;
  by: Person;
  at: string;
  text: string;
  replies: { by: Person; at: string; text: string }[];
  resolved: boolean;
}
/** The versions sent so far, newest first, for the version history panel. */
const VERSIONS: { v: number; label: string; when: string; note: string; by: Person; sent?: string; changes?: Partial<Record<SectionId, string>> }[] = [
  { v: 3, label: 'Current version', when: 'Today, 11:20', note: 'Being edited · not sent yet', by: dana },
  {
    v: 2,
    label: 'Version 2',
    when: '6 Oct, 10:05',
    note: 'Sent to Layla · changes requested',
    by: dana,
    sent: '6 Oct',
    changes: { timeline: 'Discovery 2 wk · Concept 3 wk · Production 4 wk · Launch 1 wk\nStarts 2 Nov 2026' },
  },
  {
    v: 1,
    label: 'Version 1',
    when: '29 Sep, 16:40',
    note: 'Sent to Layla · changes requested',
    by: dana,
    sent: '29 Sep',
    changes: {
      overview: 'An 11-week programme from positioning to opening week, with two launch films shot in Riyadh.',
      investment: 'KSA positioning · AED 38,000\nCampaign idea and key visual · AED 52,000\nLaunch content · AED 72,000\nLaunch films · AED 28,000',
    },
  },
];

const SEED: Thread[] = [
  { n: 1, section: 'scope', by: omar, at: '7 Oct', text: 'Can the creator shortlist include at least 3 Arabic-first creators?', replies: [{ by: dana, at: '7 Oct', text: 'Yes, we’ll make it at least half Arabic-first.' }], resolved: false },
  { n: 2, section: 'timeline', by: layla, at: '9 Oct', text: 'Starting 9 November clashes with the school holidays. 16 November works better.', replies: [], resolved: false },
  { n: 3, section: 'investment', by: layla, at: '9 Oct', text: 'Launch content is the biggest line. Can it come down if we use our own photographers?', replies: [], resolved: false },
];

/** A cloud with two arrows going round (saving), or with a tick (saved), after Google Docs. */
function CloudIcon({ saving }: { saving: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {saving ? (
        <g className="pdd-spin">
          <path d="M20 12a8 8 0 0 1-13.7 5.6" />
          <path d="M4 12a8 8 0 0 1 13.7-5.6" />
          <path d="M17.5 2.8v3.8h-3.8" />
          <path d="M6.5 21.2v-3.8h3.8" />
        </g>
      ) : (
        <>
          <path d="M7 18.5h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.6-1.4A4.5 4.5 0 0 0 7 18.5z" />
          <path d="m9.5 13.2 2 2 3.5-3.6" />
        </>
      )}
    </svg>
  );
}

export function ProposalDocDemo() {
  const [title, setTitle] = useState('');
  const [texts, setTexts] = useState<Record<SectionId, string>>(() => Object.fromEntries(SECTIONS.map((s) => [s.id, s.text])) as Record<SectionId, string>);
  const [saving, setSaving] = useState(false);
  const timer = useRef<number>();
  const [threads, setThreads] = useState(SEED);
  const [active, setActive] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState<number | null>(null);
  const refs = useRef<Partial<Record<SectionId, HTMLElement | null>>>({});
  // Version history opens as a drawer; picking an older version shows it read only, with a note on top.
  const [drawer, setDrawer] = useState(false);
  const [picked, setPicked] = useState(3);
  const old = VERSIONS.find((x) => x.v === picked && x.v !== 3);
  // Each version's words: the current text, then each older version's own changes over the one after it.
  const textAt = (v: number, id: SectionId): string => {
    if (v >= 3) return texts[id];
    const ver = VERSIONS.find((x) => x.v === v);
    return ver?.changes?.[id] ?? textAt(v + 1, id);
  };
  const textOf = (id: SectionId) => (old ? textAt(old.v, id) : texts[id]);
  // On an older version, what it changed from the one before it (version 1 has nothing to compare with).
  const beforeOf = (id: SectionId) => (old && old.v > 1 ? textAt(old.v - 1, id) : undefined);
  const changedHere = old && old.v > 1 ? SECTIONS.filter((x) => textAt(old.v, x.id) !== textAt(old.v - 1, x.id)) : [];

  // Everything saves by itself: "Draft saving…" while typing, "Draft saved" a moment after.
  const touched = () => {
    setSaving(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSaving(false), 900);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const activeT = threads.find((t) => t.n === active);
  const list = threads
    .filter((t) => !q.trim() || (t.text + ' ' + t.by.name).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(a.resolved) - Number(b.resolved));
  const select = (n: number) => {
    const t = threads.find((x) => x.n === n)!;
    setActive(n);
    setReply('');
    setReplying(null);
    refs.current[t.section]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const send = () => {
    if (!reply.trim() || active == null) return;
    setThreads((ts) => ts.map((t) => (t.n === active ? { ...t, replies: [...t.replies, { by: dana, at: 'Just now', text: reply.trim() }] } : t)));
    setReply('');
  };

  return (
    <div className="cdemo cpd pdd">
      <PageHeader title="Proposal as a document" sub="An editable title, a save state that runs by itself, the sections written on the page, and the client’s comments in one column on the right." />

      {/* The document bar: icon, the title (editable), the save state; Send on the right. */}
      <header className="pdd__bar">
        <span className="pdd__icon" aria-hidden>
          <svg viewBox="0 0 24 30" width="22" height="28">
            <path d="M2 0h14l8 8v20a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" fill="#4a72d8" />
            <path d="M16 0v6a2 2 0 0 0 2 2h6z" fill="#a9bfd9" />
            <path d="M6 15h12M6 19h12M6 23h8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <input
          className="pdd__title"
          value={title}
          placeholder="Untitled proposal"
          onChange={(e) => {
            setTitle(e.target.value);
            touched();
          }}
          size={Math.max(4, (title || 'Untitled proposal').length)}
          aria-label="Proposal title"
        />
        <span className={cx('pdd__save', saving && 'is-saving')}>
          <CloudIcon saving={saving} />
          {saving ? 'Draft saving…' : 'Draft saved'}
        </span>
        {/* On the right: version history (a drawer), then Send. */}
        <div className="pdd__tools">
          <button className={cx('pdd__iconbtn', drawer && 'is-on')} onClick={() => setDrawer(true)} data-tip="Version history" aria-label="Version history">
            <History size={20} />
          </button>
          <Button variant="primary" icon={Send}>
            Send proposal
          </Button>
        </div>
      </header>

      <div className="cpd__frame">
        <article className="cpd__doc pdd__doc">
          {/* An older version picked in the history: which one, read only, and the way back. */}
          {old && (
            <div className="spv-oldbar spv-info pdd__viewing">
              <div className="spv-info__head">
                <span className="vid__line">
                  <History size={16} /> You’re viewing <b>version {old.v}</b> · sent {old.sent}
                </span>
                <button className="pdd__back" onClick={() => setPicked(3)}>
                  Back to current version
                </button>
              </div>
              <span className="spv-oldbar__sub">
                {old.v === 1
                  ? 'The first version sent to Layla.'
                  : changedHere.length
                    ? `Changed from version ${old.v - 1}: ${changedHere.map((x) => x.label).join(', ')}. The changes are highlighted below.`
                    : `Nothing changed from version ${old.v - 1}.`}
              </span>
            </div>
          )}
          {SECTIONS.map((s) => {
            return (
              <section key={s.id} ref={(el) => (refs.current[s.id] = el)} className={cx('cpd__sec', activeT?.section === s.id && 'is-on')}>
                <div className="cpd__sec-head">
                  <h2>{s.label}</h2>
                </div>
                {/* Written straight on the page; every keystroke saves. An older version shows what it changed. */}
                {old && beforeOf(s.id) !== undefined && beforeOf(s.id) !== textOf(s.id) ? (
                  <div className="pdd__text pdd__text--diff">
                    {diffWords(beforeOf(s.id)!, textOf(s.id)).map((w, i) => (
                      <span key={i} className={cx(w.k === 'add' && 'spv-ins', w.k === 'del' && 'spv-cut')}>
                        {w.w}{' '}
                      </span>
                    ))}
                  </div>
                ) : (
                <textarea
                  className="pdd__text"
                  value={textOf(s.id)}
                  readOnly={!!old}
                  placeholder={s.placeholder}
                  rows={Math.max(2, textOf(s.id).split('\n').length)}
                  onChange={(e) => {
                    setTexts((t) => ({ ...t, [s.id]: e.target.value }));
                    touched();
                  }}
                />
                )}
              </section>
            );
          })}
        </article>

        <aside className="cpd__panel">
          <div className="cpd__panel-head">
            <strong>Comments</strong>
            <span className="faint">{threads.filter((t) => !t.resolved).length} open</span>
          </div>
          <div className="cpd__search">
            <Search size={15} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search comments" />
          </div>
          <div className="cpd__list pdd__list">
            {list.map((t) => {
              const label = SECTIONS.find((s) => s.id === t.section)!.label;
              const isActive = active === t.n;
              return (
                <div key={t.n} className={cx('cpd__item', isActive && 'is-active', t.resolved && 'is-resolved')} onClick={() => select(t.n)}>
                  <div className="cpd__item-top">
                    <span className="cpd__ref">
                      #{t.n} · {label}
                    </span>
                  </div>
                  <div className="cpd__who">
                    <Avatar person={t.by} size={22} />
                    <strong>{t.by.name}</strong>
                    <span className="faint">{t.at}</span>
                  </div>
                  <p className="cpd__text">{t.text}</p>
                  {t.replies.length > 0 && !isActive && <span className="cpd__count faint">{t.replies.length} {t.replies.length === 1 ? 'reply' : 'replies'}</span>}
                  {isActive && (
                    <div className="cpd__thread" onClick={(e) => e.stopPropagation()}>
                      {t.replies.map((r, i) => (
                        <div key={i} className="cpd__reply">
                          <div className="cpd__who">
                            <Avatar person={r.by} size={20} />
                            <strong>{r.by.name}</strong>
                            <span className="faint">{r.at}</span>
                          </div>
                          <p className="cpd__text">{r.text}</p>
                        </div>
                      ))}
                      {replying === t.n ? (
                        <div className="cpd__replybox">
                          <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Reply" autoFocus />
                        </div>
                      ) : (
                        <button className="pdd__replybtn" onClick={() => setReplying(t.n)}>
                          <CornerDownRight size={14} /> Reply
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Version history: a drawer from the right, newest first; the current version on top. */}
      {drawer &&
        createPortal(
        <div className="pdd__scrim" onClick={() => setDrawer(false)}>
          <aside className="pdd__drawer" onClick={(e) => e.stopPropagation()} aria-label="Version history">
            <div className="pdd__drawer-head">
              <strong>Version history</strong>
              <button className="pdd__iconbtn" onClick={() => setDrawer(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="pdd__versions">
              {VERSIONS.map((x) => (
                <button
                  key={x.v}
                  className={cx('pdd__version', picked === x.v && 'is-on')}
                  onClick={() => {
                    setPicked(x.v);
                    setDrawer(false);
                  }}
                >
                  <span className="pdd__version-when">{x.when}</span>
                  <span className="pdd__version-label">{x.label}</span>
                  <span className="pdd__version-note">{x.note}</span>
                  <span className="pdd__version-by">
                    <Avatar person={x.by} size={16} /> {x.by.name}
                  </span>
                </button>
              ))}
            </div>
          </aside>
        </div>,
          document.body,
        )}
    </div>
  );
}

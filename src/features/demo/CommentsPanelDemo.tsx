// Prototype-only page (#/demo/comments-panel): the client's comments taken out of the proposal into a
// column on the right, as in Figma. Each comment names its section; clicking it highlights that section
// (and scrolls to it); a numbered pin by the section title selects the comment back. Resolve and reply
// happen in the column.
import { useMemo, useRef, useState } from 'react';
import { Check, CornerDownRight, History, MessageSquare, Search } from 'lucide-react';
import { Avatar, PageHeader, Tabs, cx } from '../../components/ui/primitives';
import type { Person } from '../../data/types';

const layla: Person = { id: 'u-layla', name: 'Layla Haddad', email: '', title: '', org: 'client', hue: 20 };
const omar: Person = { id: 'u-omar', name: 'Omar Saeed', email: '', title: '', org: 'client', hue: 150 };
const dana: Person = { id: 's-dana', name: 'Dana Kareem', email: '', title: '', org: 'spark', hue: 230 };

type SectionId = 'overview' | 'objectives' | 'scope' | 'timeline' | 'investment' | 'terms';
const SECTIONS: { id: SectionId; label: string; body: string[] }[] = [
  { id: 'overview', label: 'Overview', body: ['A 10-week programme from positioning to opening week. Films move to a second wave around Ramadan and are quoted separately.'] },
  { id: 'objectives', label: 'Objectives', body: ['Make Brand Co. the most talked-about store opening in Riyadh in January 2027.', 'Position Brand Co. on regional design and craft, not on being “from Dubai”.'] },
  { id: 'scope', label: 'Scope & deliverables', body: ['KSA positioning', 'Campaign idea and key visual', 'Launch content', 'Launch event identity'] },
  { id: 'timeline', label: 'Timeline', body: ['Discovery 2 wk · Concept 3 wk · Production 4 wk · Launch 1 wk', 'Start 9 Nov 2026 · End 17 Jan 2027'] },
  { id: 'investment', label: 'Investment', body: ['KSA positioning · AED 38,000', 'Campaign idea and key visual · AED 52,000', 'Launch content · AED 64,000', 'Total · AED 186,000 excl. VAT'] },
  { id: 'terms', label: 'Terms', body: ['Prices exclude VAT. 50% on approval, 50% on launch.', 'Two rounds of revisions per deliverable.'] },
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
const SEED: Thread[] = [
  { n: 1, section: 'scope', by: omar, at: '7 Oct', text: 'Can the creator shortlist include at least 3 Arabic-first creators?', replies: [{ by: dana, at: '7 Oct', text: 'Yes, we’ll make it at least half Arabic-first.' }], resolved: false },
  { n: 2, section: 'timeline', by: layla, at: '9 Oct', text: 'Starting 9 November clashes with the school holidays. 16 November works better.', replies: [], resolved: false },
  { n: 3, section: 'investment', by: layla, at: '9 Oct', text: 'Launch content is the biggest line. Can it come down if we use our own photographers?', replies: [], resolved: false },
  { n: 4, section: 'overview', by: layla, at: '2 Oct', text: 'Love the second wave idea for the films.', replies: [], resolved: true },
];

export function CommentsPanelDemo() {
  const [threads, setThreads] = useState(SEED);
  const [active, setActive] = useState<number | null>(null);
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open');
  const [q, setQ] = useState('');
  const [reply, setReply] = useState('');
  const refs = useRef<Partial<Record<SectionId, HTMLElement | null>>>({});

  const list = useMemo(
    () =>
      threads.filter(
        (t) =>
          (filter === 'all' || (filter === 'open' ? !t.resolved : t.resolved)) &&
          (!q.trim() || (t.text + ' ' + t.by.name + ' ' + SECTIONS.find((s) => s.id === t.section)!.label).toLowerCase().includes(q.toLowerCase())),
      ),
    [threads, filter, q],
  );
  const activeT = threads.find((t) => t.n === active);

  const select = (n: number) => {
    const t = threads.find((x) => x.n === n)!;
    setActive(n);
    setReply('');
    refs.current[t.section]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const resolve = (n: number) => setThreads((ts) => ts.map((t) => (t.n === n ? { ...t, resolved: !t.resolved } : t)));
  const send = () => {
    if (!reply.trim() || active == null) return;
    setThreads((ts) => ts.map((t) => (t.n === active ? { ...t, replies: [...t.replies, { by: dana, at: 'Just now', text: reply.trim() }] } : t)));
    setReply('');
  };

  return (
    <div className="cdemo cpd">
      <PageHeader
        title="Comments in a column"
        sub="The client’s comments live in a column on the right, as in Figma. Click a comment to highlight its section; click a pin by a section title to open its comment. Resolve and reply in the column."
      />
      <div className="cpd__frame">
        {/* The proposal, with a numbered pin by every section that has open comments. */}
        <article className="cpd__doc">
          <div className="spv-oldbar spv-info cpd__info">
            <div className="spv-info__head">
              <span className="vid__line">
                <History size={16} /> You’re viewing <b>version 2</b> · sent 6 Oct
              </span>
              <span className="spv-status spv-status--changes_requested">
                <i /> Changes requested
              </span>
            </div>
          </div>
          {SECTIONS.map((s) => {
            const pins = threads.filter((t) => t.section === s.id && !t.resolved);
            const on = activeT?.section === s.id;
            return (
              <section key={s.id} ref={(el) => (refs.current[s.id] = el)} className={cx('cpd__sec', on && 'is-on')}>
                <div className="cpd__sec-head">
                  <h2>{s.label}</h2>
                  {pins.map((t) => (
                    <button key={t.n} className={cx('cpd__pin', active === t.n && 'is-active')} onClick={() => select(t.n)} aria-label={`Comment ${t.n}`}>
                      <Avatar person={t.by} size={20} />
                      <span>{t.n}</span>
                    </button>
                  ))}
                </div>
                {s.body.map((b) => (
                  <p key={b}>{b}</p>
                ))}
              </section>
            );
          })}
        </article>

        {/* The comments column. */}
        <aside className="cpd__panel">
          <div className="cpd__panel-head">
            <strong>Comments</strong>
            <span className="faint">{threads.filter((t) => !t.resolved).length} open</span>
          </div>
          <div className="cpd__search">
            <Search size={15} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search comments" />
          </div>
          <Tabs
            className="tabs--underline cpd__tabs"
            value={filter}
            onChange={setFilter}
            items={[
              { value: 'open', label: 'Open', count: threads.filter((t) => !t.resolved).length },
              { value: 'resolved', label: 'Resolved', count: threads.filter((t) => t.resolved).length },
              { value: 'all', label: 'All' },
            ]}
          />
          <div className="cpd__list">
            {list.length === 0 && (
              <div className="cpd__empty faint">
                <MessageSquare size={18} /> No comments here.
              </div>
            )}
            {list.map((t) => {
              const label = SECTIONS.find((s) => s.id === t.section)!.label;
              const isActive = active === t.n;
              return (
                <div key={t.n} className={cx('cpd__item', isActive && 'is-active', t.resolved && 'is-resolved')} onClick={() => select(t.n)}>
                  <div className="cpd__item-top">
                    <span className="cpd__ref">
                      #{t.n} · {label}
                    </span>
                    <button
                      className={cx('cpd__resolve', t.resolved && 'is-done')}
                      onClick={(e) => {
                        e.stopPropagation();
                        resolve(t.n);
                      }}
                      data-tip={t.resolved ? 'Reopen' : 'Resolve'}
                      aria-label={t.resolved ? 'Reopen' : 'Resolve'}
                    >
                      <Check size={13} strokeWidth={2.6} />
                    </button>
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
                      <div className="cpd__replybox">
                        <CornerDownRight size={14} className="faint" />
                        <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Reply" autoFocus />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

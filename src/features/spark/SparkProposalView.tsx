// The proposal as the Spark manager sees it (#/spark/requests/<id>/proposal), laid out as a document
// (after #/demo/proposal-doc): a bar with the title, the status, the save state, the version history
// (a drawer) and the one action (Send while creating, Resend after changes were requested); the sections
// below, edited one at a time; the client's comments in a column on the right.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, ArrowLeft, History, CornerDownRight, PenLine, Plus, Send, Trash2, X } from 'lucide-react';
import { personById, useStore, type NewProposal } from '../../state/store';
import { Avatar, Button, EmptyState, Input, Textarea, cx } from '../../components/ui/primitives';
import { useToast } from '../../components/ui/toast';
import { aed, addDays, fmtDate, fmtDateTime } from '../../lib/format';
import { navigate } from '../../lib/router';
import { scopeIcon } from '../requests/ProposalView';
import type { Proposal } from '../../data/types';
import type { SampleProposal } from './sampleProposal';
import { diffWords } from '../../lib/diffWords';

type SectionId = 'overview' | 'objectives' | 'scope' | 'timeline' | 'investment' | 'terms';
export const SECTIONS: SectionId[] = ['overview', 'objectives', 'scope', 'timeline', 'investment', 'terms'];
const LABEL: Record<SectionId, string> = {
  overview: 'Overview',
  objectives: 'Objectives',
  scope: 'Scope & deliverables',
  timeline: 'Timeline',
  investment: 'Investment',
  terms: 'Terms',
};
/** The client's page names its sections like this when it comments. */
const COMMENT_SECTION: Record<SectionId, string> = {
  overview: 'Summary',
  objectives: 'Objectives',
  scope: 'Scope & deliverables',
  timeline: 'Timeline',
  investment: 'Investment',
  terms: 'Terms',
};
const SPARK_ME = 's-dana';
/** The "add a row" action each list section has, shown at the bottom of its edit box. */
const ADD_ROW: Partial<Record<SectionId, string>> = {
  objectives: 'Add an objective',
  scope: 'Add a deliverable',
  timeline: 'Add a phase',
  investment: 'Add a line',
  terms: 'Add a term',
};

const draftOf = (p: Proposal): NewProposal => ({
  title: p.title,
  summary: p.summary,
  objectives: [...p.objectives],
  scope: p.scope.map((s) => ({ title: s.title, detail: s.detail })),
  phases: p.phases.map((ph) => ({ ...ph })),
  startDate: p.startDate,
  validUntil: p.validUntil,
  investment: p.investment.map((l) => ({ ...l })),
  terms: [...p.terms],
});
/** Which part of a proposal each section shows, to tell what changed. */
const partOf = (d: NewProposal, id: SectionId) =>
  JSON.stringify(
    id === 'overview'
      ? [d.title, d.summary]
      : id === 'objectives'
        ? d.objectives
        : id === 'scope'
          ? d.scope
          : id === 'timeline'
            ? [d.phases, d.startDate.slice(0, 10)]
            : id === 'investment'
              ? d.investment
              : [d.terms, d.validUntil.slice(0, 10)],
  );
const statusOf = (p: Proposal) =>
  p.status === 'changes_requested'
    ? 'Changes requested'
    : p.status === 'approved'
      ? 'Approved'
      : p.status === 'declined'
        ? 'Declined'
        : p.status === 'superseded'
          ? 'Replaced'
          : 'Waiting for the client';

/** Whether a section has what it needs to be sent. */
export const isReady = (d: NewProposal, s: SectionId) =>
  s === 'overview'
    ? !!d.title.trim() && !!d.summary.trim()
    : s === 'objectives'
      ? d.objectives.some((o) => o.trim())
      : s === 'scope'
        ? d.scope.some((x) => x.title.trim())
        : s === 'timeline'
          ? d.phases.some((x) => x.name.trim() && x.weeks > 0)
          : s === 'investment'
            ? d.investment.some((x) => x.item.trim() && x.amount > 0)
            : d.terms.some((t) => t.trim());
/** A new proposal: everything empty but the title, work starting in two weeks. */
export const blankProposal = (title: string): NewProposal => {
  const today = new Date().toISOString().slice(0, 10);
  return { title, summary: '', objectives: [], scope: [], phases: [], startDate: addDays(today, 14), validUntil: addDays(today, 30), investment: [], terms: [] };
};
/** What an empty section says in place of its content. */
const ADD: Record<SectionId, string> = {
  overview: 'Add a summary',
  objectives: 'Add objectives',
  scope: 'Add deliverables',
  timeline: 'Add phases and a start date',
  investment: 'Add the price lines',
  terms: 'Add terms',
};
/** The draft without the empty rows the editors leave behind. */
const cleaned = (d: NewProposal): NewProposal => ({
  ...d,
  title: d.title.trim(),
  summary: d.summary.trim(),
  objectives: d.objectives.map((o) => o.trim()).filter(Boolean),
  scope: d.scope.filter((x) => x.title.trim()),
  phases: d.phases.filter((x) => x.name.trim() && x.weeks > 0),
  investment: d.investment.filter((x) => x.item.trim()),
  terms: d.terms.map((t) => t.trim()).filter(Boolean),
});

export function SparkProposalView({ id, sample }: { id: string; sample?: SampleProposal }) {
  const { state, actions } = useStore();
  const toast = useToast();
  // A sample request (another client) brings its own versions and people; Brand Co.'s come from the store.
  const stored = state.requests.find((r) => r.id === id);
  const req = stored ?? (sample ? { title: sample.title, createdBy: sample.client.id } : undefined);
  const versions = useMemo(
    () => sample?.proposals ?? state.proposals.filter((x) => x.requestId === id).sort((a, b) => a.version - b.version),
    [sample, state.proposals, id],
  );
  const who = (pid: string) => sample?.people.find((x) => x.id === pid) ?? personById(state, pid);
  const latest = versions[versions.length - 1];
  // The proposal being written (the first one, or the next version), saved as it is typed.
  const rec = state.sparkDrafts[id];
  const [idx, setIdx] = useState(versions.length - 1);
  // A draft opens first; the version menu switches to the sent versions.
  const [onDraft, setOnDraft] = useState(true);
  const [editing, setEditing] = useState<SectionId | null>(null);
  // The draft as it was when the current edit started, so Cancel undoes just that edit.
  const [editSnapshot, setEditSnapshot] = useState<NewProposal | null>(null);
  // Changes from the version before are always highlighted on an older version.
  const highlight = true;
  // The document bar: "Draft saving…" while typing, "Draft saved" a moment after; the version history drawer.
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<number>();
  useEffect(() => () => window.clearTimeout(saveTimer.current), []);
  const [drawer, setDrawer] = useState(false);
  // The comments column: the comment picked (its section is highlighted) and the one being replied to.
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  // Nothing written yet: opening the page starts the first draft.
  const nothing = !rec && !latest;
  useEffect(() => {
    if (nothing && req) actions.startSparkDraft(id, blankProposal(req.title));
  }, [nothing, id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!req)
    return (
      <EmptyState
        title="Request not found"
        body="This request doesn't exist any more."
        action={<Button onClick={() => navigate('/spark')}>Back to inbox</Button>}
      />
    );
  if (nothing) return null;

  const draft: NewProposal = rec ? rec.data : draftOf(latest!);
  const viewingDraft = !!rec && onDraft;
  // Editable while it's being created, or after the client asked for changes; otherwise it's read only.
  const canEdit = !latest || latest.status === 'changes_requested';
  const at = Math.max(0, Math.min(idx, versions.length - 1));
  const shown = viewingDraft ? undefined : versions[at];
  // The sent version whose comments and client answer show: on the draft, the latest one.
  const p: Proposal | undefined = shown ?? latest;
  const isLatest = viewingDraft || shown === latest;
  const nextV = (latest?.version ?? 0) + 1;
  const d = viewingDraft || !shown ? draft : draftOf(shown);
  // Editing a sent version is editing that version (no comparison); older versions compare with the one before.
  const baseP = viewingDraft ? undefined : at > 0 ? versions[at - 1] : undefined;
  const prev = baseP ? draftOf(baseP) : null;
  const sentLatest = latest ? draftOf(latest) : null;
  // Saved changes to the sent version (an open section counts as it was before the edit).
  const edits = rec && sentLatest ? SECTIONS.filter((s) => partOf(s === editing && editSnapshot ? editSnapshot : rec.data, s) !== partOf(sentLatest, s)) : [];
  const edited = (s: SectionId) =>
    viewingDraft && !!sentLatest && partOf(s === editing && editSnapshot ? editSnapshot : draft, s) !== partOf(sentLatest, s);
  // A section counts as ready once it's saved: while it's open, it's judged as it was before the edit.
  const saved = (s: SectionId) => isReady(s === editing && editSnapshot ? editSnapshot : draft, s);
  const ready = SECTIONS.filter(saved);
  const isEmpty = (s: SectionId) => viewingDraft && !isReady(draft, s);
  const hl = highlight && !!prev;
  const changedHere = prev && shown ? SECTIONS.filter((x) => partOf(draftOf(shown), x) !== partOf(prev, x)) : [];
  // The version on screen (the latest one while its changes are being made).
  const cur = shown ?? latest;
  const total = d.investment.reduce((a, l) => a + l.amount, 0);
  const weeks = d.phases.reduce((a, ph) => a + ph.weeks, 0);
  const client = who(req.createdBy);
  const first = client.name.split(' ')[0];
  const comments = p?.comments ?? [];
  // The comments column: the client's answer on this version first, then each client comment as a thread,
  // with the Spark team's answers in the same section as its replies.
  const sectionOf = (name?: string) => SECTIONS.find((x) => COMMENT_SECTION[x] === name);
  const threads: { id: string; label: string; section?: SectionId; by: string; at: string; text: string; replies: Proposal['comments'] }[] = [];
  if (cur?.decision)
    threads.push({
      id: 'decision',
      label: statusOf(cur),
      by: cur.decision.by,
      at: cur.decision.at,
      text: cur.decision.note || cur.decision.reason || (cur.status === 'approved' ? 'Approved the proposal.' : 'Declined the proposal.'),
      replies: [],
    });
  for (const c of comments) {
    const fromSpark = who(c.by).org === 'spark';
    const open = [...threads].reverse().find((t) => t.id !== 'decision' && t.section === sectionOf(c.section));
    if (fromSpark && open) open.replies.push(c);
    else threads.push({ id: c.id, label: c.section ? LABEL[sectionOf(c.section) ?? 'overview'] : 'Whole proposal', section: sectionOf(c.section), by: c.by, at: c.at, text: c.text, replies: [] });
  }
  const activeSec = threads.find((t) => t.id === activeComment)?.section;
  const pickComment = (tid: string) => {
    setActiveComment(tid);
    setReplyFor(null);
    setReplyText('');
    const sec = threads.find((t) => t.id === tid)?.section;
    if (sec) document.getElementById(`sec-${sec}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const go = (k: number) => {
    setIdx(k);
    setOnDraft(false);
    setEditing(null);
  };
  /** Editing happens on the draft; on a sent version, the first edit starts the next version's draft. */
  const startEdit = (s: SectionId) => {
    if (!rec) actions.startSparkDraft(id, draftOf(latest!), latest!.version);
    setOnDraft(true);
    setEditSnapshot(draft);
    setEditing(s);
    // An empty list opens with one blank row ready to type in, not just an "Add" link.
    if (rec) {
      const blank: Partial<NewProposal> =
        s === 'objectives' && !draft.objectives.length
          ? { objectives: [''] }
          : s === 'scope' && !draft.scope.length
            ? { scope: [{ title: '', detail: '' }] }
            : s === 'timeline' && !draft.phases.length
              ? { phases: [{ name: '', weeks: 1 }] }
              : s === 'investment' && !draft.investment.length
                ? { investment: [{ item: '', amount: 0 }] }
                : s === 'terms' && !draft.terms.length
                  ? { terms: [''] }
                  : {};
      if (Object.keys(blank).length) actions.saveSparkDraft(id, { ...draft, ...blank });
    }
  };
  const send = () => {
    if (sample) {
      actions.discardSparkDraft(id);
      toast({ title: latest ? 'Proposal resent' : 'Proposal sent', body: `${first} can review it now. (Sample client: nothing changes in the portal.)` });
      navigate(`/spark/requests/${id}`);
      return;
    }
    actions.sendProposal(id, cleaned(draft));
    toast({
      title: `Version ${nextV} sent`,
      body: latest ? `${first} will get it with your changes.` : `${first} sees it now: the request shows “Needs your decision” in the portal.`,
    });
    navigate(`/spark/requests/${id}`);
  };
  const set = (patch: Partial<NewProposal>) => {
    actions.saveSparkDraft(id, { ...draft, ...patch });
    setSaving(true);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => setSaving(false), 900);
  };
  const addRow = (s: SectionId) =>
    set(
      s === 'objectives'
        ? { objectives: [...draft.objectives, ''] }
        : s === 'scope'
          ? { scope: [...draft.scope, { title: '', detail: '' }] }
          : s === 'timeline'
            ? { phases: [...draft.phases, { name: '', weeks: 1 }] }
            : s === 'investment'
              ? { investment: [...draft.investment, { item: '', amount: 0 }] }
              : { terms: [...draft.terms, ''] },
    );

  /** One block: its head (title, marks, Edit), then the read view or the editor, then the client's comments. */
  const block = (s: SectionId, view: ReactNode, editor: ReactNode) => {
    return (
      <section className={cx('psec spv-sec', editing === s && 'is-editing', activeSec === s && 'is-on')} id={`sec-${s}`}>
        <div className="psec__head">
          <div className="spv-head__title">
            <h2 className="psec__title">
              {LABEL[s]}
            </h2>
            {canEdit && isLatest && editing !== s && !isEmpty(s) && (
              <button className="spv-edit spv-edit--icon" onClick={() => startEdit(s)} aria-label={`Edit ${LABEL[s]}`} data-tip="Edit">
                <PenLine size={15} />
              </button>
            )}
          </div>
          <div className="spv-head__tools">
            {/* A saved change to a sent proposal: a clear label in the corner, until it's sent again. */}
            {edited(s) && editing !== s && <span className="spv-updated">Updated</span>}
          </div>
        </div>
        {editing === s ? (
          <div className="spv-editor">
            {editor}
            <div className="spv-editor__bar">
              {/* Add a row, at the bottom left of the box; Cancel and Save on the right. */}
              {ADD_ROW[s] && (
                <button className="spv-add spv-add--bar" onClick={() => addRow(s)}>
                  <Plus size={14} /> {ADD_ROW[s]}
                </button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (editSnapshot) actions.saveSparkDraft(id, editSnapshot);
                  setEditing(null);
                }}
              >
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={() => setEditing(null)}>
                Save
              </Button>
            </div>
          </div>
        ) : isEmpty(s) ? (
          <button className="spv-empty" onClick={() => startEdit(s)}>
            <Plus size={15} /> {ADD[s]}
          </button>
        ) : (
          view
        )}
      </section>
    );
  };

  // ---- Diffs against the previous version ----
  const sameDay = (a?: string, b?: string) => (a ?? '').slice(0, 10) === (b ?? '').slice(0, 10);
  const listDiff = (now: string[], before: string[] | undefined) => ({
    isNew: (t: string) => hl && !!before && !before.includes(t),
    removed: hl && before ? before.filter((b) => !now.includes(b)) : [],
  });
  const objDiff = listDiff(d.objectives, prev?.objectives);
  const termDiff = listDiff(d.terms, prev?.terms);
  const removedScope = hl && prev ? prev.scope.filter((x) => !d.scope.some((y) => y.title === x.title)) : [];
  const removedLines = hl && prev ? prev.investment.filter((x) => !d.investment.some((y) => y.item === x.item)) : [];
  const prevTotal = prev ? prev.investment.reduce((a, l) => a + l.amount, 0) : 0;
  const startMoved = hl && !!prev && !sameDay(prev.startDate, d.startDate);
  let weekOffset = 0;

  return (
    <div className={cx('proposal spv', !latest && 'is-create')}>
      {/* The page header, as in the editor: Back; the request and its client; the title with the
          version menu; the one action on the right (Send while creating, Resend after changes were requested). */}
      <a className="back" href={`#/spark/requests/${id}`}>
        <ArrowLeft size={15} /> Back
      </a>
      {/* The document bar (after #/demo/proposal-doc): the icon, the title (editable while it can be edited),
          the status, the save state; on the right the version history and the one action. */}
      <header className="pdd__bar spv-docbar">
        <span className="pdd__icon" aria-hidden>
          <svg viewBox="0 0 24 30" width="22" height="28">
            <path d="M2 0h14l8 8v20a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" fill="#4a72d8" />
            <path d="M16 0v6a2 2 0 0 0 2 2h6z" fill="#a9bfd9" />
            <path d="M6 15h12M6 19h12M6 23h8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        {viewingDraft ? (
          <input
            className="pdd__title"
            value={draft.title}
            placeholder="Untitled proposal"
            onChange={(e) => set({ title: e.target.value })}
            size={Math.max(4, (draft.title || 'Untitled proposal').length)}
            aria-label="Proposal title"
          />
        ) : (
          <h1 className="pdd__title pdd__title--static">{d.title || 'Untitled proposal'}</h1>
        )}
        {cur && (
          <span className={cx('spv-status', `spv-status--${cur.status}`)}>
            <i /> {cur.status === 'awaiting' ? 'Waiting for client' : statusOf(cur)}
          </span>
        )}
        {viewingDraft && (
          <span className={cx('pdd__save', saving && 'is-saving')}>
            <SaveCloud saving={saving} />
            {saving ? 'Draft saving…' : 'Draft saved'}
          </span>
        )}
        <div className="pdd__tools">
          {versions.length > 0 && (
            <button className={cx('pdd__iconbtn', drawer && 'is-on')} onClick={() => setDrawer(true)} data-tip="Version history" aria-label="Version history">
              <History size={20} />
            </button>
          )}
          {canEdit && (
            <Button variant="primary" icon={Send} disabled={latest ? edits.length === 0 : ready.length < SECTIONS.length} onClick={send}>
              {latest ? 'Resend proposal' : 'Send proposal'}
            </Button>
          )}
        </div>
      </header>

      <div className={cx('proposal__layout', latest && 'spv-layout--comments')}>
        <article className="proposal__doc">


          {/* An older version picked in the history: which one, read only, what changed from the one before. */}
          {shown && shown !== latest && (
            <div className="spv-oldbar spv-info pdd__viewing">
              <div className="spv-info__head">
                <span className="vid__line">
                  <History size={16} /> You’re viewing <b>version {shown.version}</b> · sent {fmtDate(shown.sentAt)}
                </span>
                <button className="pdd__back" onClick={() => (rec ? setOnDraft(true) : go(versions.length - 1))}>
                  Back to current version
                </button>
              </div>
              <span className="spv-oldbar__sub">
                {prev
                  ? changedHere.length
                    ? `Changed from version ${baseP!.version}: ${changedHere.map((x) => LABEL[x]).join(', ')}. The changes are highlighted below.`
                    : `Nothing changed from version ${baseP!.version}.`
                  : `The first version sent to ${first}.`}
              </span>
            </div>
          )}

          {block(
            'overview',
            <p className="spv-summary">
              {hl && prev && prev.summary !== d.summary ? <Track before={prev.summary} now={d.summary} /> : d.summary}
            </p>,
            <>
              <label className="spv-label">Summary</label>
              <Textarea rows={3} value={draft.summary} onChange={(e) => set({ summary: e.target.value })} />
            </>,
          )}

          {block(
            'objectives',
            <ol className="objectives">
              {d.objectives.map((o, i) => (
                <li key={i} className={cx(objDiff.isNew(o) && 'spv-new')}>
                  <span className="list-num">{i + 1}.</span>
                  {o}
                </li>
              ))}
              {objDiff.removed.map((o) => (
                <li key={`x-${o}`} className="spv-removed">
                  <span className="list-num">–</span>
                  {o}
                </li>
              ))}
            </ol>,
            <ListEditor items={draft.objectives} onChange={(objectives) => set({ objectives })} />,
          )}

          {block(
            'scope',
            <div className="scope">
              {d.scope.map((s, i) => {
                const Icon = scopeIcon(s.title);
                const before = prev?.scope.find((x) => x.title === s.title);
                const isNew = hl && !before;
                const changed = hl && !!before && before.detail !== s.detail;
                return (
                  <div key={i} className={cx('scope__item', isNew && 'spv-new')}>
                    <span className="scope__icon">
                      <Icon size={22} strokeWidth={1.7} />
                    </span>
                    <div className="scope__title">
                      {s.title}
                      {isNew && <span className="spv-badge">Added</span>}
                    </div>
                    {s.detail && (
                      <p className="muted">
                        {changed ? <Track before={before!.detail} now={s.detail} /> : s.detail}
                      </p>
                    )}
                  </div>
                );
              })}
              {removedScope.map((s) => (
                <div key={`x-${s.title}`} className="scope__item spv-removed">
                  <span className="scope__icon">
                    <Trash2 size={20} strokeWidth={1.7} />
                  </span>
                  <div className="scope__title">
                    {s.title}
                    <span className="spv-badge spv-badge--removed">Removed</span>
                  </div>
                  {s.detail && <p className="muted">{s.detail}</p>}
                </div>
              ))}
            </div>,
            <RowsEditor
              rows={draft.scope}
              onChange={(scope) => set({ scope })}
             
              fields={[
                { key: 'title', placeholder: 'Deliverable', width: '1fr' },
                { key: 'detail', placeholder: 'What it is', width: '2fr' },
              ]}
            />,
          )}

          {block(
            'timeline',
            <div className="gantt" role="list">
              {d.phases.map((ph, i) => {
                const start = weekOffset;
                weekOffset += ph.weeks;
                const before = prev?.phases.find((x) => x.name === ph.name);
                const moved = hl && !!before && before.weeks !== ph.weeks;
                return (
                  <div key={i} className="gantt__row" role="listitem">
                    <div className="gantt__label">
                      <span>{ph.name}</span>
                      <span className="faint spv-weeks">
                        {moved && <s className="spv-cut">{before!.weeks}</s>}
                        <span className={cx(moved && 'spv-ins')}>{ph.weeks} wk</span>
                      </span>
                    </div>
                    <div className="gantt__track">
                      <span className="gantt__bar" style={{ left: `${(start / (weeks || 1)) * 100}%`, width: `${(ph.weeks / (weeks || 1)) * 100}%` }}>
                        <span>{fmtDate(addDays(d.startDate, start * 7))}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="gantt__foot faint">
                <span>
                  Start {startMoved && <s className="spv-cut">{fmtDate(prev!.startDate)}</s>}{' '}
                  <span className={cx(startMoved && 'spv-ins')}>{fmtDate(d.startDate, { year: true })}</span>
                </span>
                <span>End {fmtDate(addDays(d.startDate, weeks * 7), { year: true })}</span>
              </div>
            </div>,
            <>
              {/* The start date first, then the phases, so a new phase lands at the bottom, by "Add a phase". */}
              <label className="spv-label">Work starts</label>
              <Input type="date" value={draft.startDate.slice(0, 10)} onChange={(e) => set({ startDate: e.target.value })} />
              <label className="spv-label">Phases</label>
              <RowsEditor
                rows={draft.phases}
                onChange={(phases) => set({ phases })}
                fields={[
                  { key: 'name', placeholder: 'Phase', width: '2fr' },
                  { key: 'weeks', placeholder: 'Weeks', width: '100px', number: true },
                ]}
              />
            </>,
          )}

          {block(
            'investment',
            <table className="table invest">
              <tbody>
                {d.investment.map((l, i) => {
                  const before = prev?.investment.find((x) => x.item === l.item);
                  const isNew = hl && !before;
                  const changed = hl && !!before && before.amount !== l.amount;
                  return (
                    <tr key={i} className={cx(isNew && 'spv-new')}>
                      <td>
                        {l.item}
                        {isNew && <span className="spv-badge">Added</span>}
                      </td>
                      <td className="num mono">
                        {changed && <s className="spv-cut">{aed(before!.amount)}</s>}{' '}
                        <span className={cx(changed && 'spv-ins')}>{aed(l.amount)}</span>
                      </td>
                    </tr>
                  );
                })}
                {removedLines.map((l) => (
                  <tr key={`x-${l.item}`} className="spv-removed">
                    <td>
                      {l.item}
                      <span className="spv-badge spv-badge--removed">Removed</span>
                    </td>
                    <td className="num mono">{aed(l.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total, excl. VAT</td>
                  <td className="num mono">
                    {hl && prevTotal !== total && <s className="spv-cut">{aed(prevTotal)}</s>}{' '}
                    <span className={cx(hl && prevTotal !== total && 'spv-ins')}>{aed(total)}</span>
                  </td>
                </tr>
              </tfoot>
            </table>,
            <>
              <RowsEditor
                rows={draft.investment}
                onChange={(investment) => set({ investment })}
               
                fields={[
                  { key: 'item', placeholder: 'Line item', width: '2fr' },
                  { key: 'amount', placeholder: 'AED', width: '140px', number: true },
                ]}
              />
              <div className="spv-total">
                Total <b>{aed(total)}</b> excl. VAT
              </div>
            </>,
          )}

          {block(
            'terms',
            <ul className="terms">
              {d.terms.map((t, i) => (
                <li key={i} className={cx(termDiff.isNew(t) && 'spv-new')}>
                  {t}
                </li>
              ))}
              {termDiff.removed.map((t) => (
                <li key={`x-${t}`} className="spv-removed">
                  {t}
                </li>
              ))}
              <li>
                Valid until {hl && !sameDay(prev?.validUntil, d.validUntil) && <s className="spv-cut">{fmtDate(prev!.validUntil, { year: true })}</s>}{' '}
                <span className={cx(hl && !sameDay(prev?.validUntil, d.validUntil) && 'spv-ins')}>{fmtDate(d.validUntil, { year: true })}</span>.
              </li>
            </ul>,
            <>
              <label className="spv-label">Valid until</label>
              <Input type="date" value={draft.validUntil.slice(0, 10)} onChange={(e) => set({ validUntil: e.target.value })} />
              <label className="spv-label">Terms</label>
              <ListEditor items={draft.terms} onChange={(terms) => set({ terms })} />
            </>,
          )}


        </article>

        {/* After sending: the client's comments in a column (after #/demo/proposal-doc). Picking one highlights
            its section; replying is its own button. */}
        {latest && (
          <aside className="cpd__panel spv-comments-col">
            <div className="cpd__panel-head">
              <strong>Comments</strong>
              <span className="faint">{threads.length}</span>
            </div>
            <div className="cpd__list pdd__list">
              {threads.length === 0 && <div className="cpd__empty faint">No comments on this version.</div>}
              {threads.map((t) => {
                const isOn = activeComment === t.id;
                return (
                  <div key={t.id} className={cx('cpd__item', isOn && 'is-active')} onClick={() => pickComment(t.id)}>
                    <span className="cpd__ref">{t.label}</span>
                    <div className="cpd__who">
                      <Avatar person={who(t.by)} size={22} />
                      <strong>{who(t.by).name}</strong>
                      <span className="faint">{fmtDate(t.at)}</span>
                    </div>
                    <p className="cpd__text">{t.text}</p>
                    {t.replies.length > 0 && !isOn && (
                      <span className="cpd__count faint">
                        {t.replies.length} {t.replies.length === 1 ? 'reply' : 'replies'}
                      </span>
                    )}
                    {isOn && (
                      <div className="cpd__thread" onClick={(e) => e.stopPropagation()}>
                        {t.replies.map((r) => (
                          <div key={r.id} className="cpd__reply">
                            <div className="cpd__who">
                              <Avatar person={who(r.by)} size={20} />
                              <strong>{who(r.by).name}</strong>
                              <span className="faint">{fmtDate(r.at)}</span>
                            </div>
                            <p className="cpd__text">{r.text}</p>
                          </div>
                        ))}
                        {!sample && t.id !== 'decision' && p && isLatest && (replyFor === t.id ? (
                          <div className="cpd__replybox">
                            <input
                              autoFocus
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && replyText.trim()) {
                                  actions.commentOnProposal(p.id, replyText.trim(), t.section ? COMMENT_SECTION[t.section] : undefined, SPARK_ME);
                                  setReplyText('');
                                  setReplyFor(null);
                                }
                              }}
                              placeholder="Reply"
                            />
                          </div>
                        ) : (
                          <button className="pdd__replybtn" onClick={() => setReplyFor(t.id)}>
                            <CornerDownRight size={14} /> Reply
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}
        {/* While it's being created: how far it is, and which sections still need filling in. */}
        {!latest && (
          <aside className="proposal__side">
            <section className="decision spv-card">
              <div className="spv-progress">
                <div>
                  <strong>
                    {ready.length} of {SECTIONS.length}
                  </strong>{' '}
                  sections ready
                </div>
                <div className="spv-progress__bar">
                  <i style={{ width: `${(ready.length / SECTIONS.length) * 100}%` }} />
                </div>
              </div>
              {/* The sections under the progress: a warning on each one still empty; it goes once filled in. */}
              <nav className="spv-checklist" aria-label="Sections">
                {SECTIONS.map((sec) => (
                  <a
                    key={sec}
                    href={`#sec-${sec}`}
                    className={cx('spv-checklist__item', saved(sec) && 'is-ready')}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(`sec-${sec}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    {LABEL[sec]}
                    {!saved(sec) && <AlertCircle size={15} strokeWidth={2} className="spv-checklist__warn" aria-label="Not filled in yet" />}
                  </a>
                ))}
              </nav>
            </section>
          </aside>
        )}
      </div>
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
                {[...versions].reverse().map((x) => {
                  const k = versions.indexOf(x);
                  const on = x === latest ? viewingDraft || (!rec && k === at) : !viewingDraft && k === at;
                  return (
                    <button
                      key={x.id}
                      className={cx('pdd__version', on && 'is-on')}
                      onClick={() => {
                        if (x === latest && rec) setOnDraft(true);
                        else go(k);
                        setDrawer(false);
                      }}
                    >
                      <span className="pdd__version-when">{x.sentAt.length > 10 ? fmtDateTime(x.sentAt) : fmtDate(x.sentAt, { year: true })}</span>
                      <span className="pdd__version-label">{x === latest ? `Version ${x.version} · current` : `Version ${x.version}`}</span>
                      <span className="pdd__version-note">
                        Sent to {first} · {statusOf(x).toLowerCase()}
                        {x === latest && edits.length > 0 ? ' · updated, not sent' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </div>
  );
}

/** The save state in the document bar: a cloud with arrows going round, or with a tick. */
function SaveCloud({ saving }: { saving: boolean }) {
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

/** A text as tracked changes against what it said before: removed words struck, added words underlined. */
function Track({ before, now }: { before: string; now: string }) {
  // Runs of words of the same kind, so an added phrase reads as one underline.
  const runs: { k: 'same' | 'add' | 'del'; w: string[] }[] = [];
  for (const x of diffWords(before, now)) {
    const last = runs[runs.length - 1];
    if (last && last.k === x.k) last.w.push(x.w);
    else runs.push({ k: x.k, w: [x.w] });
  }
  return (
    <>
      {runs.map((r, i) => (
        <span key={i}>
          {r.k === 'same' ? r.w.join(' ') : <span className={r.k === 'add' ? 'spv-ins' : 'spv-cut'}>{r.w.join(' ')}</span>}{' '}
        </span>
      ))}
    </>
  );
}


function ListEditor({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="spv-rows">
      {items.map((t, i) => (
        <div key={i} className="spv-row">
          <Input autoFocus={!t && i === items.length - 1} value={t} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
          <button className="spv-del" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}

function RowsEditor<T extends Record<string, string | number>>({
  rows,
  onChange,
  fields,
}: {
  rows: T[];
  onChange: (v: T[]) => void;
  fields: { key: keyof T & string; placeholder: string; width: string; number?: boolean }[];
}) {
  const cols = `${fields.map((f) => f.width).join(' ')} 32px`;
  return (
    <div className="spv-rows">
      {rows.map((r, i) => (
        <div key={i} className="spv-row" style={{ gridTemplateColumns: cols }}>
          {fields.map((f, k) => (
            <Input
              key={f.key}
              autoFocus={k === 0 && i === rows.length - 1 && !r[f.key]}
              type={f.number ? 'number' : 'text'}
              placeholder={f.placeholder}
              value={String(r[f.key] ?? '')}
              onChange={(e) => onChange(rows.map((x, j) => (j === i ? { ...x, [f.key]: f.number ? Number(e.target.value) || 0 : e.target.value } : x)))}
            />
          ))}
          <button className="spv-del" onClick={() => onChange(rows.filter((_, j) => j !== i))} aria-label="Remove">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}

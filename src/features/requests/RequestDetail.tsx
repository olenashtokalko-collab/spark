import { useState } from 'react';
import { ArrowLeft, BadgeCheck, Check, CircleDot, ChevronDown, CircleX, Clock, Eye, FileText, Hammer, Lightbulb, MessageSquare, PackageCheck, Paperclip, PenLine, Plus, ScanSearch, Send, TrendingUp, TriangleAlert } from 'lucide-react';
import { latestProposal, personById, proposalTotal, proposalWeeks, useStore } from '../../state/store';
import { useUI } from '../../state/ui';
import { Avatar, Button, EmptyState, Tabs, Textarea, cx } from '../../components/ui/primitives';
import { FileIcon, ProposalStatus, RequestStatus, SPARK_STAGE_INFO, STAGES, STAGE_INFO, stageIndex } from '../../components/domain';
import { useToast } from '../../components/ui/toast';
import { aed, dueLabel, fmtDate, fmtDateTime, fmtRelative, fmtTime } from '../../lib/format';
import { navigate, useRoute } from '../../lib/router';
import type { Activity, Finding, WorkRequest } from '../../data/types';
import { ChatCut } from '../assistant/ChatCut';
import { ThreadComposer, ThreadList, conversationItems } from './Conversation';
import { MessageSquare as ReplyIcon } from 'lucide-react';

type Tab = 'overview' | 'conversation' | 'context' | 'files' | 'activity';

// Requests made from a chat get a generated description ("Key findings from
// the assistant: … What we'd like from Spark: …"). The findings are shown as
// cards, so the brief keeps only what the client wrote after the prompt.
const GENERATED = /^(Key findings from the assistant:|From the assistant:)/;
export function askOf(description: string) {
  if (!GENERATED.test(description)) return description.trim();
  return (description.split("What we'd like from Spark:")[1] ?? '').trim();
}

export const toneIcon: Record<Finding['tone'], typeof Check> = {
  neutral: Lightbulb,
  positive: TrendingUp,
  attention: Eye,
  negative: TriangleAlert,
};

export function RequestDetail({ id }: { id: string }) {
  const { state, me, actions } = useStore();
  const { openDoc } = useUI();
  const toast = useToast();
  const { query } = useRoute();
  const [tab, setTab] = useState<Tab>(query.get('tab') === 'conversation' ? 'conversation' : 'overview');
  const [comment, setComment] = useState('');
  const [draft, setDraft] = useState<string | null>(null);
  const r = state.requests.find((x) => x.id === id);

  if (!r)
    return (
      <EmptyState
        title={`Request ${id} not found`}
        body="It may have been removed, or the link is wrong."
        action={<Button onClick={() => navigate('/requests')}>All requests</Button>}
      />
    );

  const p = latestProposal(state, r.id);
  const creator = personById(state, r.createdBy);
  const sources = (r.sourceIds ?? []).map((d) => state.docs.find((x) => x.id === d)).filter(Boolean);
  const files = state.docs.filter((d) => d.requestId === r.id && !d.name.startsWith('Proposal —'));
  const allFiles = [...new Map([...sources, ...files].map((d) => [d!.id, d!])).values()];
  // Chats are shared within the brand, so a teammate's chat opens too.
  const conversation = r.excerpt && state.conversations.find((c) => c.id === r.excerpt!.conversationId);
  const findings = r.excerpt ? (r.excerpt.findings ?? findingsFromConversation(r, conversation)) : undefined;
  const ask = askOf(r.description);
  const canEditBrief = r.status === 'submitted' || r.status === 'in_review';

  const postComment = () => {
    if (!comment.trim()) return;
    actions.commentOnRequest(r.id, comment.trim());
    setComment('');
    toast({ title: 'Comment posted', body: 'Spark has been notified.' });
  };
  const saveBrief = () => {
    if (!draft?.trim()) return;
    actions.updateBrief(r.id, draft.trim());
    setDraft(null);
    toast({ title: 'Brief updated', body: 'Spark will see it when they review the request.' });
  };

  const thread = conversationItems(state, r, 'client');
  const messages = thread.filter((m) => m.kind === 'message').length;
  const tabs: { value: Tab; label: string; count?: number }[] = [
    { value: 'overview', label: 'Overview' },
    { value: 'conversation', label: 'Conversation', count: messages || undefined },
    ...(r.excerpt ? [{ value: 'context' as const, label: 'Context' }] : []),
    { value: 'files', label: 'Files', count: allFiles.length || undefined },
    { value: 'activity', label: 'Activity', count: r.activity.length },
  ];

  return (
    <div className="req-detail">
      <a className="back" href="#/requests">
        <ArrowLeft size={15} /> Requests
      </a>

      <div className="req-layout">
        <div className="req-main">
          <header className="req-head">
            <div className="req-head__top">
              <span className="mono faint">{r.id}</span>
              <RequestStatus status={r.status} onClient={r.nextStep?.onClient} />
            </div>
            <h1 className="req-head__title">{r.title}</h1>
          </header>

          <Tabs className="tabs--underline" value={tab} onChange={setTab} items={tabs} />

          {tab === 'overview' && (
            <div className="req-tab">
              {draft !== null ? (
                <section className="block brief">
                  <div className="brief__head">
                    <h2 className="brief__title">Your request</h2>
                  </div>
                  <div className="brief-edit">
                    <Textarea
                      rows={5}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="The deliverable, who it’s for, and any must-haves."
                      aria-label="What you need from Spark"
                      data-autofocus
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveBrief();
                        if (e.key === 'Escape') setDraft(null);
                      }}
                    />
                    <div className="comment-box__bar">
                      <div className="brief-edit__actions">
                        <Button size="sm" variant="ghost" onClick={() => setDraft(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" variant="primary" disabled={!draft.trim()} onClick={saveBrief}>
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>
              ) : ask ? (
                <section className="block brief">
                  <div className="brief__head">
                    <h2 className="brief__title">Your request</h2>
                    {canEditBrief && (
                      <button className="link-btn" onClick={() => setDraft(ask)}>
                        <PenLine size={13} /> Edit
                      </button>
                    )}
                  </div>
                  <div className="brief__text">{ask}</div>
                </section>
              ) : (
                canEditBrief && (
                  <div className="ask-empty">
                    <PenLine size={15} />
                    <div>
                      <div className="ask-empty__title">Tell us what you need</div>
                      <div className="faint">
                        The deliverable, audience and any must-haves
                        {r.nextStep ? `, so the review on ${fmtDate(r.nextStep.date, { weekday: true })} has what it needs.` : '.'}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setDraft('')}>
                      Add details
                    </Button>
                  </div>
                )
              )}

              {p && (
                <a className="prop-card" href={`#/requests/${r.id}/proposal`}>
                  <div className="prop-card__head">
                    <span className="eyebrow">Proposal</span>
                    {/* Shown only when it adds something: "awaiting" and "declined"
                        already read in the header badge. */}
                    {p.status !== 'awaiting' && p.status !== 'declined' && <ProposalStatus status={p.status} />}
                  </div>
                  <div className="prop-card__nums">
                    <div>
                      <div className="prop-card__num">{aed(proposalTotal(p))}</div>
                      <div className="faint">Investment, excl. VAT</div>
                    </div>
                    <div>
                      <div className="prop-card__num">{proposalWeeks(p)} weeks</div>
                      <div className="faint">from {fmtDate(p.startDate)}</div>
                    </div>
                    <div>
                      <div className="prop-card__num">{p.scope.length}</div>
                      <div className="faint">workstreams</div>
                    </div>
                  </div>
                  <p className="prop-card__summary">{p.summary}</p>
                  <div className="prop-card__foot">
                    {/* The deadline lives in the Stages card, next to the step it belongs to. */}
                    {/* The whole card is the link; this just looks like its button. Primary while
                        the proposal waits on the client, secondary once decided. */}
                    <span className={cx('btn btn--md prop-card__cta', p.status === 'awaiting' ? 'btn--primary' : 'btn--secondary')}>
                      {p.status === 'awaiting' ? 'Review & decide' : 'Open proposal'}
                    </span>
                  </div>
                </a>
              )}

              {findings && findings.length > 0 && (
                <section className="block">
                  <div className="block__head">
                    <h2 className="block__title">Insights to build on</h2>
                  </div>
                  <div className="insights">
                    {findings.map((f) => {
                      const I = toneIcon[f.tone];
                      return (
                        <div key={f.title} className={`insight insight--${f.tone}`}>
                          <span className="insight__icon">
                            <I size={22} strokeWidth={1.7} />
                          </span>
                          <div className="insight__title">{f.title}</div>
                          <div className="insight__body">{f.body}</div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}

          {tab === 'conversation' && (
            <div className="req-tab">
              {r.nextStep?.onClient && r.status !== 'proposal' && (
                <div className="conv-wait">
                  <ReplyIcon size={15} /> Spark is waiting for your reply: {r.nextStep.label}.
                </div>
              )}
              <ThreadList items={messages > 0 ? thread : []} clientName={state.brand.name} />
              <ThreadComposer
                modes={[{ key: 'reply', label: 'Reply', icon: ReplyIcon, send: 'Send reply', placeholder: 'Write to the Spark team…', note: 'The Spark team is notified in the portal and by email.' }]}
                onSend={(_, text) => {
                  actions.clientMessage(r.id, text);
                  toast({ title: 'Message sent', body: 'Spark has been notified.' });
                }}
              />
            </div>
          )}

          {tab === 'context' && r.excerpt && (
            <div className="req-tab">
              <section className="block">
                {/* Same pill as the "request created" marker in the chat. */}
                <div className="msg-system chat-cut__pill">
                  <MessageSquare size={14} />
                  <span>Created from {creator.id === me.id ? 'your' : `${creator.name.split(' ')[0]}'s`} chat</span>
                  {conversation ? (
                    <a className="link" href={`#/assistant/${conversation.id}`}>
                      {conversation.title}
                    </a>
                  ) : (
                    <span className="faint">(deleted)</span>
                  )}
                </div>
                <ChatCut messages={r.excerpt.messages} author={creator.id === me.id ? 'You' : creator.name.split(' ')[0]} />
              </section>
            </div>
          )}

          {tab === 'files' && (
            <div className="req-tab">
              {allFiles.length ? (
                <div className="file-rows">
                  {allFiles.map((d) => (
                    <button key={d!.id} className="file-row" onClick={() => openDoc(d!.id)}>
                      <FileIcon kind={d!.kind} />
                      <span className="file-row__name">{d!.name}</span>
                      <span className="faint">{personById(state, d!.uploadedBy).name.split(' ')[0]} · {fmtRelative(d!.uploadedAt)}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState panel title="No files yet." body="Files you or Spark attach to this request show up here." />
              )}
            </div>
          )}

          {tab === 'activity' && (
            <div className="req-tab">
              <ActivityLog items={r.activity} requestId={r.id} />
              <div className="comment-box">
                <Avatar person={me} size={28} />
                <div className="comment-box__field">
                  <Textarea
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment for Spark…"
                    aria-label="Comment"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) postComment();
                    }}
                  />
                  <div className="comment-box__bar">
                    <Button size="sm" variant="primary" icon={Send} disabled={!comment.trim()} onClick={postComment}>
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="req-side">
          <StatusCard r={r} />
          <section className="side-card">
            <h3 className="side-card__title">Details</h3>
            <dl className="meta-list">
              <dt>Requested by</dt>
              <dd>
                <Avatar person={creator} size={20} /> {creator.name}
              </dd>
              <dt>Created</dt>
              <dd>{fmtDateTime(r.createdAt)}</dd>
              <dt>Type</dt>
              <dd>{r.type}</dd>
              <dt>Timing</dt>
              <dd>{r.timing}</dd>
              {r.budget && (
                <>
                  <dt>Budget</dt>
                  <dd>{r.budget}</dd>
                </>
              )}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

// Requests created before findings were stored on the excerpt: look them up on
// the assistant message the excerpt was taken from.
export function findingsFromConversation(r: WorkRequest, conversation: { messages: { role: string; text: string; findings?: Finding[] }[] } | undefined) {
  const answer = r.excerpt?.messages.find((m) => m.role === 'assistant')?.text;
  if (!conversation || !answer) return undefined;
  const plain = (t: string) => t.replace(/\*\*/g, '');
  return conversation.messages.find((m) => m.role === 'assistant' && m.findings?.length && plain(m.text) === answer)?.findings;
}

// The status card: the full stage list is the progress. The current stage is
// marked Now (with when it started and the next step), the one after it Next.
// Spark people aren't named: the client doesn't know who picks a request up.
// One icon per stage, in a raised disc on the line (picked on #/demo/stages, 2).
const STAGE_ICONS = [Send, ScanSearch, FileText, BadgeCheck, Hammer, PackageCheck];

/** `perspective` is who is looking: the client (the default) or the Spark team, which reads the same path
 *  with its own wording and amber when the next step is on Spark. */
export function StatusCard({ r, perspective = 'client' }: { r: WorkRequest; perspective?: 'client' | 'spark' }) {
  const spark = perspective === 'spark';
  const info = spark ? SPARK_STAGE_INFO : STAGE_INFO;
  const idx = stageIndex(r.status);
  const declined = r.status === 'declined';
  const done = r.status === 'delivered';

  return (
    <section className="side-card stg stg--discs" aria-label="Stages">
      {/* The status is named once, in the page header; this card shows the path. */}
      <h3 className="side-card__title">
        Stages <span className="block__count status-card__step">{declined ? 'Closed at proposal' : done ? 'All stages complete' : `${idx + 1} of ${STAGES.length}`}</span>
      </h3>
      <ol className="stg__list">
        {STAGES.map((s, i) => {
          const st = declined && i === idx ? 'declined' : i < idx || done ? 'done' : i === idx ? 'current' : 'todo';
          const Icon = st === 'declined' ? CircleX : STAGE_ICONS[i];
          return (
            <li key={s} className={cx('stg__item', `is-${st}`)} aria-current={st === 'current' ? 'step' : undefined}>
              <span className="stg__mark">
                <Icon size={15} strokeWidth={1.8} />
              </span>
              <div className="stg__body">
                <div className="stg__label">{st === 'declined' ? 'Declined' : s}</div>
                <div className="stg__info">{st === 'declined' ? 'The proposal was declined and the request closed.' : info[s]}</div>
                {st === 'current' && (
                  <>
                    {r.nextStep && (
                      // The one place a deadline shows: amber when it waits on the client.
                      // One line; the step's name stays as the tooltip.
                      <div className={cx('stg__due', (spark ? !r.nextStep.onClient : r.nextStep.onClient) && 'is-on-you')} title={r.nextStep.label}>
                        <Clock size={14} />
                        <span className="stg__due-when">
                          {spark
                            ? `${r.nextStep.onClient ? 'Client due' : 'Due'} ${fmtDate(r.nextStep.date, { weekday: true })} · ${dueLabel(r.nextStep.date).replace(/^due /, '')}`
                            : r.nextStep.onClient
                              ? `Due ${fmtDate(r.nextStep.date, { weekday: true })} · ${dueLabel(r.nextStep.date).replace(/^due /, '')}`
                              : `Expected by ${fmtDate(r.nextStep.date, { weekday: true })}`}
                        </span>
                      </div>
                    )}
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

// ---- Activity log (after the task-log reference) ----------------------------------------
// One line per event: an icon, the change with its facts in bold, "by" whom and
// when. Comments and decision notes are quoted.

export type Chip = { text: string; tone?: 'accent' | 'positive' | 'negative' | 'neutral'; icon?: typeof Check; mono?: boolean };

const STAGE_FOR: Record<string, string> = {
  'started reviewing': 'In review',
  'started work': 'In progress',
};

/** Splits an activity's text into a verb, chips for the facts, and a quoted note. */
export function describe(a: Activity): { verb: string; chips: Chip[]; tail?: string; quote?: string; tone?: Chip['tone'] } {
  const quoted = a.text.match(/^(.*?): "(.*)"$/s);
  const text = quoted ? quoted[1] : a.text;
  const quote = quoted?.[2];
  const file = text.match(/^(attached|shared|delivered|approved|requested changes to|commented on) (.+?\.[a-z0-9]{2,4})(.*)$/i);
  if (a.kind === 'proposal') {
    const [verb, ...facts] = text.split(' · ');
    return { verb, chips: facts.map((f) => ({ text: f, mono: /AED/.test(f) })), quote };
  }
  if (file) {
    const delivered = /^delivered$/i.test(file[1]);
    return {
      verb: file[1],
      chips: [{ text: file[2], icon: Paperclip }, ...(delivered ? [{ text: 'Delivered', tone: 'positive' as const, icon: PackageCheck }] : [])],
      tail: file[3].trim() || undefined,
      quote,
      tone: delivered ? 'positive' : undefined,
    };
  }
  if (a.kind === 'decision') {
    const approved = /^approved/i.test(text);
    const declined = /^declined/i.test(text);
    const reason = text.match(/\((.+)\)$/)?.[1];
    return {
      verb: approved ? 'approved the proposal' : declined ? 'declined the proposal' : 'requested changes to the proposal',
      chips: [{ text: approved ? 'Approved' : declined ? 'Declined' : 'Changes requested', tone: approved ? 'positive' : declined ? 'negative' : 'accent', icon: approved ? Check : declined ? CircleX : PenLine }, ...(reason ? [{ text: reason }] : [])],
      quote,
      tone: approved ? 'positive' : declined ? 'negative' : 'accent',
    };
  }
  if (a.kind === 'status' && STAGE_FOR[text]) return { verb: 'moved the request to', chips: [{ text: STAGE_FOR[text], tone: 'accent', icon: CircleDot }], quote, tone: 'accent' };
  return { verb: text, chips: [], quote };
}

export const activityIcon: Record<Activity['kind'], typeof Check> = {
  created: Plus,
  status: CircleDot,
  comment: MessageSquare,
  proposal: FileText,
  decision: Check,
  file: Paperclip,
};

// ---- Days, for grouping and for the time on each line (also used by #/demo/activity) ----

const dayKey = (iso: string) => iso.slice(0, 10);
const startOfDay = (iso: string) => new Date(dayKey(iso) + 'T00:00:00').getTime();
const todayStart = () => new Date(new Date().toDateString()).getTime();

export function dayLabel(iso: string) {
  const diff = Math.round((todayStart() - startOfDay(iso)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return fmtDate(iso, { weekday: true });
}

/** Newest first, grouped by day. */
export function byDay(items: Activity[]) {
  const sorted = [...items].sort((a, b) => b.at.localeCompare(a.at));
  const groups: { key: string; label: string; items: Activity[] }[] = [];
  for (const a of sorted) {
    const k = dayKey(a.at);
    const g = groups.find((x) => x.key === k);
    if (g) g.items.push(a);
    else groups.push({ key: k, label: dayLabel(a.at), items: [a] });
  }
  return groups;
}

/** "4 h ago" for today; the day has its own heading, so earlier days show just the time. */
export const whenLine = (a: Activity) => (startOfDay(a.at) === todayStart() ? fmtRelative(a.at) : fmtTime(a.at));

// ---- The activity tab (picked on #/demo/activity, look 2) ------------------------------
// One tight line per event, newest first, a rule between days, the older events folded.
// What each thing looks like follows what it does everywhere else in the app:
//   a status or decision  → the status pill (.rstatus), as in the header and the table
//   a file                → the clickable file chip (.src-chip), as under a chat answer; it opens the file
//   a fact (price, weeks) → the quiet tag (.req-row__type look), never clickable
//   "n earlier activities"→ the quiet toggle (.steps-toggle), as on "Researched 4 steps"
//   a person              → plain medium text; only links are underlined

const FOLD_AFTER = 6; // events shown before the older ones fold

// The stage a "started …" event moves the request away from.
const FROM_STAGE: Record<string, string> = { 'In review': 'Submitted', 'In progress': 'Approved' };

/** `realNames`: the Spark team's view names its own people; the client sees them as "Spark". */
export function ActivityLog({ items, requestId, realNames }: { items: Activity[]; requestId: string; realNames?: boolean }) {
  const [open, setOpen] = useState(false);
  const sorted = [...items].sort((a, b) => b.at.localeCompare(a.at));
  const hidden = sorted.length - FOLD_AFTER;
  const shown = open ? sorted : sorted.slice(0, FOLD_AFTER);
  return (
    <div className="axb">
      {/* One list for the whole history: a single line joins every step, and each day is a
          centred label on a rule, so the line runs on through the days. */}
      <ol className="axb__list">
        {byDay(shown).flatMap((g) => [
          <li key={g.key} className="axb__daylabel" role="separator">
            <span>{g.label}</span>
          </li>,
          ...g.items.map((a) => <LogItem key={a.id} a={a} requestId={requestId} realNames={realNames} />),
        ])}
      </ol>
      {hidden > 0 && (
        <button className="steps-toggle axb__fold" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? 'Show fewer' : `${hidden} earlier ${hidden === 1 ? 'activity' : 'activities'}`}
          <ChevronDown size={13} className={cx(open && 'rot')} />
        </button>
      )}
    </div>
  );
}

/** The mark's icon: the same icons as the Stages card, so a step reads the same in both places. */
function markIcon(a: Activity, declined: boolean) {
  if (a.kind === 'created') return STAGE_ICONS[0];
  if (a.kind === 'proposal') return STAGE_ICONS[2];
  if (a.kind === 'comment') return MessageSquare;
  if (a.kind === 'status') return /^delivered/.test(a.text) ? STAGE_ICONS[5] : a.text === 'started reviewing' ? STAGE_ICONS[1] : a.text === 'started work' ? STAGE_ICONS[4] : CircleDot;
  if (a.kind === 'decision') return declined ? CircleX : /^approved/.test(a.text) ? STAGE_ICONS[3] : PenLine;
  return Paperclip;
}

function LogItem({ a, requestId, realNames }: { a: Activity; requestId: string; realNames?: boolean }) {
  const { state } = useStore();
  const { openDoc } = useUI();
  const p = (realNames && state.people.find((x) => x.id === a.by)) || personById(state, a.by);
  const { verb, chips, tail, quote, tone } = describe(a);
  const comment = a.kind === 'comment';
  const declined = a.kind === 'decision' && tone === 'negative';
  const I = markIcon(a, declined);
  const stage = a.kind === 'status' ? STAGE_FOR[a.text] : undefined;
  const fileChip = chips.find((c) => c.icon === Paperclip);
  const doc = fileChip ? state.docs.find((d) => d.name === fileChip.text) : undefined;
  // The facts (price, weeks, a reason) are plain words; the file and the status are drawn in the sentence.
  const facts = stage ? [] : chips.filter((c) => c !== fileChip && c.text !== 'Delivered' && !(a.kind === 'decision' && c.icon));
  const decision = a.kind === 'decision' ? chips.find((c) => c.icon)?.text : undefined;
  const showProposal = a.kind === 'proposal' || a.kind === 'decision';
  return (
    <li className={cx('axb__item', tone && `tone-${tone}`)}>
      <span className="axb__mark">
        <I size={15} strokeWidth={1.8} />
      </span>
      <div className="axb__body">
        <div className="axb__line">
          <div className="axb__sentence">
            <span className="axb__who">{p.name}</span>
            <span className="axb__text">
              {comment && 'commented'}
              {!comment && stage && (
                <>
                  moved the request from <span className="axb__obj">{FROM_STAGE[stage]}</span> to <span className="axb__obj">{stage}</span>
                </>
              )}
              {!comment && !stage && decision && (
                <>
                  marked the proposal as <span className="axb__obj">{decision}</span>
                </>
              )}
              {!comment && !stage && !decision && (
                <>
                  {verb}
                  {fileChip && <> <span className="axb__obj">{fileChip.text}</span></>}
                </>
              )}
              {facts.length > 0 && (
                <>
                  {decision ? ' · ' : ' '}
                  {facts.map((c, i) => (
                    <span key={c.text}>
                      {i > 0 && ' · '}
                      <span className="axb__obj">{c.text}</span>
                    </span>
                  ))}
                </>
              )}
              {!comment && tail && ` ${tail}`}
            </span>
            {showProposal && (
              <button className="link-btn axb__act" onClick={() => navigate(`/requests/${requestId}/proposal`)}>
                See proposal
              </button>
            )}
            {doc && (
              <button className="link-btn axb__act" onClick={() => openDoc(doc.id)}>
                Open file
              </button>
            )}
          </div>
          <span className="axb__when">{whenLine(a)}</span>
        </div>
        {(comment || quote) && <div className="axb__msg">{comment ? a.text : quote}</div>}
      </div>
    </li>
  );
}


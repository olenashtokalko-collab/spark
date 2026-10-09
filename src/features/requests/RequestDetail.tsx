import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CircleDot, Eye, FileText, Lightbulb, MessageSquare, PenLine, Send, Sparkles, Search, TrendingUp, TriangleAlert } from 'lucide-react';
import { latestProposal, personById, proposalTotal, proposalWeeks, proposalsFor, useStore } from '../../state/store';
import { useUI } from '../../state/ui';
import { Avatar, Badge, Button, EmptyState, Tabs, Textarea, cx } from '../../components/ui/primitives';
import { FileIcon, ProposalStatus, RequestStatus, STAGES, STAGE_INFO, requestStatusMeta, stageIndex } from '../../components/domain';
import { useToast } from '../../components/ui/toast';
import { aed, dueLabel, fmtDate, fmtDateTime, fmtRelative } from '../../lib/format';
import { navigate } from '../../lib/router';
import type { Activity, Finding, WorkRequest } from '../../data/types';
import { RichText } from '../assistant/MessageView';

type Tab = 'overview' | 'context' | 'files' | 'activity';

// Requests made from a chat get a generated description ("Key findings from
// the assistant: … What we'd like from Spark: …"). The findings are shown as
// cards, so the brief keeps only what the client wrote after the prompt.
const GENERATED = /^(Key findings from the assistant:|From the assistant:)/;
function askOf(description: string) {
  if (!GENERATED.test(description)) return description.trim();
  return (description.split("What we'd like from Spark:")[1] ?? '').trim();
}

const toneIcon: Record<Finding['tone'], typeof Check> = {
  neutral: Lightbulb,
  positive: TrendingUp,
  attention: Eye,
  negative: TriangleAlert,
};

export function RequestDetail({ id }: { id: string }) {
  const { state, me, actions } = useStore();
  const { openDoc } = useUI();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [comment, setComment] = useState('');
  const [draft, setDraft] = useState<string | null>(null);
  const r = state.requests.find((x) => x.id === id);

  if (!r)
    return (
      <EmptyState
        icon={Search}
        title={`Request ${id} not found`}
        body="It may have been removed, or the link is wrong."
        action={<Button onClick={() => navigate('/requests')}>All requests</Button>}
      />
    );

  const p = latestProposal(state, r.id);
  const versions = proposalsFor(state, r.id);
  const creator = personById(state, r.createdBy);
  const sources = (r.sourceIds ?? []).map((d) => state.docs.find((x) => x.id === d)).filter(Boolean);
  const files = state.docs.filter((d) => d.requestId === r.id && !d.name.startsWith('Proposal —'));
  const allFiles = [...new Map([...sources, ...files].map((d) => [d!.id, d!])).values()];
  // Only your own chats can be opened; a teammate's request keeps its excerpt.
  const conversation = r.excerpt && state.conversations.find((c) => c.id === r.excerpt!.conversationId && c.createdBy === me.id);
  const findings = r.excerpt ? (r.excerpt.findings ?? findingsFromConversation(r, conversation)) : undefined;
  const question = r.excerpt?.messages.find((m) => m.role === 'user')?.text;
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

  const tabs: { value: Tab; label: string; count?: number }[] = [
    { value: 'overview', label: 'Overview' },
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
              <RequestStatus status={r.status} />
            </div>
            <h1 className="req-head__title">{r.title}</h1>
          </header>

          <Tabs className="tabs--underline" value={tab} onChange={setTab} items={tabs} />

          {tab === 'overview' && (
            <div className="req-tab">
              {p && (
                <a className={cx('prop-card', p.status === 'awaiting' && 'is-awaiting')} href={`#/requests/${r.id}/proposal`}>
                  <div className="prop-card__head">
                    <span className="eyebrow">Proposal v{p.version}</span>
                    <ProposalStatus status={p.status} />
                    {versions.length > 1 && <span className="faint mono">{versions.length} versions</span>}
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
                    <span className="faint">
                      Sent by {personById(state, p.sentBy).name} · {fmtRelative(p.sentAt)}
                      {p.status === 'awaiting' && <> · {dueLabel(p.validUntil)}</>}
                    </span>
                    <span className="prop-card__cta">
                      {p.status === 'awaiting' ? 'Review & decide' : 'Open proposal'} <ArrowRight size={14} />
                    </span>
                  </div>
                </a>
              )}

              {draft !== null ? (
                <section className="block">
                  <h2 className="block__title">Your request</h2>
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
                      <span className="faint">⌘ Enter to save</span>
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
                <section className="block">
                  <div className="block__head">
                    <h2 className="block__title">Your request</h2>
                    {canEditBrief && (
                      <button className="link-btn" onClick={() => setDraft(ask)}>
                        <PenLine size={13} /> Edit
                      </button>
                    )}
                  </div>
                  <p className="block__text">{ask}</p>
                </section>
              ) : (
                canEditBrief && (
                  <div className="ask-empty">
                    <PenLine size={15} />
                    <div>
                      <div className="ask-empty__title">Tell Spark what you need</div>
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

              {findings && findings.length > 0 && (
                <section className="block">
                  <div className="block__head">
                    <h2 className="block__title">
                      <Lightbulb size={14} /> {findings.length} insights to build on
                    </h2>
                    {question && <span className="faint insights__from">From the assistant · {question}</span>}
                  </div>
                  <div className="insights">
                    {findings.map((f) => {
                      const I = toneIcon[f.tone];
                      return (
                        <div key={f.title} className={`insight insight--${f.tone}`}>
                          <span className="insight__icon">
                            <I size={16} />
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

          {tab === 'context' && r.excerpt && (
            <div className="req-tab">
              <section className="block">
                <div className="block__head">
                  <h2 className="block__title">From the conversation</h2>
                  {conversation && (
                    <a className="link-btn" href={`#/assistant/${conversation.id}`}>
                      <Sparkles size={13} /> Open conversation
                    </a>
                  )}
                </div>
                <div className="excerpt">
                  {r.excerpt.messages.map((m, i) => (
                    <div key={i} className={`excerpt__msg excerpt__msg--${m.role}`}>
                      <span className="excerpt__who">{m.role === 'user' ? 'Question' : 'Assistant'}</span>
                      <div className="excerpt__text">
                        <RichText text={m.text} />
                      </div>
                    </div>
                  ))}
                </div>
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
                      <span className="faint">{personById(state, d!.uploadedBy).name.split(' ')[0]} · {fmtDate(d!.uploadedAt)}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState icon={FileText} title="No files yet" body="Files you or Spark attach to this request show up here." compact />
              )}
            </div>
          )}

          {tab === 'activity' && (
            <div className="req-tab">
              <ol className="timeline">
                {[...r.activity].reverse().map((a) => (
                  <ActivityItem key={a.id} a={a} />
                ))}
              </ol>
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
                    <span className="faint">⌘ Enter to post</span>
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
function findingsFromConversation(r: WorkRequest, conversation: { messages: { role: string; text: string; findings?: Finding[] }[] } | undefined) {
  const answer = r.excerpt?.messages.find((m) => m.role === 'assistant')?.text;
  if (!conversation || !answer) return undefined;
  const plain = (t: string) => t.replace(/\*\*/g, '');
  return conversation.messages.find((m) => m.role === 'assistant' && m.findings?.length && plain(m.text) === answer)?.findings;
}

// The status card: the full stage list is the progress. The current stage is
// marked Now (with when it started and the next step), the one after it Next.
// Spark people aren't named: the client doesn't know who picks a request up.
function StatusCard({ r }: { r: WorkRequest }) {
  const idx = stageIndex(r.status);
  const declined = r.status === 'declined';
  const done = r.status === 'delivered';
  const since = [...r.activity].reverse().find((a) => a.kind !== 'comment' && a.kind !== 'file')?.at ?? r.createdAt;

  return (
    <section className="side-card status-card">
      <span className="eyebrow">Status</span>
      <div className="status-card__state">{requestStatusMeta[r.status].client}</div>
      <div className="faint">{declined ? 'Closed at proposal' : done ? 'All stages complete' : `Step ${idx + 1} of ${STAGES.length}`}</div>
      <hr className="status-card__rule" />
      <ol className="stages">
        {STAGES.map((s, i) => {
          const st = declined && i === idx ? 'declined' : i < idx || done ? 'done' : i === idx ? 'current' : i === idx + 1 && !declined ? 'next' : 'todo';
          return (
            <li key={s} className={`stages__item is-${st}`} aria-current={st === 'current' ? 'step' : undefined}>
              <span className="stages__dot">{st === 'done' ? <Check size={10} strokeWidth={3} /> : null}</span>
              <div>
                <div className="stages__label">
                  {st === 'declined' ? 'Declined' : s}
                  {st === 'current' && <Badge tone="accent">Now</Badge>}
                  {st === 'next' && <span className="stages__next">Next</span>}
                </div>
                <div className="stages__info">{st === 'declined' ? 'The proposal was declined and the request closed.' : STAGE_INFO[s]}</div>
                {st === 'current' && (
                  <>
                    <div className="stages__when mono">Since {fmtDate(since)}</div>
                    {r.nextStep && (
                      <div className="stages__step">
                        <CircleDot size={13} />
                        <span>
                          {r.nextStep.label} <span className="mono">· by {fmtDate(r.nextStep.date, { weekday: true })}</span>
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

const activityIcon: Record<Activity['kind'], typeof Check> = {
  created: Sparkles,
  status: CircleDot,
  comment: MessageSquare,
  proposal: FileText,
  decision: Check,
  file: FileText,
};

function ActivityItem({ a }: { a: Activity }) {
  const { state } = useStore();
  const p = personById(state, a.by);
  const I = activityIcon[a.kind];
  if (a.kind === 'comment')
    return (
      <li className="timeline__item timeline__item--comment">
        <Avatar person={p} size={26} />
        <div className="timeline__comment">
          <div className="timeline__who">
            {p.name} {p.org === 'spark' && <span className="faint">· Spark</span>} <span className="faint">· {fmtRelative(a.at)}</span>
          </div>
          <p>{a.text}</p>
        </div>
      </li>
    );
  return (
    <li className="timeline__item">
      <span className={cx('timeline__icon', a.kind === 'decision' && 'is-decision', a.kind === 'proposal' && 'is-proposal')}>
        <I size={13} />
      </span>
      <div className="timeline__line">
        <strong>{p.name}</strong> {a.text} <span className="faint">· {fmtRelative(a.at)}</span>
      </div>
    </li>
  );
}

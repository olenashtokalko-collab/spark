// Screens 2 and 3 · A request from the Spark side, built from the same blocks as the client's request page
// (header, tabs, the request, the proposal card, insights, Stages and Details) with Spark's controls added.
// Brand Co.'s requests are live from the shared store; the other clients keep local state.
import { useState } from 'react';
import { ArrowLeft, Lock, Plus } from 'lucide-react';
import { Avatar, Button, EmptyState, Tabs } from '../../components/ui/primitives';
import { FileIcon } from '../../components/domain';
import { useToast } from '../../components/ui/toast';
import { latestProposal, personById, proposalTotal, useStore, type ProposalDraft } from '../../state/store';
import { SECTIONS, blankProposal, isReady } from './SparkProposalView';
import { ProposalStateCard } from './ProposalStateCard';
import { RequestTimeline, type TimelinePoint } from './RequestTimeline';
import { fmtDate, fmtRelative } from '../../lib/format';
import { navigate } from '../../lib/router';
import type { Proposal, RequestStatus, WorkRequest } from '../../data/types';
import { CommentBox, ThreadList, conversationItems, type ConvItem } from '../requests/Conversation';
import { ActivityLog, askOf, findingsFromConversation, toneIcon } from '../requests/RequestDetail';
import { STATUS_LABEL, clientOf, dana, sampleThread, type SparkRequest, type SparkStatus } from './data';
import { SparkStatusChip } from './SparkInbox';
import { useSparkRequests } from './model';

type Tab = 'overview' | 'conversation' | 'files' | 'activity';

export function SparkRequestPage({ id, tab }: { id: string; tab: Tab }) {
  const { list, isLive } = useSparkRequests();
  const base = list.find((r) => r.id === id);
  if (!base) return <EmptyState title="Request not found" action={<Button onClick={() => navigate('/spark')}>Back to inbox</Button>} />;
  return <Inner key={id} base={base} live={isLive(id)} tab={tab} />;
}

/** One model for both kinds of request: stored ones act on the shared store, sample ones on local state. */
function useRequestModel(base: SparkRequest, live: boolean) {
  const { state, actions } = useStore();
  const toast = useToast();
  const stored = live ? state.requests.find((r) => r.id === base.id) : undefined;
  const [local, setLocal] = useState<ConvItem[]>([]);
  const [status, setStatusLocal] = useState<SparkStatus>(base.status);
  const [owner, setOwnerLocal] = useState(base.owner.id);
  const first = base.requester.name.split(' ')[0];

  const items: ConvItem[] = stored ? conversationItems(state, stored, 'spark') : [...sampleThread(base), ...local];
  const notes = items.filter((m) => m.kind === 'internal');
  const add = (m: Omit<ConvItem, 'id' | 'at'>) => setLocal((l) => [...l, { ...m, id: 'l' + l.length, at: 'Just now' }]);

  return {
    stored,
    items,
    notes,
    status: stored ? (stored.status as SparkStatus) : status,
    owner: stored ? stored.ownerId : owner,
    setStatus: (s: SparkStatus) => {
      if (stored) actions.setRequestStatus(base.id, s as RequestStatus);
      else {
        setStatusLocal(s);
        add({ kind: 'system', text: `Dana Kareem moved the request to ${STATUS_LABEL[s]}.` });
      }
      toast({ title: 'Status updated', body: `${first} sees “${s === 'proposal' ? 'Needs your decision' : STATUS_LABEL[s]}” in the portal and is notified.` });
    },
    setOwner: (o: string) => (stored ? actions.setRequestOwner(base.id, o) : setOwnerLocal(o)),
    send: (mode: string, text: string) => {
      if (stored) actions.sparkMessage(base.id, text, mode === 'internal' ? 'internal' : mode === 'question' ? 'question' : 'message');
      else add({ kind: mode === 'internal' ? 'internal' : 'message', by: dana, text, question: mode === 'question' });
      toast(mode === 'internal' ? { title: 'Internal note added', body: 'Only the Spark team sees it.' } : { title: mode === 'question' ? 'Question sent' : 'Reply sent', body: `${first} is notified and sees it on the request in the client portal.` });
    },
  };
}

function Inner({ base, live, tab }: { base: SparkRequest; live: boolean; tab: Tab }) {
  const toast = useToast();
  const { state } = useStore();
  const m = useRequestModel(base, live);
  const client = clientOf(base.clientId);
  const first = base.requester.name.split(' ')[0];
  const open = (t: Tab) => navigate(`/spark/requests/${base.id}${t === 'overview' ? '' : '/' + t}`);
  const messages = m.items.filter((x) => x.kind !== 'system').length;

  // The dated points of the timeline under the header.
  const timelinePoints = pointsFor(base, m.status, m.stored, m.stored ? state.proposals.filter((x) => x.requestId === base.id) : []);

  // A sample request's draft, saved in the editor (live requests show theirs in LiveProposalCard).
  const draft = state.proposalDrafts[base.id];
  const feedback = base.proposal?.feedback;
  const ask = askOf(base.description);
  const conversation = m.stored?.excerpt && state.conversations.find((c) => c.id === m.stored!.excerpt!.conversationId);
  const findings = m.stored?.excerpt ? (m.stored.excerpt.findings ?? findingsFromConversation(m.stored, conversation || undefined)) : undefined;
  const files = m.stored ? state.docs.filter((d) => d.requestId === base.id) : [];
  const sampleFiles = base.id === 'REQ-100' ? [] : [`Brief — ${base.title}.pdf`];
  const hasFiles = (m.stored ? files.length : sampleFiles.length) > 0;
  const uploadButton = (
    <Button size="sm" icon={Plus} onClick={() => toast({ title: 'Upload a file', body: 'Files go into the client’s Documents, and the client is notified.' })}>
      Upload a file
    </Button>
  );

  return (
    <div className="req-detail">
      <a className="back" href="#/spark" onClick={(e) => (e.preventDefault(), navigate('/spark'))}>
        <ArrowLeft size={15} /> Back
      </a>

      <div className="req-layout req-layout--single">
        <div className="req-main">
          <header className="req-head">
            {/* The title with where the request stands, on its right. */}
            <div className="req-head__row">
              <h1 className="req-head__title">{base.title}</h1>
            </div>
            {/* Under the title, quiet: where it stands first, then who it's for, which request, the rest. */}
            <div className="req-meta">
              <SparkStatusChip r={{ ...base, status: m.status }} />
              <span className="req-meta__sep" aria-hidden />
              <span>
                Client: <b>{client.name}</b>
              </span>
              <span className="req-meta__sep" aria-hidden />
              <span>
                Request: <b>{base.id}</b>
              </span>
              <span className="req-meta__sep" aria-hidden />
              <span>
                Type: <b>{base.type}</b>
              </span>
              <span className="req-meta__sep" aria-hidden />
              <span>
                Timing: <b>{base.timing}</b>
              </span>
              {base.budget && (
                <>
                  <span className="req-meta__sep" aria-hidden />
                  <span>
                    Budget: <b>{base.budget}</b>
                  </span>
                </>
              )}
            </div>
            {/* The request's details (they were a card in the side column). */}
            <div className="req-meta req-meta--details">
              <span className="req-meta__who">
                Created by <Avatar person={base.requester} size={24} />
                <b>
                  {base.requester.name}, {m.stored ? fmtDate(m.stored.createdAt, { year: true }) : base.created}
                </b>
              </span>
            </div>
          </header>

          {/* Where the request is, on a timeline, and the proposal under it: what to do next. */}
          <div className="req-flow">
            <RequestTimeline status={m.status} points={timelinePoints} />
              {/* The proposal first: what to do next with this request. */}
              {m.stored ? (
                <LiveProposalCard id={base.id} first={first} />
              ) : (
                // Sample clients: the same block, from the sample row; their proposal opens in the editor.
                <ProposalStateCard
                  first={first}
                  href={`/spark/requests/${base.id}/proposal`}
                  onCreate={() => navigate(`/spark/requests/${base.id}/proposal`)}
                  draft={draft && !base.proposal ? { title: draft.title, ready: sampleReady(draft), savedAt: draft.savedAt } : undefined}
                  sent={
                    base.proposal && {
                      version: base.proposal.version,
                      title: base.proposal.fields?.title ?? base.title,
                      total: base.proposal.total,
                      sentAt: '',
                      sentLabel: base.proposal.sent,
                      validUntil: '',
                      status: SAMPLE_STATUS[base.proposal.state] ?? 'awaiting',
                      decider: feedback?.by,
                      decidedLabel: feedback?.at,
                    }
                  }
                />
              )}

          </div>

          <Tabs
            className="tabs--underline"
            value={tab}
            onChange={open}
            items={[
              { value: 'overview', label: 'Overview' },
              { value: 'conversation', label: 'Conversation', count: messages || undefined },
              { value: 'files', label: 'Files', count: (m.stored ? files.length : sampleFiles.length) || undefined },
              { value: 'activity', label: 'Activity', count: m.stored ? m.stored.activity.length : undefined },
            ]}
          />

          {tab === 'overview' && (
            <div className="req-tab">
              <section className="block brief">
                <div className="brief__head">
                  <h2 className="brief__title">{first}’s request</h2>
                </div>
                <div className="brief__text">{ask || base.description}</div>
              </section>

              {findings && findings.length > 0 && (
                <section className="block">
                  <div className="block__head">
                    <h2 className="block__title">Insights from the client’s chat</h2>
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

              <section className="block">
                <div className="block__head">
                  <h2 className="block__title">Internal notes</h2>
                  <span className="conv-lock">
                    <Lock size={12} /> Visible for Spark only
                  </span>
                </div>
                {m.notes.map((n) => (
                  <div key={n.id} className="spk-note">
                    <Avatar person={n.by ?? dana} size={22} />
                    <p>{n.text}</p>
                  </div>
                ))}
                <CommentBox person={dana} placeholder="Add a note for the team…" label="Internal note" send="Add note" onSend={(text) => m.send('internal', text)} />
              </section>
            </div>
          )}

          {tab === 'conversation' && (
            <div className="req-tab">
              <ThreadList items={m.items.some((x) => x.kind === 'message') ? m.items : []} clientName={client.name} />
              <CommentBox
                person={dana}
                placeholder={`Reply to ${first}…`}
                label="Reply to client"
                send="Send"
                onSend={(text) => m.send('reply', text)}
                onAttach={() => toast({ title: 'Attach a file', body: 'Files go into the client’s Documents.' })}
              />
            </div>
          )}

          {tab === 'files' && (
            <div className="req-tab">
              {hasFiles ? (
                <div className="file-rows">
                  {m.stored
                    ? files.map((d) => (
                        <div key={d.id} className="file-row">
                          <FileIcon kind={d.kind} />
                          <span className="file-row__name">{d.name}</span>
                          <span className="faint">{(state.people.find((x) => x.id === d.uploadedBy) ?? dana).name.split(' ')[0]} · {fmtRelative(d.uploadedAt)}</span>
                        </div>
                      ))
                    : sampleFiles.map((f) => (
                        <div key={f} className="file-row">
                          <FileIcon kind="pdf" />
                          <span className="file-row__name">{f}</span>
                          <span className="faint">From the client</span>
                        </div>
                      ))}
                </div>
              ) : (
                <EmptyState title="No files yet." body="Files you or the client attach to this request show up here." action={uploadButton} />
              )}
              {hasFiles && <div className="spk-uploadrow">{uploadButton}</div>}
            </div>
          )}

          {tab === 'activity' && (
            <div className="req-tab">
              {m.stored ? (
                <ActivityLog items={m.stored.activity} requestId={base.id} realNames />
              ) : (
                <div className="axb">
                  <ol className="axb__list">
                    {m.items
                      .filter((x) => x.kind === 'system')
                      .map((x) => (
                        <li key={x.id} className="axb__item">
                          <span className="axb__mark" />
                          <div className="axb__body">
                            <div className="axb__line">
                              <div className="axb__sentence">
                                <span className="axb__text">{x.text}</span>
                              </div>
                              <span className="axb__when">{x.at}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/** "16 Oct" (how sample rows write dates) as an ISO date in 2026. */
const isoOf = (d: string) => {
  const t = new Date(`${d} 2026 12:00`);
  return isNaN(t.getTime()) ? undefined : t.toISOString().slice(0, 10);
};

/**
 * The dated points on the request's timeline: when it came in, the latest proposal sent, the client's
 * latest answer, and the proposal due date while it's the Spark team's turn (New, or changes requested).
 * Nothing is dated after the proposal: how fast the client decides isn't known.
 */
function pointsFor(base: SparkRequest, status: SparkStatus, stored: WorkRequest | undefined, proposals: Proposal[]): TimelinePoint[] {
  const pts: TimelinePoint[] = [];
  const created = stored?.createdAt ?? isoOf(base.created);
  if (created) pts.push({ label: 'New request', at: created, kind: 'done' });
  const last = [...proposals].sort((a, b) => a.version - b.version).pop();
  const sent = last?.sentAt ?? (base.proposal ? isoOf(base.proposal.sent) : undefined);
  const version = last?.version ?? base.proposal?.version ?? 1;
  if (sent) pts.push({ label: version > 1 ? 'Proposal resent' : 'Proposal sent', at: sent, kind: 'done' });
  const answered = last?.decision?.at ?? (base.proposal?.feedback ? isoOf(base.proposal.feedback.at) : undefined);
  const answer = last?.status ?? (base.proposal?.feedback ? 'changes_requested' : undefined);
  if (answered && answer && answer !== 'awaiting' && answer !== 'superseded')
    pts.push({ label: answer === 'changes_requested' ? 'Changes requested' : answer === 'approved' ? 'Approved' : 'Declined', at: answered, kind: 'done' });
  const due = stored?.nextStep?.date ?? base.dueIso;
  if (due && (status === 'submitted' || status === 'in_review' || status === 'changes_requested'))
    pts.push({ label: status === 'changes_requested' ? `Proposal v${version + 1} due` : 'Proposal due', at: due, kind: 'due' });
  return pts;
}

/** A sample row's proposal state, as the proposal statuses the block knows. */
const SAMPLE_STATUS: Record<string, Proposal['status']> = {
  'Awaiting decision': 'awaiting',
  'Changes requested': 'changes_requested',
  Approved: 'approved',
  Declined: 'declined',
};
/** How many of the six sections a sample draft (saved in the editor) has filled in. */
const sampleReady = (d: ProposalDraft) =>
  [
    d.title.trim() && d.summary.trim(),
    d.objectives.some((o) => o.trim()),
    d.scope.some((x) => x.title.trim()),
    d.phases.some((x) => x.name.trim()),
    d.lines.some((x) => x.item.trim()),
    d.terms.some((t) => t.trim()),
  ].filter(Boolean).length;

/** The proposal on a live request, read from the store and shown by ProposalStateCard. */
function LiveProposalCard({ id, first }: { id: string; first: string }) {
  const { state, actions } = useStore();
  const p = latestProposal(state, id);
  const rec = state.sparkDrafts[id];
  const href = `/spark/requests/${id}/proposal`;
  return (
    <ProposalStateCard
      first={first}
      href={href}
      onCreate={() => {
        actions.startSparkDraft(id, blankProposal(state.requests.find((r) => r.id === id)!.title));
        navigate(href);
      }}
      draft={rec && { title: rec.data.title, ready: SECTIONS.filter((s) => isReady(rec.data, s)).length, savedAt: rec.savedAt }}
      sent={
        p && {
          version: p.version,
          title: p.title,
          total: proposalTotal(p),
          sentAt: p.sentAt,
          validUntil: p.validUntil,
          status: p.status,
          decider: p.decision ? personById(state, p.decision.by) : undefined,
          decidedAt: p.decision?.at,
          note: p.decision?.note || p.decision?.reason,
        }
      }
    />
  );
}

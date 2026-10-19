// Screens 2 and 3 · A request from the Spark side, built from the same blocks as the client's request page
// (header, tabs, the request, the proposal card, insights, Stages and Details) with Spark's controls added.
// Brand Co.'s requests are live from the shared store; the other clients keep local state.
import { useState } from 'react';
import { ArrowLeft, Lock, MessageSquare, Plus, Send } from 'lucide-react';
import { Avatar, Button, EmptyState, Tabs, Textarea } from '../../components/ui/primitives';
import { FileIcon } from '../../components/domain';
import { useToast } from '../../components/ui/toast';
import { latestProposal, proposalTotal, proposalWeeks, useStore } from '../../state/store';
import { aed, fmtDate, fmtDateTime, fmtRelative } from '../../lib/format';
import { navigate } from '../../lib/router';
import type { RequestStatus, WorkRequest } from '../../data/types';
import { ThreadComposer, ThreadList, conversationItems, type ConvItem } from '../requests/Conversation';
import { ActivityLog, StatusCard, askOf, findingsFromConversation, toneIcon } from '../requests/RequestDetail';
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
  const [note, setNote] = useState('');

  // The same Stages card as the client's page; sample clients get an equivalent built from their row.
  const stageReq: WorkRequest =
    m.stored ??
    ({ id: base.id, status: m.status as RequestStatus, nextStep: base.dueIso ? { label: base.waitingFor ?? '', date: base.dueIso, onClient: base.waiting === 'client' } : undefined } as WorkRequest);

  const p = m.stored ? latestProposal(state, base.id) : undefined;
  const ask = askOf(base.description);
  const conversation = m.stored?.excerpt && state.conversations.find((c) => c.id === m.stored!.excerpt!.conversationId);
  const findings = m.stored?.excerpt ? (m.stored.excerpt.findings ?? findingsFromConversation(m.stored, conversation || undefined)) : undefined;
  const files = m.stored ? state.docs.filter((d) => d.requestId === base.id) : [];
  const sampleFiles = base.id === 'REQ-100' ? [] : [`Brief — ${base.title}.pdf`];

  return (
    <div className="req-detail">
      <a className="back" href="#/spark" onClick={(e) => (e.preventDefault(), navigate('/spark'))}>
        <ArrowLeft size={15} /> Inbox
      </a>

      <div className="req-layout">
        <div className="req-main">
          <header className="req-head">
            <div className="req-head__top">
              <span className="mono faint">{base.id}</span>
              <SparkStatusChip r={{ ...base, status: m.status }} />
              <span className="spk__client">{client.name}</span>
              {live && <span className="spk__live" title="Shared with the client portal">Live</span>}
            </div>
            <h1 className="req-head__title">{base.title}</h1>
          </header>

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

              {p ? (
                <div className="prop-card">
                  <div className="prop-card__head">
                    <span className="eyebrow">Proposal v{p.version}</span>
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
                    <Button onClick={() => navigate(`/requests/${base.id}/proposal`)}>View as the client sees it</Button>
                    <Button variant="primary" icon={Plus} onClick={() => navigate(`/spark/requests/${base.id}/proposal/new`)}>
                      New version
                    </Button>
                  </div>
                </div>
              ) : base.proposal ? (
                <div className="prop-card">
                  <div className="prop-card__head">
                    <span className="eyebrow">Proposal v{base.proposal.version}</span>
                  </div>
                  <div className="prop-card__nums">
                    <div>
                      <div className="prop-card__num">{aed(base.proposal.total)}</div>
                      <div className="faint">Investment, excl. VAT</div>
                    </div>
                    <div>
                      <div className="prop-card__num">{base.proposal.state}</div>
                      <div className="faint">Sent {base.proposal.sent}</div>
                    </div>
                  </div>
                  <div className="prop-card__foot">
                    <Button variant="primary" icon={Plus} onClick={() => navigate(`/spark/requests/${base.id}/proposal/new`)}>
                      New version
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="ask-empty">
                  <Send size={15} />
                  <div>
                    <div className="ask-empty__title">No proposal yet</div>
                    <div className="faint">Send one when the scope is clear.</div>
                  </div>
                  <Button size="sm" variant="primary" icon={Plus} onClick={() => navigate(`/spark/requests/${base.id}/proposal/new`)}>
                    New proposal
                  </Button>
                </div>
              )}

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
                    <Lock size={12} /> Only the Spark team sees these
                  </span>
                </div>
                {m.notes.map((n) => (
                  <div key={n.id} className="spk-note">
                    <Avatar person={n.by ?? dana} size={22} />
                    <p>{n.text}</p>
                  </div>
                ))}
                <div className="comment-box">
                  <Avatar person={dana} size={28} />
                  <div className="comment-box__field">
                    <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note for the team…" aria-label="Internal note" />
                    <div className="comment-box__bar">
                      <Button
                        size="sm"
                        variant="primary"
                        icon={Send}
                        disabled={!note.trim()}
                        onClick={() => {
                          m.send('internal', note.trim());
                          setNote('');
                        }}
                      >
                        Add note
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {tab === 'conversation' && (
            <div className="req-tab">
              <ThreadList items={m.items} clientName={client.name} />
              <ThreadComposer
                modes={[{ key: 'reply', label: 'Reply to client', icon: MessageSquare, send: 'Send reply', placeholder: `Reply to ${first}…`, note: `${first} and the client team are notified in the portal and by email.` }]}
                onSend={m.send}
                onAttach={() => toast({ title: 'Attach a file', body: 'Files go into the client’s Documents.' })}
              />
            </div>
          )}

          {tab === 'files' && (
            <div className="req-tab">
              {(m.stored ? files.length : sampleFiles.length) ? (
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
                <EmptyState panel title="No files yet." body="Files you or the client attach to this request show up here." />
              )}
              <div className="spk-uploadrow">
                <Button size="sm" icon={Plus} onClick={() => toast({ title: 'Upload a file', body: 'Files go into the client’s Documents, and the client is notified.' })}>
                  Upload a file
                </Button>
              </div>
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

        <aside className="req-side">
          <StatusCard r={stageReq} perspective="spark" />
          <section className="side-card">
            <h3 className="side-card__title">Details</h3>
            <dl className="meta-list">
              <dt>Client</dt>
              <dd>{client.name}</dd>
              <dt>Requested by</dt>
              <dd>
                <Avatar person={base.requester} size={20} /> {base.requester.name}
              </dd>
              <dt>Created</dt>
              <dd>{m.stored ? fmtDateTime(m.stored.createdAt) : base.created}</dd>
              <dt>Type</dt>
              <dd>{base.type}</dd>
              <dt>Timing</dt>
              <dd>{base.timing}</dd>
              {base.budget && (
                <>
                  <dt>Budget</dt>
                  <dd>{base.budget}</dd>
                </>
              )}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

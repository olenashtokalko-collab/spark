// Screens 2 and 3 · A request from the Spark side: overview (status, owner, proposals, internal notes) and the
// conversation with the client. Brand Co.'s requests are live from the shared store; others keep local state.
import { useState } from 'react';
import { ArrowLeft, FileText, HelpCircle, Lock, MessageSquare, Paperclip, Plus } from 'lucide-react';
import { Avatar, Badge, Button, EmptyState, Select, Tabs, Textarea } from '../../components/ui/primitives';
import { useToast } from '../../components/ui/toast';
import { useStore } from '../../state/store';
import { aed } from '../../lib/format';
import { navigate } from '../../lib/router';
import type { RequestStatus } from '../../data/types';
import { ThreadComposer, ThreadList, conversationItems, type ConvItem } from '../requests/Conversation';
import { STATUS_LABEL, clientOf, dana, sampleThread, sparkTeam, type SparkRequest, type SparkStatus } from './data';
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
  const m = useRequestModel(base, live);
  const r = { ...base, status: m.status };
  const client = clientOf(base.clientId);
  const first = base.requester.name.split(' ')[0];
  const open = (t: Tab) => navigate(`/spark/requests/${base.id}${t === 'overview' ? '' : '/' + t}`);
  const messages = m.items.filter((x) => x.kind !== 'system').length;
  const waitingOnSpark = base.waiting === 'spark' && m.items.some((x) => x.kind === 'message' && x.by?.org === 'client');

  return (
    <div className="spk-req">
      <a className="back" href="#/spark" onClick={(e) => (e.preventDefault(), navigate('/spark'))}>
        <ArrowLeft size={14} /> Inbox
      </a>
      <header className="spk-req__head">
        <div className="spk-req__titleblock">
          <div className="spk-req__meta">
            <span className="mono faint">{base.id}</span>
            <span className="spk__client">{client.name}</span>
            <SparkStatusChip r={r} />
            {live && <span className="spk__live" title="Shared with the client portal">Live</span>}
          </div>
          <h1 className="page-head__title spk-req__title">{base.title}</h1>
        </div>
        <div className="spk-req__controls">
          <label className="spk-req__ctl">
            <span>Status</span>
            <Select value={m.status} onChange={(e) => m.setStatus(e.target.value as SparkStatus)}>
              {(Object.keys(STATUS_LABEL) as SparkStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </label>
          <label className="spk-req__ctl">
            <span>Owner</span>
            <Select value={m.owner} onChange={(e) => m.setOwner(e.target.value)}>
              {sparkTeam.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </header>

      <div className="toolbar">
        <Tabs
          className="tabs--underline"
          value={tab}
          onChange={open}
          items={[
            { value: 'overview', label: 'Overview' },
            { value: 'conversation', label: 'Conversation', count: messages },
            { value: 'files', label: 'Files', count: base.id === 'REQ-100' ? 3 : 1 },
            { value: 'activity', label: 'Activity' },
          ]}
        />
      </div>

      {tab === 'overview' && (
        <div className="spk-req__grid">
          <div className="spk-req__main">
            {waitingOnSpark && (
              <button className="spk-callout" onClick={() => open('conversation')}>
                <HelpCircle size={16} /> {first} is waiting for your reply: {base.waitingFor?.toLowerCase()}. <span>Open the conversation</span>
              </button>
            )}
            <section className="block">
              <h3 className="block__title">The request</h3>
              <p className="spk-req__desc">{base.description}</p>
            </section>
            <section className="block">
              <div className="spk-block-head">
                <h3 className="block__title">Proposals</h3>
                <Button size="sm" icon={Plus} onClick={() => navigate(`/spark/requests/${base.id}/proposal/new`)}>
                  {base.proposal ? 'New version' : 'New proposal'}
                </Button>
              </div>
              {base.proposal ? (
                <div className="spk-prop">
                  <FileText size={18} />
                  <div>
                    <div className="spk-prop__title">
                      Proposal v{base.proposal.version} · {aed(base.proposal.total)}
                    </div>
                    <div className="faint">Sent {base.proposal.sent}</div>
                  </div>
                  <Badge>{base.proposal.state}</Badge>
                </div>
              ) : (
                <p className="muted">No proposal yet. Send one when the scope is clear.</p>
              )}
            </section>
            <section className="block spk-notes">
              <h3 className="block__title">
                Internal notes{' '}
                <span className="conv-lock">
                  <Lock size={12} /> Only the Spark team sees these
                </span>
              </h3>
              {m.notes.map((n) => (
                <div key={n.id} className="spk-note">
                  <Avatar person={n.by ?? dana} size={22} />
                  <p>{n.text}</p>
                </div>
              ))}
              <NoteForm onAdd={(t) => m.send('internal', t)} />
            </section>
          </div>
          <aside className="spk-req__side">
            <section className="side-card">
              <h3 className="side-card__title">Details</h3>
              <dl className="spk-dl">
                <dt>Client</dt>
                <dd>{client.name}</dd>
                <dt>Requested by</dt>
                <dd>{base.requester.name}</dd>
                <dt>Type</dt>
                <dd>{base.type}</dd>
                <dt>Timing</dt>
                <dd>{base.timing}</dd>
                <dt>Budget</dt>
                <dd>{base.budget ?? '—'}</dd>
                <dt>Created</dt>
                <dd>{base.created}</dd>
              </dl>
            </section>
            <section className="side-card">
              <h3 className="side-card__title">Next step</h3>
              <p className="spk-next">
                {base.waiting === 'spark' ? 'Spark: ' : base.waiting === 'client' ? 'Client: ' : ''}
                {base.waitingFor ?? 'Nothing is waiting.'}
              </p>
              {base.due && <p className="faint">Due {base.due}</p>}
            </section>
          </aside>
        </div>
      )}

      {tab === 'conversation' && (
        <div className="conv">
          <ThreadList items={m.items} clientName={client.name} />
          <ThreadComposer
            modes={[
              { key: 'reply', label: 'Reply to client', icon: MessageSquare, send: 'Send reply', placeholder: `Reply to ${first}…`, note: `${first} and the client team are notified in the portal and by email.` },
              { key: 'question', label: 'Ask a question', icon: HelpCircle, send: 'Send question', placeholder: `Ask ${first} a follow-up question…`, note: `${first} is asked to answer; the request shows “waiting on the client”.` },
              { key: 'internal', label: 'Internal note', icon: Lock, send: 'Add note', placeholder: 'A note for the Spark team. The client will not see it.', note: 'Visible to the Spark team only.' },
            ]}
            onSend={m.send}
            onAttach={() => toast({ title: 'Attach a file', body: 'Files go into the client’s Documents.' })}
          />
        </div>
      )}

      {tab === 'files' && (
        <section className="block">
          <h3 className="block__title">Files shared with {client.name}</h3>
          {(base.id === 'REQ-100' ? ['Proposal — UAE National Day window displays.pdf', 'Store measurements.xlsx', 'Brand Guidelines v3.2.pdf'] : [`Brief — ${base.title}.pdf`]).map((f) => (
            <div key={f} className="spk-file">
              <Paperclip size={15} />
              <span>{f}</span>
              <span className="faint">{base.id === 'REQ-100' ? 'Shared with client' : 'From the client'}</span>
            </div>
          ))}
          <Button size="sm" icon={Plus} onClick={() => toast({ title: 'Upload a file', body: 'Files go into the client’s Documents, and the client is notified.' })}>
            Upload a file
          </Button>
        </section>
      )}

      {tab === 'activity' && (
        <section className="block">
          <h3 className="block__title">Activity</h3>
          {m.items
            .filter((x) => x.kind === 'system')
            .reverse()
            .map((x) => (
              <div key={x.id} className="spk-act">
                <span className="faint">{x.at}</span>
                <span>{x.text}</span>
              </div>
            ))}
          <div className="spk-act">
            <span className="faint">{base.created}</span>
            <span>{base.requester.name} created this request.</span>
          </div>
        </section>
      )}
    </div>
  );
}

function NoteForm({ onAdd }: { onAdd: (t: string) => void }) {
  const [v, setV] = useState('');
  return (
    <div className="spk-noteform">
      <Textarea rows={2} value={v} onChange={(e) => setV(e.target.value)} placeholder="Add a note for the team…" />
      <Button
        size="sm"
        disabled={!v.trim()}
        onClick={() => {
          onAdd(v.trim());
          setV('');
        }}
      >
        Add note
      </Button>
    </div>
  );
}

// Screens 2 and 3 · A request from the Spark side: overview with status, owner, proposals and internal notes,
// and the conversation with the client (questions, replies, internal notes). State is local to the page.
import { useState } from 'react';
import { ArrowLeft, FileText, Lock, MessageSquare, Paperclip, Plus, Send, HelpCircle } from 'lucide-react';
import { Avatar, Button, EmptyState, Select, Tabs, Textarea, cx } from '../../components/ui/primitives';
import { useToast } from '../../components/ui/toast';
import { aed } from '../../lib/format';
import { navigate } from '../../lib/router';
import { STATUS_LABEL, clientOf, dana, requests, sparkTeam, threadFor, type Msg, type SparkRequest, type SparkStatus } from './data';
import { SparkStatusChip } from './SparkInbox';

type Tab = 'overview' | 'conversation' | 'files' | 'activity';

export function SparkRequestPage({ id, tab }: { id: string; tab: Tab }) {
  const base = requests.find((r) => r.id === id);
  if (!base) return <EmptyState title="Request not found" action={<Button onClick={() => navigate('/spark')}>Back to inbox</Button>} />;
  return <Inner key={id} base={base} tab={tab} />;
}

function Inner({ base, tab }: { base: SparkRequest; tab: Tab }) {
  const toast = useToast();
  const [status, setStatus] = useState<SparkStatus>(base.status);
  const [owner, setOwner] = useState(base.owner.id);
  const [thread, setThread] = useState<Msg[]>(() => threadFor(base));
  const [notes, setNotes] = useState<string[]>(base.id === 'REQ-100' ? ['Budget range up to AED 60k. Show the price per store as a line item.'] : []);
  const r = { ...base, status };
  const client = clientOf(base.clientId);
  const open = (t: Tab) => navigate(`/spark/requests/${base.id}${t === 'overview' ? '' : '/' + t}`);
  const unanswered = thread.filter((m) => m.question && m.kind === 'client').length;

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
          </div>
          <h1 className="page-head__title spk-req__title">{base.title}</h1>
        </div>
        <div className="spk-req__controls">
          <label className="spk-req__ctl">
            <span>Status</span>
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as SparkStatus);
                setThread((t) => [...t, { id: 's' + t.length, kind: 'system', at: 'Just now', text: `Dana Kareem moved the request to ${STATUS_LABEL[e.target.value as SparkStatus]}.` }]);
                toast({ title: 'Status updated', body: `${base.requester.name.split(' ')[0]} sees “${STATUS_LABEL[e.target.value as SparkStatus]}” in the portal and is notified.` });
              }}
            >
              {(Object.keys(STATUS_LABEL) as SparkStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </label>
          <label className="spk-req__ctl">
            <span>Owner</span>
            <Select value={owner} onChange={(e) => setOwner(e.target.value)}>
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
            { value: 'conversation', label: 'Conversation', count: thread.filter((m) => m.kind !== 'system').length },
            { value: 'files', label: 'Files', count: base.id === 'REQ-100' ? 3 : 1 },
            { value: 'activity', label: 'Activity' },
          ]}
        />
      </div>

      {tab === 'overview' && (
        <div className="spk-req__grid">
          <div className="spk-req__main">
            {unanswered > 0 && base.waiting === 'spark' && (
              <button className="spk-callout" onClick={() => open('conversation')}>
                <HelpCircle size={16} /> {base.requester.name.split(' ')[0]} is waiting for your reply: {base.waitingFor?.toLowerCase()}. <span>Open the conversation</span>
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
                  <span className="spk__wait">{base.proposal.state}</span>
                </div>
              ) : (
                <p className="muted">No proposal yet. Send one when the scope is clear.</p>
              )}
            </section>
            <section className="block spk-notes">
              <h3 className="block__title">
                Internal notes <span className="spk-lock"><Lock size={12} /> Only the Spark team sees these</span>
              </h3>
              {notes.map((n, i) => (
                <div key={i} className="spk-note">
                  <Avatar person={dana} size={22} />
                  <p>{n}</p>
                </div>
              ))}
              <NoteForm
                onAdd={(t) => {
                  setNotes((n) => [...n, t]);
                  toast({ title: 'Note added', body: 'Clients never see internal notes.' });
                }}
              />
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
              <p className="spk-next">{base.waiting === 'spark' ? 'Spark: ' : base.waiting === 'client' ? 'Client: ' : ''}{base.waitingFor ?? 'Nothing is waiting.'}</p>
              {base.due && <p className="faint">Due {base.due}</p>}
            </section>
          </aside>
        </div>
      )}

      {tab === 'conversation' && <Conversation base={base} thread={thread} setThread={setThread} />}

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
          {thread
            .filter((m) => m.kind === 'system')
            .reverse()
            .concat([{ id: 'c', kind: 'system', at: base.created, text: `${base.requester.name} created this request.` }])
            .map((m) => (
              <div key={m.id} className="spk-act">
                <span className="faint">{m.at}</span>
                <span>{m.text}</span>
              </div>
            ))}
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

function Conversation({ base, thread, setThread }: { base: SparkRequest; thread: Msg[]; setThread: (f: (t: Msg[]) => Msg[]) => void }) {
  const toast = useToast();
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'reply' | 'question' | 'internal'>('reply');
  const first = base.requester.name.split(' ')[0];
  const send = () => {
    if (!text.trim()) return;
    setThread((t) => [...t, { id: 'n' + t.length, kind: mode === 'internal' ? 'internal' : 'spark', by: dana, at: 'Just now', text: text.trim(), question: mode === 'question' }]);
    setText('');
    toast(mode === 'internal' ? { title: 'Internal note added', body: 'Only the Spark team sees it.' } : { title: mode === 'question' ? 'Question sent' : 'Reply sent', body: `${first} is notified and sees it on the request in the client portal.` });
  };
  return (
    <div className="spk-conv">
      <div className="spk-thread">
        {thread.map((m) =>
          m.kind === 'system' ? (
            <div key={m.id} className="spk-sys">
              <span>{m.text}</span>
              <span className="faint">{m.at}</span>
            </div>
          ) : (
            <div key={m.id} className={cx('spk-msg', `spk-msg--${m.kind}`)}>
              {m.by && <Avatar person={m.by} size={30} />}
              <div className="spk-msg__body">
                <div className="spk-msg__head">
                  <strong>{m.by?.name}</strong>
                  <span className="faint">{m.by?.org === 'spark' ? 'Spark' : clientOf(base.clientId).name}</span>
                  {m.kind === 'internal' && (
                    <span className="spk-lock">
                      <Lock size={12} /> Internal note
                    </span>
                  )}
                  {m.question && <span className="spk__wait spk__wait--spark">Question</span>}
                  <span className="faint spk-msg__at">{m.at}</span>
                </div>
                <p>{m.text}</p>
              </div>
            </div>
          ),
        )}
      </div>
      <div className="spk-compose">
        <div className="spk-compose__modes" role="tablist" aria-label="Message type">
          {([
            ['reply', 'Reply to client', MessageSquare],
            ['question', 'Ask a question', HelpCircle],
            ['internal', 'Internal note', Lock],
          ] as const).map(([k, label, Icon]) => (
            <button key={k} role="tab" aria-selected={mode === k} className={cx('spk-compose__mode', mode === k && 'is-on')} onClick={() => setMode(k)}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
        <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={mode === 'internal' ? 'A note for the Spark team. The client will not see it.' : mode === 'question' ? `Ask ${first} a follow-up question…` : `Reply to ${first}…`} />
        <div className="spk-compose__foot">
          <span className="faint">{mode === 'internal' ? 'Visible to the Spark team only.' : `${first} and the client team are notified in the portal and by email.`}</span>
          <span className="spk-compose__acts">
            <Button size="sm" icon={Paperclip} onClick={() => toast({ title: 'Attach a file', body: 'Files go into the client’s Documents.' })}>
              Attach
            </Button>
            <Button variant="primary" size="sm" icon={Send} disabled={!text.trim()} onClick={send}>
              {mode === 'internal' ? 'Add note' : mode === 'question' ? 'Send question' : 'Send reply'}
            </Button>
          </span>
        </div>
      </div>
    </div>
  );
}

// The conversation on a request, shared by both sides: the client's request page and the Spark team view.
// One thread per request; Spark's internal notes are marked and never reach the client side.
import { useState } from 'react';
import { Lock, Plus, Send } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Avatar, Badge, Button, Segmented, Textarea, cx } from '../../components/ui/primitives';
import { personById, type State } from '../../state/store';
import { fmtDateTime } from '../../lib/format';
import type { Person, WorkRequest } from '../../data/types';

export interface ConvItem {
  id: string;
  kind: 'message' | 'internal' | 'system';
  by?: Person;
  at: string; // already formatted
  text: string;
  question?: boolean;
}

/** The thread of a stored request, with the stage changes and proposals between the messages.
 *  `viewer` decides whether Spark's internal notes are included. */
export function conversationItems(state: State, r: WorkRequest, viewer: 'client' | 'spark'): ConvItem[] {
  // The client sees Spark's people as "Spark"; the Spark team sees their real names.
  const person = (id: string) => (viewer === 'spark' ? state.people.find((p) => p.id === id) ?? personById(state, id) : personById(state, id));
  const rows: { at: string; item: ConvItem }[] = [];
  // The thread starts with the request itself, unless it was seeded with the client's first message.
  if (r.thread?.[0]?.by !== r.createdBy) {
    const generated = /^(Key findings from the assistant:|From the assistant:)/.test(r.description);
    const text = generated ? (r.description.split("What we'd like from Spark:")[1] ?? '').trim() || 'Created this request from a chat with the assistant.' : r.description;
    rows.push({ at: r.createdAt, item: { id: 'req-' + r.id, kind: 'message', by: person(r.createdBy), at: fmtDateTime(r.createdAt), text } });
  }
  for (const m of r.thread ?? []) {
    if (m.kind === 'internal' && viewer !== 'spark') continue;
    rows.push({ at: m.at, item: { id: m.id, kind: m.kind === 'internal' ? 'internal' : 'message', by: person(m.by), at: fmtDateTime(m.at), text: m.text, question: m.kind === 'question' } });
  }
  for (const a of r.activity) {
    if (a.kind !== 'status' && a.kind !== 'proposal' && a.kind !== 'decision') continue;
    const who = person(a.by);
    rows.push({ at: a.at, item: { id: a.id, kind: 'system', at: fmtDateTime(a.at), text: `${who.name} ${a.text}.` } });
  }
  return rows.sort((a, b) => a.at.localeCompare(b.at)).map((x) => x.item);
}

export function ThreadList({ items, clientName }: { items: ConvItem[]; clientName: string }) {
  if (!items.length) return <p className="muted">No messages yet.</p>;
  return (
    <div className="conv-thread">
      {items.map((m) =>
        m.kind === 'system' ? (
          <div key={m.id} className="conv-sys">
            <span>{m.text}</span>
            <span className="faint">{m.at}</span>
          </div>
        ) : (
          <div key={m.id} className={cx('conv-msg', `conv-msg--${m.kind === 'internal' ? 'internal' : m.by?.org === 'spark' ? 'spark' : 'client'}`)}>
            {m.by && <Avatar person={m.by} size={30} />}
            <div className="conv-msg__body">
              <div className="conv-msg__head">
                <strong>{m.by?.name}</strong>
                {m.by && m.by.name !== 'Spark' && <span className="faint">{m.by.org === 'spark' ? 'Spark' : clientName}</span>}
                {m.kind === 'internal' && (
                  <span className="conv-lock">
                    <Lock size={12} /> Internal note
                  </span>
                )}
                {m.question && <Badge tone="warning">Question</Badge>}
                <span className="faint conv-msg__at">{m.at}</span>
              </div>
              <p>{m.text}</p>
            </div>
          </div>
        ),
      )}
    </div>
  );
}

export interface ComposerMode {
  key: string;
  label: string;
  icon: LucideIcon;
  send: string; // the button label
  placeholder: string;
  note: string;
}

/** A box to write in. One mode is a plain reply box; several give the Spark team its tabs
 *  (reply, ask a question, internal note). */
export function ThreadComposer({ modes, onSend, onAttach }: { modes: ComposerMode[]; onSend: (mode: string, text: string) => void; onAttach?: () => void }) {
  const [text, setText] = useState('');
  const [key, setKey] = useState(modes[0].key);
  const mode = modes.find((m) => m.key === key) ?? modes[0];
  const send = () => {
    if (!text.trim()) return;
    onSend(mode.key, text.trim());
    setText('');
  };
  return (
    <div className="conv-compose">
      {modes.length > 1 && (
        <div className="conv-compose__modes">
          <Segmented value={key} onChange={setKey} label="Message type" items={modes.map((m) => ({ value: m.key, label: m.label, icon: m.icon }))} />
        </div>
      )}
      {/* The box holds the text, the attach "+" and the send button together. */}
      <div className="conv-box">
        <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={mode.placeholder} onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }} />
        <div className="conv-box__bar">
          {onAttach ? (
            <button className="btn btn--ghost btn--sm btn--icon" aria-label="Attach a file" data-tip="Attach a file" onClick={onAttach}>
              <Plus size={18} />
            </button>
          ) : (
            <span />
          )}
          <Button variant="primary" size="sm" icon={Send} disabled={!text.trim()} onClick={send}>
            {mode.send}
          </Button>
        </div>
      </div>
      <p className="conv-compose__note faint">{mode.note}</p>
    </div>
  );
}

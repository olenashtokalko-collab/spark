// Prototype-only page (#/demo/chat): five looks for the chat start screen,
// each after a set of references the team shared. They are explorations, so
// each frame carries its own palette; the composer and the suggestions are
// live and start a real chat in the portal.
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  ArrowUp,
  ChevronDown,
  FileUp,
  Globe,
  Inbox,
  Keyboard,
  Lightbulb,
  MessageSquare,
  MessageSquareQuote,
  Mic,
  Palette,
  Paperclip,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  SquarePen,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { latestProposal, proposalTotal, useStore } from '../../state/store';
import { suggestedPrompts } from '../../data/assistant';
import { PageHeader, Tabs, cx } from '../../components/ui/primitives';
import { DotSphere } from '../../components/ui/DotSphere';
import { FluidOrb } from '../../components/ui/FluidOrb';
import { navigate } from '../../lib/router';
import { aed, dueLabel, fmtRelative } from '../../lib/format';

const ICON: Record<string, LucideIcon> = {
  'Shape an idea': Lightbulb,
  'Background check': ShieldCheck,
  'What people say': MessageSquareQuote,
  'Know the audience': UsersRound,
  'Explore a look': Palette,
};

/** Shared: start a real chat from any variant. */
function useStart() {
  const { actions } = useStore();
  return (q: string) => {
    if (!q.trim()) return;
    const id = actions.ask(null, q.trim());
    navigate(`/assistant/${id}`);
  };
}

/** Workspace facts the richer variants surface next to the composer. */
function useFacts() {
  const { state, me } = useStore();
  return useMemo(() => {
    const req = state.requests.find((r) => r.status === 'proposal');
    const p = req ? latestProposal(state, req.id) : undefined;
    const doc = state.docs.find((d) => d.review?.status === 'open');
    const chats = [...state.conversations]
      .filter((c) => c.messages.some((m) => m.role === 'user'))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 4);
    return { me, req, p, doc, chats, first: me.name.split(' ')[0] };
  }, [state, me]);
}

function useInput(onSend: (q: string) => void) {
  const [v, setV] = useState('');
  return {
    value: v,
    bind: {
      value: v,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setV(e.target.value),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onSend(v);
      },
    },
    send: () => onSend(v),
  };
}

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

// ---- 1 · Calm greeting (Copilot) ---------------------------------------------------------

function Calm() {
  const start = useStart();
  const { first } = useFacts();
  const inp = useInput(start);
  return (
    <div className="cv cv--calm">
      <div className="calm">
        <h2 className="calm__hello">
          Nice to see you, {first}.
          <br />
          What’s on your mind?
        </h2>
        <div className="calm__box">
          <input placeholder="Message Spark AI" aria-label="Message Spark AI" {...inp.bind} />
          <div className="calm__bar">
            <DotSphere size={22} density={60} still />
            <button className="calm__mode">
              Quick answer <ChevronDown size={14} />
            </button>
            <span className="calm__spacer" />
            <button className="calm__icon" aria-label="Attach">
              <Paperclip size={18} />
            </button>
            <button className="calm__icon" aria-label="Send" onClick={inp.send}>
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
        <div className="calm__chips">
          {suggestedPrompts.map((p) => (
            <button key={p.label} onClick={() => start(p.prompt)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <p className="calm__foot">Spark AI can make mistakes. Spark’s team reviews anything you send as a request.</p>
    </div>
  );
}

// ---- 6 · Calm + orb ------------------------------------------------------------------------

/** Composer after the Copilot reference. Empty: attach + mic. Typing: the box
 *  lights up, grows with the text (up to ~6 lines), the mic turns into a send
 *  button and the orb speeds up. Enter sends, Shift+Enter adds a line. */
function CalmOrb() {
  const start = useStart();
  const { first } = useFacts();
  const [v, setV] = useState('');
  const typing = !!v.trim();
  const grow = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };
  return (
    <div className="cv cv--calm cv--calmorb">
      <div className="calm calm--center c6">
        <FluidOrb size={170} active={typing} />
        <h2 className="calm__hello">
          Nice to see you, {first}.
          <br />
          What’s new?
        </h2>
        <div className={cx('c6box', typing && 'is-typing')}>
          <textarea
            rows={1}
            value={v}
            placeholder="Message Spark AI"
            aria-label="Message Spark AI"
            onChange={(e) => {
              setV(e.target.value);
              grow(e.target);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                start(v);
              }
            }}
          />
          <div className="c6box__bar">
            <FluidOrb size={26} active={typing} />
            <button className="c6box__mode">
              Quick answer <ChevronDown size={15} />
            </button>
            <span className="calm__spacer" />
            <button className="c6box__icon" aria-label="Attach">
              <Plus size={22} strokeWidth={1.6} />
            </button>
            {typing ? (
              <button className="c6box__send" aria-label="Send" onClick={() => start(v)}>
                <ArrowUp size={18} />
              </button>
            ) : (
              <button className="c6box__icon" aria-label="Voice">
                <Mic size={21} strokeWidth={1.6} />
              </button>
            )}
          </div>
        </div>
        <div className={cx('calm__chips c6chips', typing && 'is-dim')}>
          {suggestedPrompts.map((p) => (
            <button key={p.label} onClick={() => start(p.prompt)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <p className="calm__foot">Spark AI can make mistakes. Spark’s team reviews anything you send as a request.</p>
    </div>
  );
}

// ---- 2 · Gradient + floating glass cards (CFI) ---------------------------------------------------

function Gradient() {
  const start = useStart();
  const { req, p, doc, first } = useFacts();
  const inp = useInput(start);
  return (
    <div className="cv cv--gradient">
      <div className="grad__copy">
        <h2>
          Ask anything about
          <br />
          your brand, {first}
        </h2>
        <p>Answers from your files and the web, with sources. When it needs real work, request a proposal from Spark.</p>
        <div className="grad__box">
          <input placeholder="e.g. What could hurt the brand in Riyadh?" aria-label="Ask" {...inp.bind} />
          <button onClick={inp.send}>Ask Spark AI</button>
        </div>
        <div className="grad__chips">
          {suggestedPrompts.slice(0, 3).map((x) => (
            <button key={x.label} onClick={() => start(x.prompt)}>
              {x.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grad__cards" aria-hidden>
        <div className="glass glass--a">
          <span className="glass__label">Needs your decision</span>
          <strong>{req?.title ?? 'Riyadh launch campaign'}</strong>
          <span className="glass__meta">
            Proposal v{p?.version ?? 2} · {p ? aed(proposalTotal(p)) : 'AED 186,000'} · {p ? dueLabel(p.validUntil) : 'due soon'}
          </span>
        </div>
        <div className="glass glass--b">
          <span className="glass__label">This week on social</span>
          <div className="glass__stat">
            <strong>2,430</strong>
            <span className="glass__up">+18%</span>
          </div>
          <svg viewBox="0 0 160 40" className="glass__spark">
            <path d="M0 32 L20 28 L40 30 L60 22 L80 24 L100 14 L120 18 L140 8 L160 10" fill="none" stroke="#7fb4ff" strokeWidth="2" />
          </svg>
        </div>
        <div className="glass glass--c">
          <span className="glass__label">Approval requested</span>
          <strong>{doc?.name.replace(/\.[a-z]+$/i, '') ?? 'Packaging concepts'}</strong>
          <span className="glass__meta">{doc?.review ? dueLabel(doc.review.due) : 'due in 2 days'}</span>
        </div>
        <div className="glass glass--d">
          <MessageSquare size={18} />
        </div>
      </div>
    </div>
  );
}

// ---- 3 · Orb (voice-first AI apps) -------------------------------------------------------------------

const ORB_LINES = ['Tell me what you need, and I’ll help.', 'Ask about your brand, files or requests.', 'Turn an idea into a brief for Spark.'];

function Orb() {
  const start = useStart();
  const [listening, setListening] = useState(false);
  const [typing, setTyping] = useState(false);
  const [line, setLine] = useState(0);
  const [shown, setShown] = useState('');
  const inp = useInput(start);

  // Typewriter for the prompt line.
  useEffect(() => {
    const full = ORB_LINES[line];
    let i = 0;
    setShown('');
    const t = setInterval(() => {
      i += 1;
      setShown(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(t);
        setTimeout(() => setLine((l) => (l + 1) % ORB_LINES.length), 2200);
      }
    }, 38);
    return () => clearInterval(t);
  }, [line]);

  return (
    <div className="cv cv--orb">
      <div className={cx('orb', listening && 'is-listening')} aria-hidden>
        <span className="orb__core" />
        <span className="orb__ring" />
        <span className="orb__shine" />
      </div>
      <p className="orb__line">
        {listening ? 'Listening…' : shown}
        <span className="orb__cursor" />
      </p>
      {typing ? (
        <div className="orb__type">
          <input autoFocus placeholder="Type your question" aria-label="Type your question" {...inp.bind} />
          <button onClick={inp.send} aria-label="Send">
            <ArrowUp size={18} />
          </button>
        </div>
      ) : (
        <div className="orb__chips">
          {suggestedPrompts.slice(0, 3).map((p) => (
            <button key={p.label} onClick={() => start(p.prompt)}>
              {p.label}
            </button>
          ))}
        </div>
      )}
      <div className="orb__bar">
        <button className="orb__side" onClick={() => setTyping((t) => !t)} aria-label={typing ? 'Back to voice' : 'Type instead'}>
          {typing ? <RotateCcw size={18} /> : <Keyboard size={18} />}
        </button>
        <button className={cx('orb__mic', listening && 'is-on')} onClick={() => setListening((l) => !l)} aria-label={listening ? 'Stop' : 'Speak'}>
          <Mic size={22} />
        </button>
        <button className="orb__side" onClick={() => setListening(false)} aria-label="Cancel">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

// ---- 4 · Editorial dot-matrix (Chainforge) ---------------------------------------------------------------

function Editorial() {
  const start = useStart();
  const { req, p } = useFacts();
  const inp = useInput(start);
  return (
    <div className="cv cv--editorial">
      <div className="edit__grain" aria-hidden />
      <div className="edit__sphere" aria-hidden>
        <DotSphere size={420} density={520} />
      </div>
      <div className="edit__card">
        <span className="edit__tag">● Waiting on you</span>
        <p>
          {req?.title ?? 'Riyadh launch campaign'}: proposal v{p?.version ?? 2} is ready.
        </p>
        <div className="edit__stats">
          <div>
            <strong>{p ? aed(proposalTotal(p)).replace('AED ', '') : '186,000'}</strong>
            <span>AED</span>
          </div>
          <div>
            <strong>{p ? dueLabel(p.validUntil).replace('due ', '') : 'tomorrow'}</strong>
            <span>Decision</span>
          </div>
        </div>
        <span className="edit__wire" />
      </div>
      <div className="edit__main">
        <h2 className="edit__title">
          ASK SPARK <em>anything</em>
        </h2>
        <div className="edit__box">
          <span className="edit__prompt">&gt;</span>
          <input placeholder="WHAT DO YOU NEED TODAY?" aria-label="Ask" {...inp.bind} />
          <button onClick={inp.send}>
            SEND <ArrowRight size={14} />
          </button>
        </div>
        <div className="edit__tags">
          {suggestedPrompts.map((x) => (
            <button key={x.label} onClick={() => start(x.prompt)}>
              {x.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- 5 · Command centre dashboard (Nova) --------------------------------------------------------------------

function Command() {
  const start = useStart();
  const { chats, req, doc, first } = useFacts();
  const inp = useInput(start);
  const tiles = ['tile--violet', 'tile--pink', 'tile--blue', 'tile--indigo'];
  return (
    <div className="cv cv--command">
      <div className="cmd__main">
        <div>
          <h2 className="cmd__hello">
            {greeting()}, {first}
          </h2>
          <p className="cmd__sub">Ask, explore and send work to Spark</p>
        </div>
        <div className="cmd__box">
          <div className="cmd__row">
            <span className="cmd__spark">
              <DotSphere size={22} density={60} still />
            </span>
            <input placeholder="Ask Spark AI to research, explain or draft…" aria-label="Ask" {...inp.bind} />
            <button className="cmd__mic" aria-label="Voice">
              <Mic size={18} />
            </button>
          </div>
          <div className="cmd__tools">
            <button>
              <Paperclip size={14} /> Attach
            </button>
            <button>
              <Globe size={14} /> Web search
            </button>
            <button>
              <Search size={14} /> Deep research
            </button>
            <span className="cmd__spacer" />
            <button className="cmd__send" onClick={inp.send} aria-label="Send">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <div>
          <div className="cmd__label">Suggested</div>
          <div className="cmd__actions">
            {suggestedPrompts.slice(0, 4).map((x, i) => {
              const I = ICON[x.label] ?? Lightbulb;
              return (
                <button key={x.label} className="cmd__action" onClick={() => start(x.prompt)}>
                  <span className={cx('cmd__tile', tiles[i])}>
                    <I size={20} />
                  </span>
                  <span className="cmd__action-title">{x.label}</span>
                  <span className="cmd__action-hint">{x.hint}</span>
                  <ArrowRight size={16} className="cmd__action-arrow" />
                </button>
              );
            })}
          </div>
        </div>
        <div className="cmd__panels">
          <Panel title="Recent chats" action="View all" onAction={() => navigate('/assistant')}>
            {chats.map((c) => (
              <button key={c.id} className="cmd__item" onClick={() => navigate(`/assistant/${c.id}`)}>
                <span className="cmd__item-icon">
                  <MessageSquare size={15} />
                </span>
                <span className="cmd__item-title">{c.title}</span>
                <span className="cmd__item-meta">{fmtRelative(c.updatedAt)}</span>
              </button>
            ))}
          </Panel>
          <Panel title="Needs you" action="Requests" onAction={() => navigate('/requests')}>
            {req && (
              <button className="cmd__item" onClick={() => navigate(`/requests/${req.id}`)}>
                <span className="cmd__item-icon">
                  <Inbox size={15} />
                </span>
                <span className="cmd__item-title">{req.title}</span>
                <span className="cmd__status is-warn">Proposal</span>
              </button>
            )}
            {doc && (
              <button className="cmd__item" onClick={() => navigate(`/documents/${doc.folderId}?doc=${doc.id}`)}>
                <span className="cmd__item-icon">
                  <FileUp size={15} />
                </span>
                <span className="cmd__item-title">{doc.name.replace(/\.[a-z]+$/i, '')}</span>
                <span className="cmd__status is-warn">Approval</span>
              </button>
            )}
            <button className="cmd__item" onClick={() => navigate('/monitoring')}>
              <span className="cmd__item-icon">
                <MessageSquareQuote size={15} />
              </span>
              <span className="cmd__item-title">Weekly social summary</span>
              <span className="cmd__status is-ok">New</span>
            </button>
          </Panel>
        </div>
      </div>
      <aside className="cmd__side">
        <div className="cmd__assistant">
          <div className="cmd__assistant-head">Spark AI</div>
          <div className="cmd__orb">
            <div className="orb orb--small" aria-hidden>
              <span className="orb__core" />
              <span className="orb__ring" />
              <span className="orb__shine" />
            </div>
          </div>
          <div className="cmd__assistant-name">
            Spark AI <span>Online</span>
          </div>
          <p>Ready to research your brand, explain your files and turn ideas into a brief for Spark.</p>
        </div>
        <div className="cmd__quick">
          <div className="cmd__label">Quick actions</div>
          <button onClick={() => navigate('/assistant')}>
            <SquarePen size={16} /> New chat <ArrowRight size={15} />
          </button>
          <button onClick={() => navigate('/documents')}>
            <FileUp size={16} /> Upload file <ArrowRight size={15} />
          </button>
          <button onClick={() => navigate('/requests')}>
            <Inbox size={16} /> Request proposal <ArrowRight size={15} />
          </button>
        </div>
      </aside>
    </div>
  );
}

function Panel({ title, action, onAction, children }: { title: string; action: string; onAction: () => void; children: ReactNode }) {
  return (
    <div className="cmd__panel">
      <div className="cmd__panel-head">
        <span>{title}</span>
        <button onClick={onAction}>{action}</button>
      </div>
      {children}
    </div>
  );
}

// ---- Page ---------------------------------------------------------------------------------------------------------

const VARIANTS = [
  { id: '1', label: '1 · Calm', ref: 'Copilot', note: 'A warm, quiet greeting and one big input. The fewest decisions; suggestions sit under the box as plain pills.', View: Calm },
  { id: '2', label: '2 · Gradient + cards', ref: 'CFI', note: 'Blue gradient with floating glass cards that surface what needs the client: the proposal waiting, this week on social, an approval.', View: Gradient },
  { id: '3', label: '3 · Orb', ref: 'Voice AI apps', note: 'The assistant as a living orb, a typewriter prompt and a big mic button. Voice-first, with “type instead”.', View: Orb },
  { id: '4', label: '4 · Editorial', ref: 'Chainforge', note: 'Near-black with grain, a dot-matrix sphere (a nod to Spark’s dot type), uppercase grotesk with an italic serif, and a wired note card.', View: Editorial },
  { id: '5', label: '5 · Command centre', ref: 'Nova dashboard', note: 'A glass dashboard: input with tools, suggested actions, recent chats and what needs you, plus an assistant card and quick actions.', View: Command },
  { id: '6', label: '6 · Calm + orb', ref: 'Calm (1) with a fluid orb after the ElevenLabs voices', note: 'The quiet layout of variant 1 with a soft, grainy orb whose light keeps shifting. It speeds up while you type.', View: CalmOrb },
] as const;

export function ChatDemo() {
  const [tab, setTab] = useState<(typeof VARIANTS)[number]['id']>('6');
  const v = VARIANTS.find((x) => x.id === tab)!;
  return (
    <div className="cdemo">
      <PageHeader
        title="Chat start screen"
        sub="Five looks for the first screen of the chat, after the references you shared. Type in any of them or click a suggestion: it starts a real chat in the portal."
      />
      <Tabs className="tabs--underline" value={tab} onChange={setTab} items={VARIANTS.map((x) => ({ value: x.id, label: x.label }))} />
      <p className="cdemo__note">
        <span className="faint">After {v.ref}.</span> {v.note}
      </p>
      <v.View key={v.id} />
    </div>
  );
}

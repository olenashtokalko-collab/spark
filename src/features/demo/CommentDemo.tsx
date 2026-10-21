// Prototype-only page (#/demo/comment): looks for the client's comment at the
// foot of a proposal section in the Spark editor ("Changes requested").
import { Check, CornerDownRight, MessageSquareText, Quote } from 'lucide-react';
import { Avatar, Button, PageHeader } from '../../components/ui/primitives';

const who = { name: 'Hessa Al Mansoori', hue: 200, org: 'client' as const };
const text = 'Starting on 1 July clashes with Eid. 8 July works better.';
const at = '18 Oct';

const VARIANTS = [
  { id: 'today', name: '1 · Today', note: 'A panel with a tinted head (“Changes requested”), the comment and who wrote it below.' },
  { id: 'quote', name: '2 · Quote', note: 'No head: a warm bar on the left and the client’s words as a quote, signed underneath. Reads as their voice.' },
  { id: 'bubble', name: '3 · Speech bubble', note: 'The comment as the client’s glass speech bubble, with their avatar beside it, like a message in the conversation.' },
  { id: 'note', name: '4 · Warm note', note: 'A soft warm-tinted card with the icon in front and no frame. Stands out from the white form without shouting.' },
  { id: 'line', name: '5 · One line', note: 'Compact: icon, name and comment on one line, with a quiet “Mark as done”. For sections with many comments.' },
  { id: 'actions', name: '6 · With actions', note: 'Today’s panel plus what to do with it: “Mark as done” and “Reply”, so the comment can be closed when handled.' },
] as const;

function Variant({ id }: { id: (typeof VARIANTS)[number]['id'] }) {
  const by = (
    <div className="cmd-by">
      <Avatar person={who} size={20} />
      <span>
        Hessa <span className="faint">· {at}</span>
      </span>
    </div>
  );
  if (id === 'quote')
    return (
      <div className="cmd cmd--quote">
        <Quote size={16} className="cmd-quote__mark" aria-hidden />
        <p>{text}</p>
        {by}
      </div>
    );
  if (id === 'bubble')
    return (
      <div className="cmd cmd--bubble">
        <Avatar person={who} size={28} />
        <div>
          <div className="cmd-bubble">{text}</div>
          <div className="cmd-bubble__meta">
            Hessa · {at} · <span className="cmd-tag">Changes requested</span>
          </div>
        </div>
      </div>
    );
  if (id === 'note')
    return (
      <div className="cmd cmd--note">
        <MessageSquareText size={18} className="cmd-icon" aria-hidden />
        <div>
          <p>{text}</p>
          {by}
        </div>
      </div>
    );
  if (id === 'line')
    return (
      <div className="cmd cmd--line">
        <MessageSquareText size={16} className="cmd-icon" aria-hidden />
        <Avatar person={who} size={20} />
        <p>
          <strong>Hessa:</strong> {text}
        </p>
        <button className="cmd-done">
          <Check size={14} /> Mark as done
        </button>
      </div>
    );
  return (
    <div className="pe-comment">
      <div className="pe-comment__head">
        <MessageSquareText size={17} className="pe-comment__icon" aria-hidden />
        <span>Changes requested</span>
      </div>
      <div className="pe-comment__body">
        <p>{text}</p>
        <div className="pe-comment__by">
          <Avatar person={who} size={20} />
          <span>
            Hessa <span className="faint">· {at}</span>
          </span>
        </div>
        {id === 'actions' && (
          <div className="cmd-actions">
            <Button size="sm" variant="secondary" icon={Check}>
              Mark as done
            </Button>
            <Button size="sm" variant="ghost" icon={CornerDownRight}>
              Reply
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentDemo() {
  return (
    <div className="cdemo cmddemo">
      <PageHeader title="Client comment in a section" sub="Six looks for the client’s comment at the foot of a proposal section in the Spark editor." />
      <div className="cmddemo__grid">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className="cmddemo__stage">
              <div className="cmddemo__field">Work starts · 01.07.2027</div>
              <Variant id={v.id} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

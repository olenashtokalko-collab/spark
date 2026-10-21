// Prototype-only page (#/demo/comment-mark): looks for the mark next to a section
// title on the manager's proposal page saying the client commented on it.
// Every mark scrolls to the comments at the foot of its section.
import { MessageSquare, MessageSquareText } from 'lucide-react';
import { Avatar, PageHeader } from '../../components/ui/primitives';
import { MiniBubble } from '../spark/ClientFeedback';

const who = { name: 'Layla Haddad', hue: 20, org: 'client' as const };
const text = 'Starting 9 November clashes with the school holidays. 16 November works better.';

const VARIANTS = [
  { id: 'icon', name: '1 · Icon and count', note: 'The same mark as in “On this page”, moved next to the title and a little larger. Quiet, consistent with the menu.' },
  { id: 'pill', name: '2 · Warm pill', note: 'Icon and “1 comment” in a soft warm pill, the colour of the comment panel below. Reads as a status.' },
  { id: 'bubble', name: '3 · Spark bubble', note: 'The brand speech bubble from the editor with the count beside it. The most noticeable, a touch of colour.' },
  { id: 'badge', name: '4 · Count on the icon', note: 'A comment icon with the number as a small dark badge on its corner, like an unread count.' },
  { id: 'avatar', name: '5 · Who commented', note: 'The client’s avatar with a small comment badge, then “Layla commented”. Says who, not just how many.' },
  { id: 'dot', name: '6 · Pulsing dot', note: 'A warm pulsing dot and “1 comment”, the same dot as “Changes requested” in the editor. For comments not answered yet.' },
] as const;
type Id = (typeof VARIANTS)[number]['id'];

function Mark({ id }: { id: Id }) {
  if (id === 'pill')
    return (
      <span className="cmk cmk--pill">
        <MessageSquareText size={14} /> 1 comment
      </span>
    );
  if (id === 'bubble')
    return (
      <span className="cmk cmk--bubble">
        <MiniBubble /> 1
      </span>
    );
  if (id === 'badge')
    return (
      <span className="cmk cmk--badge">
        <MessageSquare size={18} />
        <i>1</i>
      </span>
    );
  if (id === 'avatar')
    return (
      <span className="cmk cmk--avatar">
        <span className="cmk__av">
          <Avatar person={who} size={22} />
          <i>
            <MessageSquare size={9} strokeWidth={2.6} />
          </i>
        </span>
        Layla commented
      </span>
    );
  if (id === 'dot')
    return (
      <span className="cmk cmk--dot">
        <span className="pe-comment__dot" aria-hidden /> 1 comment
      </span>
    );
  return (
    <span className="cmk cmk--icon">
      <MessageSquare size={16} /> 1
    </span>
  );
}

export function CommentMarkDemo() {
  return (
    <div className="cdemo cmddemo">
      <PageHeader title="Comment mark on a section" sub="Six looks for the mark next to a section title that says the client commented there. Click it to jump to the comment." />
      <div className="cmddemo__grid">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className="cmddemo__stage">
              <div className="cmk-head">
                <h2 className="psec__title">Timeline</h2>
                <button className="cmk-btn" onClick={(e) => e.currentTarget.closest('.cmddemo__stage')?.querySelector('.spv-comments')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                  <Mark id={v.id} />
                </button>
              </div>
              <div className="cmk-gantt">
                <span style={{ width: '20%' }} />
                <span style={{ width: '30%', marginLeft: '20%' }} />
                <span style={{ width: '40%', marginLeft: '50%' }} />
              </div>
              <div className="spv-comments">
                <div className="spv-comment">
                  <div className="spv-comment__who">
                    <Avatar person={who} size={20} />
                    <strong>{who.name}</strong>
                    <span className="faint">· 9 Oct</span>
                  </div>
                  <p>{text}</p>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

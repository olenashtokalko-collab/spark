// What the client said when it asked for changes to a proposal: shown on the proposal card of the request page
// and pinned on top of the editor of the new version, with each section's comments next to that section.
import { useId, useState } from 'react';
import { ChevronRight, CornerDownRight } from 'lucide-react';
import { Avatar, Button, Textarea } from '../../components/ui/primitives';
import { aed } from '../../lib/format';
import { dana } from './data';
import type { SectionId } from './ProposalSections';
import type { ProposalFeedback } from './data';
import { ChatBuddy } from './ChatBuddy';

/** The client's proposal page names its sections differently from the editor. */
const SECTION_OF: Record<string, SectionId> = {
  Summary: 'overview',
  Objectives: 'objectives',
  'Scope & deliverables': 'scope',
  Timeline: 'timeline',
  Investment: 'investment',
  Terms: 'terms',
};
export const commentsFor = (fb: ProposalFeedback | undefined, id: SectionId) => fb?.comments.filter((c) => c.section && SECTION_OF[c.section] === id) ?? [];

const andList = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/** The client's note on the decision, and a line on which sections it commented on. */
export function ClientFeedback({ fb, hint }: { fb: ProposalFeedback; hint?: string }) {
  const sections = [...new Set(fb.comments.map((c) => c.section).filter(Boolean) as string[])];
  const n = fb.comments.length;
  return (
    <div className="prop-feedback">
      <div className="prop-feedback__head">
        <Avatar person={fb.by} size={22} />
        <span>
          <strong>{fb.by.name.split(' ')[0]}</strong> requested changes
        </span>
        <span className="faint">· {fb.at}</span>
      </div>
      {fb.note && <p className="prop-feedback__note">{fb.note}</p>}
      {n > 0 && (
        <p className="faint">
          {n} {n === 1 ? 'comment' : 'comments'} on {andList(sections)}
          {hint ? `. ${hint}` : ''}
        </p>
      )}
    </div>
  );
}

/** On top of the new version's editor: the bubble, who asked for changes, their note, and where their comments are. */
export function ChangesBanner({ fb, version }: { fb: ProposalFeedback; version: number }) {
  const first = fb.by.name.split(' ')[0];
  const sections = [...new Set(fb.comments.map((c) => c.section).filter(Boolean) as string[])];
  return (
    <div className="changes-banner">
      <ChatBuddy look="spectrum" size={52} />
      <div className="changes-banner__body">
        <div className="changes-banner__title">
          {first} asked for changes <span className="faint">· {fb.at}</span>
        </div>
        {fb.note && <p className="changes-banner__note">“{fb.note}”</p>}
        <p className="changes-banner__hint">
          {sections.length ? `${andList(sections)} ${sections.length === 1 ? 'has' : 'have'} ${first}’s comments: the sections with a comment icon. ` : ''}
          Update them, then send version {version}.
        </p>
      </div>
    </div>
  );
}

/** The comment mark: a tiny version of the ChatBuddy speech bubble on the banner (spectrum glass, no face). */
const BUBBLE = 'M32 6C46.4 6 58 14.6 58 27c0 8.4-5 14.6-12.4 17.8l3.9 11.6c.3 1-.8 1.7-1.6 1.1L37.6 48.4c-1.8.4-3.7.6-5.6.6C17.6 49 6 39.4 6 27S17.6 6 32 6z';
export function MiniBubble() {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 64 64" width="18" height="18" aria-hidden>
      <defs>
        <linearGradient id={`mb-${id}`} x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#ff7a94" />
          <stop offset="0.5" stopColor="#8a3cf0" />
          <stop offset="1" stopColor="#1e3bd6" />
        </linearGradient>
      </defs>
      <path d={BUBBLE} fill="#2a1f8f" transform="translate(1.6 2.6)" />
      <path d={BUBBLE} fill={`url(#mb-${id})`} />
      <ellipse cx="45" cy="14" rx="6" ry="2.6" transform="rotate(24 45 14)" fill="#fff" opacity="0.6" />
    </svg>
  );
}

/** The client's comments on one section, at the foot of that section in the editor, always open. */
export function SectionFeedback({ fb, id }: { fb?: ProposalFeedback; id: SectionId }) {
  const items = commentsFor(fb, id);
  if (!items.length) return null;
  return (
    <div className="pe-thread">
      {/* Each comment as a small panel: a tinted head saying changes were requested, the comment below. */}
      {items.map((c, i) => (
        <div key={i} className="pe-comment">
          <div className="pe-comment__head">
            <span className="pe-comment__dot" aria-hidden />
            <span>Changes requested</span>
          </div>
          {/* Below the head, as in a comment thread: avatar, name and when on one line,
              the comment underneath, indented to the name. */}
          <div className="pe-comment__item">
            <div className="pe-comment__who">
              <Avatar person={c.by} size={22} />
              <strong>{c.by.name}</strong>
              <span className="pe-comment__at">· {fb!.at}</span>
            </div>
            <p className="pe-comment__text">{c.text}</p>
            <Replies />
          </div>
        </div>
      ))}
    </div>
  );
}

/** The proposal on the request page (picked on #/demo/request-flow, A · Summary card):
 *  title, version, status, price, when it was sent and the client's note in one line.
 *  The whole card is the link. */
export function ProposalSummaryCard({ href, title, version, status, total, sent, fb }: { href: string; title: string; version: number; status: string; total: number; sent?: string; fb?: ProposalFeedback }) {
  return (
    <a className="psum" href={href}>
      <div className="psum__top">
        <div>
          <div className="psum__eyebrow">Proposal v{version}</div>
          <div className="psum__title">{title}</div>
        </div>
        <span className={`psum__pill${fb ? ' is-changes' : ''}`}>
          <i /> {status}
        </span>
      </div>
      <div className="psum__facts">
        <span>
          <b>{aed(total)}</b> excl. VAT
        </span>
        {sent && <span className="faint">Sent {sent}</span>}
      </div>
      {fb?.note && (
        <div className="psum__note">
          <Avatar person={fb.by} size={20} />
          <p>
            <strong>{fb.by.name.split(' ')[0]}:</strong> {fb.note}
          </p>
        </div>
      )}
      <ChevronRight size={20} className="psum__chev" aria-hidden />
    </a>
  );
}

/** The manager's replies under a client comment. Prototype only: kept in the page, not saved. */
function Replies() {
  const [replies, setReplies] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim()) return;
    setReplies((r) => [...r, text.trim()]);
    setText('');
    setOpen(false);
  };
  return (
    <div className="pe-replies">
      {replies.map((r, i) => (
        <div key={i} className="pe-reply">
          <div className="pe-comment__who">
            <Avatar person={dana} size={20} />
            <strong>{dana.name}</strong>
            <span className="pe-comment__at">· just now</span>
          </div>
          <p className="pe-comment__text">{r}</p>
        </div>
      ))}
      {open ? (
        <div className="pe-reply__box">
          <Textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
            }}
            placeholder="Reply to the client"
            aria-label="Reply to the client"
            autoFocus
          />
          <div className="pe-reply__actions">
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={send} disabled={!text.trim()}>
              Reply
            </Button>
          </div>
        </div>
      ) : (
        <button className="pe-reply__open" onClick={() => setOpen(true)}>
          <CornerDownRight size={14} /> Reply
        </button>
      )}
    </div>
  );
}

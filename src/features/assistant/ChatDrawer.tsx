// A new chat in a drawer from the right, after the client's reference (an assistant panel beside the page):
import { BeamEdge } from '../../components/ui/BeamEdge';
// Spark's mark, "How can I help?", four ways to start (never a blank chat: the research dossier of 8 Oct), and
// the box at the foot. Sending starts the chat and opens it on the Chats page; the expand button opens Chats
// without sending. Used from Home, so a chat starts without leaving it.
import { useEffect, useState, type ReactNode } from 'react';
import { useDrAi } from '../../components/ui/DrAi';
import { MascotClip } from '../demo/MascotDemo';
import { createPortal } from 'react-dom';
import { ArrowRight, Maximize2, X } from 'lucide-react';
import { useStore } from '../../state/store';
import { navigate } from '../../lib/router';
import { motionMs } from '../../lib/dockMotion';
import { Mascot } from '../../components/ui/Mascot';
import { SparkDisc } from '../../components/ui/BrandSpark';
import { Composer } from './Composer';
import { suggestedPrompts } from '../../data/assistant';
import type { Attachment } from '../../data/types';

export { Mascot };

/** What the drawer is about when opened from a page with a subject (an analysis): its name and the
 *  questions that fit it, shown in place of the general ways to start. */
export interface DrawerTopic {
  label: string;
  questions: { label: string; prompt: string }[];
  /** Added to what the client types, so the chat knows its subject (an issue from Home). */
  about?: string;
}

/** `initial` opens it with a question already written (e.g. Ask Spark to fix on Home), to edit and send.
 *  `topic` swaps the general suggestions for questions about what the page is about. */
export function ChatDrawer({ open, onClose, initial, topic, top }: { open: boolean; onClose: () => void; initial?: string; topic?: DrawerTopic; /** Above the greeting: what needs the client now (Dr.AI's dock, 6 Nov). */ top?: ReactNode }) {
  const { actions } = useStore();
  const drai = useDrAi();
  const [typing, setTyping] = useState(false);
  const [voice, setVoice] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Sending (or a way to start) begins the chat and opens it on the Chats page.
  const start = (text: string, attachments: Attachment[] = []) => {
    const about = topic?.about;
    const id = actions.ask(null, about && !text.includes(about) ? text + about : text, { attachments });
    onClose();
    navigate(`/assistant/${id}`);
  };

  // Stays a moment after closing so it can go away as it came (#/demo/dock-motion, 10 Nov), not vanish.
  const [shown, setShown] = useState(open);
  const [leaving, setLeaving] = useState(false);
  if (open && (!shown || leaving)) {
    setShown(true);
    setLeaving(false);
  }
  if (!open && shown && !leaving) {
    const ms = motionMs('drawer', 'out');
    if (ms) setLeaving(true);
    else setShown(false);
  }
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => {
      setShown(false);
      setLeaving(false);
    }, motionMs('drawer', 'out'));
    return () => clearTimeout(t);
  }, [leaving]);

  if (!shown) return null;
  return createPortal(
    <>
      <div className={'chat-drawer__scrim' + (leaving ? ' is-leaving' : '')} onClick={onClose} />
      <aside className={'chat-drawer' + (leaving ? ' is-leaving' : '')} role="dialog" aria-modal="true" aria-label="New chat with Spark">
        <header className="chat-drawer__head">
          {/* Dr.AI on: the title alone, "Ask Dr.AI"; he stands in the panel below, so no small head here (5 Nov). */}
          {!drai && <SparkDisc size={28} />}
          <h2>{drai ? 'Ask Dr.AI' : 'Ask Spark'}</h2>
          <button type="button" className="chat-drawer__btn" onClick={() => (onClose(), navigate('/assistant'))} aria-label="Open in Chats" data-tip="Open in Chats">
            <Maximize2 size={17} strokeWidth={1.8} />
          </button>
          <button type="button" className="chat-drawer__btn" onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={1.8} />
          </button>
        </header>
        <div className="chat-drawer__body">
          {/* One spark in the drawer, the one in its head (29 Oct); the ways to start as a list of plain lines
              (the Chats page's list without icons), an arrow on hover. Opened from something (an issue), the
              questions about it. */}
          {/* Dr.AI on: he greets you, standing by, leaning in while you type (as Clara in the reference). */}
          {drai && (
            <div className="chat-drawer__drai">
              <MascotClip state={typing || voice ? 'listening' : 'idle'} width={104} intro />
            </div>
          )}
          {top}
          <h3>{drai ? 'How can I help you?' : 'How can I help?'}</h3>
          {drai && (
            <p className="chat-drawer__lead">
              Ask anything about what
              <br />
              you’re looking at.
            </p>
          )}
          {/* The same four ways to start as on the Ask Dr.AI page (9 Nov, review): the name, what you get, an arrow on hover. */}
          <ul className="chats-start__list chat-drawer__list">
            {(topic ? topic.questions.map((q) => ({ ...q, hint: '' })) : suggestedPrompts.slice(0, 4)).map((p) => (
              <li key={p.label}>
                <button type="button" className="chats-start__row" onClick={() => start(p.prompt)}>
                  <span>{p.hint ? <><b>{p.label}</b> {p.hint.charAt(0).toLowerCase() + p.hint.slice(1)}</> : p.label}</span>
                  <ArrowRight size={15} strokeWidth={1.7} className="chats-start__go" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <footer className="chat-drawer__foot">
          <BeamEdge>
            <Composer
              autoFocus
              initial={initial}
              placeholder={drai ? 'Ask Dr.AI' : 'Ask Spark'}
              onTyping={setTyping}
              onVoice={setVoice}
              onSubmit={(text, attachments) => start(text, attachments)}
            />
          </BeamEdge>
          <p className="chat-drawer__note">{drai ? 'Dr.AI' : 'Spark AI'} can make mistakes. Check important info.</p>
        </footer>
      </aside>
    </>,
    document.body,
  );
}

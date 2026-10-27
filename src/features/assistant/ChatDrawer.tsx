// A new chat in a drawer from the right, after the client's reference (an assistant panel beside the page):
// the mascot, "How can I help?", four ways to start (never a blank chat: the research dossier of 8 Oct), and
// the box at the foot. Sending starts the chat and opens it on the Chats page; the expand button opens Chats
// without sending. Used from Home, so a chat starts without leaving it.
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Sparkles, X } from 'lucide-react';
import { useStore } from '../../state/store';
import { navigate } from '../../lib/router';
import { Mascot } from '../../components/ui/Mascot';
import { Composer } from './Composer';
import { CHIP_ICON } from './ChatStart';
import { suggestedPrompts } from '../../data/assistant';
import type { Attachment } from '../../data/types';

export { Mascot };

/** What the drawer is about when opened from a page with a subject (an analysis): its name and the
 *  questions that fit it, shown in place of the general ways to start. */
export interface DrawerTopic {
  label: string;
  questions: { label: string; prompt: string }[];
}

/** `initial` opens it with a question already written (e.g. Ask Spark to fix on Home), to edit and send.
 *  `topic` swaps the general suggestions for questions about what the page is about. */
export function ChatDrawer({ open, onClose, initial, topic }: { open: boolean; onClose: () => void; initial?: string; topic?: DrawerTopic }) {
  const { actions } = useStore();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Sending (or a way to start) begins the chat and opens it on the Chats page.
  const start = (text: string, attachments: Attachment[] = []) => {
    const id = actions.ask(null, text, { attachments });
    onClose();
    navigate(`/assistant/${id}`);
  };

  if (!open) return null;
  return createPortal(
    <>
      <div className="chat-drawer__scrim" onClick={onClose} />
      <aside className="chat-drawer" role="dialog" aria-modal="true" aria-label="New chat with Spark">
        <header className="chat-drawer__head">
          <Mascot size={28} />
          <h2>Ask Spark</h2>
          <button type="button" className="chat-drawer__btn" onClick={() => (onClose(), navigate('/assistant'))} aria-label="Open in Chats" data-tip="Open in Chats">
            <Maximize2 size={17} strokeWidth={1.8} />
          </button>
          <button type="button" className="chat-drawer__btn" onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={1.8} />
          </button>
        </header>
        <div className="chat-drawer__body">
          <Mascot size={72} className="chat-drawer__mascot" />
          <h3>How can I help?</h3>
          <p>{topic ? `Ask about the ${topic.label}. A good answer can become a request.` : 'Ask about your brand, audience or market. A good answer can become a request.'}</p>
          {/* Ways to start, the same pills as on the Chats page: one click and the chat begins. On a page
              with a subject, the questions about it. */}
          <div className="home__prompts chat-drawer__prompts">
            {(topic ? topic.questions : suggestedPrompts.slice(0, 4)).map((p) => {
              const I = CHIP_ICON[p.label] ?? Sparkles;
              return (
                <button key={p.label} type="button" className="home__prompt" onClick={() => start(p.prompt)} title={p.prompt}>
                  <I size={15} strokeWidth={1.7} />
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
        <footer className="chat-drawer__foot">
          <Composer
            autoFocus
            initial={initial}
            placeholder="Ask Spark"
            onSubmit={(text, attachments) => start(text, attachments)}
          />
          <p className="chat-drawer__note">Spark AI can make mistakes. Check important info.</p>
        </footer>
      </aside>
    </>,
    document.body,
  );
}

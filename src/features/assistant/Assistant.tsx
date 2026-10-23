import { useEffect, useRef } from 'react';
import { Eye } from 'lucide-react';
import { personById, useStore } from '../../state/store';
import { navigate } from '../../lib/router';
import { Button, EmptyState } from '../../components/ui/primitives';
import { Composer } from './Composer';
import { MessageView } from './MessageView';
import { Home } from './Home';
import type { Attachment } from '../../data/types';

export function Assistant({ convId }: { convId?: string }) {
  const { state, me, actions } = useStore();
  // Every chat in the brand is visible to the team; only its author can
  // continue it, so a teammate's chat opens read-only.
  const conv = convId ? state.conversations.find((c) => c.id === convId) : undefined;
  const author = conv ? personById(state, conv.createdBy) : undefined;
  const readOnly = !!conv && conv.createdBy !== me.id;
  const threadRef = useRef<HTMLDivElement>(null);
  const busy = !!conv?.messages.some((m) => m.state === 'thinking' || m.state === 'streaming');

  // Follow the answer as it streams, unless the reader scrolled up.
  const last = conv?.messages[conv.messages.length - 1];
  const lastLen = conv ? `${conv.messages.length}:${last?.text.length}:${last?.state}:${last?.steps?.length}` : '';
  const stick = useRef(true);
  useEffect(() => {
    const onScroll = () => {
      stick.current = window.innerHeight + window.scrollY >= document.body.scrollHeight - 160;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    // A chat opens at its latest message; the home page (no chat yet) opens at the top.
    stick.current = !!convId;
    window.scrollTo({ top: convId ? document.body.scrollHeight : 0 });
  }, [convId]);
  useEffect(() => {
    if (!stick.current || !conv) return;
    // Wait a frame so findings and sources are laid out before scrolling.
    requestAnimationFrame(() => window.scrollTo({ top: document.body.scrollHeight }));
  }, [lastLen]);

  const send = (text: string, attachments: Attachment[] = []) => {
    const id = actions.ask(conv?.id ?? null, text, { attachments });
    stick.current = true;
    if (!conv) navigate(`/assistant/${id}`);
  };

  const missing = convId && !conv;

  return (
    <div className="assistant">
      <section className="assistant__main">
        {missing ? (
          <EmptyState
            title="Chat not found"
            body="It may have been deleted. Start a new one or pick one from history."
            action={<Button onClick={() => navigate('/assistant')}>New chat</Button>}
          />
        ) : !conv ? (
          // The home page: numbers to act on, the box with its prompts, what you touched last.
          <Home onAsk={send} />
        ) : (
          <div className="thread" ref={threadRef}>
            {readOnly && (
              <div className="msg-system thread__owner">
                <Eye size={14} />
                <span>{author!.name}'s chat. You can read it and create a request from it.</span>
              </div>
            )}
            {conv.messages.map((m, i) => (
              <MessageView
                key={m.id}
                msg={m}
                convId={conv.id}
                onFollowUp={readOnly ? undefined : send}
                isLast={i === conv.messages.length - 1 || (i === conv.messages.length - 2 && conv.messages[i + 1].role === 'system')}
              />
            ))}
          </div>
        )}

        {conv && !readOnly && (
          <div className="assistant__composer">
            <Composer onSubmit={send} busy={busy} size="lg" />
          </div>
        )}
        {readOnly && (
          <div className="assistant__composer readonly-bar">
            <span className="muted">Only {author!.name.split(' ')[0]} can continue this chat.</span>
            <Button variant="primary" onClick={() => navigate('/assistant')}>
              Start your own chat
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useStore } from '../../state/store';
import { navigate } from '../../lib/router';
import { suggestedPrompts } from '../../data/assistant';
import { Button, EmptyState } from '../../components/ui/primitives';
import { DotSphere } from '../../components/ui/DotSphere';
import { Composer } from './Composer';
import { MessageView } from './MessageView';
import type { Attachment } from '../../data/types';

export function Assistant({ convId }: { convId?: string }) {
  const { state, me, actions } = useStore();
  // Chats are private for now: someone else's chat reads as not found.
  const conv = convId ? state.conversations.find((c) => c.id === convId && c.createdBy === me.id) : undefined;
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
    stick.current = true;
    window.scrollTo({ top: document.body.scrollHeight });
  }, [convId]);
  useEffect(() => {
    if (!stick.current) return;
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
            icon={Search}
            title="Conversation not found"
            body="It may have been deleted. Start a new one or pick one from history."
            action={<Button onClick={() => navigate('/assistant')}>New conversation</Button>}
          />
        ) : !conv ? (
          <div className="assistant__empty">
            <DotSphere size={150} />
            <h1 className="assistant__hello">Let’s get started</h1>
            <div className="prompt-grid">
              {suggestedPrompts.map((p) => (
                <button key={p.label} className="prompt-card" onClick={() => send(p.prompt)}>
                  <span className="prompt-card__label">{p.label}</span>
                  <span className="prompt-card__text">{p.prompt}</span>
                  <span className="prompt-card__hint">{p.hint}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="thread" ref={threadRef}>
            {conv.messages.map((m, i) => (
              <MessageView
                key={m.id}
                msg={m}
                convId={conv.id}
                onFollowUp={send}
                isLast={i === conv.messages.length - 1 || (i === conv.messages.length - 2 && conv.messages[i + 1].role === 'system')}
              />
            ))}
          </div>
        )}

        {!missing && (
          <div className="assistant__composer">
            <Composer onSubmit={send} busy={busy} autoFocus={!conv} size="lg" />
          </div>
        )}
      </section>
    </div>
  );
}

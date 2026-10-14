import { Fragment, useEffect, useRef, useState } from 'react';
import { Eye, Lightbulb, MessageSquareQuote, Palette, ShieldCheck, UsersRound, type LucideIcon } from 'lucide-react';
import { personById, useStore } from '../../state/store';
import { navigate } from '../../lib/router';
import { suggestedPrompts } from '../../data/assistant';
import { Button, EmptyState, cx } from '../../components/ui/primitives';
import { FluidOrb } from '../../components/ui/FluidOrb';
import { Composer } from './Composer';
import { MessageView } from './MessageView';
import type { Attachment } from '../../data/types';

/** Icons for the start suggestions; Brand A shows them before the label. */
const CHIP_ICON: Record<string, LucideIcon> = {
  'Shape an idea': Lightbulb,
  'Background check': ShieldCheck,
  'What people say': MessageSquareQuote,
  'Know the audience': UsersRound,
  'Explore a look': Palette,
};

export function Assistant({ convId }: { convId?: string }) {
  const { state, me, actions } = useStore();
  // Every chat in the brand is visible to the team; only its author can
  // continue it, so a teammate's chat opens read-only.
  const conv = convId ? state.conversations.find((c) => c.id === convId) : undefined;
  const author = conv ? personById(state, conv.createdBy) : undefined;
  const readOnly = !!conv && conv.createdBy !== me.id;
  const threadRef = useRef<HTMLDivElement>(null);
  const [typing, setTyping] = useState(false);
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
            title="Chat not found"
            body="It may have been deleted. Start a new one or pick one from history."
            action={<Button onClick={() => navigate('/assistant')}>New chat</Button>}
          />
        ) : !conv ? (
          <div className="assistant__empty">
            <FluidOrb size={170} active={typing} />
            {/* Brand A: one centred line on the Spark gradient (after Lovable's start screen). */}
            <h1 className="assistant__hello">
              <span className="brand-hide">
                Nice to see you, {me.name.split(' ')[0]}.
                <br />
                What’s new?
              </span>
              <span className="brand-only">
                Hey Roland
                <br />
                Ready to achieve great things?
              </span>
            </h1>
            {/* An empty chat starts with the input up here; it moves to the
                bottom once the thread has messages. */}
            <div className="assistant__start">
              <Composer onSubmit={send} autoFocus size="lg" onTyping={setTyping} />
              <div className={cx('start-chips', typing && 'is-dim')}>
                {/* Three on top, the rest centred below. */}
                {suggestedPrompts.map((p, i) => (
                  <Fragment key={p.label}>
                    {i === 3 && <span className="start-chips__break" aria-hidden />}
                    <button className="start-chip" onClick={() => send(p.prompt)} title={p.prompt}>
                      {(() => {
                        const I = CHIP_ICON[p.label];
                        return I ? <I size={16} strokeWidth={1.6} className="start-chip__icon brand-only" aria-hidden /> : null;
                      })()}
                      {p.label}
                    </button>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
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

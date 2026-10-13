// A cut from a chat: the question and answer a request was built on, shown as
// a small chat window with faded edges so it reads as part of a longer
// conversation. Used on the request page and after sending a request. The
// Spark AI sphere is static here: it's an illustration, not a live answer.
import { FluidOrb } from '../../components/ui/FluidOrb';
import { cx } from '../../components/ui/primitives';
import { RichText } from './MessageView';

export interface CutMessage {
  role: 'user' | 'assistant';
  text: string;
}

export function ChatCut({ messages, author, compact }: { messages: CutMessage[]; author: string; compact?: boolean }) {
  return (
    <div className={cx('chat-cut', compact && 'chat-cut--compact')}>
      <div className="chat-cut__body">
        <div className="chat-cut__more">Earlier messages</div>
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="msg-user">
              <div className="msg-user__bubble">{m.text}</div>
              <div className="msg-user__meta">{author}</div>
            </div>
          ) : (
            <div key={i} className="msg-ai">
              <div className="msg-ai__avatar">
                <FluidOrb size={30} still />
              </div>
              <div className="msg-ai__body">
                <div className="chat-cut__ai">Spark AI</div>
                <div className="msg-ai__text">
                  <RichText text={m.text} />
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

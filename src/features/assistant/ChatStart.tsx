// A new chat: nothing but the box, with four prompts under it (feedback of 23 Oct: "new chat opens a new
// chat, nothing else"). The figures and the company live on Home now.
import { Lightbulb, MessageSquareQuote, Palette, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { suggestedPrompts } from '../../data/assistant';
import { Composer } from './Composer';
import type { Attachment } from '../../data/types';

export const CHIP_ICON: Record<string, typeof Lightbulb> = {
  'Explore an idea': Lightbulb,
  'Run a background check': ShieldCheck,
  'Explore public feedback': MessageSquareQuote,
  'Understand your audience': UsersRound,
  'Explore a look': Palette,
};

export function ChatStart({ onAsk }: { onAsk: (text: string, attachments?: Attachment[]) => void }) {
  return (
    <div className="home home--calm chat-start">
      <h1 className="chat-start__title">What would you like to explore?</h1>
      <div className="home__ask">
        <Composer onSubmit={onAsk} autoFocus placeholder="Ask about your brand, audience or market…" />
      </div>
      <div className="home__prompts">
        {suggestedPrompts.slice(0, 4).map((p) => {
          const I = CHIP_ICON[p.label] ?? Sparkles;
          return (
            <button key={p.label} className="home__prompt" onClick={() => onAsk(p.prompt)} title={p.prompt}>
              <I size={15} strokeWidth={1.7} />
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

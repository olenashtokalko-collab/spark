import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRight, Lightbulb, MessageSquareQuote, ShieldCheck } from 'lucide-react';
import './stories.css';

// Dr.AI's suggestions (18 Nov): one pill, 32 px, a hairline rim on a see-through fill, 13 px words. The ways to start
// lead with their icon in its colour; the follow-ups under an answer with the arrow that darkens and steps on.
const meta: Meta = { title: 'Components/Suggestion pill' };
export default meta;
type Story = StoryObj;

export const WaysToStart: Story = {
  render: () => (
    <div className="chat-drawer sb-plain">
      <ul className="chats-start__list chat-drawer__list" style={{ justifyContent: 'flex-start' }}>
        {[
          ['Explore an idea', Lightbulb],
          ['Run a background check', ShieldCheck],
          ['Explore public feedback', MessageSquareQuote],
        ].map(([label, Icon]) => {
          const I = Icon as typeof Lightbulb;
          return (
            <li key={label as string}>
              <button type="button" className="chats-start__row">
                <I size={14} strokeWidth={1.7} className="chats-start__ico" aria-hidden />
                <span>{label as string}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  ),
};

export const FollowUps: Story = {
  render: () => (
    <div className="assistant" style={{ background: 'none' }}>
      <div className="followups" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {['What would a trademark check involve?', 'A signature product made only for Riyadh'].map((q) => (
          <button key={q} type="button" className="followup">
            <ArrowRight size={12} />
            {q}
          </button>
        ))}
      </div>
    </div>
  ),
};

// A new chat, as picked on #/demo/chat-start (look D, 29 Oct): the short greeting, its first words in Noor
import { BeamEdge } from '../../components/ui/BeamEdge';
// light and a second line in Ink; the box by the brand book (white on top, a clear frosted rim, the light
// under it and gathered round it); then four ways to start as a quiet list, the light fading before it.
import { ArrowRight, Lightbulb, MessageSquareQuote, Palette, ShieldCheck, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../state/store';
import { useRoute } from '../../lib/router';
import { MascotClip } from '../demo/MascotDemo';
import { useDrAi } from '../../components/ui/DrAi';
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

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export function ChatStart({ onAsk }: { onAsk: (text: string, attachments?: Attachment[]) => void }) {
  const { me } = useStore();
  const first = me.name.split(' ')[0];
  // Dr.AI on (#/demo/mascot), or ?mascot=1: his whole figure over the greeting.
  const drai = useDrAi();
  const flag = useRoute().query.get('mascot') === '1';
  const mascot = drai || flag;
  const [typing, setTyping] = useState(false);
  // Recording a voice message: Dr.AI listens, as while typing.
  const [voice, setVoice] = useState(false);
  return (
    <div className="chats-start" onInput={(e) => setTyping(!!(e.target as HTMLTextAreaElement).value)}>
      <div className="chats-start__col">
        <div className="chats-start__zone">
          <span className="chats-start__halo" aria-hidden />
          {/* Prototype (#/assistant?mascot=1, 5 Nov): Dr.AI over the greeting in a tile of the film's own ground, standing by, listening once you type. */}
          {mascot && <MascotClip state={typing || voice ? 'listening' : 'idle'} width={150} intro className="chats-start__mascot" />}
          <h1 className="chats-start__greet">
            <span className="chats-start__soft">{greeting()},</span> {first}.
            <br />
            What shall we bring to light?
          </h1>
          <div className="chats-start__glass">
            <span className="chats-start__light" aria-hidden />
            <div className="chats-start__frame">
              <BeamEdge>
                <Composer look="box" onSubmit={onAsk} onVoice={setVoice} onTyping={setTyping} autoFocus placeholder={drai ? 'Ask Dr.AI anything…' : 'Ask Spark anything…'} />
              </BeamEdge>
            </div>
          </div>
        </div>
        <ul className="chats-start__list">
          {/* No icons (29 Oct), as in the Ask Spark drawer: the words, an arrow on hover. */}
          {suggestedPrompts.slice(0, 4).map((p) => (
            <li key={p.label}>
              <button type="button" className="chats-start__row" onClick={() => onAsk(p.prompt)}>
                <span>
                  <b>{p.label}</b> {p.hint.charAt(0).toLowerCase() + p.hint.slice(1)}
                </span>
                <ArrowRight size={15} strokeWidth={1.7} className="chats-start__go" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Demo: looks for the chat conversation on a soft, grainy gradient background
 * (after the ElevenLabs "Omnichannel agents" card). Each tab is the same short
 * Spark conversation on a different background and bubble style. The composer
 * at the bottom is live: sending starts a real chat in the portal.
 */
import { useState } from 'react';
import { FileText } from 'lucide-react';
import { useStore } from '../../state/store';
import { navigate } from '../../lib/router';
import { PageHeader, Tabs, cx } from '../../components/ui/primitives';
import { FluidOrb } from '../../components/ui/FluidOrb';
import { Composer } from '../assistant/Composer';

type Bubble = 'solid' | 'glass' | 'dark' | 'plain';

const VARIANTS = [
  {
    id: 'mist',
    label: '1 · Mist',
    bubble: 'solid' as Bubble,
    note: 'Closest to the reference: slate-teal light fading into a navy band and a dark corner, heavy grain. Answers are white cards, the client’s messages are outlined pills.',
  },
  {
    id: 'midnight',
    label: '2 · Midnight',
    bubble: 'glass' as Bubble,
    note: 'The app’s navy with the orb’s colours glowing through (violet, blue, a little amber). Answers sit on frosted glass, so the page stays dark and calm.',
  },
  {
    id: 'dusk',
    label: '3 · Dusk',
    bubble: 'solid' as Bubble,
    note: 'Warmer: navy at the top into plum and a soft peach glow below. Same white answers and outlined pills as the reference.',
  },
  {
    id: 'haze',
    label: '4 · Navy haze',
    bubble: 'solid' as Bubble,
    note: 'The reference toned down: mostly the app’s navy, with the slate-teal haze only at the top. Keeps the grain and white answers, reads closest to the current portal.',
  },
  {
    id: 'ink',
    label: '5 · Ink',
    bubble: 'dark' as Bubble,
    note: 'Dark theme first: the app’s near-black with one slate-teal haze drifting behind the thread. Answers are dark cards with a hairline edge, so nothing glares.',
  },
  {
    id: 'aurora',
    label: '6 · Aurora',
    bubble: 'glass' as Bubble,
    note: 'Black with a thin, slow band of teal and violet light across the middle, like an aurora. Frosted answers pick up the colour behind them.',
  },
  {
    id: 'ember',
    label: '7 · Ember',
    bubble: 'dark' as Bubble,
    note: 'Deep navy-black with a warm amber and maroon glow low in the corner, taken from the orb. Warm dark cards, cream text.',
  },
  {
    id: 'spotlight',
    label: '8 · Spotlight',
    bubble: 'plain' as Bubble,
    note: 'A soft blue light from above the thread and a dark vignette at the edges. Answers are plain text with the orb beside them, no card: the quietest option for long answers.',
  },
] as const;

export function ThreadDemo() {
  const [tab, setTab] = useState<(typeof VARIANTS)[number]['id']>('ink');
  const v = VARIANTS.find((x) => x.id === tab)!;
  return (
    <div className="cdemo">
      <PageHeader
        title="Chat on a gradient"
        sub="The conversation screen on a grainy gradient background, after the reference you shared. 1–4 follow the reference; 5–8 are built for the dark theme. The light drifts slowly. Type below to start a real chat."
      />
      <Tabs className="tabs--underline" value={tab} onChange={setTab} items={VARIANTS.map((x) => ({ value: x.id, label: x.label }))} />
      <p className="cdemo__note">{v.note}</p>
      <Thread key={v.id} look={v.id} bubble={v.bubble} />
    </div>
  );
}

function Thread({ look, bubble }: { look: string; bubble: Bubble }) {
  const { actions } = useStore();
  const send = (q: string) => {
    if (!q.trim()) return;
    const id = actions.ask(null, q.trim());
    navigate(`/assistant/${id}`);
  };
  return (
    <div className={cx('tv', `tv--${look}`, `tv--${bubble}`)}>
      <div className="tv__bg" aria-hidden>
        <span className="tv__blob tv__blob--1" />
        <span className="tv__blob tv__blob--2" />
        <span className="tv__blob tv__blob--3" />
        <span className="tv__blob tv__blob--4" />
        <span className="tv__blob tv__blob--5" />
        <span className="tv__grain" />
      </div>

      <div className="tv__thread">
        <p className="tv__me">What are people saying about our brand this week?</p>
        <div className="tv__ai">
          {bubble === 'plain' && <FluidOrb size={28} className="tv__avatar" />}
          <p>
            Mostly positive. Mentions are up 18% since the Riyadh opening, and people love the new cups. The main complaint is the queue at
            the Olaya store on weekends.
          </p>
          <span className="tv__src">
            <FileText size={13} /> W40 social digest · 3 sources
          </span>
        </div>
        <p className="tv__me">Can Spark plan a campaign around the cups?</p>
        <div className="tv__ai">
          {bubble === 'plain' && <FluidOrb size={28} className="tv__avatar" />}
          <p>Sure. I’ve drafted a request with this chat attached, so the team has the context.</p>
        </div>
        <div className="tv__status">
          <FluidOrb size={26} />
          Proposal requested
        </div>
      </div>

      <div className="tv__composer">
        <Composer onSubmit={send} size="lg" />
      </div>
    </div>
  );
}

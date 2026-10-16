// Prototype-only page (#/demo/chat-cloud): the chat page after the brand book's closing slide: one big organic
// ring of spectral light (Cobalt on the left, violet and pink over the top, Ember on the right and underneath,
// a haze of blue at the upper right) around a white calm centre where the content sits, fine grain over all,
// and small mono labels in the four corners. Each look is shown twice: the start page and a conversation.
//   Now  the current page: a white bowl with Cobalt at the sides and Ember at the foot
//   A    the ring as in the reference, still
//   B    the same ring, drifting slowly
//   C    the ring pushed to the edges with a wide calm centre: made for reading a long conversation
import { useId } from 'react';
import { ArrowUp, Paperclip, Plus } from 'lucide-react';
import { PageHeader } from '../../components/ui/primitives';
import { FluidOrb } from '../../components/ui/FluidOrb';

type Look = 'now' | 'a' | 'b' | 'c';
const LOOKS: { id: Look; name: string; note: string }[] = [
  { id: 'now', name: 'Now · the white bowl', note: 'The colour sits in horizontal bands at the sides and the foot, and the middle is a white bowl. The composer lies on the white, so the colour never reaches the chat.' },
  { id: 'a', name: 'A · The ring under the composer', note: 'The reference’s ring, larger and denser, with the white hole above (the greeting sits in it) and the lower rim of the ring running right behind the composer. The glass composer is on the colour: the blob lands on the chat. In a conversation the hole opens for the messages and the composer sits on the ring’s foot.' },
  { id: 'b', name: 'B · One blob behind the chat', note: 'No ring: a single dense blob of Cobalt, violet, pink and Ember directly behind the composer (and, in a conversation, behind the answer and the composer), on a calm sand page. The strongest link between the colour and the chat.' },
  { id: 'c', name: 'C · Full wash with a white hole', note: 'The colour fills the frame, as in the reference, and only a soft white hole is left at the top for the greeting. The composer floats on the colour. The most saturated and the most like the slide; in a conversation the hole grows.' },
];

type Blob = { cx: number; cy: number; rx: number; ry: number; fill: string; o?: number; d: number };
type Scene = { blobs: Blob[]; hole?: { cx: number; cy: number; rx: number; ry: number }; blur: number };

const BLUE = '#2a3cf0';
const VIOLET = '#8a3cf0';
const PINK = '#ff2e93';
const MAGENTA = '#e63cc8';
const ORANGE = '#ff6a1a';
const PEACH = '#ffa070';
const HAZE = '#b8d8f5';

// A frame is 1000 x 620. The start page's composer lies at about y 300 to 360, the conversation's at 520 to 580.
function scene(look: Look, mode: 'start' | 'chat'): Scene {
  const start = mode === 'start';
  if (look === 'a')
    return {
      blur: 42,
      hole: start ? { cx: 500, cy: 190, rx: 250, ry: 120 } : { cx: 500, cy: 235, rx: 330, ry: 190 },
      blobs: [
        { cx: 110, cy: 320, rx: 200, ry: 290, fill: BLUE, d: 0 },
        { cx: 320, cy: 40, rx: 280, ry: 130, fill: VIOLET, d: 1 },
        { cx: 700, cy: 40, rx: 250, ry: 110, fill: PINK, d: 2 },
        { cx: 890, cy: 360, rx: 200, ry: 250, fill: ORANGE, d: 3 },
        { cx: 190, cy: 560, rx: 230, ry: 130, fill: MAGENTA, d: 4 },
        { cx: 520, cy: 600, rx: 330, ry: 130, fill: PINK, d: 5 },
        { cx: 790, cy: 590, rx: 230, ry: 110, fill: PEACH, d: 6 },
        { cx: 880, cy: 90, rx: 120, ry: 100, fill: HAZE, o: 0.9, d: 7 },
        // The ring's lower rim, right behind the composer.
        { cx: 300, cy: start ? 400 : 560, rx: 190, ry: 90, fill: VIOLET, o: 0.9, d: 8 },
        { cx: 700, cy: start ? 400 : 560, rx: 190, ry: 90, fill: ORANGE, o: 0.85, d: 9 },
      ],
    };
  if (look === 'b')
    return {
      blur: 46,
      blobs: start
        ? [
            { cx: 300, cy: 345, rx: 210, ry: 130, fill: BLUE, d: 0 },
            { cx: 450, cy: 300, rx: 200, ry: 110, fill: VIOLET, d: 1 },
            { cx: 580, cy: 360, rx: 200, ry: 110, fill: PINK, d: 2 },
            { cx: 700, cy: 350, rx: 190, ry: 130, fill: ORANGE, d: 3 },
            { cx: 520, cy: 440, rx: 260, ry: 80, fill: PEACH, o: 0.9, d: 4 },
            { cx: 250, cy: 420, rx: 140, ry: 70, fill: MAGENTA, o: 0.8, d: 5 },
            { cx: 640, cy: 250, rx: 120, ry: 60, fill: HAZE, o: 0.7, d: 6 },
          ]
        : [
            { cx: 280, cy: 520, rx: 230, ry: 150, fill: BLUE, d: 0 },
            { cx: 450, cy: 450, rx: 220, ry: 120, fill: VIOLET, d: 1 },
            { cx: 600, cy: 520, rx: 220, ry: 130, fill: PINK, d: 2 },
            { cx: 740, cy: 500, rx: 210, ry: 150, fill: ORANGE, d: 3 },
            { cx: 500, cy: 600, rx: 320, ry: 90, fill: PEACH, o: 0.9, d: 4 },
            { cx: 660, cy: 380, rx: 140, ry: 70, fill: HAZE, o: 0.7, d: 5 },
          ],
    };
  if (look === 'c')
    return {
      blur: 40,
      hole: start ? { cx: 500, cy: 130, rx: 300, ry: 150 } : { cx: 500, cy: 200, rx: 360, ry: 220 },
      blobs: [
        { cx: 120, cy: 300, rx: 260, ry: 320, fill: BLUE, d: 0 },
        { cx: 340, cy: 120, rx: 320, ry: 180, fill: VIOLET, d: 1 },
        { cx: 720, cy: 100, rx: 300, ry: 170, fill: PINK, d: 2 },
        { cx: 900, cy: 330, rx: 260, ry: 320, fill: ORANGE, d: 3 },
        { cx: 240, cy: 540, rx: 300, ry: 170, fill: MAGENTA, d: 4 },
        { cx: 540, cy: 480, rx: 380, ry: 190, fill: PINK, o: 0.95, d: 5 },
        { cx: 800, cy: 560, rx: 300, ry: 150, fill: PEACH, d: 6 },
        { cx: 880, cy: 60, rx: 150, ry: 110, fill: HAZE, o: 0.9, d: 7 },
        { cx: 520, cy: 330, rx: 260, ry: 120, fill: VIOLET, o: 0.8, d: 8 },
      ],
    };
  return { blur: 0, blobs: [] };
}

function Cloud({ look, mode }: { look: Look; mode: 'start' | 'chat' }) {
  const id = useId().replace(/:/g, '');
  if (look === 'now') return <div className="cc__now" />;
  const sc = scene(look, mode);
  return (
    <svg className="cc__svg" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden>
      <defs>
        <filter id={`b-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={sc.blur} />
        </filter>
        <filter id={`c-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="40" />
        </filter>
        <filter id={`g-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0" />
        </filter>
      </defs>
      <rect width="1000" height="620" fill="#f8f6f2" />
      <g filter={`url(#b-${id})`}>
        {sc.blobs.map((b) => (
          <g key={b.d} className="cc__drift" style={{ ['--d' as string]: b.d }}>
            <ellipse cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill={b.fill} opacity={b.o ?? 1} />
          </g>
        ))}
      </g>
      {sc.hole && <ellipse cx={sc.hole.cx} cy={sc.hole.cy} rx={sc.hole.rx} ry={sc.hole.ry} fill="#fcfbf8" opacity="0.98" filter={`url(#c-${id})`} />}
      <rect width="1000" height="620" filter={`url(#g-${id})`} opacity="0.14" style={{ mixBlendMode: 'multiply' }} />
    </svg>
  );
}

function Composer() {
  return (
    <div className="cc__composer">
      <span className="cc__plus">
        <Plus size={16} />
      </span>
      <span className="cc__ph">Ask Spark anything…</span>
      <Paperclip size={16} className="cc__clip" />
      <span className="cc__send">
        <ArrowUp size={16} />
      </span>
    </div>
  );
}

function Stage({ look, mode }: { look: Look; mode: 'start' | 'chat' }) {
  const labels = look !== 'now';
  return (
    <div className="cc__frame">
      <div className="cc__stage">
        <Cloud look={look} mode={mode} />
        {labels && (
          <>
            <span className="cc__lab cc__lab--tl">Spark Studios</span>
            <span className="cc__lab cc__lab--tr">Brand Co. · My team</span>
            <span className="cc__lab cc__lab--bl">Ask anything</span>
            <span className="cc__lab cc__lab--br">{mode === 'start' ? '01/02' : '02/02'}</span>
          </>
        )}
        {mode === 'start' ? (
          <div className="cc__start">
            <FluidOrb size={72} />
            <h2 className="cc__hello">Hello, Layla</h2>
            <Composer />
          </div>
        ) : (
          <div className="cc__chat">
            <div className="cc__user">Which of the three routes fits the budget?</div>
            <div className="cc__ai">
              <FluidOrb size={26} />
              <p>Two of the three routes fit the AED 54,000 budget. The second is the strongest: it keeps the Arabic line large and lands on 18 Oct. I’d start there and keep the first as a fallback.</p>
            </div>
            <Composer />
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatCloudDemo() {
  return (
    <div className="cdemo ccdemo">
      <PageHeader
        title="The chat page after the closing slide"
        sub="The colour has to land on the chat itself, not stay at the edges: three looks where the composer lies on the colour, each as the start page and as a conversation. Nothing here is applied to the app."
      />
      <div className="ccdemo__grid">
        {LOOKS.map((l) => (
          <section key={l.id} className="gdemo__card cc">
            <header>
              <h3>{l.name}</h3>
              <p>{l.note}</p>
            </header>
            <div className="cc__row">
              <Stage look={l.id} mode="start" />
              <Stage look={l.id} mode="chat" />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

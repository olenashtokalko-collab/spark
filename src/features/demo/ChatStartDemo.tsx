// Prototype-only page (#/demo/chat-start?v=…): a new start for Chats. The layout after the client's first
// two references: one centred column (the mark, a greeting, the box, ways to start) and Chats at the top
// right, which slides the history in from the right. The look after the third: a pale field of light with a
// faint grid, a glass bubble at the centre, chips, and a white box with the light around its edge — in
// Spark's colours (Noor: Cobalt, violet, pink, Ember on Sand).
import { useState, type ReactNode } from 'react';
import { ArrowUp, History, Mic, Paperclip, Plus, Send as SendIcon } from 'lucide-react';
import { useStore } from '../../state/store';
import { useRoute, navigate } from '../../lib/router';
import { Button, PageHeader, cx } from '../../components/ui/primitives';
import { suggestedPrompts } from '../../data/assistant';
import { CHIP_ICON } from '../assistant/ChatStart';
import { ChatHistory } from '../assistant/ChatHistory';
import { SparkStar } from '../../components/ui/SparkStar';
import { Mascot } from '../../components/ui/Mascot';

/** Backgrounds after the brand book: Sand with grain, and the light as its covers set it. */
const BGS = [
  { v: 'now', label: 'Before', note: 'Pastel light and a faint grid, after the reference.' },
  { v: 'sand', label: 'A · Sand', note: 'Saadiyat Sand with the grain, nothing else: the default ground (35% of a layout, p. 31).' },
  { v: 'chapter', label: 'B · Chapter', note: 'As the chapter covers (pp. 3, 14, 24): Sand on the left, the light gathered on the right, deep-blurred, grained.' },
  { v: 'halo', label: 'C · Halo', note: 'As the front and back covers (pp. 1, 42): a ring of Noor round a light heart, the conversation in the heart.' },
  { v: 'cluster', label: 'D · One cluster', note: '“One cluster per frame” (p. 34): Sand, and one soft glow low in a corner.' },
  { v: 'foot', label: 'E · Light at the foot', note: 'Sand above, the light rising from the bottom edge behind the box, as the slides’ lower glow.' },
  { v: 'ink', label: 'F · Ink', note: 'Sand on Ink, for night and premium (p. 30): Ink ground, the light low, white words.' },
  { v: 'around', label: 'G · Round the chat', note: '“One cluster per frame” (p. 34), gathered round the box and moving with it: Cobalt at its left, violet and pink under it, Ember at its right, Sand everywhere else.' },
] as const;

/** How a chip answers the pointer (feedback 29 Oct: the grey wash reads as disabled). */
const HOVERS = [
  { v: 'grey', label: 'Before', note: 'Now: a grey wash and a darker stroke. Reads as dimmed.' },
  { v: 'white', label: 'A · White', note: 'The chip turns white on hover, as the box: “white on top” (p. 36). The stroke goes, a short soft shadow lifts it.' },
  { v: 'light', label: 'B · Light under', note: 'Clear as at rest; the Noor light wakes under the chip (Cobalt to Ember), as under the box. AI in the brand’s own way.' },
  { v: 'frost', label: 'C · Frosted', note: 'The chip frosts: white glass with a bright rim and a faint Noor tint at its foot.' },
  { v: 'clear', label: 'E · White, see-through', note: 'White at about half strength with a little frost, so the light behind still shows through; the stroke turns to a bright white rim.' },
  { v: 'ink', label: 'D · Ink edge', note: 'No fill; the stroke goes Ink and the icon Ember. Quiet and sharp.' },
] as const;

/** How a chip sits at rest (29 Oct): a stroke, or the ground's own colour with no stroke. */
const CHIPS = [
  { v: 'stroke', label: 'Before', note: 'A hairline stroke, no fill.' },
  { v: 'sand', label: 'A · Sand glass', note: 'Sand at about half strength with a little frost, no stroke: the chip is a paler patch of the ground, the light behind dimmed through it.' },
  { v: 'sand-clear', label: 'B · Sand, clearer', note: 'The same, lighter: Sand at a third, more of the light through, no stroke.' },
  { v: 'tint', label: 'C · Shade', note: 'No stroke; a faint Ink shade (5%), so the chip is a touch darker than whatever is under it.' },
] as const;

/** The light gathered round the box (background G): sits behind the column, centred on the box at its foot. */
const Halo = () => <span className="cs2-halo" aria-hidden />;

const LOOKS = [
  { v: 'hero', label: 'A · Headline', note: 'As the third reference, without the bubble: a large greeting with the quieter words in light, chips over the box in its frame of light.' },
  { v: 'column', label: 'B · Quiet column', note: 'As the first reference: the greeting and a line under it, chips, the pill box. The light only in the background.' },
  { v: 'cards', label: 'C · Short greeting', note: 'A smaller greeting, chips, the box in its frame of light.' },
  { v: 'list', label: 'D · Box, then a list', note: 'The greeting, the box in its light, and the ways to start under it as a quiet list (icon, what it is, a line on it), after the reference. The light stays round the box and fades before the list, so no colour falls on its words.' },
] as const;
type Look = (typeof LOOKS)[number]['v'];

/** The glass bubble: a clear sphere holding Noor light, a bright highlight, a rim, a soft reflection under it. */
export function GlassOrb({ size = 200, reflect = true }: { size?: number; reflect?: boolean }) {
  return (
    <span className={cx('gorb', reflect && 'gorb--reflect')} style={{ ['--orb' as string]: `${size}px` }} aria-hidden>
      <span className="gorb__ball">
        <span className="gorb__light" />
        <span className="gorb__glint" />
      </span>
    </span>
  );
}

function Box({ glow = true }: { glow?: boolean }) {
  return (
    // By the brand book (p. 36, “every control follows one recipe”): a white box (white on top) in a clear
    // frosted rim (the glass body), the Noor light under it, Cobalt to Ember, blurred and spilling out below.
    // Attach outlined, Send the Ink primary.
    <div className={cx('cs2-glass', glow && 'cs2-glass--lit')}>
      {glow && <span className="cs2-glass__light" aria-hidden />}
      <div className="cs2-frame">
        <div className="cs2-box">
          <textarea rows={2} placeholder="Ask Spark anything…" aria-label="Ask Spark" />
          <div className="cs2-box__bar">
            <button type="button" className="cs2-pill">
              <Paperclip size={14} /> Attach
            </button>
            <span className="cs2-box__spacer" />
            <button type="button" className="cs2-send">
              <SendIcon size={14} strokeWidth={2} /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Starts({ as }: { as: 'chips' | 'cards' }) {
  // Chips run the width of the box (feedback 29 Oct), so three and the more; cards take four.
  const list = suggestedPrompts.slice(0, as === 'chips' ? 3 : 4);
  return (
    <div className={cx('cs2-starts', `cs2-starts--${as}`)}>
      {list.map((p) => {
        const I = CHIP_ICON[p.label] ?? SparkStar;
        return (
          <button key={p.label} type="button" className={as === 'chips' ? 'cs2-chip' : 'cs2-card'} title={p.prompt}>
            <span className="cs2-start__icon">
              <I size={as === 'chips' ? 14 : 15} strokeWidth={1.7} />
            </span>
            {p.label}
          </button>
        );
      })}
      {as === 'chips' && (
        <button type="button" className="cs2-chip cs2-chip--more" aria-label="More">
          ···
        </button>
      )}
    </div>
  );
}

// After the reference (29 Oct): a column with no fill behind a hairline, Chat history and New (a secondary
// button) at the top, level with Chats, the list under it; Chats itself closes it. The list is Chats' own
// (grouped by when, a teammate's chats with their name), so it reads as it does now.
function StartList() {
  return (
    <ul className="cs2-list">
      {suggestedPrompts.slice(0, 4).map((p) => {
        const I = CHIP_ICON[p.label] ?? SparkStar;
        return (
          <li key={p.label}>
            <button type="button" className="cs2-list__row" title={p.prompt}>
              <I size={16} strokeWidth={1.7} />
              <span>
                <b>{p.label}</b> {p.hint.charAt(0).toLowerCase() + p.hint.slice(1)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function History_({ open, empty }: { open: boolean; empty: boolean }) {
  return (
    <aside className={cx('cs2-hist', open && 'is-open')} aria-hidden={!open} aria-label="Chat history">
      <header className="cs2-hist__head">
        <h2>Chat history</h2>
        <Button icon={Plus}>
          New
        </Button>
      </header>
      {empty ? (
        <div className="cs2-hist__empty">
          <Mascot size={52} />
          <b>How can I help today?</b>
          <span>No chat history yet. Start a new chat.</span>
        </div>
      ) : (
        <ChatHistory />
      )}
    </aside>
  );
}

export function ChatStartDemo() {
  const { query } = useRoute();
  const { me } = useStore();
  const look: Look = (LOOKS.find((x) => x.v === query.get('v'))?.v ?? 'hero') as Look;
  const [open, setOpen] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [bg, setBg] = useState<(typeof BGS)[number]['v']>('around');
  const [chip, setChip] = useState<(typeof CHIPS)[number]['v']>('sand');
  const [hover, setHover] = useState<(typeof HOVERS)[number]['v']>('clear');
  const first = me.name.split(' ')[0];
  const go = (v: Look) => navigate(`/demo/chat-start?v=${v}`, { replace: true });

  // No bubble (feedback 29 Oct); the ways to start sit above the box as chips, as in the reference.
  let body: ReactNode;
  if (look === 'column')
    body = (
      <div className="cs2-col">
        <Halo />
        <h1 className="cs2-greet cs2-greet--sm">Good morning, {first}.</h1>
        <p className="cs2-sub">Ask about your brand, your requests or your files.</p>
        <Starts as="chips" />
        <div className="cs2-pillbox">
          <Paperclip size={17} />
          <input placeholder="Ask Spark" aria-label="Ask Spark" />
          <Mic size={17} />
          <button type="button" className="cs2-send cs2-send--round" aria-label="Send">
            <ArrowUp size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    );
  else if (look === 'list')
    body = (
      <div className="cs2-col cs2-col--list">
        <div className="cs2-boxzone">
          <Halo />
          <h1 className="cs2-greet">
            <span className="cs2-greet__soft">Good morning,</span> {first}.
            <br />
            What shall we bring to light?
          </h1>
          <Box />
        </div>
        <StartList />
      </div>
    );
  else if (look === 'cards')
    body = (
      <div className="cs2-col">
        <Halo />
        <h1 className="cs2-greet">
          <span className="cs2-greet__soft">Good morning,</span> {first}.
        </h1>
        <Starts as="chips" />
        <Box />
      </div>
    );
  else
    body = (
      <div className="cs2-col cs2-col--hero">
        <Halo />
        <h1 className="cs2-greet cs2-greet--lg">
          <span className="cs2-greet__soft">Good morning, {first}.</span>
          <br />
          <span className="cs2-greet__soft">What shall we</span> bring to light?
        </h1>
        <Starts as="chips" />
        <Box />
      </div>
    );

  return (
    <div className="cdemo">
      <PageHeader
        title="Chats · a new start"
        sub="The layout after the first two references (one column; Chats opens the history from the right), the look after the third, in Spark’s colours. Prototype only."
      />
      <div className="fdm-switch">
        {LOOKS.map((x) => (
          <button key={x.v} className={cx(look === x.v && 'is-on')} onClick={() => go(x.v)}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{LOOKS.find((x) => x.v === look)!.note}</p>
      <div className="fdm-switch hd-looks">
        <span className="faint">History</span>
        <button className={cx(!empty && 'is-on')} onClick={() => setEmpty(false)}>
          With chats
        </button>
        <button className={cx(empty && 'is-on')} onClick={() => setEmpty(true)}>
          Empty
        </button>
      </div>

      <div className="fdm-switch hd-looks">
        <span className="faint">Background</span>
        {BGS.map((x) => (
          <button key={x.v} className={cx(bg === x.v && 'is-on')} onClick={() => setBg(x.v)}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{BGS.find((x) => x.v === bg)!.note}</p>

      <div className="fdm-switch hd-looks">
        <span className="faint">Chips</span>
        {CHIPS.map((x) => (
          <button key={x.v} className={cx(chip === x.v && 'is-on')} onClick={() => setChip(x.v)}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{CHIPS.find((x) => x.v === chip)!.note}</p>

      <div className="fdm-switch hd-looks">
        <span className="faint">Chip hover</span>
        {HOVERS.map((x) => (
          <button key={x.v} className={cx(hover === x.v && 'is-on')} onClick={() => setHover(x.v)}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{HOVERS.find((x) => x.v === hover)!.note} Point at a chip to see it.</p>

      <div className={cx('cs2', open && 'cs2--open')} data-bg={bg} data-hover={hover} data-chip={chip}>
        <span className="cs2-bg" aria-hidden />
        <span className="cs2-grain" aria-hidden />
        <header className="cs2-top">
          <Button variant="secondary" icon={History} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            Chats
          </Button>
        </header>
        <div className="cs2-main">{body}</div>
        <History_ open={open} empty={empty} />
      </div>
    </div>
  );
}

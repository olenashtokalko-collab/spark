// Prototype-only page (#/demo/buttons): looks for the primary, secondary and
// "go to chat" buttons after the sage "Home" pill reference — a soft, muted
// pill with a lit top edge, sitting in a recessed dark track. Each variant
// shows the real labels it would carry.
import { useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, Check, Download, MessageSquare, Plus, Share2, Upload } from 'lucide-react';
import { Button, PageHeader, Tabs } from '../../components/ui/primitives';
import { FluidOrb } from '../../components/ui/FluidOrb';

/** The reference's six-dot mark, a nod to Spark's dot type. */
function Dots() {
  return (
    <svg width="18" height="16" viewBox="0 0 18 16" fill="currentColor" aria-hidden>
      <circle cx="9" cy="2" r="1.8" />
      <circle cx="5" cy="7.5" r="1.8" />
      <circle cx="13" cy="7.5" r="1.8" />
      <circle cx="3" cy="13.5" r="1.8" />
      <circle cx="9" cy="13.5" r="1.8" />
      <circle cx="15" cy="13.5" r="1.8" />
    </svg>
  );
}

interface Variant {
  id: string;
  name: string;
  note: string;
  /** Pill colour; the lit edge and pressed state derive from it. */
  hue: string;
  ink?: string;
  track?: boolean;
  spread?: boolean;
}

const VARIANTS: Variant[] = [
  { id: 'sage-track', name: '1 · Sage in a track', note: 'The reference as is: muted sage pill, lit top edge, set into a dark recessed track. Icon left, label right.', hue: '#6b7d5c', track: true, spread: true },
  { id: 'blue-track', name: '2 · Spark blue in a track', note: 'Same build in the product’s blue, desaturated so it sits with the muted folders.', hue: '#4a69b0', track: true },
  { id: 'blue', name: '3 · Spark blue, no track', note: 'Lit edge and soft depth only. The lightest change from today’s button.', hue: '#4a69b0' },
  { id: 'sage', name: '4 · Sage, no track', note: 'The reference colour without the track: calmer, reads as “go” without shouting.', hue: '#6b7d5c' },
  { id: 'cream', name: '5 · Cream', note: 'The cream of the composer’s send button and the page titles, with dark ink. Warmest of the set.', hue: '#e9dfcf', ink: '#1b1e29', track: true },
  { id: 'steel', name: '6 · Steel', note: 'Navy-grey, close to the surfaces. Primary by shape and light rather than colour.', hue: '#3a4560', track: true },
];

function Pill({ v, children, size, disabled }: { v: Variant; children: ReactNode; size?: 'sm' | 'lg'; disabled?: boolean }) {
  const style = { '--hue': v.hue, '--ink': v.ink ?? '#fff' } as CSSProperties;
  const btn = (
    <button className={`pbtn${size ? ` pbtn--${size}` : ''}${v.spread ? ' pbtn--spread' : ''}`} style={style} disabled={disabled}>
      {children}
    </button>
  );
  return v.track ? <span className={`pbtn-track${size ? ` pbtn-track--${size}` : ''}`}>{btn}</span> : btn;
}

function PrimaryCards() {
  return (
    <div className="bdemo">
      {VARIANTS.map((v) => (
        <section key={v.id} className="bdemo__card">
          <header>
            <h3>{v.name}</h3>
            <p>{v.note}</p>
          </header>
          <div className="bdemo__hero">
            <Pill v={v} size="lg">
              <Dots />
              Home
            </Pill>
          </div>
          <div className="bdemo__row">
            <Pill v={v}>
              <Plus size={16} /> New request
            </Pill>
            <Pill v={v}>
              <Upload size={15} /> Upload
            </Pill>
            <Pill v={v}>
              <Check size={16} /> Approve proposal
            </Pill>
          </div>
          <div className="bdemo__row">
            <Pill v={v} size="sm">
              Continue <ArrowRight size={14} />
            </Pill>
            <Pill v={v} size="sm" disabled>
              Sending…
            </Pill>
            <button className="btn btn--secondary btn--sm">Cancel</button>
          </div>
        </section>
      ))}
    </div>
  );
}

// ---- Secondary ----------------------------------------------------------------------------

const SECONDARY = [
  { id: 'raised', name: '1 · Raised dark', note: 'The primary’s build in a dark surface: same pill, lit edge and depth, no colour.' },
  { id: 'track', name: '2 · Dark in a track', note: 'Raised dark pill set into the same recessed track. Pairs one-to-one with a tracked primary.' },
  { id: 'outline', name: '3 · Hairline', note: 'Transparent pill with a thin light outline. Lightest weight next to a filled primary.' },
  { id: 'glass', name: '4 · Glass', note: 'Translucent white with blur and a lit top edge. Picks up the page glow behind it.' },
  { id: 'tint', name: '5 · Tinted', note: 'A soft wash of the primary’s colour with coloured text: clearly related, clearly second.' },
  { id: 'text', name: '6 · Text pill', note: 'Just the label; a soft pill appears on hover. For the quietest actions next to a primary.' },
] as const;

function Sec({ kind, hue, children, size, disabled }: { kind: string; hue: string; children: ReactNode; size?: 'sm' | 'lg'; disabled?: boolean }) {
  const btn = (
    <button className={`sbtn sbtn--${kind === 'track' ? 'raised' : kind}${size ? ` pbtn--${size}` : ''}`} style={{ '--hue': hue } as CSSProperties} disabled={disabled}>
      {children}
    </button>
  );
  return kind === 'track' ? <span className={`pbtn-track${size ? ` pbtn-track--${size}` : ''}`}>{btn}</span> : btn;
}

function SecondaryCards({ primary }: { primary: Variant }) {
  return (
    <div className="bdemo">
      {SECONDARY.map((k) => (
        <section key={k.id} className="bdemo__card">
          <header>
            <h3>{k.name}</h3>
            <p>{k.note}</p>
          </header>
          <div className="bdemo__hero bdemo__hero--pair">
            <Sec kind={k.id} hue={primary.hue} size="lg">
              Cancel
            </Sec>
            <Pill v={primary} size="lg">
              <Plus size={18} /> New request
            </Pill>
          </div>
          <div className="bdemo__row">
            <Sec kind={k.id} hue={primary.hue}>
              <Download size={15} /> Download
            </Sec>
            <Sec kind={k.id} hue={primary.hue}>
              <Share2 size={15} /> Share
            </Sec>
            <Sec kind={k.id} hue={primary.hue}>
              Request changes
            </Sec>
          </div>
          <div className="bdemo__row">
            <Sec kind={k.id} hue={primary.hue} size="sm">
              Back
            </Sec>
            <Sec kind={k.id} hue={primary.hue} size="sm" disabled>
              Unavailable
            </Sec>
            <Pill v={primary} size="sm">
              Continue <ArrowRight size={14} />
            </Pill>
          </div>
        </section>
      ))}
    </div>
  );
}

// ---- Go to chat ---------------------------------------------------------------------------

const CHAT = [
  { id: 'edge', name: '1 · Glass with a blue edge', note: 'Today’s AI button as a pill: dark glass, thin blue edge that glows on hover, the orb in front.' },
  { id: 'track', name: '2 · Orb in a track', note: 'The reference build: dark pill in the recessed track, the orb where the dots sit.' },
  { id: 'ring', name: '3 · Living ring', note: 'A slow gradient ring in the orb’s colours runs round the pill. Says “AI” without a word.' },
  { id: 'cream', name: '4 · Cream', note: 'The composer’s cream with dark text, so the button looks like the chat it opens.' },
  { id: 'lead', name: '5 · Orb leads', note: 'A bigger orb breaks out of the pill’s left edge; the label follows with an arrow.' },
  { id: 'blue', name: '6 · Blue glass', note: 'A wash of Spark blue, lit edge and the orb. Sits between primary and secondary.' },
] as const;

function Chat({ kind, children, size }: { kind: string; children: ReactNode; size?: 'sm' | 'lg' }) {
  const orb = size === 'lg' ? (kind === 'lead' ? 40 : 24) : size === 'sm' ? (kind === 'lead' ? 26 : 16) : kind === 'lead' ? 32 : 20;
  const btn = (
    <button className={`cbtn cbtn--${kind === 'track' ? 'dark' : kind}${size ? ` pbtn--${size}` : ''}`}>
      <span className="cbtn__orb">
        <FluidOrb size={orb} />
      </span>
      {children}
    </button>
  );
  return kind === 'track' ? <span className={`pbtn-track${size ? ` pbtn-track--${size}` : ''}`}>{btn}</span> : btn;
}

function ChatCards({ primary }: { primary: Variant }) {
  return (
    <div className="bdemo">
      {CHAT.map((k) => (
        <section key={k.id} className="bdemo__card">
          <header>
            <h3>{k.name}</h3>
            <p>{k.note}</p>
          </header>
          <div className="bdemo__hero bdemo__hero--pair">
            <Chat kind={k.id} size="lg">
              Start a chat
            </Chat>
            <Pill v={primary} size="lg">
              <Plus size={18} /> New request
            </Pill>
          </div>
          <div className="bdemo__row">
            <Chat kind={k.id}>Ask about this</Chat>
            <Chat kind={k.id}>
              Discuss in chat <ArrowRight size={14} />
            </Chat>
          </div>
          <div className="bdemo__row">
            <Chat kind={k.id} size="sm">
              Ask Spark
            </Chat>
            <button className="btn btn--secondary btn--sm">
              <MessageSquare size={13} /> Open chat
            </button>
          </div>
        </section>
      ))}
    </div>
  );
}

// ---- Chat ring colours --------------------------------------------------------------------
// The live portal button (.btn--ai) with its ring palette swapped via --ring-stops.

const RINGS = [
  { id: 'now', name: '1 · Muted mix', note: 'Dusty blue, lilac, sand and teal-grey. Present, never loud.', stops: '#4a63a8, #6f63a8, #9a917f, #4f8a99, #4a63a8' },
  { id: 'orb', name: '2 · Orb colours', note: 'Taken from the orb itself: deep blue and violet with a warm gold flash, so ring and orb read as one.', stops: '#3f55c4, #7b5cd6, #c9944f, #3f55c4' },
  { id: 'blue', name: '3 · Spark blue (chosen)', note: 'Shades of the brand blue only. The calmest, closest to the primary button.', stops: '#2f4a8f, #5b80d8, #9db6f0, #5b80d8, #2f4a8f' },
  { id: 'comet', name: '4 · Comet', note: 'One bright blue streak chasing round an almost-invisible edge. Motion over colour.', stops: 'transparent 0deg, rgba(255,255,255,0.06) 200deg, #5b80d8 300deg, #c7d6ff 350deg, transparent 360deg' },
  { id: 'aurora', name: '5 · Aurora', note: 'Teal, green and blue, soft and cool. Feels like “insight” rather than “brand”.', stops: '#2f8f8a, #4fae86, #4a7fc4, #6a6fc4, #2f8f8a' },
  { id: 'sunset', name: '6 · Dusk', note: 'Muted amber, rose and violet. Warmest of the set; stands apart from the blue primary.', stops: '#b0845a, #b06a7f, #7a64b0, #b0845a' },
  { id: 'silver', name: '7 · Silver', note: 'Grey-lilac with a light glint. Almost neutral: the ring is felt more than seen.', stops: '#5c6278, #9aa0b8, #e3e6f0, #9aa0b8, #5c6278' },
  { id: 'iris', name: '8 · Iris', note: 'Blue to violet and back. A classic “AI” gradient, kept low in saturation.', stops: '#4a63a8, #7a5fb8, #a26ab8, #7a5fb8, #4a63a8' },
] as const;

function RingCards() {
  return (
    <div className="bdemo">
      {RINGS.map((r) => {
        const style = { '--ring-stops': r.stops } as CSSProperties;
        return (
          <section key={r.id} className="bdemo__card">
            <header>
              <h3>{r.name}</h3>
              <p>{r.note}</p>
            </header>
            <div className="bdemo__hero bdemo__hero--pair">
              <Button variant="ai" lead={<FluidOrb size={20} />} style={style}>
                Start a chat
              </Button>
              <Button variant="primary" icon={Plus}>
                New request
              </Button>
            </div>
            <div className="bdemo__row">
              <Button variant="ai" lead={<FluidOrb size={20} />} style={style}>
                Ask about this file
              </Button>
              <Button variant="ai" size="sm" lead={<FluidOrb size={16} />} style={style}>
                Ask about this
              </Button>
              <Button variant="ai" size="sm" aria-label="Ask about this file" lead={<FluidOrb size={16} />} style={style} />
            </div>
          </section>
        );
      })}
    </div>
  );
}

// ---- Page ---------------------------------------------------------------------------------

const KINDS = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'chat', label: 'Go to chat' },
  { value: 'ring', label: 'Chat ring colours' },
] as const;

export function ButtonsDemo() {
  const [kind, setKind] = useState<(typeof KINDS)[number]['value']>('primary');
  const [pid, setPid] = useState(VARIANTS[1].id);
  const primary = VARIANTS.find((v) => v.id === pid)!;
  return (
    <div className="cdemo">
      <PageHeader title="Buttons" sub="Looks for the primary, secondary and “go to chat” buttons after the sage “Home” pill. Hover and press them; each card shows the labels the button carries across the portal." />
      <Tabs className="tabs--underline" value={kind} onChange={setKind} items={KINDS.map((k) => ({ value: k.value, label: k.label }))} />
      {(kind === 'secondary' || kind === 'chat') && (
        <p className="cdemo__note bdemo__pair">
          <span className="faint">Shown next to primary</span>
          {VARIANTS.map((v) => (
            <button key={v.id} className={v.id === pid ? 'is-active' : undefined} onClick={() => setPid(v.id)} style={{ '--hue': v.hue } as CSSProperties} title={v.name}>
              {v.name.replace(/^\d · /, '')}
            </button>
          ))}
        </p>
      )}
      {kind === 'primary' ? <PrimaryCards /> : kind === 'secondary' ? <SecondaryCards primary={primary} /> : kind === 'chat' ? <ChatCards primary={primary} /> : <RingCards />}
    </div>
  );
}

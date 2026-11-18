// Prototype-only page (#/demo/brand-ui): the portal's controls in the brand's material, after the
// guidelines (p. 32 type, p. 34 frosted light, p. 36 icons & interface, p. 39 social): a frosted glass body,
// the spectrum underneath (Cobalt to Ember), Ink or white on top. First the parts, then the parts in place
// on the portal's own screens. Nothing here is live yet.
import { useState } from 'react';
import { ArrowRight, ArrowUp, Search } from 'lucide-react';
import { Mascot } from '../../components/ui/Mascot';
import { PageHeader, cx } from '../../components/ui/primitives';

/** The spark, as cut from the wordmark (four points). */
function Spark({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z" fill="currentColor" />
    </svg>
  );
}

/** A mono label, uppercase and tracked (p. 32), with Spark's star before it when it marks Spark's work. */
function Label({ children, spark }: { children: React.ReactNode; spark?: boolean }) {
  return (
    <span className="bui-label">
      {spark && <Spark size={9} className="bui-label__spark" />}
      {children}
    </span>
  );
}

function Pill({ tone, children }: { tone: 'human' | 'ai' | 'ink'; children: React.ReactNode }) {
  return <span className={cx('bui-pill', `bui-pill--${tone}`)}>{children}</span>;
}

function Section({ n, title, note, children }: { n: string; title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="bui-sec">
      <header className="bui-sec__head">
        <Label>{n}</Label>
        <h2>{title}</h2>
        <p>{note}</p>
      </header>
      {children}
    </section>
  );
}

export function BrandUiDemo() {
  const [on, setOn] = useState(true);
  const [level, setLevel] = useState(64);
  const [seg, setSeg] = useState<'all' | 'human' | 'ai'>('all');
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState<string[]>(['Make it brighter']);
  const send = () => {
    if (!draft.trim()) return;
    setSent((s) => [...s, draft.trim()]);
    setDraft('');
  };

  return (
    <div className="cdemo bui">
      <PageHeader
        title="Brand in the interface"
        sub="The portal’s controls in Spark’s material: frosted glass, the spectrum underneath, Ink on top. The fonts from the guidelines are already on the whole portal. Prototype only."
      />

      {/* ---- 01 · Type ------------------------------------------------------------------------- */}
      <Section n="01 · Type" title="One family, three weights" note="Ultra speaks first, Bold organises, Light explains. Mono labels, Doto lights up the numbers.">
        <div className="bui-type">
          <div className="bui-type__row">
            <Label>Titles · Ultra · 44+</Label>
            <span className="bui-t-ultra">Sparks to light.</span>
          </div>
          <div className="bui-type__row">
            <Label>Subtitles · Bold</Label>
            <span className="bui-t-bold">Human minds. AI power.</span>
          </div>
          <div className="bui-type__row">
            <Label>Text · Light</Label>
            <span className="bui-t-light">We understand the technology before we talk about it.</span>
          </div>
          <div className="bui-type__row">
            <Label>Labels · Mono</Label>
            <span className="bui-label bui-label--lg">Brand Co. · Requests · 2026</span>
          </div>
          <div className="bui-type__row">
            <Label>Highlights · Doto</Label>
            <span className="bui-t-dots">64.20</span>
          </div>
          <div className="bui-type__row">
            <Label>Arabic · Hacen Casablanca</Label>
            <span className="bui-t-ar" dir="rtl" lang="ar">
              نُخرج الشرارات إلى النور
            </span>
          </div>
        </div>
      </Section>

      {/* ---- 02 · Glass controls ---------------------------------------------------------------- */}
      <Section n="02 · Controls" title="Every control follows one recipe" note="Frosted glass body, spectrum underneath, Ink or white on top (p. 36). One glow per control, never flat colour.">
        <div className="bui-grid">
          {/* Ask Spark: the box, as on the social post “Ask anything. Make everything.” */}
          <div className="bui-tile bui-tile--wide">
            <Label>Ask Spark · the box</Label>
            <div className="bui-stage">
              <div className="bui-glow bui-glow--wide" />
              <form
                className="bui-glass bui-ask"
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                <Mascot size={26} />
                <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask anything" aria-label="Ask Spark" />
                <button type="submit" className="bui-ask__send" aria-label="Send">
                  <ArrowUp size={16} strokeWidth={2.2} />
                </button>
              </form>
            </div>
          </div>

          {/* Chat: the client's message in glass, Spark answering "On it" with Ember dots (AI). */}
          <div className="bui-tile">
            <Label>Chat · messages</Label>
            <div className="bui-stage bui-stage--chat">
              <div className="bui-glow bui-glow--chat" />
              {sent.slice(-2).map((m, i) => (
                <span key={i} className="bui-glass bui-bubble">
                  {m}
                </span>
              ))}
              <span className="bui-glass bui-bubble bui-bubble--spark">
                On it <span className="bui-dots" aria-label="Spark is working"><i /><i /><i /></span>
              </span>
            </div>
          </div>

          {/* Search: a clear glass field, as “Search less. Spark more.” */}
          <div className="bui-tile">
            <Label>Search</Label>
            <div className="bui-stage">
              <div className="bui-glow bui-glow--soft" />
              <label className="bui-glass bui-search">
                <Search size={16} strokeWidth={1.8} />
                <input placeholder="Search requests and files" />
              </label>
            </div>
          </div>

          {/* Switch: the knob is the light; on, it holds the spark (p. 36, top right). */}
          <div className="bui-tile">
            <Label>Switch</Label>
            <div className="bui-stage">
              <button type="button" className={cx('bui-switch', on && 'is-on')} onClick={() => setOn((v) => !v)} aria-pressed={on} aria-label="Email me when Spark replies">
                <span className="bui-switch__knob">{on && <Spark size={12} />}</span>
              </button>
              <span className="bui-caption">{on ? 'Email me when Spark replies' : 'No emails'}</span>
            </div>
          </div>

          {/* Slider and segmented: glass tracks, the active part lit. */}
          <div className="bui-tile">
            <Label>Slider · segmented</Label>
            <div className="bui-stage bui-stage--col">
              <div className="bui-slider" style={{ ['--v' as string]: `${level}%` }}>
                <div className="bui-slider__fill" />
                <input type="range" min={0} max={100} value={level} onChange={(e) => setLevel(+e.target.value)} aria-label="Credits to add" />
              </div>
              <div className="bui-glass bui-seg" role="tablist">
                {(['all', 'human', 'ai'] as const).map((k) => (
                  <button key={k} type="button" role="tab" aria-selected={seg === k} className={cx(seg === k && 'is-on')} onClick={() => setSeg(k)}>
                    {k === 'all' ? 'All' : k === 'human' ? 'By people' : 'By AI'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pills (p. 39): Cobalt for human, Ember for AI; Ink for status. */}
          <div className="bui-tile">
            <Label>Pills</Label>
            <div className="bui-stage bui-stage--wrap">
              <Pill tone="human">Human</Pill>
              <Pill tone="ai">AI</Pill>
              <Pill tone="ink">Strategy</Pill>
              <Pill tone="human">Reviewed by Spark</Pill>
              <Pill tone="ai">Drafted with AI</Pill>
            </div>
          </div>

          {/* The app icon: the spark lit from inside, in a glass squircle. */}
          <div className="bui-tile bui-tile--wide">
            <Label>Icon</Label>
            <div className="bui-stage">
              <span className="bui-icon">
                <Spark size={34} />
              </span>
              <span className="bui-glass bui-chip-icon">
                <Spark size={14} className="bui-chip-icon__spark" /> New from Spark
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* ---- 03 · Statements ---------------------------------------------------------------------- */}
      <Section n="03 · Statements" title="One idea per surface" note="Light grounds for ideas; Cobalt, Ember or Ink bands for statements (p. 40). Second line in Cobalt, a mono label, coordinates and the spark.">
        <div className="bui-cards">
          <article className="bui-card">
            <div className="bui-card__art bui-card__art--glass">
              <div className="bui-glow bui-glow--art" />
              <span className="bui-glass bui-bubble">Make it brighter</span>
              <span className="bui-glass bui-bubble bui-bubble--blank" />
              <span className="bui-glass bui-bubble bui-bubble--spark">
                On it <span className="bui-dots"><i /><i /><i /></span>
              </span>
            </div>
            <div className="bui-card__foot">
              <span className="bui-card__pills">
                <Pill tone="human">Human</Pill>
                <Pill tone="ai">AI</Pill>
              </span>
              <h3>
                Make it brighter.
                <br />
                <em>We’re on it.</em>
              </h3>
              <span className="bui-coords">24.45° N · 54.38° E</span>
            </div>
          </article>

          <article className="bui-card bui-card--band bui-card--cobalt">
            <div className="bui-card__art bui-card__art--horizon">
              <Spark size={70} className="bui-card__bigspark" />
            </div>
            <div className="bui-card__foot">
              <Label spark>Point of view</Label>
              <h3>
                See the next
                <br />
                horizon.
              </h3>
              <span className="bui-card__go">
                <ArrowRight size={16} />
              </span>
            </div>
          </article>

          <article className="bui-card bui-card--band bui-card--ink">
            <div className="bui-card__art bui-card__art--count">
              <span className="bui-t-ultra bui-t-ultra--xl">3</span>
              <Label>Need your attention</Label>
            </div>
            <div className="bui-card__foot">
              <Label spark>Your requests</Label>
              <h3>
                Three decisions,
                <br />
                one week.
              </h3>
              <span className="bui-card__go">
                <ArrowRight size={16} />
              </span>
            </div>
          </article>
        </div>
      </Section>

      {/* ---- 04 · In the portal -------------------------------------------------------------------- */}
      <Section n="04 · In the portal" title="Where it could go" note="The same parts on the portal’s own screens: Home’s Ask Spark box, the credits, a request card.">
        <div className="bui-apply">
          {/* Home: Ask Spark as the glass box under the company's name. */}
          <div className="bui-apply__home">
            <Label>Home · hero</Label>
            <h3 className="bui-t-ultra bui-t-ultra--sm">Brand Co.</h3>
            <p className="bui-t-light">Everyday products with a Gulf point of view.</p>
            <div className="bui-stage bui-stage--left">
              <div className="bui-glow bui-glow--wide" />
              <div className="bui-glass bui-ask">
                <Mascot size={26} />
                <input placeholder="Ask Spark about your brand, a request, a file" aria-label="Ask Spark" />
                <button type="button" className="bui-ask__send" aria-label="Send">
                  <ArrowUp size={16} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </div>

          {/* Credits: the balance in Doto, a glass card with the light under it. */}
          <div className="bui-apply__credits">
            <div className="bui-glow bui-glow--soft" />
            <div className="bui-glass bui-credits">
              <Label>Credits left</Label>
              <span className="bui-t-ultra bui-t-ultra--num">64.20</span>
              <span className="bui-credits__bar">
                <i style={{ width: '64%' }} />
              </span>
              <span className="bui-caption">USD · of 100.00 this month</span>
            </div>
          </div>

          {/* A request: mono labels, the stage as a pill, the title in Bold. */}
          <div className="bui-apply__req">
            <div className="bui-req">
              <span className="bui-req__top">
                <Label>REQ-104 · Creative</Label>
                <Pill tone="ink">Proposal</Pill>
              </span>
              <b>UAE National Day window displays</b>
              <span className="bui-t-light bui-caption">Spark sent a proposal. Decide by 14 Oct.</span>
              <span className="bui-req__go">
                Review proposal <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

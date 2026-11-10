// Prototype-only page (#/demo/glass-3d, 10 Nov): real 3D glass in the portal, after Jean's call.
// Three objects from the brand book's material: a lens holding one big Doto number, a capsule holding a level,
// and Sparky, the glass star with eyes and moods. Judge the glass here before it goes on Home.
import { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { GlassCapsule, GlassLens, GlassSparky, hasWebGL, type SparkyMood } from '../../components/ui/Glass3D';
import { cx } from '../../components/ui/primitives';
import '../../styles/glass3d.css';

const MOODS: { v: SparkyMood; label: string; line: string }[] = [
  { v: 'idle', label: 'Idle', line: 'Ask me anything about your brand.' },
  { v: 'thinking', label: 'Thinking', line: 'Looking through your website…' },
  { v: 'found', label: 'Found', line: 'Sparky found 3 things on your website.' },
];

export function Glass3DDemo() {
  const [mood, setMood] = useState<SparkyMood>('found');
  const cta = useRef<HTMLButtonElement>(null);
  const gl = hasWebGL();
  const m = MOODS.find((x) => x.v === mood)!;

  if (!gl) return <p className="g3-note">This browser has no WebGL, so the 3D glass can’t show here.</p>;

  return (
    <div className="g3">
      <p className="g3-eyebrow">Prototype · 3D glass</p>
      <h1 className="g3-title">
        One idea.
        <br />
        <span>The right light.</span>
      </h1>
      <p className="g3-sub">Real glass, rendered live. Move the pointer over an object to tilt it.</p>

      {/* 1 · Hero: one finding, one number, one action */}
      <section className="g3-hero">
        <div className="g3-hero__text">
          <span className="g3-label">Sparky found · Website</span>
          <h2 className="g3-h2">
            On brand.
            <br />
            <span>Slow on mobile.</span>
          </h2>
          <p className="g3-line">Fast sites score 90 and up.</p>
          <button type="button" className="g3-cta">
            See the 3 fixes <ArrowRight size={16} />
          </button>
        </div>
        <GlassLens className="g3-hero__lens" value="41" unit="/100" tone="full" />
      </section>

      {/* 2 · Scores as objects, not a dashboard */}
      <section className="g3-row">
        <figure className="g3-tile">
          <GlassLens className="g3-tile__obj" value="3.4%" tone="cool" />
          <figcaption>
            <span className="g3-label">Instagram</span>
            <b>Engagement works.</b>
          </figcaption>
        </figure>
        <figure className="g3-tile">
          <GlassLens className="g3-tile__obj" value="5" unit="/10" tone="warm" />
          <figcaption>
            <span className="g3-label">TikTok</span>
            <b>Only 5. Room to grow.</b>
          </figcaption>
        </figure>
        <figure className="g3-tile g3-tile--wide">
          <GlassCapsule className="g3-tile__obj" level={0.72} />
          <figcaption>
            <span className="g3-label">Brand consistency · 72%</span>
            <b>Your voice holds across channels.</b>
          </figcaption>
        </figure>
      </section>

      {/* 3 · Sparky: moods, and eyes that point the way */}
      <section className="g3-sparky">
        <GlassSparky className="g3-sparky__obj" mood={mood} target={mood === 'found' ? cta : null} />
        <div className="g3-sparky__text">
          <span className="g3-label">Sparky · {m.label}</span>
          <p className="g3-say">{m.line}</p>
          <div className="g3-moods" role="radiogroup" aria-label="Sparky’s mood">
            {MOODS.map((x) => (
              <button key={x.v} type="button" role="radio" aria-checked={mood === x.v} className={cx('g3-mood', mood === x.v && 'is-on')} onClick={() => setMood(x.v)}>
                {x.label}
              </button>
            ))}
          </div>
          <button ref={cta} type="button" className={cx('g3-cta', mood !== 'found' && 'is-quiet')}>
            Show me <ArrowRight size={16} />
          </button>
          <p className="g3-hint">Idle and thinking: the eyes follow your pointer. Found: Sparky looks at the button.</p>
        </div>
      </section>
    </div>
  );
}

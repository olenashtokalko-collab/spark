// Prototype-only page (#/demo/welcome-liquid, 11 Nov): plays the welcome after sign-in (onboarding/LiquidWelcome)
// on demand, in either material. On the portal it plays once, on a new company's first visit to Home.
import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { MetalButton } from '../../components/ui/MetalButton';
import { cx } from '../../components/ui/primitives';
import { LOOKS, playWelcome, type Look } from '../onboarding/LiquidWelcome';

export function WelcomeLiquidDemo() {
  const [look, setLook] = useState<Look>('metal');
  const play = (l: Look = look) => {
    setLook(l);
    playWelcome(l);
  };
  // plays once on arriving at the page (React's dev double effect starts it only once)
  useEffect(() => {
    const t = window.setTimeout(() => playWelcome('metal'), 0);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="wld">
      <span className="wld-eyebrow">Prototype · Welcome</span>
      <h1>You’re in.</h1>
      <p className="wld-sub">
        The first step into the portal: sound on or off, a living card says hello, Start pours it into Dr.AI, he
        introduces himself and walks off to his corner as Home opens. Return starts, Esc skips.
      </p>
      <div className="wld-looks" role="radiogroup" aria-label="Material">
        {LOOKS.map((l) => (
          <button key={l.v} type="button" role="radio" aria-checked={look === l.v} className={cx(look === l.v && 'is-on')} onClick={() => play(l.v)}>
            <b>{l.label}</b>
            <span>{l.note}</span>
          </button>
        ))}
      </div>
      <div className="wld-acts">
        <MetalButton tone="spark" profile="portal" onClick={() => play()}>
          <RotateCcw size={15} /> Play again
        </MetalButton>
        <button
          type="button"
          className="wld-reset"
          onClick={() => {
            try {
              localStorage.removeItem('spark-welcome-sound');
            } catch {
              /* nothing kept */
            }
            play();
          }}
        >
          Ask about sound again
        </button>
      </div>
    </div>
  );
}

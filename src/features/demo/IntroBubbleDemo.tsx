// Prototype-only page (#/demo/intro-bubble), 10 Nov review: the welcome opens on the ground alone, then Dr.AI floats
// in already in his clear glass bubble; the bubble carries him to his corner and breaks there. Played full size over
// the real Home, as a visitor sees it, beside today's opening. The bar at the top picks the look and plays it again.
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Play } from 'lucide-react';
import { cx } from '../../components/ui/primitives';
import { OnboardingHome, WelcomeIntro, type WelcomeLook, type WelcomePop } from '../onboarding/Onboarding';

const LOOKS: { v: WelcomeLook; label: string; note: string }[] = [
  {
    v: 'now',
    label: 'Now',
    note: 'Today: Dr.AI and the words at once; the bubble gathers round him only in flight.',
  },
  {
    v: 'words',
    label: 'A · Bubble, then words',
    note: 'The ground alone, then Dr.AI floats in already in his bubble; the words come; the bubble carries him to his corner and breaks.',
  },
  {
    v: 'only',
    label: 'B · Bubble only',
    note: 'The ground, Dr.AI floats in in his bubble and is carried straight to his corner. No words, shorter.',
  },
];
const POPS: { v: WelcomePop; label: string }[] = [
  { v: 'burst', label: 'Breaks into drops' },
  { v: 'clean', label: 'Clean pop' },
];

export function IntroBubbleDemo() {
  const [look, setLook] = useState<WelcomeLook>('words');
  const [pop, setPop] = useState<WelcomePop>('burst');
  // Each play mounts the welcome afresh; null when it has gone.
  const [run, setRun] = useState<number | null>(0);
  const play = (l = look, p = pop) => {
    setLook(l);
    setPop(p);
    setRun((r) => (r ?? 0) + 1);
  };
  return (
    <>
      <OnboardingHome noIntro />
      {run !== null && <WelcomeIntro key={`${run}-${look}-${pop}`} demo={{ look, pop, onDone: () => setRun(null) }} />}
      {createPortal(
        <div className="ibd-bar" role="toolbar" aria-label="Welcome looks">
          <span className="ibd-bar__label">Welcome</span>
          {LOOKS.map((l) => (
            <button key={l.v} type="button" className={cx(look === l.v && 'is-on')} title={l.note} onClick={() => play(l.v, pop)}>
              {l.label}
            </button>
          ))}
          <i className="ibd-bar__sep" />
          {POPS.map((p) => (
            <button
              key={p.v}
              type="button"
              disabled={look === 'now'}
              className={cx(look !== 'now' && pop === p.v && 'is-on')}
              onClick={() => play(look, p.v)}
            >
              {p.label}
            </button>
          ))}
          <i className="ibd-bar__sep" />
          <button type="button" className="ibd-bar__play" onClick={() => play()}>
            <Play size={13} /> Play again
          </button>
        </div>,
        document.body,
      )}
    </>
  );
}

// The sign-in page with Dr.AI, two versions to choose between (6 Nov): A, a speech bubble over him; B, him free
// with two small squares and a chat. Each on a light or dark ground, picked from the bar at the bottom. Shown on the
// signed-out page itself while the team decides, and on #/demo/signin. The pick is kept for the visit's browser.
import { useState } from 'react';
import { SignIn, type SignInLook } from '../auth/SignIn';
import type { Concept, Ground } from '../auth/SignInLooks';
import { cx } from '../../components/ui/primitives';

const VERSIONS: { v: Concept; label: string }[] = [
  { v: 'bubble', label: 'Version A' },
  { v: 'mix', label: 'Version B' },
];
const KEY = 'spark-signin-look';

function saved(): [Concept, Ground] {
  const fromHash = new URLSearchParams(location.hash.split('?')[1] ?? '').get('v');
  let v = fromHash;
  try {
    v ??= localStorage.getItem(KEY);
  } catch {
    /* storage can be blocked */
  }
  const [c, g] = (v ?? 'bubble-light').split('-');
  return [VERSIONS.some((x) => x.v === c) ? (c as Concept) : 'bubble', g === 'dark' ? 'dark' : 'light'];
}

export function SignInDemo() {
  const [concept, setConcept] = useState<Concept>(() => saved()[0]);
  const [ground, setGround] = useState<Ground>(() => saved()[1]);
  const look = `${concept}-${ground}` as SignInLook;
  const set = (c: Concept, g: Ground) => {
    setConcept(c);
    setGround(g);
    try {
      localStorage.setItem(KEY, `${c}-${g}`);
    } catch {
      /* storage can be blocked */
    }
  };
  return (
    <div className="sgd">
      <div className="sgd__bar" role="toolbar" aria-label="Sign-in versions">
        {VERSIONS.map((c) => (
          <button key={c.v} type="button" aria-pressed={c.v === concept} className={cx('sgd__tab', c.v === concept && 'is-on')} onClick={() => set(c.v, ground)}>
            {c.label}
          </button>
        ))}
        <span className="sgd__sep" aria-hidden />
        {(['light', 'dark'] as Ground[]).map((g) => (
          <button key={g} type="button" aria-pressed={g === ground} className={cx('sgd__tab', g === ground && 'is-on')} onClick={() => set(concept, g)}>
            {g === 'light' ? 'Light' : 'Dark'}
          </button>
        ))}
      </div>
      <SignIn key={look} look={look} />
    </div>
  );
}

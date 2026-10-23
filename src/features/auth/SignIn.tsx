// Signed-out screen: the introduction page before sign-in (feedback of 21 Oct, point 2), picked on
// #/demo/intro?v=typing (O): on a Cobalt-to-Ember panel the agent "types" what it does, one line at a
// time, centred and written in place; the mascot's place sits above it until Spark shares the art.
// The form on white on the right. Prototype only: no passwords are checked; real sign-in plugs in
// here (see docs/02-implementation.md).
import { useEffect, useState } from 'react';
import { useStore } from '../../state/store';
import { Button, Field, Input, cx } from '../../components/ui/primitives';
import { navigate } from '../../lib/router';

// What the agent can do, in its own voice: general, no client's names, nothing the portal doesn't do.
const LINES = [
  'I research your market and audience, with sources.',
  'I listen to what people say about your brand.',
  'I turn good answers into requests for the Spark team.',
  'I keep proposals, files and guidelines in one place.',
];

/** Types a line letter by letter, holds it, clears it, moves on. Reduced motion: whole lines. */
function AgentLine() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [line, setLine] = useState(0);
  const [n, setN] = useState(reduce ? LINES[0].length : 0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    if (reduce) {
      const t = setTimeout(() => setLine((l) => (l + 1) % LINES.length), 3400);
      return () => clearTimeout(t);
    }
    const full = LINES[line].length;
    const t = setTimeout(
      () => {
        if (!del && n < full) setN(n + 1);
        else if (!del) setDel(true);
        else if (n > 0) setN(Math.max(0, n - 3));
        else {
          setDel(false);
          setLine((l) => (l + 1) % LINES.length);
        }
      },
      !del && n < full ? 38 : !del ? 1700 : 18,
    );
    return () => clearTimeout(t);
  }, [n, del, line, reduce]);
  const shown = reduce ? LINES[line].length : n;
  return (
    <div className="itd-type itd-type--feed">
      <div className="itd-type__feed">
        {/* Centred and written in place: the rest of the line is laid out but not shown, so it grows left to right. */}
        <p className="itd-type__line" aria-live="polite" aria-label={LINES[line]}>
          {LINES[line].slice(0, shown)}
          <span className="itd-type__ghost" aria-hidden>
            {LINES[line].slice(shown)}
          </span>
        </p>
      </div>
      <div className="itd-type__dots" aria-hidden>
        {LINES.map((t, i) => (
          <span key={t} className={cx(i === line && 'is-on')} />
        ))}
      </div>
    </div>
  );
}

export function SignIn() {
  const { me, actions } = useStore();
  const [email, setEmail] = useState(me.email);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError('Enter your email.');
    if (!password) return setError('Enter your password.');
    setError(null);
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    actions.signIn();
    navigate('/');
  };

  return (
    <div className="itd itd--type signin-page">
      <section className="itd-type__panel itd-type__panel--haze">
        {/* The primary wordmark (Ink on Sand, p. 29) in the panel's top-left corner. */}
        <img className="signin-page__wordmark" src="/brand/spark-wordmark.png" alt="Spark Studios" />
        <div className="itd-type__mascot">
          <span>Mascot</span>
        </div>
        <span className="itd-type__label">Your AI agent</span>
        <AgentLine />
      </section>
      <section className="itd-type__main">
        <div className="itd-type__form">
          <form className="itd-form itd-form--welcome itd-form--lean signin-page__form" onSubmit={submit} noValidate>
            {/* The app icon (the spark, p. 28) over the title. */}
            <img className="signin-page__icon" src="/brand/spark-app-icon.jpg" alt="" />
            <h1 className="itd-form__title signin-page__title">Welcome to Spark</h1>
            <p className="itd-form__sub">Your AI workspace for smarter work.</p>
            <Field label="Email" htmlFor="si-email">
              <Input id="si-email" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus />
            </Field>
            <Field label="Password" htmlFor="si-pw">
              <Input id="si-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </Field>
            {error && (
              <p className="signin-page__error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" variant="primary" loading={busy}>
              Sign in
            </Button>
          </form>
        </div>
        <p className="itd-panel__terms">
          By continuing, you agree to Spark’s <a href="#/terms">Terms of Service</a> and <a href="#/privacy">Privacy Policy</a>.
        </p>
      </section>
    </div>
  );
}

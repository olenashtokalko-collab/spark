// Signed-out screen: the introduction page before sign-in (feedback of 21 Oct, point 2), picked on
// #/demo/intro?v=typing (O): on a Cobalt-to-Ember panel the agent "types" what it does, one line at a
// time, centred and written in place; the mascot's place sits above it until Spark shares the art.
// The form on white on the right: the work email, then the 6-digit code from the email (feedback of 23 Oct:
// no passwords). Prototype only: any code signs in; real sign-in plugs in here (see docs/02-implementation.md).
import { useEffect, useState } from 'react';
import { MailCheck } from 'lucide-react';
import { useStore } from '../../state/store';
import { Button, Field, Input, cx } from '../../components/ui/primitives';
import { navigate } from '../../lib/router';
import { OtpCode, ResendCode } from './OtpCode';

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

type Mode = 'email' | 'code';
const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function SignIn() {
  const { me, actions } = useStore();
  const [mode, setMode] = useState<Mode>('email');
  const [email, setEmail] = useState(me.email);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const go = (m: Mode) => {
    setError(null);
    setBusy(false);
    setMode(m);
  };

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validEmail(email)) return setError('Enter your work email.');
    setError(null);
    setBusy(true);
    await wait(700);
    go('code');
  };

  // Prototype: any 6 digits sign in; the real check plugs in here (see docs/02-implementation.md).
  const verify = async () => {
    setError(null);
    setBusy(true);
    await wait(600);
    actions.signIn();
    navigate('/');
  };

  const err = error && (
    <p className="signin-page__error" role="alert">
      {error}
    </p>
  );

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
          {mode === 'email' && (
            <form className="itd-form itd-form--welcome itd-form--lean signin-page__form" onSubmit={sendCode} noValidate>
              {/* The app icon (the spark, p. 28) over the title. */}
              <img className="signin-page__icon" src="/brand/spark-app-icon.jpg" alt="" />
              <h1 className="itd-form__title signin-page__title">Welcome to Spark</h1>
              <p className="itd-form__sub">Your AI workspace for smarter work.</p>
              <Field label="Work email" htmlFor="si-email">
                <Input id="si-email" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus />
              </Field>
              {err}
              <Button type="submit" variant="primary" loading={busy}>
                Continue with email
              </Button>
              <p className="signin-page__hint">We’ll email you a 6-digit code. No password needed.</p>
            </form>
          )}

          {mode === 'code' && (
            <div className="itd-form itd-form--welcome itd-form--lean signin-page__form">
              <span className="signin-page__glyph" aria-hidden>
                <MailCheck size={22} strokeWidth={1.8} />
              </span>
              <h1 className="itd-form__title signin-page__title signin-page__title--sm">Check your email</h1>
              <p className="itd-form__sub">
                Enter the 6-digit code we sent to <strong>{email.trim()}</strong>. It works for 10 minutes.
              </p>
              <OtpCode onComplete={verify} />
              {err}
              {busy && <p className="signin-page__hint">Signing you in…</p>}
              <ResendCode onResend={() => setError(null)} />
              <button type="button" className="signin-page__link signin-page__back" onClick={() => go('email')}>
                Use a different email
              </button>
            </div>
          )}
        </div>
        <p className="itd-panel__terms">
          By continuing, you agree to Spark’s <a href="#/terms">Terms of Service</a> and <a href="#/privacy">Privacy Policy</a>.
        </p>
      </section>
    </div>
  );
}

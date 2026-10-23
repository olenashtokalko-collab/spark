// Signed-out screen: the introduction page before sign-in (feedback of 21 Oct, point 2), picked on
// #/demo/intro?v=typing (O): on a Cobalt-to-Ember panel the agent "types" what it does, one line at a
// time, centred and written in place; the mascot's place sits above it until Spark shares the art.
// The form on white on the right. Prototype only: no passwords are checked; real sign-in plugs in
// here (see docs/02-implementation.md).
import { useEffect, useState } from 'react';
import { Check, Eye, EyeOff, KeyRound, MailCheck } from 'lucide-react';
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

type Mode = 'signin' | 'forgot' | 'sent' | 'reset' | 'done';
const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** The password with a show/hide eye. */
function PasswordInput({ id, value, onChange, autoComplete, autoFocus }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; autoFocus?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <span className="signin-page__pw">
      <Input id={id} type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} autoFocus={autoFocus} />
      <button type="button" className="signin-page__eye" onClick={() => setShow((x) => !x)} aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </span>
  );
}

export function SignIn() {
  const { me, actions } = useStore();
  // The reset link in the email opens #/reset-password: straight to "Set a new password".
  const [mode, setMode] = useState<Mode>(() => (window.location.hash.startsWith('#/reset-password') ? 'reset' : 'signin'));
  const [email, setEmail] = useState(me.email);
  const [password, setPassword] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const go = (m: Mode) => {
    setError(null);
    setBusy(false);
    setMode(m);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validEmail(email)) return setError('Enter your email.');
    if (!password) return setError('Enter your password.');
    setError(null);
    setBusy(true);
    await wait(700);
    actions.signIn();
    navigate('/');
  };

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validEmail(email)) return setError('Enter the email you sign in with.');
    setError(null);
    setBusy(true);
    await wait(700);
    go('sent');
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 8) return setError('Use at least 8 characters.');
    if (next !== again) return setError('The passwords don’t match.');
    setError(null);
    setBusy(true);
    await wait(700);
    setPassword('');
    go('done');
  };

  const err = error && (
    <p className="signin-page__error" role="alert">
      {error}
    </p>
  );
  const back = (
    <button type="button" className="signin-page__link signin-page__back" onClick={() => go('signin')}>
      Back to sign in
    </button>
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
          {mode === 'signin' && (
            <form className="itd-form itd-form--welcome itd-form--lean signin-page__form" onSubmit={submit} noValidate>
              {/* The app icon (the spark, p. 28) over the title. */}
              <img className="signin-page__icon" src="/brand/spark-app-icon.jpg" alt="" />
              <h1 className="itd-form__title signin-page__title">Welcome to Spark</h1>
              <p className="itd-form__sub">Your AI workspace for smarter work.</p>
              <Field label="Email" htmlFor="si-email">
                <Input id="si-email" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus />
              </Field>
              {/* The password's label row holds "Forgot password?" on the right. */}
              <div className="field">
                <div className="field__label">
                  <label htmlFor="si-pw">Password</label>
                  <button type="button" className="signin-page__link" onClick={() => go('forgot')}>
                    Forgot password?
                  </button>
                </div>
                <PasswordInput id="si-pw" value={password} onChange={setPassword} autoComplete="current-password" />
              </div>
              {err}
              <Button type="submit" variant="primary" loading={busy}>
                Sign in
              </Button>
            </form>
          )}

          {mode === 'forgot' && (
            <form className="itd-form itd-form--welcome itd-form--lean signin-page__form" onSubmit={sendLink} noValidate>
              <span className="signin-page__glyph" aria-hidden>
                <KeyRound size={22} strokeWidth={1.8} />
              </span>
              <h1 className="itd-form__title signin-page__title signin-page__title--sm">Reset your password</h1>
              <p className="itd-form__sub">Enter the email you sign in with, and we’ll send you a link to set a new password.</p>
              <Field label="Email" htmlFor="si-forgot">
                <Input id="si-forgot" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus />
              </Field>
              {err}
              <Button type="submit" variant="primary" loading={busy}>
                Send reset link
              </Button>
              {back}
            </form>
          )}

          {mode === 'sent' && (
            <div className="itd-form itd-form--welcome itd-form--lean signin-page__form">
              <span className="signin-page__glyph" aria-hidden>
                <MailCheck size={22} strokeWidth={1.8} />
              </span>
              <h1 className="itd-form__title signin-page__title signin-page__title--sm">Check your email</h1>
              <p className="itd-form__sub">
                We sent a link to <strong>{email.trim()}</strong>. It works for 30 minutes. Don’t see it? Check your spam folder.
              </p>
              {/* Prototype: stands in for the link in the email. */}
              <Button variant="primary" onClick={() => go('reset')}>
                Open the link from the email
              </Button>
              <p className="signin-page__hint">
                Didn’t get it?{' '}
                <button type="button" className="signin-page__link" onClick={() => go('forgot')}>
                  Send it again
                </button>
              </p>
              {back}
            </div>
          )}

          {mode === 'reset' && (
            <form className="itd-form itd-form--welcome itd-form--lean signin-page__form" onSubmit={savePassword} noValidate>
              <span className="signin-page__glyph" aria-hidden>
                <KeyRound size={22} strokeWidth={1.8} />
              </span>
              <h1 className="itd-form__title signin-page__title signin-page__title--sm">Set a new password</h1>
              <p className="itd-form__sub">For {email.trim()}. At least 8 characters.</p>
              <Field label="New password" htmlFor="si-new">
                <PasswordInput id="si-new" value={next} onChange={setNext} autoComplete="new-password" autoFocus />
              </Field>
              <Field label="Repeat the password" htmlFor="si-again">
                <PasswordInput id="si-again" value={again} onChange={setAgain} autoComplete="new-password" />
              </Field>
              {err}
              <Button type="submit" variant="primary" loading={busy}>
                Save password
              </Button>
              {back}
            </form>
          )}

          {mode === 'done' && (
            <div className="itd-form itd-form--welcome itd-form--lean signin-page__form">
              <span className="signin-page__glyph signin-page__glyph--ok" aria-hidden>
                <Check size={22} strokeWidth={2.2} />
              </span>
              <h1 className="itd-form__title signin-page__title signin-page__title--sm">Password updated</h1>
              <p className="itd-form__sub">Sign in with your new password.</p>
              <Button variant="primary" onClick={() => go('signin')}>
                Back to sign in
              </Button>
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

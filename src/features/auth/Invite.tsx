// The page an invitation email links to (#/invite), after Loom's "join this workspace": who invited you,
// to which company, who is already there; then one short step to create the account with the invited
// email already in place and a 6-digit code from that email instead of a password (feedback of 23 Oct).
// Prototype: the first pending invitation; any code joins and signs in to the portal.
import { useState, type FormEvent } from 'react';
import { useStore } from '../../state/store';
import { Avatar, Button, Field, Input } from '../../components/ui/primitives';
import { navigate } from '../../lib/router';
import { OtpCode, ResendCode } from './OtpCode';

export function Invite() {
  const { state, actions } = useStore();
  const inv = state.invitations[0];
  const inviter = state.people.find((p) => p.id === inv?.invitedBy);
  const team = state.people.filter((p) => p.org === 'client');
  const company = state.brand.name;
  const [step, setStep] = useState<'invite' | 'account' | 'code'>('invite');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!inv || !inviter) {
    return (
      <div className="inv">
        <div className="inv__card">
          <h1 className="inv__title">This invitation has expired</h1>
          <p className="inv__sub">Ask the person who invited you to send a new one.</p>
        </div>
      </div>
    );
  }

  const firstNames = team.slice(0, 2).map((p) => p.name.split(' ')[0]);
  const others = team.length - firstNames.length;
  const already = others > 0 ? `${firstNames.join(', ')} and ${others} ${others === 1 ? 'other' : 'others'}` : firstNames.join(' and ');

  const sendCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Enter your name.');
    setError(null);
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    setBusy(false);
    setStep('code');
  };

  const join = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    actions.signIn();
    navigate('/');
  };

  return (
    <div className="inv">
      <img className="inv__wordmark" src="/brand/spark-wordmark.png" alt="Spark Studios" />
      <div className="inv__card">
        {/* The company's tile, as on the Spark team's Clients page. */}
        <span className="inv__company" aria-hidden>
          {company.charAt(0)}
        </span>

        {step === 'invite' ? (
          <>
            {/* What this is, under the company's tile; then who is already there; then the one action. */}
            <div className="inv__head">
              <h1 className="inv__title">Join {company} on Spark</h1>
              <p className="inv__sub">
                <strong>{inviter.name}</strong> invited you to {company}’s workspace.
              </p>
            </div>
            {/* Who is already there. */}
            <div className="inv__team">
              <span className="avatar-stack">
                {team.slice(0, 4).map((p) => (
                  <Avatar key={p.id} person={p} size={32} ring />
                ))}
              </span>
              <span className="inv__team-text">{already} are already here</span>
            </div>
            <Button variant="primary" size="lg" className="inv__cta" onClick={() => setStep('account')}>
              Accept invitation
            </Button>
          </>
        ) : step === 'account' ? (
          <form className="inv__form" onSubmit={sendCode} noValidate>
            <h1 className="inv__title">Create your account</h1>
            <p className="inv__sub">One step, and you’re in {company}’s workspace.</p>
            <Field label="Work email" htmlFor="inv-email">
              <Input id="inv-email" type="email" value={inv.email} readOnly aria-readonly className="inv__locked" />
            </Field>
            <Field label="Your name" htmlFor="inv-name">
              <Input id="inv-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="First and last name" autoComplete="name" autoFocus />
            </Field>
            {error && (
              <p className="signin-page__error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" variant="primary" size="lg" className="inv__cta" loading={busy}>
              Continue with email
            </Button>
            <button type="button" className="inv__back" onClick={() => setStep('invite')}>
              Back
            </button>
          </form>
        ) : (
          <div className="inv__form">
            <h1 className="inv__title">Check your email</h1>
            <p className="inv__sub">
              Enter the 6-digit code we sent to <strong>{inv.email}</strong>.
            </p>
            <OtpCode onComplete={join} />
            {busy && <p className="signin-page__hint">Joining {company}…</p>}
            <ResendCode onResend={() => undefined} />
            <button type="button" className="inv__back" onClick={() => setStep('account')}>
              Back
            </button>
          </div>
        )}
      </div>
      <p className="inv__terms">
        By joining, you agree to Spark’s <a href="#/terms">Terms of Service</a> and <a href="#/privacy">Privacy Policy</a>.
      </p>
    </div>
  );
}

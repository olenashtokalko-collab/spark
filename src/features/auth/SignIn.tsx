// Signed-out screen. Prototype only: no passwords are checked; real sign-in
// (SSO or email link) plugs in here (see docs/02-implementation.md).
import { useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { useStore } from '../../state/store';
import { Button, Field, Input } from '../../components/ui/primitives';
import { FluidOrb } from '../../components/ui/FluidOrb';
import { navigate } from '../../lib/router';

export function SignIn() {
  const { state, me, actions } = useStore();
  const [email, setEmail] = useState(me.email);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError('Enter your work email.');
    setError(null);
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    actions.signIn();
    navigate('/');
  };

  return (
    <div className="signin">
      <form className="signin__card" onSubmit={submit} noValidate>
        <FluidOrb size={72} />
        <h1 className="signin__title">Sign in</h1>
        <p className="muted">to the {state.brand.name} workspace by Spark</p>
        <div className="signin__form">
          <Field label="Work email" htmlFor="si-email" error={error ?? undefined}>
            <Input id="si-email" type="email" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus />
          </Field>
          <Button type="submit" variant="primary" size="lg" iconRight={ArrowRight} loading={busy}>
            Continue
          </Button>
        </div>
        <p className="signin__note faint">You've been logged out. We'll send a sign-in link to this address.</p>
      </form>
    </div>
  );
}

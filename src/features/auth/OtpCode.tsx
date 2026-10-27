// The 6-digit code from the sign-in email (feedback of 23 Oct: no passwords, email OTP only). One box per
// digit: typing moves on, Backspace moves back, a pasted code fills every box. Used by sign-in and the invitation.
import { useEffect, useRef, useState } from 'react';
import { cx } from '../../components/ui/primitives';

export const OTP_LENGTH = 6;

export function OtpCode({ onComplete, error, autoFocus = true }: { onComplete: (code: string) => void; error?: boolean; autoFocus?: boolean }) {
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  // A wrong code clears the boxes and puts the caret back in the first one.
  useEffect(() => {
    if (!error) return;
    setDigits(Array(OTP_LENGTH).fill(''));
    refs.current[0]?.focus();
  }, [error]);

  const fill = (from: number, text: string) => {
    const clean = text.replace(/\D/g, '').slice(0, OTP_LENGTH - from);
    if (!clean) return;
    const next = [...digits];
    clean.split('').forEach((d, i) => (next[from + i] = d));
    setDigits(next);
    refs.current[Math.min(from + clean.length, OTP_LENGTH - 1)]?.focus();
    if (next.every(Boolean)) onComplete(next.join(''));
  };

  return (
    <div className={cx('otp', error && 'otp--error')} role="group" aria-label="Sign-in code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="otp__box"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={OTP_LENGTH}
          value={d}
          aria-label={`Digit ${i + 1}`}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) {
              const next = [...digits];
              next[i] = '';
              setDigits(next);
            } else fill(i, d && v.length === 2 ? (v[0] === d ? v[1] : v[0]) : v);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !d && i > 0) {
              e.preventDefault();
              const next = [...digits];
              next[i - 1] = '';
              setDigits(next);
              refs.current[i - 1]?.focus();
            }
            if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
            if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
          }}
          onPaste={(e) => {
            e.preventDefault();
            fill(i, e.clipboardData.getData('text'));
          }}
        />
      ))}
    </div>
  );
}

/** "Send a new code" with a countdown, so the email isn't sent again and again. */
export function ResendCode({ onResend }: { onResend: () => void }) {
  const [left, setLeft] = useState(30);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return (
    <p className="signin-page__hint">
      Didn’t get it?{' '}
      {left > 0 ? (
        <span>Send a new code in 0:{String(left).padStart(2, '0')}</span>
      ) : (
        <button
          type="button"
          className="signin-page__link"
          onClick={() => {
            onResend();
            setLeft(30);
          }}
        >
          Send a new code
        </button>
      )}
    </p>
  );
}

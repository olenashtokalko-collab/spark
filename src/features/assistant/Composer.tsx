import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { cx } from '../../components/ui/primitives';

interface Props {
  onSubmit: (text: string) => void;
  busy?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  size?: 'md' | 'lg';
  footer?: React.ReactNode;
  initial?: string;
}

/** The prompt box. It glows only while focused or while the assistant works:
 *  the accent glow is reserved for AI moments. */
export function Composer({ onSubmit, busy, placeholder = 'Ask about your brand, files or Spark’s work…', autoFocus, size = 'md', footer, initial = '' }: Props) {
  const [value, setValue] = useState(initial);
  const [focus, setFocus] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    el.style.overflowY = el.scrollHeight > 200 ? 'auto' : 'hidden';
  }, [value]);

  const send = () => {
    const t = value.trim();
    if (!t || busy) return;
    onSubmit(t);
    setValue('');
  };

  return (
    <div className={cx('composer', `composer--${size}`, (focus || busy) && 'is-lit', busy && 'is-busy')}>
      <textarea
        ref={ref}
        rows={1}
        value={value}
        placeholder={placeholder}
        aria-label="Message the assistant"
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            send();
          }
        }}
      />
      <div className="composer__bar">
        <div className="composer__footer">{footer}</div>
        <button className="composer__send" onClick={send} disabled={!value.trim() || busy} aria-label={busy ? 'Assistant is answering' : 'Send'}>
          {busy ? <Square size={12} fill="currentColor" /> : <ArrowUp size={17} strokeWidth={2.2} />}
        </button>
      </div>
    </div>
  );
}

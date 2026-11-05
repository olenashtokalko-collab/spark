import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Check, Mic, Paperclip, Plus, Square, X } from 'lucide-react';
import { Button, cx } from '../../components/ui/primitives';
import { FileIcon, kindOf } from '../../components/domain';
import { Mascot } from '../../components/ui/Mascot';
import { useDrAi } from '../../components/ui/DrAi';
import type { Attachment } from '../../data/types';

interface Props {
  onSubmit: (text: string, attachments: Attachment[]) => void;
  busy?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  size?: 'md' | 'lg';
  initial?: string;
  /** Tells the page when there is text, so the orb above can react. */
  onTyping?: (typing: boolean) => void;
  className?: string;
  /** Tells the page while a voice message is being recorded, so Dr.AI can listen. */
  onVoice?: (recording: boolean) => void;
  /** 'box' (everywhere since 29 Oct): a plain white box, the words over a row of the portal's buttons
   *  (Attach, Send), no mascot. 'round': the earlier glass pill with the mascot, the plus and the mic. */
  look?: 'round' | 'box';
}

const ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.key,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp,.svg,.zip';

const SAMPLE_VOICE = 'For the Riyadh opening I’d like a short teaser video, something we can post the week before, with the new store front and a few local creators.';

const sizeLabel = (kb: number) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);

/** The prompt box (after the Copilot reference). Spark's mascot sits in front of
 *  the text. Empty: attach + mic. With text: the edge
 *  lights up, the box grows (up to ~8 lines) and the mic turns into a send
 *  button. Files can be attached with the plus or dropped onto
 *  the box; the prototype keeps only name and size. */
export function Composer({ onSubmit, busy, placeholder: placeholderIn, autoFocus, size = 'md', initial = '', onTyping, onVoice, className, look = 'box' }: Props) {
  const box = look === 'box';
  // The assistant's name (5 Nov): Dr.AI when he's on, Spark AI otherwise. Spark alone is the studio.
  const drai = useDrAi();
  const who = drai ? 'Dr.AI' : 'Spark AI';
  const placeholder = placeholderIn ?? (drai ? 'Ask Dr.AI anything…' : 'Ask Spark anything…');
  const [value, setValue] = useState(initial);
  const [files, setFiles] = useState<Attachment[]>([]);
  const [focus, setFocus] = useState(false);
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  // Voice (prototype, 5 Nov): the mic records (shown as a live wave and a timer); done turns it into text in the
  // box, to read over and send. Nothing is really recorded: the words are a sample.
  const [rec, setRec] = useState(false);
  const [secs, setSecs] = useState(0);
  const [wave, setWave] = useState<number[]>(() => Array(64).fill(0.15));
  useEffect(() => onVoice?.(rec), [rec, onVoice]);
  useEffect(() => {
    if (!rec) return;
    setSecs(0);
    const t0 = performance.now();
    let level = 0.4;
    const id = window.setInterval(() => {
      setSecs(Math.floor((performance.now() - t0) / 1000));
      // A speaking voice: loud runs and short pauses.
      level = Math.max(0.08, Math.min(1, level + (Math.random() - 0.5) * 0.5));
      const pause = Math.random() < 0.12;
      setWave((w) => [...w.slice(1), pause ? 0.08 : 0.15 + level * (0.4 + Math.random() * 0.6)]);
    }, 90);
    return () => window.clearInterval(id);
  }, [rec]);
  const stopRec = (keep: boolean) => {
    setRec(false);
    setWave(Array(64).fill(0.15));
    if (!keep) return;
    const words = SAMPLE_VOICE;
    let i = 0;
    const id = window.setInterval(() => {
      i += 3;
      setValue(i >= words.length ? words : words.slice(0, i));
      if (i >= words.length) {
        window.clearInterval(id);
        ref.current?.focus();
      }
    }, 18);
  };

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Empty: one line. Measuring here could run before the text column has its
    // width, and the wrapped placeholder would lock the box at full height.
    if (!value) {
      el.style.height = '';
      el.style.overflowY = 'hidden';
      return;
    }
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    el.style.overflowY = el.scrollHeight > 200 ? 'auto' : 'hidden';
  }, [value]);

  const add = (list: FileList | null) => {
    if (!list?.length) return;
    const next = [...list].map((f) => ({ name: f.name, sizeKb: Math.max(1, Math.round(f.size / 1024)) }));
    setFiles((cur) => [...cur, ...next.filter((n) => !cur.some((c) => c.name === n.name))]);
    ref.current?.focus();
  };

  const typing = !!value.trim();
  useEffect(() => onTyping?.(typing), [typing, onTyping]);

  const canSend = (typing || files.length > 0) && !busy;
  const send = () => {
    if (!canSend) return;
    onSubmit(value.trim(), files);
    setValue('');
    setFiles([]);
  };

  return (
    <div
      className={cx('composer', `composer--${size}`, box && 'composer--box', className, focus && 'is-focus', rec && 'is-recording', (typing || files.length > 0) && 'is-typing', busy && 'is-busy', drag && 'is-drag')}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes('Files')) return;
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrag(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        add(e.dataTransfer.files);
      }}
    >
      {files.length > 0 && (
        <ul className="composer__files" aria-label="Attached files">
          {files.map((f) => (
            <li key={f.name} className="attach-chip">
              <FileIcon kind={kindOf(f.name)} size={15} />
              <span className="attach-chip__name">{f.name}</span>
              <span className="attach-chip__size">{sizeLabel(f.sizeKb)}</span>
              <button className="attach-chip__remove" onClick={() => setFiles((cur) => cur.filter((c) => c.name !== f.name))} aria-label={`Remove ${f.name}`}>
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="composer__row">
        {/* Spark's mascot at the start of the box. */}
        {!box && <Mascot size={26} className="composer__orb" />}
        <div className="composer__field">
          {rec && (
            <div className="composer__rec" role="status" aria-live="polite">
              <span className="composer__recdot" aria-hidden />
              <span className="composer__reclabel">Listening…</span>
              <span className="composer__wave" aria-hidden>
                {wave.map((h, i) => (
                  <i key={i} style={{ transform: `scaleY(${h})` }} />
                ))}
              </span>
              <span className="composer__time mono">
                {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
              </span>
            </div>
          )}
          <textarea
            hidden={rec}
            ref={ref}
            rows={box ? 2 : 1}
            value={value}
            placeholder={placeholder}
            aria-label={`Message ${who}`}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onChange={(e) => setValue(e.target.value)}
            onPaste={(e) => {
              if (e.clipboardData.files.length) {
                e.preventDefault();
                add(e.clipboardData.files);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
          />
        </div>
      </div>
      <input
        ref={picker}
        type="file"
        multiple
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          add(e.target.files);
          e.target.value = '';
        }}
      />
      {box ? (
        <div className="composer__bar">
          <Button size="sm" icon={Paperclip} onClick={() => picker.current?.click()} title="Attach documents or images">
            Attach
          </Button>
          <span className="composer__spacer" />
          {rec ? (
            <>
              <button type="button" className="composer__mic composer__mic--cancel" onClick={() => stopRec(false)} aria-label="Cancel recording" data-tip="Cancel">
                <X size={17} strokeWidth={1.9} />
              </button>
              <button type="button" className="composer__recdone" onClick={() => stopRec(true)} aria-label="Done, turn into text" data-tip="Done">
                <Check size={18} strokeWidth={2.2} />
              </button>
            </>
          ) : (
            <>
              <button type="button" className="composer__mic" onClick={() => setRec(true)} aria-label="Record a voice message" data-tip="Speak" disabled={busy}>
                <Mic size={17} strokeWidth={1.8} />
              </button>
              {/* Send as a round icon, after the reference (30 Oct): Ink when there is something to send, faint before. */}
              <Button variant="primary" size="sm" icon={ArrowUp} className="composer__go" onClick={send} disabled={!canSend} aria-label={busy ? `${who} is answering` : 'Send'} />
            </>
          )}
        </div>
      ) : (
        <div className="composer__bar">
          <span className="composer__spacer" />
          <button className="composer__icon" onClick={() => picker.current?.click()} aria-label="Attach files" title="Attach documents or images">
            <Plus size={22} strokeWidth={1.6} />
          </button>
          {busy ? (
            <button className="composer__send is-busy" disabled aria-label={`${who} is answering`}>
              <Square size={12} fill="currentColor" />
            </button>
          ) : canSend ? (
            <button className="composer__send" onClick={send} aria-label="Send">
              <ArrowUp size={18} strokeWidth={2.2} />
            </button>
          ) : (
            <button className="composer__icon" aria-label="Voice input" title="Voice input">
              <Mic size={21} strokeWidth={1.6} />
            </button>
          )}
        </div>
      )}
      {drag && <div className="composer__drop">Drop files to attach</div>}
    </div>
  );
}

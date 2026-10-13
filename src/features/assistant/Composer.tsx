import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Mic, Plus, Square, X } from 'lucide-react';
import { cx } from '../../components/ui/primitives';
import { FileIcon, kindOf } from '../../components/domain';
import { FluidOrb } from '../../components/ui/FluidOrb';
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
}

const ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.key,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp,.svg,.zip';

const sizeLabel = (kb: number) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);

/** The prompt box (after the Copilot reference). The orb sits in front of
 *  the text. Empty: attach + mic. With text: the edge
 *  lights up, the box grows (up to ~8 lines), the mic turns into a send button
 *  and the orb speeds up. Files can be attached with the plus or dropped onto
 *  the box; the prototype keeps only name and size. */
export function Composer({ onSubmit, busy, placeholder = 'Message Spark AI', autoFocus, size = 'md', initial = '', onTyping, className }: Props) {
  const [value, setValue] = useState(initial);
  const [files, setFiles] = useState<Attachment[]>([]);
  const [focus, setFocus] = useState(false);
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLInputElement>(null);

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
      className={cx('composer', `composer--${size}`, className, focus && 'is-focus', (typing || files.length > 0) && 'is-typing', busy && 'is-busy', drag && 'is-drag')}
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
        <FluidOrb size={26} active={typing || busy} className="composer__orb" />
        <div className="composer__field">
          <textarea
            ref={ref}
            rows={1}
            value={value}
            placeholder={placeholder}
            aria-label="Message Spark AI"
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
      <div className="composer__bar">
        <span className="composer__spacer" />
        <button className="composer__icon" onClick={() => picker.current?.click()} aria-label="Attach files" title="Attach documents or images">
          <Plus size={22} strokeWidth={1.6} />
        </button>
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
        {busy ? (
          <button className="composer__send is-busy" disabled aria-label="Spark AI is answering">
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
      {drag && <div className="composer__drop">Drop files to attach</div>}
    </div>
  );
}

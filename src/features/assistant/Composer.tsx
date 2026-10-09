import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Paperclip, Square, X } from 'lucide-react';
import { cx } from '../../components/ui/primitives';
import { FileIcon, kindOf } from '../../components/domain';
import type { Attachment } from '../../data/types';

interface Props {
  onSubmit: (text: string, attachments: Attachment[]) => void;
  busy?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  size?: 'md' | 'lg';
  initial?: string;
}

const ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.key,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp,.svg,.zip';

const sizeLabel = (kb: number) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);

/** The prompt box. It glows only while focused or while the assistant works:
 *  the accent glow is reserved for AI moments. Files can be attached with the
 *  paperclip or dropped onto the box; the prototype keeps only name and size. */
export function Composer({ onSubmit, busy, placeholder = 'Ask about your brand, or attach files to work with…', autoFocus, size = 'md', initial = '' }: Props) {
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

  const canSend = (!!value.trim() || files.length > 0) && !busy;
  const send = () => {
    if (!canSend) return;
    onSubmit(value.trim(), files);
    setValue('');
    setFiles([]);
  };

  return (
    <div
      className={cx('composer', `composer--${size}`, (focus || busy) && 'is-lit', focus && !!value.trim() && 'is-typing', busy && 'is-busy', drag && 'is-drag')}
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
      <textarea
        ref={ref}
        rows={1}
        value={value}
        placeholder={placeholder}
        aria-label="Message the assistant"
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
      <div className="composer__bar">
        <div className="composer__footer">
          <button className="composer__attach" onClick={() => picker.current?.click()} aria-label="Attach files" title="Attach documents or images">
            <Paperclip size={16} />
            <span>Attach</span>
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
        </div>
        <button className="composer__send" onClick={send} disabled={!canSend} aria-label={busy ? 'Assistant is answering' : 'Send'}>
          {busy ? <Square size={12} fill="currentColor" /> : <ArrowUp size={17} strokeWidth={2.2} />}
        </button>
      </div>
      {drag && <div className="composer__drop">Drop files to attach</div>}
    </div>
  );
}

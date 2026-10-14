import { Fragment, useState } from 'react';
import { AlertCircle, ArrowRight, Check, Heart, ChevronDown, Copy, Globe, Inbox, Loader2, RotateCcw, FileText } from 'lucide-react';
import type { Message, Source, Visual } from '../../data/types';
import { Button, cx } from '../../components/ui/primitives';
import { FluidOrb } from '../../components/ui/FluidOrb';
import { FileIcon, kindOf } from '../../components/domain';
import { personById, useStore } from '../../state/store';
import { useUI } from '../../state/ui';
import { useToast } from '../../components/ui/toast';
import { navigate } from '../../lib/router';
import { fmtTime } from '../../lib/format';

/** Tiny formatter: paragraphs and **bold**. Enough for scripted answers. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i}>
          {para.split(/(\*\*[^*]+\*\*)/).map((chunk, j) =>
            chunk.startsWith('**') && chunk.endsWith('**') ? <strong key={j}>{chunk.slice(2, -2)}</strong> : <Fragment key={j}>{chunk}</Fragment>,
          )}
        </p>
      ))}
    </>
  );
}

interface Props {
  msg: Message;
  convId: string;
  /** Omitted for read-only chats (a teammate's), which hides follow-ups. */
  onFollowUp?: (q: string) => void;
  isLast: boolean;
}

export function MessageView({ msg, convId, onFollowUp, isLast }: Props) {
  const { state, me } = useStore();
  if (msg.role === 'system')
    return (
      <div className="msg-system">
        <Inbox size={14} />
        <span>{msg.text}</span>
        {msg.link && (
          <a className="link" href={'#' + msg.link.route}>
            {msg.link.label}
          </a>
        )}
      </div>
    );
  if (msg.role === 'user') {
    const by = msg.by ? personById(state, msg.by) : undefined;
    return (
      <div className="msg-user">
        {msg.attachments && (
          <ul className="msg-user__files" aria-label="Attached files">
            {msg.attachments.map((f) => (
              <li key={f.name} className="attach-chip">
                <FileIcon kind={kindOf(f.name)} size={15} />
                <span className="attach-chip__name">{f.name}</span>
              </li>
            ))}
          </ul>
        )}
        {msg.text && <div className="msg-user__bubble">{msg.text}</div>}
        {by && (
          <div className="msg-user__meta">
            {by.id === me.id ? 'You' : by.name.split(' ')[0]} · {fmtTime(msg.at)}
          </div>
        )}
      </div>
    );
  }
  return <AssistantMessage msg={msg} convId={convId} onFollowUp={onFollowUp} isLast={isLast} />;
}

function AssistantMessage({ msg, convId, onFollowUp, isLast }: Props) {
  const { actions } = useStore();
  const { openRequest, openDoc } = useUI();
  const toast = useToast();
  const [stepsOpen, setStepsOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const working = msg.state === 'thinking' || msg.state === 'streaming';
  const sources = msg.sources ?? [];

  // Workspace sources open in place; web sources are sample data, so the chip's tooltip is all there is.
  const openSource = (s: Source) => {
    if (s.docId) openDoc(s.docId);
    else if (s.route) navigate(s.route);
  };

  return (
    <div className="msg-ai">
      <div className={cx('msg-ai__avatar', working && 'is-working')}>
        <FluidOrb size={30} active={working} />
      </div>
      <div className="msg-ai__body">
        {/* Research steps: live while working, collapsible once done */}
        {msg.state === 'thinking' ? (
          <div className="steps steps--live" aria-live="polite">
            {(msg.steps ?? []).map((s, i, arr) => (
              <div key={i} className="steps__item">
                {i === arr.length - 1 ? <Loader2 size={13} className="spin" /> : <Check size={13} />}
                <span className={cx(i === arr.length - 1 && 'shimmer-text')}>{s}</span>
              </div>
            ))}
            {(msg.steps ?? []).length === 0 && (
              <div className="steps__item">
                <Loader2 size={13} className="spin" />
                <span className="shimmer-text">Thinking…</span>
              </div>
            )}
          </div>
        ) : (
          msg.steps &&
          msg.steps.length > 0 && (
            <button className="steps-toggle" onClick={() => setStepsOpen((o) => !o)} aria-expanded={stepsOpen}>
              {msg.state === 'error' ? 'Stopped' : 'Researched'} {msg.steps.length} step{msg.steps.length > 1 ? 's' : ''}
              {msg.durationMs ? ` · ${(msg.durationMs / 1000).toFixed(1)}s` : ''}
              <ChevronDown size={13} className={cx(stepsOpen && 'rot')} />
            </button>
          )
        )}
        {stepsOpen && msg.state !== 'thinking' && (
          <div className="steps">
            {msg.steps!.map((s, i) => (
              <div key={i} className="steps__item">
                <Check size={13} />
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}

        {msg.state === 'error' && (
          <div className="msg-error" role="alert">
            <AlertCircle size={16} />
            <div>
              <div className="msg-error__title">Spark AI couldn't finish this answer</div>
              <div className="muted">The research service didn't respond. Your question is saved; try again.</div>
            </div>
            <Button size="sm" icon={RotateCcw} onClick={() => actions.retry(convId, msg.id)}>
              Retry
            </Button>
          </div>
        )}

        {msg.text && (
          <div className={cx('msg-ai__text', msg.state === 'streaming' && 'is-streaming')}>
            <RichText text={msg.text} />
          </div>
        )}

        {/* Key findings as a plain list: bold lead, then the detail. */}
        {msg.state === 'done' && (msg.findings?.length ?? 0) > 0 && (
          <ul className="findings-list">
            {msg.findings!.map((f, i) => (
              <li key={i}>
                <strong>{f.title}.</strong> {f.body}
              </li>
            ))}
          </ul>
        )}

        {msg.state === 'done' && msg.visuals && msg.visuals.length > 0 && <Visuals convId={convId} msg={msg} readOnly={!onFollowUp} />}

        {msg.state === 'done' && (
          <>
          {/* Sources grouped behind one "Sources" button; the list opens on click,
              each source shows its excerpt on hover. */}
          {sources.length > 0 && (
            <div className="sources">
              <button className="sources__toggle" onClick={() => setSourcesOpen((o) => !o)} aria-expanded={sourcesOpen}>
                Sources · {sources.length}
                <ChevronDown size={13} className={cx(sourcesOpen && 'rot')} />
              </button>
              {sourcesOpen && (
                <div className="src-chips">
                  {sources.map((s) => {
                    const I = s.kind === 'web' ? Globe : FileText;
                    return (
                      <button key={s.id} className="src-chip" onClick={() => openSource(s)} data-tip={s.kind === 'web' ? `${s.domain} · ${s.snippet}` : s.snippet}>
                        <I size={13} /> {s.title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <div className="msg-actions">
            <Button
              size="sm"
              variant={isLast ? 'primary' : 'secondary'}
              icon={Inbox}
              onClick={() =>
                openRequest({
                  conversationId: convId,
                  focusMessageId: msg.id,
                  title: msg.suggestedRequest?.title,
                  type: msg.suggestedRequest?.type,
                })
              }
            >
              Request proposal
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={Copy}
              aria-label="Copy answer"
              data-tip="Copy"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(msg.text.replace(/\*\*/g, ''));
                  toast({ title: 'Answer copied' });
                } catch {
                  toast({ title: "Couldn't copy", tone: 'error' });
                }
              }}
            />
          </div>
          </>
        )}

        {msg.state === 'done' && isLast && onFollowUp && msg.followUps && msg.followUps.length > 0 && (
          <div className="followups">
            {msg.followUps.map((q) => (
              <button key={q} className="followup" onClick={() => onFollowUp(q)}>
                <ArrowRight size={12} />
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Sample visual directions: a rough mark on the palette, the swatches, and
 *  a "Like" toggle so the client can say which direction they prefer. */
function Visuals({ convId, msg, readOnly }: { convId: string; msg: Message; readOnly: boolean }) {
  const { actions } = useStore();
  return (
    <div className="visuals">
      {msg.visuals!.map((v) => (
        <div key={v.id} className="visual-wrap">
          <figure className={cx('visual', v.liked && 'is-liked')}>
            <VisualArt v={v} />
            <figcaption className="visual__body">
              <span className="visual__name">{v.name}</span>
              <p className="visual__note">{v.note}</p>
              <div className="visual__swatches">
                {v.colors.map((c) => (
                  <span key={c.hex} className="visual__swatch" data-tip={`${c.name} ${c.hex}`}>
                    <i style={{ background: c.hex }} />
                    {c.name}
                  </span>
                ))}
              </div>
            </figcaption>
          </figure>
          <button
            className={cx('visual__like', v.liked && 'is-on')}
            onClick={() => actions.toggleVisualLike(convId, msg.id, v.id)}
            aria-pressed={!!v.liked}
            aria-label={v.liked ? `Unlike ${v.name}` : `Like ${v.name}`}
            data-tip={v.liked ? 'Liked' : 'Like'}
            disabled={readOnly}
          >
            <Heart size={16} fill={v.liked ? 'currentColor' : 'none'} />
          </button>
        </div>
      ))}
    </div>
  );
}

function VisualArt({ v }: { v: Visual }) {
  const [bg, accent, detail] = v.colors.map((c) => c.hex);
  const mark =
    v.shape === 'circle' ? (
      <circle cx="160" cy="92" r="46" fill={accent} />
    ) : v.shape === 'arch' ? (
      <path d="M114 138 V92 a46 46 0 0 1 92 0 V138 Z" fill={accent} />
    ) : (
      <path d="M160 40 L212 92 L160 144 L108 92 Z" fill={accent} />
    );
  return (
    <svg className="visual__art" viewBox="0 0 320 200" role="img" aria-label={`${v.name} sketch`}>
      <rect width="320" height="200" fill={bg} />
      <rect y="168" width="320" height="32" fill={detail} opacity="0.9" />
      {mark}
      <text x="160" y="104" textAnchor="middle" fontFamily="Archivo, Inter, sans-serif" fontWeight="800" fontSize="34" fill={bg}>
        B
      </text>
      <text x="160" y="160" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" letterSpacing="3" fill={accent}>
        BRAND CO. · RIYADH
      </text>
    </svg>
  );
}

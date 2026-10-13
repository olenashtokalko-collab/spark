import { Fragment, useState } from 'react';
import { AlertCircle, ArrowRight, Check, ChevronDown, Copy, Globe, Inbox, Loader2, RotateCcw, FileText } from 'lucide-react';
import type { Message, Source } from '../../data/types';
import { Button, cx } from '../../components/ui/primitives';
import { DotSphere } from '../../components/ui/DotSphere';
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
  const working = msg.state === 'thinking' || msg.state === 'streaming';
  const sources = msg.sources ?? [];

  // Workspace sources open in place; web sources are sample data, so the chip's tooltip is all there is.
  const openSource = (s: Source) => {
    if (s.docId) openDoc(s.docId);
    else if (s.route) navigate(s.route);
  };

  return (
    <div className="msg-ai">
      <div className="msg-ai__avatar">
        <DotSphere size={30} density={90} active={working} />
      </div>
      <div className="msg-ai__body">
        {/* Research steps: live while working, collapsible once done */}
        {msg.state === 'thinking' ? (
          <div className="steps steps--live" aria-live="polite">
            {(msg.steps ?? []).map((s, i, arr) => (
              <div key={i} className="steps__item">
                {i === arr.length - 1 ? <Loader2 size={13} className="spin" /> : <Check size={13} />}
                <span>{s}</span>
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

        {msg.state === 'done' && (
          <>
          {/* Sources as small file chips; the excerpt shows on hover. */}
          {sources.length > 0 && (
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
              Create request
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
                <ArrowRight size={13} />
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { Fragment, useState, type ReactNode } from 'react';
import { AlertCircle, ArrowRight, Check, ChevronDown, Copy, Globe, Inbox, Loader2, RotateCcw, FileText, LayoutGrid } from 'lucide-react';
import type { Message, Source } from '../../data/types';
import { Button, cx } from '../../components/ui/primitives';
import { DotSphere } from '../../components/ui/DotSphere';
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
  onFollowUp: (q: string) => void;
  isLast: boolean;
}

export function MessageView({ msg, convId, onFollowUp, isLast }: Props) {
  const { state } = useStore();
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
        <div className="msg-user__bubble">{msg.text}</div>
        {by && (
          <div className="msg-user__meta">
            {by.name.split(' ')[0]} · {fmtTime(msg.at)}
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
  const [flash, setFlash] = useState<string | null>(null);
  const working = msg.state === 'thinking' || msg.state === 'streaming';
  const sources = msg.sources ?? [];
  const num = (id: string) => sources.findIndex((s) => s.id === id) + 1;

  const openSource = (s: Source) => {
    if (s.docId) openDoc(s.docId);
    else if (s.route) navigate(s.route);
    else {
      setFlash(s.id);
      setTimeout(() => setFlash(null), 1200);
    }
  };
  const cite = (id: string) => {
    const s = sources.find((x) => x.id === id);
    if (!s) return;
    document.getElementById(`src-${msg.id}-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    setFlash(id);
    setTimeout(() => setFlash(null), 1200);
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
              <div className="msg-error__title">The assistant couldn't finish this answer</div>
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

        {msg.state === 'done' && (msg.findings?.length ?? 0) > 0 && (
          <div className="findings">
            {msg.findings!.map((f, i) => (
              <div key={i} className={cx('finding', `finding--${f.tone}`)} style={{ animationDelay: `${i * 60}ms` }}>
                <span className="finding__mark" />
                <div className="finding__body">
                  <div className="finding__title">{f.title}</div>
                  <div className="finding__text">
                    {f.body}
                    {f.sourceIds
                      .filter((id) => num(id) > 0)
                      .map((id) => (
                        <button key={id} className="cite" onClick={() => cite(id)} aria-label={`Source ${num(id)}`}>
                          {num(id)}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {msg.state === 'done' && sources.length > 0 && (
          <div className="sources">
            <div className="sources__head">
              <span className="eyebrow">Sources</span>
              <span className="faint mono">
                {sources.filter((s) => s.kind === 'workspace').length} workspace · {sources.filter((s) => s.kind === 'web').length} web
              </span>
            </div>
            <div className="sources__list">
              {sources.map((s, i) => (
                <SourceCard key={s.id} s={s} n={i + 1} id={`src-${msg.id}-${s.id}`} flash={flash === s.id} onOpen={() => openSource(s)} />
              ))}
            </div>
          </div>
        )}

        {msg.state === 'done' && (
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
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(msg.text.replace(/\*\*/g, ''));
                  toast({ title: 'Answer copied' });
                } catch {
                  toast({ title: "Couldn't copy", tone: 'error' });
                }
              }}
            >
              Copy
            </Button>
          </div>
        )}

        {msg.state === 'done' && isLast && msg.followUps && msg.followUps.length > 0 && (
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

function SourceCard({ s, n, id, flash, onOpen }: { s: Source; n: number; id: string; flash: boolean; onOpen: () => void }) {
  const Icon = s.kind === 'web' ? Globe : s.docId ? FileText : LayoutGrid;
  const body: ReactNode = (
    <>
      <span className="source__n">{n}</span>
      <span className="source__main">
        <span className="source__title">
          <Icon size={12} />
          {s.title}
        </span>
        <span className="source__snippet">{s.snippet}</span>
        <span className="source__kind">{s.kind === 'web' ? s.domain : 'Your workspace'}</span>
      </span>
    </>
  );
  return (
    <button id={id} className={cx('source', `source--${s.kind}`, flash && 'is-flash')} onClick={onOpen} title={s.kind === 'web' ? 'Web source (sample data in this prototype)' : 'Open in workspace'}>
      {body}
    </button>
  );
}

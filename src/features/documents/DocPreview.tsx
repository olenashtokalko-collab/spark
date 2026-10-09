import { useEffect, useState } from 'react';
import { Check, Download, Inbox, Link2, MessageSquareText, Sparkles, X } from 'lucide-react';
import { Dialog } from '../../components/ui/overlay';
import { Avatar, Badge, Button, Textarea } from '../../components/ui/primitives';
import { Art, FileIcon, kindLabel } from '../../components/domain';
import { useToast } from '../../components/ui/toast';
import { personById, useStore } from '../../state/store';
import type { Doc } from '../../data/types';
import { dueLabel, fmtDate, fmtDateTime, fmtRelative, fmtSize } from '../../lib/format';
import { navigate } from '../../lib/router';

export function downloadDoc(doc: Doc) {
  // The prototype has no file storage, so it exports a faithful copy of the
  // preview (HTML / SVG / CSV). Real storage would stream the original file.
  const base = doc.name.replace(/\.[a-z0-9]+$/i, '');
  const p = doc.preview;
  let blob: Blob;
  let name: string;
  if (p.type === 'pages') {
    const html = `<!doctype html><meta charset="utf-8"><title>${base}</title><body style="font-family:system-ui;max-width:720px;margin:40px auto;line-height:1.6">${p.pages
      .map((pg) => `<h2>${pg.heading}</h2>${pg.body.map((b) => `<p>${b}</p>`).join('')}`)
      .join('<hr>')}</body>`;
    blob = new Blob([html], { type: 'text/html' });
    name = `${base}.html`;
  } else if (p.type === 'table') {
    const csv = [p.columns, ...p.rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    blob = new Blob([csv], { type: 'text/csv' });
    name = `${base}.csv`;
  } else if (p.type === 'art') {
    const svg = document.querySelector(`[data-doc-art="${doc.id}"] svg`)?.outerHTML;
    blob = new Blob([svg ?? '<svg xmlns="http://www.w3.org/2000/svg"/>'], { type: 'image/svg+xml' });
    name = `${base}.svg`;
  } else {
    const list = p.type === 'files' ? p.files.map((f) => `${f.name}\t${f.size}`).join('\n') : '';
    blob = new Blob([`${doc.name}\n\n${list || 'Original file is stored with Spark.'}\n`], { type: 'text/plain' });
    name = `${base}.txt`;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return name;
}

export function DocPreviewDialog({ docId, onClose }: { docId: string | null; onClose: () => void }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const doc = docId ? state.docs.find((d) => d.id === docId) : undefined;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docId) return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, [docId]);

  if (!doc) return null;
  const by = personById(state, doc.uploadedBy);
  const folder = state.folders.find((f) => f.id === doc.folderId);
  const req = doc.requestId ? state.requests.find((r) => r.id === doc.requestId) : undefined;

  const ask = () => {
    const id = actions.ask(null, `What should I know about ${doc.name}?`, { docId: doc.id });
    onClose();
    navigate(`/assistant/${id}`);
  };

  return (
    <Dialog open={!!doc} onClose={onClose} size="xl" bare>
      <div className="preview">
        <div className="preview__stage" data-doc-art={doc.id}>
          <div className="preview__bar">
            <FileIcon kind={doc.kind} size={16} />
            <span className="preview__name">{doc.name}</span>
            <button className="btn btn--ghost btn--sm btn--icon preview__close-m" onClick={onClose} aria-label="Close preview">
              <X size={16} />
            </button>
          </div>
          <div className="preview__canvas">{loading ? <PreviewSkeleton /> : <PreviewBody doc={doc} />}</div>
        </div>
        <aside className="preview__side">
          <div className="preview__side-head">
            <Badge>{kindLabel[doc.kind]}</Badge>
            <button className="btn btn--ghost btn--sm btn--icon" onClick={onClose} aria-label="Close preview">
              <X size={16} />
            </button>
          </div>
          <h2 className="preview__title">{doc.name}</h2>
          {doc.summary && <p className="preview__summary">{doc.summary}</p>}
          <div className="preview__actions">
            <Button
              variant="primary"
              icon={Download}
              onClick={() => {
                const n = downloadDoc(doc);
                toast({ title: 'Download started', body: `${n} (a preview copy in this prototype)` });
              }}
            >
              Download
            </Button>
            <Button icon={Sparkles} onClick={ask}>
              Ask about this file
            </Button>
            <Button
              variant="ghost"
              icon={Link2}
              aria-label="Copy link"
              onClick={async () => {
                const url = `${location.origin}${location.pathname}#/documents/${doc.folderId}?doc=${doc.id}`;
                try {
                  await navigator.clipboard.writeText(url);
                  toast({ title: 'Link copied', body: 'Only workspace members can open it.' });
                } catch {
                  toast({ title: "Couldn't copy the link", body: 'Your browser blocked clipboard access.', tone: 'error' });
                }
              }}
            />
          </div>
          <dl className="meta-list">
            <dt>Shared by</dt>
            <dd>
              <Avatar person={by} size={20} /> {by.name}
              {by.org === 'spark' && <span className="faint"> · Spark</span>}
            </dd>
            <dt>Date</dt>
            <dd>{fmtDateTime(doc.uploadedAt)}</dd>
            <dt>Size</dt>
            <dd>{fmtSize(doc.sizeKb)}</dd>
            {doc.version && (
              <>
                <dt>Version</dt>
                <dd>v{doc.version}</dd>
              </>
            )}
            <dt>Folder</dt>
            <dd>
              <a
                className="link"
                href={`#/documents/${doc.folderId}`}
                onClick={() => onClose()}
              >
                {folder?.name}
              </a>
            </dd>
            {req && (
              <>
                <dt>Request</dt>
                <dd>
                  <a className="link" href={`#/requests/${req.id}`} onClick={() => onClose()}>
                    <Inbox size={13} /> {req.id} · {req.title}
                  </a>
                </dd>
              </>
            )}
          </dl>
          {doc.review && <ReviewPanel doc={doc} />}
        </aside>
      </div>
    </Dialog>
  );
}

function ReviewPanel({ doc }: { doc: Doc }) {
  const { state, me, actions } = useStore();
  const toast = useToast();
  const [text, setText] = useState('');
  const r = doc.review!;
  const asker = personById(state, r.requestedBy);
  const send = (complete: boolean) => {
    if (!text.trim()) return;
    actions.sendDocFeedback(doc.id, text.trim(), complete);
    setText('');
    toast({ title: complete ? 'Feedback sent and marked as reviewed' : 'Feedback sent', body: `${asker.name} has been notified.` });
  };
  return (
    <section className="review">
      <div className="review__head">
        <MessageSquareText size={15} />
        <span>Feedback requested</span>
        {r.status === 'open' ? <Badge tone="warning">{dueLabel(r.due)}</Badge> : <Badge tone="positive">Reviewed</Badge>}
      </div>
      <div className="review__note">
        <Avatar person={asker} size={22} />
        <div>
          <span className="review__who">{asker.name}</span>
          <p>{r.note}</p>
        </div>
      </div>
      {r.feedback.map((f) => {
        const p = personById(state, f.by);
        return (
          <div key={f.id} className="review__note">
            <Avatar person={p} size={22} />
            <div>
              <span className="review__who">
                {p.name} <span className="faint">· {fmtRelative(f.at)}</span>
              </span>
              <p>{f.text}</p>
            </div>
          </div>
        );
      })}
      {me.org === 'client' && r.status === 'open' && (
        <div className="review__form">
          <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Desert Bloom, but with the Night Market lanterns on the gift box." aria-label="Your feedback" />
          <div className="review__btns">
            <Button size="sm" variant="ghost" onClick={() => send(false)} disabled={!text.trim()}>
              Send
            </Button>
            <Button size="sm" variant="primary" icon={Check} onClick={() => send(true)} disabled={!text.trim()}>
              Send & mark reviewed
            </Button>
          </div>
        </div>
      )}
      {r.status === 'open' && <div className="faint review__due">Due {fmtDate(r.due, { weekday: true })}</div>}
    </section>
  );
}

function PreviewSkeleton() {
  return (
    <div className="paper paper--skeleton">
      <span className="skeleton" style={{ width: '60%', height: 22 }} />
      {[92, 84, 88, 70, 90, 50].map((w, i) => (
        <span key={i} className="skeleton" style={{ width: `${w}%`, height: 12, marginTop: 12 }} />
      ))}
    </div>
  );
}

function PreviewBody({ doc }: { doc: Doc }) {
  const p = doc.preview;
  if (p.type === 'pages')
    return (
      <div className="paper-stack">
        {p.pages.map((pg, i) => (
          <article key={i} className="paper">
            <span className="paper__num mono">
              {i + 1} / {p.pages.length}
            </span>
            <h3 className={i === 0 ? 'paper__cover' : 'paper__h'}>{pg.heading}</h3>
            {pg.body.map((b, j) => (
              <p key={j}>{b}</p>
            ))}
          </article>
        ))}
      </div>
    );
  if (p.type === 'art')
    return (
      <div className="preview__art">
        <Art preview={p} />
      </div>
    );
  if (p.type === 'table')
    return (
      <div className="paper paper--table">
        <table className="table">
          <thead>
            <tr>
              {p.columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className={j > 0 ? 'num' : ''}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  if (p.type === 'files')
    return (
      <div className="paper paper--files">
        <div className="eyebrow">{p.files.length} files in archive</div>
        {p.files.map((f) => (
          <div key={f.name} className="zip-row">
            <span>{f.name}</span>
            <span className="faint mono">{f.size}</span>
          </div>
        ))}
      </div>
    );
  return (
    <div className="preview__none">
      <FileIcon kind={doc.kind} size={34} />
      <div>No preview for this file yet</div>
      <div className="faint">Download it to open on your device.</div>
    </div>
  );
}

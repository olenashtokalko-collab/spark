import { Fragment, useEffect, useState } from 'react';
import { Download, X, PenLine } from 'lucide-react';
import { Dialog } from '../../components/ui/overlay';
import { Avatar, Badge, Button, Textarea } from '../../components/ui/primitives';
import { Art, FileIcon, kindLabel } from '../../components/domain';
import { useToast } from '../../components/ui/toast';
import { personById, useStore } from '../../state/store';
import type { Doc } from '../../data/types';
import { dueLabel, fmtDateTime, fmtRelative, fmtSize } from '../../lib/format';
import { navigate } from '../../lib/router';
import { SparkDisc } from '../../components/ui/BrandSpark';

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
  const chat = doc.chatId ? state.conversations.find((c) => c.id === doc.chatId) : undefined;
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
            <span className="preview__head-acts">
              <Button
                variant="ghost"
                size="sm"
                icon={Download}
                aria-label="Download"
                data-tip="Download"
                onClick={() => {
                  const n = downloadDoc(doc);
                  toast({ title: 'Download started', body: `${n} (a preview copy in this prototype)` });
                }}
              />
            <button className="btn btn--ghost btn--sm btn--icon" onClick={onClose} aria-label="Close preview">
              <X size={16} />
            </button>
            </span>
          </div>
          <h2 className="preview__title">{doc.name}</h2>
          {doc.summary && <p className="preview__summary">{doc.summary}</p>}
          <div className="preview__actions">
            {/* The same Ask Spark button as on Home: the mascot in a white pill with a hairline. */}
            <button type="button" className="hl-mchat preview__ask" onClick={ask}>
              <SparkDisc size={28} />
              Ask Spark about this file
            </button>
          </div>
          <dl className="meta-list">
            <dt>Shared by</dt>
            <dd>
              <Avatar person={by} size={20} /> {by.name}
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
            {chat && (
              <>
                <dt>Added in</dt>
                <dd>
                  <a className="link" href={`#/assistant/${chat.id}`} onClick={() => onClose()}>
                    {chat.title}
                  </a>
                </dd>
              </>
            )}
            {req && (
              <>
                <dt>Request</dt>
                <dd>
                  <a className="link" href={`#/requests/${req.id}`} onClick={() => onClose()}>
                    {req.id} · {req.title}
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
  const [changesOpen, setChangesOpen] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const r = doc.review!;
  const asker = personById(state, r.requestedBy);
  const decider = r.decision ? personById(state, r.decision.by) : undefined;

  const approve = () => {
    actions.reviewDoc(doc.id, 'approved', '');
    toast({ title: 'File approved', body: `${asker.name} has been notified.` });
  };
  const requestChanges = () => {
    if (!text.trim()) return setError('Say what should change.');
    actions.reviewDoc(doc.id, 'changes_requested', text.trim());
    setChangesOpen(false);
    setText('');
    toast({ title: 'Changes requested', body: `${asker.name} has been notified.` });
  };

  return (
    <section className="decision review-card">
      <div className="review-card__title">Comments</div>
      {/* A small history: each event label sits above the comment it belongs to. */}
      <ul className="review__thread">
        <li className="review__event">
          Approval requested{r.status === 'open' && <span className="review__due"> · {dueLabel(r.due)}</span>}
        </li>
        <li className="timeline__item timeline__item--comment">
          <Avatar person={asker} size={26} />
          <div className="timeline__comment">
            <div className="timeline__who">
              {asker.name} <span className="faint">· {fmtRelative(doc.uploadedAt)}</span>
            </div>
            <p>{r.note}</p>
          </div>
        </li>
        {r.feedback.map((f) => {
          const p = personById(state, f.by);
          const isDecision = r.decision && f.at === r.decision.at;
          return (
            <Fragment key={f.id}>
              {isDecision && (
                <li className="review__event">
                  {r.status === 'approved' ? 'Approved' : 'Changes requested'}
                </li>
              )}
              <li className="timeline__item timeline__item--comment">
                <Avatar person={p} size={26} />
                <div className="timeline__comment">
                  <div className="timeline__who">
                    {p.name} <span className="faint">· {fmtRelative(f.at)}</span>
                  </div>
                  <p>{f.text}</p>
                </div>
              </li>
            </Fragment>
          );
        })}
        {/* An approval without a comment still shows up as an event. */}
        {r.decision && decider && !r.feedback.some((f) => f.at === r.decision!.at) && (
          <li className="review__event">
            {r.status === 'approved' ? 'Approved' : 'Changes requested'}
          </li>
        )}
      </ul>
      {me.org === 'client' && r.status === 'open' && (
        <div className="decision__btns">
          <Button variant="primary" size="lg" onClick={approve}>
            Approve
          </Button>
          <Button onClick={() => setChangesOpen(true)}>
            Request changes
          </Button>
        </div>
      )}
      <Dialog
        open={changesOpen}
        onClose={() => {
          setChangesOpen(false);
          setError(null);
        }}
        size="sm"
        icon={PenLine}
        title="Request changes"
        description={`Tell ${asker.name} what should change in ${doc.name.replace(/\.[a-z0-9]+$/i, '')}.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setChangesOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={requestChanges}>
              Send changes
            </Button>
          </>
        }
      >
        <Textarea
          rows={4}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          placeholder="e.g. Desert Bloom, but with the Night Market lanterns on the gift box."
          aria-label="What should change"
          data-autofocus
        />
        {error && <div className="field__error review__err">{error}</div>}
      </Dialog>
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

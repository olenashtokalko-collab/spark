import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, Folder as FolderIcon, FolderOpen, LayoutGrid, List, Search, Upload, X, Download, Sparkles, FileQuestion } from 'lucide-react';
import { personById, useStore } from '../../state/store';
import { useUI } from '../../state/ui';
import { Badge, Button, EmptyState, Input, PageHeader, Progress, Segmented, Skeleton, cx } from '../../components/ui/primitives';
import { DocThumb, FileIcon, kindLabel } from '../../components/domain';
import { useToast } from '../../components/ui/toast';
import { fmtDate, fmtRelative, fmtSize } from '../../lib/format';
import { navigate } from '../../lib/router';
import type { Doc, DocKind, Folder } from '../../data/types';
import { downloadDoc } from './DocPreview';

type KindFilter = 'all' | DocKind;
const MAX_MB = 25;

export function Documents({ folderId, docId }: { folderId?: string; docId?: string | null }) {
  const { state, actions } = useStore();
  const { openDoc } = useUI();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<KindFilter>('all');
  const [view, setView] = useState<'grid' | 'list'>(() => {
    try {
      return (localStorage.getItem('spark-docs-view') as 'grid' | 'list') || 'grid';
    } catch {
      return 'grid';
    }
  });
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<{ name: string; progress: number }[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const folder = folderId ? state.folders.find((f) => f.id === folderId) : undefined;
  const children = state.folders.filter((f) => f.parentId === (folder?.id ?? null));
  const crumbs: Folder[] = [];
  for (let f = folder; f; f = state.folders.find((x) => x.id === f!.parentId)) crumbs.unshift(f);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 320);
    return () => clearTimeout(t);
  }, [folderId]);

  // Deep link: /documents/<folder>?doc=<id> opens the preview.
  useEffect(() => {
    if (docId) {
      openDoc(docId);
      navigate(folderId ? `/documents/${folderId}` : '/documents', { replace: true });
    }
  }, [docId, folderId, openDoc]);

  useEffect(() => {
    try {
      localStorage.setItem('spark-docs-view', view);
    } catch {
      /* ignore */
    }
  }, [view]);

  const searching = q.trim().length > 0;
  const files = useMemo(() => {
    const base = searching ? state.docs.filter((d) => d.name.toLowerCase().includes(q.toLowerCase())) : state.docs.filter((d) => d.folderId === (folder?.id ?? '__root'));
    return base.filter((d) => kind === 'all' || d.kind === kind).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }, [state.docs, folder, q, kind, searching]);

  const countIn = (fid: string): number => state.docs.filter((d) => d.folderId === fid).length + state.folders.filter((f) => f.parentId === fid).reduce((a, f) => a + countIn(f.id), 0);
  const reviewIn = (fid: string): number =>
    state.docs.filter((d) => d.folderId === fid && d.review?.status === 'open').length + state.folders.filter((f) => f.parentId === fid).reduce((a, f) => a + reviewIn(f.id), 0);

  const onFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const arr = Array.from(list);
    const tooBig = arr.filter((f) => f.size > MAX_MB * 1024 * 1024);
    const ok = arr.filter((f) => f.size <= MAX_MB * 1024 * 1024);
    if (tooBig.length) toast({ title: `${tooBig.length === 1 ? tooBig[0].name : `${tooBig.length} files`} too large`, body: `Files up to ${MAX_MB} MB. Share bigger files with Spark by link.`, tone: 'error' });
    if (!ok.length) return;
    const target = folder?.id ?? 'f-uploads';
    setUploads(ok.map((f) => ({ name: f.name, progress: 0 })));
    let p = 0;
    const tick = setInterval(() => {
      p += 0.18 + Math.random() * 0.12;
      setUploads((u) => u.map((x) => ({ ...x, progress: Math.min(1, p) })));
      if (p >= 1) {
        clearInterval(tick);
        actions.uploadFiles(
          ok.map((f) => ({ name: f.name, sizeKb: f.size / 1024 })),
          target,
        );
        setUploads([]);
        toast({
          title: `${ok.length === 1 ? ok[0].name : `${ok.length} files`} uploaded`,
          body: `Shared with Spark in ${state.folders.find((f) => f.id === target)?.name}.`,
          action: !folder ? { label: 'Open folder', onClick: () => navigate(`/documents/${target}`) } : undefined,
        });
      }
    }, 220);
    if (fileInput.current) fileInput.current.value = '';
  };

  return (
    <div
      className="docs"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('Files')) e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onFiles(e.dataTransfer.files);
      }}
    >
      <PageHeader
        title="Documents"
        sub="Guidelines, strategy, proposals, creative and the files your team shares."
        actions={
          <>
            <input ref={fileInput} type="file" multiple hidden onChange={(e) => onFiles(e.target.files)} />
            <Button variant="primary" icon={Upload} onClick={() => fileInput.current?.click()}>
              Upload
            </Button>
          </>
        }
      />

      <div className="docs__layout">
        <nav className="folder-nav" aria-label="Folders">
          <a className={cx('folder-nav__item', !folder && !searching && 'is-active')} href="#/documents">
            <LayoutGrid size={15} /> All folders
          </a>
          {state.folders
            .filter((f) => f.parentId === null)
            .map((f) => (
              <FolderNavItem key={f.id} f={f} active={folder?.id} countIn={countIn} reviewIn={reviewIn} />
            ))}
        </nav>

        <div className="docs__main">
          <div className="toolbar">
            {/* The page title stays "Documents"; the open folder is named here. */}
            <div className="docs__section">
              {searching ? (
                <h2 className="docs__section-title">Results across all folders</h2>
              ) : folder ? (
                <h2 className="docs__section-title">
                  {crumbs.slice(0, -1).map((c) => (
                    <a key={c.id} href={`#/documents/${c.id}`} className="docs__section-parent">
                      {c.name}
                      <ChevronRight size={15} />
                    </a>
                  ))}
                  {folder.name}
                </h2>
              ) : (
                <h2 className="docs__section-title">All folders</h2>
              )}
            </div>
            <div className="toolbar__right">
              <Input icon={Search} placeholder="Search all files" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search files" className="toolbar__search" />
              <Segmented
                label="View"
                value={view}
                onChange={setView}
                items={[
                  { value: 'grid', icon: LayoutGrid, title: 'Grid' },
                  { value: 'list', icon: List, title: 'List' },
                ]}
              />
            </div>
          </div>
          <div className="kind-filter">
            {(['all', 'pdf', 'deck', 'image', 'sheet', 'archive'] as KindFilter[]).map((k) => (
              <button key={k} className={cx('chip', kind === k && 'is-active')} onClick={() => setKind(k)}>
                {k === 'all' ? 'All types' : kindLabel[k as DocKind]}
              </button>
            ))}
            {(searching || kind !== 'all') && (
              <button
                className="link-btn"
                onClick={() => {
                  setQ('');
                  setKind('all');
                }}
              >
                <X size={13} /> Clear
              </button>
            )}
          </div>

          {uploads.length > 0 && (
            <div className="uploads" role="status">
              {uploads.map((u) => (
                <div key={u.name} className="upload">
                  <Upload size={14} />
                  <span className="upload__name">{u.name}</span>
                  <Progress value={u.progress} />
                  <span className="mono faint">{Math.round(u.progress * 100)}%</span>
                </div>
              ))}
            </div>
          )}

          {!searching && children.length > 0 && (
            <div className="folder-grid">
              {children.map((f) => (
                <a key={f.id} className="folder-card" href={`#/documents/${f.id}`}>
                  <FolderIcon size={20} strokeWidth={1.6} />
                  <span className="folder-card__name">{f.name}</span>
                  <span className="folder-card__meta">
                    {countIn(f.id)} items
                    {reviewIn(f.id) > 0 && <Badge tone="accent">{reviewIn(f.id)} to review</Badge>}
                  </span>
                </a>
              ))}
            </div>
          )}

          {loading ? (
            <div className={view === 'grid' ? 'file-grid' : 'file-list'}>
              {Array.from({ length: view === 'grid' ? 4 : 3 }).map((_, i) =>
                view === 'grid' ? (
                  <div key={i} className="file-card">
                    <Skeleton h={120} r={10} />
                    <Skeleton w="70%" h={12} className="mt8" />
                  </div>
                ) : (
                  <Skeleton key={i} h={44} r={8} />
                ),
              )}
            </div>
          ) : files.length === 0 ? (
            folder || searching ? (
              <EmptyState
                compact
                icon={searching || kind !== 'all' ? FileQuestion : FolderOpen}
                title={searching ? `No files match “${q}”` : kind !== 'all' ? `No ${kindLabel[kind as DocKind].toLowerCase()} files here` : 'This folder is empty'}
                body={searching ? 'Search covers every folder. Try part of the name.' : 'Drop files here or use Upload to share them with Spark.'}
                action={!searching && <Button icon={Upload} onClick={() => fileInput.current?.click()}>Upload</Button>}
              />
            ) : null
          ) : view === 'grid' ? (
            <div className="file-grid">
              {files.map((d) => (
                <FileCard key={d.id} d={d} showFolder={searching} />
              ))}
            </div>
          ) : (
            <div className="file-list" role="table" aria-label="Files">
              {files.map((d) => (
                <FileListRow key={d.id} d={d} showFolder={searching} />
              ))}
            </div>
          )}
          {!folder && !searching && <p className="drop-hint faint">Tip: drag files anywhere on this page to share them with Spark.</p>}
        </div>
      </div>
    </div>
  );

  function FileCard({ d, showFolder }: { d: Doc; showFolder: boolean }) {
    const by = personById(state, d.uploadedBy);
    return (
      <button className="file-card" onClick={() => openDoc(d.id)}>
        <span className="file-card__thumb">
          <DocThumb doc={d} />
          {d.review?.status === 'open' && <Badge tone="accent" className="file-card__badge">Feedback requested</Badge>}
        </span>
        <span className="file-card__name">
          <FileIcon kind={d.kind} size={14} />
          <span>{d.name}</span>
        </span>
        <span className="file-card__meta">
          {showFolder ? state.folders.find((f) => f.id === d.folderId)?.name : by.org === 'spark' ? 'Spark' : by.name.split(' ')[0]} · {fmtRelative(d.uploadedAt)}
        </span>
      </button>
    );
  }

  function FileListRow({ d, showFolder }: { d: Doc; showFolder: boolean }) {
    const by = personById(state, d.uploadedBy);
    return (
      <div className="file-line" role="row">
        <button className="file-line__main" onClick={() => openDoc(d.id)} role="cell">
          <FileIcon kind={d.kind} />
          <span className="file-line__name">{d.name}</span>
          {d.review?.status === 'open' && <Badge tone="accent">Feedback</Badge>}
        </button>
        <span className="faint hide-sm" role="cell">
          {showFolder ? state.folders.find((f) => f.id === d.folderId)?.name : by.name}
        </span>
        <span className="faint hide-sm mono" role="cell">
          {fmtDate(d.uploadedAt)}
        </span>
        <span className="faint hide-md mono" role="cell">
          {fmtSize(d.sizeKb)}
        </span>
        <span className="file-line__acts" role="cell">
          <Button
            size="sm"
            variant="ghost"
            icon={Sparkles}
            aria-label={`Ask about ${d.name}`}
            onClick={() => {
              const id = actions.ask(null, `What should I know about ${d.name}?`, { docId: d.id });
              navigate(`/assistant/${id}`);
            }}
          />
          <Button
            size="sm"
            variant="ghost"
            icon={Download}
            aria-label={`Download ${d.name}`}
            onClick={() => {
              const n = downloadDoc(d);
              toast({ title: 'Download started', body: n });
            }}
          />
        </span>
      </div>
    );
  }
}

function FolderNavItem({ f, active, countIn, reviewIn }: { f: Folder; active?: string; countIn: (id: string) => number; reviewIn: (id: string) => number }) {
  const { state } = useStore();
  const kids = state.folders.filter((x) => x.parentId === f.id);
  const isActive = active === f.id;
  const inBranch = isActive || kids.some((k) => k.id === active);
  return (
    <>
      <a className={cx('folder-nav__item', isActive && 'is-active')} href={`#/documents/${f.id}`}>
        {inBranch ? <FolderOpen size={15} /> : <FolderIcon size={15} />}
        <span>{f.name}</span>
        {reviewIn(f.id) > 0 ? <span className="folder-nav__dot" aria-label="Has files to review" /> : <span className="folder-nav__n">{countIn(f.id)}</span>}
      </a>
      {inBranch &&
        kids.map((k) => (
          <a key={k.id} className={cx('folder-nav__item folder-nav__item--child', active === k.id && 'is-active')} href={`#/documents/${k.id}`}>
            <FolderIcon size={14} />
            <span>{k.name}</span>
            {reviewIn(k.id) > 0 ? <span className="folder-nav__dot" /> : <span className="folder-nav__n">{countIn(k.id)}</span>}
          </a>
        ))}
    </>
  );
}

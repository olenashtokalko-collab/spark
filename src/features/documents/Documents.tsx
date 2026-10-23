import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Calendar, FileText, LayoutGrid, List, Lock, MessageSquare, Search, Upload, UserRound, X, Download } from 'lucide-react';
import { FluidOrb } from '../../components/ui/FluidOrb';
import { personById, TEAM_FOLDER, useStore } from '../../state/store';
import { useUI } from '../../state/ui';
import { AvatarStack, Button, cx, EmptyState, Input, PageHeader, Progress, Segmented, Skeleton } from '../../components/ui/primitives';
import { DocThumb, FileIcon, kindLabel } from '../../components/domain';
import { FolderCard, folderTint } from './FolderCard';
import { useToast } from '../../components/ui/toast';
import { FilterMenu } from '../../components/ui/overlay';
import { fmtRelative, fmtSize } from '../../lib/format';
import { navigate } from '../../lib/router';
import type { Doc, DocKind, Folder } from '../../data/types';
import { downloadDoc } from './DocPreview';

type KindFilter = 'all' | DocKind;
type ByFilter = 'anyone' | 'spark' | 'team';
type DateFilter = 'any' | 'week' | 'month';
const DATE_DAYS: Record<Exclude<DateFilter, 'any'>, number> = { week: 7, month: 30 };
const MAX_MB = 25;

export function Documents({ folderId, docId }: { folderId?: string; docId?: string | null }) {
  const { state, actions } = useStore();
  const { openDoc } = useUI();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<KindFilter>('all');
  const [by, setBy] = useState<ByFilter>('anyone');
  const [date, setDate] = useState<DateFilter>('any');
  const [view, setView] = useState<'grid' | 'list'>(() => {
    try {
      return (localStorage.getItem('spark-docs-view') as 'grid' | 'list') || 'grid';
    } catch {
      return 'grid';
    }
  });
  const [loading, setLoading] = useState(true);
  // The top level splits Spark's folders from your team's (picked on #/demo/folders, D).
  const [side, setSide] = useState<'spark' | 'team'>('spark');
  const [over, setOver] = useState(false);
  const [uploads, setUploads] = useState<{ name: string; progress: number }[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const folder = folderId ? state.folders.find((f) => f.id === folderId) : undefined;
  const children = state.folders.filter((f) => f.parentId === (folder?.id ?? null));
  const crumbs: Folder[] = [];
  for (let f = folder; f; f = state.folders.find((x) => x.id === f!.parentId)) crumbs.unshift(f);
  // Uploads go only into From your team (and its subfolders); Spark's folders are view only.
  const isTeam = (fid: string) => {
    for (let f = state.folders.find((x) => x.id === fid); f; f = state.folders.find((x) => x.id === f!.parentId)) if (f.id === TEAM_FOLDER) return true;
    return false;
  };
  const canUpload = !!folder && isTeam(folder.id);
  const teamFolder = state.folders.find((f) => f.id === TEAM_FOLDER);
  const team = state.people.filter((p) => p.org === 'client');
  const shownFolders = folder ? children : children.filter((f) => (side === 'team') === isTeam(f.id));

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
  const filtered = kind !== 'all' || by !== 'anyone' || date !== 'any';
  const clearFilters = () => {
    setQ('');
    setKind('all');
    setBy('anyone');
    setDate('any');
  };
  const files = useMemo(() => {
    const base = searching ? state.docs.filter((d) => d.name.toLowerCase().includes(q.toLowerCase())) : state.docs.filter((d) => d.folderId === (folder?.id ?? '__root'));
    const fromSpark = (d: Doc) => state.people.find((p) => p.id === d.uploadedBy)?.org === 'spark';
    return base
      .filter((d) => kind === 'all' || d.kind === kind)
      .filter((d) => by === 'anyone' || (by === 'spark') === fromSpark(d))
      .filter((d) => date === 'any' || Date.now() - new Date(d.uploadedAt).getTime() <= DATE_DAYS[date] * 86400000)
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }, [state.docs, state.people, folder, q, kind, by, date, searching]);

  const countIn = (fid: string): number => state.docs.filter((d) => d.folderId === fid).length + state.folders.filter((f) => f.parentId === fid).reduce((a, f) => a + countIn(f.id), 0);
  const reviewIn = (fid: string): number =>
    state.docs.filter((d) => d.folderId === fid && d.review?.status === 'open').length + state.folders.filter((f) => f.parentId === fid).reduce((a, f) => a + reviewIn(f.id), 0);

  // Files go to the open team folder, or to From your team from the drop card at the top level.
  const onFiles = (list: FileList | null) => {
    const into = folder && canUpload ? folder : !folder ? teamFolder : undefined;
    if (!list?.length || !into) return;
    const arr = Array.from(list);
    const tooBig = arr.filter((f) => f.size > MAX_MB * 1024 * 1024);
    const ok = arr.filter((f) => f.size <= MAX_MB * 1024 * 1024);
    if (tooBig.length) toast({ title: `${tooBig.length === 1 ? tooBig[0].name : `${tooBig.length} files`} too large`, body: `Files up to ${MAX_MB} MB. Share bigger files with Spark by link.`, tone: 'error' });
    if (!ok.length) return;
    const target = into.id;
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
          body: `Shared with Spark in ${into.name}.`,
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
        if (canUpload && e.dataTransfer.types.includes('Files')) e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onFiles(e.dataTransfer.files);
      }}
    >
      {/* Inside a folder the page becomes the folder: a back link one level up,
          then the folder's name and what it holds, as on a request page. */}
      {folder && (
        <a className="back" href={folder.parentId ? `#/documents/${folder.parentId}` : '#/documents'}>
          <ArrowLeft size={15} /> {crumbs.length > 1 ? crumbs[crumbs.length - 2].name : 'Documents'}
        </a>
      )}
      <input ref={fileInput} type="file" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      <PageHeader
        title={folder ? folder.name : 'Documents'}
        sub={folder ? folder.description : 'Guidelines, strategy, proposals, creative and the files your team shares.'}
        actions={
          canUpload ? (
            <Button variant="primary" icon={Upload} onClick={() => fileInput.current?.click()}>
              Upload
            </Button>
          ) : folder ? (
            <span className="docs__owner">
              <Lock size={14} /> From Spark · view only
            </span>
          ) : undefined
        }
      />

      <div className="docs__layout">
        <div className="docs__main">
          {searching && (
            <div className="toolbar">
              <div className="docs__section">
                <h2 className="docs__section-title">Results across all folders</h2>
              </div>
            </div>
          )}
          {!searching && !folder && (
            <div className="pill-tabs" role="tablist" aria-label="Whose files">
              {(
                [
                  ['spark', 'From Spark', children.filter((f) => !isTeam(f.id)).length],
                  ['team', 'Your team', children.filter((f) => isTeam(f.id)).length],
                ] as const
              ).map(([v, label, n]) => (
                <button key={v} role="tab" aria-selected={side === v} className={cx(side === v && 'is-on')} onClick={() => setSide(v)}>
                  {label}
                  <span>{n}</span>
                </button>
              ))}
            </div>
          )}

          <div className="filter-bar">
            <Input icon={Search} placeholder="Search all files" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search files" className="filter-bar__search" />
            <FilterMenu
              icon={FileText}
              label="Type"
              value={kind}
              onChange={setKind}
              options={[{ value: 'all', label: 'Any type' }, ...(['pdf', 'deck', 'image', 'sheet', 'archive'] as DocKind[]).map((k) => ({ value: k, label: kindLabel[k] }))]}
            />
            <FilterMenu
              icon={UserRound}
              label="Uploaded by"
              value={by}
              onChange={setBy}
              options={[
                { value: 'anyone', label: 'Anyone' },
                { value: 'spark', label: 'Spark' },
                { value: 'team', label: 'Your team' },
              ]}
            />
            <FilterMenu
              icon={Calendar}
              label="Date"
              value={date}
              onChange={setDate}
              options={[
                { value: 'any', label: 'Any time' },
                { value: 'week', label: 'Past 7 days' },
                { value: 'month', label: 'Past 30 days' },
              ]}
            />
            {(searching || filtered) && (
              <button className="link-btn filter-bar__clear" onClick={clearFilters}>
                <X size={13} /> Clear
              </button>
            )}
            <span className="filter-bar__end">
              <Segmented
                label="View"
                value={view}
                onChange={setView}
                items={[
                  { value: 'grid', icon: LayoutGrid, title: 'Grid' },
                  { value: 'list', icon: List, title: 'List' },
                ]}
              />
            </span>
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

          {!searching && (shownFolders.length > 0 || (!folder && side === 'team')) && (
            <div className="fcard-grid">
              {shownFolders.map((f) => {
                const n = countIn(f.id);
                const review = reviewIn(f.id);
                return (
                  <FolderCard
                    key={f.id}
                    href={`#/documents/${f.id}`}
                    name={f.name}
                    sub={f.description ?? `${n} ${n === 1 ? 'item' : 'items'}`}
                    tint={folderTint(state.folders, f.id)}
                    badge={review > 0 && `${review} to review`}
                    mark={isTeam(f.id) ? <AvatarStack people={team} size={20} max={3} /> : undefined}
                  />
                );
              })}
              {/* Your team: the drop card is how files get in (drop, or click to choose). */}
              {!folder && side === 'team' && (
                <button
                  type="button"
                  className={cx('drop-card', over && 'is-over')}
                  onClick={() => fileInput.current?.click()}
                  onDragOver={(e) => {
                    if (!e.dataTransfer.types.includes('Files')) return;
                    e.preventDefault();
                    setOver(true);
                  }}
                  onDragLeave={() => setOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOver(false);
                    onFiles(e.dataTransfer.files);
                  }}
                >
                  <Upload size={18} />
                  <b>Drop files here</b>
                  <span className="faint">Or click to choose. They go to {teamFolder?.name}.</span>
                </button>
              )}
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
            folder || searching || filtered ? (
              <EmptyState
                panel
                title={searching || filtered ? 'No files match these filters.' : canUpload ? 'No files added.' : 'No files yet.'}
                body={
                  searching || filtered
                    ? 'Search covers every folder. Try part of the name or clear the filters above.'
                    : canUpload
                      ? 'Drop files here or use Upload to share them with Spark. Files you add in a chat are saved here too.'
                      : 'Spark adds files here as the work moves.'
                }
                action={
                  !(searching || filtered) &&
                  canUpload && (
                    <Button size="sm" icon={Upload} onClick={() => fileInput.current?.click()}>
                      Upload
                    </Button>
                  )
                }
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
          <ReviewBadge doc={d} className="file-card__badge" />
        </span>
        <span className="file-card__name">
          <FileIcon kind={d.kind} size={14} />
          <span>{d.name}</span>
        </span>
        <span className="file-card__meta">
          {d.chatId && (
            <>
              <MessageSquare size={12} /> From a chat ·{' '}
            </>
          )}
          {showFolder ? state.folders.find((f) => f.id === d.folderId)?.name : by.name.split(' ')[0]} · {fmtRelative(d.uploadedAt)}
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
          {d.chatId && (
            <span className="file-line__from" data-tip="Added in a chat">
              <MessageSquare size={13} />
            </span>
          )}
          <ReviewBadge doc={d} />
        </button>
        <span className="faint hide-sm" role="cell">
          {showFolder ? state.folders.find((f) => f.id === d.folderId)?.name : by.name.split(' ')[0]}
        </span>
        <span className="faint hide-sm" role="cell">
          {fmtRelative(d.uploadedAt)}
        </span>
        <span className="faint hide-md mono" role="cell">
          {fmtSize(d.sizeKb)}
        </span>
        <span className="file-line__acts" role="cell">
          <Button
            size="sm"
            variant="ai"
            lead={<FluidOrb size={18} />}
            className="file-act-ai"
            aria-label={`Ask about ${d.name}`}
            data-tip="Ask about this file"
            onClick={() => {
              const id = actions.ask(null, `What should I know about ${d.name}?`, { docId: d.id });
              navigate(`/assistant/${id}`);
            }}
          />
          <Button
            size="sm"
            variant="ghost"
            icon={Download}
            className="file-act"
            aria-label={`Download ${d.name}`}
            data-tip="Download"
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

/** Approval state of a file Spark shared for review. */
/** A file's review state, in the request status colours (amber when it's on you). */
function ReviewBadge({ doc, className }: { doc: Doc; className?: string }) {
  const st = doc.review?.status;
  if (!st) return null;
  const [mod, label] = st === 'open' ? ['you', 'Needs approval'] : st === 'approved' ? ['approved', 'Approved'] : ['changes_requested', 'Changes requested'];
  return (
    <span className={cx('rstatus', `rstatus--${mod}`, className)}>
      <span className="rstatus__dot" />
      {label}
    </span>
  );
}

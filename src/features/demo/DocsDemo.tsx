// Prototype-only page (#/demo/docs): five looks for the folder grid on the
// Documents page, each after a reference the team shared. Folders, counts and
// thumbnails come from the workspace; clicking a folder opens it for real.
import { useMemo, useState, type CSSProperties } from 'react';
import { MoreHorizontal, MoreVertical } from 'lucide-react';
import { useStore } from '../../state/store';
import { PageHeader, Tabs } from '../../components/ui/primitives';
import { DocThumb, FOLDER_HUES, FolderTile } from '../../components/domain';
import { fmtRelative, fmtSize } from '../../lib/format';
import { navigate } from '../../lib/router';
import type { Doc, Folder } from '../../data/types';

interface FolderInfo {
  folder: Folder;
  hue: string;
  count: number;
  sizeKb: number;
  updated?: string;
  latest: Doc[];
}

function useFolders(): FolderInfo[] {
  const { state } = useStore();
  return useMemo(() => {
    const under = (fid: string): Doc[] => [...state.docs.filter((d) => d.folderId === fid), ...state.folders.filter((f) => f.parentId === fid).flatMap((f) => under(f.id))];
    return state.folders
      .filter((f) => f.parentId === null)
      .map((folder, i) => {
        const docs = under(folder.id).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
        return {
          folder,
          hue: FOLDER_HUES[i % FOLDER_HUES.length],
          count: docs.length,
          sizeKb: docs.reduce((a, d) => a + d.sizeKb, 0),
          updated: docs[0]?.uploadedAt,
          latest: docs.slice(0, 3),
        };
      });
  }, [state.docs, state.folders]);
}

const open = (f: Folder) => navigate(`/documents/${f.id}`);
const items = (n: number) => `${n} ${n === 1 ? 'item' : 'items'}`;
const hueVar = (hue: string) => ({ '--hue': hue }) as CSSProperties;

/** The three white sheets that peek out of every folder. */
function Sheets({ className }: { className: string }) {
  return (
    <span className={className} aria-hidden>
      <span />
      <span />
      <span>
        <i />
        <i />
      </span>
    </span>
  );
}

// ---- 1 · Soft 3D ----------------------------------------------------------------------------

function Soft() {
  const list = useFolders();
  return (
    <div className="dv-grid dv-grid--soft">
      {list.map((x) => (
        <button key={x.folder.id} className="soft" style={hueVar(x.hue)} onClick={() => open(x.folder)}>
          <span className="soft__art" aria-hidden>
            <span className="soft__back" />
            <Sheets className="soft__sheets" />
            <span className="soft__front" />
          </span>
          <span className="soft__name">{x.folder.name}</span>
          <span className="soft__size">{fmtSize(x.sizeKb)}</span>
          <span className="soft__meta">
            <span>
              Files <b>{x.count}</b>
            </span>
            <span>
              Updated <b>{x.updated ? fmtRelative(x.updated) : '—'}</b>
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

// ---- 2 · Folder tile ------------------------------------------------------------------------

function Tile() {
  const list = useFolders();
  return (
    <div className="dv-grid">
      {list.map((x) => (
        <button key={x.folder.id} className="tile" style={hueVar(x.hue)} onClick={() => open(x.folder)}>
          <Sheets className="tile__sheets" />
          <span className="tile__front">
            <span className="tile__text">
              <span className="tile__name">{x.folder.name}</span>
              <span className="tile__desc">{x.folder.description ?? items(x.count)}</span>
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

// ---- 3 · Tabbed glass -----------------------------------------------------------------------

function Tabbed() {
  const list = useFolders();
  return (
    <div className="dv-grid">
      {list.map((x) => (
        <button key={x.folder.id} className="tabbed" style={hueVar(x.hue)} onClick={() => open(x.folder)}>
          <span className="tabbed__back" aria-hidden />
          <span className="tabbed__sheet" aria-hidden />
          <span className="tabbed__front">
            <span className="tabbed__head">
              <span className="tabbed__name">{x.folder.name}</span>
              <MoreVertical size={16} className="tabbed__more" aria-hidden />
            </span>
            <span className="tabbed__count">{items(x.count)}</span>
            <span className="tabbed__foot">{x.updated ? `Last added ${fmtRelative(x.updated)}` : 'Nothing here yet'}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

// ---- 4 · Stack ------------------------------------------------------------------------------

function Stack() {
  const list = useFolders();
  return (
    <div className="dv-grid">
      {list.map((x) => (
        <button key={x.folder.id} className="fstack" style={hueVar(x.hue)} onClick={() => open(x.folder)}>
          <span className="fstack__fan" aria-hidden>
            {x.latest.length === 0 && <span className="fstack__card fstack__card--blank" />}
            {x.latest.map((d) => (
              <span key={d.id} className="fstack__card">
                <DocThumb doc={d} />
              </span>
            ))}
          </span>
          <span className="fstack__front">
            <span className="fstack__name">{x.folder.name}</span>
            <span className="fstack__count">{items(x.count)}</span>
            <MoreHorizontal size={18} className="fstack__more" aria-hidden />
          </span>
        </button>
      ))}
    </div>
  );
}

// ---- 5 · Tile with a tab (2 + 4) — now the Documents page's folder card ---------------------

function TabTile() {
  const list = useFolders();
  return (
    <div className="dv-grid">
      {list.map((x) => (
        <FolderTile key={x.folder.id} name={x.folder.name} sub={x.folder.description ?? items(x.count)} hue={x.hue} onClick={() => open(x.folder)} />
      ))}
    </div>
  );
}

// ---- Page -----------------------------------------------------------------------------------

const VARIANTS = [
  { id: '5', label: '5 · Tile + tab', ref: 'variants 2 and 4', note: 'The folder tile of variant 2, but its frosted front takes the tabbed folder shape from the stack in variant 4.', View: TabTile },
  { id: '1', label: '1 · Soft 3D', ref: 'the “tidied up folder” cards', note: 'Dark cards with a soft, lit folder illustration, the folder size as a pill and a two-line footer: how many files and when something last landed.', View: Soft },
  { id: '2', label: '2 · Folder tile', ref: 'the orange “Scripts” tile', note: 'The whole card is the folder: sheets peek out of the back, the frosted front carries the name and what the folder is for.', View: Tile },
  { id: '3', label: '3 · Tabbed glass', ref: 'the purple “Designs” folder', note: 'A real folder silhouette with a tab, one sheet inside and a glass front with the count and the last upload.', View: Tabbed },
  { id: '4', label: '4 · Stack', ref: 'the blue “Documents” stack', note: 'The latest three files fan out of the folder as real thumbnails, so you can recognise a folder by what’s in it.', View: Stack },
] as const;

export function DocsDemo() {
  const [tab, setTab] = useState<(typeof VARIANTS)[number]['id']>('5');
  const v = VARIANTS.find((x) => x.id === tab)!;
  return (
    <div className="cdemo">
      <PageHeader title="Documents · folder looks" sub="Five looks for the folder grid, after the references you shared. Folders and files are the workspace’s own; click one to open it." />
      <Tabs className="tabs--underline" value={tab} onChange={setTab} items={VARIANTS.map((x) => ({ value: x.id, label: x.label }))} />
      <p className="cdemo__note">
        <span className="faint">After {v.ref}.</span> {v.note}
      </p>
      <v.View key={v.id} />
    </div>
  );
}

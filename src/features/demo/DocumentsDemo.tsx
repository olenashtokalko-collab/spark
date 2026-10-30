// Prototype-only page (#/demo/documents): the Documents page now, beside three looks aligned with Requests and the
// request page: the title in Ultra 44, tabs and tools on one row, the filters named as on Requests, what waits on the
// client in Ember, one folder colour (the Noor mixes are glow only, never flat, p. 31), and the folder's facts in
// place of the template sheets. A and B differ only in the card: Sand with a hairline, or white (white = clickable).
import { useState } from 'react';
import { Calendar, FileText, Folder as FolderIcon, LayoutGrid, List, Search, UserRound } from 'lucide-react';
import { TEAM_FOLDER, useStore } from '../../state/store';
import { PageHeader, Segmented, cx } from '../../components/ui/primitives';
import { FilterMenu } from '../../components/ui/overlay';
import { fmtDate } from '../../lib/format';
import { Documents } from '../documents/Documents';
import type { Doc, Folder } from '../../data/types';

type V = 'now' | 'sand' | 'white' | 'table';
const VARIANTS: { v: V; label: string; note: string }[] = [
  { v: 'now', label: 'Now', note: 'The page as it is: a Bold title, tabs and filters on two rows, five folder colours, the same template sheets in every card, "1 to review" in blue.' },
  {
    v: 'sand',
    label: 'A · Sand cards',
    note: 'Aligned with Requests: Ultra title, tabs left and tools right on one row, "Search" and "Updated" as on Requests. Folders in one Ink glyph; the sheets give way to the facts (files, last update, the latest file); to review in Ember. Cards in the page colour with a hairline, as on the request page.',
  },
  { v: 'white', label: 'B · White cards', note: 'The same as A, the cards white with a hairline: a folder is something you open, so it takes the white of what can be clicked (as the open decision card).' },
  {
    v: 'table',
    label: 'C · One table',
    note: 'No cards: the folders as one framed table, as Requests and Scope: folder and what it holds, files, last updated, and what waits on you in Ember.',
  },
];

function useFolders() {
  const { state } = useStore();
  const inTeam = (f: Folder) => {
    for (let x: Folder | undefined = f; x; x = state.folders.find((y) => y.id === x!.parentId)) if (x.id === TEAM_FOLDER) return true;
    return false;
  };
  const tree = (fid: string): Doc[] => [...state.docs.filter((d) => d.folderId === fid), ...state.folders.filter((f) => f.parentId === fid).flatMap((f) => tree(f.id))];
  const top = state.folders.filter((f) => f.parentId === null);
  const rows = top.map((f) => {
    const docs = tree(f.id).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
    return { f, team: inTeam(f), n: docs.length, latest: docs[0], review: docs.filter((d) => d.review?.status === 'open').length };
  });
  return { spark: rows.filter((r) => !r.team), team: rows.filter((r) => r.team) };
}

type Row = ReturnType<typeof useFolders>['spark'][number];

function Head({ side, setSide, counts, view, setView }: { side: 'spark' | 'team'; setSide: (s: 'spark' | 'team') => void; counts: [number, number]; view: 'grid' | 'list'; setView: (v: 'grid' | 'list') => void }) {
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('all');
  const [by, setBy] = useState('anyone');
  const [updated, setUpdated] = useState('any');
  return (
    <>
      <div className="rq-head">
        <div>
          <h1 className="rq-head__title">Documents</h1>
          <p className="rq-head__sub">Guidelines, strategy, proposals, creative and the files your team shares.</p>
        </div>
      </div>
      <div className="rq-bar">
        <div className="rq-tabs" role="tablist" aria-label="Whose files">
          {(
            [
              ['spark', 'From Spark', counts[0]],
              ['team', 'Your team', counts[1]],
            ] as const
          ).map(([v, label, n]) => (
            <button key={v} role="tab" aria-selected={side === v} className={cx(side === v && 'is-on')} onClick={() => setSide(v)}>
              {label}
              <span>{n}</span>
            </button>
          ))}
        </div>
        <div className="rq-tools">
          <label className="rq-search">
            <Search size={15} />
            <input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search files" />
          </label>
          <FilterMenu icon={FileText} label="Type" value={kind} onChange={setKind} options={[{ value: 'all', label: 'Any type' }]} />
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
            label="Updated"
            value={updated}
            onChange={setUpdated}
            options={[
              { value: 'any', label: 'Any time' },
              { value: 'week', label: 'Past 7 days' },
              { value: 'month', label: 'Past 30 days' },
            ]}
          />
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
    </>
  );
}

/** What waits on the client: an Ember dot and the words, no pill (as the mark beside a request). */
const Review = ({ n }: { n: number }) =>
  n > 0 ? (
    <span className="ddv-review">
      <i />
      {n} to review
    </span>
  ) : null;

function Card({ r }: { r: Row }) {
  return (
    <a className="ddv-card" href={`#/documents/${r.f.id}`}>
      <span className="ddv-card__top">
        <FolderIcon size={22} strokeWidth={1.6} />
        <Review n={r.review} />
      </span>
      <span className="ddv-card__name">{r.f.name}</span>
      {r.f.description && <span className="ddv-card__desc">{r.f.description}</span>}
      <span className="ddv-card__facts">
        <span className="ddv-card__count">
          {r.n} file{r.n === 1 ? '' : 's'}
          {r.latest && <> · updated {fmtDate(r.latest.uploadedAt)}</>}
        </span>
        {r.latest && <span className="ddv-card__latest">{r.latest.name}</span>}
      </span>
    </a>
  );
}

function Table({ rows }: { rows: Row[] }) {
  return (
    <div className="rq-list rq-tbl ddv-tbl" role="list" aria-label="Folders">
      <div className="rq-row3 rq-cols ddv-row" aria-hidden>
        <span>Folder</span>
        <span>Files</span>
        <span className="rq-row3__when">Updated</span>
      </div>
      {rows.map((r) => (
        <a key={r.f.id} role="listitem" className="rq-row3 ddv-row" href={`#/documents/${r.f.id}`}>
          <span className="ddv-row__name">
            <FolderIcon size={18} strokeWidth={1.6} />
            <span>
              <b>{r.f.name}</b>
              {r.f.description && <span className="ddv-row__desc">{r.f.description}</span>}
            </span>
            <Review n={r.review} />
          </span>
          <span className="ddv-row__n">{r.n}</span>
          <span className="rq-row3__when">{r.latest ? fmtDate(r.latest.uploadedAt) : '—'}</span>
        </a>
      ))}
    </div>
  );
}

function Aligned({ look }: { look: 'sand' | 'white' | 'table' }) {
  const { spark, team } = useFolders();
  const [side, setSide] = useState<'spark' | 'team'>('spark');
  const [view, setView] = useState<'grid' | 'list'>(look === 'table' ? 'list' : 'grid');
  const rows = side === 'spark' ? spark : team;
  const asTable = look === 'table' || view === 'list';
  return (
    <div className="rqp ddv">
      <Head side={side} setSide={setSide} counts={[spark.length, team.length]} view={view} setView={setView} />
      {asTable ? (
        <Table rows={rows} />
      ) : (
        <div className={cx('ddv-grid', look === 'white' && 'ddv-grid--white')}>
          {rows.map((r) => (
            <Card key={r.f.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}

export function DocumentsDemo() {
  const [v, setV] = useState<V>('sand');
  const cur = VARIANTS.find((x) => x.v === v)!;
  return (
    <div className="cdemo">
      <PageHeader title="Documents · aligned" sub="The Documents page now, and three looks aligned with Requests and the request page. Prototype only." />
      <div className="fdm-switch">
        {VARIANTS.map((x) => (
          <button key={x.v} className={cx(v === x.v && 'is-on')} onClick={() => setV(x.v)}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{cur.note}</p>
      <div className="rdv-stage">{v === 'now' ? <Documents /> : <Aligned key={v} look={v} />}</div>
    </div>
  );
}

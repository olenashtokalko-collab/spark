// Prototype-only page (#/demo/folders): the Documents folders as cards (after the reference the
// client liked: a small coloured folder, the name, one line, the top files peeking out of a frosted
// pocket), and three ways to show what the client can upload and what comes from Spark.
import { createContext, useContext, useState, type CSSProperties } from 'react';
import { Folder as FolderIcon, Lock, Search, Upload } from 'lucide-react';
import { useStore } from '../../state/store';
import { AvatarStack, Button, PageHeader, cx } from '../../components/ui/primitives';
import type { Folder } from '../../data/types';

// A tint per folder from the palette: Cobalt, Haze, the Noor mixes (violet, pink) and Ember.
// The client's own folder is Ink, so it never reads as one of Spark's.
const TINT: Record<string, string> = {
  'f-guidelines': 'var(--cobalt)',
  'f-strategy': 'color-mix(in srgb, var(--haze) 45%, var(--cobalt))',
  'f-proposals': 'color-mix(in oklch, var(--cobalt) 65%, var(--ember))',
  'f-creative': 'var(--ember)',
  'f-research': 'color-mix(in oklch, var(--cobalt) 40%, var(--ember))',
  'f-uploads': 'var(--ink)',
};
const TEAM = 'f-uploads';

type CardStyle = 'white' | 'ground' | 'folder';
const CardStyleCtx = createContext<CardStyle>('white');

type Variant = 'tabs' | 'sections' | 'marks' | 'marks-drop';

function FolderCard({ f, mark }: { f: Folder; mark?: 'spark' | 'team' }) {
  const style = useContext(CardStyleCtx);
  if (style === 'folder') return <TemplateFolder f={f} mark={mark} />;
  return <DocsFolder f={f} mark={mark} />;
}

/** The folder itself, after the references: a coloured back with a tab, template sheets inside
 *  (lines, not the real files), a frosted front with the name and one line in white. */
function TemplateFolder({ f, mark }: { f: Folder; mark?: 'spark' | 'team' }) {
  const { state } = useStore();
  const team = state.people.filter((p) => p.org === 'client');
  return (
    <a className="fdm-tf" href={`#/documents/${f.id}`} style={{ '--tint': TINT[f.id] ?? 'var(--cobalt)' } as CSSProperties}>
      <span className="fdm-tf__back" />
      <span className="fdm-tf__sheets" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i}>
            <i />
            <i />
            <i />
          </span>
        ))}
      </span>
      <span className="fdm-tf__front">
        <span className="fdm-tf__text">
          <b>{f.name}</b>
          <span>{f.description}</span>
        </span>
        {mark === 'spark' && <Lock size={15} className="fdm-tf__mark" />}
        {mark === 'team' && <AvatarStack people={team} size={20} max={3} />}
      </span>
    </a>
  );
}

function DocsFolder({ f, mark }: { f: Folder; mark?: 'spark' | 'team' }) {
  const { state } = useStore();
  const team = state.people.filter((p) => p.org === 'client');
  return (
    <a className="fdm-card" href={`#/documents/${f.id}`} style={{ '--tint': TINT[f.id] ?? 'var(--cobalt)' } as CSSProperties}>
      <span className="fdm-card__top">
        <FolderGlyph />
        {mark === 'team' && (
          <span className="fdm-mark fdm-mark--team" data-tip="Your team uploads here">
            <AvatarStack people={team} size={20} max={3} />
          </span>
        )}
      </span>
      <span className="fdm-card__name">{f.name}</span>
      <span className="fdm-card__desc">{f.description}</span>
      {/* The top files stand in a frosted folder front, after the reference. */}
      <span className="fdm-card__peek" aria-hidden>
        {/* Template sheets, after the folder references: lines only, not the real files. */}
        {(['left', 'front', 'right'] as const).map((pos) => (
          <span key={pos} className={cx('fdm-paper', 'fdm-paper--tpl', `fdm-paper--${pos}`)}>
            <i />
            <i />
            <i />
            <i />
          </span>
        ))}
        <span className="fdm-pocket" />
        <svg className="fdm-pocket__edge" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d={POCKET} vectorEffect="non-scaling-stroke" />
        </svg>
      </span>
    </a>
  );
}

// After the reference: a rounded tab on the left that runs into the top edge in a soft S-curve,
// and sides that draw in slightly towards the foot (in 0..100).
const POCKET = 'M0 7 Q0 0 6 0 L31 0 C37 0 38 26 47 26 L95.5 26 Q100 26 100 32 L97 100 L3 100 Z';


/** A small filled folder in the folder's tint. */
function FolderGlyph() {
  return (
    <svg className="fdm-glyph" width="32" height="26" viewBox="0 0 32 26" aria-hidden>
      <path d="M1 4.5A3.5 3.5 0 0 1 4.5 1h7.2a3 3 0 0 1 2.3 1.1L15.6 4H27.5A3.5 3.5 0 0 1 31 7.5V10H1V4.5Z" className="fdm-glyph__back" />
      <rect x="1" y="7" width="30" height="18" rx="3.5" className="fdm-glyph__front" />
    </svg>
  );
}

/** Pill tabs after the reference ("My project · Gallery"). */
function PillTabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { value: T; label: string; count: number }[] }) {
  return (
    <div className="fdm-tabs" role="tablist">
      {items.map((it) => (
        <button key={it.value} role="tab" aria-selected={value === it.value} className={cx(value === it.value && 'is-on')} onClick={() => onChange(it.value)}>
          {it.label}
          <span>{it.count}</span>
        </button>
      ))}
    </div>
  );
}

function TeamFiles() {
  const { state } = useStore();
  const docs = state.docs.filter((d) => d.folderId === TEAM);
  return (
    <div className="fdm-team">
      <div className="fdm-drop">
        <Upload size={18} />
        <b>Drop files to share them with Spark</b>
        <span className="faint">Or use Upload. Files you add in a chat land here too.</span>
      </div>
      <div className="fdm-list">
        {docs.map((d) => (
          <div key={d.id} className="fdm-row">
            <FolderIcon size={14} className="faint" />
            <span>{d.name}</span>
            <span className="faint">{state.people.find((p) => p.id === d.uploadedBy)?.name.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VariantTabs() {
  const { state } = useStore();
  const [tab, setTab] = useState<'spark' | 'team'>('spark');
  const spark = state.folders.filter((f) => f.parentId === null && f.id !== TEAM);
  return (
    <div className="fdm-page">
      <div className="fdm-head">
        <PillTabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'spark', label: 'From Spark', count: spark.length },
            { value: 'team', label: 'From your team', count: state.docs.filter((d) => d.folderId === TEAM).length },
          ]}
        />
        {tab === 'team' ? (
          <Button variant="primary" icon={Upload}>
            Upload
          </Button>
        ) : (
          <span className="fdm-note">
            <Lock size={13} /> Shared by Spark · view only
          </span>
        )}
      </div>
      {tab === 'spark' ? (
        <div className="fdm-grid">
          {spark.map((f) => (
            <FolderCard key={f.id} f={f} />
          ))}
        </div>
      ) : (
        <TeamFiles />
      )}
    </div>
  );
}

function VariantSections() {
  const { state } = useStore();
  const spark = state.folders.filter((f) => f.parentId === null && f.id !== TEAM);
  const team = state.folders.find((f) => f.id === TEAM)!;
  return (
    <div className="fdm-page">
      <div className="fdm-section">
        <div className="fdm-section__head">
          <h3>Your team</h3>
          <Button size="sm" variant="primary" icon={Upload}>
            Upload
          </Button>
        </div>
        <div className="fdm-grid">
          <FolderCard f={team} />
          <div className="fdm-drop fdm-drop--card">
            <Upload size={18} />
            <b>Drop files here</b>
            <span className="faint">They go to From your team.</span>
          </div>
        </div>
      </div>
      <div className="fdm-section">
        <div className="fdm-section__head">
          <h3>From Spark</h3>
          <span className="fdm-note">
            <Lock size={13} /> View only
          </span>
        </div>
        <div className="fdm-grid">
          {spark.map((f) => (
            <FolderCard key={f.id} f={f} />
          ))}
        </div>
      </div>
    </div>
  );
}

function VariantMarks() {
  const { state } = useStore();
  const [tab, setTab] = useState<'all' | 'spark' | 'team'>('all');
  const top = state.folders.filter((f) => f.parentId === null);
  const shown = top.filter((f) => tab === 'all' || (tab === 'team') === (f.id === TEAM));
  return (
    <div className="fdm-page">
      <div className="fdm-head">
        <PillTabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'all', label: 'All', count: top.length },
            { value: 'spark', label: 'From Spark', count: top.length - 1 },
            { value: 'team', label: 'Your team', count: 1 },
          ]}
        />
        <Button variant="primary" icon={Upload}>
          Upload
        </Button>
      </div>
      <div className="fdm-grid">
        {shown.map((f) => (
          <FolderCard key={f.id} f={f} mark={f.id === TEAM ? 'team' : 'spark'} />
        ))}
      </div>
    </div>
  );
}

/** D: two tabs with marks; no All, no Upload button. Your team's tab ends with a drop card, which is
 *  how files get in (click it to pick files). */
function VariantMarksDrop() {
  const { state } = useStore();
  const [tab, setTab] = useState<'spark' | 'team'>('spark');
  const spark = state.folders.filter((f) => f.parentId === null && f.id !== TEAM);
  const team = state.folders.filter((f) => f.id === TEAM);
  return (
    <div className="fdm-page">
      <div className="fdm-head">
        <PillTabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'spark', label: 'From Spark', count: spark.length },
            { value: 'team', label: 'Your team', count: team.length },
          ]}
        />
      </div>
      <div className="fdm-grid">
        {(tab === 'spark' ? spark : team).map((f) => (
          <FolderCard key={f.id} f={f} mark={tab} />
        ))}
        {tab === 'team' && (
          <button className="fdm-drop fdm-drop--card" type="button">
            <Upload size={18} />
            <b>Drop files here</b>
            <span className="faint">Or click to choose. They go to From your team.</span>
          </button>
        )}
      </div>
    </div>
  );
}

const VARIANTS: { v: Variant; label: string; note: string }[] = [
  { v: 'tabs', label: 'A · Two tabs', note: 'Pill tabs: From Spark shows Spark’s folders, view only. From your team opens the team’s files with Upload and a drop zone. Upload exists only on that tab.' },
  { v: 'sections', label: 'B · Two sections', note: 'No tabs: Your team on top (its folder and a drop card, with Upload), From Spark below with a view-only note.' },
  { v: 'marks', label: 'C · Tabs and marks', note: 'All, From Spark, Your team. Every card says whose it is with a mark, not a label: the spark for Spark’s folders, your team’s faces on yours. Upload always goes to From your team.' },
  { v: 'marks-drop', label: 'D · Tabs, marks and drop', note: 'From Spark and Your team, no All and no Upload button. Cards carry the mark: the spark on Spark’s folders, your team’s faces on yours. On Your team, a drop card beside the folder is how files get in; click it to choose files.' },
];

export function FoldersDemo() {
  const [v, setV] = useState<Variant>('tabs');
  const [card, setCard] = useState<CardStyle>('white');
  const cur = VARIANTS.find((x) => x.v === v)!;
  return (
    <div className={cx('cdemo fdm', card === 'ground' && 'fdm--ground')}>
      {/* The folder front's shape, shared by every card's frosted pocket. */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <clipPath id="fdm-pocket-clip" clipPathUnits="objectBoundingBox">
          <path d={POCKET} transform="scale(0.01)" />
        </clipPath>
      </svg>
      <PageHeader title="Documents · folders" sub="Folder cards after the reference, in the brand’s tints, and three ways to show what your team can upload and what comes from Spark." />
      <div className="fdm-switch">
        {VARIANTS.map((x) => (
          <button key={x.v} className={cx(v === x.v && 'is-on')} onClick={() => setV(x.v)}>
            {x.label}
          </button>
        ))}
      </div>
      <div className="fdm-switch">
        <span className="fdm-switch__label">Card</span>
        <button className={cx(card === 'white' && 'is-on')} onClick={() => setCard('white')}>
          White
        </button>
        <button className={cx(card === 'ground' && 'is-on')} onClick={() => setCard('ground')}>
          Page colour
        </button>
        <button className={cx(card === 'folder' && 'is-on')} onClick={() => setCard('folder')}>
          Folder with template sheets
        </button>
      </div>
      <p className="fdm-about">{cur.note}</p>
      <div className="fdm-frame">
        <div className="fdm-frame__title">
          <b>Documents</b>
          <span className="fdm-search">
            <Search size={14} /> Search all files
          </span>
        </div>
        <CardStyleCtx.Provider value={card}>
        {v === 'tabs' && <VariantTabs />}
        {v === 'sections' && <VariantSections />}
        {v === 'marks' && <VariantMarks />}
        {v === 'marks-drop' && <VariantMarksDrop />}
        </CardStyleCtx.Provider>
      </div>
    </div>
  );
}

// Prototype-only page (#/demo/glass-folders): new looks for the folders on Documents, after the brand's material
// (p. 34: soft frosted glass holding spectral light; frosted, never flat; the spectrum flows Cobalt to Ember) and
// its pieces (p. 36 the glass keys, p. 40 “Layer by layer”). Each folder holds its own light, two neighbours on
// the spectrum; the client's own folder is clear glass with no light, so it never reads as one of Spark's.
import { useState, type CSSProperties } from 'react';
import { PageHeader, cx } from '../../components/ui/primitives';

type F = { name: string; sub: string; n: number; c1: string; c2: string; kinds: string[]; review?: number; team?: boolean };

const FOLDERS: F[] = [
  { name: 'Brand guidelines', sub: 'Logo, colour and voice', n: 4, c1: '#1e3bd6', c2: '#7a45e6', kinds: ['PDF 3', 'ZIP 1'] },
  { name: 'Strategy', sub: 'Positioning and audience', n: 3, c1: '#8aa6ec', c2: '#1e3bd6', kinds: ['PDF 2', 'DOC 1'] },
  { name: 'Proposals', sub: 'Every proposal from Spark', n: 6, c1: '#7a45e6', c2: '#e9588e', kinds: ['PDF 6'] },
  { name: 'Creative', sub: 'Concepts and photography', n: 8, c1: '#e8501f', c2: '#e9588e', kinds: ['JPG 5', 'FIG 3'], review: 1 },
  { name: 'Research reports', sub: 'Audits and social digests', n: 5, c1: '#e9588e', c2: '#e8501f', kinds: ['PDF 4', 'XLS 1'] },
  { name: 'Your team', sub: 'Files your team shares', n: 1, c1: '#9aa6bd', c2: '#c8d8f0', kinds: ['PDF 1'], team: true },
];

const LOOKS = [
  {
    v: 'pocket',
    label: 'A · Frosted pocket',
    note: 'The folder as a glass object: its light held in the back of the folder, the files standing in it, a frosted front pocket the light and the files show through. On hover the files rise out of the pocket.',
  },
  {
    v: 'tile',
    label: 'B · Glass tile',
    note: 'A compact frosted glass tile: the folder’s light held only in its small glass folder, the name, and what is inside as quiet mono chips. On hover the glass turns a little whiter.',
  },
  {
    v: 'layers',
    label: 'C · Layer by layer',
    note: 'After “Layer by layer. Idea to impact.” (p. 40): the folder as a stack of frosted glass sheets lying in space, tinted by its light, the top one a page. On hover the sheets lift apart.',
  },
  {
    v: 'tab',
    label: 'D · Glass folder with its light',
    note: 'The whole card is the folder: a frosted body with a tab, a one-pixel rim, its light cast onto the Sand beneath like the brand’s glass. On hover a page slides up from behind.',
  },
] as const;

type Look = (typeof LOOKS)[number]['v'];

function Badge({ f }: { f: F }) {
  if (f.review) return <span className="gfo-badge">{f.review} to review</span>;
  if (f.team)
    return (
      <span className="gfo-team" aria-label="Shared by your team">
        <i>LH</i>
        <i>OR</i>
        <i>RA</i>
      </span>
    );
  return null;
}

function Lines() {
  return (
    <>
      <i />
      <i />
      <i />
    </>
  );
}

function Folder({ f, look }: { f: F; look: Look }) {
  const style = { '--c1': f.c1, '--c2': f.c2 } as CSSProperties;
  const text = (
    <span className="gfo-text">
      <b>{f.name}</b>
      <span>{f.sub}</span>
    </span>
  );
  if (look === 'pocket')
    return (
      <a href="#/documents" className={cx('gfo gfo--pocket', f.team && 'is-team')} style={style}>
        <span className="gfo-head">
          {text}
          <Badge f={f} />
        </span>
        <span className="gfo-obj" aria-hidden>
          <span className="gfo-back" />
          <span className="gfo-sheet gfo-sheet--1">
            <Lines />
          </span>
          <span className="gfo-sheet gfo-sheet--2">
            <Lines />
          </span>
          <span className="gfo-front">
            <span className="gfo-count">{f.n} files</span>
          </span>
        </span>
      </a>
    );
  if (look === 'tile')
    return (
      <a href="#/documents" className={cx('gfo gfo--tile', f.team && 'is-team')} style={style}>
        <span className="gfo-head">
          {/* A glass folder: its back with the tab holds the light, a page stands in it, a frosted front. */}
          <span className="gfo-mini" aria-hidden>
            <span className="gfo-mini__back" />
            <span className="gfo-mini__sheet" />
            <span className="gfo-mini__front" />
          </span>
          <Badge f={f} />
        </span>
        {text}
        <span className="gfo-kinds">
          {f.kinds.map((k) => (
            <span key={k}>{k}</span>
          ))}
        </span>
      </a>
    );
  if (look === 'layers')
    return (
      <a href="#/documents" className={cx('gfo gfo--layers', f.team && 'is-team')} style={style}>
        <span className="gfo-head gfo-head--abs">
          <span />
          <Badge f={f} />
        </span>
        <span className="gfo-stack" aria-hidden>
          <span className="gfo-layer gfo-layer--1" />
          <span className="gfo-layer gfo-layer--2" />
          <span className="gfo-layer gfo-layer--3">
            <Lines />
          </span>
        </span>
        {text}
        <span className="gfo-count gfo-count--foot">{f.n} files</span>
      </a>
    );
  return (
    <a href="#/documents" className={cx('gfo gfo--tab', f.team && 'is-team')} style={style}>
      <span className="gfo-tabshape" aria-hidden />
      <span className="gfo-peek" aria-hidden>
        <Lines />
      </span>
      <span className="gfo-body">
        <span className="gfo-head">
          <span className="gfo-count">{f.n} files</span>
          <Badge f={f} />
        </span>
        {text}
      </span>
    </a>
  );
}

export function GlassFoldersDemo() {
  const [look, setLook] = useState<Look>('pocket');
  const cur = LOOKS.find((l) => l.v === look)!;
  return (
    <div className="cdemo">
      <PageHeader
        title="Folders · glass"
        sub="New looks for the folders on Documents, after the brand’s frosted light. Each folder holds its own light; your team’s folder is clear glass. Hover them. Prototype only."
      />
      <div className="fdm-switch">
        {LOOKS.map((l) => (
          <button key={l.v} className={cx(look === l.v && 'is-on')} onClick={() => setLook(l.v)}>
            {l.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{cur.note}</p>
      <div className="gfo-stage">
        <div className={cx('gfo-grid', `gfo-grid--${look}`)}>
          {FOLDERS.map((f) => (
            <Folder key={f.name} f={f} look={look} />
          ))}
        </div>
      </div>
    </div>
  );
}

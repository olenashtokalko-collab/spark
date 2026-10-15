// Prototype-only page (#/demo/toc-align): is the proposal's "On this page" menu consistent with the
// app's tabs? Each card shows the REAL tabs (Overview / Files / Activity) above the menu, so the two can
// be compared in one glance. "Now" is the live menu; A to D bring it closer to the tabs, one step at a time:
//   A  same type as the tabs (14 px, Medium)
//   B  + the active text is Ink and Cobalt stays only in the marker, as with the tabs' underline
//   C  + the heading is a quiet caption instead of uppercase tracked capitals   (recommended)
//   D  + rows as tall as the tabs (40 px)
import { useState } from 'react';
import { PageHeader, Tabs, cx } from '../../components/ui/primitives';

const ITEMS = [
  { id: 'objectives', label: 'Objectives' },
  { id: 'scope', label: 'Scope & deliverables' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'investment', label: 'Investment' },
  { id: 'terms', label: 'Terms' },
  { id: 'comments', label: 'Comments', count: 2 },
];

type Variant = 'now' | 'a' | 'b' | 'c' | 'd';

const VARIANTS: { id: Variant; name: string; note: string }[] = [
  { id: 'now', name: 'Now', note: '15 px, regular weight, the active item in Cobalt text, a marker on a line, uppercase tracked heading, rows 44 px. Next to the tabs it reads as a different rule: bigger, lighter, blue text.' },
  { id: 'a', name: 'A · Same type as the tabs', note: 'Only the type changes: 14 px and Medium (500), as in the tabs. Colours and marker as now.' },
  { id: 'b', name: 'B · A + Ink text, Cobalt only in the marker', note: 'The active item is Ink like the active tab, the inactive ones the same grey as the inactive tabs; Cobalt lives only in the marker (the tabs’ underline). Colour roles now match.' },
  { id: 'c', name: 'C · B + a quiet heading', note: 'The heading “On this page” becomes a small grey caption like “Your request”, not uppercase capitals that appear nowhere else. The recommended one.' },
  { id: 'd', name: 'D · C + rows as tall as the tabs', note: 'Rows 40 px like the tabs, so the vertical rhythm matches too. The most compact; the marker’s line is a little shorter.' },
];

function Toc({ variant }: { variant: Variant }) {
  const [active, setActive] = useState(0);
  const row = variant === 'd' ? 40 : 44;
  const PAD = 12;
  const X = 10;
  const H = ITEMS.length * row + PAD * 2;
  const y = PAD + (active + 0.5) * row;
  const d = `M ${X} 0 V ${Math.max(0, y - 28)} C ${X} ${y - 11}, ${X + 11} ${y - 17}, ${X + 11} ${y} C ${X + 11} ${y + 17}, ${X} ${y + 11}, ${X} ${Math.min(H, y + 28)} V ${H}`;
  return (
    <nav className={cx('tal__toc', `tal--${variant}`)} style={{ ['--row' as string]: `${row}px` }} aria-label="On this page">
      <div className="tal__title">On this page</div>
      <div className="tal__list">
        <svg className="tocv__line" width="36" height={H} viewBox={`0 0 36 ${H}`} aria-hidden>
          <path style={{ d: `path("${d}")` }} fill="none" />
          <circle cx={X - 1} r="6.5" style={{ cy: `${y}px` }} />
        </svg>
        {ITEMS.map((it, i) => (
          <button key={it.id} className={cx('tal__item', i === active && 'is-active')} onClick={() => setActive(i)}>
            {it.label}
            {it.count ? <span className="tal__count">{it.count}</span> : null}
          </button>
        ))}
      </div>
    </nav>
  );
}

function Stage({ variant }: { variant: Variant }) {
  const [tab, setTab] = useState<'overview' | 'files' | 'activity'>('overview');
  return (
    <div className="tal__stage">
      <div className="tal__tabs">
        <div className="tal__cap">The app’s tabs</div>
        <Tabs
          className="tabs--underline"
          value={tab}
          onChange={setTab}
          items={[
            { value: 'overview', label: 'Overview' },
            { value: 'files', label: 'Files', count: 3 },
            { value: 'activity', label: 'Activity', count: 4 },
          ]}
        />
      </div>
      <div className="tal__cap">The menu on the proposal page</div>
      <Toc variant={variant} />
    </div>
  );
}

export function TocAlignDemo() {
  return (
    <div className="cdemo taldemo">
      <PageHeader
        title="Menu next to the tabs"
        sub="Is the proposal’s “On this page” menu consistent with the app’s tabs? Today it is only partly. Each card shows the real tabs above the menu; click the items. The first card is how it is now, then four steps towards the tabs."
      />
      <div className="taldemo__grid">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <Stage variant={v.id} />
          </section>
        ))}
      </div>
    </div>
  );
}

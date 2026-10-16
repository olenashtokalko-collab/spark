// Prototype-only page (#/demo/toc): looks for the proposal's side contents
// after the brand book: hairline rules, uppercase mono labels (p. 12), Ember
// Doto numbers ("01 Ink objects carry the spark", p. 18) and the Noor light
// (p. 19). Each sits under the white decision card, as on the proposal page.
// Click the items.
import { useState } from 'react';
import { AlignLeft } from 'lucide-react';
import { PageHeader, cx } from '../../components/ui/primitives';

const ITEMS = [
  { id: 'summary', label: 'Summary' },
  { id: 'objectives', label: 'Objectives' },
  { id: 'scope', label: 'Scope & deliverables' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'investment', label: 'Investment' },
  { id: 'terms', label: 'Terms' },
  { id: 'comments', label: 'Comments', count: 2 },
];

const VARIANTS = [
  { id: 'today', name: '1 · Today', note: 'A grey filled row marks the section in view. The reference point.' },
  { id: 'rules', name: '2 · Hairlines', note: 'After the principles list (p. 18): rows split by hairlines, the section in view in Ink, the rest in grey. No fill.' },
  { id: 'numbers', name: '3 · Ember numbers', note: '“01 Ink objects carry the spark” (p. 18): Doto numbers in Ember, hairlines between rows. The current number lights up.' },
  { id: 'mono', name: '4 · Mono labels', note: 'After “Human mind · the input” (p. 12): uppercase mono labels; the section in view gets an Ink rule above it.' },
  { id: 'rail', name: '5 · Ink rail', note: 'A thin rail on the left; an Ink segment slides to the section in view. Quiet, like a scroll position.' },
  { id: 'noor', name: '6 · Noor progress', note: 'The light fills the rail from Cobalt to Ember down to the section in view: how far through the proposal you are.' },
  { id: 'dot', name: '7 · Line and dot (reference)', note: 'After the reference: a thin line, grey labels, and a dot for the section in view that the line bends around. The dot slides when you click. The label in view is Ink.' },
  { id: 'dotc', name: '8 · Line and dot in Cobalt', note: 'The same, in the product’s colour: a Cobalt dot, and the section in view in Cobalt as in today’s menu.' },
  { id: 'docs', name: '9 · Docs rail (after the reference)', note: 'The documentation-site pattern: a small list icon with the heading, a hairline rail down the left, and a very light rail. Hover: a pale grey bar fades in beside the row and the text darkens. Selected: one accent bar that slides down the rail to the row, the text turning accent as it arrives.' },
  { id: 'docsink', name: '10 · Docs rail, Ink text', note: 'The same rail and states, but with the roles of the tabs: the selected row is Ink and Cobalt is only in the bar, as the tabs have Ink text and a Cobalt underline. Quieter than 9.' },
  { id: 'docsreg', name: '11 · Docs rail, Regular weight', note: 'The same as 9 with Regular (400) instead of Medium (500) for the rows. Lighter and more like the reference; the tabs and the rest of the product are Medium, so it would be the one place that is not.' },
] as const;

const ROW = 44; // row height of the two line-and-dot looks (matches --row below)
const PAD = 12; // room for the line above the first and below the last row

type VariantId = (typeof VARIANTS)[number]['id'];

function Toc({ variant }: { variant: VariantId }) {
  const [active, setActive] = useState(0);
  const docs = variant === 'docs' || variant === 'docsink' || variant === 'docsreg';
  const links = ITEMS.map((it, i) => (
    <a
      key={it.id}
      href={`#sec-${it.id}`}
      className={cx('ptoc__item', i === active && 'is-active', i < active && 'is-past')}
      onClick={(e) => {
        e.preventDefault();
        setActive(i);
      }}
    >
      {variant === 'numbers' && <span className="tocv__num">{String(i + 1).padStart(2, '0')}</span>}
      <span className="tocv__label">{it.label}</span>
      {it.count ? <span className="ptoc__count">{it.count}</span> : null}
    </a>
  ));
  const dot = variant === 'dot' || variant === 'dotc';
  // The line runs the full height and bends round the dot; the dot sits just left of it.
  const H = ITEMS.length * ROW + PAD * 2;
  const y = PAD + (active + 0.5) * ROW;
  const x = 10;
  const d = `M ${x} 0 V ${Math.max(0, y - 28)} C ${x} ${y - 11}, ${x + 11} ${y - 17}, ${x + 11} ${y} C ${x + 11} ${y + 17}, ${x} ${y + 11}, ${x} ${Math.min(H, y + 28)} V ${H}`;
  return (
    <nav
      className={cx('ptoc', 'tocv', `tocv--${variant}`)}
      style={{ ['--i' as string]: active, ['--n' as string]: ITEMS.length }}
      aria-label="Proposal sections"
    >
      {dot && (
        <svg className="tocv__line" width="36" height={H} viewBox={`0 0 36 ${H}`} aria-hidden>
          <path style={{ d: `path("${d}")` }} fill="none" />
          <circle cx={x - 1} r="6.5" style={{ cy: `${y}px` }} />
        </svg>
      )}
      {docs && (
        <div className="tocv__head">
          <AlignLeft size={15} strokeWidth={1.8} /> On this page
        </div>
      )}
      {docs ? <div className="tocv__items">{links}</div> : links}
    </nav>
  );
}

export function TocDemo() {
  return (
    <div className="cdemo tocdemo">
      <PageHeader title="Proposal contents" sub="Ten looks for the side menu on the proposal page: after the brand book (hairlines, mono labels, Ember numbers, the Noor light), a line with a dot, and the documentation-site rail. Click the items." />
      <div className="tocdemo__grid">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className="tocdemo__stage">
              <div className="tocdemo__decision">
                <strong>AED 186,000</strong>
                <span>10 weeks · starts 9 Nov · due today</span>
              </div>
              <Toc variant={v.id} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

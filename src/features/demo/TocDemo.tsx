// Prototype-only page (#/demo/toc): looks for the proposal's side contents
// after the brand book: hairline rules, uppercase mono labels (p. 12), Ember
// Doto numbers ("01 Ink objects carry the spark", p. 18) and the Noor light
// (p. 19). Each sits under the white decision card, as on the proposal page.
// Click the items.
import { useState } from 'react';
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
] as const;

type VariantId = (typeof VARIANTS)[number]['id'];

function Toc({ variant }: { variant: VariantId }) {
  const [active, setActive] = useState(0);
  return (
    <nav
      className={cx('ptoc', 'tocv', `tocv--${variant}`)}
      style={{ ['--i' as string]: active, ['--n' as string]: ITEMS.length }}
      aria-label="Proposal sections"
    >
      {ITEMS.map((it, i) => (
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
      ))}
    </nav>
  );
}

export function TocDemo() {
  return (
    <div className="cdemo tocdemo">
      <PageHeader title="Proposal contents" sub="Six looks for the side menu on the proposal page, after the brand book: hairlines, mono labels, Ember numbers and the Noor light. Click the items." />
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

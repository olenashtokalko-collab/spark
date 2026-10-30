// Prototype-only page (#/demo/tab-looks): ways the page tabs (Overview / Company profile, Overview / Messages / Files /
// Activity) could look in the glass variant, side by side. Click through each.
import { useState } from 'react';
import { PageHeader, cx } from '../../components/ui/primitives';
import { GlassTabs } from '../../components/ui/GlassTabs';

const ITEMS = ['Overview', 'Messages', 'Files', 'Activity'] as const;
type Item = (typeof ITEMS)[number];

const LOOKS = [
  { v: 'now', label: 'Now · glass track', note: 'A glass track, the picked tab a white glass pill.' },
  { v: 'slide', label: '1 · Sliding bubble', note: 'As the filters on Requests: the clear bubble slides to the picked tab with a little spring and leans towards the one you point at.' },
  { v: 'bare', label: '2 · No track', note: 'Only the picked tab in a glass bubble; the others are plain words.' },
  { v: 'ink', label: '3 · Ink picked', note: 'The picked tab a solid Ink pill with white words. Very clear, but it competes with the Ink primary button.' },
  { v: 'dot', label: '4 · Words and a dot', note: 'No fill, no track: the picked tab in Ink with a small Cobalt dot under it, the rest grey.' },
  { v: 'light', label: '5 · Underline of light', note: 'As before, but the line under the picked tab is a thin band of the spectrum, Cobalt to Ember.' },
] as const;

function Simple({ look }: { look: string }) {
  const [on, setOn] = useState<Item>('Overview');
  return (
    <div className={cx('tld', `tld--${look}`)} role="tablist">
      {ITEMS.map((t) => (
        <button key={t} type="button" role="tab" aria-selected={on === t} className={cx(on === t && 'is-on')} onClick={() => setOn(t)}>
          {t}
          {t === 'Activity' && <span className="tld-n">3</span>}
        </button>
      ))}
    </div>
  );
}

function Slide() {
  const [on, setOn] = useState<Item>('Overview');
  return (
    <div className="tld-slide">
      <GlassTabs label="Sections" value={on} onChange={setOn} items={ITEMS.map((t) => ({ value: t, label: t, count: t === 'Activity' ? 3 : undefined }))} />
    </div>
  );
}

export function TabLooksDemo() {
  return (
    <div className="cdemo">
      <PageHeader title="Glass · page tabs" sub="Ways the page tabs could look in the glass variant. Click through each. Prototype only." />
      <div className="tld-grid">
        {LOOKS.map((l) => (
          <section key={l.v} className="tld-col">
            <span className="gk-label">{l.label}</span>
            <div className="tld-stage">{l.v === 'slide' ? <Slide /> : <Simple look={l.v} />}</div>
            <p className="fdm-about">{l.note}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

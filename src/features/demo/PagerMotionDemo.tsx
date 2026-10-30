// Prototype-only page (#/demo/pager-motion): how the issue card could move when you page with the arrows. Each look
// runs the same three issues; press the arrows in any card to compare.
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader, cx } from '../../components/ui/primitives';

const ISSUES = [
  { tag: 'High impact', src: 'Website', title: 'Slow on mobile', body: 'Product pages take 6.8 s to load on 4G, mostly because of uncompressed hero images.' },
  { tag: 'Medium impact', src: 'Social', title: 'Quiet on TikTok', body: 'Three posts in six weeks; Riyadh shoppers find new brands there first.' },
  { tag: 'High impact', src: 'Brand', title: 'Where it gets lost', body: 'Online, product photos on white look like any global chain. The regional story lives only in store design.' },
];

const LOOKS = [
  { v: 'slide', label: 'A · Slide', note: 'The card moves 16px the way you page and fades; the next comes in from the other side. The head stays still.' },
  { v: 'blur', label: 'B · Slide + blur', note: 'As A, with the glass: the leaving card blurs out, the new one sharpens in.' },
  { v: 'deck', label: 'C · Deck', note: 'A stack: the next card’s edge shows under this one; paging, the top card slips away and the next rises into place.' },
  { v: 'glint', label: 'D · Glint', note: 'The words swap in place; a soft band of Noor light passes over the card as they do.' },
] as const;

function Pager({ look }: { look: (typeof LOOKS)[number]['v'] }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const go = (d: 1 | -1) => {
    setDir(d);
    setI((x) => (x + d + ISSUES.length) % ISSUES.length);
  };
  const f = ISSUES[i];
  return (
    <div className="pmd-sec">
      <header className="pmd-head">
        <b>Where we think you have issues</b>
        <span className="pmd-count">
          <span key={i} className={cx('pmd-num', dir > 0 ? 'is-up' : 'is-down')}>
            {i + 1}
          </span>{' '}
          / {ISSUES.length}
        </span>
        <button type="button" onClick={() => go(-1)} aria-label="Previous">
          <ChevronLeft size={16} />
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Next">
          <ChevronRight size={16} />
        </button>
      </header>
      <div className={cx('pmd-stage', `pmd--${look}`)}>
        {look === 'deck' && <span className="pmd-under" aria-hidden />}
        <article key={i} className={cx('pmd-card', dir > 0 ? 'is-next' : 'is-prev')}>
          <span className={cx('pmd-tag', f.tag.startsWith('High') && 'is-high')}>{f.tag}</span>
          <b>{f.title}</b>
          <span>{f.body}</span>
        </article>
      </div>
    </div>
  );
}

export function PagerMotionDemo() {
  return (
    <div className="cdemo">
      <PageHeader title="Issues · paging motion" sub="How the issue card could move when you press the arrows. Press them in each card. Prototype only." />
      <div className="pmd-grid">
        {LOOKS.map((l) => (
          <section key={l.v} className="pmd-col">
            <span className="gk-label">{l.label}</span>
            <Pager look={l.v} />
            <p className="fdm-about">{l.note} The number turns over with it.</p>
          </section>
        ))}
      </div>
    </div>
  );
}

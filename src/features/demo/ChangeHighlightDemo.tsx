// Prototype-only page (#/demo/change-highlight): looks for how the manager's
// proposal page marks what changed from the previous version. Every look shows the
// same v1 → v2 changes: a reworded summary, a changed amount, a new line, a removed one.
import { useState } from 'react';
import { PageHeader, Switch, cx } from '../../components/ui/primitives';
import { diffWords } from '../../lib/diffWords';

const OLD_SUMMARY = 'An 11-week programme from positioning to opening week, with two launch films shot in Riyadh.';
const NEW_SUMMARY = 'A 10-week programme from positioning to opening week. Films move to a second wave around Ramadan and are quoted separately.';
const LINES = [
  { item: 'KSA positioning', was: 38000, now: 38000 },
  { item: 'Launch content', was: 72000, now: 64000 },
  { item: 'Project management', was: undefined, now: 10000 },
  { item: 'Launch films', was: 28000, now: undefined },
];
const aed = (n: number) => `AED ${n.toLocaleString('en-US')}`;

const VARIANTS = [
  { id: 'tint', name: '1 · Ink tint', note: 'Today’s highlight in the black of the product instead of blue: a light grey wash behind what changed.' },
  { id: 'marker', name: '2 · Marker', note: 'A warm highlighter stroke under the lower half of the changed text, as if marked by hand. Text stays easy to read.' },
  { id: 'bar', name: '3 · Margin bar', note: 'The text stays clean; a short black bar in the left margin marks each changed line, like a revised contract.' },
  { id: 'track', name: '4 · Track changes', note: 'Word by word: removed words struck through in grey, added words underlined. Shows exactly what was rewritten.' },
  { id: 'dotted', name: '5 · Dotted underline', note: 'A quiet dotted underline under what changed; hovering shows what it said before. The calmest look.' },
  { id: 'chip', name: '6 · Before → after', note: 'Changed values sit next to the old ones as a small “was” chip. Text changes get a soft tint and a “Rewritten” label.' },
] as const;
type Id = (typeof VARIANTS)[number]['id'];

function Sample({ id, on }: { id: Id; on: boolean }) {
  const v = on ? id : 'off';
  const mark = (changed: boolean, text: string, was?: string) =>
    changed && v !== 'off' ? (
      <span className={cx('chd-mark', `chd-mark--${v}`)} title={v === 'dotted' && was ? `Was: ${was}` : undefined}>
        {text}
      </span>
    ) : (
      text
    );
  return (
    <div className={cx('chd', `chd--${v}`)}>
      <h4 className="chd__title">Overview</h4>
      <p className={cx('chd__p', v === 'bar' && 'chd-bar')}>
        {v === 'track' ? (
          diffWords(OLD_SUMMARY, NEW_SUMMARY).map((w, i) => (
            <span key={i} className={cx(w.k === 'add' && 'chd-add', w.k === 'del' && 'chd-del')}>
              {w.w}{' '}
            </span>
          ))
        ) : (
          <>
            {mark(true, NEW_SUMMARY, OLD_SUMMARY)}
            {v === 'chip' && <span className="chd-label">Rewritten</span>}
          </>
        )}
      </p>
      <h4 className="chd__title">Investment</h4>
      <table className="chd-table">
        <tbody>
          {LINES.filter((l) => v !== 'off' || l.now !== undefined).map((l) => {
            const isNew = l.was === undefined;
            const removed = l.now === undefined;
            const changed = !isNew && !removed && l.was !== l.now;
            return (
              <tr key={l.item} className={cx(v !== 'off' && (changed || isNew || removed) && v === 'bar' && 'chd-bar', v !== 'off' && removed && 'chd-removed')}>
                <td>
                  {isNew && v !== 'off' && v !== 'track' ? mark(true, l.item) : l.item}
                  {v !== 'off' && isNew && <span className="chd-label">{v === 'track' ? 'Added' : 'New'}</span>}
                  {v !== 'off' && removed && <span className="chd-label chd-label--removed">Removed</span>}
                </td>
                <td className="num">
                  {changed && v === 'chip' && <span className="chd-was">was {aed(l.was!)}</span>}
                  {changed && v === 'track' && <span className="chd-del">{aed(l.was!)}</span>}{' '}
                  {changed ? (v === 'track' ? <span className="chd-add">{aed(l.now!)}</span> : mark(true, aed(l.now!), aed(l.was!))) : aed((l.now ?? l.was)!)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ChangeHighlightDemo() {
  return (
    <div className="cdemo cmddemo">
      <PageHeader title="Changes between versions" sub="Six ways to mark what the manager changed from the previous version. Each card has the toggle that will sit next to the version switcher." />
      <div className="cmddemo__grid">
        {VARIANTS.map((v) => (
          <Card key={v.id} id={v.id} name={v.name} note={v.note} />
        ))}
      </div>
    </div>
  );
}

function Card({ id, name, note }: { id: Id; name: string; note: string }) {
  const [on, setOn] = useState(true);
  return (
    <section className="gdemo__card">
      <header>
        <h3>{name}</h3>
        <p>{note}</p>
      </header>
      <div className="cmddemo__stage">
        <div className="chd-tools">
          <span>
            Version 2 <span className="faint">of 3</span>
          </span>
          <span className="spv-toggle">
            <Switch checked={on} onChange={setOn} label="Show changes from v1" />
            <span onClick={() => setOn(!on)}>Show changes from v1</span>
          </span>
        </div>
        <Sample id={id} on={on} />
      </div>
    </section>
  );
}

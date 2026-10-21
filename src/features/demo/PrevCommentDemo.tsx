// Prototype-only page (#/demo/prev-comment): on version 3 with "Show changes from v2"
// on, ways to show what the client asked on v2 next to the section it changed, so a
// change reads as the answer to a request.
import { useState } from 'react';
import { Check, ChevronDown, CornerDownRight } from 'lucide-react';
import { Avatar, PageHeader, Switch, cx } from '../../components/ui/primitives';

const layla = { name: 'Layla Haddad', hue: 20, org: 'client' as const };
const ASK = 'Starting 9 November clashes with the school holidays. 16 November works better.';

const VARIANTS = [
  {
    id: 'line',
    name: '1 · One quiet line',
    note: 'Under the changed section, a single grey line: who asked on v2 and the start of what they said. Click to read it all. Takes almost no room.',
  },
  {
    id: 'pair',
    name: '2 · Asked → changed',
    note: 'The request and the answer as a pair: the client’s comment from v2, then “Changed in v3” with what moved. Reads as a closed loop.',
  },
  {
    id: 'margin',
    name: '3 · In the margin',
    note: 'The v2 comment sits faded in the right margin, level with the section, like a resolved comment in a document. The text column stays clean.',
  },
] as const;
type Id = (typeof VARIANTS)[number]['id'];

function Timeline({ on }: { on: boolean }) {
  return (
    <div className="pcd-gantt">
      {[
        ['Discovery', 2, 0],
        ['Concept', 3, 2],
        ['Production', 4, 5],
        ['Launch', 1, 9],
      ].map(([n, w, s]) => (
        <div key={n as string} className="pcd-gantt__row">
          <span>{n}</span>
          <span className="faint">{w} wk</span>
          <span className="pcd-gantt__track">
            <i style={{ left: `${((s as number) / 10) * 100}%`, width: `${((w as number) / 10) * 100}%` }} />
          </span>
        </div>
      ))}
      <div className="pcd-gantt__foot faint">
        Start {on && <s className="spv-cut">9 Nov</s>} <span className={cx(on && 'spv-ins')}>16 Nov 2026</span>
      </div>
    </div>
  );
}

function Who() {
  return (
    <div className="spv-comment__who">
      <Avatar person={layla} size={20} />
      <strong>{layla.name}</strong>
      <span className="faint">· on v2 · 9 Oct</span>
    </div>
  );
}

function Prev({ id }: { id: Id }) {
  const [open, setOpen] = useState(false);
  if (id === 'line')
    return (
      <button className={cx('pcd-line', open && 'is-open')} onClick={() => setOpen(!open)}>
        <CornerDownRight size={14} className="pcd-line__icon" />
        <Avatar person={layla} size={18} />
        <span className="pcd-line__text">
          <strong>Layla on v2:</strong> {open ? ASK : `${ASK.slice(0, 48)}…`}
        </span>
        <ChevronDown size={14} className="pcd-line__chev" />
      </button>
    );
  if (id === 'pair')
    return (
      <div className="spv-comments pcd-pair">
        <div className="spv-comment">
          <Who />
          <p>{ASK}</p>
        </div>
        <div className="pcd-answer">
          <span className="pcd-answer__icon">
            <Check size={11} strokeWidth={3} />
          </span>
          <span>
            <strong>Changed in v3:</strong> start moved from 9 Nov to 16 Nov
          </span>
        </div>
      </div>
    );
  return (
    <div className="pcd-note">
      <Who />
      <p>{ASK}</p>
      <span className="pcd-note__done">
        <Check size={12} strokeWidth={2.6} /> Changed in v3
      </span>
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
      <div className="cmddemo__stage pcd-stage">
        <div className="chd-tools">
          <span>
            Version 3 <span className="faint">of 3</span>
          </span>
          <span className="spv-toggle">
            <Switch checked={on} onChange={setOn} label="Show changes from v2" />
            <span onClick={() => setOn(!on)}>Show changes from v2</span>
          </span>
        </div>
        <div className={cx('pcd-body', id === 'margin' && on && 'pcd-body--margin')}>
          <div>
            <h4 className="chd__title">Timeline</h4>
            <Timeline on={on} />
            {on && id !== 'margin' && <Prev id={id} />}
          </div>
          {on && id === 'margin' && <Prev id={id} />}
        </div>
      </div>
    </section>
  );
}

export function PrevCommentDemo() {
  return (
    <div className="cdemo cmddemo">
      <PageHeader
        title="What the client asked, next to what changed"
        sub="Version 3 with “Show changes from v2” on: three ways to show Layla’s comment from v2 under the section it led to changing. With the toggle off, only v3’s own comments show."
      />
      <div className="pcd-list">
        {VARIANTS.map((v) => (
          <Card key={v.id} id={v.id} name={v.name} note={v.note} />
        ))}
      </div>
    </div>
  );
}

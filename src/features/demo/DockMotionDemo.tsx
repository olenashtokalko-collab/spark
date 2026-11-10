// Prototype-only page (#/demo/dock-motion), 10 Nov review: Dr.AI's window folded away at once, didn't answer the
// pointer, and the chat panel popped in. Looks for each of the three, played on the real window in the corner: pick
// one and press the buttons, or fold, hover and open him yourself. The pick stays in this browser and plays on every
// page (lib/dockMotion).
import { Hand, MessageCircle, Minimize2, Play } from 'lucide-react';
import { Button, PageHeader, cx } from '../../components/ui/primitives';
import {
  DRAWER_LOOKS,
  FOLD_LOOKS,
  HOVER_LOOKS,
  dockCmd,
  motionMs,
  setDockMotion,
  useDockMotion,
  type DockMotion,
} from '../../lib/dockMotion';
import type { ReactNode } from 'react';

type Looks = readonly { v: string; label: string; note: string }[];

function Row<K extends keyof DockMotion>({ part, looks, title, lead, children }: { part: K; looks: Looks; title: string; lead: string; children: ReactNode }) {
  const m = useDockMotion();
  const on = looks.find((l) => l.v === m[part]) ?? looks[0];
  return (
    <section className="dmd-row">
      <header>
        <b>{title}</b>
        <span>{lead}</span>
      </header>
      <div className="dmd-chips" role="radiogroup" aria-label={title}>
        {looks.map((l) => (
          <button
            key={l.v}
            type="button"
            role="radio"
            aria-checked={m[part] === l.v}
            className={cx('dmd-chip', m[part] === l.v && 'is-on')}
            onClick={() => setDockMotion({ [part]: l.v } as Partial<DockMotion>)}
          >
            {l.label}
          </button>
        ))}
      </div>
      <p className="dmd-note">{on.note}</p>
      <div className="dmd-acts">{children}</div>
    </section>
  );
}

export function DockMotionDemo() {
  const both = () => {
    dockCmd('fold');
    setTimeout(() => dockCmd('open'), motionMs('fold', 'out') + 700);
  };
  return (
    <div className="dmd">
      <PageHeader
        title="Dr.AI’s motion"
        sub="Pick a look for each, then play it on Dr.AI in the corner, or fold, point at and open him yourself. Your pick plays on every page in this browser. Prototype only."
      />
      <Row part="fold" looks={FOLD_LOOKS} title="Folding and opening" lead="The − in his window, and a click on his head to bring it back.">
        <Button variant="secondary" onClick={() => dockCmd('fold')}>
          <Minimize2 size={15} /> Fold
        </Button>
        <Button variant="secondary" onClick={() => dockCmd('open')}>
          Open
        </Button>
        <Button variant="primary" onClick={both}>
          <Play size={14} /> Fold, then open
        </Button>
      </Row>
      <Row part="hover" looks={HOVER_LOOKS} title="When you point at him" lead="Folded, his head in the corner; open, Dr.AI standing by his window.">
        <span className="dmd-hint">
          <Hand size={15} /> Point at Dr.AI in the corner
        </span>
        <Button variant="secondary" onClick={() => dockCmd('fold')}>
          Fold him to try his head
        </Button>
      </Row>
      <Row part="drawer" looks={DRAWER_LOOKS} title="The chat panel" lead="Ask me in his window, or a click on his head when there is nothing to say.">
        <Button variant="primary" onClick={() => dockCmd('chat')}>
          <MessageCircle size={15} /> Open the chat
        </Button>
        <span className="dmd-hint">Close it with × or a click beside it</span>
      </Row>
    </div>
  );
}

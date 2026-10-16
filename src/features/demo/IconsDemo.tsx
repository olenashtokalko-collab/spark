// Prototype-only page (#/demo/icons): the icon tiles against the brand book's "Icons & interface":
// "Every control follows one recipe: 01 Frosted glass body · 02 Spectrum underneath · 03 Ink or white on top."
// Today the tiles are flat grey squares, so none of the three steps is there. Four looks, each shown on the same
// three things: a specimen (every state, three sizes), the real Activity list and a Stages column.
//   A  Frosted on every tile, spectrum strength by state, Ink glyph
//   B  Every tile fully lit, white glyph (the rule taken literally)
//   C  One lit tile, the rest frosted (recommended: the recipe plus "one cluster per frame")
//   D  Clear glass, the spectrum only as a glow beneath the tile
import { Eye, FilePlus, FileText, Hammer, MessageSquare, Bell, Paperclip, PackageCheck, ThumbsUp, Hourglass } from 'lucide-react';
import { PageHeader, cx } from '../../components/ui/primitives';
import type { Activity } from '../../data/types';
import { ActivityLog } from '../requests/RequestDetail';

type Look = 'now' | 'a' | 'b' | 'c' | 'd';
const LOOKS: { id: Look; name: string; note: string }[] = [
  { id: 'now', name: 'Now · flat grey tiles', note: 'A soft grey square with a grey glyph. Quiet, but there is no glass, no spectrum and nothing lit: none of the three steps of the recipe.' },
  { id: 'a', name: 'A · Frosted on every tile', note: 'Every tile is a frosted glass body with a rim and the glyph in Ink. The spectrum underneath is strongest on the new and current step, weak on the done ones, absent on what is still to do. Steps 01 and 03 everywhere, 02 by state.' },
  { id: 'b', name: 'B · Every tile fully lit', note: 'The recipe taken literally: glass, spectrum under it, a white glyph on every tile. It is the brand, and also a cluster of lit glass in every list; a long Activity list becomes a row of beads.' },
  { id: 'c', name: 'C · One lit tile, the rest frosted', note: 'The new or current step is lit (spectrum, white glyph); done steps are frosted glass with a faint spectrum and an Ink glyph; steps to do are a clear outline. Every tile has the glass body, one per list has the light. The recommended one.' },
  { id: 'd', name: 'D · Clear glass, glow beneath', note: 'The tile is clear glass with an Ink glyph, as in the book’s mail icon; the spectrum is not inside it but a soft glow under it, strong on the current step. The lightest on the page.' },
];

const at = (daysAgo: number, h: number, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
};
const SAMPLE: Activity[] = [
  { id: 'i1', at: at(3, 11), by: 's-dana', kind: 'proposal', text: 'sent a proposal · AED 96,000 · 8 weeks' },
  { id: 'i2', at: at(2, 10, 20), by: 'u-layla', kind: 'decision', text: 'approved the proposal' },
  { id: 'i3', at: at(1, 9), by: 's-youssef', kind: 'status', text: 'started work' },
  { id: 'i4', at: at(0, 9, 10), by: 's-youssef', kind: 'file', text: 'shared Packaging concepts — round 1.pdf for your review' },
];

const STEPS = [
  { icon: FilePlus, label: 'Submitted', s: 'done' },
  { icon: Eye, label: 'In review', s: 'done' },
  { icon: FileText, label: 'Proposal', s: 'done' },
  { icon: ThumbsUp, label: 'Approved', s: 'done' },
  { icon: Hammer, label: 'In progress', s: 'active' },
  { icon: PackageCheck, label: 'Delivered', s: 'todo' },
] as const;

const Mark = ({ icon: I, s, size = 15 }: { icon: typeof Bell; s: 'active' | 'done' | 'todo'; size?: number }) => (
  <span className={cx('gm', `is-${s}`)}>
    <I size={size} strokeWidth={1.8} />
  </span>
);

function Specimen() {
  return (
    <div className="icd__spec">
      <div className="icd__cap">States</div>
      <div className="icd__line">
        <Mark icon={MessageSquare} s="active" />
        <Mark icon={Paperclip} s="done" />
        <Mark icon={Hourglass} s="todo" />
        <span className="icd__lab">current · done · to do</span>
      </div>
      <div className="icd__cap">Sizes</div>
      <div className="icd__line icd__line--sizes">
        <span className="gm gm--sm is-active">
          <Bell size={13} strokeWidth={1.8} />
        </span>
        <span className="gm is-active">
          <Bell size={15} strokeWidth={1.8} />
        </span>
        <span className="gm gm--lg is-active">
          <Bell size={20} strokeWidth={1.7} />
        </span>
        <span className="icd__lab">24 · 32 · 48 px</span>
      </div>
    </div>
  );
}

function Stages() {
  return (
    <ol className="icd__stages">
      {STEPS.map((st) => (
        <li key={st.label} className={`is-${st.s}`}>
          <Mark icon={st.icon} s={st.s} />
          <span>{st.label}</span>
        </li>
      ))}
    </ol>
  );
}

export function IconsDemo() {
  return (
    <div className="cdemo icddemo">
      <PageHeader
        title="Icons and the brand recipe"
        sub="The brand book says every control follows one recipe: a frosted glass body, the spectrum underneath, Ink or white on top. Four looks for the app’s icon tiles, each on a specimen, the real Activity list and a Stages column. The book’s third rule, one cluster per frame, decides how many tiles may be lit. Nothing here is applied to the app."
      />
      <div className="icddemo__grid">
        {LOOKS.map((l) => (
          <section key={l.id} className={cx('gdemo__card', 'icd', `icd--${l.id}`)}>
            <header>
              <h3>{l.name}</h3>
              <p>{l.note}</p>
            </header>
            <div className="icd__row">
              <Specimen />
              <div className="icd__pane icd__pane--act">
                <div className="icd__cap">Activity</div>
                <ActivityLog items={SAMPLE} requestId="REQ-103" />
              </div>
              <div className="icd__pane">
                <div className="icd__cap">Stages</div>
                <Stages />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

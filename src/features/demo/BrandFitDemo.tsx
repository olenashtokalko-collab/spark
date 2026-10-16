// Prototype-only page (#/demo/brand-fit): where the prototype departs from the brand book's "Frosted light"
// (p. 14: 01 Frosted, never flat · 02 The spectrum flows Cobalt to Ember · 03 One cluster per frame), and what
// each place could become. Every block shows what the app does NOW next to what it COULD become. The cards are
// the real decision-card markup and styles; nothing here changes the app.
import { useState } from 'react';
import { PageHeader, Button, cx } from '../../components/ui/primitives';
import { FolderTile } from '../../components/domain';
import { StateRing, type TileTone } from '../../components/ui/StateTile';
import type { Activity } from '../../data/types';
import { ActivityLog } from '../requests/RequestDetail';

type Look = { tag: string; now?: boolean; body: React.ReactNode };

function Compare({ title, principle, note, looks }: { title: string; principle: string; note: string; looks: Look[] }) {
  const [n, setN] = useState(0);
  return (
    <section className="gdemo__card bfit">
      <header>
        <h3>{title}</h3>
        <p>
          <span className="bfit__principle">{principle}</span> {note}
        </p>
      </header>
      <div className="bfit__row">
        {looks.map((l) => (
          <div key={l.tag} className="bfit__col">
            <div className={cx('ck-tag', !l.now && 'is-now')}>{l.tag}</div>
            <div key={n} className="bfit__stage">
              {l.body}
            </div>
          </div>
        ))}
      </div>
      <button className="link-btn bfit__replay" onClick={() => setN((v) => v + 1)}>
        Replay animation
      </button>
    </section>
  );
}

/** The live waiting card, with the three things that matter: the eyebrow, the ring and the glow. */
function Awaiting({ amber, tone = 'cobalt', used = 0.95, eyebrow = 'Due today' }: { amber?: boolean; tone?: TileTone; used?: number; eyebrow?: string }) {
  return (
    <div className="proposal__side bfit__side">
      <section className={cx('decision decision--timed is-urgent', amber && 'bfit--amber')}>
        <div className="decision__eyebrow">
          <span>{eyebrow}</span>
        </div>
        <div className="decision__timed">
          <div>
            <div className="decision__total">AED 54,000</div>
            <div className="decision__meta">Waiting for your decision</div>
          </div>
          <StateRing used={used} glyph="hourglass" tone={tone} />
        </div>
        <div className="decision__btns">
          <Button variant="primary" size="lg">
            Approve proposal
          </Button>
          <div className="decision__row">
            <Button>Request changes</Button>
            <Button>Decline</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/** The live approved card. */
function Approved({ tone, spec, inkWord }: { tone: TileTone; spec?: boolean; inkWord?: boolean }) {
  return (
    <div className="proposal__side bfit__side">
      <section className={cx('decision decision--timed decision--ok', spec && 'bfit--spec', inkWord && 'bfit--inkword')}>
        <div className="decision__eyebrow">
          <span>Decided 10 Sep</span>
        </div>
        <div className="decision__timed">
          <div>
            <div className="decision__total">AED 54,000</div>
            <div className="decision__meta decision__meta--ok">Approved</div>
          </div>
          <StateRing used={1} glyph="thumb" tone={tone} celebrate />
        </div>
      </section>
    </div>
  );
}

const FOLDERS = [
  { name: 'Brand guidelines', sub: 'Logo, colour and type', badge: '1' },
  { name: 'Strategy', sub: 'Positioning and audience' },
  { name: 'Campaigns', sub: 'Launch and packaging' },
  { name: 'Research', sub: 'Weekly digests' },
];

function Folders({ onlyFirstGlass }: { onlyFirstGlass?: boolean }) {
  return (
    <div className="bfit__folders">
      {FOLDERS.map((f, i) =>
        onlyFirstGlass && i > 0 ? (
          <div key={f.name} className="bfit__flat">
            <span className="bfit__flat-name">{f.name}</span>
            <span className="bfit__flat-sub">{f.sub}</span>
          </div>
        ) : (
          <FolderTile key={f.name} name={f.name} sub={f.sub} hue="#5f7fb4" badge={f.badge} onClick={() => {}} />
        ),
      )}
    </div>
  );
}

function Hourglasses({ tones }: { tones: [TileTone, TileTone, TileTone] }) {
  const used = [0.2, 0.55, 0.95];
  const labels = ['5 days left', '2 days left', 'Due today'];
  return (
    <div className="bfit__states">
      {used.map((u, i) => (
        <div key={labels[i]}>
          <StateRing used={u} glyph="hourglass" tone={tones[i]} size={96} />
          <span>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

const at = (daysAgo: number, h: number, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
};

// Newest first in the list: the file shared for review is the one step that waits for the client.
const SAMPLE: Activity[] = [
  { id: 'b1', at: at(3, 11), by: 's-dana', kind: 'proposal', text: 'sent a proposal · AED 96,000 · 8 weeks' },
  { id: 'b2', at: at(2, 10, 20), by: 'u-layla', kind: 'decision', text: 'approved the proposal' },
  { id: 'b3', at: at(1, 9), by: 's-youssef', kind: 'status', text: 'started work' },
  { id: 'b4', at: at(0, 9, 10), by: 's-youssef', kind: 'file', text: 'shared Packaging concepts — round 1.pdf for your review' },
];

function Activities({ glass }: { glass?: boolean }) {
  return (
    <div className={cx('bfit__act', glass && 'bfit__act--glass')}>
      <ActivityLog items={SAMPLE} requestId="REQ-103" />
    </div>
  );
}

export function BrandFitDemo() {
  return (
    <div className="cdemo bfitdemo">
      <PageHeader
        title="Brand fit: now and what it could become"
        sub="The brand book’s “Frosted light” (p. 14) has three rules: frosted, never flat; the spectrum flows Cobalt to Ember; one cluster per frame. Five places where the prototype departs from them, each with what it does now and what it could become. Nothing here is applied to the app yet."
      />
      <div className="bfitdemo__grid">
        <Compare
          title="1 · Success light"
          principle="02 · The spectrum flows Cobalt to Ember"
          note="Today the approval is green: the tile, the ring and the circles that pulse out. Green is not in the five brand colours, and the brand book lists “may semantic colours sit outside them?” as an open question. Could: the light stays the spectrum, and green is only the word “Approved” (a semantic colour used as text, where it is allowed), or even that is Ink."
          looks={[
            { tag: 'Now · green light', now: true, body: <Approved tone="green" /> },
            { tag: 'Could · spectrum light, green word', body: <Approved tone="spectrum" spec /> },
            { tag: 'Could · spectrum light, Ink word', body: <Approved tone="spectrum" spec inkWord /> },
          ]}
        />
        <Compare
          title="2 · Urgency is not Ember"
          principle="Palette roles · Ember is the spark, not an alarm"
          note="Today “Due today” and the glow under the card turn Ember when a day or less is left, while the same deadline in the Stages card is amber. The brand book keeps Ember for the spark and for AI, and never for warnings. Could: urgency is the amber the product already uses elsewhere, so the two places agree."
          looks={[
            { tag: 'Now · Ember', now: true, body: <Awaiting /> },
            { tag: 'Could · amber, as in Stages', body: <Awaiting amber /> },
          ]}
        />
        <Compare
          title="3 · The hourglass tile and the time"
          principle="02 · The spectrum flows Cobalt to Ember"
          note="Today the waiting tile is always Cobalt to violet, whether there are five days or none. The spectrum never reaches Ember. Could: the light warms along the spectrum as the time runs out: Cobalt with plenty of time, violet and pink halfway, towards Ember at the end. The same spectrum doubles as the gauge."
          looks={[
            { tag: 'Now · always Cobalt', now: true, body: <Hourglasses tones={['cobalt', 'cobalt', 'cobalt']} /> },
            { tag: 'Could · the light warms with the time', body: <Hourglasses tones={['cobalt', 'mid', 'warm']} /> },
          ]}
        />
        <Compare
          title="4 · Folders: one glass object, not all of them"
          principle="03 · One cluster per frame"
          note="Today every folder on Documents is a frosted glass tile (four shown here), so the frame holds a whole cluster of glass objects, and the one that matters (the folder with a file waiting for approval) does not stand out. Could: one glass folder, the one that needs you; the others become flat outlined blocks like the rest of the page."
          looks={[
            { tag: 'Now · every folder is glass', now: true, body: <Folders /> },
            { tag: 'Could · one glass folder, the one that needs you', body: <Folders onlyFirstGlass /> },
          ]}
        />
        <Compare
          title="5 · Icons: one glass tile per list"
          principle="Icons & interface · frosted glass body, spectrum underneath, Ink or white on top"
          note="Today the marks in Activity (and in Notifications and Stages) are flat grey tiles: quiet, and they stop a long list from becoming a cluster of glass, but they are not the recipe. The book gives every control one recipe, and “one cluster per frame” limits how much of it a frame may hold. Could: the list stays flat, and the one step that waits for you (the newest, a file to review) is the single glass tile, with the spectrum underneath and a white glyph. Same rule as the folders."
          looks={[
            { tag: 'Now · every mark is flat grey', now: true, body: <Activities /> },
            { tag: 'Could · one glass mark, the step that needs you', body: <Activities glass /> },
          ]}
        />
      </div>
    </div>
  );
}

// Prototype-only page (#/demo/ask-pill), 9 Nov review: the Ask Dr.AI pill read flat, its rim a thin line and Dr.AI's
// head pressed to the edge. Looks with volume, after the brand book's glass objects (the light lives in the glass's
// edge, Cobalt on one side, Ember on the other, white where it catches the top), Dr.AI with air round him in each.
// Below, what could stand by "Latest from Spark" in place of Sparki (Jean #23 asked for a mascot in that section).
import { useState } from 'react';
import { cx } from '../../components/ui/primitives';
import { Avatar } from '../../components/ui/primitives';
import { DrAiHead, DrAiInkPill, SparkiStill } from '../../components/ui/DrAi';

/** The pill as it was before 9 Nov, for comparison. */
function NowPill() {
  return (
    <button type="button" className="hl-mchat drai-pill">
      <DrAiHead size={22} />
      Ask Dr.AI
    </button>
  );
}
import { BrandSpark } from '../../components/ui/BrandSpark';
import { MascotClip } from './MascotDemo';
import { LatestFromSpark } from '../home/HomeLayouts';
import { useStore } from '../../state/store';

const PILLS = [
  { v: 'now', label: 'Now', note: 'Today’s pill: a hairline of the brand light, his face filling the circle at the edge.' },
  {
    v: 'glass',
    label: 'A · Glass capsule',
    note: 'A thick glass pill: white where it catches the top, the brand light along its lower edge, a soft coloured shadow under it. Dr.AI floats in a sunken glass porthole with air round him.',
  },
  {
    v: 'bubble',
    label: 'B · Dr.AI in his bubble',
    note: 'Dr.AI in the clear bubble he flies to his corner in (the welcome’s exit), a little bigger than the pill and sitting out of it. The bubble bobs on hover.',
  },
  {
    v: 'light',
    label: 'C · Light runs round the rim',
    note: 'A frosted pill with a thicker rim of the brand light that travels round it on hover, and a Noor glow under it. Dr.AI on a white disc with a ring of air.',
  },
  {
    v: 'ink',
    label: 'D · Ink glass',
    note: 'Dark glass like the brand book’s night tiles: Cobalt light on the left edge, Ember on the right, a white gloss on top. Dr.AI in a clear bubble. Stands out most; one per page.',
  },
  {
    v: 'ember',
    label: 'E · Ember glass (on the portal)',
    note: 'The brand book, p. 19: “Pills: Cobalt for human, Ember for AI”. See-through Ember glass as the folders on Documents: a white light inside, a bright rim, a warm shadow. Dr.AI in a clear bubble.',
  },
] as const;

function Pill({ look }: { look: string }) {
  if (look === 'now') return <NowPill />;
  if (look === 'ember') return <DrAiInkPill onClick={() => {}} />;
  return (
    <button type="button" className={cx('apd', `apd--${look}`)}>
      <span className="apd__port">
        <DrAiHead size={look === 'bubble' ? 34 : 28} look="head-clear" />
      </span>
      Ask Dr.AI
    </button>
  );
}

const MARKS = [
  { v: 'sparki', label: 'Now · Sparki', note: 'Sparki is the helper who points the way; next to news he reads as a hint.' },
  {
    v: 'peek',
    label: '1 · Dr.AI peeks in',
    note: 'The mascot Jean asked for: Dr.AI’s face over the card’s top right corner, with one line about what changed. Most visual; the section gets a face.',
  },
  {
    v: 'head',
    label: '2 · Dr.AI’s head by the title',
    note: 'The same head as on the Ask pill, small, by the title: the news comes through Dr.AI. Calm, and one mascot all over the portal.',
  },
  {
    v: 'team',
    label: '3 · The Spark people',
    note: 'The latest is work done by people at Spark, so their faces: the strategists who did it. True to the content, not a mascot.',
  },
  { v: 'spark', label: '4 · The Spark mark', note: 'The brand’s spark in the brand light: “from Spark”, said with the logo. Quiet, not a mascot.' },
] as const;

function LatestCard({ mark }: { mark: string }) {
  const { state } = useStore();
  const spark = state.people.filter((p) => p.org === 'spark').slice(0, 3);
  return (
    <section className={cx('hc-card hd-fixes hd-latest og-full__latest apd-latest', `apd-latest--${mark}`)}>
      <h3 className="og-full__h og-full__latest-head">
        {mark === 'sparki' && <SparkiStill size={24} />}
        {mark === 'head' && (
          <span className="apd-latest__head">
            <DrAiHead size={30} look="head-clear" />
          </span>
        )}
        {mark === 'spark' && <BrandSpark size={22} />}
        Latest from Spark
        {mark === 'team' && (
          <span className="apd-latest__team">
            {spark.map((p) => (
              <Avatar key={p.id} person={p} size={26} ring />
            ))}
          </span>
        )}
      </h3>
      {mark === 'peek' && (
        <span className="apd-peek" aria-hidden>
          <span className="apd-peek__say">Two new reports this week, and the shoot is booked.</span>
          <span className="apd-peek__win">
            <MascotClip state="idle" crop="face" width={210} shape="free" />
          </span>
        </span>
      )}
      <div className="hld-card hc-latest__list">
        <LatestFromSpark bare limit={3} typed />
      </div>
    </section>
  );
}

export function AskPillDemo() {
  const [mark, setMark] = useState<string>('peek');
  return (
    <div className="dl-page apd-page">
      <header className="dl-head">
        <h1>Ask Dr.AI · with volume</h1>
        <p>The pill as glass with depth, Dr.AI with air round him. Each on a card corner, as on the reports, and on the page. Hover them. Prototype only.</p>
      </header>
      <div className="dl-grid">
        {PILLS.map((l) => (
          <section key={l.v} className="dl-tile">
            <span className="dl-tile__label">{l.label}</span>
            <p className="dl-tile__note">{l.note}</p>
            <div className="apd-stage">
              <span className="apd-card">
                <Pill look={l.v} />
              </span>
              <span className="apd-on-page">
                <Pill look={l.v} />
              </span>
            </div>
          </section>
        ))}
      </div>

      <header className="dl-head apd-head2">
        <h1>Latest from Spark · what stands by the title</h1>
        <p>Jean (#23): “may have mascot in this section, make visually interesting?” Four options in place of Sparki.</p>
      </header>
      <nav className="apd-switch">
        {MARKS.map((m) => (
          <button key={m.v} type="button" className={cx(mark === m.v && 'is-on')} onClick={() => setMark(m.v)}>
            {m.label}
          </button>
        ))}
      </nav>
      <p className="dl-tile__note apd-mark-note">{MARKS.find((m) => m.v === mark)?.note}</p>
      <LatestCard key={mark} mark={mark} />
    </div>
  );
}

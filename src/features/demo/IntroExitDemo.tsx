// Prototype-only page (#/demo/intro-exit): how the welcome leaves, with Dr.AI carried to his corner as if in a clear
// glass bubble (9 Nov, review: the iris read as a heavy disc over the page). Today's iris for comparison, then three
// bubble looks after the brand book's glass objects. Each plays on a small Home and repeats.
import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { cx } from '../../components/ui/primitives';
import { MascotClip } from './MascotDemo';

const LOOKS = [
  { v: 'now', label: 'Now · Iris into the corner', note: 'Today: the ground closes as a disc into his corner while he hops there.' },
  {
    v: 'carry',
    label: 'A · Carried in a bubble',
    note: 'The ground simply clears; a clear glass bubble swells round him, floats him in an arc to his corner and pops softly as he lands.',
  },
  {
    v: 'iris',
    label: 'B · The ground becomes the bubble',
    note: 'The ground closes round Dr.AI, not into the corner; its last circle turns to clear glass, floats him to the corner and melts away.',
  },
  {
    v: 'film',
    label: 'C · Soap film',
    note: 'As A, with a thin film of the brand light (Cobalt, Haze, Ember) drifting over the glass; it wobbles in flight and pops in a few glints.',
  },
  {
    v: 'clean',
    label: 'D · A clean pop',
    note: 'As A, with no glints: the bubble swells a touch, its rim thins out and it is gone, leaving Dr.AI standing in his corner.',
  },
  {
    v: 'flight',
    label: 'E · The bubble forms in flight',
    note: 'He sets off at once, as today; the glass gathers round him on the way, and pops cleanly, no glints, as he lands.',
  },
] as const;

function Stage({ look }: { look: string }) {
  return (
    <div className={cx('ixd', `ixd--${look}`)}>
      {/* A small Home under the welcome */}
      <span className="ixd-page" aria-hidden>
        <i className="ixd-page__co" />
        <i className="ixd-page__t" />
        <i className="ixd-page__card" />
        <i className="ixd-page__card ixd-page__card--2" />
        <i className="ixd-page__dock" />
      </span>
      <span className="ixd-corner">
        <MascotClip state="idle" width={70} />
      </span>

      {/* The welcome */}
      <span className="ixd-ground" aria-hidden>
        <i className="ixd-light" />
      </span>
      <span className="ixd-text">
        <span className="ixd-text__label">Welcome to Spark</span>
        <b>
          Hi Layla, I’m <span className="ixd-hl">Dr.AI</span>.
        </b>
        <span className="ixd-text__p">Four short steps and your workspace is ready.</span>
      </span>
      <span className="ixd-fly">
        <span className="ixd-hop">
          <MascotClip state="idle" width={120} />
          {look !== 'now' && (
            <span className="ixd-bubble">
              {look === 'film' && <i className="ixd-film" />}
            </span>
          )}
        </span>
      </span>
      {look !== 'now' && look !== 'clean' && look !== 'flight' && (
        <span className="ixd-pop" aria-hidden>
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} style={{ ['--a' as string]: `${i * 45 + 20}deg` }} />
          ))}
        </span>
      )}
    </div>
  );
}

export function IntroExitDemo() {
  // Every stage plays again every few seconds; Replay starts one over at once.
  const [round, setRound] = useState(0);
  const [own, setOwn] = useState<Record<string, number>>({});
  useEffect(() => {
    const t = setInterval(() => setRound((r) => r + 1), 5600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="dl-page ixd-pageout">
      <header className="dl-head">
        <h1>Welcome · the way out</h1>
        <p>Dr.AI leaves the welcome for his corner as if in a clear glass bubble. Today’s exit, then three bubble looks. Each repeats. Prototype only.</p>
      </header>
      <div className="dl-grid">
        {LOOKS.map((l) => (
          <section key={l.v} className="dl-tile">
            <span className="dl-tile__label">{l.label}</span>
            <p className="dl-tile__note">{l.note}</p>
            <Stage key={`${round}-${own[l.v] ?? 0}`} look={l.v} />
            <button type="button" className="ixd-replay" onClick={() => setOwn((o) => ({ ...o, [l.v]: (o[l.v] ?? 0) + 1 }))}>
              <RotateCcw size={14} /> Replay
            </button>
          </section>
        ))}
      </div>
    </div>
  );
}

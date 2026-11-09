// Sign-in panel concepts with Dr.AI (6 Nov, second round, #/demo/signin). One idea per panel and nothing on top of
// anything: no word behind him, no line that types itself without a speaker. Each comes on a light ground (Sand) or
// the client's video ground (near-black navy with a Cobalt glow left and an Ember one right).
import { useEffect, useState } from 'react';
import { MascotClip } from '../demo/MascotDemo';
import { cx } from '../../components/ui/primitives';
import { DrAiNavIcon, SparkiStill } from '../../components/ui/DrAi';

export type Concept = 'bubble' | 'mix';
export type Ground = 'light' | 'dark';

// What he says, in his own voice: short, one idea a line, nothing the portal doesn't do. [Brackets] mark the words
// that take the video's gradient in the bubble (6 Nov): who he is, then the point of each line. A full stop
// takes the colour only when the words before it do.
const SAYS_MARKED = [
  'Hi, [I’m Dr.AI.] I research your market, with sources.',
  'I listen to what people [say about your brand.]',
  'I turn good [answers into requests] for the Spark team.',
];
const SAYS = SAYS_MARKED.map((l) => l.replace(/[[\]]/g, ''));
/** Where the marked words sit in the plain line: [start, end) pairs. */
const MARKS = SAYS_MARKED.map((l) => {
  const out: [number, number][] = [];
  let k = 0, start = -1;
  for (const ch of l) {
    if (ch === '[') start = k;
    else if (ch === ']') out.push([start, k]);
    else k++;
  }
  return out;
});

/** Types each line, holds it, then the next. Reduced motion: whole lines. */
function useTyped(lines: string[], hold = 2600, lead = 0) {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [i, setI] = useState(0);
  const [n, setN] = useState(reduce ? lines[0].length : 0);
  useEffect(() => {
    const full = lines[i].length;
    const t = setTimeout(
      () => {
        if (!reduce && n < full) setN(n + 1);
        else {
          const next = (i + 1) % lines.length;
          setI(next);
          setN(reduce ? lines[next].length : 0);
        }
      },
      !reduce && n === 0 && lead ? lead : !reduce && n < full ? 32 : hold,
    );
    return () => clearTimeout(t);
  }, [i, n, lines, hold, lead, reduce]);
  return { i, text: lines[i].slice(0, n), full: lines[i], done: n >= lines[i].length };
}

type TypedState = ReturnType<typeof useTyped>;

/** The line cut at the marks and at the caret; each piece typed or still to come, plain or in the gradient. */
function Pieces({ t, marks }: { t: TypedState; marks?: [number, number][][] }) {
  const n = t.text.length;
  const cuts = [...new Set([0, n, t.full.length, ...(marks?.[t.i] ?? []).flat()])].sort((a, b) => a - b);
  const inMark = (at: number) => (marks?.[t.i] ?? []).some(([a, b]) => at >= a && at < b);
  return (
    <>
      {cuts.slice(0, -1).map((a, j) => {
        const b = cuts[j + 1];
        if (b <= a) return null;
        return (
          <span key={a} className={cx(a >= n ? 'sgx-typed__ghost' : inMark(a) && 'sgx-hl')} aria-hidden>
            {t.full.slice(a, b)}
          </span>
        );
      })}
    </>
  );
}

function Typed({ lines, marks }: { lines: string[]; marks?: [number, number][][] }) {
  const t = useTyped(lines);
  return (
    <p className="sgx-typed" aria-live="polite" aria-label={t.full}>
      <Pieces t={t} marks={marks} />
    </p>
  );
}

/** E · Speech bubble: he says it. A glass bubble over him, its tail pointing at his head. */
function Bubble() {
  return (
    <div className="sgx-bubble">
      <div className="sgx-bubble__card">
        <Typed lines={SAYS} marks={MARKS} />
      </div>
      <MascotClip state="idle" width={270} intro className="sgx-fig" />
    </div>
  );
}

/** I · Mix (6 Nov): the tiles' idea without boxes round him. Dr.AI stands free and large; at his side two small
 *  squares, his face while he thinks and Sparki with Dr.AI's head peeking in (as the video's tile), no captions; under them the
 *  chat from H with his still head from the sidebar as the avatar, the key words in the gradient. */
function Mix() {
  const t = useTyped(SAYS, 2400, 1100);
  return (
    <div className="sgx-mix">
      <div className="sgx-mix__top">
        <MascotClip state="idle" width={250} intro className="sgx-fig" />
        <div className="sgx-mix__tiles">
          <span className="sgx-mix__sq">
            <MascotClip state="thinking" crop="face" width={112} shape="free" className="sgx-fill" />
          </span>
          {/* Turns (6 Nov): Dr.AI's head leans in from the lower-left corner, blinks at you and goes; then Sparki comes
              in from the upper-right, spins and goes; again. 10s a round, the two layers on one clock. */}
          <span className="sgx-mix__sq sgx-mix__sq--turns">
            <span className="sgx-turn sgx-turn--head">
              <MascotClip state="idle" crop="head" width={112} shape="free" />
            </span>
            <span className="sgx-turn sgx-turn--sparki">
              <span className="sgx-turn__spin">
                <SparkiStill size={64} />
              </span>
            </span>
          </span>
        </div>
      </div>
      <div className="sgx-chat__card sgx-mix__chat">
        <div className="sgx-chat__head">
          <span className="sgx-mix__av">
            <DrAiNavIcon size={22} />
          </span>
          <b>Dr.AI</b>
          <span className="sgx-chat__on">Online</span>
        </div>
        <div className="sgx-chat__msg" key={t.i} aria-live="polite" aria-label={t.full}>
          {t.text.length === 0 ? (
            <span className="sgx-dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
          ) : (
            <Pieces t={t} marks={MARKS} />
          )}
        </div>
      </div>
    </div>
  );
}

export function LookPanel({ concept, ground }: { concept: Concept; ground: Ground }) {
  return (
    <section className={cx('itd-type__panel', 'sgx', `sgx--${ground}`, `sgx--${concept}`)}>
      {/* No wordmark here (6 Nov): it pulled the composition to the corner; the app icon over the form says Spark. */}
            {concept === 'bubble' && <Bubble />}
      {concept === 'mix' && <Mix />}
    </section>
  );
}

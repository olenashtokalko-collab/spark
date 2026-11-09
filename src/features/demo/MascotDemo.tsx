// Prototype-only page (#/demo/mascot, 5 Nov): where Spark's mascot, Dr.AI with Sparki, could live in the portal.
// The states are the client's transparent clips (public/brand/drai/), so he stands on the portal's own glass.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUp, Check, ChevronDown, Loader2 } from 'lucide-react';
import { Button, PageHeader, cx } from '../../components/ui/primitives';
import { ChatDrawer } from '../assistant/ChatDrawer';
import { SparkStar } from '../../components/ui/SparkStar';
import { SparkDisc } from '../../components/ui/BrandSpark';
import { Composer } from '../assistant/Composer';
import { SparkiStill, DrAiHead, DrAiNavIcon, ICON_LOOKS, setDrAi, setDrAiIcon, useDrAi, useDrAiIcon } from '../../components/ui/DrAi';

type State = 'idle' | 'listening' | 'thinking' | 'speaking';
// The client's clips (5 Nov, public/brand/drai/): transparent WebM, 1440×1440, one per state, plus the way in and
// out of thinking. Loops: idle, listening, speaking; thinking alternates two loops, with its own way in and out.
type Clip = 'intro' | 'idle' | 'listening' | 'speaking_short' | 'speaking_medium' | 'speaking_long' | 'enter_think' | 'think_loop_a' | 'think_loop_b' | 'exit_think';
const BASE: Record<Exclude<State, 'thinking'>, Clip> = { idle: 'idle', listening: 'listening', speaking: 'speaking_medium' };
const SPEAK: Clip[] = ['speaking_medium', 'speaking_long', 'speaking_short'];
const src = (c: Clip) => `/brand/drai/${c}.webm`;
const FRAME = 1440;
// Dr.AI's sizes (5 Nov): 30px the still icon (menu, Ask buttons); 36px the live avatar in the chat (84px in
// full while he works); 104px in full in the panel and empty states, 150px on the chat's start.
// Boxes in the 1440 frame: the whole figure (Sparki may fly beyond it), or the head for avatars. The head box
// ends at x 1038, short of where Sparki drifts by his head, so no piece of him flickers in the circle (5 Nov).
const CROP = {
  body: { x: 300, y: 100, w: 1020, h: 1290 },
  head: { x: 362, y: 66, w: 676, h: 676 },
  // Tiles on the sign-in page (6 Nov), as the close-ups in the client's video: his face (with the hand at his chin
  // while he thinks), and Sparki alone, bobbing by his head (x 1048–1292, y 152–650 over the idle loop), the edge of
  // his headdress at the left as in the video's Sparki tile.
  face: { x: 340, y: 60, w: 720, h: 720 },
  sparki: { x: 860, y: 110, w: 580, h: 580 },
  // Sparki with nothing of him (6 Nov): centred on Sparki's path (x ≈ 1170, y 150–650); the tile masks off the
  // left quarter, where his headdress ends (x 1040).
  sparkiOnly: { x: 920, y: 150, w: 500, h: 500 },
  // Sparki's tile as in the video, his head peeking in at the left (6 Nov): more of the head than the video shows
  // (x 800–1038 of it, about 40% of the tile), Sparki's path to its right.
  peek: { x: 800, y: 110, w: 600, h: 600 },
};

/** Which clip follows `cur` while the mascot is in `state`. */
function nextClip(cur: Clip | null, state: State): Clip {
  if (cur === 'intro') cur = null;
  if (state === 'thinking') {
    if (cur === 'enter_think' || cur === 'think_loop_b') return 'think_loop_a';
    if (cur === 'think_loop_a') return 'think_loop_b';
    return 'enter_think';
  }
  if (cur === 'enter_think' || cur === 'think_loop_a' || cur === 'think_loop_b') return 'exit_think';
  // Speaking (5 Nov): the client's three takes in turn, medium, long, short, so a long answer doesn't repeat one.
  if (state === 'speaking' && cur?.startsWith('speaking_')) return SPEAK[(SPEAK.indexOf(cur) + 1) % SPEAK.length];
  return BASE[state];
}

/** Dr.AI in one state, on whatever is behind him (the clips are transparent). Two videos take turns so a change
 *  of clip never shows a blank frame. `shape` 'circle' puts the head on a soft glass disc. */
export function MascotClip({
  state,
  crop = 'body',
  width = 160,
  shape,
  className,
  still,
  intro,
  poster,
  onReady,
}: {
  state: State;
  crop?: keyof typeof CROP;
  width?: number;
  shape?: 'circle' | 'tile' | 'free';
  className?: string;
  /** Hold one frame instead of playing (past chat answers: many on a page, one moving). */
  still?: boolean;
  /** Open with the intro (Sparki flies out of his chest, circles his head and lights up), then the state. */
  intro?: boolean;
  /** A still of the first frame (body crop), shown until a clip plays: a first visit loads megabytes of video. */
  poster?: string;
  /** Called once, when the first clip is on screen. */
  onReady?: () => void;
}) {
  const a = useRef<HTMLVideoElement>(null);
  const b = useRef<HTMLVideoElement>(null);
  const front = useRef<'a' | 'b'>('a');
  const cur = useRef<Clip | null>(null);
  const want = useRef(state);
  want.current = state;
  const alive = useRef(true);
  const opened = useRef(state);
  // Every Dr.AI that opens with the intro plays it (5 Nov, review: once a visit lost it on the chat and the panel).
  const playIntro = useRef(!!intro);
  const openedAt = useRef(performance.now());
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);
  const c = CROP[crop];
  const k = width / c.w;

  useEffect(() => {
    const va = a.current, vb = b.current;
    if (!va || !vb) return;
    if (still) {
      const clip = state === 'thinking' ? 'think_loop_a' : BASE[state];
      va.src = src(clip);
      const hold = () => { va.currentTime = 0.3; va.pause(); };
      va.readyState >= 1 ? hold() : va.addEventListener('loadedmetadata', hold, { once: true });
      va.style.opacity = '1';
      vb.style.opacity = '0';
      return;
    }
    const show = (clip: Clip) => {
      if (!alive.current) return;
      const f = front.current === 'a' ? va : vb;
      const back = front.current === 'a' ? vb : va;
      if (cur.current === clip && !f.paused) return;
      cur.current = clip;
      // Idle and listening loop on their own; speaking and thinking hand over to the next take when one ends.
      back.loop = clip === 'idle' || clip === 'listening';
      back.src = src(clip);
      back.currentTime = 0;
      // The handoff without a flash (5 Nov): the new clip comes in on top at full strength, and the old one is
      // hidden only once the new one's first frame is on screen. (A crossfade left both half clear for a moment,
      // and the page showed through him.)
      // The element taking the clip starts hidden and under the one on show, whatever it held before.
      back.style.opacity = '0';
      back.style.zIndex = '1';
      let swapped = false;
      back.onplaying = () => {
        // A clip asked for and then overtaken by a newer one (a change of state at the same moment) stays hidden.
        if (cur.current !== clip || swapped) return;
        swapped = true;
        back.style.zIndex = '2';
        f.style.zIndex = '1';
        back.style.opacity = '1';
        let done = false;
        const oldSrc = f.src;
        const hideOld = () => {
          // Not if the old element has since been given the next clip (a quick change of state reuses it).
          if (done || f.src !== oldSrc || front.current === (f === va ? 'a' : 'b')) return;
          done = true;
          f.style.opacity = '0';
          f.pause();
        };
        const rv = back as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number };
        rv.requestVideoFrameCallback?.(() => requestAnimationFrame(hideOld));
        // In case no frame callback comes (a page in the background): hide it shortly anyway.
        window.setTimeout(hideOld, 150);
        front.current = front.current === 'a' ? 'b' : 'a';
      };
      back.onended = () => cur.current === clip && show(nextClip(clip, want.current));
      back.play().catch(() => {});
    };
    // On a change of state: a loop gives way at once; a clip on its way in or out of thinking finishes first and
    // its end picks what follows.
    // The intro plays out whatever state he opens in (a panel may open with a question already written); a
    // change of state after that cuts it short.
    // (A panel's prefilled question turns the state to listening just after it opens: that doesn't count.)
    const first = opened.current === state || performance.now() - openedAt.current < 1200;
    const busy = cur.current === 'enter_think' || cur.current === 'exit_think' || (cur.current === 'intro' && first);
    if (playIntro.current && cur.current === null) show('intro');
    else if (!busy) show(nextClip(cur.current === 'intro' ? null : cur.current, state));
    else {
      const f = front.current === 'a' ? va : vb;
      const b2 = front.current === 'a' ? vb : va;
      // (StrictMode, a fresh mount: the way in may not have started; start it again.)
      if (f.paused && b2.paused) { cur.current = null; show(playIntro.current ? 'intro' : nextClip(null, state)); }
    }
  }, [state, still]);

  // A small head drawn sharp (5 Nov, review: rough at 36px). The browser shrinks the 1440 clip to ~72 device
  // pixels in one step and the fine lines (glasses, headband) break up; so once he has settled into a small head,
  // a canvas draws the clip's head through a larger step first, then down, with high-quality smoothing, every frame
  // (once for a still one). It fades in after the zoom from the figure has ended.
  const sharp = crop === 'head' && width <= 64;
  const cv = useRef<HTMLCanvasElement>(null);
  const [hq, setHq] = useState(false);
  useEffect(() => {
    if (!sharp) {
      setHq(false);
      return;
    }
    const canvas = cv.current;
    if (!canvas) return;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const W = Math.round(width * dpr);
    const H = Math.round(c.h * k * dpr);
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext('2d');
    const mid = document.createElement('canvas');
    mid.width = W * 3;
    mid.height = H * 3;
    const mg = mid.getContext('2d');
    if (!g || !mg) return;
    g.imageSmoothingQuality = 'high';
    mg.imageSmoothingQuality = 'high';
    let raf = 0;
    let shown = false;
    const draw = () => {
      const v = [a.current, b.current].find((x) => x && x.style.opacity === '1' && x.readyState >= 2);
      if (v) {
        mg.clearRect(0, 0, mid.width, mid.height);
        mg.drawImage(v, c.x, c.y, c.w, c.h, 0, 0, mid.width, mid.height);
        g.clearRect(0, 0, W, H);
        g.drawImage(mid, 0, 0, W, H);
        if (!shown) {
          shown = true;
          setHq(true);
        }
      }
      if (!still || !shown) raf = requestAnimationFrame(draw);
    };
    const t = window.setTimeout(() => (raf = requestAnimationFrame(draw)), still ? 0 : 750);
    return () => {
      window.clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [sharp, still, width, c.x, c.y, c.w, c.h, k]);

  // On screen once either video plays (9 Nov: on a first visit the clips take seconds to arrive).
  const [playing, setPlaying] = useState(false);
  const readyRef = useRef(onReady);
  readyRef.current = onReady;
  useEffect(() => {
    const vs = [a.current, b.current].filter(Boolean) as HTMLVideoElement[];
    const on = () => {
      setPlaying(true);
      readyRef.current?.();
      vs.forEach((v) => v.removeEventListener('playing', on));
    };
    vs.forEach((v) => v.addEventListener('playing', on));
    return () => vs.forEach((v) => v.removeEventListener('playing', on));
  }, []);

  const vstyle = { width: FRAME * k, height: FRAME * k, left: -c.x * k, top: -c.y * k };
  return (
    <span className={cx('msc-clip', `msc-clip--${crop}`, `msc-clip--${shape ?? (crop === 'head' ? 'circle' : 'free')}`, sharp && hq && 'is-sharp', className)} style={{ width, height: c.h * k }} aria-hidden>
      {poster && crop === 'body' && <img className={cx('msc-clip__poster', playing && 'is-gone')} src={poster} alt="" draggable={false} />}
      <video ref={a} muted playsInline preload="auto" style={vstyle} />
      <video ref={b} muted playsInline preload="auto" style={{ ...vstyle, opacity: 0 }} />
      {sharp && <canvas ref={cv} className="msc-clip__sharp" />}
    </span>
  );
}

// ---- The chat, as on #/assistant: a question, Spark's answer with its steps; the answer plays out in phases ----
const QUESTION = 'I have an idea for the Riyadh launch. Help me turn it into a brief for Spark';
const STEPS = ['Reading your brand brief', 'Checking the Riyadh launch request', 'Looking at past launches', 'Drafting the brief'];
const REPLY = 'Happy to. A brief Spark can price needs four things: what you want to make, who it is for, what success looks like, and budget and timing. Some of it is already in your workspace, so let’s start there.';
type Phase = 'thinking' | 'streaming' | 'done';

/** Plays the answer: thinking through the steps, then the text streaming in, then done; again on Replay. */
function usePlay() {
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<Phase>('thinking');
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    setPhase('thinking');
    setStep(0);
    setShown(0);
    const ts: number[] = [];
    STEPS.forEach((_, i) => ts.push(window.setTimeout(() => setStep(i), i * 900)));
    ts.push(window.setTimeout(() => setPhase('streaming'), STEPS.length * 900));
    return () => ts.forEach(clearTimeout);
  }, [run]);
  useEffect(() => {
    if (phase !== 'streaming') return;
    const t = setInterval(() => setShown((n) => (n >= REPLY.length ? (clearInterval(t), setPhase('done'), n) : n + 3)), 35);
    return () => clearInterval(t);
  }, [phase]);
  return { phase, step, shown, replay: () => setRun((r) => r + 1) };
}

const mood = (p: Phase): State => (p === 'thinking' ? 'thinking' : p === 'streaming' ? 'speaking' : 'idle');

/** The chat's own "On it" line (MessageView), the current step beside it. */
function OnIt({ step, label = 'On it' }: { step: number; label?: string }) {
  return (
    <span className="thinking thinking--onit">
      <span className="thk-glass thk-glass--warm thk-glass--tail">
        {label}
        <span className="thk-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      </span>
      <span key={step} className="thinking__label thk-fade">
        {STEPS[step]}
      </span>
    </span>
  );
}
const Researched = () => (
  <span className="steps-toggle">
    Researched {STEPS.length} steps <ChevronDown size={13} />
  </span>
);
const Text = ({ shown }: { shown: number }) => (shown ? <div className={cx('msg-ai__text', shown < REPLY.length && 'is-streaming')}>{REPLY.slice(0, shown)}</div> : null);

/** One answer, its avatar and its working line given by the variant. */
function Thread({ avatar, working, children }: { avatar: ReactNode; working?: ReactNode; children?: ReactNode }) {
  return (
    <div className="msc-chat">
      <div className="msg-user">
        <div className="msg-user__bubble">{QUESTION}</div>
      </div>
      <div className="msg-ai">
        <div className="msg-ai__avatar msc-ai-avatar">{avatar}</div>
        <div className="msg-ai__body">
          {working}
          {children}
        </div>
      </div>
    </div>
  );
}

// A · Now: Spark's disc; the chat as it is, for comparison.
function VNow() {
  const p = usePlay();
  return (
    <Play p={p}>
      <Thread avatar={<SparkDisc size={30} />} working={p.phase === 'thinking' ? <OnIt step={p.step} /> : <Researched />}>
        <Text shown={p.shown} />
      </Thread>
    </Play>
  );
}
// B · Dr.AI's head in place of the disc, its mood following the answer.
function VAvatar() {
  const p = usePlay();
  return (
    <Play p={p}>
      <Thread avatar={<MascotClip state={mood(p.phase)} crop="head" width={36} />} working={p.phase === 'thinking' ? <OnIt step={p.step} /> : <Researched />}>
        <Text shown={p.shown} />
      </Thread>
    </Play>
  );
}
// C · A larger head while working, named: "Dr.AI is thinking", shrinking to the avatar once done.
function VNamed() {
  const p = usePlay();
  const working = p.phase !== 'done';
  return (
    <Play p={p}>
      <Thread
        avatar={<MascotClip state={mood(p.phase)} crop="head" width={working ? 56 : 36} className="msc-grow" />}
        working={p.phase === 'thinking' ? <OnIt step={p.step} label="Dr.AI is thinking" /> : <Researched />}
      >
        <Text shown={p.shown} />
      </Thread>
    </Play>
  );
}
// D · A thinking card: Dr.AI in a tile beside the live steps; the card folds into "Researched 4 steps" when the
//     answer starts.
function VCard() {
  const p = usePlay();
  return (
    <Play p={p}>
      <Thread
        avatar={<MascotClip state={mood(p.phase)} crop="head" width={36} />}
        working={
          p.phase === 'thinking' ? (
            <div className="msc-thinkcard">
              <MascotClip state="thinking" width={78} shape="tile" />
              <div>
                <b>Dr.AI is on it</b>
                <ul>
                  {STEPS.map((s, i) => (
                    <li key={s} className={cx(i > p.step && 'is-later')}>
                      {i < p.step ? <Check size={13} /> : i === p.step ? <Loader2 size={13} className="spin" /> : <span className="msc-dot" />} {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <Researched />
          )
        }
      >
        <Text shown={p.shown} />
      </Thread>
    </Play>
  );
}
// E · By the box: the answer keeps Spark's disc; Dr.AI shows in a tile above the composer while Spark works.
function VComposer() {
  const p = usePlay();
  const working = p.phase !== 'done';
  return (
    <Play p={p}>
      <Thread avatar={<SparkDisc size={30} />} working={p.phase === 'thinking' ? <OnIt step={p.step} /> : <Researched />}>
        <Text shown={p.shown} />
      </Thread>
      <div className="msc-composer">
        <span className={cx('msc-peek', working && 'is-on')}>
          <MascotClip state={mood(p.phase)} crop="head" width={40} />
          <span>{p.phase === 'thinking' ? 'Dr.AI is thinking…' : 'Dr.AI is answering…'}</span>
        </span>
        <label className="msc-input">
          <input placeholder="Reply to Spark…" />
          <span className="msc-send">
            <ArrowUp size={16} />
          </span>
        </label>
      </div>
    </Play>
  );
}
// F · Sparki only: the disc stays and breathes while Spark works; Dr.AI is kept for the chat's start.
function VSparki() {
  const p = usePlay();
  return (
    <Play p={p}>
      <Thread
        avatar={
          <span className={cx('msc-sparki-pulse', p.phase !== 'done' && 'is-on')}>
            <SparkDisc size={30} />
          </span>
        }
        working={p.phase === 'thinking' ? <OnIt step={p.step} /> : <Researched />}
      >
        <Text shown={p.shown} />
      </Thread>
    </Play>
  );
}

function Play({ p, children }: { p: ReturnType<typeof usePlay>; children: ReactNode }) {
  return (
    <div className="msc-play">
      {children}
      <button type="button" className="hld-q__go msc-replay" onClick={p.replay}>
        Replay
      </button>
    </div>
  );
}

const ANSWERING = [
  { title: 'A · Now', note: 'Spark’s disc, as the chat is today, for comparison.', el: <VNow /> },
  { title: 'B · Dr.AI as the avatar', note: 'His head in a circle in place of the disc; thinking while Spark works, speaking while the text streams, standing by after. The smallest change.', el: <VAvatar /> },
  { title: 'C · Named, bigger while working', note: 'The avatar grows while Spark works and the line says “Dr.AI is thinking”; it settles back to the small avatar once the answer is in.', el: <VNamed /> },
  { title: 'D · A thinking card', note: 'Dr.AI in a tile beside the live steps (done, doing, next); the card folds into “Researched 4 steps” when the answer starts.', el: <VCard /> },
  { title: 'E · By the box', note: 'The answer keeps Spark’s disc; Dr.AI peeks above the composer while Spark works, then steps away. The thread stays calm.', el: <VComposer /> },
  { title: 'F · Sparki only', note: 'No Dr.AI in the thread: the disc breathes while Spark works. Dr.AI is kept for the chat’s start and quiet moments.', el: <VSparki /> },
];

// ---- Dr.AI in full while Spark answers (5 Nov): the whole figure, with Sparki, rather than the head ----
// G · The whole figure as the avatar, small, beside the answer; his state follows it.
function VFullAvatar() {
  const p = usePlay();
  return (
    <Play p={p}>
      <Thread avatar={<MascotClip state={mood(p.phase)} width={58} />} working={p.phase === 'thinking' ? <OnIt step={p.step} label="Dr.AI is thinking" /> : <Researched />}>
        <Text shown={p.shown} />
      </Thread>
    </Play>
  );
}
// H · Full while he works, his head once it's done: the figure stands beside the steps and the streaming text,
//     then gives way to the small head, so finished answers stay quiet.
function VFullThenHead() {
  const p = usePlay();
  const working = p.phase !== 'done';
  return (
    <Play p={p}>
      <Thread
        avatar={
          <span className={cx('msc-swap', working ? 'is-full' : 'is-head')}>
            <MascotClip state={mood(p.phase)} width={84} className="msc-swap__full" />
            <DrAiHead size={30} className="msc-swap__head" />
          </span>
        }
        working={p.phase === 'thinking' ? <OnIt step={p.step} label="Dr.AI is thinking" /> : <Researched />}
      >
        <Text shown={p.shown} />
      </Thread>
    </Play>
  );
}
// I · On a stage while thinking: Dr.AI in full, centred, the live steps under him; when the answer starts he
//     steps back to the avatar and the text takes his place.
function VFullStage() {
  const p = usePlay();
  return (
    <Play p={p}>
      <div className="msc-chat">
        <div className="msg-user">
          <div className="msg-user__bubble">{QUESTION}</div>
        </div>
        {p.phase === 'thinking' ? (
          <div className="msc-thinkstage">
            <MascotClip state="thinking" width={120} />
            <b>Dr.AI is thinking</b>
            <span key={p.step} className="msc-thinkstage__step thk-fade">
              {STEPS[p.step]}
            </span>
            <span className="msc-thinkstage__dots" aria-hidden>
              {STEPS.map((s, i) => (
                <i key={s} className={cx(i <= p.step && 'is-on')} />
              ))}
            </span>
          </div>
        ) : (
          <div className="msg-ai">
            <div className="msg-ai__avatar msc-ai-avatar">
              <MascotClip state={mood(p.phase)} crop="head" width={36} />
            </div>
            <div className="msg-ai__body">
              <Researched />
              <Text shown={p.shown} />
            </div>
          </div>
        )}
      </div>
    </Play>
  );
}
// J · Standing on the box: the answers carry no avatar; Dr.AI stands on the composer's edge for the whole chat,
//     thinking, speaking, then standing by while you write back.
function VFullOnBox() {
  const p = usePlay();
  return (
    <Play p={p}>
      <div className="msc-chat msc-chat--bare">
        <div className="msg-user">
          <div className="msg-user__bubble">{QUESTION}</div>
        </div>
        <div className="msg-ai">
          <div className="msg-ai__body">
            {p.phase === 'thinking' ? <OnIt step={p.step} label="Dr.AI is thinking" /> : <Researched />}
            <Text shown={p.shown} />
          </div>
        </div>
      </div>
      <div className="msc-onbox">
        <MascotClip state={mood(p.phase)} width={70} className="msc-onbox__fig" />
        <label className="msc-input">
          <input placeholder="Reply to Dr.AI…" />
          <span className="msc-send">
            <ArrowUp size={16} />
          </span>
        </label>
      </div>
    </Play>
  );
}
// K · A companion beside the chat: one Dr.AI for the conversation, in the margin to the left, following each
//     answer down; the answers carry no avatar of their own.
function VFullCompanion() {
  const p = usePlay();
  return (
    <Play p={p}>
      <div className="msc-companion">
        <div className="msc-companion__rail">
          <MascotClip state={mood(p.phase)} width={72} />
          <span className="msc-companion__tag">{p.phase === 'thinking' ? 'Thinking' : p.phase === 'streaming' ? 'Answering' : 'Here if you need me'}</span>
        </div>
        <div className="msc-chat msc-chat--bare">
          <div className="msg-user">
            <div className="msg-user__bubble">{QUESTION}</div>
          </div>
          <div className="msg-ai">
            <div className="msg-ai__body">
              {p.phase === 'thinking' ? <OnIt step={p.step} /> : <Researched />}
              <Text shown={p.shown} />
            </div>
          </div>
        </div>
      </div>
    </Play>
  );
}
// L · C and H together: named while working ("Dr.AI is thinking"), in full beside the steps and the streaming
//     text; when the answer is in, the same clip zooms in to his head and settles as the small live avatar, one
//     smooth move rather than a swap.
function VFullMorph() {
  const p = usePlay();
  const working = p.phase !== 'done';
  return (
    <Play p={p}>
      <Thread
        avatar={<MascotClip state={mood(p.phase)} crop={working ? 'body' : 'head'} width={working ? 84 : 36} shape={working ? 'free' : 'circle'} className="msc-morph" />}
        working={p.phase === 'thinking' ? <OnIt step={p.step} label="Thinking" /> : <Researched />}
      >
        <Text shown={p.shown} />
      </Thread>
    </Play>
  );
}
// ---- From the full figure to the small head (6 Nov): ways for Dr.AI to settle once the answer is in ----
type Settle = 'fade' | 'sit' | 'ring' | 'blur' | 'flash' | 'pop' | 'blurscale' | 'blurglow' | 'blurslow';
function SettleAvatar({ kind, phase }: { kind: Settle; phase: Phase }) {
  const working = phase !== 'done';
  return (
    <span className={cx('msc-settle', `msc-settle--${kind}`, working ? 'is-working' : 'is-done')}>
      <span className="msc-settle__fig">
        <MascotClip state={mood(phase)} width={84} />
      </span>
      <span className="msc-settle__icon">
        <DrAiHead size={36} />
        {kind === 'ring' && <span className="msc-settle__ring" aria-hidden />}
      </span>
      {/* Q: a flash with Sparki in it as the big figure appears (thinking starts) and again as it goes (the answer
          is in); keyed so each plays from the start. */}
      {kind === 'flash' && (
        <span key={working ? 'in' : 'out'} className={cx('msc-settle__flash', working ? 'is-in' : 'is-out')} aria-hidden>
          <span className="msc-settle__burst" />
          <SparkiStill size={34} className="msc-settle__sparki" />
        </span>
      )}
      {kind === 'blurglow' && <span className="msc-settle__glow" aria-hidden />}
      {/* R: a soft bloom of light behind him as he pops, keyed so it plays on the way in and on the way out. */}
      {kind === 'pop' && <span key={working ? 'in' : 'out'} className={cx('msc-settle__bloom', working ? 'is-in' : 'is-out')} aria-hidden />}
    </span>
  );
}
/** Dr.AI beside an answer in the chat (6 Nov, R): he pops in, in full, as Spark starts working (as Sparki pops in
 *  the intro), thinks, and once the answer is in he glows and shrinks away while the menu's icon pops into his
 *  place. An answer already done when it appears (older ones, a reload) shows the head at once. */
export function ChatAvatar({ state, working }: { state: State; working: boolean; still?: boolean }) {
  const fresh = useRef(working);
  return (
    <span className={cx('msc-settle msc-settle--pop msc-settle--chat', working ? 'is-working' : 'is-done', !fresh.current && 'is-settled')}>
      {working || fresh.current ? (
        <span className="msc-settle__fig">
          <MascotClip state={working ? state : 'idle'} width={84} />
        </span>
      ) : null}
      {/* The menu's icon (6 Nov): the same Dr.AI as the menu and the Ask buttons, sharp, still. */}
      <span className="msc-settle__icon">
        <DrAiHead size={36} />
      </span>
      {fresh.current && <span key={working ? 'in' : 'out'} className={cx('msc-settle__bloom', working ? 'is-in' : 'is-out')} aria-hidden />}
    </span>
  );
}
function VSettle({ kind }: { kind: Settle }) {
  const p = usePlay();
  return (
    <Play p={p}>
      <Thread avatar={<SettleAvatar kind={kind} phase={p.phase} />} working={p.phase === 'thinking' ? <OnIt step={p.step} label="Thinking" /> : <Researched />}>
        <Text shown={p.shown} />
      </Thread>
    </Play>
  );
}
const SETTLES = [
  { title: 'L · Zoom into the face (now)', note: 'As the chat has it: the same clip zooms from the figure into his face and the circle closes round it. For comparison.', el: <VFullMorph /> },
  { title: 'M · Fade, and the icon pops in', note: 'The figure fades and shrinks a little; the menu’s icon appears in its place with a small springy pop. Quick and clear: the same face you see in the menu.', el: <VSettle kind="fade" /> },
  { title: 'N · He sits down into his icon', note: 'The figure shrinks down towards the avatar’s place, as if he sits down; the icon lands there with a soft bounce. The most character.', el: <VSettle kind="sit" /> },
  { title: 'O · The figure goes, a ring draws the icon', note: 'The figure fades; Spark’s light draws a ring round the icon as it appears, then fades. Ties the settle to the chat box’s light.', el: <VSettle kind="ring" /> },
  { title: 'P · Blur dissolve', note: 'The figure softens into a blur and away while the icon comes into focus out of one. The calmest.', el: <VSettle kind="blur" /> },
  { title: 'Q · Sparki’s flash', note: 'As Sparki does in the intro, twice: when Dr.AI starts thinking, Sparki pops as a glowing star, flashes, and the big figure appears out of the flash; when the answer is in, a flash takes the figure away and the small icon is there as it fades.', el: <VSettle kind="flash" /> },
  { title: 'R · Dr.AI pops like Sparki', note: 'Sparki’s own pop from the intro, given to Dr.AI: he appears with a bounce out of a soft bloom of light, glowing for a moment before he settles; when the answer is in he glows and shrinks away, and the small icon pops in the same way.', el: <VSettle kind="pop" /> },
  { title: 'P2 · Blur and shrink', note: 'As P, and the figure also shrinks into the circle as it blurs; the icon comes into focus from a little larger. More sense of “he became this”.', el: <VSettle kind="blurscale" /> },
  { title: 'P3 · Blur through Spark’s light', note: 'As P, with a soft glow of Spark’s colours behind the blur as one becomes the other, fading once the icon is sharp.', el: <VSettle kind="blurglow" /> },
  { title: 'P4 · Slow blur, a little light', note: 'As P, slower (about a second), and the icon arrives a touch bright before it settles. The gentlest.', el: <VSettle kind="blurslow" /> },
];

const FULL = [
  { title: 'L · C + H: named, in full, settling into his head', note: 'While Spark works he stands in full beside the steps, the line says “Dr.AI is thinking”; when the answer is in, the same clip zooms in to his face and settles as the small live avatar in its circle, in one smooth move.', el: <VFullMorph /> },
  { title: 'G · The whole figure as the avatar', note: 'Dr.AI with Sparki, small, in the avatar’s place; thinking while Spark works, speaking while the text streams, standing by after. The most presence for the least change.', el: <VFullAvatar /> },
  { title: 'H · Full while working, then his head', note: 'He stands beside the steps and the streaming text, then gives way to the small head (the menu’s tile) once the answer is in, so finished answers stay quiet.', el: <VFullThenHead /> },
  { title: 'I · A stage while thinking', note: 'While Spark works, Dr.AI in full, centred, the live step under him and a dot per step; when the answer starts he steps back to the avatar and the text takes his place.', el: <VFullStage /> },
  { title: 'J · Standing on the box', note: 'The answers carry no avatar; Dr.AI stands on the composer’s edge for the whole chat: thinking, speaking, then standing by while you write back.', el: <VFullOnBox /> },
  { title: 'K · A companion beside the chat', note: 'One Dr.AI for the conversation, in the margin to the left, with a word for what he is doing; the answers carry no avatar of their own.', el: <VFullCompanion /> },
];

// ---- The other places ----
function ChatStart() {
  const [focus, setFocus] = useState(false);
  return (
    <div className="msc-chatstart">
      <MascotClip state={focus ? 'listening' : 'idle'} width={170} />
      <h3>Hi Layla, what shall we work on?</h3>
      <label className="msc-input">
        <input placeholder="Ask Spark anything…" onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
        <span className="msc-send">
          <ArrowUp size={16} />
        </span>
      </label>
      <span className="msc-hint">{focus ? 'Listening: Dr.AI leans in while you type.' : 'Idle: click the box to see Listening.'}</span>
    </div>
  );
}
function Empty() {
  return (
    <div className="msc-empty">
      <MascotClip state="idle" width={104} />
      <b>You’re all caught up.</b>
      <span>Nothing waits on you. Spark will let you know when it does.</span>
    </div>
  );
}
function ReportInProgress() {
  return (
    <div className="hld-score msc-report">
      <span className="hld-score__top">
        <span className="hld-label">LinkedIn</span>
        <span className="hld-status hld-status--work">
          <i />
          In progress
        </span>
      </span>
      <div className="msc-report__body">
        <MascotClip state="thinking" crop="head" width={36} />
        <span>
          <b>Spark is working on it</b>
          <span>Reading 6 months of posts and comments. Ready by 12 Nov.</span>
        </span>
      </div>
    </div>
  );
}
function Hello() {
  return (
    <div className="msc-hello">
      <video src="/brand/spark-mascot.mp4" muted autoPlay loop playsInline className="msc-hello__film" />
      <div>
        <span className="hld-label">Welcome to Spark</span>
        <h3>Meet Dr.AI and Sparki.</h3>
        <p>Dr.AI analyses your brand and helps you act on it; Sparki shows up wherever you can ask it something.</p>
        <button type="button" className="btn btn--primary btn--sm">
          Get started
        </button>
      </div>
    </div>
  );
}
function SparkiButtons() {
  return (
    <div className="msc-buttons">
      <button type="button" className="hl-mchat msc-sparki">
        <SparkStar size={16} strokeWidth={2} /> Ask Spark
      </button>
      <button type="button" className="hl-fix__asklink msc-sparki">
        <SparkStar size={13} strokeWidth={2} /> Ask about this
      </button>
    </div>
  );
}
const PLACES = [
  { title: 'Chat: start', note: 'Dr.AI stands by on the empty chat and leans in (Listening) once the client types.', el: <ChatStart /> },
  { title: 'Empty state', note: 'Nothing waits on the client: Dr.AI standing by in full, at the hero size (104px, as in the panel).', el: <Empty /> },
  { title: 'A report in the making', note: 'While Spark prepares a report, its card shows Dr.AI thinking.', el: <ReportInProgress /> },
  { title: 'First visit', note: 'The one moment for the full film: Dr.AI and Sparki say hello once, at onboarding.', el: <Hello /> },
  { title: 'Sparki on the buttons', note: 'Sparki, small, wherever the client can ask Spark something; it lifts a little on hover. A stand-in star until the art.', el: <SparkiButtons /> },
];

/** Dr.AI across the portal (after the Clara AI reference): the switch, his small head at its sizes, and the way in. */
/** The menu icon: the lookbook's "Expression" view of his face, cut sharp from the clip, in a few shapes and
 *  grounds; the one chosen here goes to the sidebar. */
function NavIconPick() {
  const cur = useDrAiIcon();
  return (
    <section className="hld-card msc-icons">
      <h3 className="hld-title">Menu icon</h3>
      <p className="msc-icons__lead">A still of his face for the sidebar, as the lookbook’s “Expression” view, cut from the clip at full size. Pick one: it goes to the menu at once (Dr.AI on).</p>
      <div className="msc-icons__grid">
        {ICON_LOOKS.map((l) => (
          <button key={l.id} type="button" className={cx('msc-icon', cur === l.id && 'is-on')} onClick={() => setDrAiIcon(l.id)}>
            <span className="msc-icon__big">
              <DrAiHead size={96} look={l.id} />
            </span>
            <span className="msc-icon__sizes">
              {[16, 22, 32, 48].map((n) => (
                <DrAiHead key={n} size={n} look={l.id} />
              ))}
            </span>
            <span className="msc-icon__grounds">
              {['white', 'portal', 'glow', 'dark'].map((g) => (
                <span key={g} className={`msc-ground msc-ground--${g}`}>
                  <DrAiHead size={40} look={l.id} />
                </span>
              ))}
            </span>
            <span className="rail__btn msc-railitem">
              <DrAiHead size={30} look={l.id} />
              <span className="rail__label">Ask Dr.AI</span>
            </span>
            <span className="msc-icon__label">
              {cur === l.id && <Check size={13} />} {l.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function DrAiAcross() {
  const on = useDrAi();
  return (
    <section className="hld-card msc-across">
      <div className="msc-across__head">
        <div>
          <h3 className="hld-title">Dr.AI across the portal</h3>
          <p>Chats leaves the sidebar’s sections and comes back under a line as “Ask Dr.AI”; every Ask button becomes “Ask Dr.AI”, and the panel opens with him. Turn it on, then walk the portal.</p>
        </div>
        <div className="fdm-switch msc-across__switch">
          <button className={cx(!on && 'is-on')} onClick={() => setDrAi(false)}>
            Off · Spark
          </button>
          <button className={cx(on && 'is-on')} onClick={() => setDrAi(true)}>
            On · Dr.AI
          </button>
        </div>
      </div>
      <div className="msc-across__row">
        <div className="msc-across__sizes">
          {[16, 18, 24, 32, 48].map((n) => (
            <span key={n}>
              <DrAiHead size={n} />
              <i>{n}px</i>
            </span>
          ))}
        </div>
        <div className="msc-across__bits">
          <span className="rail__btn msc-railitem">
            <DrAiNavIcon size={30} />
            <span className="rail__label">Ask Dr.AI</span>
          </span>
          <span className="hl-mchat msc-askpill">
            <DrAiHead size={26} /> Ask Dr.AI
          </span>
        </div>
        <div className="msc-across__links">
          <span className="hld-label">Try it on</span>
          <a className="hld-link" href="#/">Home</a>
          <a className="hld-link" href="#/requests">Requests</a>
          <a className="hld-link" href="#/documents">Documents</a>
          <a className="hld-link" href="#/assistant">Chats</a>
        </div>
      </div>
      <p className="msc-note">
        <Check size={13} /> The small head is a still from the film, centred on his face, as a stand-in for the client’s own icon. The film’s head plays from about 36px (the chat, the panel).
      </p>
    </section>
  );
}

// ---- The input with light on its edge (5 Nov, after Border beam on libraries.dev): a beam of Spark's colours
//      rides the box's border, a soft bloom inside the edge where it passes. Our own build, in our colours. ----
type BeamKind = 'rotate' | 'soft' | 'pulse' | 'line' | 'active';
function BeamInput({ kind, speed = 2 }: { kind: BeamKind; speed?: number }) {
  const [typing, setTyping] = useState(false);
  const [focus, setFocus] = useState(false);
  const [voice, setVoice] = useState(false);
  // "active": off at rest; a slow beam in focus; quick and bright while you type or speak.
  const on = kind !== 'active' || focus || typing || voice;
  const fast = kind === 'active' && (typing || voice);
  return (
    <div
      className={cx('msc-beam', `msc-beam--${kind}`, on && 'is-on', fast && 'is-fast')}
      style={{ ['--beam-dur' as string]: `${fast ? speed * 0.6 : kind === 'active' ? speed * 1.6 : speed}s` }}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    >
      <span className="msc-beam__glow" aria-hidden />
      <Composer look="box" onSubmit={() => {}} onTyping={setTyping} onVoice={setVoice} placeholder="Ask Dr.AI anything…" />
    </div>
  );
}
const BEAMS = [
  { title: 'Rotate · soft', note: 'Rotate without the sharp line on the border: only the light that flares inside the edge as it passes, with its glow, going round more slowly (3.5 seconds).', el: <BeamInput kind="soft" speed={3.5} /> },
  { title: 'Rotate', note: 'A beam of Spark’s light, blue into lilac into coral, goes round the border every 2 seconds, a soft bloom inside the edge where it passes. Always on.', el: <BeamInput kind="rotate" /> },
  { title: 'Pulse', note: 'No travelling: the whole edge breathes in and out in Spark’s colours, the bloom with it. Calmer; reads as “ready”.', el: <BeamInput kind="pulse" /> },
  { title: 'Line', note: 'Only the thin beam on the border, no bloom inside: the quietest of the three.', el: <BeamInput kind="line" /> },
  { title: 'Wakes with you', note: 'Off at rest. Click into the box: a slow beam. Type or press the mic: it quickens and brightens while Dr.AI listens. Off again when you leave the box.', el: <BeamInput kind="active" /> },
];

// ---- "Ask about this" on a report's issue, with Dr.AI (5 Nov): the same card as the report page, the ask in
//      four ways. Each opens the panel with a question about this issue already written. ----
const ISSUE = {
  title: 'TikTok is reposted Reels',
  body: 'Videos are cut for Instagram and reposted. Views stay under 2K; the native creator-led posts of competitors reach 20–60K.',
  fix: 'Make TikTok its own: short, vertical, creator-led videos, three a week.',
};
type AskKind = 'label' | 'head' | 'pill' | 'fix' | 'g-drift' | 'g-sparks' | 'g-beam' | 'g-hover';
function IssueAsk({ kind }: { kind: AskKind }) {
  const [open, setOpen] = useState(false);
  const ask = () => setOpen(true);
  const request = (
    <Button size="sm" variant="secondary" className="hl-fix__make">
      Request proposal
    </Button>
  );
  return (
    <div className="hdc hdc--feature anc-issue msc-issue">
      <div className="hdc-issue">
        <span className="hl-fix__meta">
          <span className="hdc-issue__about">
            <span className="hl-impact hl-impact--high">High impact</span>
          </span>
        </span>
        <b className="hl-fix__title">{ISSUE.title}</b>
        <p className="hl-fix__body">{ISSUE.body}</p>
        <div className={cx('hl-fix__do', kind === 'fix' && 'msc-issue__do')}>
          <span className="hl-fix__do-label">
            What we’d do <SparkStar size={12} strokeWidth={2} className="hl-fix__do-mark" aria-hidden />
          </span>
          <span className="hl-fix__do-text">{ISSUE.fix}</span>
          {kind === 'fix' && (
            <button type="button" className="msc-issue__dobtn" onClick={ask}>
              <DrAiHead size={22} /> Ask Dr.AI about this
            </button>
          )}
        </div>
        <span className="hl-fix__acts hl-fix__tools anx-issue__acts msc-issue__acts">
          {kind === 'label' && (
            <>
              {request}
              <button type="button" className="hl-fix__asklink msc-issue__link" onClick={ask}>
                <DrAiHead size={22} /> Ask about this
              </button>
            </>
          )}
          {kind === 'head' && (
            <>
              <button type="button" className="msc-issue__head" onClick={ask} aria-label="Ask Dr.AI about this issue">
                <DrAiHead size={30} />
                <span>Ask about this</span>
              </button>
              <span className="msc-issue__spacer" />
              {request}
            </>
          )}
          {kind === 'pill' && (
            <>
              {request}
              <button type="button" className="msc-issue__pill" onClick={ask}>
                <DrAiHead size={24} /> Ask about this
              </button>
            </>
          )}
          {kind === 'fix' && request}
          {kind.startsWith('g-') && (
            <>
              {request}
              <AskGlow kind={kind as GlowKind} onClick={ask} />
            </>
          )}
        </span>
      </div>
      <ChatDrawer open={open} onClose={() => setOpen(false)} initial={`Tell me more about “${ISSUE.title}” and what you’d do about it.`} />
    </div>
  );
}
/** "Ask about this" in the chat's light (5 Nov, after "Tune in Studio" on libraries.dev): a pill the size and
 *  weight of Request proposal, Dr.AI's head at its start, Spark's colours glowing softly inside its rim. */
type GlowKind = 'g-drift' | 'g-sparks' | 'g-beam' | 'g-hover';
function AskGlow({ kind, onClick }: { kind: GlowKind; onClick: () => void }) {
  return (
    <button type="button" className={cx('msc-glowbtn', `msc-glowbtn--${kind.slice(2)}`)} onClick={onClick}>
      {kind === 'g-beam' && <span className="msc-glowbtn__beam" aria-hidden />}
      <span className="msc-glowbtn__head">
        <DrAiHead size={20} />
        {kind === 'g-sparks' && (
          <span className="msc-glowbtn__sparks" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <i key={i} style={{ ['--i' as string]: i }} />
            ))}
          </span>
        )}
      </span>
      <span className="msc-glowbtn__label">Ask about this</span>
    </button>
  );
}
const ASKS = [
  { title: 'A · His head as the mark', note: 'As today, with Dr.AI’s head in place of the spark: Request proposal, then “Ask about this” beside it. The smallest change; the words keep saying it’s about this issue.', el: <IssueAsk kind="label" /> },
  { title: 'B · His head alone, the words on hover', note: 'Your idea: Dr.AI on the left, Request proposal on the right. At rest only his head; on hover the words slide out of it (“Ask about this”), so the click is clear before it’s made. On touch the words would always show.', el: <IssueAsk kind="head" /> },
  { title: 'C · Ask as a second button', note: 'Both actions as buttons of one height: Request proposal and a glass “Ask about this” with his head. Equal weight; reads as two ways forward.', el: <IssueAsk kind="pill" /> },
  { title: 'E · In the chat’s light, drifting', note: 'After “Tune in Studio”: a pill the size and weight of Request proposal, Dr.AI’s head at its start, Spark’s colours glowing softly inside its rim and slowly drifting. The same light as the chat box, so it reads as “this opens the chat”.', el: <IssueAsk kind="g-drift" /> },
  { title: 'F · E, with sparks on hover', note: 'As E; on hover a few small sparks fly out of Dr.AI’s head (the reference’s wand), and the glow brightens a little. At rest it’s as calm as E.', el: <IssueAsk kind="g-sparks" /> },
  { title: 'G · The chat box’s light going round', note: 'The same light as the chat box (Rotate · soft) going round the pill’s edge, slowly. The closest tie to the chat; more motion than E.', el: <IssueAsk kind="g-beam" /> },
  { title: 'H · Calm, lit on hover', note: 'At rest exactly the weight of Request proposal: white, a hairline, his head. On hover Spark’s colours come up inside the rim. The two buttons stay equal until you point at one.', el: <IssueAsk kind="g-hover" /> },
  { title: 'D · Ask inside “What we’d do”', note: 'Dr.AI sits in the fix itself: “Ask Dr.AI about this” at the foot of what we’d do, so it plainly asks about this fix. Request proposal stays the one action under the card.', el: <IssueAsk kind="fix" /> },
];

export function MascotDemo() {
  const cards = (list: { title: string; note: string; el: ReactNode }[]) => (
    <div className="msc-grid">
      {list.map((s) => (
        <section key={s.title} className="hld-card msc-card">
          <h3 className="hld-title">{s.title}</h3>
          <div className="msc-stage">{s.el}</div>
          <p className="msc-note">
            <Check size={13} /> {s.note}
          </p>
        </section>
      ))}
    </div>
  );
  return (
    <div className="cdemo">
      <PageHeader title="Mascot · where it lives" sub="Dr.AI and Sparki from the brand film, on the film’s own ground in a circle or a tile, where they could appear. Prototype only." />
      <DrAiAcross />
      <NavIconPick />
      <h2 className="msc-h2">“Ask about this” on an issue</h2>
      {cards(ASKS)}
      <h2 className="msc-h2">The input · light on its edge</h2>
      {cards(BEAMS)}
      <h2 className="msc-h2">While Spark answers</h2>
      {cards(ANSWERING)}
      <h2 className="msc-h2">From the full figure to the small head</h2>
      {cards(SETTLES)}
      <h2 className="msc-h2">While Spark answers · Dr.AI in full</h2>
      {cards(FULL)}
      <h2 className="msc-h2">Other places</h2>
      {cards(PLACES)}
    </div>
  );
}

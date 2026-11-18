// Onboarding with Dr.AI and Sparki (prototype, 6 Nov; client: "let Dr.AI and Sparki be an assistant users interact
// with"). A new company finds the portal empty; four first steps, each done when the client really does it (the
// store says so, nothing is ticked by hand). Dr.AI says the step from his corner, with a small stepper; Sparki leaves
// him and flies to where the step starts (a link in the sidebar, then the button on the page), lighting it up.
// Started and stopped on #/demo/dock.
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import { AnalysisView } from '../home/AnalysisLooks';
import { HomeBentoC, HomeCompanyCard, HomeSwitch } from '../demo/HomeBentoDemo';
import { analyses } from '../../data/mock';
import { Gauge } from '../demo/HomeVariantsDemo';
import { useRoute } from '../../lib/router';
import { useStore, type State } from '../../state/store';
import { SlideTabs, cx } from '../../components/ui/primitives';
import { MetalParts, metalClass, useMetalUi } from '../../components/ui/MetalButton';
import { playWelcome } from './LiquidWelcome';
import { HighlightRim, useHlLook } from './HighlightRim';
import { SparkiStill } from '../../components/ui/DrAi';
import { FactsCard, HomeCredits, ProfileFull } from '../demo/HomeRethinkDemo';
import { navigate } from '../../lib/router';
import { LatestFromSpark, TeamLine } from '../home/HomeLayouts';
import { MascotClip } from '../demo/MascotDemo';
import { BrandArt, LatestArtView, useArt } from './EmptyArt';
import { useUiVariant } from '../../lib/uiVariant';
import { CreateRequestDialog, type RequestPrefill } from '../requests/CreateRequestDialog';

/** The first element matching `sel` whose text includes `text`. */
const byText = (sel: string, text: string) => [...document.querySelectorAll<HTMLElement>(sel)].find((e) => e.textContent?.includes(text)) ?? null;

export type Step = {
  key: string;
  title: string;
  line: string;
  /** What Dr.AI says for it; [brackets] take the gradient. */
  say: string;
  /** What he says once it's done. */
  doneSay: string;
  /** Where the step starts (may depend on what's there: the request starts in your chat). */
  go: (s: State) => string;
  /** Not needed to finish the setup (6 Nov: inviting the team); it can be skipped and done any time later. */
  optional?: boolean;
  done: (s: State) => boolean;
  /** What Sparki lights up on the page you're on, and what he says there. Instructions only: questions are Dr.AI's. */
  point: (path: string) => Point;
  /** Once it's done, where its result lives (6 Nov: the request, in Requests), shown while Dr.AI says well done. */
  after?: (path: string) => Point;
};
type Point = { el: HTMLElement | null; say: string };
const rail = (href: string) => document.querySelector<HTMLElement>(`.rail a[href="#${href}"]`);

export const STEPS: Step[] = [
  {
    key: 'hello',
    // Home's words (6 Nov): the same point as Dr.AI's line in the corner, said differently and with more context.
    title: 'Meet Dr.AI',
    line: 'Brand and market answers, with sources.',
    say: 'Hi Layla, I’m [Dr.AI]. Four steps and you’re set up.',
    doneSay: '[Lovely to meet you.] Next: your first request.',
    go: () => '/assistant',
    done: (s) => s.conversations.length > 0,
    point: (p) =>
      p.startsWith('/assistant')
        ? { el: document.querySelector<HTMLElement>('.composer'), say: 'Type here, press Enter' }
        : { el: document.querySelector<HTMLElement>('.rail__btn--drai'), say: 'Open the chat' },
  },
  {
    key: 'request',
    title: 'Brief Spark on a first project',
    line: 'A chat becomes a request; a proposal follows.',
    // The request starts from the chat (6 Nov, review): Dr.AI's answer has Request proposal under it. Requests is
    // shown after, as where the request lives.
    say: 'Now your [first request]: press Request proposal under my answer, and Spark sends a proposal within two days.',
    doneSay: '[Your first request is with Spark.] You’ll find it in Requests.',
    go: (s) => {
      const last = [...s.conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
      return last ? `/assistant/${last.id}` : '/requests';
    },
    done: (s) => s.requests.length > 0,
    point: (p) =>
      p.startsWith('/assistant/')
        ? { el: byText('main button', 'Request proposal'), say: 'Click Request proposal' }
        : p === '/requests'
          ? { el: byText('main button', 'New request'), say: 'Click New request' }
          : { el: document.querySelector<HTMLElement>('.rail__btn--drai'), say: 'Back to your chat' },
    // Where it lives: "Go to requests" in the Request sent dialog, or Requests in the sidebar once it's closed.
    after: () => {
      const inDialog = byText('[role="dialog"] button', 'Go to requests');
      return inDialog ? { el: inDialog, say: 'Find it in Requests' } : { el: rail('/requests'), say: 'Your request is here' };
    },
  },
  {
    key: 'files',
    title: 'Add your brand materials',
    line: 'Guidelines, logos, past campaigns.',
    say: 'Next, your [brand files]: guidelines, logos, past campaigns. Spark reads them before it starts. Or do it later.',
    doneSay: '[Got them, thank you.] One step left.',
    // Documents opens on Your team, where the drop card is (9 Nov, review).
    go: () => '/documents',
    // Optional too (6 Nov): the request is what Spark needs to start; files can follow, and Dr.AI reminds you.
    optional: true,
    done: (s) => s.docs.some((d) => d.uploadedBy === 'u-layla'),
    point: (p) =>
      p.startsWith('/documents')
        ? document.querySelector<HTMLElement>('main .drop-card')
          ? { el: document.querySelector<HTMLElement>('main .drop-card'), say: 'Drop your files here' }
          : { el: byText('main [role="tab"], main button', 'Your team'), say: 'Open Your team' }
        : { el: rail('/documents'), say: 'Go to Documents' },
  },
  {
    key: 'team',
    title: 'Bring in your colleagues',
    line: 'Share requests and decide together.',
    say: 'One more, if you like: [invite your team], so they see requests and proposals too. Or do it later.',
    doneSay: '[You’re all set!] I’ll keep an eye on what needs you.',
    go: () => '/team',
    optional: true,
    done: (s) => s.invitations.length > 0,
    point: (p) =>
      p.startsWith('/team')
        ? { el: byText('main button', 'Invite people'), say: 'Click Invite people' }
        : { el: document.querySelector<HTMLElement>('.rail__me'), say: 'Open your menu, then Team' },
  },
];

export function useOnboarding() {
  const { state } = useStore();
  const tutorial = !!state.onboarding && !state.onboardingDone;
  const skipped = STEPS.map((s) => !!s.optional && (state.onboardingSkipped ?? []).includes(s.key) && !s.done(state));
  // A skipped step counts as settled: the setup can finish without it.
  const done = STEPS.map((s, i) => s.done(state) || skipped[i]);
  const current = done.findIndex((d) => !d);
  return { on: tutorial, fresh: !!state.onboarding, done, skipped, current, count: done.filter(Boolean).length, all: current === -1 };
}

/** Four segments, the done ones in the gradient, the current one breathing. */
export function Stepper({ done, current, skipped = [], just }: { done: boolean[]; current: number; skipped?: boolean[]; just?: number | null }) {
  return (
    <span className="og-stepper" aria-label={`${done.filter(Boolean).length} of ${done.length} steps done`}>
      {done.map((d, i) => (
        <i
          key={i}
          // A step put off counts on the line as one passed (9 Nov, review): the line fills either way.
          className={cx((d || skipped[i]) && 'is-done', i === current && !skipped[i] && 'is-now', STEPS[i]?.optional && 'is-optional', just === i && 'is-just')}
          // One Noor line across the four: each segment shows its own stretch of it.
          style={{ ['--i' as string]: i, ['--of' as string]: done.length }}
        />
      ))}
    </span>
  );
}

/** Sparki flies to what `point` names on this page and says what to do there; at rest by Dr.AI's card when there's
 *  nothing to point at. `id` names what he's showing (a step, or where its result lives). */
export function SparkiGuide({ point, id, active }: { point?: (path: string) => Point; id?: string; active: boolean }) {
  const { path } = useRoute();
  const [at, setAt] = useState<{ box: DOMRect; say: string; radius: number } | null>(null);
  const raf = useRef(0);
  // Sparki can be dragged aside when he covers something (6 Nov); he comes back to his place for the next thing he
  // shows, or on another page.
  const [off, setOff] = useState({ dx: 0, dy: 0 });
  const grab = useRef<{ x: number; y: number; dx: number; dy: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  useEffect(() => setOff({ dx: 0, dy: 0 }), [id, path]);
  const down = (e: RPointerEvent<HTMLElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    grab.current = { x: e.clientX, y: e.clientY, dx: off.dx, dy: off.dy };
    setDragging(true);
  };
  const move = (e: RPointerEvent<HTMLElement>) => {
    const g = grab.current;
    if (g) setOff({ dx: g.dx + e.clientX - g.x, dy: g.dy + e.clientY - g.y });
  };
  const up = () => {
    grab.current = null;
    setDragging(false);
  };
  useLayoutEffect(() => {
    if (!active || !point) {
      setAt(null);
      return;
    }
    // a new page or a new step starts clean: nothing from the last one lingers (18 Nov, review: the rim and "Click
    // Request proposal" stayed on Home and on an empty chat, where the button had gone)
    setAt(null);
    let last = '';
    const tick = () => {
      raf.current = requestAnimationFrame(tick);
      let next: { box: DOMRect; say: string; radius: number } | null = null;
      let key = '';
      try {
        // A dialog over the page (the New request form): Sparki waits by Dr.AI until it closes, unless what he
        // points at is in the dialog itself (Go to requests, once the request is sent).
        const dialog = document.querySelector('[role="dialog"]');
        let p: Point | null = point(path);
        if (dialog && p?.el && !dialog.contains(p.el)) p = null;
        const el = p?.el;
        const r = el?.isConnected ? el.getBoundingClientRect() : undefined;
        // only what can be seen: on screen, not hidden, not covered at its middle
        const seen =
          !!r && r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth &&
          !!el && el.checkVisibility?.({ visibilityProperty: true }) !== false;
        if (seen && p && el && r) {
          const cx = Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1);
          const cy = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1);
          const hit = document.elementsFromPoint(cx, cy).find((n) => !n.closest('.og-sparki, .og-hlm'));
          if (!hit || el.contains(hit) || hit.contains(el)) {
            key = `${r.x | 0},${r.y | 0},${r.width | 0},${r.height | 0},${p.say}`;
            // The rim follows the target's own corners (a pill stays a pill), 7 px out.
            const radius = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 10, r.height / 2);
            next = { box: r, say: p.say, radius };
          }
        }
      } catch {
        next = null;
        key = '';
      }
      if (key !== last) {
        last = key;
        setAt(next);
      }
    };
    tick();
    return () => cancelAnimationFrame(raf.current);
  }, [active, point, path]);

  if (!active || !point) return null;
  return <GuideView at={at} id={id} path={path} off={off} dragging={dragging} down={down} move={move} up={up} />;
}

/** What SparkiGuide draws; apart so the flight can keep its own state (9 Nov, wave 1 of motion). */
function GuideView({
  at,
  id,
  path,
  off,
  dragging,
  down,
  move,
  up,
}: {
  at: { box: DOMRect; say: string; radius: number } | null;
  id?: string;
  path: string;
  off: { dx: number; dy: number };
  dragging: boolean;
  down: (e: RPointerEvent<HTMLElement>) => void;
  move: (e: RPointerEvent<HTMLElement>) => void;
  up: () => void;
}) {
  // Sparki flies (9 Nov): when what he shows moves far, he spins and brightens on the way, a light trail behind.
  const [flying, setFlying] = useState(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!at) return;
    const p = { x: at.box.left, y: at.box.top };
    const was = last.current;
    last.current = p;
    if (was && Math.hypot(p.x - was.x, p.y - was.y) > 40) {
      setFlying(true);
      const t = setTimeout(() => setFlying(false), 900);
      return () => clearTimeout(t);
    }
  }, [at?.box.left, at?.box.top]); // eslint-disable-line react-hooks/exhaustive-deps
  const hl = useHlLook();
  const box = at?.box;
  // the beats for each thing he shows (17 Nov, review: "don't fly round it, just appear beside it"): the rim
  // lights the target alone ('lit'), then Sparki appears by it with his tip ('rest')
  const target = box ? `${id}${path}` : '';
  const [beat, setBeat] = useState<{ of: string; is: 'lit' | 'rest' }>({ of: '', is: 'lit' });
  useEffect(() => {
    if (!target) return;
    setBeat({ of: target, is: 'lit' });
    const t = setTimeout(() => setBeat((b) => (b.of === target ? { of: target, is: 'rest' } : b)), 700);
    return () => clearTimeout(t);
  }, [target]);
  const phase = beat.of === target ? beat.is : 'lit';
  const seen = !box || phase !== 'lit';
  // Sparki sits on the highlighted target's right edge, centred, a little on its glass rim (9 Nov, review), or on
  // its left edge near the page's right edge; at rest by Dr.AI's card.
  const right = box ? box.right + 60 < window.innerWidth : true;
  const x = box ? (right ? box.right - 8 : box.left + 8) : window.innerWidth - 300;
  const y = box ? box.top + box.height / 2 - 22 : window.innerHeight - 260;
  // On the left, Sparki and his word end where the target begins.
  const shift = box && !right ? ' translateX(-100%)' : '';
  return createPortal(
    <>
      {box && (
        // The rim round what to press in the Ask Dr.AI button's metal (17 Nov, review; the look picked on
        // #/demo/highlight-metal), 6 px outside the target, following its corners. A new key per target.
        <HighlightRim
          key={`${id}${path}`}
          look={hl}
          className="og-hlm"
          still
          style={{ left: box.left - 6, top: box.top - 6, width: box.width + 12, height: box.height + 12, ['--metal-radius' as string]: `${(at?.radius ?? 10) + 6}px`, borderRadius: (at?.radius ?? 10) + 6 }}
        />
      )}
      <span
        className={cx('og-sparki', box && seen && 'is-on', box && phase === 'lit' && 'is-wait', !right && 'is-left', dragging && 'is-dragging', flying && 'is-flying')}
        style={{ transform: `translate(${x + off.dx}px, ${y + off.dy}px)${shift}` }}
        aria-hidden
      >
        <span className="og-sparki__bob" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onDragStart={(e) => e.preventDefault()} title="Drag me aside">
          {/* a fresh pop each time he appears by something new */}
          <span key={phase === 'rest' ? target : 'wait'} className="og-sparki__pop">
            <SparkiStill size={44} />
          </span>
        </span>
        {/* Sparki says it (6 Nov): mono capitals typed out in the same glass as Dr.AI's card, Ember's dot breathing. */}
        {at && phase === 'rest' && (
          // In Dr.AI's "Thinking" pill (9 Nov, picked on #/demo/sparki-bubbles, D): Sparki speaks in the chat's own
          // bubble, a sentence and the grey dots breathing; the wrapper keeps his bubble's place.
          <span key={`${id}${path}${at.say}`} className="og-say og-say--thk">
            <span className="thk-glass thk-glass--warm thk-glass--tail">
              {/* Ember's dot breathing, ahead of the words (9 Nov, review), not the chat's grey dots. */}
              <i className="og-say__dot" />
              {at.say.charAt(0).toUpperCase() + at.say.slice(1).toLowerCase()}
            </span>
          </span>
        )}
      </span>
    </>,
    document.body,
  );
}

/** Home while onboarding: a welcome, the four steps as cards with a coloured progress, and what will appear. */
// Home's tabs (9 Nov, the client back to version B, after Jean #19): under the company's card, Brand Analysis as
// tabs on a rule: Overview, Company profile, Social media report, Website report. In the address, so Back works.
const HOME_TABS = [
  ['overview', 'Overview'],
  ['profile', 'Company profile'],
  ['social', 'Social media report'],
  ['website', 'Website report'],
] as const;
type HomeTab = (typeof HOME_TABS)[number][0];

/** A report not made yet (a new company): what it will hold, and a way to ask for it. */
export function ReportToCome({ kind }: { kind: 'social' | 'website' }) {
  const art = useArt();
  const what =
    kind === 'social'
      ? { title: 'No social media report yet', body: 'Spark looks at your Instagram, TikTok and LinkedIn: what people engage with, what falls flat, and what to fix first.' }
      : { title: 'No website report yet', body: 'Spark checks your site on mobile and desktop: speed, how easy it is to find and buy, and whether it looks like your brand.' };
  return (
    <section className="og-later__card og-tocome">
      {/* The reports' picture, as on Home's "No reports yet" (10 Nov, review). */}
      <span className="og-later__art">
        <BrandArt v={art.ba} />
      </span>
      <b>{what.title}</b>
      <span>{what.body}</span>
      {/* No button here (11 Nov, review): Request a report sits by Brand Analysis's name, over every tab. */}
    </section>
  );
}

/** The welcome (9 Nov, wave 1 of motion): before the first step, Dr.AI on a clear ground, the spectrum's light
 *  behind him, a few words; then he heads for his corner and the page comes up behind. Once per new company. A
 *  click, or Let's go, skips it. */
// How the welcome opens (10 Nov, review, on #/demo/intro-bubble): 'now', Dr.AI on the ground with the words, the
// bubble gathering round him only as he flies; 'words', the ground alone first, then Dr.AI floats in already in his
// clear bubble, the words come, and the bubble carries him to his corner and breaks there; 'only', the same without
// the words. The bubble breaks as a burst of drops, or cleanly.
export type WelcomeLook = 'now' | 'words' | 'only';
export type WelcomePop = 'burst' | 'clean';

export function WelcomeIntro({ demo }: { demo?: { look: WelcomeLook; pop: WelcomePop; onDone: () => void } } = {}) {
  const { state, me, actions } = useStore();
  const ob = useOnboarding();
  // The first visit, and every return after logging out (9 Nov, review): a returning visitor is welcomed back.
  const show = demo ? true : ob.on && !state.onboardingIntro;
  const look: WelcomeLook = demo?.look ?? 'now';
  const pop: WelcomePop = demo?.pop ?? 'clean';
  const bubble = look !== 'now';
  const back = ob.count > 0;
  // The way out (9 Nov, review: "a nicer exit"): the words lift away, Dr.AI hops in an arc to his corner, shrinking
  // to the corner figure's size, the ground closes after him as an iris into that spot, and the corner lights up as
  // he lands. The corner figure is measured, so he lands exactly where it stands, even if it was dragged.
  const fig = useRef<HTMLDivElement>(null);
  const [out, setOut] = useState<null | Record<string, string>>(null);
  const leave = () => {
    if (out) return;
    const from = fig.current?.getBoundingClientRect();
    const to = document.querySelector('.dk--corner .dk-fig')?.getBoundingClientRect();
    const tx = to ? to.left + to.width / 2 : window.innerWidth - 110;
    const ty = to ? to.top + to.height / 2 : window.innerHeight - 130;
    const fx = from ? from.left + from.width / 2 : window.innerWidth / 2;
    const fy = from ? from.top + from.height / 2 : window.innerHeight / 2;
    const sc = to && from ? to.width / from.width : 0.6;
    // --br: the bubble's radius once it has shrunk to the corner, where it breaks.
    setOut({ '--ix': `${tx}px`, '--iy': `${ty}px`, '--dx': `${tx - fx}px`, '--dy': `${ty - fy}px`, '--sc': `${sc}`, '--br': `${185 * sc}px` });
  };
  // The few seconds to read start once he is on screen (9 Nov, review: in a new browser the clip was still loading
  // when the welcome left, so he never appeared). Until then his still stands in; after 9 s it goes on anyway.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!show) return;
    // With the bubble the opening takes longer (the ground first, then he floats in): the words get their time after.
    const t = setTimeout(leave, !ready ? 9000 : look === 'words' ? 5400 : look === 'only' ? 2900 : 4200);
    return () => clearTimeout(t);
  });
  // He lands at 1.15 s; then the flying figure and the corner one cross-fade in place (9 Nov, review: a blink when
  // one clip simply replaced the other), and the welcome goes once the corner figure is fully in.
  const [landed, setLanded] = useState(false);
  useEffect(() => {
    if (!out) return;
    const t1 = setTimeout(() => setLanded(true), 1150);
    // A burst needs a moment longer to scatter before the welcome goes.
    const t2 = setTimeout(() => (demo ? demo.onDone() : actions.seeIntro()), bubble && pop === 'burst' ? 2000 : 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [out, actions]);
  if (!show) return null;
  return createPortal(
    <div
      className={cx('og-intro', bubble && 'og-intro--bubble', look === 'only' && 'og-intro--only', bubble && pop === 'burst' && 'og-intro--burst', out && 'is-out', landed && 'is-landed')}
      style={out ?? undefined}
      onClick={leave}
      role="dialog"
      aria-label="Welcome"
    >
      <span className="og-intro__ground" aria-hidden>
        <span className="og-intro__light" />
      </span>
      <div ref={fig} className="og-intro__fig">
        <span className="og-intro__hop">
          <MascotClip state="speaking" width={230} intro poster="/brand/drai/intro-still.webp" onReady={() => setReady(true)} />
          {/* He flies to his corner in a clear glass bubble that gathers round him on the way (9 Nov, demo E). */}
          <span className="og-intro__bubble" aria-hidden />
        </span>
      </div>
      {/* Where the bubble breaks, in his corner: drops of the glass flying off, and a ring of light. */}
      {bubble && pop === 'burst' && (
        <span className="og-intro__burst" aria-hidden>
          <i className="og-intro__ring" />
          {Array.from({ length: 14 }, (_, i) => (
            <i key={i} className="og-intro__drop" style={{ ['--a' as string]: `${i * (360 / 14) + (i % 2 ? 9 : -4)}deg`, ['--d' as string]: `${(i % 3) * 0.03}s`, ['--f' as string]: `${1 + (i % 4) * 0.22}` }} />
          ))}
        </span>
      )}
      <div className="og-intro__text">
        <span className="og-intro__label">{back ? 'Welcome back' : 'Welcome to Spark'}</span>
        <h1>
          {back ? (
            <>
              Good to see you, {me.name.split(' ')[0]}. <span className="dk-hl">Dr.AI</span> here.
            </>
          ) : (
            <>
              Hi {me.name.split(' ')[0]}, I’m <span className="dk-hl">Dr.AI</span>.
            </>
          )}
        </h1>
        <p>
          {!back
            ? 'Four short steps and your workspace is ready. I’ll show you the way.'
            : ob.all
              ? 'All four steps are done. Your workspace is ready.'
              : `${ob.count} of 4 steps done. Let’s pick up where you left off.`}
        </p>
        {/* No button (9 Nov, review): the welcome goes on its own after a few seconds, or on a click anywhere. */}
      </div>
    </div>,
    document.body,
  );
}

/** A report as Home's tab (9 Nov, the portal on the onboarding flow's tabs): the live report, its PDF copy in
 *  Documents (Jean #26), the issues by impact as the deeper layer under the overview's figures (Jean #25). */
function ReportTab({ kind, issue }: { kind: 'social' | 'website'; issue?: string }) {
  const report = analyses.find((a) => a.kind === kind);
  if (!report) return <ReportToCome kind={kind} />;
  return (
    <div className="og-report">
      {/* No link to the PDF copy above the report (9 Nov, review): the copies sit in Documents · Research reports. */}
      <AnalysisView key={kind} a={report} look="cards" page focus={issue} />
    </div>
  );
}

/** A report's tile on the overview (9 Nov, Jean #22: "numbers, score, big font, to make the results more engaging
 *  and easy to understand… encourage to learn more and book consultation"): the report's name, a verdict chip, the
 *  figure in big type (the website's score on a ring), the change since last month, how many things to fix, and the
 *  way into the report. The tile is the link. */
function ScoreTile({ kind }: { kind: 'website' | 'social' }) {
  const a = analyses.find((x) => x.kind === kind);
  if (!a) return null;
  const toFix = a.findings.filter((f) => !f.good).length;
  const high = a.findings.filter((f) => !f.good && f.impact === 'High').length;
  const web = kind === 'website';
  const score = parseInt(a.score?.value ?? '0', 10);
  return (
    <a className="hc-card og-score" href={`#/?tab=${kind}`}>
      <span className="og-score__head">
        <h3 className="og-full__h">{web ? 'Website report' : 'Social media report'}</h3>
        <span className={cx('og-chip', web ? 'og-chip--warn' : 'og-chip--good')}>{web ? 'Needs work' : 'Above the market'}</span>
      </span>
      <span className="og-score__body">
        {web ? (
          <span className="og-score__ring">
            <Gauge value={score} />
            <span>
              <b>{score}</b>
              <i>/100</i>
            </span>
          </span>
        ) : (
          <b className="og-score__fig">{a.score?.value}</b>
        )}
        <span className="og-score__facts">
          <span className="og-score__what">{a.score?.label}</span>
          <span className={cx('og-score__delta', web ? 'is-up' : 'is-down')}>
            {web ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {web ? '+6 since September' : '−0.4 pt since September'}
          </span>
          <span className="og-score__bench">{web ? 'Fast sites score 90 and up' : 'vs 1.9% typical for UAE retail'}</span>
        </span>
      </span>
      <span className="og-score__foot">
        <span className="og-score__line">{a.headline}</span>
        <span className="og-score__go">
          {toFix} to fix{high ? ` · ${high} high impact` : ''} <ArrowRight size={14} />
        </span>
      </span>
    </a>
  );
}

/** The overview for a company past onboarding (9 Nov): the two reports' figures in big type (Jean #22), the
 *  consultation across the page under them (#22), then the latest from Spark with Sparki by its title (#23), its
 *  title in the reports' type. One level of cards, nothing boxed twice (#20). */
function FilledOverview() {
  return (
    <div className="og-full">
      <div className="og-scores">
        <ScoreTile kind="website" />
        <ScoreTile kind="social" />
      </div>
      {/* no consultation here (17 Nov, design sync: Dr.AI's chat and requests cover it) */}
      {/* The same list as Home D (rows as tiles to click). */}
      <section id="latest" className="hc-card hd-fixes hd-latest og-full__latest">
        {/* No icon by the title (9 Nov, review): the news is in Dr.AI's window too, Sparki is for hints. */}
        <h3 className="og-full__h og-full__latest-head">Latest from Spark</h3>
        <div className="hld-card hc-latest__list">
          <LatestFromSpark bare limit={4} typed />
        </div>
      </section>
    </div>
  );
}

/** Plays the welcome on a new company's first visit to Home (11 Nov, picked on #/demo/welcome-liquid), in its own
 *  layer over the app; it counts as seen once Dr.AI stands in his corner, or when it is skipped. The earlier
 *  welcome (WelcomeIntro) stays for its demos. */
function FirstWelcome() {
  const { state, me, actions } = useStore();
  const ob = useOnboarding();
  // a new company on its first visit; and, since the local View switch (12 Nov), a company past onboarding after it
  // signs in again (signIn clears onboardingIntro), greeted as one coming back
  const back = !state.onboarding;
  const show = (ob.on || back) && !state.onboardingIntro;
  const seen = useRef(actions.seeIntro);
  seen.current = actions.seeIntro;
  const who = {
    name: me.name.split(' ')[0],
    company: state.brand.name,
    city: (state.brand.hq ?? '').split(',').pop()?.trim() || 'Abu Dhabi',
  };
  const whoRef = useRef(who);
  whoRef.current = who;
  useEffect(() => {
    if (!show) return;
    // a tick later, so React's dev double effect starts it once
    const t = window.setTimeout(() => playWelcome('metal', { who: whoRef.current, onSeen: () => seen.current(), back }), 0);
    return () => clearTimeout(t);
  }, [show, back]);
  return null;
}

export function OnboardingHome({ noIntro }: { noIntro?: boolean } = {}) {
  const { state } = useStore();
  const art = useArt();
  const { query } = useRoute();
  const b = state.brand;
  // The same Home for every company since 9 Nov: a new one sees what is to come, one past onboarding its reports.
  const filled = !state.onboarding;
  const ui = useUiVariant();
  const tab = (HOME_TABS.find(([k]) => k === query.get('tab'))?.[0] ?? 'overview') as HomeTab;
  // Dr.AI's "See what's new" (#/?see=latest): down to the latest from Spark.
  const see = query.get('see');
  useEffect(() => {
    if (see !== 'latest') return;
    const t = setTimeout(() => document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    return () => clearTimeout(t);
  }, [see]);
  // Home for a company past onboarding, Current UI (12 Nov, review: variant C from #/demo/home-bento): its cards on
  // the overview, no greeting; the report and profile tabs keep the page below, which they link to.
  // 17 Nov: a new company's Home in the same Health look (empty until Spark has looked), onboarding in Dr.AI's corner
  if (tab === 'overview' && ui === 'a')
    return (
      <div className="og-home og-home--bento">
        {!noIntro && <FirstWelcome />}
        <HomeBentoC />
      </div>
    );
  // The underline slides from tab to tab (9 Nov, wave 1 of motion).
  return (
    <div className="og-home">
      {/* The welcome after sign-in (11 Nov): the liquid card that pours into Dr.AI (LiquidWelcome), once. */}
      {!noIntro && <FirstWelcome />}
      {/* the review switch here too (17 Nov), so the client can leave the onboarding for Health */}
      {!filled && <HomeSwitch current="onboarding" />}
      {/* The redesign directions (UI variants b, c): the page's name in mono and the credits as a figure at the top
          right, as in the design file; the company card keeps the rest. */}
      {ui !== 'a' && (
        <div className="og-top">
          <span className="og-top__eyebrow">{b.name} · Home</span>
          <HomeCredits look="top" />
        </div>
      )}
      {/* The company's card back at the top (9 Nov, the client): the mark, the name, what it does and where it sells,
          the team, the credits. No greeting and no setup steps on Home: Dr.AI in the corner walks through them. */}
      {/* Current UI: the company card Home has past onboarding (13 Nov, review), its grounds on the HERO switch */}
      {ui === 'a' ? (
        <HomeCompanyCard />
      ) : (
      <header className="hld-card hld-co og-co">
        <div className="hld-co__row">
          <span className="hld-co__mark">{b.name[0]}</span>
          <span className="hld-co__text">
            <b>{b.name}</b>
            <span>
              {b.positioning}
              <br />
              {b.reach}
            </span>
            <span className="hld-co__team">
              <TeamLine />
            </span>
          </span>
        </div>
      </header>
      )}

      {/* The section's name over its tabs, as Jean asked (#19): "name it Brand Analysis, the tabs underneath". */}
      {/* No Request a report by the name any more (12 Nov, review): it lives in Overview's Reports card */}
      <div className="og-ba-head">
        <h2 className="og-ba-title">Brand Analysis</h2>
      </div>
      <SlideTabs
        label="Brand Analysis"
        value={tab}
        items={HOME_TABS.map(([k, label]) => ({ value: k, label }))}
        onChange={(k) => navigate(k === 'overview' ? '/' : `/?tab=${k}`, { replace: true })}
      />

      {tab === 'profile' && (
        <div className="hld-cols og-profile">
          <ProfileFull />
          <aside className="hld-side">
            <FactsCard />
          </aside>
        </div>
      )}
      {(tab === 'social' || tab === 'website') && (filled ? <ReportTab kind={tab} issue={query.get('issue') ?? undefined} /> : <ReportToCome kind={tab} />)}

      {tab === 'overview' && filled && <FilledOverview />}
      {tab === 'overview' && !filled && (
      <div className="og-later">
        {/* No reports yet (6 Nov): a new company has none until it asks for one. */}
        <section className="og-later__card">
          <span className="og-eyebrow">Reports</span>
          {/* The pictures picked on #/demo/empty-art (10 Nov), back in the cards. */}
          <span className="og-later__art">
            <BrandArt v={art.ba} />
          </span>
          <b>No reports yet</b>
          <span>Ask Spark to look into your website, social media or a competitor.</span>
          {/* the way to a first report, in the card again (12 Nov, review); the header keeps it on the other tabs */}
          <span className="og-later__go">
            <RequestReport />
          </span>
        </section>
        <section className="og-later__card">
          <span className="og-eyebrow">Latest from Spark</span>
          <span className="og-later__art">
            <LatestArtView v={art.latest} />
          </span>
          <b>Nothing yet, and that’s fine</b>
          <span>Files, replies and updates from Spark will land here, and Sparki will mark the new ones.</span>
        </section>
      </div>
      )}
    </div>
  );
}

/** Remembers which steps were done, to say well done once for each newly done one. */
export function useJustDone(done: boolean[]) {
  const key = done.map(Number).join('');
  const prev = useRef(key);
  const [just, setJust] = useState<number | null>(null);
  useEffect(() => {
    const before = prev.current;
    prev.current = key;
    const i = [...key].findIndex((d, k) => d === '1' && before[k] === '0');
    if (i < 0) return;
    setJust(i);
    const t = setTimeout(() => setJust(null), 5600);
    return () => clearTimeout(t);
  }, [key]);
  return just;
}

const REPORT_IDEAS: { label: string; line: string; prefill: RequestPrefill }[] = [
  {
    label: 'Website',
    line: 'Speed, look, what stops people buying.',
    prefill: { type: 'Research', title: 'Website report', description: 'Look into our website: speed, look and feel, and what stops people buying.' },
  },
  {
    label: 'Social media',
    line: 'What works, what people say, where to post.',
    prefill: { type: 'Research', title: 'Social media report', description: 'Look into our social media: what works, what people say about us, and where we should post.' },
  },
  {
    label: 'A competitor',
    line: 'How they win, and where you can.',
    prefill: { type: 'Research', title: 'Competitor report', description: 'Look into a competitor: how they win customers, and where we can do better.' },
  },
];

/** Request a report (6 Nov): a primary button that opens the New request form, set to Research. */
/** The report call to action: an Ink pill, or in the Current UI the Spark metal button (11 Nov). */
function ReportGo({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  const metal = useMetalUi();
  return (
    <button type="button" className={cx('og-step__go og-report__go', metal && metalClass('spark', 'portal'))} onClick={onClick}>
      {metal && <MetalParts tone="spark" profile="portal" />}
      <span className="metal__label">
        {children} <ArrowRight size={14} />
      </span>
    </button>
  );
}

export function RequestReport({ prefill = { type: 'Research', title: '' } }: { prefill?: RequestPrefill }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ReportGo onClick={() => setOpen(true)}>Request a report</ReportGo>
      <CreateRequestDialog open={open} onClose={() => setOpen(false)} prefill={prefill} />
    </>
  );
}

/** Brand Analysis for a new company (6 Nov): no reports until it asks. The same card as on Home (the bars, the title,
 *  a line, Request a report as the primary button), with three common reports to start from. */
export function NoReports() {
  const [ask, setAsk] = useState<RequestPrefill | null>(null);
  const art = useArt();
  return (
    <section className="og-later__card og-noreports">
      {/* No "Reports" label: the tab above says it (6 Nov, review). */}
      <span className="og-later__art">
        <BrandArt v={art.ba} />
      </span>
      <b>No reports yet</b>
      <span>Ask Spark to look into anything: your website, your social media, a competitor, a campaign. The report appears here, with what to fix first.</span>
      <RequestReport />
      <span className="og-eyebrow og-noreports__or">Or start from one of these</span>
      <ul className="og-noreports__ideas">
        {REPORT_IDEAS.map((r) => (
          <li key={r.label}>
            <button type="button" onClick={() => setAsk(r.prefill)}>
              <b>{r.label}</b>
              <span>{r.line}</span>
              <ArrowRight size={14} />
            </button>
          </li>
        ))}
      </ul>
      <CreateRequestDialog open={!!ask} onClose={() => setAsk(null)} prefill={ask ?? undefined} />
    </section>
  );
}



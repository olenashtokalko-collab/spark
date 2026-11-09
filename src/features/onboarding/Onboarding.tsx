// Onboarding with Dr.AI and Sparki (prototype, 6 Nov; client: "let Dr.AI and Sparki be an assistant users interact
// with"). A new company finds the portal empty; four first steps, each done when the client really does it (the
// store says so, nothing is ticked by hand). Dr.AI says the step from his corner, with a small stepper; Sparki leaves
// him and flies to where the step starts (a link in the sidebar, then the button on the page), lighting it up.
// Started and stopped on #/demo/dock.
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight } from 'lucide-react';
import { useRoute } from '../../lib/router';
import { useStore, type State } from '../../state/store';
import { cx } from '../../components/ui/primitives';
import { SparkiStill } from '../../components/ui/DrAi';
import { FactsCard, HomeCredits, ProfileFull } from '../demo/HomeRethinkDemo';
import { navigate } from '../../lib/router';
import { TeamLine } from '../home/HomeLayouts';
import { MascotClip } from '../demo/MascotDemo';
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
    let last = '';
    const tick = () => {
      // A dialog over the page (the New request form): Sparki waits by Dr.AI until it closes, unless what he
      // points at is in the dialog itself (Go to requests, once the request is sent).
      const dialog = document.querySelector('[role="dialog"]');
      let p: Point | null = point(path);
      if (dialog && p?.el && !dialog.contains(p.el)) p = null;
      const r = p?.el?.getBoundingClientRect();
      const key = r && r.width && p ? `${r.x | 0},${r.y | 0},${r.width | 0},${r.height | 0},${p.say}` : '';
      if (key !== last) {
        last = key;
        // The rim follows the target's own corners (a pill stays a pill), 7 px out.
        const radius = p?.el ? Math.min(parseFloat(getComputedStyle(p.el).borderTopLeftRadius) || 10, (r?.height ?? 0) / 2) : 10;
        setAt(r && r.width && p ? { box: r, say: p.say, radius } : null);
      }
      raf.current = requestAnimationFrame(tick);
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
  const box = at?.box;
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
        // The glass rim round what to press, and the spectrum's light under it (9 Nov, #/demo/highlight-looks, C).
        <>
          {/* The light all round the rim (9 Nov, review): Cobalt on the left, violet and magenta below, Ember on the
              right; little at the corner where Sparki sits. */}
          <span
            className={cx('og-ring-glow', !right && 'is-left')}
            style={{ left: box.left - 5, top: box.top - 5, width: box.width + 10, height: box.height + 10, borderRadius: (at?.radius ?? 10) + 5, ['--og-r' as string]: `${(at?.radius ?? 10) + 5}px` }}
            aria-hidden
          />
          <span
            // A new key per target: the light runs round the rim once each time it lights something up.
            key={`${id}${path}`}
            className="og-ring"
            style={{ left: box.left - 6, top: box.top - 6, width: box.width + 12, height: box.height + 12, borderRadius: (at?.radius ?? 10) + 6, ['--og-r' as string]: `${(at?.radius ?? 10) + 6}px` }}
            aria-hidden
          />
        </>
      )}
      <span
        className={cx('og-sparki', box && 'is-on', !right && 'is-left', dragging && 'is-dragging', flying && 'is-flying')}
        style={{ transform: `translate(${x + off.dx}px, ${y + off.dy}px)${shift}` }}
        aria-hidden
      >
        <span className="og-sparki__bob" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onDragStart={(e) => e.preventDefault()} title="Drag me aside">
          <SparkiStill size={44} />
        </span>
        {/* Sparki says it (6 Nov): mono capitals typed out in the same glass as Dr.AI's card, Ember's dot breathing. */}
        {at && (
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
function ReportToCome({ kind }: { kind: 'social' | 'website' }) {
  const [open, setOpen] = useState(false);
  const what =
    kind === 'social'
      ? { title: 'No social media report yet', body: 'Spark looks at your Instagram, TikTok and LinkedIn: what people engage with, what falls flat, and what to fix first.', ask: 'Social media report' }
      : { title: 'No website report yet', body: 'Spark checks your site on mobile and desktop: speed, how easy it is to find and buy, and whether it looks like your brand.', ask: 'Website report' };
  return (
    <section className="og-later__card og-tocome">
      <b>{what.title}</b>
      <span>{what.body}</span>
      <button type="button" className="og-step__go og-report__go" onClick={() => setOpen(true)}>
        Request this report <ArrowRight size={14} />
      </button>
      <CreateRequestDialog open={open} onClose={() => setOpen(false)} prefill={{ type: 'Research', title: what.ask }} />
    </section>
  );
}

/** The welcome (9 Nov, wave 1 of motion): before the first step, Dr.AI on a clear ground, the spectrum's light
 *  behind him, a few words; then he heads for his corner and the page comes up behind. Once per new company. A
 *  click, or Let's go, skips it. */
function WelcomeIntro() {
  const { state, me, actions } = useStore();
  const ob = useOnboarding();
  // The first visit, and every return after logging out (9 Nov, review): a returning visitor is welcomed back.
  const show = ob.on && !state.onboardingIntro;
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
    setOut({ '--ix': `${tx}px`, '--iy': `${ty}px`, '--dx': `${tx - fx}px`, '--dy': `${ty - fy}px`, '--sc': `${sc}` });
  };
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(leave, 4200);
    return () => clearTimeout(t);
  });
  // He lands at 1.15 s; then the flying figure and the corner one cross-fade in place (9 Nov, review: a blink when
  // one clip simply replaced the other), and the welcome goes once the corner figure is fully in.
  const [landed, setLanded] = useState(false);
  useEffect(() => {
    if (!out) return;
    const t1 = setTimeout(() => setLanded(true), 1150);
    const t2 = setTimeout(() => actions.seeIntro(), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [out, actions]);
  if (!show) return null;
  return createPortal(
    <div className={cx('og-intro', out && 'is-out', landed && 'is-landed')} style={out ?? undefined} onClick={leave} role="dialog" aria-label="Welcome">
      <span className="og-intro__ground" aria-hidden>
        <span className="og-intro__light" />
      </span>
      <div ref={fig} className="og-intro__fig">
        <span className="og-intro__hop">
          <MascotClip state="speaking" width={230} intro />
        </span>
      </div>
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
        <button type="button" className="dk-btn dk-btn--primary og-intro__go" onClick={leave}>
          {back ? 'Carry on' : 'Let’s go'}
        </button>
      </div>
    </div>,
    document.body,
  );
}

export function OnboardingHome() {
  const { state } = useStore();
  const { query } = useRoute();
  const b = state.brand;
  const tab = (HOME_TABS.find(([k]) => k === query.get('tab'))?.[0] ?? 'overview') as HomeTab;
  // The underline slides from tab to tab (9 Nov, wave 1 of motion).
  const nav = useRef<HTMLElement>(null);
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    const place = () => {
      const on = nav.current?.querySelector<HTMLElement>('button.is-on');
      if (on) setBar({ left: on.offsetLeft, width: on.offsetWidth });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [tab]);
  return (
    <div className="og-home">
      <WelcomeIntro />
      {/* The company's card back at the top (9 Nov, the client): the mark, the name, what it does and where it sells,
          the team, the credits. No greeting and no setup steps on Home: Dr.AI in the corner walks through them. */}
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
          <span className="hld-co__acts">
            <HomeCredits />
          </span>
        </div>
      </header>

      {/* The section's name over its tabs, as Jean asked (#19): "name it Brand Analysis, the tabs underneath". */}
      <h2 className="og-ba-title">Brand Analysis</h2>
      <nav ref={nav} className="hl-tabs og-tabs" aria-label="Brand Analysis">
        {bar && <span className="og-tabs__bar" style={{ transform: `translateX(${bar.left}px)`, width: bar.width }} aria-hidden />}
        {HOME_TABS.map(([k, label]) => (
          <button
            key={k}
            type="button"
            className={cx(tab === k && 'is-on')}
            aria-current={tab === k ? 'page' : undefined}
            onClick={() => navigate(k === 'overview' ? '/' : `/?tab=${k}`, { replace: true })}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'profile' && (
        <div className="hld-cols og-profile">
          <ProfileFull />
          <aside className="hld-side">
            <FactsCard />
          </aside>
        </div>
      )}
      {(tab === 'social' || tab === 'website') && <ReportToCome kind={tab} />}

      {tab === 'overview' && (
      <div className="og-later">
        {/* No reports yet (6 Nov): a new company has none until it asks for one. */}
        <section className="og-later__card">
          <span className="og-eyebrow">Reports</span>
          <b>No reports yet</b>
          <span>Ask Spark to look into your website, social media or a competitor.</span>
          <RequestReport />
        </section>
        <section className="og-later__card">
          <span className="og-eyebrow">Latest from Spark</span>
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
function RequestReport({ prefill = { type: 'Research', title: '' } }: { prefill?: RequestPrefill }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="og-step__go og-report__go" onClick={() => setOpen(true)}>
        Request a report <ArrowRight size={14} />
      </button>
      <CreateRequestDialog open={open} onClose={() => setOpen(false)} prefill={prefill} />
    </>
  );
}

/** Brand Analysis for a new company (6 Nov): no reports until it asks. The same card as on Home (the bars, the title,
 *  a line, Request a report as the primary button), with three common reports to start from. */
export function NoReports() {
  const [ask, setAsk] = useState<RequestPrefill | null>(null);
  return (
    <section className="og-later__card og-noreports">
      {/* No "Reports" label: the tab above says it (6 Nov, review). */}
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



// Onboarding with Dr.AI and Sparki (prototype, 6 Nov; client: "let Dr.AI and Sparki be an assistant users interact
// with"). A new company finds the portal empty; four first steps, each done when the client really does it (the
// store says so, nothing is ticked by hand). Dr.AI says the step from his corner, with a small stepper; Sparki leaves
// him and flies to where the step starts (a link in the sidebar, then the button on the page), lighting it up.
// Started and stopped on #/demo/dock.
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useRoute } from '../../lib/router';
import { useStore, type State } from '../../state/store';
import { cx } from '../../components/ui/primitives';
import { SparkiStill } from '../../components/ui/DrAi';
import { HomeCredits } from '../demo/HomeRethinkDemo';
import { CreateRequestDialog, type RequestPrefill } from '../requests/CreateRequestDialog';
import { BrandArt, LatestArtView, useArt } from './EmptyArt';

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
    go: () => '/documents/f-uploads',
    // Optional too (6 Nov): the request is what Spark needs to start; files can follow, and Dr.AI reminds you.
    optional: true,
    done: (s) => s.docs.some((d) => d.uploadedBy === 'u-layla'),
    point: (p) =>
      p.startsWith('/documents/f-uploads') ? { el: byText('main button', 'Upload'), say: 'Click Upload' } : { el: rail('/documents'), say: 'Go to Documents' },
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
export function Stepper({ done, current, skipped = [] }: { done: boolean[]; current: number; skipped?: boolean[] }) {
  return (
    <span className="og-stepper" aria-label={`${done.filter(Boolean).length} of ${done.length} steps done`}>
      {done.map((d, i) => (
        <i
          key={i}
          className={cx(d && !skipped[i] && 'is-done', skipped[i] && 'is-skipped', i === current && 'is-now', STEPS[i]?.optional && 'is-optional')}
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
  const [at, setAt] = useState<{ box: DOMRect; say: string } | null>(null);
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
        setAt(r && r.width && p ? { box: r, say: p.say } : null);
      }
      raf.current = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf.current);
  }, [active, point, path]);

  if (!active || !point) return null;
  const box = at?.box;
  // Sparki sits to the right of the target, or to its left near the page's right edge; at rest by Dr.AI's card.
  const right = box ? box.right + 60 < window.innerWidth : true;
  const x = box ? (right ? box.right + 10 : box.left - 10) : window.innerWidth - 300;
  const y = box ? box.top + box.height / 2 - 22 : window.innerHeight - 260;
  // On the left, Sparki and his word end where the target begins.
  const shift = box && !right ? ' translateX(-100%)' : '';
  return createPortal(
    <>
      {box && (
        <span
          className="og-ring"
          style={{ left: box.left - 5, top: box.top - 5, width: box.width + 10, height: box.height + 10 }}
          aria-hidden
        />
      )}
      <span
        className={cx('og-sparki', box && 'is-on', !right && 'is-left', dragging && 'is-dragging')}
        style={{ transform: `translate(${x + off.dx}px, ${y + off.dy}px)${shift}` }}
        aria-hidden
      >
        <span className="og-sparki__bob" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} title="Drag me aside">
          <SparkiStill size={44} />
        </span>
        {/* Sparki says it (6 Nov): mono capitals typed out in the same glass as Dr.AI's card, Ember's dot breathing. */}
        {at && (
          <span key={`${id}${path}${at.say}`} className="og-say" style={{ ['--n' as string]: at.say.length }}>
            <i className="og-say__dot" />
            <span className="og-say__text">{at.say}</span>
          </span>
        )}
      </span>
    </>,
    document.body,
  );
}

/** Home while onboarding: a welcome, the four steps as cards with a coloured progress, and what will appear. */
export function OnboardingHome() {
  const { me } = useStore();
  const ob = useOnboarding();
  const art = useArt();
  return (
    <div className="og-home">
      <header className="og-home__head">
        <span>
          <span className="og-eyebrow">{ob.on ? 'Welcome to Spark' : 'Home'}</span>
          <h1>{ob.on ? `Hi ${me.name.split(' ')[0]}, let’s get you started.` : `Welcome back, ${me.name.split(' ')[0]}.`}</h1>
          <p>{ob.on ? 'Four steps, about ten minutes. Dr.AI and Sparki will show you the way.' : 'Spark is on your first request. Here’s what’s coming.'}</p>
        </span>
        <HomeCredits />
      </header>

      {/* After Finish (6 Nov) the steps go; Dr.AI reminds of anything put off. */}
      {ob.on && <SetupSection />}

      <div className="og-later">
        {/* No reports yet (6 Nov): a new company has none until it asks for one. */}
        <section className="og-later__card">
          <span className="og-eyebrow">Brand Analysis</span>
          <span className="og-later__art">
            <BrandArt v={art.ba} />
          </span>
          <b>No reports yet</b>
          <span>Ask Spark to look into your website, social media or a competitor.</span>
          <RequestReport />
        </section>
        <section className="og-later__card">
          <span className="og-eyebrow">Latest from Spark</span>
          <span className="og-later__art">
            <LatestArtView v={art.latest} sparki={<SparkiStill size={56} />} />
          </span>
          <b>Nothing yet, and that’s fine</b>
          <span>Files, replies and updates from Spark will land here, and Sparki will mark the new ones.</span>
        </section>
      </div>
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

// ---- The setup on Home (6 Nov, review) ----------------------------------------------------------------------------
// A summary, not a second guide: Dr.AI's card in the corner leads, and goes with you from page to page. Here, in
// the way of a dashboard, what's done and what's left, for someone who stopped half way: the count, each step with
// its state, no stepper (the card has it), no actions, nothing that looks pressable.

/** The mark: the number, Ink's check once done (solid, the system's colour), a dash when put off. */
function Mark({ i, done, skipped }: { i: number; done: boolean; skipped: boolean }) {
  return <span className={cx('og-mark', done && 'is-done', skipped && 'is-skipped')}>{done ? <Check size={13} strokeWidth={2.6} /> : skipped ? '–' : i + 1}</span>;
}

function SetupSection() {
  const ob = useOnboarding();
  return (
    // The same card as Brand Analysis and Latest from Spark below it (6 Nov, review): a mono label, a bold line, a
    // grey line, then the four steps.
    <section className="og-later__card og-setup og-setup--dash" aria-label="Workspace setup">
      {/* The label with the count as in Dr.AI's card (6 Nov, review); no title, no line, no states. */}
      <span className="og-setup__label">
        <span className="og-eyebrow">Workspace setup</span>
        <span className="dk-card__n">
          {ob.count}/{STEPS.length}
        </span>
      </span>
      <ol className="og-setup__list">
        {STEPS.map((s, i) => {
          const skipped = ob.skipped[i];
          const done = ob.done[i] && !skipped;
          const now = i === ob.current;
          return (
            <li key={s.key} className={cx('og-s', done && 'is-done', skipped && 'is-skipped', now && 'is-now')}>
              <span className="og-s__top">
                <Mark i={i} done={done} skipped={skipped} />
                {s.optional && <span className="og-step__opt">Optional</span>}
              </span>
              <b className="og-s__title">{s.title}</b>
              <span className="og-s__line">{s.line}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

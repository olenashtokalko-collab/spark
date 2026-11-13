// Layout 9 · Health (13 Nov, review, after me.thebluejackgroup.com's Summary and Email Health: "a Brand health figure,
// one number for how healthy the company is; the percent in colour; arrows up and down; the credits as a name with a
// caret, no avatar; the Summary, a short paragraph of what was found with figures picked out; the ring whose lines
// fill clockwise from grey as you arrive"). On Spark's sand, with the client's clear glass cards and Spark's colours:
//   · the head: Brand Co., a line under it, the credits at the right
//   · Brand health: the ring (its ticks fill Cobalt into violet on arrival), what Spark found as its reading (once a
//     Summary of its own above it, merged in: they told the same story), what it's measured against
//   · four figures from the reports the report cards don't show, each against its aim, the arrow saying which way
//   · the reports and the company profile (Layout 5's tabs), Book consultation floating
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, Video } from 'lucide-react';
import { useStore } from '../../state/store';
import { Avatar, cx } from '../../components/ui/primitives';
import { dotted } from './dotted';
import { analyses } from '../../data/mock';
import '../../styles/health.css';

// Prototype: one figure for the brand's health, made from the three reports (the site, social media, how people see
// the brand). Not in the data yet; Spark would set how it's counted.
// 72 (13 Nov, review: "a better figure"); what a score means, said in words, so no bare "healthy brand: 70"
const HEALTH = 72;
const HEALTH_AIM = 70;
// when it was measured: the first and the last of the reports it's made from (13 Nov, review: the card's top right
// corner, after the reference's "Last 30 days"; dates, not a switch, since there's nothing to switch between)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDay = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`; // "Sep", not en-GB's "Sept"
};
const MEASURED = (() => {
  const days = analyses.map((a) => a.updatedAt).sort();
  return `${fmtDay(days[0])} – ${fmtDay(days[days.length - 1])}`;
})();
const verdict = (n: number) =>
  n >= 85 ? { word: 'Strong', good: true } : n >= 70 ? { word: 'Good', good: true } : n >= 50 ? { word: 'Fair', good: false } : { word: 'Weak', good: false };
const TICKS = 64;

// Cobalt into violet along the ring
const mix = (t: number) => {
  // one gradient for every chart on the page (13 Nov, review): Cobalt into violet, as the bars and the gauges
  const a = [30, 59, 214], b = [122, 92, 255];
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
};

/** The ring: TICKS short lines round a circle, the score's share in Spark's colours, the rest grey. On arrival they
 *  fill one by one, clockwise from the top. */
function HealthRing({ score, aim }: { score: number; aim: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setOn(true), 120);
    return () => window.clearTimeout(t);
  }, []);
  const lit = Math.round((score / 100) * TICKS);
  const C = 110, R1 = 84, R2 = 104;
  return (
    <span className={cx('hh-ring', on && 'is-on')}>
      <svg viewBox="0 0 220 220" aria-hidden>
        {Array.from({ length: TICKS }, (_, i) => {
          const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
          const c = Math.cos(a), s = Math.sin(a);
          const isLit = i < lit;
          return (
            <line
              key={i}
              x1={C + R1 * c}
              y1={C + R1 * s}
              x2={C + R2 * c}
              y2={C + R2 * s}
              className={cx('hh-ring__tick', isLit && 'is-lit')}
              style={isLit ? { ['--c' as string]: mix(i / Math.max(1, lit - 1)), transitionDelay: `${i * 22}ms` } : undefined}
            />
          );
        })}
        {/* the aim, a short Ink tick across the ring where a healthy brand starts (13 Nov, review) */}
        {(() => {
          const a = (aim / 100) * Math.PI * 2 - Math.PI / 2;
          const c = Math.cos(a), s = Math.sin(a);
          return <line x1={C + (R1 - 8) * c} y1={C + (R1 - 8) * s} x2={C + (R2 + 8) * c} y2={C + (R2 + 8) * s} className="hh-ring__aim" />;
        })()}
      </svg>
      <span className="hh-ring__in">
        <b className="hh-ring__fig" role="img" aria-label={`Brand health ${score} of 100`}>
          {score}
        </b>
        {/* the figure alone in its circle (13 Nov, review): "Good health" is said beside it */}
      </span>
    </span>
  );
}

// 13 Nov, review: Layout 6's figure cards (a bar, a tick where the aim is, how far it got) with these cards' arrows,
// and a word that says whether it's good, since the colour alone didn't. The bar in Cobalt, not Ember.
type Status = 'good' | 'watch' | 'work';
// said as the work ahead, not as a mark (13 Nov, review): Fix first · Watch · On track
const STATUS: Record<Status, string> = { good: 'On track', watch: 'Watch', work: 'Fix first' };
type Fig = {
  from: string;
  title: string;
  fig: string;
  unit?: string;
  mine: number;
  aim?: number;
  scale: number;
  dir?: 'up' | 'down';
  vs: ReactNode;
  status: Status;
  href: string;
};
// figures the report cards below don't show (13 Nov, review: nothing twice), each against its aim; every line short
// enough to stay on one line (13 Nov, review: no wrapping); whole figures (6.8 s shown as 7: the point read as a stray dot)
const FIGS: Fig[] = [
  { from: 'Website', title: 'Page load on 4G', fig: '7', unit: 's', mine: 6.8, aim: 3, scale: 8, dir: 'up', vs: <>Over the <b>3 s</b> aim</>, status: 'work', href: '#/?tab=website' },
  { from: 'Social', title: 'Views of a TikTok video', fig: '2', unit: 'K', mine: 2, aim: 20, scale: 60, dir: 'down', vs: <>Rivals reach <b>20–60K</b></>, status: 'work', href: '#/?tab=social' },
  { from: 'Brand', title: 'Recall in KSA', fig: '4', unit: '%', mine: 4, scale: 100, vs: <>Flagship opens <b>15 Jan</b></>, status: 'watch', href: '#/brand-analysis' },
  { from: 'Social', title: 'Reply to a comment', fig: '26', unit: 'h', mine: 26, aim: 2, scale: 30, dir: 'up', vs: <>Over the <b>2 h</b> aim</>, status: 'work', href: '#/?tab=social' },
];

/** A report Spark can make next, as a card of the reports' own (13 Nov, review: "one locked report, in the style of
 *  the report cards, with Unlock"): its name, its headline, the gauge's place held by a pane of clear glass with the
 *  lock on it, what it would tell, and Unlock; Unlock asks once, with the price, then it's ordered. */
export function LockedReportCard({ r, credits, onBuy }: { r: { eyebrow: string; title: string; body: string; price: number }; credits: number; onBuy: () => void }) {
  const [step, setStep] = useState<'locked' | 'confirm' | 'ordered'>('locked');
  const short = credits < r.price;
  return (
    <article className={cx('db-card hh-card hh-lock', `is-${step}`)}>
      <span className="db-label">{r.eyebrow} report</span>
      <h2 className="db-rep__title">{r.title.replace(/\.$/, '')}</h2>
      <div className="hh-lock__body">
        <span className="hh-lock__vis" aria-hidden>
          <span className="hh-lock__arc" />
          <img src="brand/glass/lock.webp?v=5" alt="" width={56} height={60} />
        </span>
        <div className="hh-lock__side">
          <p className="hh-health__text">{step === 'ordered' ? 'Ordered. Spark starts on it today; it’s ready in about 3 days.' : r.body}</p>
          {step === 'locked' && (
            <button type="button" className="db-book" onClick={() => setStep('confirm')} disabled={short}>
              Unlock
            </button>
          )}
          {step === 'confirm' && (
            <span className="hh-lock__confirm">
              <span>
                {r.price} of your {Math.floor(credits)} credits
              </span>
              <button
                type="button"
                className="db-book"
                onClick={() => {
                  onBuy();
                  setStep('ordered');
                }}
              >
                Unlock for {r.price}
              </button>
              <button type="button" className="hh-lock__cancel" onClick={() => setStep('locked')}>
                Not now
              </button>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/** Home as the brand's health. `balance` is the credits with their caret; `reports` the tabs. */
export function HomeHealth({ balance, reports, onBook }: { balance: ReactNode; reports: ReactNode; onBook: () => void }) {
  const { state, me } = useStore();
  const b = state.brand;
  const colleagues = state.people.filter((p) => p.org === 'client' && p.id !== me.id);
  // the cards' charts play as each card comes into view, not all at once on arrival (13 Nov, review: the report cards'
  // gauges drew below the fold, unseen). The page scrolls inside the shell, so any scroll is caught in the capture
  // phase; a card switched in by the tabs is caught as it's added
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const check = () =>
      el.querySelectorAll('.hh-fig:not(.is-in), .hh-rep:not(.is-in)').forEach((c) => {
        const r = c.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92 && r.bottom > 0) c.classList.add('is-in');
      });
    check();
    window.addEventListener('scroll', check, { capture: true, passive: true });
    window.addEventListener('resize', check);
    const mo = new MutationObserver(check);
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      window.removeEventListener('scroll', check, { capture: true });
      window.removeEventListener('resize', check);
      mo.disconnect();
    };
  }, []);
  // Book consultation clear of Dr.AI's tip (13 Nov, review: "when the mascot's tip shows, the button can't be seen"):
  // while a tip is open, the button rises to sit 12 px above it; when the tip folds or closes, it settles back beside him.
  // One smooth move (13 Nov, review: "smoother"): the target is read from the tip's resting place (its layout box,
  // which its entrance transform doesn't move), so the button glides once, alongside the tip, instead of stepping
  // after it; a later check only moves it if the tip's size has really changed.
  const book = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let raf = 0;
    let later = 0;
    let current = '';
    const place = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const btn = book.current;
        if (!btn) return;
        const say = document.querySelector<HTMLElement>('.dt-say.is-on');
        let next = '';
        if (say && say.offsetHeight > 0) {
          const fixed = getComputedStyle(say).position === 'fixed';
          const top = fixed ? say.offsetTop : say.getBoundingClientRect().top;
          next = `${Math.round(window.innerHeight - top + 12)}px`;
        }
        // ignore a pixel or two of drift, so it never twitches
        if (next !== current && (!next || !current || Math.abs(parseFloat(next) - parseFloat(current)) > 2)) {
          current = next;
          btn.style.bottom = next;
        }
      });
    };
    const settle = () => {
      place();
      window.clearTimeout(later);
      later = window.setTimeout(place, 600);
    };
    settle();
    const mo = new MutationObserver(settle);
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', settle);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(later);
      mo.disconnect();
      window.removeEventListener('resize', settle);
    };
  }, []);
  return (
    <div className="br hh" ref={root}>
      <header className="hh-head">
        {/* the name and what the company is, from its profile; no logo; the team under the description, the way to it
            (13 Nov, review) */}
        <span className="db-head__who">
          <span>
            <span className="hh-head__row">
              <h1 className="hh-head__title">{b.name}</h1>
            </span>
            <p className="hh-head__sub">
              {b.positioning} {b.reach}
            </p>
            {/* the team under the description (13 Nov, review) */}
            <a className="hh-team" href="#/team?from=home">
              <span className="bx-co__faces" aria-hidden>
                {(colleagues.length ? colleagues : [me]).slice(0, 3).map((p) => (
                  <Avatar key={p.id} person={p} size={30} ring />
                ))}
                <span className="bx-co__invite">+</span>
              </span>
              <span>{colleagues.length ? `You and ${colleagues.length} colleague${colleagues.length === 1 ? '' : 's'}` : 'Just you so far'}</span>
              {/* a small Ink arrow, so the team reads as a way in (13 Nov, review) */}
              <ArrowRight className="hh-team__go" size={15} aria-hidden />
            </a>
          </span>
        </span>
        {balance}
      </header>

      {/* Brand health, and what Spark found as its reading (13 Nov, review: "What we found and Health say the same
          thing: make what we found the description"). Built as the report cards below (13 Nov, review: "the top cards
          in the style of the reports' cards"): the label, the headline, the ring where their gauge stands, then what
          it is, the healthy mark as their typical, the reading, what it's based on */}
      <section className="db-card hh-card hh-health">
        <span className="hh-health__head">
          <span className="db-label">Brand health · what we found</span>
          <span className="hh-measured">From your three reports · {MEASURED}</span>
        </span>
        <h2 className="db-rep__title">Strong in your stores, held back online.</h2>
        <div className="hh-health__body">
          <HealthRing score={HEALTH} aim={HEALTH_AIM} />
          {/* 13 Nov, review: no "Brand health, out of 100" (the label says it) nor "a healthy brand: 70" (unclear);
              the reading, then under a divider how good the score is, in words and in colour, and what it's based on */}
          <div className="hh-health__side">
            {/* how good the score is, first, in words and in colour (13 Nov, review: no "Out of 100"; the verdict before
                the reading) */}
            <span className={cx('hh-verdict', verdict(HEALTH).good ? 'is-good' : 'is-weak')}>
              {verdict(HEALTH).word} health <span>· {HEALTH_AIM} and over is a healthy brand</span>
            </span>
            <p className="hh-health__text">
              People’s love for {b.name} in its stores lifts the score. A slow site that looks like any global chain, and a name few know in Riyadh,
              keep it from the top.
            </p>
            {/* what it's based on, close together, in the verdict's grey words (13 Nov, review) */}
            <p className="hh-based">We read 1,200 reviews and posts, 23 pages of your site and 412 social posts, and asked 300 shoppers.</p>
          </div>
        </div>
      </section>

      {/* four figures, each against its aim, each a card as the reports' */}
      <section className="hh-figs" aria-label="By the numbers">
        {FIGS.map((f) => (
          <a key={f.title} className="db-card hh-card hh-fig" href={f.href}>
            {/* the label as every card has (13 Nov, review): the report it's from, the status across from it */}
            <span className="hh-fig__top">
              <span className="db-label">{f.from}</span>
              <span className={cx('hh-status', `is-${f.status}`)}>{STATUS[f.status]}</span>
            </span>
            <span className="hh-fig__n" role="img" aria-label={`${f.fig}${f.unit ?? ''} ${f.title}`}>
              {dotted(f.fig)}
              {f.unit && <i>{f.unit}</i>}
            </span>
            <span className="hh-fig__title">{f.title}</span>
            {/* how far it got on its scale, a tick where the aim is */}
            <span className="hh-bar" aria-hidden>
              <span style={{ width: `${Math.min(100, (f.mine / f.scale) * 100)}%` }} />
              {f.aim !== undefined && <i style={{ left: `${(f.aim / f.scale) * 100}%` }} />}
            </span>
            <span className={cx('hh-vs', `is-${f.status}`)}>
              {f.dir && (
                <span className="hh-vs__arrow" aria-hidden>
                  {f.dir === 'up' ? '▲' : '▼'}
                </span>
              )}
              <span>{f.vs}</span>
            </span>
          </a>
        ))}
      </section>

      {/* no "Your reports" over the tabs (13 Nov, review): the tab says it */}
      {reports}

      {/* a video call's camera in a Cobalt circle before the words (13 Nov, review): a soft ring goes out from it now
          and then, "on the line"; on hover the camera gives a small ring-ring */}
      <button type="button" className="br-float is-shown hh-book" onClick={onBook} ref={book}>
        <span className="hh-book__icon" aria-hidden>
          <Video size={16} strokeWidth={2.2} />
        </span>
        Book consultation
      </button>
    </div>
  );
}

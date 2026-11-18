// Home as a bento of cards (12 Nov, review, after clicker-sigma-six.vercel.app): soft cards with a thin stroke, a
// light top edge and a long low shadow, a wash of colour from the top, the figures in big extended type filled with
// the Noor spectrum (Cobalt → Violet → Magenta → Ember). The hero card carries a spectrum blob, the way the
// reference's trackpad card does. Reports Spark hasn't made yet sit locked, to unlock with credits; the consultation
// is booked from a card of time chips. Ink (as the reference) or Sand, switched at the top. #/demo/home-bento
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import '../../styles/bento.css';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Send, Building2, CalendarClock, Check, ChevronDown, Globe, Heart, Lock, MessagesSquare, Plus, Sparkles, Video, Wallet, type LucideIcon } from 'lucide-react';
import { useUI } from '../../state/ui';
import { navigate } from '../../lib/router';
import { dotted } from './dotted';
import { BriefHome } from './HomeBrief';
import { HomeDashboard } from './HomeDashboard';
import { HealthTopUp } from './HealthTopUp';
import { useRoleHere } from './HealthHead';
import { HomeHealth } from './HomeHealth';
import { MetalSurface, NoorField } from '../onboarding/LiquidWelcome';

const noop = () => undefined;
import { useStore } from '../../state/store';
import { CreditRing } from '../../components/layout/Credits';
import { analyses } from '../../data/mock';
import { Avatar, cx } from '../../components/ui/primitives';
import { GlassTabs } from '../../components/ui/GlassTabs';
import { CardRail } from '../../components/ui/CardRail';
import { SparkiStill } from '../../components/ui/DrAi';
import { SpeedLines } from '../../components/ui/ChromeRings';
import { ShapeMorph } from '../../components/ui/ShapeMorph';
import { MorphVideo } from '../../components/ui/MorphVideo';
import { OpenHead, Tile, VariantCards, type CardVariant } from './HomeCardVariants';

type Look = 'ink' | 'sand';
type Layout = 'a' | 'b' | 'c';
// the Dr.AI card's looks in C (12 Nov, review: "something other than the reports' band; maybe our Ink")
type AskLook = 'ink' | 'noor' | 'cobalt';

// The company card's colour in C, to compare (12 Nov, review: "a few grounds, the animation's speed, how the colours
// come in"). Ground: the welcome's liquid metal, or its Noor light (p.42) on Ink or on Sand. Speed: how fast it moves.
// Appear: how the colour arrives when Home opens: fading in, swept in from the left like light through a prism, or
// blooming out of the credits.
type Ground = 'metal' | 'noor-ink' | 'noor-sand';
type Pace = 'slow' | 'calm' | 'lively';
type Appear = 'none' | 'fade' | 'sweep' | 'bloom';
type Hero = { ground: Ground; pace: Pace; appear: Appear };
const HERO_DEFAULT: Hero = { ground: 'metal', pace: 'calm', appear: 'fade' };
// picked 12 Nov: the liquid metal, slow, moving from the first frame (no appear effect)
const HERO_PICKED: Hero = { ground: 'metal', pace: 'slow', appear: 'none' };
const PACE: Record<Pace, { metal: number; noor: number }> = {
  slow: { metal: 0.35, noor: 0.25 },
  calm: { metal: 1, noor: 0.6 },
  lively: { metal: 1.8, noor: 1.2 },
};
const usd = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The spectrum as a stroke for icons: one hidden gradient the page's icons point at. */
function SpectrumDefs() {
  return (
    <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id="bx-spectrum" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#1E3BD6" />
          <stop offset="0.4" stopColor="#5A36D4" />
          <stop offset="0.65" stopColor="#A33ABF" />
          <stop offset="1" stopColor="#E8501F" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** A figure in the spectrum with its own light: a blurred copy of the same letters behind it, so each part glows in
 *  its own colour (blue under the blue, orange under the orange) rather than casting one grey-violet shadow
 *  (12 Nov, review, after the reference's glowing "4"). */
function Fig({ fig, unit, className, hidden }: { fig: string; unit?: string; className?: string; hidden?: boolean }) {
  const inner = (
    <>
      {dotted(fig)}
      {unit && <i>{dotted(unit)}</i>}
    </>
  );
  return (
    <span className={cx('fx-fig', className)} aria-hidden={hidden}>
      <b className="bx-fig fx-fig__glow" aria-hidden>
        {inner}
      </b>
      <b className="bx-fig fx-fig__main" role="img" aria-label={`${fig}${unit ?? ''}`}>
        {inner}
      </b>
    </span>
  );
}

function Card({ className, tint = 'ember', children, style }: { className?: string; tint?: 'ember' | 'cobalt' | 'violet'; children: ReactNode; style?: CSSProperties }) {
  return (
    <section className={cx('bx-card', `bx-card--${tint}`, className)} style={style}>
      {children}
    </section>
  );
}

/** The spectrum blob leans toward the pointer over its card (--bx, --by on the card). */
function useBlobFollow<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.62) * 60;
      ty = ((e.clientY - r.top) / r.height - 0.4) * 50;
    };
    const leave = () => ((tx = 0), (ty = 0));
    const tick = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      el.style.setProperty('--bx', `${x.toFixed(1)}px`);
      el.style.setProperty('--by', `${y.toFixed(1)}px`);
      raf = requestAnimationFrame(tick);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, []);
  return ref;
}

/** The hero: what Spark found, by a spectrum blob that leans toward the pointer. */
function Hero() {
  const ref = useBlobFollow<HTMLElement>();
  const web = analyses.find((a) => a.kind === 'website');
  const social = analyses.find((a) => a.kind === 'social');
  return (
    <section ref={ref} className="bx-card bx-card--ember bx-hero">
      <span className="bx-blob" aria-hidden />
      <span className="bx-hero__text">
        <span className="bx-eyebrow">Brand analysis · October</span>
        <h2 className="bx-title bx-title--xl">Your brand, at a glance</h2>
        <p className="bx-body">
          Spark read {web?.signals?.[0]?.value ?? '23 pages'} and {social?.signals?.[0]?.value.split(' ')[0] ?? '412'} posts. Instagram works; the website
          loses buyers on mobile.
        </p>
        <a className="bx-link" href="#/?tab=website">
          Open the reports <ArrowRight size={15} />
        </a>
      </span>
    </section>
  );
}

function Stat({ fig, unit, title, line, delta, tint, href, cta, badge }: { fig: string; unit?: string; title: string; line: string; delta?: { up: boolean; text: string }; tint?: 'ember' | 'cobalt' | 'violet'; href?: string; cta?: string; badge?: string }) {
  const body = (
    <>
      {/* the figure at the top of the band, the badge in its bottom-right corner (12 Nov, review) */}
      <span className="bx-top">
        <Fig fig={fig} unit={unit} />
        {badge && <span className="bx-badge">{badge}</span>}
      </span>
      <span className="bx-stat__title">{title}</span>
      <span className="bx-stat__line">{line}</span>
      {delta && <span className={cx('bx-delta', delta.up ? 'is-up' : 'is-down')}>{delta.text}</span>}
      {/* a button you can see (12 Nov, review: the client wants buttons that say where they go); the card is the link */}
      {cta && (
        <span className="bx-btn bx-btn--glass bx-stat__cta">
          {cta} <ArrowRight size={15} />
        </span>
      )}
    </>
  );
  return (
    <Card tint={tint} className="bx-stat">
      {href ? (
        <a className="bx-cover" href={href}>
          {body}
        </a>
      ) : (
        body
      )}
    </Card>
  );
}

// Reports Spark can make next, locked until bought with credits
const LOCKED = [
  { id: 'competitors', eyebrow: 'Competitors', title: 'Who’s taking your buyers.', body: 'Three brands you name, side by side: prices, reach, what their customers praise.', price: 40, teaser: ['38%', '2.1×', '#3'] },
  { id: 'reviews', eyebrow: 'Customer reviews', title: 'What 2,100 reviews say.', body: 'Google, Noon and Amazon.ae read for you: the praise, the complaints, the words people use.', price: 25, teaser: ['4.3', '61%', '12'] },
  { id: 'search', eyebrow: 'Search', title: 'How people find you.', body: 'What people search before they buy, in Arabic and English, and where you show up.', price: 30, teaser: ['1.8k', '24', '7'] },
];

// The locked reports with sparkstudios.ae's card (13 Nov, review): the current card's size, lock and type kept; the
// card itself as the site's .tile (frosted glass white 66% to 32%, blur 18 px, a bright inner edge, a soft drop
// shadow, 28 px corners), and its top in the site's pale studio grey instead of the peach. A local REPORTS switch
// (Bands) picks it or the current card.
// 'first' (13 Nov, review: "the reports already made on top, the client loves charts"): one Reports section, the two
// ready reports first as the same site card with their figure and a chart in the grey, the locked ones after; the
// profile, consultation and Dr.AI in a row of three below. Its chart picked on a CHART switch.
type ReportCardLook = 'current' | 'site' | 'first';
const REPORT_CARD_KEY = 'spark-report-card';
// Reports first is Layout 1's only layout (13 Nov, review): the REPORTS switch is gone, and a Current or Site card
// picked before it went opens on Reports first too (their code stays, unused)
const readReportCard = (): ReportCardLook => 'first';
function useReportCard(): [ReportCardLook, (v: ReportCardLook) => void] {
  const [look, setLook] = useState(readReportCard);
  useEffect(() => {
    const f = () => setLook(readReportCard());
    window.addEventListener(REPORT_CARD_KEY, f);
    return () => window.removeEventListener(REPORT_CARD_KEY, f);
  }, []);
  const pick = (v: ReportCardLook) => {
    try {
      localStorage.setItem(REPORT_CARD_KEY, v);
    } catch {
      /* this visit only */
    }
    window.dispatchEvent(new Event(REPORT_CARD_KEY));
  };
  return [look, pick];
}

// The ready reports' chart (13 Nov, review, after a dashboard reference): the figure, and beside it a small sparkline
// with what's typical as a dotted line and its value under it. Trend, Bars and Compare were tried and dropped, and
// with them the CHART switch (13 Nov).
type Ready = {
  id: string;
  eyebrow: string;
  title: string;
  line: string;
  delta: { up: boolean; text: string };
  fig: string;
  unit?: string;
  href: string;
  months: number[]; // Jun to Nov
  typical: { value: number; label: string };
  fmt: (n: number) => string;
};

/** The small one: a sparkline over the months, the typical value dotted across it, labelled at its end. */
function Sparkline({ r }: { r: Ready }) {
  const g = `sp-${r.id}`;
  const vals = [...r.months, r.typical.value];
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const pad = (hi - lo) * 0.18 || 1;
  const W = 104, H = 38;
  const y = (v: number) => H - 3 - ((v - (lo - pad)) / (hi + pad - (lo - pad))) * (H - 6);
  const x = (i: number) => 3 + (i * (W - 6)) / (r.months.length - 1);
  const pts = r.months.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const lx = x(r.months.length - 1), ly = y(r.months[r.months.length - 1]);
  const ty = y(r.typical.value);
  return (
    <span className="spk" aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs>
          <linearGradient id={g} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1e3bd6" />
            <stop offset="0.6" stopColor="#7c4ae0" />
            <stop offset="1" stopColor="#e8501f" />
          </linearGradient>
          <linearGradient id={`${g}-a`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7c4ae0" stopOpacity="0.18" />
            <stop offset="1" stopColor="#7c4ae0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" x2={W} y1={ty} y2={ty} stroke="rgba(14, 17, 22, 0.32)" strokeWidth="1.2" strokeDasharray="2 4" strokeLinecap="round" />
        <polygon points={`${x(0)},${H} ${pts} ${lx},${H}`} fill={`url(#${g}-a)`} />
        <polyline points={pts} fill="none" stroke={`url(#${g})`} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lx} cy={ly} r="3.6" fill="#e8501f" />
      </svg>
      <span className="spk__lbl">typical {r.fmt(r.typical.value)}</span>
    </span>
  );
}

/** Quick overview 2's website score as a gauge (13 Nov, review, after a reference the client liked): a ring open at the
 *  foot, its track in faint Ink, the score's share of it in the brand's spectrum from Cobalt to Ember, filling in as the
 *  card appears; the figure in the ring's middle, "/100" beside it in the words' face as the balance's "/100 credits".
 *  A score out of 100 is a share, so a ring says it at a glance. */
function ScoreGauge({ value, of = 100, side }: { value: number; of?: number; side?: ReactNode }) {
  const C = 50, R = 44;
  const at = (deg: number) => [C + R * Math.cos((deg * Math.PI) / 180), C + R * Math.sin((deg * Math.PI) / 180)] as const;
  const [sx, sy] = at(135);
  const [ex, ey] = at(45);
  const share = Math.max(0, Math.min(1, value / of));
  const [vx, vy] = at(135 + 270 * share);
  const arc = `M ${sx} ${sy} A ${R} ${R} 0 1 1 ${ex} ${ey}`;
  return (
    <span className="qo-gaugewrap">
    <span className="qo-gauge" role="img" aria-label={`${value} of ${of}`}>
      <svg className="qo-gauge__ring" viewBox="0 0 100 88" aria-hidden>
        <defs>
          <linearGradient id="qo-gauge-g" gradientUnits="userSpaceOnUse" x1={sx} y1={sy} x2={vx} y2={vy}>
            <stop offset="0" stopColor="#1e3bd6" />
            <stop offset="0.55" stopColor="#7c4ae0" />
            <stop offset="1" stopColor="#e8501f" />
          </linearGradient>
        </defs>
        <path d={arc} pathLength={100} fill="none" stroke="rgba(14, 17, 22, 0.08)" strokeWidth="7" strokeLinecap="round" />
        <path
          className="qo-gauge__val"
          d={arc}
          pathLength={100}
          fill="none"
          stroke="url(#qo-gauge-g)"
          strokeWidth="7"
          strokeLinecap="round"
          style={{ strokeDasharray: `${share * 100} 100` }}
        />
      </svg>
      <Fig fig={String(value)} hidden />
    </span>
    {/* "/100" beside the ring, and under it whatever the card adds (its change since September, 13 Nov, review) */}
    <span className="qo-gauge__side">
      <span className="qo-gauge__of" aria-hidden>
        /{of}
      </span>
      {side}
    </span>
    </span>
  );
}

/** Quick overview 2's trend mark: the change over a period, small coloured words with an arrow, up in green or down in
 *  red, in the card's top right corner (13 Nov, review: the pill there crowded the figure; plain coloured words, and the
 *  figure smaller, let it stay in the corner). */
function Trend({ up, text, label }: { up: boolean; text: string; label: string }) {
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cx('qo-change', up ? 'is-up' : 'is-down')} role="img" aria-label={label}>
      <Icon size={13} strokeWidth={2.4} aria-hidden />
      <span aria-hidden>{text}</span>
    </span>
  );
}

/** A report the client has: the site card as the locked ones, its figure and a chart in the grey. */
function ReadyReport({ r }: { r: Ready }) {
  return (
    <Card tint="ember" className="bx-locked bx-locked--site bx-ready bx-ready--mini">
      <span className="bx-top">
        {/* the figure first, the chart small beside it (13 Nov, review: the figures lead; the chart a little larger
            than the lock, no more) */}
        <span className="bx-ready__vis">
          <Fig fig={r.fig} unit={r.unit} />
          <Sparkline r={r} />
        </span>
        <span className="bx-eyebrow">{r.eyebrow}</span>
        <h3 className="bx-title">{r.title}</h3>
      </span>
      <p className="bx-body">
        {r.line}
        <span className={cx('bx-delta', r.delta.up ? 'is-up' : 'is-down')}>{r.delta.text}</span>
      </p>
      <span className="bx-locked__acts">
        <a className="bx-btn bx-btn--glass bx-btn--full" href={r.href}>
          Open report <ArrowRight size={15} />
        </a>
      </span>
    </Card>
  );
}
// C (12 Nov, review): a tiny 3D glass lock (Blender, icon_lock.py); the header on the card's colour with room under
// it; a full-width Unlock with no price (the price shows when confirming).
function LockedReport({ r, credits, onBuy, c, site }: { r: (typeof LOCKED)[number]; credits: number; onBuy: () => void; c?: boolean; site?: boolean }) {
  const [state, setState] = useState<'locked' | 'confirm' | 'ordered'>('locked');
  const short = credits < r.price;
  return (
    <Card tint={state === 'ordered' ? 'cobalt' : c ? 'ember' : 'violet'} className={cx('bx-locked', `is-${state}`, site && 'bx-locked--site')}>
      <span className="bx-teaser" aria-hidden>
        {r.teaser.map((t) => (
          <b key={t}>{t}</b>
        ))}
      </span>
      <span className="bx-top">
        {c && state !== 'ordered' ? (
          <span className="bx-lockrow">
            {site && <TeaserChart id={`lk-${r.id}`} />}
            <img className="bx-lock3d" src="brand/glass/lock.webp?v=5" alt="" width={44} height={48} />
          </span>
        ) : (
          <span className="bx-locked__badge">{state === 'ordered' ? <Check size={14} strokeWidth={2.4} /> : <Lock size={13} strokeWidth={2.2} />}</span>
        )}
        <span className="bx-eyebrow">{r.eyebrow}</span>
        <h3 className="bx-title">{r.title}</h3>
      </span>
      <p className="bx-body">{state === 'ordered' ? 'Ordered. Spark starts on it today; it’s ready in about 3 days.' : r.body}</p>
      <span className="bx-locked__acts">
        {state === 'locked' && (
          <button type="button" className={cx('bx-btn bx-btn--glass', c && 'bx-btn--full')} onClick={() => setState('confirm')} disabled={short}>
            {c ? (
              'Unlock'
            ) : (
              <>
                <Lock size={14} /> Unlock · USD {r.price}
              </>
            )}
          </button>
        )}
        {state === 'confirm' && (
          <>
            <button
              type="button"
              className="bx-btn bx-btn--go"
              onClick={() => {
                onBuy();
                setState('ordered');
              }}
            >
              Use USD {r.price} of credits
            </button>
            <button type="button" className="bx-btn bx-btn--ghost" onClick={() => setState('locked')}>
              Cancel
            </button>
          </>
        )}
        {state === 'ordered' && <span className="bx-done">In progress · USD {r.price} used</span>}
        {state === 'locked' && short && <span className="bx-short">Top up to unlock</span>}
      </span>
    </Card>
  );
}

const SLOTS = ['Tue 18 Nov · 10:00', 'Tue 18 Nov · 14:30', 'Wed 19 Nov · 11:00', 'Thu 20 Nov · 09:30', 'Thu 20 Nov · 16:00'];

function Consultation({ credits, onBuy }: { credits: number; onBuy: () => void }) {
  const [slot, setSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState<string | null>(null);
  const PRICE = 20;
  return (
    <Card tint="ember" className="bx-consult">
      <span className="bx-eyebrow">Consultation</span>
      <h3 className="bx-title bx-title--lg">{booked ? `Booked for ${booked}.` : 'Talk the reports through with your strategist.'}</h3>
      {booked ? (
        <p className="bx-body">Reem will send the call link by email the day before. You can move it from Requests.</p>
      ) : (
        <>
          <span className="bx-chips" role="radiogroup" aria-label="Time">
            {SLOTS.map((s) => (
              <button key={s} type="button" role="radio" aria-checked={slot === s} className={cx('bx-chip', slot === s && 'is-on')} onClick={() => setSlot(s)}>
                {s}
              </button>
            ))}
          </span>
          <span className="bx-consult__acts">
            <button
              type="button"
              className="bx-btn bx-btn--go"
              disabled={!slot || credits < PRICE}
              onClick={() => {
                onBuy();
                setBooked(slot);
              }}
            >
              Book · USD {PRICE}
            </button>
            <span className="bx-short">{slot ? 'Gulf time · 45 minutes' : 'Pick a time'}</span>
          </span>
        </>
      )}
    </Card>
  );
}


// ---- B (12 Nov, review): the company first, its credits at the top to click and top up -------------------------

/** The company across the page, the spectrum blob behind its credits; the credits open a card to top up. */
// C (12 Nov, review): the welcome's own layer behind the company, the liquid metal card tinted with Noor that greets a
// new company before Dr.AI comes, so Home carries on the welcome's idea rather than a new colour; figures in Doto.
// The company card's looks, on a local HERO switch (13 Nov, review): metal (the welcome's liquid metal, shaded only
// under the words), ink (Mangrove Ink, a small light at the mark's corner) and orb (one pool of light as a wave from
// the top right corner).
// Rim, Frost, Orb live, Ring, Ring live, Cover, Grey and Glow under were tried and dropped (13 Nov); One light (one
// pool of light behind the credits) and Edges (a white card, Noor washing in at its sides, with Cobalt buttons on
// Layout 2) too (13 Nov, review: not needed). A saved 'one' or 'edges' opens on Metal; their styles stay, unused.
export type HeroLook = 'metal' | 'ink' | 'orb';
const HERO_LOOK_KEY = 'spark-hero-look';
const HERO_LOOK_NAMES: Record<HeroLook, string> = {
  metal: 'Metal',
  ink: 'Ink',
  orb: 'Orb',
};
const readHeroLook = (): HeroLook => {
  try {
    const v = localStorage.getItem(HERO_LOOK_KEY) as HeroLook | null;
    return v && v in HERO_LOOK_NAMES ? v : 'metal';
  } catch {
    return 'metal';
  }
};
function useHeroLook(): [HeroLook, (v: HeroLook) => void] {
  const [look, setLook] = useState(readHeroLook);
  useEffect(() => {
    const f = () => setLook(readHeroLook());
    window.addEventListener(HERO_LOOK_KEY, f);
    return () => window.removeEventListener(HERO_LOOK_KEY, f);
  }, []);
  const pick = (v: HeroLook) => {
    try {
      localStorage.setItem(HERO_LOOK_KEY, v);
    } catch {
      /* this visit only */
    }
    window.dispatchEvent(new Event(HERO_LOOK_KEY));
  };
  return [look, pick];
}
function HeroLookSwitch() {
  const [look, pick] = useHeroLook();
  return (
    <div className="ui-switch ui-switch--hero" role="radiogroup" aria-label="Company card look">
      <span className="ui-switch__label">HERO</span>
      {(Object.keys(HERO_LOOK_NAMES) as HeroLook[]).map((l) => (
        <button key={l} type="button" role="radio" aria-checked={look === l} className={cx(look === l && 'is-on')} onClick={() => pick(l)}>
          {HERO_LOOK_NAMES[l]}
        </button>
      ))}
    </div>
  );
}

/** Layout 2 (13 Nov, review): Dr.AI built as the report cards beside it (their padding, button and hover), the glass
 *  question mark where their figure stands so its title sits level with theirs; only its ground differs, white. */
function AskStat() {
  return (
    <Card tint="ember" className="bx-stat bx-stat--ask">
      <a className="bx-cover" href="#/assistant">
        <span className="bx-top bx-ask__q">
          <img src="brand/charts/question_ember.webp" alt="" />
        </span>
        <span className="bx-stat__title">Bring your question</span>
        <span className="bx-stat__line">Dr.AI knows your reports and your brand. Ask what to fix first, any time.</span>
        <span className="bx-btn bx-btn--glass bx-stat__cta">
          Ask Dr.AI <ArrowRight size={15} />
        </span>
      </a>
    </Card>
  );
}

/** Layout 2 (13 Nov, review): the consultation built as the profile card beside it, no picture: a label, the title,
 *  a line, and the way in. */
// Layout 2's consultation card, a second version (13 Nov, review): the dark band's background on the card, in
// Spark's colours (deep navy, a violet glow, a warm breath of Ember low right), the brand's light drifting slowly
// across it: a soft fan of the spectrum and a few quiet glints inside it, not comets. Picked on a CONSULT switch.
type ConsultCard = 'dark' | 'light' | 'object' | 'person' | 'spectrum';
// three more were tried (13 Nov, review): object, the client's glass calendar in the corner; person, the strategist's
// face and the next free times as the buttons; spectrum, the brand's spectrum along the rim and rising from the foot.
// Light picked: the switch is gone, the other looks' code stays.
const CONSULT_PICKED = 'light' as ConsultCard;

// the strategist's next free times, for the Strategist card (a prototype's three)
const CONSULT_SLOTS = ['Tue 10:00', 'Wed 14:30', 'Thu 11:00'];

function ConsultGlance() {
  const { openRequest } = useUI();
  const { state } = useStore();
  const look = CONSULT_PICKED;
  const book = () => openRequest({ type: 'Strategy', title: 'Consultation on the brand analysis' });
  const strategist = state.people.find((p) => p.id === 's-youssef');
  return (
    <Card tint="cobalt" className={cx('bx-glance bx-profile bx-consult-glance', look !== 'light' && `bx-consult--${look}`)}>
      {look === 'dark' && (
        <span className="cg-light" aria-hidden>
          <span className="cg-glow" />
          <span className="cg-beam" />
          <SpeedLines className="cg-motes" quiet />
        </span>
      )}
      {look === 'object' && (
        <span className="cg-obj" aria-hidden>
          <img src="brand/charts/calendar_consult.webp" alt="" />
        </span>
      )}
      {look === 'spectrum' && (
        <span className="cg-spec" aria-hidden>
          <span className="cg-spec__glow" />
        </span>
      )}
      <span className="bx-top">
        <span className="bx-eyebrow">{look === 'person' ? 'Consultation · 45 min' : 'Consultation'}</span>
        <h2 className="bx-title bx-title--xl">Talk it through</h2>
      </span>
      {look === 'person' && strategist ? (
        <span className="cg-person">
          <span className="cg-person__who">
            <Avatar person={strategist} size={40} />
            <span className="cg-person__text">
              <b>{strategist.name}</b>
              <span>{strategist.title}, wrote your reports</span>
            </span>
          </span>
        </span>
      ) : (
        <p className="bx-body">45 minutes with the strategist who wrote your reports: what to fix first, and what it's worth.</p>
      )}
      {look === 'person' ? (
        // the next free times are the buttons: one click books that time
        <span className="bx-glance__go cg-slots" role="group" aria-label="Book one of the next free times">
          {CONSULT_SLOTS.map((t) => (
            <button key={t} type="button" className="cg-slot" onClick={book}>
              {t}
            </button>
          ))}
        </span>
      ) : (
        <span className="bx-glance__go">
          <button type="button" className="bx-btn bx-btn--glass bx-btn--full" onClick={book}>
            Book a consultation
          </button>
        </span>
      )}
    </Card>
  );
}

/** A popover's open state, closed by a click outside or Escape. */
function usePop(): [boolean, (v: boolean | ((o: boolean) => boolean)) => void, React.RefObject<HTMLDivElement>] {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', down);
    window.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', down);
      window.removeEventListener('keydown', key);
    };
  }, [open]);
  return [open, setOpen, box];
}

/** The credits' top-up: what they're for, an amount picked on the glass tabs, Add. */
function TopUpPanel({ onTopUp, onDone }: { onTopUp: (n: number) => void; onDone: (n: number) => void }) {
  // an amount picked from the start, so Top up works at once (13 Nov, review: no dead button)
  const [amount, setAmount] = useState<number>(100);
  return (
    <div className="bx-topup" role="dialog" aria-labelledby="bx-topup-title">
      {/* no balance or bar here any more (13 Nov, review: the card under it already shows them); what the credits
          are for, in the brand's voice (short, specific, a pair of plain sentences), then the amounts */}
      <b className="bx-topup__title" id="bx-topup-title">
        Add credits
      </b>
      <span className="bx-topup__hint">One balance for reports and new work. Pick an amount.</span>
      {/* the amount on the glass tabs Requests filters with (13 Nov, review: not the black-filled toggle), the
          picked one under the clear bubble */}
      <span className="bx-topup__amounts">
        <GlassTabs
          kind="radio"
          fill
          label="Amount"
          value={String(amount)}
          onChange={(v) => setAmount(Number(v))}
          items={[50, 100, 250, 500].map((n) => ({ value: String(n), label: `USD ${n}` }))}
        />
      </span>
      <button
        type="button"
        className="bx-btn bx-btn--go bx-btn--wide"
        onClick={() => {
          onTopUp(amount);
          onDone(amount);
        }}
      >
        {/* 17 Nov, review: "just Top up, no amount": the amount is the one picked above */}
        Top up
      </button>
    </div>
  );
}

/** Credits as a card of their own (13 Nov, review, Bands' Reports first): the figure in Doto, what's left of the
 *  total, Top up opening the same panel as the company card's credits. */
function CreditsCard({ credits, total, onTopUp }: { credits: number; total: number; onTopUp: (n: number) => void }) {
  const [open, setOpen, box] = usePop();
  const [added, setAdded] = useState<number | null>(null);
  const whole = String(Math.floor(credits));
  const of = Math.round(Math.max(total, credits));
  return (
    <div className="bx-credcard" ref={box}>
      <Card tint="cobalt" className="bx-credcard__card">
        {/* 13 Nov, review: "Your balance", the balance in Doto, then "/ 100 credits" small in the mono face */}
        <span className="bx-top">
          <span className="bx-eyebrow">Your balance</span>
          <span className="bx-credcard__line">
            {/* the balance whole, no cents, the same on every layout (13 Nov, review) */}
            <b className="bx-credits__fig" role="img" aria-label={`${whole} of ${of} credits`}>
              {whole}
            </b>
            {/* no "/100 credits" beside it (13 Nov, review): the balance alone, under its label */}
          </span>
        </span>
        <span className="bx-credcard__of">
          {added && <span>+{added} added</span>}
          <span className="bx-credcard__bar">
            <span style={{ width: `${Math.min(100, (credits / of) * 100)}%` }} />
          </span>
        </span>
        <button type="button" className="bx-btn bx-btn--glass bx-btn--full bx-credcard__go" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          Top up
        </button>
      </Card>
      {open && <TopUpPanel onTopUp={onTopUp} onDone={(n) => (setAdded(n), setOpen(false))} />}
    </div>
  );
}

function CompanyHero({ credits, onTopUp, metal, hero = HERO_DEFAULT, replay = 0, noCredits }: { credits: number; total: number; onTopUp: (n: number) => void; metal?: boolean; hero?: Hero; replay?: number; noCredits?: boolean }) {
  const { state, me } = useStore();
  const ref = useBlobFollow<HTMLElement>();
  const [added, setAdded] = useState<number | null>(null);
  const [open, setOpen, box] = usePop();
  const b = state.brand;
  const team = state.people.filter((p) => p.org === 'client' && p.id !== me.id).length;
  const whole = String(Math.floor(credits));
  // the team's faces back by the line (13 Nov, review, as on the earlier Home): your colleagues, then a clear dotted
  // "+" for whoever you invite next
  const colleagues = state.people.filter((p) => p.org === 'client' && p.id !== me.id);
  const teamLink = (
    <a className="bx-co__team bx-co__team--faces" href="#/team?from=home">
      <span className="bx-co__faces" aria-hidden>
        {(colleagues.length ? colleagues : [me]).slice(0, 3).map((p) => (
          <Avatar key={p.id} person={p} size={28} ring />
        ))}
        <span className="bx-co__invite">+</span>
      </span>
      <span className="bx-co__team-text">
        {b.name} team · {team ? `you and ${team} colleague${team === 1 ? '' : 's'}` : 'just you so far'}
      </span>
    </a>
  );
  const [heroLook] = useHeroLook();
  const ink = metal && heroLook === 'ink';
  const quiet = metal && heroLook !== 'metal' && !ink ? heroLook : null; // the white cards
  const live = metal && heroLook === 'metal';
  return (
    <div className="bx-cohero" ref={box}>
      <section ref={ref} className={cx('bx-card bx-card--ember bx-co', metal && 'bx-co--metal', metal && hero.ground === 'noor-sand' && 'bx-co--light', quiet && 'bx-co--q', quiet && `bx-co--q-${quiet}`, ink && 'bx-co--ink')}>
        {live ? (
          <span key={`${hero.ground}-${hero.pace}-${hero.appear}-${replay}`} className={cx('bx-co__bg', `is-${hero.appear}`)} aria-hidden>
            {hero.ground === 'metal' ? (
              <MetalSurface onReady={noop} className="bx-co__metal" speed={PACE[hero.pace].metal} />
            ) : (
              <NoorField className="bx-co__noor" speed={PACE[hero.pace].noor} back={hero.ground === 'noor-ink' ? '#0e1116' : '#f8f6f2'} />
            )}
          </span>
        ) : ink ? (
          <span className="bx-co__light bx-co__light--ink" aria-hidden />
        ) : quiet === 'orb' ? (
          <span className="bx-co__light bx-co__light--orb" aria-hidden>
            <span className="bx-orb" />
          </span>
        ) : quiet ? (
          <span className={cx('bx-co__light', `bx-co__light--${quiet}`)} aria-hidden />
        ) : (
          <span className="bx-blob bx-blob--co" aria-hidden />
        )}
        <span className="bx-co__who">
          <span className="bx-co__mark">{b.name[0]}</span>
          <span className="bx-co__text">
            <h2 className="bx-title bx-title--xl">{b.name}</h2>
            <p className="bx-body">
              {b.positioning}
              <br />
              {b.reach}
            </p>
            {!noCredits && teamLink}
          </span>
        </span>
        {/* no credits on the card (Reports first): the team in the right corner they leave free, so the card is
            shorter (13 Nov, review) */}
        {noCredits && <span className="bx-co__corner">{teamLink}</span>}
        {!noCredits && (
        <button type="button" className={cx('bx-credits', open && 'is-open')} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span className="bx-credits__label">Credits · USD</span>
          <b className="bx-credits__fig" role="img" aria-label={whole}>
            {whole}
          </b>
          {/* C (12 Nov, review): the figure alone, lighter; the click opens the top-up anyway */}
          {!metal && (
            <span className="bx-credits__go">
              {added ? `+${added} added` : 'Top up'} <ChevronDown size={14} />
            </span>
          )}
        </button>
        )}
      </section>
      {open && <TopUpPanel onTopUp={onTopUp} onDone={(n) => (setAdded(n), setOpen(false))} />}
    </div>
  );
}

/** What Spark did, in words, and the way into the reports; the figures stand beside it. */
function Glance() {
  return (
    <Card tint="violet" className="bx-glance">
      <span className="bx-eyebrow">Brand analysis · October</span>
      <h2 className="bx-title bx-title--xl">Your brand, at a glance</h2>
      <p className="bx-body">
        Spark read 23 pages of your website, 412 posts on Instagram and TikTok and 3,860 comments. Instagram works; the
        website loses buyers on mobile.
      </p>
      <span className="bx-glance__go">
        <a className="bx-btn bx-btn--glass" href="#/?tab=website">
          Website report <ArrowRight size={15} />
        </a>
        <a className="bx-btn bx-btn--glass" href="#/?tab=social">
          Social media report <ArrowRight size={15} />
        </a>
      </span>
    </Card>
  );
}

/** C (12 Nov, review): the company's profile in a few lines and tags, with a clear way into it. */
function ProfileCard({ pair, tags, short }: { pair?: boolean; tags?: boolean; short?: boolean } = {}) {
  const { state } = useStore();
  const b = state.brand;
  // as B's card (12 Nov, review): a clear title, a clear description, one full-width way in; no tags
  return (
    <Card tint="violet" className={cx('bx-glance bx-profile', pair && 'bx-profile--pair')}>
      {/* the title on the card's colour, the description on the lighter surface, as the report cards (12 Nov) */}
      <span className="bx-top">
        <span className="bx-eyebrow">Company profile</span>
        <h2 className="bx-title bx-title--xl">Your brand, at a glance</h2>
      </span>
      {tags ? (
        // the company in a few tags instead of the description (13 Nov, review): what it is, since when, where it sells
        <ul className="bx-tags" aria-label="About the company">
          {/* four, on two lines, with room round them (13 Nov, review) */}
          {['Everyday products', `Dubai, since ${b.founded.split(',')[0]}`, '14 UAE stores', '60 retailers'].map((t) => (
            <li key={t} className="bx-tag">
              {t}
            </li>
          ))}
        </ul>
      ) : short ? (
        // Bold (13 Nov, review): a third of the row now, so two lines, no taller than the reports beside it
        <>
          <p className="bx-body">Design-led everyday products since 2017, in 14 UAE stores and online.</p>
          {/* Layout 2 · Metal and Ink (13 Nov, review: one title size, so the title takes one line): what the line
              doesn't say, as tags, so the card holds no gap above its button */}
          <ul className="bx-tags bx-tags--more" aria-label="More about the company">
            {['Dubai', '60 partner retailers', 'Bilingual voice'].map((t) => (
              <li key={t} className="bx-tag">
                {t}
              </li>
            ))}
          </ul>
        </>
      ) : pair ? (
        <p className="bx-body">
          {b.tagline} since {b.founded.split(',')[0]}: {b.footprint.split(' · ').join(', ').replace('online store', 'an online shop')}.
        </p>
      ) : (
      <p className="bx-body">
        {b.tagline}, founded in {b.founded.replace(', ', ' in ')}. {b.footprint.split(' · ').join(', ').replace(/^./, (c) => c.toUpperCase())}. Spark
        keeps this profile up to date as it learns about you.
      </p>
      )}
      <span className="bx-glance__go">
        <a className="bx-btn bx-btn--glass bx-btn--full" href="#/?tab=profile">
          Open company profile <ArrowRight size={15} />
        </a>
      </span>
    </Card>
  );
}

/** C: Sparki asks, now and then coming alive. The words after the brand idea, "We bring sparks to light": the
 *  client's question is the spark, Dr.AI (who has read the reports) brings it to light (12 Nov, review). The button
 *  is the cards' secondary, as Unlock. */
function AskSparki({ look }: { look: AskLook }) {
  return (
    <Card tint="cobalt" className={cx('bx-ask bx-ask--sparki bx-ask--solid', `bx-ask--${look}`)}>
      {/* HERO Orb's "Let's talk" glass (13 Nov, review), shown only there: the light under the glass, the glass, the
          light in it, kept inside the card so Sparki can still hop out of it */}
      <span className="bx-ask__glass" aria-hidden>
        <i />
        <i />
        <i />
      </span>
      <span className="bx-top">
        <span className="bx-sparki" aria-hidden>
          <SparkiStill size={64} />
        </span>
        {/* the sparks he leaves where he turns over, above the card (Quick overview, 13 Nov, review) */}
        <span className="bx-sparki__trail" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        {/* no dot between the two (13 Nov, review) */}
        <span className="bx-eyebrow">Dr.AI knows your brand</span>
        {/* "to light." kept together, so a wrap never leaves "light." alone (13 Nov, review) */}
        <h3 className="bx-title">Bring your question to{'\u00a0'}light.</h3>
      </span>
      <a className="bx-btn bx-btn--glass bx-btn--full bx-ask__go" href="#/assistant">
        Ask Dr.AI <ArrowRight size={15} />
      </a>
    </Card>
  );
}

function BookCard({ c, solid, glass }: { c?: boolean; solid?: ConsultLook; glass?: boolean }) {
  const { openRequest } = useUI();
  const book = () => openRequest({ type: 'Strategy', title: 'Consultation on the brand analysis' });
  if (glass)
    // Bold glass (13 Nov, review): the consultation on the cards' milky glass, the glass grid from sparkstudios.ae
    // (the client's own object, images/glass/glass-grid.webp) as its picture, a soft light behind it as on the site
    return (
      <Card tint="cobalt" className="bx-book bx-book--c bx-book--glass">
        <span className="bx-book__art" aria-hidden>
          <img src="brand/glass/glass-grid.webp" alt="" />
        </span>
        <span className="bx-book__text">
          <span className="bx-eyebrow">Consultation</span>
          <h3 className="bx-title bx-title--lg">Talk it through. Leave with a plan.</h3>
          <p className="bx-body">The strategist who wrote your reports shows what to fix first, and what it’s worth.</p>
          <button type="button" className="bx-btn bx-btn--glass bx-book__go" onClick={book}>
            Book a consultation
          </button>
        </span>
      </Card>
    );
  if (c && solid)
    // Layout (12 Nov, review): built as the profile beside it, so the two weigh the same: Ember label, a title of
    // the same length and shape ("Your brand, at a glance." / "Your plan, in 45 minutes."), two lines of words, the
    // cards' secondary button across the card. Only the colour tells them apart.
    return (
      <Card tint="cobalt" className={cx('bx-book bx-book--c bx-book--pair bx-book--solid', `bx-book--${solid}`)}>
        <span className="bx-top">
          <span className="bx-eyebrow">Consultation</span>
          <h3 className="bx-title bx-title--xl">Your plan, in 45 minutes.</h3>
        </span>
        <p className="bx-body">On video with the strategist who wrote your reports: what to fix first, and what it’s worth.</p>
        <span className="bx-glance__go">
          <button type="button" className="bx-btn bx-btn--glass bx-btn--full" onClick={book}>
            Book a consultation <ArrowRight size={15} />
          </button>
        </span>
      </Card>
    );
  if (c)
    // C (12 Nov, review): no empty space; who you'll talk to, and the button the size of the cards' others, at the
    // foot, level with Ask Dr.AI's beside it
    return (
      <Card tint="cobalt" className={cx('bx-book bx-book--c', solid && `bx-book--solid bx-book--${solid}`)}>
        {/* the brand's voice (12 Nov): two short sentences, a human first, proof over promise */}
        <span className="bx-eyebrow">Consultation</span>
        <h3 className="bx-title bx-title--lg">Talk it through. Leave with a plan.</h3>
        <p className="bx-body">The strategist who wrote your reports shows what to fix first, and what it’s worth.</p>
        {/* Spark's strategist, named in full so it reads as a person at Spark (12 Nov, review: "Youssef" read as
            "yourself"); the sidebar's own avatar, only the letters differ */}
        <span className="bx-who">
          <Avatar person={{ name: 'Omar Haddad', hue: 220, org: 'client' }} size={40} />
          <span className="bx-who__text">
            <b>Omar Haddad · Brand strategist at Spark</b>
            <span>Video call · 45 minutes</span>
          </span>
        </span>
        <button type="button" className="bx-btn bx-btn--go bx-book__go" onClick={book}>
          Book a consultation <ArrowRight size={15} />
        </button>
      </Card>
    );
  return (
    <Card tint="ember" className="bx-book">
      <span className="bx-top">
        <span className="bx-eyebrow">Consultation</span>
        <h3 className="bx-title bx-title--lg">Talk the reports through with your strategist.</h3>
      </span>
      <p className="bx-body">45 minutes on video: what to fix first, and what it’s worth.</p>
      <button type="button" className="bx-btn bx-btn--go bx-btn--big" onClick={book}>
        Book a consultation <ArrowRight size={17} />
      </button>
    </Card>
  );
}

function AskCard() {
  return (
    <Card tint="cobalt" className="bx-ask">
      <span className="bx-icon">
        <Sparkles size={44} strokeWidth={1.6} stroke="url(#bx-spectrum)" />
      </span>
      <span className="bx-eyebrow">Ask Dr.AI</span>
      <h3 className="bx-title">“What should we fix first?”</h3>
      <a className="bx-link" href="#/assistant">
        Ask it <ArrowRight size={15} />
      </a>
    </Card>
  );
}

/** Home for a company past onboarding (12 Nov, review: variant C moved from the demo to the portal): the cards
 *  alone, no greeting, on the page's own Sand. The credits and the unlocks are the portal's own. */

// ---- Your reports (12 Nov, review): one tile for a report the client has and one to unlock --------------------
// The same build for both, so they line up: a picture band (the figure; or, locked, that figure blurred behind a
// glass lock in the middle), the kind in Ember, one title in one face, one mono line, the button. No description:
// the lock and the title say enough.
type TileReady = { kind: 'ready'; id: string; eyebrow: string; title: string; meta: { up?: boolean; text: string }; fig: string; unit?: string; href: string };
type TileLocked = { kind: 'locked'; id: string; eyebrow: string; title: string; meta: { text: string }; fig: string; unit?: string; price: number };
type Tile = TileReady | TileLocked;

/** A report's picture before it is unlocked (12 Nov, review): a small chart of the kind it will hold, in the
 *  spectrum, blurred, so it reads as data behind frosted glass. */
// One chart behind every locked report (13 Nov, review: "the search one, as the one for all"): a rising line and
// its area in the spectrum, drawn the same for each; blurred by the card that holds it.
const TEASER_PATH = 'M20 74 C 50 70, 66 52, 92 55 S 140 32, 164 35 S 204 14, 220 12';
function ChartGrad({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#2f49f0" />
        <stop offset="0.4" stopColor="#6a3df0" />
        <stop offset="0.7" stopColor="#c33fc4" />
        <stop offset="1" stopColor="#ff5a1f" />
      </linearGradient>
    </defs>
  );
}
function TeaserChart({ id }: { id: string }) {
  const g = `tc-${id}`;
  return (
    <svg className="rt__chart" viewBox="0 0 240 90" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <ChartGrad id={g} />
      <path d={`${TEASER_PATH} L 220 86 L 20 86 Z`} fill={`url(#${g})`} opacity="0.28" />
      <path d={TEASER_PATH} fill="none" stroke={`url(#${g})`} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function ReportTile({ t, credits, onBuy }: { t: Tile; credits: number; onBuy: (n: number) => void }) {
  const [state, setState] = useState<'locked' | 'confirm' | 'ordered'>('locked');
  const locked = t.kind === 'locked' && state !== 'ordered';
  const body = (
    <>
      {/* no charts in the carousel's reports (13 Nov, review): the figure alone on a ready one, the lock alone on a
          locked one */}
      <span className={cx('rt__visual', locked && 'is-locked')}>
        {!locked && <Fig className="rt__fig" fig={t.fig} unit={t.unit} />}
        {locked && (
          <span className="rt__lockwrap">
            <img className="rt__lock" src="brand/glass/lock.webp?v=5" alt="" />
          </span>
        )}
      </span>
      <span className="bx-eyebrow rt__eyebrow">{t.eyebrow}</span>
      <h3 className="rt__title">{t.title}</h3>
      <span className={cx('rt__meta', t.kind === 'ready' && (t.meta.up ? 'is-up' : 'is-down'))}>
        {t.kind === 'locked' && state === 'ordered' ? 'Ordered · ready in about 3 days' : t.meta.text}
      </span>
    </>
  );
  if (t.kind === 'ready')
    return (
      <Card tint="ember" className="bx-stat rt">
        <a className="bx-cover" href={t.href}>
          {body}
          <span className="bx-btn bx-btn--glass bx-btn--full rt__go">
            Open report <ArrowRight size={15} />
          </span>
        </a>
      </Card>
    );
  return (
    <Card tint="ember" className={cx('rt rt--locked', state === 'ordered' && 'is-ordered')}>
      {body}
      <span className="rt__go rt__acts">
        {state === 'locked' && (
          <button type="button" className="bx-btn bx-btn--glass bx-btn--full" disabled={credits < t.price} onClick={() => setState('confirm')}>
            Unlock
          </button>
        )}
        {state === 'confirm' && (
          <>
            <button
              type="button"
              className="bx-btn bx-btn--go"
              onClick={() => {
                onBuy(t.price);
                setState('ordered');
              }}
            >
              Use USD {t.price}
            </button>
            <button type="button" className="bx-btn bx-btn--ghost" onClick={() => setState('locked')}>
              Cancel
            </button>
          </>
        )}
      </span>
    </Card>
  );
}

/** Shelf: the tiles in a row you scroll sideways (trackpad, drag or arrows), the next one peeking in at the edge. */
function Shelf({ title, children }: { title: string; children: ReactNode[] }) {
  const row = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [at, setAt] = useState(0);
  const step = () => {
    const card = row.current?.querySelector<HTMLElement>('.rs-shelf__slide');
    return card ? card.offsetWidth + 18 : 1;
  };
  const sync = () => {
    const el = row.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 4 });
    // the tile at the left edge is the current one; at the far end, the last
    setAt(el.scrollLeft + el.clientWidth > el.scrollWidth - 4 ? children.length - 1 : Math.round(el.scrollLeft / step()));
  };
  useEffect(sync, []);
  const to = (k: number) => row.current?.scrollTo({ left: k * step(), behavior: 'smooth' });
  // drag to scroll with the mouse
  const drag = useRef<{ x: number; left: number } | null>(null);
  return (
    <section className="bx-car rs-shelf" aria-label={title}>
      <div className="bx-car__head">
        <h2 className="bx-section">{title}</h2>
        {/* Ask Dr.AI's own rail, in a row: fine arrows and a dot per report (12 Nov, review) */}
        <CardRail
          dir="row"
          label="Reports"
          count={children.length}
          index={at}
          canPrev={!edge.start}
          canNext={!edge.end}
          onStep={(d) => to(Math.max(0, Math.min(children.length - 1, at + d)))}
          onPick={to}
        />
      </div>
      <div
        ref={row}
        className={cx('rs-shelf__row', !edge.end && 'has-more', !edge.start && 'has-less')}
        onScroll={sync}
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse' || (e.target as HTMLElement).closest('a,button')) return;
          drag.current = { x: e.clientX, left: row.current!.scrollLeft };
        }}
        onPointerMove={(e) => {
          if (drag.current && row.current) row.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerLeave={() => (drag.current = null)}
      >
        {children.map((ch, k) => (
          <div
            key={k}
            className="rs-shelf__slide"
            // a tile reached with the keyboard slides into view (12 Nov, review)
            onFocusCapture={(e) => (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })}
          >
            {ch}
          </div>
        ))}
      </div>
    </section>
  );
}

/** Focus: one tile in the middle, the ones beside it turned away and set back, as a deck you leaf through. */
function Focus({ title, children }: { title: string; children: ReactNode[] }) {
  const [i, setI] = useState(1);
  const n = children.length;
  const go = (d: number) => setI((x) => Math.max(0, Math.min(n - 1, x + d)));
  return (
    <section className="bx-car rs-focus" aria-roledescription="carousel" aria-label={title}>
      <div className="bx-car__head">
        <h2 className="bx-section">{title}</h2>
        <span className="rs-dots" aria-hidden>
          {children.map((_, k) => (
            <button key={k} type="button" tabIndex={-1} className={cx(k === i && 'is-on')} onClick={() => setI(k)} />
          ))}
        </span>
        <span className="bx-car__arrows">
          <button type="button" className="bx-car__arrow" onClick={() => go(-1)} disabled={i === 0} aria-label="Previous">
            <ArrowRight size={17} style={{ rotate: '180deg' }} />
          </button>
          <button type="button" className="bx-car__arrow" onClick={() => go(1)} disabled={i === n - 1} aria-label="Next">
            <ArrowRight size={17} />
          </button>
        </span>
      </div>
      <div className="rs-focus__stage">
        {children.map((ch, k) => {
          const d = k - i;
          return (
            <div
              key={k}
              className={cx('rs-focus__slide', d === 0 && 'is-on', Math.abs(d) > 1 && 'is-far')}
              style={{ ['--d' as string]: d }}
              aria-hidden={d !== 0}
              onClick={d !== 0 ? () => setI(k) : undefined}
            >
              {ch}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Two looks of Home to show the client side by side (12 Nov, review, after clicker-sigma-six.vercel.app): 'current'
// as it is; 'bold' with solid, thick figures in the spectrum with a glow, and gradients that are calm at rest and
// turn vivid as a card lifts under the pointer. A switch at the foot of the page, local only.
// 13 Nov, review: Bands ('current') is now Main, the one Home is built on; the old Main (Layout 3) is gone; Doto
// (Layout 2) is named Reports first, for its reports under the company.
// boldGlass (13 Nov, review): Bold, its consultation on milky glass with the glass grid from the client's site
// 13 Nov, review: Bold glass is now the one Home opens on; plain Bold is gone (its viewers land on Bold glass)
// qo2 (13 Nov, review, after clicker-sigma-six.vercel.app's "Everything it does." bento): Quick overview laid out as
// that grid, light and in the brand's colours
// brand (13 Nov, review): Layout 3's cards under a dark brand band across the top: comets flying across it, the
// company's data, and a chrome shape in the Noor spectrum turning from shape to shape as dozfx's hero does (ui/ShapeMorph)
// brandKeys (13 Nov, review): Layout 4 again, its figure Spark's four shapes (the spark, a prism, an orb, a key) in
// jelly glass rendered in Blender, each in its own colour as the service keys on sparkstudios.ae (ui/MorphVideo)
// brandTiles (13 Nov, review): Layout 5's Grid tiles made Layout 2 ("replace Layout 2 with Layout 5 · Grid tiles"), and
// Layout 5 is now Glass slabs; the CARDS switch is gone. The old Layout 2 (boldGlass) leaves the switch; its code stays.
type HomeLook = 'current' | 'boldGlass' | 'qo2' | 'layout2' | 'brand' | 'brandKeys' | 'brandTiles' | 'tabs' | 'brief' | 'dash' | 'greet' | 'health' | 'healthSide' | 'healthBar';
const isBand = (l: HomeLook) => l === 'brand' || l === 'brandKeys' || l === 'brandTiles';
/** The card set each band layout shows: Layout 2 its Grid tiles, Layout 5 its Glass slabs. */
const cardsOf = (l: HomeLook): CardStyle | undefined => (l === 'brandTiles' ? 'tiles' : l === 'brandKeys' ? 'slabs' : undefined);
// Layout 3 (12 Nov, review): Layout refined: solid Cobalt figures (Noor only in the company card's metal), labels
// and small lines at AA contrast, firmer button strokes, focus rings. Layout itself, the "Grid draft", removed (12 Nov).
// Layout 2, "Doto" (12 Nov, review): Layout 3 exactly, with the client's dotted Doto for every figure (reports and
// credits), to show beside it.
const HOME_LOOK_KEY = 'spark-home-look';
// numbered by rank (13 Nov, review: "Layout 1 the weakest in design, content and look, the last the best"):
// Glass slabs, Recommended, Quick overview 2 (up one once its light was only Narrow Static and Narrow Dynamic, no
// chrome), Grid tiles, the tabs. The old Bold glass and the dark band are off the switch.
// On the switch (13 Nov, review: "take Layouts 2, 5, 6, 7 and 8 off, to an archive"): Layouts 1, 3, 4 and 9, under
// their numbers as reviewed. The archived ones (current, tabs, brief, dash, greet) keep their code and names here;
// to bring one back, add it to this list. A browser that last had an archived one opens on Layout 4.
// named and ordered for showing the client (13 Nov, review): Health, Console, Overview, Studio (Keys and then Glass
// archived the same day). Health opens the round, because it is the one we recommend and because the welcome's
// mascot flies into its right corner; after it ours and the colleague's alternate. HOME_ON_SWITCH is the looks among
// them (what a saved look is checked against, and the one a visit opens on); SWITCH_ORDER is the switch as it reads,
// with the colleague's two concepts and the page of empty states in their places.
// 17 Nov: Health in three heads (Jean's sketch, ours, a workspace menu) reviewed; ours kept as Health, the other two
// deleted. A browser that last had one of them opens on Health
// 17 Nov (late): Health again with the brand switcher in the sidebar's account menu, as Claude Code's workspaces
// 17 Nov (late), design sync: Jean reviews one Home, so the switch keeps only Health and its sidebar version, and
// the onboarding as a new company sees it; Console, Overview, Studio and the empty states are off it (their pages stay)
const HOME_ON_SWITCH: HomeLook[] = ['health', 'healthSide', 'healthBar'];
/** The switch in the order it is shown: a look of the portal, or a page of its own. */
type SwitchItem = HomeLook | { id: 'console' | 'studio' | 'empty' | 'onboarding'; name: string; to: string };
// Health is the default (18 Nov, review: "Health is the default, so the switch keeps Sidebar brands and Onboarding"):
// the switch shows the two departures from it, each a toggle; pressing the one that's on comes back to Health
const SWITCH_ORDER: SwitchItem[] = [
  // the sketch's version, the default (18 Nov, review: "add the sketch's version to the variants"): the brand picked
  // from the dropdown by its name on Home
  'health',
  'healthSide',
  // concept 3 (18 Nov, review, after Covey's app strip): the brands as a row of marks under a grid button
  'healthBar',
  // the portal as a new company finds it: the welcome, then Dr.AI's four first steps in his corner (shown once)
  { id: 'onboarding', name: 'Onboarding', to: '/' },
];
// renumbered 1–4 once the rest were archived (13 Nov, review): the old Layouts 1, 3, 4 and 9. The archived ones keep
// the names they had when reviewed, with "(archived)", should they come back
const HOME_LOOK_NAMES: Record<HomeLook, string> = {
  // named by what each one is (13 Nov, review: the plain words, not the metaphors — Focus, Daylight and Prism were
  // tried and dropped): the brand's health; the overview at a glance. The colleague's two keep her names, Console
  // and Studio. Were Classic and Quick overview
  qo2: 'Overview',
  // named by where the brand is picked (18 Nov, review: "the names should say what each is")
  health: 'Dropdown by the name',
  healthSide: 'In the profile menu',
  healthBar: 'Bar across the top',
  // Glass archived (13 Nov, review: "take the Glass version off, put it in the archive"), its code kept
  brandTiles: 'Glass (archived)',
  // Keys archived (13 Nov, review: "delete the Keys variant, or put it in the archive of the ones we made before")
  brandKeys: 'Keys (archived)',
  current: 'Layout 2 (archived)',
  tabs: 'Layout 5 (archived)',
  brief: 'Layout 6 (archived)',
  dash: 'Layout 7 (archived)',
  greet: 'Layout 8 (archived)',
  layout2: 'Reports carousel',
  boldGlass: 'Bold glass',
  brand: 'Dark band',
};
// Layout (12 Nov, review): the company card as it is; Company profile and a solid Consultation side by side; then
// all the reports in a carousel, three in view, the ones the client has first, the ones to unlock after. No Dr.AI
// card. The Consultation card's colour, to compare: Ink, Cobalt, Ember, or Noor (the spectrum as one gradient).
type ConsultLook = 'ink' | 'cobalt' | 'ember' | 'noor';
type ReportsLook = 'carousel' | 'shelf' | 'focus';

/** Cards in a row that slides: `per` in view (3 on a wide page, fewer when narrow), arrows to move a card at a time,
 *  the cards leaving the view fading back a little. */
function Carousel({ title, children }: { title: string; children: ReactNode[] }) {
  const view = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [i, setI] = useState(0);
  useEffect(() => {
    const el = view.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const per = w >= 820 ? 3 : w >= 540 ? 2 : 1;
  const GAP = 18;
  const cardW = w ? (w - GAP * (per - 1)) / per : 0;
  const max = Math.max(0, children.length - per);
  const at = Math.min(i, max);
  const go = (d: number) => setI((x) => Math.max(0, Math.min(max, Math.min(x, max) + d)));
  return (
    <section className="bx-car" aria-roledescription="carousel" aria-label={title}>
      <div className="bx-car__head">
        <h2 className="bx-section">{title}</h2>
        <span className="bx-car__count" aria-live="polite">
          {Math.min(at + per, children.length)}/{children.length}
        </span>
        <span className="bx-car__arrows">
          <button type="button" className="bx-car__arrow" onClick={() => go(-1)} disabled={at === 0} aria-label="Previous">
            <ArrowRight size={17} style={{ rotate: '180deg' }} />
          </button>
          <button type="button" className="bx-car__arrow" onClick={() => go(1)} disabled={at >= max} aria-label="Next">
            <ArrowRight size={17} />
          </button>
        </span>
      </div>
      <div
        ref={view}
        className="bx-car__view"
        onKeyDown={(e) => (e.key === 'ArrowRight' ? go(1) : e.key === 'ArrowLeft' ? go(-1) : undefined)}
      >
        <div className="bx-car__track" style={{ gap: GAP, translate: `${-at * (cardW + GAP)}px 0` }}>
          {children.map((ch, k) => (
            <div key={k} className={cx('bx-car__slide', (k < at || k >= at + per) && 'is-out')} style={{ width: cardW || undefined }} aria-hidden={k < at || k >= at + per}>
              {ch}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
const SHOW_HOME_SWITCH = import.meta.env.DEV || import.meta.env.VITE_UI_SWITCH === '1';

/** Quick overview's cards lean toward the pointer (13 Nov, review, after clicker-sigma-six.vercel.app): up to 5°
 *  each way in a 900 px perspective, lifted 4 px, easing back flat when the pointer leaves. Not the company card (it
 *  isn't a control), and not when motion is reduced. */
function CardTilt({ root, sel = '.bx-grid--doto .bx-card:not(.bx-co)' }: { root: React.RefObject<HTMLDivElement>; sel?: string }) {
  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let on: HTMLElement | null = null;
    const flat = (c: HTMLElement | null) => c && (c.style.transform = '');
    const move = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>(sel);
      if (card !== on) {
        flat(on);
        on = card;
      }
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateY(-4px)`;
    };
    const leave = () => {
      flat(on);
      on = null;
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      leave();
    };
  }, [root, sel]);
  return null;
}

/** Quick overview 2 (13 Nov, review): the reference's bento, light. One large card for the company with a pool of
 *  Noor in its corner, the two reports as figures, the credits, Dr.AI, the consultation with the glass grid, and the
 *  company profile as tags. Whole cards are the links, as in the reference; the credits card opens the top-up. */
// Blender 2 (13 Nov, review): the Blender light over First's reach, from the corner nearly level to the left round to
// nearly straight down, swaying far less than First
// First v1 (13 Nov, review: "show me the design you made at first, with the lightest motion"): the first cone, its
// soft colours, no white in the corner, only breathing
// First v1 · focus (13 Nov, review, an experiment): the same light as seven rays bundled onto the company's name,
// still (it once narrowed and widened in turn; now held at its narrowest). First v1 · narrow (13 Nov, review): focus held about
// its narrowest, opening only a little, its colours flowing through the beam instead (the orange going down, the blue
// and violet up, and back)
// First v1 · narrow long (13 Nov, review): the same, the beam reaching further, past the words to the team; and
// still, held at its first frame (peach and orange above, violet and blue below), as focus is
// First v1, First, Drawn, Blender and Blender 2 dropped (13 Nov, review); a saved one opens on focus. Their styles and
// renders stay, unused.
// Narrow Long Static, Narrow Long Dynamic, Chrome and Chrome Spectrum dropped (13 Nov, review): Narrow Static and
// Narrow Dynamic kept; a saved one opens on Narrow Static. Their styles stay, unused.
type LightLook = 'focus' | 'narrow';
const LIGHT_KEY = 'spark-qo-light';
const FAN = ['#1e3bd6', '#4a46f2', '#7a3cf0', '#b04ad8', '#ff4f9a', '#ff6a2f', '#ffb48a']; // First v1's colours, low to high
const LIGHT_NAMES: Record<LightLook, string> = {
  // named by what they do (13 Nov, review)
  focus: 'Narrow Static',
  narrow: 'Narrow Dynamic',
};
const readLight = (): LightLook => {
  try {
    const v = localStorage.getItem(LIGHT_KEY) as LightLook | null;
    return v && v in LIGHT_NAMES ? v : 'focus';
  } catch {
    return 'focus';
  }
};
function useLight(): [LightLook, (v: LightLook) => void] {
  const [look, setLook] = useState(readLight);
  useEffect(() => {
    const f = () => setLook(readLight());
    window.addEventListener(LIGHT_KEY, f);
    return () => window.removeEventListener(LIGHT_KEY, f);
  }, []);
  const pick = (v: LightLook) => {
    try {
      localStorage.setItem(LIGHT_KEY, v);
    } catch {
      /* this visit only */
    }
    window.dispatchEvent(new Event(LIGHT_KEY));
  };
  return [look, pick];
}

// Layout 5's cards (13 Nov, review: "a new style for the cards"), as the service cards on sparkstudios.ae: each in one
// of the five capability colours (S Cobalt, P violet, A magenta, R pink, K Ember), its colour in a fine ring and a long
// shadow under the card, a 38 px tile of that colour with a white icon and the card's name beside it in mono capitals,
// titles bold, the profile as a list with dots of its colour (bento.css, .qo--keys)
type Tone = 's' | 'p' | 'a' | 'r' | 'k';
function KeyHead({ tone, icon: Icon, label }: { tone: Tone; icon: LucideIcon; label: string }) {
  return (
    <span className={cx('qk-head', `qk--${tone}`)}>
      <span className="qk-tile" aria-hidden>
        <Icon size={18} strokeWidth={2.2} />
      </span>
      <span className="qk-label">{label}</span>
    </span>
  );
}

// Layout 5's second card style (13 Nov, review, after a festival's passes named by colour temperature: "Candle light
// 1900 K", "Tungsten 3200 K", "Daylight 5600 K"): a band of light across the top of the card with its figure in it,
// big, in Ink; under it a title, a list with short dashes and a button. Second pass (13 Nov, review: the client wants
// little dark, so the dark bodies went): the body is our milky glass, the corners ours, the bands softer, the title,
// text and buttons the portal's own. Our light is the Noor spectrum, so the bands run along it card by card, Cobalt to Ember to
// daylight, as if the row were light through the prism. Picked on the CARDS switch (Service keys or Light bands).
type CardStyle = 'keys' | 'bands' | 'site' | CardVariant;
const CARDS_KEY = 'spark-qo-cards';
// four more (13 Nov, review), after the references the client sent: features/demo/HomeCardVariants
// 13 Nov, review: Brand analysis, Results, Scenes, Service keys and Light bands taken off the switch; a browser that
// kept one opens on Grid tiles (their code stays, unused)
const CARD_STYLE_NAMES: Partial<Record<CardStyle, string>> = { tiles: '2 Grid tiles', slabs: '3 Glass slabs' };
const readCardStyle = (): CardStyle => {
  try {
    const v = localStorage.getItem(CARDS_KEY) as CardStyle | null;
    return v && v in CARD_STYLE_NAMES ? v : 'tiles';
  } catch {
    return 'tiles';
  }
};
function useCardStyle(): [CardStyle, (v: CardStyle) => void] {
  const [v, setV] = useState(readCardStyle);
  useEffect(() => {
    const f = () => setV(readCardStyle());
    window.addEventListener(CARDS_KEY, f);
    return () => window.removeEventListener(CARDS_KEY, f);
  }, []);
  const pick = (x: CardStyle) => {
    try {
      localStorage.setItem(CARDS_KEY, x);
    } catch {
      /* this visit only */
    }
    window.dispatchEvent(new Event(CARDS_KEY));
  };
  return [v, pick];
}
// (the CARDS switch, 13 Nov, is gone: Layout 2 shows Grid tiles, Layout 5 Glass slabs)

/** One card in the light-band style: the band (its name and figure), then title, list and a button. */
function BandCard({ k, name, fig, unit, title, items, action, wide }: { k: number; name: string; fig: string; unit?: string; title: string; items: string[]; action?: ReactNode; wide?: boolean }) {
  return (
    <div className={cx('lb-card', `lb--${k}`, wide && 'lb-card--wide')}>
      <div className="lb-band">
        <span className="lb-name">{name}</span>
        <span className="lb-fig" role="img" aria-label={`${fig}${unit ?? ''}`}>
          {dotted(fig)}
          {unit && <i>{dotted(unit)}</i>}
        </span>
      </div>
      <div className="lb-body">
        <span className="lb-title">{title}</span>
        <ul className="lb-list">
          {items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {action && <div className="lb-foot">{action}</div>}
      </div>
    </div>
  );
}

function LightBandCards({ webScore, social }: { webScore: number; social: string }) {
  const { state, actions } = useStore();
  const { openRequest } = useUI();
  const b = state.brand;
  const [open, setOpen, box] = usePop();
  const of = Math.round(Math.max(state.creditsTotal, state.credits));
  return (
    <div className="qo qo--band lb">
      <BandCard k={1} name="Instagram · engagement" fig={social} title="Engagement rate" items={['Down 0.4 points since September', 'Still above the 1.9% typical for UAE retail']} action={<a className="lb-btn" href="#/?tab=social">Open report <ArrowRight size={15} aria-hidden /></a>} />
      <BandCard k={2} name="Website · score" fig={String(webScore)} unit="/100" title="Website score" items={['Up 6 since September', 'Mobile speed on 4G, below the 58 typical']} action={<a className="lb-btn" href="#/?tab=website">Open report <ArrowRight size={15} aria-hidden /></a>} />
      <div className="qo-cell" ref={box}>
        <BandCard k={3} name="Your balance · credits" fig={usd(state.credits)} title="Your balance" items={[`Of ${of} credits`, 'Top up when you need more']} action={<button type="button" className="lb-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>Top up <ArrowRight size={15} aria-hidden /></button>} />
        {open && <TopUpPanel onTopUp={actions.topUp} onDone={() => setOpen(false)} />}
      </div>
      <BandCard k={4} name="Dr.AI · any time" fig="24/7" title="Your question. Every angle." items={['Knows your reports and your brand', 'What a figure means, what to fix first']} action={<a className="lb-btn" href="#/assistant">Ask Dr.AI <ArrowRight size={15} aria-hidden /></a>} />
      <BandCard k={5} name="Strategy · consultation" fig="45" unit=" min" title="Book a consultation" items={['With the strategist who wrote your reports']} action={<button type="button" className="lb-btn" onClick={() => openRequest({ type: 'Strategy', title: 'Consultation on the brand analysis' })}>Book <ArrowRight size={15} aria-hidden /></button>} />
      <BandCard k={6} wide name="Company profile" fig={b.founded.split(',')[0]} title="Your brand, at a glance." items={['Everyday products', `Dubai, since ${b.founded.split(',')[0]}`, '14 UAE stores', '60 partner retailers', 'Online store', 'Bilingual voice']} />
    </div>
  );
}

// Layout 5 · Brand analysis (13 Nov, review): Home under the band is the analysis of the client's brand, in the site's
// one style (sparkstudios.ae's .gcard: white milky glass, Ink, only Cobalt and Ember, every figure in Doto). The client
// asked for the website report, the social media report and charts; credits are left out ("a template card, we don't
// know the client needs them"). Read in order: 01 what Spark found, in one sentence, then the two reports with their
// charts; 02 what needs changing, the fixes in order of weight (each can be taken up with Spark), and what already
// works; 03 the next step, a consultation with the strategist who wrote it, Dr.AI as the second way in. The sections are
// labelled as the site labels its steps: a dotted Ember number and Cobalt mono capitals.
function SiteLabel({ n, children }: { n: string; children: ReactNode }) {
  return (
    <h2 className="sc-label">
      <b>{n}</b> {children}
    </h2>
  );
}
function SiteFig({ fig, unit }: { fig: string; unit?: string }) {
  return (
    <span className="sc-fig" role="img" aria-label={`${fig}${unit ? ` ${unit}` : ''}`}>
      <b>{dotted(fig)}</b>
      {unit && <i>{unit}</i>}
    </span>
  );
}
/** Six months in one Cobalt line, the typical value dotted across with its label, this month's point in Ember. */
function SiteLine({ months, typical, label }: { months: number[]; typical: number; label: string }) {
  const vals = [...months, typical];
  const lo = Math.min(...vals), hi = Math.max(...vals), pad = (hi - lo) * 0.2 || 1;
  const W = 320, H = 92;
  const y = (v: number) => H - 6 - ((v - (lo - pad)) / (hi + pad - (lo - pad))) * (H - 12);
  const x = (i: number) => 6 + (i * (W - 12)) / (months.length - 1);
  const pts = months.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const lx = x(months.length - 1), ly = y(months[months.length - 1]);
  const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  return (
    <figure className="sc-chart">
      <svg className="sc-line" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        <line x1="0" x2={W} y1={y(typical)} y2={y(typical)} className="sc-line__typ" />
        <polygon points={`${x(0)},${H} ${pts} ${lx},${H}`} className="sc-line__area" />
        <polyline points={pts} className="sc-line__path" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="sc-line__now" style={{ left: `${(lx / W) * 100}%`, top: `${(ly / H) * 100}%` }} aria-hidden />
      <span className="sc-line__tlabel" style={{ top: `${(y(typical) / H) * 100}%` }}>
        {label}
      </span>
      <figcaption className="sc-months" aria-hidden>
        {MONTHS.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </figcaption>
    </figure>
  );
}
/** Side by side bars: ours against what's typical or what competitors reach. */
function SiteBars({ rows }: { rows: { label: string; ours: number; ref: number; oursText: string; refText: string; refLabel: string }[] }) {
  return (
    <div className="sc-bars">
      {rows.map((r) => {
        const max = Math.max(r.ours, r.ref) * 1.08;
        return (
          <div key={r.label} className="sc-bars__row">
            <span className="sc-bars__label">{r.label}</span>
            <span className="sc-bars__bar is-ours">
              <i style={{ width: `${(r.ours / max) * 100}%` }} />
              <b>{r.oursText}</b>
            </span>
            <span className="sc-bars__bar is-ref">
              <i style={{ width: `${(r.ref / max) * 100}%` }} />
              <b>
                {r.refText} <em>{r.refLabel}</em>
              </b>
            </span>
          </div>
        );
      })}
    </div>
  );
}

const IMPACT: Record<string, { label: string; cls: string }> = {
  High: { label: 'Fix first', cls: 'is-high' },
  Medium: { label: 'Next', cls: 'is-mid' },
  Low: { label: 'Later', cls: 'is-low' },
};
const SOURCE: Record<string, string> = { website: 'Website', social: 'Social media', brand: 'Brand' };

function SiteCards({ webScore, social }: { webScore: number; social: string }) {
  const { state } = useStore();
  const { openRequest } = useUI();
  const web = analyses.find((a) => a.kind === 'website');
  const soc = analyses.find((a) => a.kind === 'social');
  const brand = analyses.find((a) => a.kind === 'brand');
  const author = state.people.find((p) => p.id === (brand?.reviewedBy ?? 's-youssef'));
  // the fixes from all three analyses, heaviest first
  const order = { High: 0, Medium: 1, Low: 2 } as Record<string, number>;
  const fixes = analyses
    .flatMap((a) => (a.findings ?? []).filter((f) => !f.good && f.impact).map((f) => ({ ...f, kind: a.kind })))
    .sort((x, y) => order[x.impact ?? 'Low'] - order[y.impact ?? 'Low'])
    .slice(0, 4);
  const good = analyses.flatMap((a) => (a.findings ?? []).filter((f) => f.good).map((f) => ({ ...f, kind: a.kind })));
  const [head1, head2] = (brand?.headline ?? 'Clear in stores, lost online').split(', ');
  return (
    <div className="sc">
      <SiteLabel n="01">What Spark found</SiteLabel>
      <div className="sc-lead">
        <p className="sc-lead__title">
          {head1},<br />
          <span>{head2}.</span>
        </p>
        <p className="sc-lead__text">{brand?.summary}</p>
      </div>
      <div className="sc-grid sc-grid--2">
        <a className="sc-card sc-card--report" href="#/?tab=website">
          <span className="sc-kind">Website report</span>
          <span className="sc-title sc-title--lg">{web?.headline}</span>
          <span className="sc-top">
            <SiteFig fig={String(webScore)} unit="/100 mobile speed" />
            <span className="sc-delta is-up">
              <ArrowUpRight size={13} strokeWidth={2.4} aria-hidden />6 since Sep
            </span>
          </span>
          <SiteLine months={[31, 33, 35, webScore - 6, webScore - 3, webScore]} typical={58} label="58 typical" />
          <dl className="sc-stats">
            <div>
              <dt>Product page on 4G</dt>
              <dd>{dotted('6.8')} s</dd>
            </div>
            <div>
              <dt>Pages reviewed</dt>
              <dd>{dotted('23')}</dd>
            </div>
            <div>
              <dt>Time on a product page</dt>
              <dd>{dotted('2:40')}</dd>
            </div>
          </dl>
          <span className="sc-link">
            Open the website report <ArrowRight size={15} aria-hidden />
          </span>
        </a>
        <a className="sc-card sc-card--report" href="#/?tab=social">
          <span className="sc-kind">Social media report</span>
          <span className="sc-title sc-title--lg">{soc?.headline}</span>
          <span className="sc-top">
            <SiteFig fig={social} unit="engagement, Instagram" />
            <span className="sc-delta is-down">
              <ArrowDownRight size={13} strokeWidth={2.4} aria-hidden />0.4 since Sep
            </span>
          </span>
          <SiteBars
            rows={[
              { label: 'Instagram engagement', ours: 4, ref: 1.9, oursText: '4%', refText: '1.9%', refLabel: 'typical, UAE retail' },
              { label: 'TikTok views a video', ours: 2, ref: 40, oursText: 'under 2K', refText: '20–60K', refLabel: 'competitors' },
            ]}
          />
          <dl className="sc-stats">
            <div>
              <dt>Followers</dt>
              <dd>{dotted('38')}K</dd>
            </div>
            <div>
              <dt>Posts read</dt>
              <dd>{dotted('412')}</dd>
            </div>
            <div>
              <dt>Reply to comments</dt>
              <dd>{dotted('26')} h</dd>
            </div>
          </dl>
          <span className="sc-link">
            Open the social media report <ArrowRight size={15} aria-hidden />
          </span>
        </a>
      </div>

      <SiteLabel n="02">What needs attention</SiteLabel>
      <div className="sc-grid">
        <div className="sc-card sc-card--fixes">
          <ol className="sc-fixes">
            {fixes.map((f) => {
              const imp = IMPACT[f.impact ?? 'Low'];
              return (
                <li key={f.title} className="sc-fix">
                  <span className={cx('sc-imp', imp.cls)}>{imp.label}</span>
                  <span className="sc-fix__what">
                    <span className="sc-fix__title">{f.title}</span>
                    <span className="sc-fix__src">{SOURCE[f.kind]}</span>
                  </span>
                  <span className="sc-fix__how">{f.fix}</span>
                  <button type="button" className="sc-fix__go" onClick={() => openRequest({ type: 'Strategy', title: f.title, description: f.fix })}>
                    Take it up with Spark <ArrowRight size={14} aria-hidden />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="sc-card sc-card--good">
          <span className="sc-kind">Working well</span>
          <ul className="sc-good">
            {good.map((g) => (
              <li key={g.title}>
                <Check size={15} strokeWidth={2.4} aria-hidden />
                <span>
                  <b>{g.title}</b>
                  <em>{SOURCE[g.kind]}</em>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <SiteLabel n="03">Next step</SiteLabel>
      <div className="sc-card sc-card--next">
        <span className="sc-next__who">
          {author && <Avatar person={author} size={56} />}
          <span>
            <span className="sc-title sc-title--lg">Go through it with {author?.name.split(' ')[0] ?? 'your strategist'}.</span>
            <span className="sc-text">
              {author?.name}, {author?.title}, wrote your brand analysis. In 45 minutes you decide what to fix first, and Spark
              comes back with a proposal.
            </span>
          </span>
        </span>
        <span className="sc-next__acts">
          <button type="button" className="sc-btn sc-btn--big" onClick={() => openRequest({ type: 'Strategy', title: 'Consultation on the brand analysis' })}>
            <CalendarClock size={16} aria-hidden /> Book a consultation
          </button>
          <a className="sc-link sc-link--plain" href="#/assistant">
            Or ask Dr.AI about any finding <ArrowRight size={15} aria-hidden />
          </a>
        </span>
      </div>
    </div>
  );
}

function QuickOverview2({ webScore, social, band, keys, l2Cards, cards, hold }: { webScore: number; social: string; band?: boolean; keys?: boolean; l2Cards?: ReactNode; cards?: CardStyle; hold?: boolean }) {
  const { state, me, actions } = useStore();
  const [light] = useLight();
  const [storedCards] = useCardStyle();
  const cardStyle = cards ?? storedCards;
  const lightBand = !!keys && cardStyle === 'tiles';
  const { openRequest } = useUI();
  const b = state.brand;
  const colleagues = state.people.filter((p) => p.org === 'client' && p.id !== me.id);
  const [open, setOpen, box] = usePop();
  const whole = String(Math.floor(state.credits));
  const of = Math.round(Math.max(state.creditsTotal, state.credits));
  return (
    <>
    {/* the page's headline, as sparkstudios.ae sets its own (13 Nov, review): a short line in Bold, its last words in
        Cobalt ("…seen in the right light."); no greeting, Dr.AI's chat greets */}
    {band && keys && cardStyle === 'scenes' ? (
      <OpenHead />
    ) : band ? (
      // Layout 4 (13 Nov, review): the brand as a dark band across the top of the page, comets flying over it the
      // whole width, the company's data on the left, the glass shape on the right; the dashboard's cards under it
      // Grid tiles (13 Nov, review: "the Brand Co. section light too, with the glass shapes turning into one another"):
      // the same band in light, the loop rendered on white multiplied onto it
      <header className={cx('qb', lightBand && 'qb--light')}>
        {/* not comets (13 Nov, review: "we have no comets in the product, we have light"): the brand's light as on
            Layout 3's card, a fan of the spectrum from the band's top left corner falling on the glass, with a few
            quiet glints drifting inside the beam */}
        <span className="qb__light" aria-hidden>
          <span className="qb__beam" />
        </span>
        {!lightBand && <SpeedLines className="qb__motes" quiet />}
        {/* Grid tiles, second pass (13 Nov, review): no eyebrow, no glass shape; the name with its key, the words
            right under it, then the figures with the team on the same row at the right */}
        <div className={cx('qb__in', lightBand && 'qb__in--solo')}>
          <div className="qb__text">
            {!lightBand && <span className="qb__eyebrow">Your brand · {b.category}</span>}
            {lightBand ? (
              // the company's mark as one of the site's glass keys, its first letter on it, as sparkstudios.ae sets
              // S·P·A·R·K on theirs (13 Nov, review)
              <span className="qb__named">
                {/* the company's mark on Spark's blue glass key again (13 Nov, review: "the avatar as before, blue as
                    the key"), its initial on it */}
                <span className="qb__key" aria-hidden>
                  <img src="brand/plates/s.webp" alt="" />
                  <b>{b.name[0]}</b>
                </span>
                {/* the words under the name, beside the key (13 Nov, review) */}
                <span className="qb__namecol">
                  <h1 className="qb__title">{b.name}</h1>
                  <p className="qb__body">
                    {b.positioning} {b.reach}
                  </p>
                </span>
              </span>
            ) : (
              <>
                <h1 className="qb__title">{b.name}</h1>
                <p className="qb__body">
                  {b.positioning} {b.reach}
                </p>
              </>
            )}
            <div className={cx(lightBand && 'qb__factsrow')}>
            <dl className="qb__facts">
              {[
                ['Since', b.founded.split(',')[0]],
                ['Stores', '14'],
                ['Partners', '60'],
                ...(lightBand ? [] : [['Home', 'Dubai']]), // Grid tiles: no Home (13 Nov, review)
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  {/* figures in the dotted face (13 Nov, review); a word stays in the plain one */}
                  <dd className={/^\d/.test(v) ? 'is-num' : undefined}>{v}</dd>
                </div>
              ))}
            </dl>
            <a className="qo-team qb__team" href="#/team?from=home">
              <span className="bx-co__faces" aria-hidden>
                {(colleagues.length ? colleagues : [me]).slice(0, 3).map((p) => (
                  <Avatar key={p.id} person={p} size={26} ring />
                ))}
                <span className="bx-co__invite">+</span>
              </span>
              <span className="qo-team__text">
                {b.name} team · {colleagues.length ? `you and ${colleagues.length} colleague${colleagues.length === 1 ? '' : 's'}` : 'just you so far'}
              </span>
              <ArrowRight className="qo-team__go" size={15} aria-hidden />
            </a>
            </div>
          </div>
          {/* the glass shapes back, small, in the top right corner (13 Nov, review) */}
          {!lightBand && (
            <span className="qb__art" aria-hidden>
              {/* Layout 5: Spark's four shapes in Blender glass (13 Nov, review); Layout 4: the live chrome */}
              {keys ? <MorphVideo className="qb__video" /> : <ShapeMorph className="qb__shape" />}
            </span>
          )}
        </div>
      </header>
    ) : (
    <header className="qo-head">
      <h1 className="qo-head__title">
        Your brand, <span>in the right light.</span>
      </h1>
    </header>
    )}
    {/* Grid tiles (13 Nov, review: "the cards the same as Layout 2's"): Layout 2's own cards under the light band */}
    {keys && cardStyle === 'tiles' && l2Cards ? (
      l2Cards
    ) : keys && (cardStyle === 'results' || cardStyle === 'tiles' || cardStyle === 'slabs' || cardStyle === 'scenes') ? (
      <VariantCards variant={cardStyle} webScore={webScore} social={social} />
    ) : keys && cardStyle === 'site' ? (
      <SiteCards webScore={webScore} social={social} />
    ) : keys && cardStyle === 'bands' ? (
      <LightBandCards webScore={webScore} social={social} />
    ) : (
    <div className={cx('qo', band && 'qo--band', keys && 'qo--keys')}>
      {/* not a link (13 Nov, review): only the team line in it is; none in Layout 4, the band above is the company */}
      {!band && (
      <div className="qo-card qo-card--feature">
        {/* the light in the company's card: First v1's beam, Narrow Static or Narrow Dynamic on the LIGHT switch */}
        <span className={cx('qo-light qo-light--v1', light === 'focus' ? 'qo-light--focus' : 'qo-light--narrow')} aria-hidden>
          {/* the beam, and over it, turning with it, an orange beam out to the middle of the avatar (13 Nov, review:
              "the orange reaching the B", then "only to half of it") */}
          <span className="qo-v1">
            {light === 'focus' ? (
              // focus: the cone as seven rays of its colours, held at their narrowest (13 Nov, review)
              <span className="qo-v1__fan">
                {FAN.map((c, i) => (
                  <i key={c} style={{ ['--k' as string]: i - 3, ['--col' as string]: c }} />
                ))}
              </span>
            ) : (
              // the beam's sides drawn inside, so the blur softens them (13 Nov, review: the tip was too sharp)
              <span className="qo-v1__flow">
                <i />
              </span>
            )}
            <span className="qo-v1__beam" />
            {/* two shorter rays (13 Nov, review): light blue beside the blue, light yellow beside the orange */}
            <span className="qo-v1__beam qo-v1__beam--sky" />
            <span className="qo-v1__beam qo-v1__beam--sun" />
          </span>
        </span>
        <span className="qo-text">
          {/* the company's avatar, simply (13 Nov, review: the 3D tile read as a monument): its initial on clear glass
              with a fine white rim, tinted by whatever light falls on it; no "Your company" label over the name */}
          <span className="qo-mark qo-mark--clear" aria-hidden>
            {b.name[0]}
          </span>
          <span className="qo-title qo-title--xl">{b.name}</span>
          <span className="qo-body">
            {b.positioning} {b.reach}
          </span>
          <a className="qo-team" href="#/team?from=home">
            <span className="bx-co__faces" aria-hidden>
              {(colleagues.length ? colleagues : [me]).slice(0, 3).map((p) => (
                <Avatar key={p.id} person={p} size={26} ring />
              ))}
              <span className="bx-co__invite">+</span>
            </span>
            <span className="qo-team__text">
              {b.name} team · {colleagues.length ? `you and ${colleagues.length} colleague${colleagues.length === 1 ? '' : 's'}` : 'just you so far'}
            </span>
            <ArrowRight className="qo-team__go" size={15} aria-hidden />
          </a>
        </span>
      </div>
      )}
      {/* Instagram first, the website's gauge beside the balance (13 Nov, review) */}
      {/* is it good? (13 Nov, review: "I can't tell whether 3.4% or 41 is good"): the change since September in the
          corner, an arrow up in green or down in red, and the line saying where it stands against what's typical */}
      {/* no link for now (13 Nov, review): a click on a card leads nowhere yet, here and on Dr.AI and the profile */}
      <div className="qo-card qo-card--stat qo-card--still qk--r">
        {keys && <KeyHead tone="r" icon={Heart} label="Instagram" />}
        <Trend up={false} text="0.4 since Sep" label="Down 0.4 points since September" />
        {/* the figure in a box as tall as the website's ring, its digits level with the 41 (13 Nov, review: the two
            titles and lines on one level) */}
        <span className="qo-figbox">
          <Fig fig={social} />
        </span>
        {/* one line (13 Nov, review): the metric as the title, Instagram in the line under it */}
        <span className="qo-title">Engagement rate</span>
        <span className="qo-line">Instagram, still above the 1.9% typical for UAE retail</span>
      </div>
      <div className="qo-card qo-card--stat qo-card--still qk--s">
        {keys && <KeyHead tone="s" icon={Globe} label="Website" />}
        <Trend up text="6 since Sep" label="Up 6 since September" />
        <ScoreGauge value={webScore} />
        <span className="qo-title">Website score</span>
        <span className="qo-line">Mobile speed on 4G, below the 58 typical</span>
      </div>
      <div className="qo-cell" ref={box}>
        <button type="button" className="qo-card qo-card--credits qk--k" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {keys ? <KeyHead tone="k" icon={Wallet} label="Your balance" /> : <span className="qo-eyebrow">Your balance</span>}
          <span className="bx-credcard__line">
            <b className="bx-credits__fig" role="img" aria-label={`${whole} of ${of} credits`}>
              {whole}
            </b>
          </span>
          {/* how much of the balance is left (13 Nov, review: an indicator, so the card is as full as Dr.AI's) */}
          <span className="bx-credcard__bar qo-meter" aria-hidden>
            <span style={{ width: `${Math.min(100, (state.credits / of) * 100)}%` }} />
          </span>
          <span className="qo-line">Top up when you need more</span>
        </button>
        {open && <TopUpPanel onTopUp={actions.topUp} onDone={() => setOpen(false)} />}
      </div>
      <div className="qo-card qo-card--ai qo-card--still qk--a">
        {/* Sparki alive at the card's corner (13 Nov, review): he shows up, lets his light out in a few sparks, slips
            away, and turns up again a little further along */}
        <span className="qo-sparki" aria-hidden>
          <span className="qo-sparki__spot">
            <span className="qo-sparki__me">
              <SparkiStill size={56} />
            </span>
            <i />
            <i />
            <i />
            <i />
          </span>
        </span>
        {keys ? <KeyHead tone="a" icon={Sparkles} label="Dr.AI" /> : <span className="qo-eyebrow">Dr.AI</span>}
        {/* not "Bring your question to light." under the page's "…in the right light." (13 Nov, review: too much light
            on one page); the brand book's prism instead: one human question in, every angle out, in its two-short-
            sentence form ("One idea. Every format.", Brand Guidelines V3 pp. 5, 19) */}
        <span className="qo-title">Your question. Every angle.</span>
        {/* the cards' one description size (13 Nov, review), and a little more to say, so the card is full */}
        <span className="qo-line">
          He knows your reports and your brand. Ask what a figure means, what to fix first or how a post should sound, any
          time.
        </span>
      </div>
      {/* `hold`: the consultation isn't booked from here yet (13 Nov, review: Glass first, then Overview too — the
          page isn't ready, and the window that opened on the card had nowhere to go) */}
      <button type="button" className="qo-card qo-card--accent qk--s" onClick={hold ? undefined : () => openRequest({ type: 'Strategy', title: 'Consultation on the brand analysis' })}>
        {keys ? <KeyHead tone="s" icon={CalendarClock} label="Strategy" /> : <img className="qo-icon" src="brand/glass/glass-grid.webp" alt="" />}
        <span className="qo-title">Book a consultation</span>
        <span className="qo-line">45 minutes with the strategist who wrote your reports</span>
      </button>
      <div className={cx('qo-card qo-card--wide qo-card--still qk--p', band && 'qo-card--wider')}>
        {keys ? <KeyHead tone="p" icon={Building2} label="Company profile" /> : <span className="qo-eyebrow">Company profile</span>}
        <span className="qo-title">Your brand, at a glance.</span>
        <ul className="qo-chips">
          {['Everyday products', `Dubai, since ${b.founded.split(',')[0]}`, '14 UAE stores', '60 partner retailers', 'Online store', 'Bilingual voice'].map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </div>
    )}
    </>
  );
}

// Layout 6's top as one section (13 Nov, review: "two bright colours, an empty space on the right; one section, not so
// dark; the feeling it all belongs together"; One panel picked over the cards and the nested tiles): the company across
// its top, the balance and the consultation under a hairline, side by side. Ember only as an accent.
/** Layout 6's top as one light section: the company (its mark a pane of clear glass), its balance, the consultation. */
/** Layout 6's balance (13 Nov, review: "make the credits more expressive; no Top up button, clicking the credits will
 *  have it: an arrow, and on hover a whole overlay to top up"; "write 100: when they come in they haven't spent on
 *  any report yet, all we show them is free for now"). The figure large in Doto, a line that says nothing is spent,
 *  an arrow; the top-up panel opens over the page while the pointer rests on the balance (or on a click of the
 *  arrow, for a keyboard or a touch). */
function BalanceHover() {
  const { state, actions } = useStore();
  const [open, setOpen, box] = usePop();
  const [added, setAdded] = useState<number | null>(null);
  const timer = useRef<number>();
  const balance = Math.floor(state.credits);
  const hold = (v: boolean, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(v), ms);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <div
      className={cx('hx-top__cell hx-bal bx-credcard', open && 'is-open')}
      ref={box}
      onMouseEnter={() => hold(true, 120)}
      onMouseLeave={() => hold(false, 260)}
    >
      <span className="hx-bal__glow" aria-hidden />
      <span className="hx-top__stack">
        <span className="hx-top__eyebrow">Your balance</span>
        <span className="hx-bal__fig">
          <b className="bx-credits__fig" role="img" aria-label={`${balance} credits`}>
            {balance}
          </b>
          <span className="hx-bal__unit" aria-hidden>
            credits
          </span>
        </span>
        <span className="hx-bal__line">{added ? `+${added} added. Thank you.` : 'Nothing spent yet. Your first reports are on us.'}</span>
      </span>
      <button
        type="button"
        className="hx-bal__go"
        aria-label="Top up credits"
        aria-expanded={open}
        onClick={() => {
          window.clearTimeout(timer.current);
          setOpen((o) => !o);
        }}
      >
        <ArrowUpRight size={18} strokeWidth={2} />
      </button>
      {open && <TopUpPanel onTopUp={actions.topUp} onDone={(n) => (setAdded(n), setOpen(false))} />}
    </div>
  );
}

/** The balance, quiet (13 Nov, review, Layouts 7 and 8: "compact, not a section that draws the eye; clear it's your
 *  balance"; then "balance in small letters, under it 100 credits in the plain face, a small chevron"): no pill, two
 *  lines at the right of the head; the top-up panel opens while the pointer rests on it (or on a click). */
/** Our Health head's balance (17 Nov, after the Console concept's account bar): "Balance" in the mono face, the
 *  amount, and a small round plus in place of Top up, which turns a quarter on hover and opens the top-up panel. */
export function BalancePlus() {
  const { state, actions } = useStore();
  const [open, setOpen, box] = usePop();
  const [added, setAdded] = useState<number | null>(null);
  const credits = Math.floor(state.credits);
  return (
    <div className={cx('bal-plus bx-credcard', open && 'is-open')} ref={box}>
      <span className="bal-plus__stack">
        <span className="bal-plus__label">Balance</span>
        <span className="bal-plus__val">
          {credits} <i>credits</i>
          {added ? <em> · +{added}</em> : null}
        </span>
      </span>
      <button type="button" className="bal-plus__btn" aria-expanded={open} aria-label="Top up" title="Top up" onClick={() => setOpen((o) => !o)}>
        <Plus size={18} strokeWidth={1.8} aria-hidden />
      </button>
      {open && <TopUpPanel onTopUp={actions.topUp} onDone={(n) => (setAdded(n), setOpen(false))} />}
    </div>
  );
}

export function BalancePill({ inline }: { inline?: boolean } = {}) {
  const { state, actions } = useStore();
  const [open, setOpen, box] = usePop();
  const [added, setAdded] = useState<number | null>(null);
  // Health's top-up is a modal on <body>, outside this pill, so it keeps its own open state: the pill's click-outside
  // would close it on the first click inside it (17 Nov, review: "picking 100 closes it")
  const [modal, setModal] = useState(false);
  // only an admin tops up (17 Nov, review: roles): a member and Spark see the balance, without the plus
  const role = useRoleHere();
  const canTopUp = !inline || role === 'admin';
  const credits = Math.floor(state.credits);
  // the top-up opens on click only, not on hover (17 Nov, review)
  return (
    <div className={cx('bal-pill bx-credcard', inline && 'bal-pill--inline', open && 'is-open')} ref={box}>
      <button
        type="button"
        className="bal-pill__btn"
        aria-expanded={open}
        aria-label={`Balance: ${credits} credits. Top up`}
        onClick={() => (inline ? canTopUp && setModal(true) : setOpen((o) => !o))}
        disabled={inline && !canTopUp}
        title={inline && !canTopUp ? (role === 'spark' ? 'The client’s balance' : 'Your admin tops up credits') : undefined}
      >
        {/* 13 Nov, review: "balance" small, under it "100 credits" in the words' face, a small chevron */}
        {/* Layout 9 (13 Nov, review: "as the name and its caret there, no avatar"): one line, "100 credits" and a caret */}
        {!inline && <span className="bal-pill__label">Balance</span>}
        <span className="bal-pill__val">
          {/* how much is left, at a glance (17 Nov, review): a ring before the figure */}
          {inline && <CreditRing left={state.credits} total={Math.max(state.creditsTotal, state.credits)} size={16} stroke={2.2} />}
          {credits} credits{added ? ` · +${added}` : ''}
          {/* a plain secondary plus in place of the caret (17 Nov, review); it turns on hover */}
          {inline ? (
            canTopUp && <span className="bal-pill__plus" aria-hidden>
              <Plus size={16} strokeWidth={1.8} />
            </span>
          ) : (
            <ChevronDown className="bal-pill__go" size={14} strokeWidth={2.2} aria-hidden />
          )}
        </span>
      </button>
      {/* Health (17 Nov, review): the concepts' Top up modal, as the client liked it (the balance now, the amounts as
          tiles, another amount, the new balance, Top up and Cancel); elsewhere the small panel as before */}
      {open && !inline && <TopUpPanel onTopUp={actions.topUp} onDone={(n) => (setAdded(n), setOpen(false))} />}
      {inline && <HealthTopUp open={modal} balance={state.credits} onClose={() => setModal(false)} onTopUp={(n) => (actions.topUp(n), setAdded(n))} />}
    </div>
  );
}

/** Layout 8's top (13 Nov, review: the earlier "Good afternoon, Layla" Home, "a box like Ask Spark about your brand";
 *  then "the type a little smaller, as Dr.AI's greeting; the credits compact"): the company and the page as a mono
 *  line with the balance at its right, the greeting in Ink and Cobalt, the box to ask Spark across the page. */
function GreetTop() {
  const { state, me, actions } = useStore();
  const [q, setQ] = useState('');
  const h = new Date().getHours();
  const hello = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const first = me.name.split(' ')[0];
  const ask = (e: React.FormEvent) => {
    e.preventDefault();
    const text = q.trim();
    if (!text) return navigate('/assistant');
    navigate(`/assistant/${actions.ask(null, text)}`);
  };
  return (
    <section className="gt" aria-label="Home">
      <div className="gt__row">
        <span className="gt__eyebrow">{state.brand.name} · Home</span>
        <BalancePill />
      </div>
      <h1 className="gt__title">
        {hello}, {first}.<span>Here’s what we found.</span>
      </h1>
      <form className="gt-ask" onSubmit={ask}>
        <input className="gt-ask__input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask Spark about your brand" aria-label="Ask Spark about your brand" />
        <button type="submit" className="gt-ask__send" aria-label="Ask">
          <Send size={17} strokeWidth={2} />
        </button>
        <span className="gt-ask__glow" aria-hidden />
      </form>
    </section>
  );
}

function TopPanel({ noConsult, fresh }: { noConsult?: boolean; fresh?: boolean } = {}) {
  const { state, me, actions } = useStore();
  const { openRequest } = useUI();
  const b = state.brand;
  const [open, setOpen, box] = usePop();
  const [added, setAdded] = useState<number | null>(null);
  const whole = String(Math.floor(state.credits));
  const of = Math.round(Math.max(state.creditsTotal, state.credits));
  const colleagues = state.people.filter((p) => p.org === 'client' && p.id !== me.id);
  // compact (13 Nov, review: "the company part takes most of the screen and holds no real action; the reports and
  // the profile matter more"): one strip, about a third of the height it had. The company with its team, then the
  // balance with Top up, then the consultation in a line with Book; the company's description is in the profile tab
  return (
    <section className={cx('hx-top', noConsult && 'hx-top--two')} aria-label={b.name}>
      <span className="hx-top__light" aria-hidden />
      <div className="hx-top__brand">
        {/* a pane of clear glass, the initial on it (13 Nov, review: not metal) */}
        <span className="hx-top__mark" aria-hidden>
          <b>{b.name[0]}</b>
        </span>
        <span className="hx-top__who">
          <h2 className="hx-top__name">{b.name}</h2>
          <a className="hx-top__team" href="#/team?from=home">
            <span className="bx-co__faces" aria-hidden>
              {(colleagues.length ? colleagues : [me]).slice(0, 3).map((p) => (
                <Avatar key={p.id} person={p} size={22} ring />
              ))}
              <span className="bx-co__invite">+</span>
            </span>
            <span>{colleagues.length ? `You and ${colleagues.length} colleague${colleagues.length === 1 ? '' : 's'}` : 'Just you so far'}</span>
          </a>
        </span>
      </div>
      {fresh ? (
        <BalanceHover />
      ) : (
      <div className="hx-top__cell bx-credcard" ref={box}>
        <span className="hx-top__stack">
          <span className="hx-top__eyebrow">Your balance</span>
          <span className="hx-top__fig">
            <b className="bx-credits__fig" role="img" aria-label={`${whole} of ${of} credits`}>
              {whole}
            </b>
            <span className="hx-top__of" aria-hidden>
              /{of} credits{added ? ` · +${added} added` : ''}
            </span>
          </span>
          <span className="hx-top__bar" aria-hidden>
            <span style={{ width: `${Math.min(100, (state.credits / of) * 100)}%` }} />
          </span>
        </span>
        <button type="button" className="hx-top__btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          Top up
        </button>
        {open && <TopUpPanel onTopUp={actions.topUp} onDone={(n) => (setAdded(n), setOpen(false))} />}
      </div>
      )}
      {!noConsult && (
      <div className="hx-top__cell">
        <span className="hx-top__stack">
          <span className="hx-top__eyebrow">Consultation · 45 min</span>
          <span className="hx-top__line">With the strategist who wrote your reports</span>
        </span>
        <button type="button" className="hx-top__btn" onClick={() => openRequest({ type: 'Strategy', title: 'Consultation on the brand analysis' })}>
          Book
        </button>
      </div>
      )}
    </section>
  );
}

/** Layout 6's tabs, after sparkstudios.ae's menu (13 Nov, review): a white glass pill holding the two in Diatype Mono
 *  capitals, the open one pressed into it; the pressed pill glides to the tab picked, a ghost pill follows the
 *  pointer, as on the site. Lower than the site's (32 px, not 40). */
function HomeTabs({ reports, noProfile }: { reports: ReactNode; noProfile?: boolean }) {
  const [tab, setTab] = useState<'reports' | 'profile'>('reports');
  const [hover, setHover] = useState<'reports' | 'profile' | null>(null);
  const btns = useRef<Record<string, HTMLButtonElement | null>>({});
  const [, force] = useState(0);
  useEffect(() => {
    // fonts settle after the first paint: measure again then
    document.fonts?.ready.then(() => force((n) => n + 1));
  }, []);
  const tabs: { id: 'reports' | 'profile'; label: string }[] = [
    { id: 'reports', label: 'Reports' },
    { id: 'profile', label: 'Company profile' },
  ];
  const at = (id: string | null): CSSProperties => {
    const b = id ? btns.current[id] : null;
    return b ? { transform: `translateX(${b.offsetLeft}px)`, width: b.offsetWidth } : {};
  };
  // Health (17 Nov, review): the profile opens from the head's button, so no tabs here, the reports alone
  if (noProfile) return <div className="hx-panel">{reports}</div>;
  return (
    <>
      <div className="hx-tabs" role="tablist" aria-label="Home sections" onMouseLeave={() => setHover(null)}>
        <span className={cx('hx-glide hx-glide--ghost', hover && hover !== tab && 'is-shown')} style={at(hover)} aria-hidden />
        <span className="hx-glide hx-glide--on is-shown" style={at(tab)} aria-hidden />
        {tabs.map((t) => (
          <button
            key={t.id}
            ref={(el) => {
              btns.current[t.id] = el;
            }}
            type="button"
            role="tab"
            id={`hx-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`hx-panel-${t.id}`}
            className={cx('hx-tab', tab === t.id && 'is-active')}
            onMouseEnter={() => setHover(t.id)}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'reports' ? (
        <div className="hx-panel" role="tabpanel" id="hx-panel-reports" aria-labelledby="hx-tab-reports">
          {reports}
        </div>
      ) : (
        <div className="hx-panel" role="tabpanel" id="hx-panel-profile" aria-labelledby="hx-tab-profile">
          <ProfileSection />
        </div>
      )}
    </>
  );
}

/** The company profile as a section to read (Layout 6): what the company is, who it sells to, how it speaks. */
/** `only` shows one of its three parts (17 Nov, review: the profile drawer's tabs). */
function ProfileSection({ only }: { only?: 'company' | 'audience' | 'voice' } = {}) {
  const { state } = useStore();
  const b = state.brand;
  const facts: [string, string][] = [
    ['Category', b.category],
    ['Founded', b.founded],
    ['Head office', b.hq],
    ['Where it sells', b.footprint],
    ['Website', b.website],
  ];
  return (
    <>
      {(!only || only === 'company') && (
      <section className="hx-prof">
        <span className="hx-prof__label">The company</span>
        <h3 className="hx-prof__title">{b.tagline}</h3>
        <p className="hx-prof__body">
          {b.positioning} {b.reach}
        </p>
        <dl className="hx-prof__facts">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      )}
      {(!only || only === 'audience') && (
      <section className="hx-prof">
        <span className="hx-prof__label">Who it sells to</span>
        <h3 className="hx-prof__title hx-only-drawer">Who buys from {b.name}</h3>
        <p className="hx-prof__body hx-only-drawer">The people Spark plans campaigns for.</p>
        <ul className="hx-prof__list">
          {b.audiences.map((a) => (
            <li key={a.name}>
              <b>{a.name}</b>
              <span>{a.detail}</span>
            </li>
          ))}
        </ul>
      </section>
      )}
      {(!only || only === 'voice') && (
      <section className="hx-prof">
        <span className="hx-prof__label">How it speaks</span>
        {/* in the drawer (17 Nov, review: "all in a heap"): two parts with their own titles, the voice as numbered rows */}
        <h3 className="hx-prof__title hx-only-drawer">Tone of voice</h3>
        <p className="hx-prof__body hx-only-drawer">The rules Spark writes by, for every post, page and campaign.</p>
        <ul className="hx-prof__voice">
          {b.voice.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
        <span className="hx-prof__label hx-prof__label--sub">Up against</span>
        <h3 className="hx-prof__title hx-only-drawer hx-prof__title--next">Up against</h3>
        <p className="hx-prof__body hx-only-drawer">Who people compare {b.name} with.</p>
        <ul className="hx-prof__voice hx-prof__voice--quiet">
          {b.competitors.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      </section>
      )}
    </>
  );
}

export function readHomeLook(): HomeLook {
  try {
    const v = localStorage.getItem(HOME_LOOK_KEY);
    // Bold glass unless another look was picked (13 Nov); the dropped Bold, Grid draft and old Main land on it
    // the old Layout 2 (boldGlass) opens as the new one; Layout 2 is where Home opens
    // Layout 4 (brand) off the switch (13 Nov, review): a browser that kept it opens on Layout 2
    // Reports carousel (layout2) off the switch too (13 Nov, review)
    return (HOME_ON_SWITCH as string[]).includes(v ?? '') ? (v as HomeLook) : HOME_ON_SWITCH[0];
  } catch {
    return 'boldGlass';
  }
}
const homeRootClass = (look: HomeLook) =>
  cx('bx bx--sand bx--page', look !== 'current' && look !== 'tabs' && look !== 'brief' && look !== 'dash' && look !== 'greet' && look !== 'health' && look !== 'healthSide' && look !== 'healthBar' && 'bx--bold', (look === 'tabs' || look === 'brief' || look === 'dash' || look === 'greet' || look === 'health' || look === 'healthSide' || look === 'healthBar') && 'bx--tabs', look.startsWith('layout') && 'bx--layout', look === 'layout2' && 'bx--dots', look === 'layout2' && 'bx--refined', look === 'boldGlass' && 'bx--glassbook');

/** The company card alone, for Home while a company is still onboarding (13 Nov, review: the old card there is
 *  replaced by the one Current's Home has), in the look Home is set to, with the HERO switch to try its grounds. */
export function HomeCompanyCard() {
  const { state, actions } = useStore();
  const look = readHomeLook();
  const [heroLook] = useHeroLook();
  return (
    <div className={cx(homeRootClass(look), 'bx--solo', `bx--hero-${heroLook}`)}>
      <SpectrumDefs />
      {SHOW_HOME_SWITCH && <HeroLookSwitch />}
      <div className="bx-grid bx-grid--doto">
        <CompanyHero credits={state.credits} total={state.creditsTotal} onTopUp={actions.topUp} metal hero={HERO_PICKED} />
      </div>
    </div>
  );
}

/** The one review switch (13 Nov, review: "only switches between the versions; Empty states as a version too"):
 *  the four Home looks by name, then Empty states, the page of every empty state. Shown on Home and on that page, so
 *  either leads back to the other. */
export function HomeSwitch({ current, onPick }: { current: HomeLook | 'empty' | 'console' | 'studio' | 'onboarding'; onPick?: (l: HomeLook) => void }) {
  const { state, actions } = useStore();
  if (!SHOW_HOME_SWITCH) return null;
  // while the portal shows a new company, Onboarding is the one on; leaving it brings the full demo back
  const on = state.onboarding ? 'onboarding' : current;
  const pick = (l: HomeLook) => {
    if (state.onboarding) {
      actions.reset();
      actions.seeIntro();
    }
    if (onPick) return onPick(l);
    try {
      localStorage.setItem(HOME_LOOK_KEY, l);
    } catch {
      /* this visit only */
    }
    navigate('/');
  };
  return (
    <div className="ui-switch ui-switch--home" role="group" aria-label="Home look">
      {/* what it switches: where you pick the brand (18 Nov, review: "it isn't Home, it's how brands are shown") */}
      <span className="ui-switch__label">Brand switch</span>
      {SWITCH_ORDER.map((v) =>
        typeof v === 'string' ? (
          <button key={v} type="button" aria-pressed={on === v} className={cx(on === v && 'is-on')} onClick={() => pick(on === v ? 'health' : v)}>
            {HOME_LOOK_NAMES[v]}
          </button>
        ) : (
          <button
            key={v.id}
            type="button"
            aria-pressed={on === v.id}
            // Onboarding isn't a way to switch brands: set apart after a rule
            className={cx(on === v.id && 'is-on', v.id === 'onboarding' && 'ui-switch__apart')}
            onClick={() => {
              // pressed again, Onboarding gives the full demo back on Health
              if (v.id === 'onboarding' && on === 'onboarding') return pick('health');
              if (v.id === 'onboarding') {
                if (!state.onboarding) actions.startOnboarding();
                navigate('/');
                return;
              }
              navigate(v.to);
            }}
          >
            {v.name}
          </button>
        ),
      )}
    </div>
  );
}

/** No version leaves Home yet (13 Nov, review: "no redirects to other pages, they aren't ready" — Health and Glass
 *  first, then Overview's consultation and its team row): a
 *  card still answers the pointer and still opens what lives on the page (the top-up, the consultation, the tabs),
 *  but a link to another page is held. Take this off and the links work again. */
function holdLinks(e: React.MouseEvent) {
  const el = e.target as HTMLElement;
  // the consultation doesn't open yet either (13 Nov, review: "Book a consultation has no page yet"): its card, its
  // times and its button are held, and React's own click never runs
  const book = el.closest?.('.bx-consult-glance, .bx-book, .qo-card--accent, .cg-slot, .db-book, .br-float');
  if (book || /consultation/i.test(el.closest?.('button, a')?.textContent ?? '')) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  const a = el.closest?.('a[href]');
  if (!a) return;
  const href = a.getAttribute('href') ?? '';
  // in-page anchors (#foo) and outside links are left alone; the portal's own routes (#/…) are held
  if (!href.startsWith('#/')) return;
  // the team opens now (18 Nov, review: "the way to the team must be clickable")
  if (href.startsWith('#/team')) return;
  e.preventDefault();
}

export function HomeBentoC() {
  const { state, actions } = useStore();
  const [reportCard] = useReportCard();
  const tiltRoot = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState<HomeLook>(readHomeLook);
  const [heroLook] = useHeroLook();
  const l2Tiles = look === 'brandTiles';
  const pickLook = (l: HomeLook) => {
    setLook(l);
    try {
      localStorage.setItem(HOME_LOOK_KEY, l);
    } catch {
      /* this visit only */
    }
  };
  // picked 12 Nov: the Consultation card in Cobalt, the reports on a Shelf (the other looks' code stays, unused)
  const consult: ConsultLook = 'cobalt';
  const reports = 'shelf' as ReportsLook;
  const web = analyses.find((a) => a.kind === 'website');
  const social = analyses.find((a) => a.kind === 'social');
  const webScore = parseInt(web?.score?.value ?? '41', 10);
  const tiles: Tile[] = [
    { kind: 'ready', id: 'web', eyebrow: 'Website report', title: 'Website score', meta: { up: true, text: '+6 since September' }, fig: String(webScore), unit: '/100', href: '#/?tab=website' },
    { kind: 'ready', id: 'social', eyebrow: 'Social media report', title: 'Instagram engagement', meta: { up: false, text: '−0.4 pt since September' }, fig: social?.score?.value ?? '4%', href: '#/?tab=social' },
    ...LOCKED.map((r): Tile => ({ kind: 'locked', id: r.id, eyebrow: r.eyebrow, title: r.title, meta: { text: `Ready in about 3 days · USD ${r.price}` }, fig: r.teaser[0], price: r.price })),
  ];
  const ready: Ready[] = [
    {
      id: 'web',
      eyebrow: 'Website report',
      title: 'Website score',
      line: 'Mobile speed on 4G.',
      delta: { up: true, text: '+6 since September' },
      fig: String(webScore),
      unit: '/100',
      href: '#/?tab=website',
      months: [31, 33, 35, webScore - 6, webScore - 3, webScore],
      typical: { value: 58, label: 'Typical' },
      fmt: (n) => String(Math.round(n)),
    },
    {
      id: 'social',
      eyebrow: 'Social media report',
      title: 'Instagram engagement',
      line: 'Still above 1.9%, typical for UAE retail.',
      delta: { up: false, text: '−0.4 pt since September' },
      fig: social?.score?.value ?? '4%',
      href: '#/?tab=social',
      months: [4.7, 4.5, 4.4, 4.4, 4.2, 4],
      typical: { value: 1.9, label: 'Typical' },
      fmt: (n) => `${n.toFixed(1)}%`,
    },
  ];
  const tileNodes = tiles.map((t) => <ReportTile key={t.id} t={t} credits={state.credits} onBuy={actions.spend} />);
  const webStat = (
    <Stat fig={String(webScore)} unit="/100" title="Website score" line="Mobile speed on 4G" delta={{ up: true, text: '+6 since September' }} href="#/?tab=website" cta="Open report" />
  );
  const socialStat = (
    <Stat
      fig={social?.score?.value ?? '4%'}
      title="Instagram engagement"
      line="vs 1.9% typical for UAE retail"
      delta={{ up: false, text: '−0.4 pt since September' }}
      tint="ember"
      href="#/?tab=social"
      cta="Open report"
    />
  );
  return (
    // the HERO look on the page too (13 Nov, review): Edges turns Home's secondary buttons Cobalt and the Dr.AI card
    // milky, Orb dresses the Dr.AI card as sparkstudios.ae's "Let's talk"
    <div
      className={cx(homeRootClass(look), (l2Tiles || (look !== 'qo2' && !isBand(look))) && `bx--hero-${heroLook}`, isBand(look) && 'bx--brandband', l2Tiles && 'bx--glassbook')}
      ref={tiltRoot}
      onClickCapture={holdLinks}
    >
      {(look === 'boldGlass' || l2Tiles) && <CardTilt root={tiltRoot} />}
      {(look === 'qo2' || isBand(look)) && <CardTilt root={tiltRoot} sel=".qo-card:not(.qo-card--feature)" />}
      {/* no LIGHT switch (13 Nov, review: only the switch between the versions); the light picked last stays */}
      <SpectrumDefs />
      {/* no HERO in Quick overview 2 (13 Nov, review): its company card is its own layout, not the hero's grounds */}
      {/* no HERO on Layout 6 (13 Nov, review): its top is the one light section, not the hero */}
      {SHOW_HOME_SWITCH && look !== 'qo2' && look !== 'tabs' && look !== 'brief' && look !== 'dash' && look !== 'greet' && look !== 'health' && look !== 'healthSide' && look !== 'healthBar' && !isBand(look) && <HeroLookSwitch />}
      {SHOW_HOME_SWITCH && <HomeSwitch current={look} onPick={pickLook} />}
      {look === 'qo2' || isBand(look) ? (
        <QuickOverview2
          hold
          webScore={webScore}
          social={social?.score?.value ?? '4%'}
          band={isBand(look)}
          keys={look === 'brandKeys' || look === 'brandTiles'}
          cards={cardsOf(look)}
          l2Cards={
            <>
            {/* on top (13 Nov, review): the balance and the company profile as Layout 1 draws them, a row of their own */}
            <div className="bx-grid bx-grid--doto bx-grid--first bx-grid--l2top">
              <div className="bx-firstrow bx-firstrow--two">
                <CreditsCard credits={state.credits} total={state.creditsTotal} onTopUp={actions.topUp} />
                <ProfileCard tags />
                <ConsultGlance />
              </div>
            </div>
            <div className="bx-grid bx-grid--doto bx-grid--l2">
              {/* the figures together (13 Nov, review: "add the balance card"): the two reports and the balance; the
                  profile card left out here, the band above says the same */}
              <div className="bx-row1">
                {webStat}
                {socialStat}
                {/* Dr.AI in the reports' row, built as they are (13 Nov, review) */}
                <AskStat />
              </div>
            </div>
            </>
          }
        />
      ) : look.startsWith('layout') ? (
        <div className="bx-grid bx-grid--doto">
          <CompanyHero credits={state.credits} total={state.creditsTotal} onTopUp={actions.topUp} metal hero={HERO_PICKED} />
          {(() => {
            const pair = (
              <section className="bx-pair-sec" key="pair" aria-label="Your brand & plan">
                {/* named as the reports are, so it's clear what the two cards are about (12 Nov, review) */}
                <h2 className="bx-section">Your brand &amp; plan</h2>
                <div className="bx-pair">
                  <ProfileCard pair />
                  <BookCard c solid={consult} />
                </div>
              </section>
            );
            const reportsEl =
              reports === 'shelf' ? (
                <Shelf key="reports" title="Your reports">{tileNodes}</Shelf>
              ) : reports === 'focus' ? (
                <Focus key="reports" title="Your reports">{tileNodes}</Focus>
              ) : (
                <Carousel key="reports" title="Your reports">{tileNodes}</Carousel>
              );
            // both layouts (12 Nov, review): the reports first, under the company; the profile and consultation after
            return [reportsEl, pair];
          })()}
        </div>
      ) : (
      look === 'health' || look === 'healthSide' || look === 'healthBar' ? (
      // Layout 9 · Brand health (13 Nov, review, after me.thebluejackgroup.com): the head with the credits, Summary,
      // the health ring, four figures against their aims, the tabs, Book consultation floating (HomeHealth.tsx)
      <div className="bx-grid bx-grid--doto bx-grid--first bx-grid--brief bx-grid--health">
        <HomeHealth
          sidebar={look === 'healthSide'}
          bar={look === 'healthBar'}
          balance={<BalancePill inline />}
          profile={(tab) => <ProfileSection only={tab} />}
        />
      </div>
      ) : look === 'dash' ? (
      // Layout 7 · Dashboard (13 Nov, review): Home as a classic dashboard (HomeDashboard.tsx)
      <HomeDashboard balance={<BalancePill />} />
      ) : look === 'brief' || look === 'greet' ? (
      // Layout 6 · Brief (13 Nov, review): the company and its balance, the four numbers, the tabs, Book consultation
      // floating (HomeBrief.tsx). Layout 8 (13 Nov, review): the same, under a greeting, the credits and a box to ask
      // Spark, after the earlier "Good afternoon, Layla" Home the client liked
      <div className={cx('bx-grid bx-grid--doto bx-grid--first bx-grid--brief', look === 'greet' && 'bx-grid--greet')}>
        <BriefHome
          top={look === 'greet' ? <GreetTop /> : <TopPanel noConsult fresh />}
          reports={
            <HomeTabs
              reports={
                <>
                  {ready.map((r) => (
                    <ReadyReport key={r.id} r={r} />
                  ))}
                  {LOCKED.map((r) => (
                    <LockedReport key={r.id} r={r} credits={state.credits} onBuy={() => actions.spend(r.price)} c site />
                  ))}
                </>
              }
            />
          }
        />
      </div>
      ) : look === 'tabs' ? (
      // Layout 6 (13 Nov, review): Layout 1 with the company profile off the top row: the balance and the consultation
      // under the company, then two tabs drawn as the sidebar's menu, Reports (open) and Company profile; the reports
      // as Layout 1 has them, the profile as a section to read, nothing on it to click
      <div className="bx-grid bx-grid--doto bx-grid--first">
        <TopPanel />
        <HomeTabs
          reports={
            <>
              {ready.map((r) => (
                <ReadyReport key={r.id} r={r} />
              ))}
              {LOCKED.map((r) => (
                <LockedReport key={r.id} r={r} credits={state.credits} onBuy={() => actions.spend(r.price)} c site />
              ))}
            </>
          }
        />
      </div>
      ) : look === 'current' && reportCard === 'first' ? (
      <div className="bx-grid bx-grid--doto bx-grid--first">
        {/* 13 Nov, review: under the company, the profile, the consultation and the credits on a card of their own;
            then the reports, the two ready ones first with charts, the locked ones after */}
        <CompanyHero credits={state.credits} total={state.creditsTotal} onTopUp={actions.topUp} metal hero={HERO_PICKED} noCredits />
        {/* three, not four (13 Nov, review): no Dr.AI card here (he's in his corner); the consultation in his card's ink */}
        {/* credits first, then the profile, then the consultation at the end of the row (13 Nov, review) */}
        <div className="bx-firstrow">
          <CreditsCard credits={state.credits} total={state.creditsTotal} onTopUp={actions.topUp} />
          <ProfileCard tags />
          <BookCard c solid="ink" />
        </div>
        <h2 className="bx-section">Reports</h2>
        {ready.map((r) => (
          <ReadyReport key={r.id} r={r} />
        ))}
        {LOCKED.map((r) => (
          <LockedReport key={r.id} r={r} credits={state.credits} onBuy={() => actions.spend(r.price)} c site />
        ))}
      </div>
      ) : (
      <div className="bx-grid bx-grid--doto">
        <CompanyHero credits={state.credits} total={state.creditsTotal} onTopUp={actions.topUp} metal hero={HERO_PICKED} />
        {/* Quick overview (13 Nov, review): the two reports first, the profile third */}
        <div className="bx-row1">
          {look === 'boldGlass' ? (
            <>
              {webStat}
              {socialStat}
              <ProfileCard short />
            </>
          ) : (
            <>
              <ProfileCard />
              {webStat}
              {socialStat}
            </>
          )}
        </div>
        {/* Bold without the locked reports (13 Nov, review); Bands keeps them */}
        {look !== 'boldGlass' && (
          <>
            <h2 className="bx-section">Add more reports</h2>
            {LOCKED.map((r) => (
              <LockedReport key={r.id} r={r} credits={state.credits} onBuy={() => actions.spend(r.price)} c site={reportCard === 'site'} />
            ))}
          </>
        )}
        {/* Bold (13 Nov, review): the second row on the first's columns, the consultation as wide as the profile,
            Dr.AI as the two reports */}
        {look === 'boldGlass' ? (
          <div className="bx-row2">
            <BookCard c glass={look === 'boldGlass'} />
            <AskSparki look="ink" />
          </div>
        ) : (
          <>
            <BookCard c />
            <AskSparki look="ink" />
          </>
        )}
      </div>
      )
      )}
    </div>
  );
}

export function HomeBentoDemo() {
  const { state } = useStore();
  const [look, setLook] = useState<Look>(() => {
    try {
      return (localStorage.getItem('spark-bento-look') as Look) || 'ink';
    } catch {
      return 'ink';
    }
  });
  const pick = (l: Look) => {
    setLook(l);
    try {
      localStorage.setItem('spark-bento-look', l);
    } catch {
      /* this visit only */
    }
  };
  const [layout, setLayout] = useState<Layout>(() => {
    try {
      return (localStorage.getItem('spark-bento-layout') as Layout) || 'b';
    } catch {
      return 'b';
    }
  });
  const pickLayout = (l: Layout) => {
    setLayout(l);
    try {
      localStorage.setItem('spark-bento-layout', l);
    } catch {
      /* this visit only */
    }
  };
  // the demo's own wallet, so unlocking and booking can be tried without touching the portal's credits
  const [credits, setCredits] = useState(state.credits || 100);
  const spend = (n: number) => setCredits((c) => Math.max(0, +(c - n).toFixed(2)));
  const [total, setTotal] = useState(state.creditsTotal || 100);
  const topUp = (n: number) => {
    setCredits((c) => +(c + n).toFixed(2));
    setTotal((t) => Math.max(t, credits + n));
  };
  const web = analyses.find((a) => a.kind === 'website');
  const social = analyses.find((a) => a.kind === 'social');
  const webScore = parseInt(web?.score?.value ?? '41', 10);
  const open = state.requests.filter((r) => r.status !== 'delivered' && r.status !== 'declined');
  const chats = state.conversations.length;
  const lastChat = state.conversations[0]?.title;

  return (
    <div className={cx('bx', `bx--${look}`)}>
      <SpectrumDefs />
      <header className="bx-head">
        <span>
          <span className="bx-eyebrow">{state.brand.name} · Home</span>
          <h1 className="bx-h1">Good morning, Layla.</h1>
        </span>
        <span className="bx-switches">
        <span className="bx-look" role="radiogroup" aria-label="Layout">
          {(['a', 'b', 'c'] as Layout[]).map((l) => (
            <button key={l} type="button" role="radio" aria-checked={layout === l} className={cx(layout === l && 'is-on')} onClick={() => pickLayout(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </span>
        <span className="bx-look" role="radiogroup" aria-label="Look">
          {(['ink', 'sand'] as Look[]).map((l) => (
            <button key={l} type="button" role="radio" aria-checked={look === l} className={cx(look === l && 'is-on')} onClick={() => pick(l)}>
              {l === 'ink' ? 'Ink' : 'Sand'}
            </button>
          ))}
        </span>
        </span>
      </header>

      {layout !== 'a' ? (
        <div className={cx('bx-grid', layout === 'c' && 'bx-grid--doto')}>
          <CompanyHero key={layout} credits={credits} total={total} onTopUp={topUp} metal={layout === 'c'} hero={HERO_PICKED} />
          {layout === 'c' ? (
            // C (12 Nov, review): the profile and the two free reports as one row of their own, the reports never
            // narrower than their one-line title; no badge, the colour bands one height across the row
            <div className="bx-row1">
              <ProfileCard />
              <Stat fig={String(webScore)} unit="/100" title="Website score" line="Mobile speed on 4G" delta={{ up: true, text: '+6 since September' }} href="#/?tab=website" cta="Open report" />
              <Stat
                fig={social?.score?.value ?? '4%'}
                title="Instagram engagement"
                line="vs 1.9% typical for UAE retail"
                delta={{ up: false, text: '−0.4 pt since September' }}
                tint="ember"
                href="#/?tab=social"
                cta="Open report"
              />
            </div>
          ) : (
            <>
              <Glance />
              <Stat fig={String(webScore)} unit="/100" title="Website score" line="Mobile speed on 4G" delta={{ up: true, text: '+6 since September' }} href="#/?tab=website" />
              <Stat
                fig={social?.score?.value ?? '4%'}
                title="Instagram engagement"
                line="vs 1.9% typical for UAE retail"
                delta={{ up: false, text: '−0.4 pt since September' }}
                tint="violet"
                href="#/?tab=social"
              />
            </>
          )}
          <h2 className="bx-section">{layout === 'c' ? 'Add more reports' : 'More reports Spark can make'}</h2>
          {LOCKED.map((r) => (
            <LockedReport key={r.id} r={r} credits={credits} onBuy={() => spend(r.price)} c={layout === 'c'} />
          ))}
          <BookCard c={layout === 'c'} />
          {/* Ink, picked 12 Nov (Ink + Noor and Cobalt were the other looks; their styles stay in bento.css) */}
          {layout === 'c' ? <AskSparki look="ink" /> : <AskCard />}
        </div>
      ) : (
      <div className="bx-grid">
        <Hero />
        <Stat fig={String(webScore)} unit="/100" title="Website score" line="Mobile speed on 4G" delta={{ up: true, text: '+6 since September' }} href="#/?tab=website" />
        <Stat fig={social?.score?.value ?? '4%'} title="Instagram engagement" line="vs 1.9% typical for UAE retail" delta={{ up: false, text: '−0.4 pt since September' }} tint="violet" href="#/?tab=social" />
        <Stat fig={usd(credits).split('.')[0]} unit={`.${usd(credits).split('.')[1]}`} title="Credits · USD" line="For reports, consultations and new work" tint="cobalt" />
        <Stat fig={String(open.length)} title={open.length === 1 ? 'Request in progress' : 'Requests in progress'} line={open.some((r) => r.status === 'proposal') ? 'A proposal is waiting for you' : 'Spark is on them'} href="#/requests" />

        <h2 className="bx-section">More reports Spark can make</h2>
        {LOCKED.map((r) => (
          <LockedReport key={r.id} r={r} credits={credits} onBuy={() => spend(r.price)} />
        ))}

        <Card tint="cobalt" className="bx-strategist">
          <span className="bx-icon">
            <Video size={40} strokeWidth={1.6} stroke="url(#bx-spectrum)" />
          </span>
          <b className="bx-fig">
            45<i>min</i>
          </b>
          <span className="bx-stat__title">On video, with Reem</span>
          <span className="bx-stat__line">Your Spark strategist, who wrote both reports.</span>
        </Card>
        <Consultation credits={credits} onBuy={() => spend(20)} />

        <Card tint="violet" className="bx-chats">
          <a className="bx-cover" href="#/assistant">
            <span className="bx-icon">
              <MessagesSquare size={44} strokeWidth={1.6} stroke="url(#bx-spectrum)" />
            </span>
            <b className="bx-fig bx-fig--sm">{chats}</b>
            <span className="bx-stat__title">{chats === 1 ? 'Chat with Dr.AI' : 'Chats with Dr.AI'}</span>
            <span className="bx-stat__line">{lastChat ? `Last: “${lastChat}”` : 'Ask him anything about your brand'}</span>
          </a>
        </Card>
        <Card tint="ember" className="bx-next">
          <span className="bx-icon">
            <CalendarClock size={44} strokeWidth={1.6} stroke="url(#bx-spectrum)" />
          </span>
          <span className="bx-eyebrow">Next from Spark</span>
          <h3 className="bx-title">The mobile speed fix, by 21 Nov.</h3>
          <p className="bx-body">Images and the checkout script first: worth about 3 seconds on 4G.</p>
        </Card>
        <Card tint="cobalt" className="bx-ask">
          <span className="bx-icon">
            <Sparkles size={44} strokeWidth={1.6} stroke="url(#bx-spectrum)" />
          </span>
          <span className="bx-eyebrow">Ask Dr.AI</span>
          <h3 className="bx-title">“What should we fix first?”</h3>
          <a className="bx-link" href="#/assistant">
            Ask it <ArrowRight size={15} />
          </a>
        </Card>
      </div>
      )}
    </div>
  );
}

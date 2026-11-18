// Layout 9 · Health (13 Nov, review, after me.thebluejackgroup.com's Summary and Email Health: "a Brand health figure,
// one number for how healthy the company is; the percent in colour; arrows up and down; the credits as a name with a
// caret, no avatar; the Summary, a short paragraph of what was found with figures picked out; the ring whose lines
// fill clockwise from grey as you arrive"). On Spark's sand, with the client's clear glass cards and Spark's colours:
//   · the head: Qindeel, a line under it, the credits at the right
//   · Brand health: the ring (its ticks fill Cobalt into violet on arrival), what Spark found as its reading (once a
//     Summary of its own above it, merged in: they told the same story), what it's measured against
//   · four figures from the reports the report cards don't show, each against its aim, the arrow saying which way
//   · the reports and the company profile (Layout 5's tabs), Book consultation floating
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, Building2, History } from 'lucide-react';
import { CompanySwitch, ProfileDrawer, brandStore, brandsFor, useActiveBrand, useMode, useProfileRequest, useRoleHere, type ProfileTab } from './HealthHead';
import { useStore } from '../../state/store';
import { Avatar, cx } from '../../components/ui/primitives';
import { dotted } from './dotted';
import { analyses } from '../../data/mock';
import { needsYou, requestStatusMeta } from '../../components/domain';
import type { WorkRequest } from '../../data/types';
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
const fmtLong = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
const verdict = (n: number) =>
  n >= 85 ? { word: 'Strong', good: true } : n >= 70 ? { word: 'Good', good: true } : n >= 50 ? { word: 'Fair', good: false } : { word: 'Weak', good: false };
const TICKS = 64;

// Cobalt into violet along the ring
const mix = (t: number) => {
  // one gradient for every chart on the page (13 Nov, review): Cobalt into violet, as the bars and the gauges
  // 17 Nov, review: the client liked Overview's indicators, so Cobalt into violet into Ember, as its gauge and meter
  const stops: [number, number[]][] = [[0, [30, 59, 214]], [0.55, [124, 74, 224]], [1, [232, 80, 31]]];
  const j = t <= stops[1][0] ? 0 : 1;
  const [t0, a] = stops[j], [t1, b] = stops[j + 1];
  const k = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})`;
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
  /** 17 Nov, design sync: a card's look follows its figure: a score in a ring ("7 out of 10"), a share or a count as
   *  a big figure over a bar ("it's not a score, it's a percentage... another layout") */
  look: 'score' | 'figure';
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
// Brand Analysis (17 Nov, design sync; three cards, as Jean's sketch: Website, Social, PR): one card per pillar, each with the one figure
// that matters most and "More" to its full report. PR's figure is a prototype's: no PR report in the data yet.
const FIGS: Fig[] = [
  { look: 'score', from: 'Website', title: 'Website score', fig: '41', unit: '/100', mine: 41, aim: 58, scale: 100, dir: 'down', vs: <><b>17</b> below the 58 typical</>, status: 'work', href: '#/?tab=website' },
  { look: 'figure', from: 'Social', title: 'Instagram engagement', fig: '4', unit: '%', mine: 4, aim: 1.9, scale: 6, dir: 'up', vs: <>Above the <b>1.9%</b> typical</>, status: 'good', href: '#/?tab=social' },
  { look: 'figure', from: 'PR', title: 'Press mentions since Sep', fig: '18', mine: 18, aim: 40, scale: 60, dir: 'down', vs: <>Rivals average <b>40</b></>, status: 'watch', href: '#/?tab=pr' },
];

// Each brand's own page (17 Nov, review: "the data should change when I pick a brand"): its health, what it means,
// its three analysis figures and its latest requests. Qindeel's are the portal's own; the group's other brands and
// Spark's other clients are a prototype's figures, so switching shows the page change.
type Latest = Pick<WorkRequest, 'id' | 'title' | 'status' | 'updatedAt' | 'type'> & Partial<Pick<WorkRequest, 'excerpt' | 'nextStep'>>;
type BrandPage = { score: number; title: string; text: string; based: string; figs: Fig[]; latest?: Latest[] };
const fig = (look: Fig['look'], from: string, title: string, mine: number, unit: string | undefined, aim: number, scale: number, status: Status, vs: ReactNode, href: string): Fig => ({
  look,
  from,
  title,
  fig: String(mine),
  unit,
  mine,
  aim,
  scale,
  dir: status === 'good' ? 'up' : 'down',
  vs,
  status,
  href,
});
const PAGES: Record<string, BrandPage> = {
  'b-qindeel': {
    score: HEALTH,
    title: 'Strong in your stores, held back online.',
    text: 'People’s love for Qindeel in its stores lifts the score. A slow site that looks like any global chain, and a name few know in Riyadh, keep it from the top.',
    based: 'We read 1,200 reviews and posts, 23 pages of your site and 412 social posts, and asked 300 shoppers.',
    figs: FIGS,
  },
  'b-home': {
    score: 64,
    title: 'Loved at home, hard to find online.',
    text: 'Buyers rate the furniture highly once it’s in their homes, but few find Bayt & Co. in search, and the site loses them at checkout.',
    based: 'We read 640 reviews, 31 pages of your site and 205 social posts.',
    figs: [
      fig('score', 'Website', 'Website score', 58, '/100', 58, 100, 'watch', <>Level with the <b>58</b> typical</>, '#/?tab=website'),
      fig('figure', 'Social', 'Instagram engagement', 2.1, '%', 1.9, 6, 'good', <>Above the <b>1.9%</b> typical</>, '#/?tab=social'),
      fig('figure', 'PR', 'Press mentions since Sep', 9, undefined, 25, 40, 'work', <>Rivals average <b>25</b></>, '#/?tab=pr'),
    ],
    latest: [
      { id: 'REQ-212', title: 'Checkout fixes for the online store', status: 'in_progress', updatedAt: '2026-11-14T10:00:00', type: 'Digital' },
      { id: 'REQ-209', title: 'Ramadan living-room campaign', status: 'proposal', updatedAt: '2026-11-11T09:00:00', type: 'Creative' },
      { id: 'REQ-204', title: 'Search ads for sofas and beds', status: 'approved', updatedAt: '2026-11-03T15:00:00', type: 'Digital' },
    ],
  },
  'b-kids': {
    score: 81,
    title: 'Parents trust it; the shelf does the talking.',
    text: 'Parents come back for the quality and tell their friends. Online it holds its own; the press hasn’t found it yet.',
    based: 'We read 980 reviews, 18 pages of your site and 330 social posts, and asked 200 parents.',
    figs: [
      fig('score', 'Website', 'Website score', 74, '/100', 58, 100, 'good', <><b>16</b> above the 58 typical</>, '#/?tab=website'),
      fig('figure', 'Social', 'Instagram engagement', 5, '%', 1.9, 6, 'good', <>Well above the <b>1.9%</b> typical</>, '#/?tab=social'),
      fig('figure', 'PR', 'Press mentions since Sep', 12, undefined, 30, 40, 'watch', <>Rivals average <b>30</b></>, '#/?tab=pr'),
    ],
    latest: [
      { id: 'REQ-305', title: 'Back-to-school content for January', status: 'in_review', updatedAt: '2026-11-15T11:00:00', type: 'Content' },
      { id: 'REQ-301', title: 'Mall pop-up in Dubai Hills', status: 'delivered', updatedAt: '2026-11-02T17:00:00', type: 'Creative' },
    ],
  },
  'b-saffron': {
    score: 47,
    title: 'A favourite in Dubai, unknown in Abu Dhabi.',
    text: 'Regulars in Dubai love the coffee and the room. Abu Dhabi hardly knows the name, and a slow, dated site turns away people who look it up.',
    based: 'We read 410 reviews, 9 pages of your site and 120 social posts.',
    figs: [
      fig('score', 'Website', 'Website score', 33, '/100', 58, 100, 'work', <><b>25</b> below the 58 typical</>, '#/?tab=website'),
      fig('figure', 'Social', 'Instagram engagement', 1.2, '%', 1.9, 6, 'work', <>Below the <b>1.9%</b> typical</>, '#/?tab=social'),
      fig('figure', 'PR', 'Press mentions since Sep', 6, undefined, 22, 40, 'work', <>Rivals average <b>22</b></>, '#/?tab=pr'),
    ],
    latest: [
      { id: 'REQ-411', title: 'Abu Dhabi opening: who to reach first', status: 'proposal', updatedAt: '2026-11-16T09:30:00', type: 'Strategy' },
      { id: 'REQ-406', title: 'A new menu site', status: 'submitted', updatedAt: '2026-11-12T13:00:00', type: 'Digital' },
    ],
  },
};
// Spark's other clients borrow a group brand's figures, so every client in the list opens a full page
const PAGE_ALIAS: Record<string, string> = { 'b-dune': 'b-home', 'b-noor': 'b-kids', 'b-aster': 'b-saffron' };
const pageOf = (id: string) => PAGES[id] ?? PAGES[PAGE_ALIAS[id] ?? 'b-qindeel'];

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

/** A ring open at the foot (as Overview's website score): the faint track, the share filled from Cobalt through violet
 *  to Ember, a short tick across the ring where the aim is. */
function ArcGauge({ share, aim, id }: { share: number; aim?: number; id: string }) {
  const C = 50, R = 44;
  const at = (deg: number, r = R) => [C + r * Math.cos((deg * Math.PI) / 180), C + r * Math.sin((deg * Math.PI) / 180)] as const;
  const [sx, sy] = at(135);
  const [ex, ey] = at(45);
  const k = Math.max(0, Math.min(1, share));
  const [vx, vy] = at(135 + 270 * k);
  const arc = `M ${sx} ${sy} A ${R} ${R} 0 1 1 ${ex} ${ey}`;
  const g = `hh-arc-${id.replace(/[^a-z0-9]/gi, '')}`;
  const tick = aim !== undefined ? [at(135 + 270 * Math.min(1, aim), R - 7), at(135 + 270 * Math.min(1, aim), R + 7)] : null;
  return (
    <svg className="hh-arc" viewBox="0 0 100 88" aria-hidden>
      <defs>
        <linearGradient id={g} gradientUnits="userSpaceOnUse" x1={sx} y1={sy} x2={vx} y2={vy}>
          <stop offset="0" stopColor="#1e3bd6" />
          <stop offset="0.55" stopColor="#7c4ae0" />
          <stop offset="1" stopColor="#e8501f" />
        </linearGradient>
      </defs>
      <path d={arc} pathLength={100} fill="none" stroke="rgba(14, 17, 22, 0.08)" strokeWidth="6" strokeLinecap="round" />
      <path className="hh-arc__val" d={arc} pathLength={100} fill="none" stroke={`url(#${g})`} strokeWidth="6" strokeLinecap="round" style={{ strokeDasharray: `${k * 100} 100` }} />
      {tick && <line x1={tick[0][0]} y1={tick[0][1]} x2={tick[1][0]} y2={tick[1][1]} stroke="#0e1116" strokeWidth="1.6" strokeLinecap="round" />}
    </svg>
  );
}

/** A skeleton's grey bar (17 Nov, review: "a skeleton while the new brand loads, not a coloured effect"). */
const Sk = ({ w, h = 12, r = 6, round }: { w: number | string; h?: number; r?: number; round?: boolean }) => (
  <span className="hh-sk" style={{ width: w, height: h, borderRadius: round ? '50%' : r }} aria-hidden />
);

/** Home as the brand's health. `balance` is the credits with their caret; `reports` the tabs. */
export function HomeHealth({ balance, profile, sidebar = false }: { balance: ReactNode; profile?: (tab: ProfileTab) => ReactNode; /** the brand switcher in the sidebar's account menu (Health · Sidebar) */ sidebar?: boolean }) {
  const { state, me } = useStore();
  // the four requests changed last, newest first
  const latest = [...state.requests].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  const b = state.brand;
  // the brand open now (17 Nov): Qindeel carries the data; another brand's name and line show in the head
  const mode = useMode();
  // a new company (onboarding, 17 Nov): Home in Health's look with nothing measured yet, one brand of its own
  const fresh = !!state.onboarding;
  const brands = brandsFor(mode).filter((x) => !fresh || x.id === 'b-qindeel').map((x) => (x.id === 'b-qindeel' ? { ...x, name: b.name, line: `${b.positioning} ${b.reach.replace(/ across .*$/, (m) => ' ' + m.trim().replace(/ /g, '\u00a0'))}` } : x));
  // the brand open now lives in a shared store (17 Nov, review): the head's list or the sidebar's account menu sets it
  const [brandId] = useActiveBrand();
  useEffect(() => {
    brandStore.setSidebar(sidebar);
    return () => brandStore.setSidebar(false);
  }, [sidebar]);
  const cur = brands.find((x) => x.id === brandId) ?? brands[0];
  // switching brands (17 Nov, review: "a micro-animation while the data loads"): the head changes at once (the brand
  // you picked); the cards show a skeleton for a moment, as if fetching, then the new brand's figures rise in, card
  // after card, and every indicator plays again
  const [shownId, setShownId] = useState(brandId);
  const [loading, setLoading] = useState(false);
  const [swapped, setSwapped] = useState(false);
  useEffect(() => {
    if (brandId === shownId) return;
    setLoading(true);
    setSwapped(true);
    const t = window.setTimeout(() => {
      setShownId(brandId);
      setLoading(false);
    }, 650);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId]);
  const pickBrand = useCallback((id: string) => brandStore.set(id), []);
  // what your role lets you do here (17 Nov, review): an admin invites and approves; a member sees the same page and
  // can open it all, but the approval waits for the admin; Spark's team only looks, and the client's team isn't theirs
  const role = useRoleHere();
  const page = pageOf(shownId);
  const latestHere: Latest[] = page.latest ?? latest;
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<ProfileTab>('company');
  const closeProfile = useCallback(() => setProfileOpen(false), []);
  // Health · Sidebar: Company profile opens from the account menu (18 Nov, review)
  const openProfile = useCallback(() => {
    setProfileTab('company');
    setProfileOpen(true);
  }, []);
  useProfileRequest(openProfile, sidebar);
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
  return (
    <div className={cx('br hh', loading && 'is-loading', swapped && 'is-swapped')} ref={root}>
      {/* the head (17 Nov, review; the one kept of three): the brand's name with your role as a tag and a caret to the
          other brands, its line; the credits and Company profile at the top right; the team and the last update under it */}
        <header className="hh-head hb-head hb-head--ours">
          <CompanySwitch
            brands={brands}
            current={cur.id}
            onPick={pickBrand}
            // the brand can be picked here in the Sidebar version too (18 Nov, review), as well as in the account menu
            fixed={false}
            mode={mode}
            email={me.email}
          />
          <span className="hb-head__acts">
            {balance}
            <button type="button" className="hb-profile" onClick={() => setProfileOpen(true)}>
              <Building2 size={14} strokeWidth={1.8} aria-hidden />
              Company profile
            </button>
          </span>
          {/* one line under the description (17 Nov, review): the team at the left, when Spark last updated the page in
              the right corner */}
          <span className="hb-foot">
            {role !== 'spark' ? (
              <a className="hh-team" href="#/team?from=home">
                <span className="bx-co__faces" aria-hidden>
                  {(colleagues.length ? colleagues : [me]).slice(0, 3).map((p) => (
                    <Avatar key={p.id} person={p} size={30} ring />
                  ))}
                  {/* only an admin invites */}
                  {role === 'admin' && <span className="bx-co__invite">+</span>}
                </span>
                <span>{colleagues.length ? `You and ${colleagues.length} colleague${colleagues.length === 1 ? '' : 's'}` : 'Just you so far'}</span>
                <ArrowRight className="hh-team__go" size={16} strokeWidth={1.8} aria-hidden />
              </a>
            ) : (
              <span />
            )}
            <span className="hb-updated-sm">
              <History size={13} strokeWidth={1.8} aria-hidden />
              {fresh ? 'Set up today' : `Last update ${fmtLong(cur.updated)}`}
            </span>
          </span>
        </header>

      <ProfileDrawer open={profileOpen} onClose={closeProfile} tab={profileTab} onTab={setProfileTab}>
        <div className="hb-profile-body">
          {profile?.(profileTab)}
        </div>
      </ProfileDrawer>

      {/* Brand health, and what Spark found as its reading (13 Nov, review: "What we found and Health say the same
          thing: make what we found the description"). Built as the report cards below (13 Nov, review: "the top cards
          in the style of the reports' cards"): the label, the headline, the ring where their gauge stands, then what
          it is, the healthy mark as their typical, the reading, what it's based on */}
        <section className={cx('db-card hh-card hh-health', fresh && 'hh-health--fresh')} aria-busy={loading}>
          {fresh ? (
            // nothing measured yet (17 Nov): what the score will be, and how it comes; the ring empty
            <>
              <span className="hh-health__head">
                <span className="db-label">Brand health</span>
                <span className="hh-measured">Not measured yet</span>
              </span>
              <h2 className="db-rep__title">Your brand’s health, once Spark has looked.</h2>
              <div className="hh-health__body">
                <HealthRing score={0} aim={HEALTH_AIM} />
                <div className="hh-health__side">
                  <span className="hh-verdict">One score from your three reports</span>
                  <p className="hh-health__text">
                    Spark reads your website, your social media and what people say about you, and sums it up here. Your first score comes with your
                    first reports.
                  </p>
                  <p className="hh-based">Ask Dr.AI to start, or send Spark a request.</p>
                </div>
              </div>
            </>
          ) : loading ? (
            // the card's shape in grey while the brand loads: the label, the headline, the ring, the lines beside it
            <>
              <span className="hh-health__head">
                <Sk w={180} h={10} />
                <Sk w={200} h={10} />
              </span>
              <Sk w="46%" h={22} r={8} />
              <div className="hh-health__body">
                <Sk w={180} h={180} round />
                <div className="hh-health__side hh-sk-col">
                  <Sk w="40%" h={16} />
                  <Sk w="92%" />
                  <Sk w="70%" />
                  <Sk w="80%" />
                </div>
              </div>
            </>
          ) : (
            <>
              <span className="hh-health__head" key={`h-${shownId}`}>
                <span className="db-label">Brand health · what we found</span>
                <span className="hh-measured">From your three reports · {MEASURED}</span>
              </span>
              <h2 className="db-rep__title" key={`t-${shownId}`}>{page.title}</h2>
              <div className="hh-health__body" key={`b-${shownId}`}>
                <HealthRing key={shownId} score={page.score} aim={HEALTH_AIM} />
                {/* 13 Nov, review: no "Brand health, out of 100" (the label says it) nor "a healthy brand: 70" (unclear);
                    the reading, then under a divider how good the score is, in words and in colour, and what it's based on */}
                <div className="hh-health__side">
                  {/* how good the score is, first, in words and in colour (13 Nov, review: no "Out of 100"; the verdict before
                      the reading) */}
                  <span className={cx('hh-verdict', verdict(page.score).good ? 'is-good' : 'is-weak')}>
                    {verdict(page.score).word} health <span>· {HEALTH_AIM} and over is a healthy brand</span>
                  </span>
                  <p className="hh-health__text">{page.text}</p>
                  {/* what it's based on, close together, in the verdict's grey words (13 Nov, review) */}
                  <p className="hh-based">{page.based}</p>
                </div>
              </div>
            </>
          )}
        </section>

      {/* Brand Analysis (17 Nov, design sync): its own section under the health, named */}
      <h2 className="db-label hh-sec">Brand analysis</h2>
      <section className="hh-figs" aria-label="Brand analysis" key={shownId} aria-busy={loading}>
        {loading &&
          [0, 1, 2].map((i) => (
            <div key={i} className="db-card hh-card hh-fig hh-fig--sk">
              <span className="hh-fig__top">
                <Sk w={70} h={10} />
                <Sk w={64} h={22} r={11} />
              </span>
              <Sk w={i === 0 ? 106 : 90} h={i === 0 ? 106 : 56} r={i === 0 ? 53 : 10} />
              <Sk w="60%" h={14} />
              <Sk w="75%" h={10} />
            </div>
          ))}
        {fresh &&
          // the three pillars before any report (17 Nov): what each will show, nothing to read yet
          [
            ['Website', 'Website score', 'Speed, design and how it sells'],
            ['Social', 'Instagram engagement', 'How people answer your posts'],
            ['PR', 'Press mentions', 'Where the press writes about you'],
          ].map(([from, title, vs]) => (
            <div key={from} className="db-card hh-card hh-fig hh-fig--empty">
              <span className="hh-fig__top">
                <span className="db-label">{from}</span>
                <span className="hh-status is-empty">No report yet</span>
              </span>
              <span className="hh-fig__row">
                <span className="hh-fig__dash" aria-hidden>
                  —
                </span>
                <span className="hh-bar" aria-hidden />
              </span>
              <span className="hh-fig__title">{title}</span>
              <span className="hh-fig__foot">
                <span className="hh-vs">{vs}</span>
              </span>
            </div>
          ))}
        {!loading && !fresh && page.figs.map((f) => (
          <a key={f.title} className="db-card hh-card hh-fig" href={f.href}>
            {/* the label as every card has (13 Nov, review): the report it's from, the status across from it */}
            <span className="hh-fig__top">
              <span className="db-label">{f.from}</span>
              <span className={cx('hh-status', `is-${f.status}`)}>{STATUS[f.status]}</span>
            </span>
            {f.look === 'score' ? (
              // the score in a ring open at the foot (Overview's website gauge, which Jean liked), a tick at the typical
              <span className="hh-arcwrap">
                <ArcGauge share={f.mine / f.scale} aim={f.aim !== undefined ? f.aim / f.scale : undefined} id={f.title} />
                <span className="hh-fig__n" role="img" aria-label={`${f.fig}${f.unit ?? ''} ${f.title}`}>
                  {dotted(f.fig)}
                </span>
                {f.unit && <i className="hh-arc__unit is-of">{f.unit}</i>}
              </span>
            ) : (
              // the figure with its bar beside it, on the right (17 Nov, review)
              <span className="hh-fig__row">
                <span className="hh-fig__n" role="img" aria-label={`${f.fig}${f.unit ?? ''} ${f.title}`}>
                  {dotted(f.fig)}
                  {f.unit && <i>{f.unit}</i>}
                </span>
                <span className="hh-bar" aria-hidden>
                  <span style={{ width: `${Math.min(100, (f.mine / f.scale) * 100)}%` }} />
                  {f.aim !== undefined && <i style={{ left: `${(f.aim / f.scale) * 100}%` }} />}
                </span>
              </span>
            )}
            <span className="hh-fig__title">{f.title}</span>
            {/* the comparison, and at its right the way to the full report (17 Nov, design sync: "More" opens the report):
                an arrow always, the word "More" sliding in beside it on hover (17 Nov, review) */}
            <span className="hh-fig__foot">
              <span className={cx('hh-vs', `is-${f.status}`)}>
                {f.dir && (
                  <span className="hh-vs__arrow" aria-hidden>
                    {f.dir === 'up' ? '▲' : '▼'}
                  </span>
                )}
                <span>{f.vs}</span>
              </span>
              <span className="hh-fig__more">
                <span className="hh-fig__more-word">More</span>
                <ArrowRight size={16} strokeWidth={1.8} aria-hidden />
              </span>
            </span>
          </a>
        ))}
      </section>

      {/* Latest update (17 Nov, design sync): the latest requests, each with its status and date; a click opens it */}
      {/* Latest update as a section of its own, titled as Brand analysis is (17 Nov, review: inside its card it read as
          part of Brand analysis); no "needs you" count, the row's button says it */}
      <h2 className="db-label hh-sec">Latest update</h2>
      <section className="db-card hh-card hh-latest" aria-label="Latest update">
        <ul className="hh-latest__list" key={shownId}>
          {loading &&
            [0, 1, 2].map((i) => (
              <li key={`sk-${i}`} className="hh-latest__sk">
                <Sk w={`${[52, 40, 46][i]}%`} h={14} />
                <Sk w={`${[30, 26, 34][i]}%`} h={10} />
              </li>
            ))}
          {!loading && !latestHere.length && (
            <li className="hh-latest__empty">
              <b>Nothing yet</b>
              <span>Your requests to Spark, their status and dates will show here.</span>
            </li>
          )}
          {!loading && latestHere.map((r) => {
            const mine = needsYou(r);
            return (
              <li key={r.id}>
                {/* each request: its title, then one mono line (status with its dot, where it came from, when); at the
                    right an arrow, or, when it waits on you, its action as a dark pill */}
                <a className={cx('hh-latest__row', mine && 'is-yours')} href={r.status === 'proposal' ? `#/requests/${r.id}/proposal` : `#/requests/${r.id}`}>
                  <span className="hh-latest__text">
                    <span className="hh-latest__title">{r.title}</span>
                    <span className="hh-latest__meta">
                      <span className={cx('hh-latest__status', `is-${r.status}`)}>{r.status === 'proposal' ? 'Proposal ready' : requestStatusMeta[r.status].label}</span>
                      <span>{r.excerpt ? 'From a Dr.AI chat' : `${r.type} · ${r.id}`}</span>
                      <span>{fmtDay(r.updatedAt)}</span>
                    </span>
                  </span>
                  {mine && role === 'user' && r.status === 'proposal' ? (
                    // a member sees the proposal is in, and that the admin decides it
                    <span className="hh-latest__wait">Waiting for admin</span>
                  ) : mine && role !== 'spark' ? (
                    // a small button that says what you'll do (17 Nov, review: clearer words, no arrow)
                    <span className="hh-latest__cta">{r.status === 'proposal' ? 'Review & approve' : 'Reply to Spark'}</span>
                  ) : (
                    // the same arrow as the Brand analysis cards', "More" sliding in beside it on hover
                    <span className="hh-more">
                      <span className="hh-more__word">More</span>
                      <ArrowRight size={16} strokeWidth={1.8} aria-hidden />
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 17 Nov, design sync: no report cards under the figures (each analysis card's "More" opens its report) and
          no Book consultation (Dr.AI's chat and requests cover it) */}
    </div>
  );
}

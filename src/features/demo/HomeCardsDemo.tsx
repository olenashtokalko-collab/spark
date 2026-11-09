// Prototype-only page (#/demo/home-cards?v=a|b|c): Home as a classic SaaS dashboard (9 Nov, review of the
// presentation-like styles: "too much at once, titles too big, hard to see what to look at"). Cards again, a calm
// type scale (page 28 · card title 16 · figure 40 · text 14 · label 12), one card that leads, at most four cards in
// the first screen. Brand Analysis on Home is a snapshot (a score, the top findings, a way into the full analysis
// and a way to book Spark); the Brand Analysis tab keeps the layer under it.
import { ArrowRight, Search } from 'lucide-react';
import { navigate, useRoute } from '../../lib/router';
import { useUI } from '../../state/ui';
import { useStore } from '../../state/store';
import { analyses } from '../../data/mock';
import { fmtDate } from '../../lib/format';
import { cx } from '../../components/ui/primitives';
import { SparkiStill } from '../../components/ui/DrAi';
import { BrandSpark } from '../../components/ui/BrandSpark';
import { LatestFromSpark, fixes, useModel, type Model } from '../home/HomeLayouts';
import { Gauge } from './HomeVariantsDemo';
import { Frame } from './HomeStylesDemo';
import { HomeCredits } from './HomeRethinkDemo';
import type { CompanyAnalysis } from '../../data/types';

const LAYOUTS = [
  {
    v: 'a',
    label: 'A · Brand Analysis leads',
    note: 'One wide card leads: both scores side by side, the top finding and two ways on (the full analysis, a consultation). What needs you sits beside it, short; the latest from Spark under them.',
  },
  {
    v: 'b',
    label: 'B · Figures, then work',
    note: 'A row of three small figure cards (website, social media, decisions waiting), each with one small picture; then two cards for the work: what needs you and the latest from Spark.',
  },
  {
    v: 'c',
    label: 'C · Next step leads',
    note: 'The decision due first leads, with its button; Brand Analysis beside it as a compact card with the scores and the top three findings; the latest from Spark under them.',
  },
  {
    v: 'e',
    label: 'E · Two columns, a divider',
    note: 'Left: Brand Analysis, its reports two to a row (more reports add rows), then Latest from Spark in the same title style, every update, scrolling down. Right, past a fine rule: the consultation on Haze, then the company profile in short with a way to the full one. No Company profile link in the head.',
  },
  {
    v: 'd',
    label: 'D · Home is Brand Analysis',
    note: 'Home becomes the analysis overview and the Brand Analysis tab goes (it only repeated Home, Jean #25). Needs your action goes too: Dr.AI in the corner already walks you through what waits. One Ultra title (the company, 44 px, the book’s minimum), big figures in the reports, Bold card titles, Light text, Ember mono labels. A report and the company profile are the layers under Home.',
  },
] as const;
type V = (typeof LAYOUTS)[number]['v'];

const REPORTS = (['website', 'social'] as const).map((k) => analyses.find((a) => a.kind === k)!).filter(Boolean);
const web = REPORTS.find((a) => a.kind === 'website')!;
const social = REPORTS.find((a) => a.kind === 'social')!;
const ALL = fixes(REPORTS);
const NAME: Record<string, string> = { social: 'Social media', website: 'Website' };
const reportHref = (a: CompanyAnalysis) => `#/brand-analysis/${a.kind}`;
const webScore = parseInt(web.score?.value ?? '0', 10);

function CardHead({ title, count, link }: { title: string; count?: number; link?: { label: string; href: string } }) {
  return (
    <header className="hc-card__head">
      <h3>{title}</h3>
      {count !== undefined && <span className="hc-count">{count}</span>}
      {link && (
        <a className="hc-link" href={link.href}>
          {link.label} <ArrowRight size={13} />
        </a>
      )}
    </header>
  );
}

function Ring({ value }: { value: number }) {
  return (
    <span className="hc-ring">
      <Gauge value={value} />
      <span>
        <b>{value}</b>
        <i>/100</i>
      </span>
    </span>
  );
}

function Score({ a, big }: { a: CompanyAnalysis; big?: boolean }) {
  const up = a.kind === 'website';
  return (
    <a className={cx('hc-score', big && 'hc-score--big')} href={reportHref(a)}>
      <span className="hc-label">{NAME[a.kind]}</span>
      {a.kind === 'website' ? (
        <Ring value={webScore} />
      ) : (
        <b className="hc-fig">{a.score?.value}</b>
      )}
      <span className="hc-score__what">{a.score?.label}</span>
      <span className={cx('hc-delta', up ? 'is-up' : 'is-down')}>{up ? '+6 since September' : '−0.4 pt since September'}</span>
    </a>
  );
}

function Findings({ limit = 3 }: { limit?: number }) {
  return (
    <ul className="hc-findings">
      {ALL.slice(0, limit).map(({ a, f }) => (
        <li key={f.title}>
          <span className={cx('hc-impact', `is-${(f.impact ?? 'Low').toLowerCase()}`)}>{f.impact}</span>
          <a href={`${reportHref(a)}?issue=${encodeURIComponent(f.title)}`}>{f.title}</a>
          <span className="hc-findings__where">{NAME[a.kind]}</span>
        </li>
      ))}
    </ul>
  );
}

function Actions({ m, limit }: { m: Model; limit?: number }) {
  return (
    <ul className="hc-actions">
      {m.waiting.slice(0, limit).map((w) => (
        <li key={w.key}>
          <span className="hc-actions__text">
            <b>{w.title}</b>
            <span>
              {w.type}
              {w.date ? ` · ${w.date.label} ${fmtDate(w.date.iso)}` : ''}
            </span>
          </span>
          <a className="hc-btn hc-btn--line" href={w.href}>
            {w.action}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Latest({ limit = 3 }: { limit?: number }) {
  return (
    <section className="hc-card hc-latest">
      <header className="hc-card__head">
        <SparkiStill size={24} />
        <h3>Latest from Spark</h3>
      </header>
      <div className="hld-card hc-latest__list">
        <LatestFromSpark bare limit={limit} typed />
      </div>
    </section>
  );
}

function Book() {
  const { openRequest } = useUI();
  return (
    <button type="button" className="hc-btn hc-btn--line" onClick={() => openRequest({ type: 'Strategy', title: 'Consultation on the brand analysis' })}>
      Book a consultation
    </button>
  );
}

// ---- A · Brand Analysis leads ---------------------------------------------------------------------
function LayoutA({ m }: { m: Model }) {
  const top = ALL[0];
  return (
    <div className="hc-grid hc-grid--a">
      <section className="hc-card hc-card--lead">
        <CardHead title="Brand Analysis" link={{ label: 'All reports', href: '#/brand-analysis' }} />
        <div className="hc-pair">
          <Score a={web} big />
          <Score a={social} big />
        </div>
        <div className="hc-top">
          <span className="hc-label">Fix first</span>
          <b>{top.f.title}</b>
          <span>{top.f.fix ?? top.f.body}</span>
        </div>
        <footer className="hc-card__foot">
          <a className="hc-btn hc-btn--primary" href="#/brand-analysis">
            See the full analysis <ArrowRight size={14} />
          </a>
          <Book />
        </footer>
      </section>
      <section className="hc-card">
        <CardHead title="Needs your action" count={m.waiting.length} link={{ label: 'All', href: '#/requests' }} />
        <Actions m={m} />
      </section>
      <div className="hc-span">
        <Latest />
      </div>
    </div>
  );
}

// ---- B · Figures, then work -----------------------------------------------------------------------
function LayoutB({ m }: { m: Model }) {
  const first = m.waiting[0];
  return (
    <div className="hc-stack">
      <div className="hc-kpis">
        <a className="hc-card hc-kpi" href={reportHref(web)}>
          <span className="hc-label">Website · mobile speed</span>
          <span className="hc-kpi__row">
            <b className="hc-fig">
              {webScore}
              <i>/100</i>
            </b>
            <span className="hc-mini">
              <i style={{ width: `${webScore}%` }} />
            </span>
          </span>
          <span className="hc-delta is-up">+6 since September</span>
          <span className="hc-kpi__line">{ALL.find(({ a }) => a.kind === 'website')?.f.title}</span>
        </a>
        <a className="hc-card hc-kpi" href={reportHref(social)}>
          <span className="hc-label">Social · engagement</span>
          <span className="hc-kpi__row">
            <b className="hc-fig">{social.score?.value}</b>
            <span className="hc-vs">
              vs <b>1.9%</b> typical
            </span>
          </span>
          <span className="hc-delta is-down">−0.4 pt since September</span>
          <span className="hc-kpi__line">{ALL.find(({ a }) => a.kind === 'social')?.f.title}</span>
        </a>
        <a className="hc-card hc-kpi" href="#/requests">
          <span className="hc-label">Decisions waiting</span>
          <span className="hc-kpi__row">
            <b className="hc-fig">{m.waiting.length}</b>
          </span>
          <span className="hc-delta">{first?.date ? `First due ${fmtDate(first.date.iso)}` : 'Nothing due'}</span>
          <span className="hc-kpi__line">{first?.title}</span>
        </a>
      </div>
      <div className="hc-grid hc-grid--b">
        <section className="hc-card">
          <CardHead title="Needs your action" count={m.waiting.length} link={{ label: 'All requests', href: '#/requests' }} />
          <Actions m={m} />
        </section>
        <Latest limit={4} />
      </div>
      <div className="hc-foot">
        <a className="hc-more" href="#/brand-analysis">
          Brand Analysis: {ALL.length} findings, what to fix first and the company profile <ArrowRight size={13} />
        </a>
        <Book />
      </div>
    </div>
  );
}

// ---- C · Next step leads --------------------------------------------------------------------------
function LayoutC({ m }: { m: Model }) {
  const [first, ...rest] = m.waiting;
  return (
    <div className="hc-grid hc-grid--c">
      {first && (
        <section className="hc-card hc-card--next">
          <span className="hc-label">Next step · {first.date ? `${first.date.label.toLowerCase()} ${fmtDate(first.date.iso)}` : first.type}</span>
          <h2 className="hc-next__title">{first.title}</h2>
          <p>{first.type === 'Proposal' ? 'Spark’s proposal is ready: the idea, the budget and the timeline, on one page.' : 'Spark is waiting for your feedback on the file.'}</p>
          <span className="hc-card__foot">
            <a className="hc-btn hc-btn--primary" href={first.href}>
              {first.action} <ArrowRight size={14} />
            </a>
          </span>
          {rest.length > 0 && (
            <div className="hc-next__rest">
              <span className="hc-label">Also waiting · {rest.length}</span>
              <Actions m={{ ...m, waiting: rest }} />
            </div>
          )}
        </section>
      )}
      <section className="hc-card">
        <CardHead title="Brand Analysis" link={{ label: 'All reports', href: '#/brand-analysis' }} />
        <div className="hc-pair hc-pair--compact">
          <Score a={web} />
          <Score a={social} />
        </div>
        <Findings />
        <footer className="hc-card__foot">
          <a className="hc-link hc-link--strong" href="#/brand-analysis">
            See the full analysis <ArrowRight size={13} />
          </a>
          <Book />
        </footer>
      </section>
      <div className="hc-span">
        <Latest />
      </div>
    </div>
  );
}

// ---- D · the consultation, four looks (9 Nov, review) -------------------------------------------
// Above Fix first. The title says what you get (advice on your reports from a person), the line says how; no
// "Spark strategists · 30 min". The button is the system's Ink one. Devices from the book: glass lit by Noor,
// Spark's people (Cobalt is human), viewfinder brackets, a glass icon tile with the spectrum inside.
// Grounds from the book's palette only (V3 p. 30): Corniche Haze; an Ember or Ink band ("bands for statements",
// p. 20); glass lit by Noor from below (Noor is glow and glass, never a fill). Contrast with the Ink button and
// text: Ink on Haze 13.1:1, Ink on Ember 5.1:1; on Ink the text and the button are Sand (the book's night version).
const CONSULT_LOOKS = [
  { v: 'haze', label: 'Haze' },
  { v: 'ember', label: 'Ember' },
  { v: 'ink', label: 'Ink' },
  { v: 'glass', label: 'Glass + Noor' },
] as const;
const CONSULT = {
  title: 'Get expert advice on your reports',
  body: 'A Spark strategist goes through your website and social media results with you and tells you what to fix first, and how.',
};

/** The picture (9 Nov, review): a magnifier with the spark; no brackets. */
function FinderArt() {
  return (
    <span className="hcs-art" aria-hidden>
      <Search size={34} strokeWidth={1.6} />
      <span className="hcs-art__spark">
        <BrandSpark size={16} />
      </span>
    </span>
  );
}

function ConsultCard({ look }: { look: string }) {
  const { openRequest } = useUI();
  return (
    <section className={cx('hcs', `hcs--${look}`)}>
      <FinderArt />
      <h3 className="hcs-title">{CONSULT.title}</h3>
      <p>{CONSULT.body}</p>
      <button type="button" className={cx('hc-btn hcs-go', look === 'ink' ? 'hcs-go--sand' : 'hc-btn--primary')} onClick={() => openRequest({ type: 'Strategy', title: 'Consultation on the brand analysis' })}>
        Book a consultation
      </button>
    </section>
  );
}

/** D's report tiles, compact (9 Nov, review: B's figure cards, the metric under the figure). No bar: a score out of
 *  100 isn't progress. The tile is the link. */
function CompactReports() {
  const tiles = [
    { a: web, fig: <>{webScore}<i>/100</i></>, what: 'Mobile speed', delta: { up: true, text: '+6 since September' }, bench: undefined as string | undefined },
    { a: social, fig: <>{social.score?.value}</>, what: 'Engagement, Instagram', delta: { up: false, text: '−0.4 pt since September' }, bench: 'vs 1.9% typical for UAE retail' },
  ];
  return (
    <div className="hd-ctiles">
      {tiles.map((t) => (
        <a key={t.a.kind} className="hc-card hd-ctile" href={reportHref(t.a)}>
          <span className="hc-label">{NAME[t.a.kind]}</span>
          <b className="hd-ctile__fig">{t.fig}</b>
          <span className="hd-ctile__what">{t.what}</span>
          <span className={cx('hc-delta', t.delta.up ? 'is-up' : 'is-down')}>{t.delta.text}</span>
          {t.bench && <span className="hd-ctile__bench">{t.bench}</span>}
          {/* The report's verdict, not its top issue: that one is in Fix first. */}
          <span className="hd-ctile__line">{t.a.headline}</span>
        </a>
      ))}
    </div>
  );
}

// ---- D · Home is Brand Analysis -------------------------------------------------------------------
function LayoutD({ m, consult }: { m: Model; consult: string }) {
  return (
    <div className="hd">
      <header className="hd-head">
        <span className="hd-head__text">
          <h1 className="hd-title">{m.brand.name}</h1>
          <span className="hd-head__meta">
            {m.brand.category} · {m.brand.hq}
            <a className="hc-link hc-link--strong" href="#/brand-analysis?tab=profile">
              Company profile <ArrowRight size={13} />
            </a>
          </span>
        </span>
        <span className="hd-head__acts">
          <HomeCredits />
        </span>
      </header>
      {/* 9 Nov, review: the reports with the consultation beside them, the latest from Spark under the reports. No
          Fix first: the issues live in each report, which opens from its tile and goes back to Home. */}
      <h3 className="hld-title hd-sectitle">
        Brand Analysis <span className="hd-label">October 2026</span>
      </h3>
      <div className="hld-cols hd-cols2">
        <div className="hld-main">
          <CompactReports />
          {/* Latest from Spark: one container, its rows as tiles to click (9 Nov, review). */}
          <section className="hc-card hd-fixes hd-latest">
            <h3 className="hd-fixes__title">Latest from Spark</h3>
            <div className="hld-card hc-latest__list">
              <LatestFromSpark bare limit={4} typed />
            </div>
          </section>
        </div>
        <aside className="hld-side">
          <ConsultCard look={consult} />
        </aside>
      </div>
    </div>
  );
}

// ---- E · two columns and a divider (9 Nov, review) --------------------------------------------------
function ProfileSnap() {
  const { state } = useStore();
  const b = state.brand;
  const facts: [string, string][] = [
    ['Category', b.category],
    ['Head office', b.hq],
    ['Founded', b.founded],
    ['Where it sells', b.reach],
    ['Website', b.website],
  ];
  return (
    <section className="hc-card he-profile">
      <h3 className="hd-fixes__title">Company profile</h3>
      <p className="he-profile__pos">{b.positioning}</p>
      <dl className="he-facts">
        {facts.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <a className="hc-btn hc-btn--line he-profile__go" href="#/brand-analysis?tab=profile">
        View full profile
      </a>
    </section>
  );
}

function LayoutE({ m }: { m: Model }) {
  return (
    <div className="hd he">
      <header className="hd-head">
        <span className="hd-head__text">
          <h1 className="hd-title">{m.brand.name}</h1>
          <span className="hd-head__meta">
            {m.brand.category} · {m.brand.hq}
          </span>
        </span>
        <span className="hd-head__acts">
          <HomeCredits />
        </span>
      </header>
      <div className="he-cols">
        <div className="he-main">
          <section className="he-sec">
            <h3 className="hld-title hd-sectitle">
              Brand Analysis <span className="hd-label">October 2026</span>
            </h3>
            <CompactReports />
          </section>
          {/* One card again (9 Nov, review), its label as the reports' (mono), the last five as tiles to click. */}
          <section className="hc-card hd-fixes hd-latest he-latest2">
            <span className="hc-label">Latest from Spark</span>
            <div className="hld-card hc-latest__list">
              <LatestFromSpark bare limit={5} typed />
            </div>
          </section>
        </div>
        <aside className="he-side">
          <ConsultCard look="haze" />
          <ProfileSnap />
        </aside>
      </div>
    </div>
  );
}

/** The portal's Home since 9 Nov: D with the Ink consultation. */
export function PortalHome({ m }: { m: Model }) {
  return <LayoutD m={m} consult="ink" />;
}

export function HomeCardsDemo() {
  const { query } = useRoute();
  const m = useModel(analyses);
  const v = (LAYOUTS.find((l) => l.v === query.get('v'))?.v ?? 'a') as V;
  const cur = LAYOUTS.find((l) => l.v === v)!;
  const consult = CONSULT_LOOKS.find((l) => l.v === query.get('c'))?.v ?? 'haze';
  return (
    <div className="hc-page">
      <nav className="hs-switch" aria-label="Home layouts">
        {LAYOUTS.map((l) => (
          <button key={l.v} type="button" className={cx(l.v === v && 'is-on')} onClick={() => navigate(`/demo/home-cards?v=${l.v}`)}>
            {l.label}
          </button>
        ))}
      </nav>
      <p className="hs-note">{cur.note}</p>
      {v !== 'd' && v !== 'e' && <Frame m={m} />}
      {v === 'a' && <LayoutA m={m} />}
      {v === 'b' && <LayoutB m={m} />}
      {v === 'c' && <LayoutC m={m} />}
      {v === 'e' && <LayoutE m={m} />}
      {v === 'd' && (
        <>
          <nav className="hs-switch hcs-switch" aria-label="Consultation looks">
            <span>Consultation:</span>
            {CONSULT_LOOKS.map((l) => (
              <button key={l.v} type="button" className={cx(l.v === consult && 'is-on')} onClick={() => navigate(`/demo/home-cards?v=d&c=${l.v}`)}>
                {l.label}
              </button>
            ))}
          </nav>
          <LayoutD m={m} consult={consult} />
        </>
      )}
    </div>
  );
}

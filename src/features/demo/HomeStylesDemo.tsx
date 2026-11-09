// Prototype-only page (#/demo/home-styles?v=1|2|3|4): Home in four styles, all from the brand book (V3), after
// Jean's note of 9 Nov: "more varied design elements beyond boxes… different font sizes and weights… dynamic,
// engaging, distinctive", and Home's Brand Analysis as a snapshot (a score, the key findings, a reason to open it)
// while the Brand Analysis tab goes a layer deeper. Same data in all four; each uses different devices from the book:
// Ultra titles of 44 px and up, Ember mono labels and index numbers, hairline rows, Cobalt / Ember / Ink bands for
// statements, one glass object with Noor under it, viewfinder brackets, a row of small squares for progress.
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { navigate, useRoute } from '../../lib/router';
import { useStore } from '../../state/store';
import { useUI } from '../../state/ui';
import { analyses } from '../../data/mock';
import { fmtDate } from '../../lib/format';
import { cx } from '../../components/ui/primitives';
import { SparkiStill } from '../../components/ui/DrAi';
import { LatestFromSpark, fixes, useModel, type Model } from '../home/HomeLayouts';
import { HomeCredits } from './HomeRethinkDemo';
import { Gauge } from './HomeVariantsDemo';
import type { CompanyAnalysis } from '../../data/types';

const STYLES = [
  {
    v: '1',
    label: '1 · Editorial',
    note: 'The book’s spreads: no boxes at all. One Ultra headline that says where the brand stands (its second line in Cobalt), the figures as big numerals on hairlines, the findings as an Ember-indexed list. What needs you and what’s new follow as two columns of rules.',
  },
  {
    v: '2',
    label: '2 · Statement bands',
    note: '“Light grounds for ideas, Cobalt, Ember or Ink bands for statements” (p. 20). An Ink band says what needs you this week; the score sits in viewfinder brackets with a mono tag; the findings on the light ground; a Cobalt band asks to book Spark.',
  },
  {
    v: '3',
    label: '3 · One glass object',
    note: '“Frosted glass body · spectrum underneath · Ink on top” (p. 16), one per screen. The brand’s snapshot is the object, lit by Noor from below: the score, the fixes as a row of squares, the top three findings. Everything around it is quiet type and rules.',
  },
  {
    v: '4',
    label: '4 · Mixed tiles',
    note: 'A grid of tiles that are each a different thing: a big numeral, a gauge, an Ember band with the top finding, a list of decisions, Sparki with what’s new. Sizes and weights change from tile to tile, so the eye has a path.',
  },
] as const;
type V = (typeof STYLES)[number]['v'];

const REPORTS = (['website', 'social'] as const).map((k) => analyses.find((a) => a.kind === k)!).filter(Boolean);
const web = REPORTS.find((a) => a.kind === 'website')!;
const social = REPORTS.find((a) => a.kind === 'social')!;
const NAME: Record<string, string> = { social: 'Social media', website: 'Website' };
const reportHref = (a: CompanyAnalysis) => `#/brand-analysis/${a.kind}`;
const ALL = fixes(REPORTS);
const HIGH = ALL.filter(({ f }) => f.impact === 'High').length;
// The fixes done so far (illustrative: the prototype keeps no history of fixes).
const DONE = 2;

function Label({ children, tone = 'ember', className }: { children: React.ReactNode; tone?: 'ember' | 'ink' | 'light'; className?: string }) {
  return <span className={cx('hs-label', `hs-label--${tone}`, className)}>{children}</span>;
}

function Due({ w }: { w: Model['waiting'][number] }) {
  return <>{w.date ? `${w.date.label} ${fmtDate(w.date.iso)}` : w.type}</>;
}

/** The company's bar at the top, as on Home (Jean #29: "a company name bar at the top… was good"; #21: the profile
 *  one click from the scores): the mark, the name, a line with the profile link, the credits. */
export function Frame({ m }: { m: Model }) {
  return (
    <header className="hld-cobar hs-cobar">
      <span className="hld-co__mark">{m.brand.name[0]}</span>
      <span className="hld-cobar__text">
        <h1>{m.brand.name}</h1>
        <span>
          {m.brand.category} · {m.brand.hq}
          <a className="hld-link hld-cobar__profile" href="#/brand-analysis?tab=profile">
            Company profile <ArrowRight size={13} />
          </a>
        </span>
      </span>
      <span className="hld-cobar__acts">
        <HomeCredits />
      </span>
    </header>
  );
}

/** The squares row (p. 19): one square per fix, the done ones filled. */
function Squares({ done, total, light }: { done: number; total: number; light?: boolean }) {
  return (
    <span className={cx('hs-squares', light && 'hs-squares--light')} aria-label={`${done} of ${total} fixed`}>
      {Array.from({ length: total }).map((_, i) => (
        <i key={i} className={cx(i < done && 'is-done')} />
      ))}
    </span>
  );
}

function Findings({ limit = 3, light }: { limit?: number; light?: boolean }) {
  return (
    <ol className={cx('hs-findings', light && 'hs-findings--light')}>
      {ALL.slice(0, limit).map(({ a, f }, i) => (
        <li key={f.title}>
          <span className="hs-index">{String(i + 1).padStart(2, '0')}</span>
          <span className="hs-findings__text">
            <b>{f.title}</b>
            <span>{f.fix ?? f.body}</span>
          </span>
          <Label tone={light ? 'light' : 'ink'}>{NAME[a.kind]}</Label>
        </li>
      ))}
    </ol>
  );
}

function Moves({ m, light }: { m: Model; light?: boolean }) {
  return (
    <ol className={cx('hs-moves', light && 'hs-moves--light')}>
      {m.waiting.map((w, i) => (
        <li key={w.key}>
          <span className="hs-index">{String(i + 1).padStart(2, '0')}</span>
          <span className="hs-moves__text">
            <b>{w.title}</b>
            <span>
              {w.type} · <Due w={w} />
            </span>
          </span>
          <a className={cx('hs-btn', light ? 'hs-btn--white' : 'hs-btn--line')} href={w.href}>
            {w.action}
          </a>
        </li>
      ))}
    </ol>
  );
}

function Latest({ limit = 4 }: { limit?: number }) {
  return (
    <section className="hs-latest">
      <h2 className="hs-h2">
        <SparkiStill size={28} /> Latest from Spark
      </h2>
      <div className="hs-latest__list hld-card">
        <LatestFromSpark bare limit={limit} typed />
      </div>
    </section>
  );
}

function MoreLink({ children = 'See the full analysis', light }: { children?: React.ReactNode; light?: boolean }) {
  return (
    <a className={cx('hs-more', light && 'hs-more--light')} href="#/brand-analysis">
      {children} <ArrowUpRight size={15} />
    </a>
  );
}

// ---- 1 · Editorial --------------------------------------------------------------------------------
function StyleEditorial({ m }: { m: Model }) {
  return (
    <div className="hs hs-1">
      <Frame m={m} />
      <section className="hs-1-hero">
        <Label>Brand Analysis · October</Label>
        <h1 className="hs-display">
          On brand,
          <br />
          <span className="hs-cobalt">slow on mobile.</span>
        </h1>
        <p className="hs-lede">
          People like what they see on Instagram, but most visitors reach the site on a phone and leave before it loads. {HIGH} findings
          have high impact.
        </p>
      </section>
      <section className="hs-1-figs" aria-label="Key figures">
        <a href={reportHref(web)}>
          <Label tone="ink">Website · mobile speed</Label>
          <b className="hs-num">
            {parseInt(web.score?.value ?? '0', 10)}
            <i>/100</i>
          </b>
          <span className="hs-delta is-up">+6 since September</span>
        </a>
        <a href={reportHref(social)}>
          <Label tone="ink">Social · engagement</Label>
          <b className="hs-num">{social.score?.value}</b>
          <span className="hs-delta is-down">−0.4 pt since September</span>
        </a>
        <a href="#/brand-analysis">
          <Label tone="ink">Issues fixed</Label>
          <b className="hs-num">
            {DONE}
            <i>/{ALL.length + DONE}</i>
          </b>
          <Squares done={DONE} total={ALL.length + DONE} />
        </a>
      </section>
      <section className="hs-1-find">
        <h2 className="hs-h2">What we found first</h2>
        <Findings />
        <MoreLink />
      </section>
      <div className="hs-cols">
        <section>
          <h2 className="hs-h2">
            Your move <span className="hs-count">{m.waiting.length}</span>
          </h2>
          <Moves m={m} />
        </section>
        <Latest />
      </div>
    </div>
  );
}

// ---- 2 · Statement bands --------------------------------------------------------------------------
function StyleBands({ m }: { m: Model }) {
  const { openRequest } = useUI();
  return (
    <div className="hs hs-2">
      <Frame m={m} />
      <section className="hs-2-snap">
        <div className="hs-2-figs">
          <a className="hs-finder" href={reportHref(web)}>
            <span className="hs-finder__tag">Website · mobile speed</span>
            <b className="hs-num hs-num--xl">{parseInt(web.score?.value ?? '0', 10)}</b>
            <span className="hs-finder__sub">out of 100 · <span className="hs-delta is-up">+6 since September</span></span>
          </a>
          <a className="hs-finder" href={reportHref(social)}>
            <span className="hs-finder__tag">Social · engagement</span>
            <b className="hs-num hs-num--xl">{social.score?.value}</b>
            <span className="hs-finder__sub">on Instagram · <span className="hs-delta is-down">−0.4 pt since September</span></span>
          </a>
        </div>
        <div className="hs-2-snap__text">
          <Label>Brand Analysis · October</Label>
          <h2 className="hs-title">Your site looks like you. It just loads like it’s 2015.</h2>
          <Findings limit={3} />
          <MoreLink />
        </div>
      </section>
      <section className="hs-band hs-band--cobalt">
        <span>
          <Label tone="light">Spark strategists</Label>
          <h2 className="hs-title hs-title--light">Want these numbers to move? Book 30 minutes.</h2>
        </span>
        <button type="button" className="hs-btn hs-btn--white" onClick={() => openRequest({ type: 'Strategy', title: 'Consultation on the brand analysis' })}>
          Book a consultation <ArrowRight size={15} />
        </button>
      </section>
      <section className="hs-band hs-band--ink">
        <Label tone="light">This week</Label>
        <h2 className="hs-display hs-display--light hs-display--m">
          {m.waiting.length} decisions wait on you.
        </h2>
        <Moves m={m} light />
      </section>
      <Latest />
    </div>
  );
}

// ---- 3 · One glass object -------------------------------------------------------------------------
function StyleGlass({ m }: { m: Model }) {
  const { me } = useStore();
  return (
    <div className="hs hs-3">
      <Frame m={m} />
      <h1 className="hs-display hs-3-title">
        Good morning,
        <br />
        <span className="hs-cobalt">{me.name.split(' ')[0]}.</span>
      </h1>
      <section className="hs-glass">
        <div className="hs-glass__score">
          <Label>Brand Analysis</Label>
          <span className="hs-glass__gauge">
            <Gauge value={parseInt(web.score?.value ?? '0', 10)} />
            <span>
              <b>{parseInt(web.score?.value ?? '0', 10)}</b>
              <i>/100</i>
            </span>
          </span>
          <span className="hs-glass__label">Website · mobile speed</span>
          <span className="hs-glass__second">
            <b>{social.score?.value}</b> engagement on Instagram
          </span>
        </div>
        <div className="hs-glass__body">
          <span className="hs-glass__fixed">
            <Squares done={DONE} total={ALL.length + DONE} />
            {DONE} of {ALL.length + DONE} fixed
          </span>
          <Findings limit={3} />
          <MoreLink />
        </div>
      </section>
      <div className="hs-cols">
        <section>
          <h2 className="hs-h2">
            Your move <span className="hs-count">{m.waiting.length}</span>
          </h2>
          <Moves m={m} />
        </section>
        <Latest />
      </div>
    </div>
  );
}

// ---- 4 · Mixed tiles ------------------------------------------------------------------------------
function StyleTiles({ m }: { m: Model }) {
  const top = ALL[0];
  return (
    <div className="hs hs-4">
      <Frame m={m} />
      <h1 className="hs-display hs-4-title">Home</h1>
      <div className="hs-bento">
        <a className="hs-tile hs-tile--num" href={reportHref(social)}>
          <Label>Social · engagement</Label>
          <b className="hs-num hs-num--xl">{social.score?.value}</b>
          <span className="hs-bars">
            <span>
              <i style={{ width: '100%' }} /> You
            </span>
            <span>
              <i style={{ width: `${(1.9 / 3.4) * 100}%` }} /> UAE retail, typical
            </span>
          </span>
        </a>
        <a className="hs-tile hs-tile--gauge" href={reportHref(web)}>
          <Label>Website · mobile speed</Label>
          <span className="hs-glass__gauge">
            <Gauge value={parseInt(web.score?.value ?? '0', 10)} />
            <span>
              <b>{parseInt(web.score?.value ?? '0', 10)}</b>
              <i>/100</i>
            </span>
          </span>
          <span className="hs-delta is-up">+6 since September</span>
        </a>
        <a className="hs-tile hs-tile--ember" href={reportHref(top.a)}>
          <Label tone="light">Fix first · {top.f.impact} impact</Label>
          <b className="hs-title hs-title--light">{top.f.title}</b>
          <span>{top.f.fix ?? top.f.body}</span>
          <span className="hs-more hs-more--light">
            {ALL.length - 1} more in Brand Analysis <ArrowUpRight size={15} />
          </span>
        </a>
        <section className="hs-tile hs-tile--moves">
          <h2 className="hs-h2">
            Your move <span className="hs-count">{m.waiting.length}</span>
          </h2>
          <Moves m={m} />
        </section>
        <section className="hs-tile hs-tile--latest">
          <Latest limit={3} />
        </section>
      </div>
    </div>
  );
}

export function HomeStylesDemo() {
  const { query } = useRoute();
  const m = useModel(analyses);
  const v = (STYLES.find((s) => s.v === query.get('v'))?.v ?? '1') as V;
  const cur = STYLES.find((s) => s.v === v)!;
  const { state } = useStore();
  return (
    <div className="hs-page">
      <nav className="hs-switch" aria-label="Home styles">
        {STYLES.map((s) => (
          <button key={s.v} type="button" className={cx(s.v === v && 'is-on')} onClick={() => navigate(`/demo/home-styles?v=${s.v}`)}>
            {s.label}
          </button>
        ))}
      </nav>
      <p className="hs-note">
        {cur.note} <em>Brand Analysis tab, a layer deeper: every issue with how to fix it, the sources, the history and the company profile.</em>
        {state.onboarding && ' (Shown with the full demo data; your browser is in the new-company mode.)'}
      </p>
      {v === '1' && <StyleEditorial m={m} />}
      {v === '2' && <StyleBands m={m} />}
      {v === '3' && <StyleGlass m={m} />}
      {v === '4' && <StyleTiles m={m} />}
    </div>
  );
}

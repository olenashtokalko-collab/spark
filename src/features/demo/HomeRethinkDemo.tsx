// Prototype-only page (#/demo/home-rethink?v=…): Home rethought, after the review of 4 Nov. The page today is one
// column of full-width cards, the company's description takes the top, the issues are paged one at a time and what
// waits on the client is not on it. Four directions on the same data: A two columns, B brand health first, C Home and
// Brand Analysis apart (two pages), and C+A, the recommendation.
import { ArrowLeft, ArrowRight, Check, ChevronDown, Globe, Instagram, Linkedin, Music2 } from 'lucide-react';
import { CreditRing, CreditsCard, TopUpDialog } from '../../components/layout/Credits';
import { useStore } from '../../state/store';
import { useUI } from '../../state/ui';
import { useToast } from '../../components/ui/toast';
import { navigate, useRoute } from '../../lib/router';
import { PageHeader, cx } from '../../components/ui/primitives';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { SparkDisc } from '../../components/ui/BrandSpark';
import { SparkStar } from '../../components/ui/SparkStar';
import { AnalysisView } from '../home/AnalysisLooks';
import { NoReports } from '../onboarding/Onboarding';
import { ReportTiles } from './HomeVariantsDemo';
import { PortalHome } from './HomeCardsDemo';
import { SparkiStill } from '../../components/ui/DrAi';
import { AskButton, useDrAi } from '../../components/ui/DrAi';
import { ChatDrawer } from '../assistant/ChatDrawer';
import { ANALYSIS_ICON } from '../assistant/Home';
import { GlassTabs } from '../../components/ui/GlassTabs';
import { analyses } from '../../data/mock';
import { fmtDate } from '../../lib/format';
import { CreditsIndicator, LatestFromSpark, TeamLine, REPORT_LABEL, fixes, useModel, type Model } from '../home/HomeLayouts';
import type { CompanyAnalysis } from '../../data/types';

const LOOKS = [
  { v: 'g', label: 'G · Final · Home', note: 'Brand Analysis is its own section in the sidebar; Home keeps the work: the company, what needs you, the latest from Spark, and a short look at the reports with a way into Brand Analysis.' },
  { v: 'g-ba', label: 'G · Final · Brand Analysis', note: 'The section Jean asked for: titled Brand Analysis, two tabs under it, Overview (a card per report: score, status, one line, View report) and Company profile. Reports are cards, not tabs, so more of them only add cards.' },
  { v: 'g-report', label: 'G · Final · A report', note: 'A report as its own page, back to Brand Analysis at the top; the sidebar keeps Brand Analysis lit.' },
  { v: 'a', label: 'A · Two columns', note: 'A slim company row; Brand Analysis on the left (the scores in a row, every issue in one list by impact); on the right what needs you, then the latest from Spark, short.' },
  { v: 'b', label: 'B · Brand health first', note: 'One brand health score with the score of each channel under it (as Semrush, HubSpot Grader, Brand24), then the top three things to fix, then the tabs.' },
  { v: 'c-home', label: 'C · Home (action centre)', note: 'Home and Brand Analysis apart. Home answers “what now”: what needs you, a strip of report scores into Brand Analysis, the latest from Spark, a box to ask Spark.' },
  { v: 'c-ba', label: 'C · Brand Analysis page', note: 'Brand Analysis as its own item in the sidebar, as the client named it: a page title and its tabs at the top, Overview with the scores and every issue.' },
  { v: 'ca', label: 'C+A · Recommended', note: 'Home as A’s two columns without the tabs (the reports live on the Brand Analysis page); each score and issue leads into it.' },
  { v: 'f', label: 'F · Home (C+B)', note: 'Home and Brand Analysis apart (C), with B’s summary first. The company card carries its channels as round icons; Brand Analysis shows only the key figures and a status per channel, with Show all reports; Needs your action holds only what waits on you soon; the latest from Spark; the company’s details and team at the side.' },
  { v: 'f2', label: 'F2 · Tabs on the company', note: 'F with tabs in the company card, as on a profile: Overview shows everything short (the key figures, what needs you, the latest, what Spark works from, the team); Reports shows each report whole (its figures, the issues to fix, what works), chips switch between them, so every fix lives in one place; Company profile holds all Spark knows about the company. The tab sits in the address, so Back works.' },
  { v: 'f-ba', label: 'F · Brand Analysis page', note: 'Where Show all reports leads: back to Home at the top, the reports, then what we recommend fixing, by impact.' },
  { v: 'e', label: 'E · Profile at the side', note: 'After the company-page reference: the profile moves to a column on the right (facts, audiences, channels, team), so the tabs are only the analysis; the reports’ figures in one card with fine dividers; then what needs your action.' },
  { v: 'd', label: 'D · Status and next steps', note: 'C+A with what fits from Bitrix24’s Project Health: a status light per channel (not one score), the change since the last report, a one-line summary, and one queue of what to do next, each with its next step.' },
] as const;
type Look = (typeof LOOKS)[number]['v'];

const REPORTS = (['social', 'website'] as const).map((k) => analyses.find((a) => a.kind === k)!).filter(Boolean);
const NAME: Record<string, string> = { social: 'Social media', website: 'Website', brand: 'Brand', pr: 'PR' };
const reportHref = (a: CompanyAnalysis, issue?: string) => `#/?tab=${a.kind}${issue ? `&issue=${encodeURIComponent(issue)}` : ''}`;

/** A channel's status from its issues, as a traffic light (Bitrix24 Project Health): a high-impact issue puts it at
 *  risk, a medium one means it needs work. */
function status(a: CompanyAnalysis) {
  const open = a.findings.filter((f) => !f.good);
  if (open.some((f) => f.impact === 'High')) return { key: 'risk', label: 'At risk' };
  if (open.some((f) => f.impact === 'Medium')) return { key: 'work', label: 'Needs work' };
  return { key: 'good', label: 'Good' };
}
/** The change since the previous report (illustrative: the prototype keeps one report per channel). */
const SINCE: Record<string, { text: string; up: boolean }> = {
  social: { text: '−0.4 pt since September', up: false },
  website: { text: '+6 since September', up: true },
};

/** `to`: where each card leads (F2: its own Brand Analysis tab); `named`: the report named on its link and the counts
 *  under the line, as Jean asked (4 Nov: "high-level score / summary… and CTA to the social media report…"). */
function HealthCards({ to, named, extra, limit }: { to?: (a: CompanyAnalysis) => string; named?: boolean; extra?: ReactNode; limit?: number }) {
  return (
    <div className="hld-scores">
      {REPORTS.slice(0, limit).map((a) => {
        const st = status(a);
        const since = SINCE[a.kind];
        const open = a.findings.filter((f) => !f.good).length;
        const good = a.findings.filter((f) => f.good).length;
        return (
          <a key={a.kind} className="hld-score" href={to ? to(a) : reportHref(a)}>
            <span className="hld-score__top">
              <span className="hld-label hld-label--kind">
                {(() => {
                  const I = ANALYSIS_ICON[a.kind];
                  return <I size={13} strokeWidth={1.8} />;
                })()}
                {NAME[a.kind]}
              </span>
              <span className={cx('hld-status', `hld-status--${st.key}`)}>
                <i />
                {st.label}
              </span>
            </span>
            {a.score && (
              <span className="hld-score__num">
                <b>{a.score.value}</b> <span>{a.score.label}</span>
              </span>
            )}
            {since && <span className={cx('hld-delta', since.up ? 'is-up' : 'is-down')}>{since.text}</span>}
            <span className="hld-score__head">{a.headline}</span>
            {named && (
              <span className="hld-score__counts">
                {open} {open === 1 ? 'issue' : 'issues'} to fix · {good} working well
              </span>
            )}
            {named ? (
              <span className="hld-q__go hld-score__go">View {NAME[a.kind].toLowerCase()} report</span>
            ) : (
              <span className="hld-link">
                View report <ArrowRight size={13} />
              </span>
            )}
          </a>
        );
      })}
      {extra}
    </div>
  );
}

/** What to do next, in one queue (Bitrix24's Attention Inbox): what waits on the client first, then the issues by
 *  impact; each with its next step. */
// After the client's reference (4 Nov): a head with an icon tile, the title and a quiet link to everything on the
// right; when nothing waits, a small picture and "You're all caught up."
function NextSteps({ m, empty }: { m: Model; empty?: boolean }) {
  const issues = empty ? [] : fixes(REPORTS).filter(({ f }) => f.impact !== 'Low');
  const waiting = empty ? [] : m.waiting;
  const count = waiting.length + issues.length;
  return (
    <section className="hld-card">
      <header className="hld-act__head">
        <h3>Needs your action</h3>
        {count > 0 && <span className="hld-act__n">{count}</span>}
        <a className="hld-link hld-act__all" href="#/requests">
          View all requests <ArrowRight size={13} />
        </a>
      </header>
      {count === 0 ? (
        <div className="hld-caught">
          <CaughtArt />
          <b>You’re all caught up.</b>
          <span>Nothing waits on you. Spark will let you know when it does.</span>
        </div>
      ) : (
        <ol className="hld-queue">
          {waiting.map((w) => (
            <li key={w.key} className="hld-q">
              <span className="hld-q__kind hld-q__kind--you">Needs you</span>
              <span className="hld-q__text">
                <b>{w.title}</b>
                <span>
                  {w.type}
                  {w.date ? ` · ${w.date.label} ${fmtDate(w.date.iso)}` : ''}
                </span>
              </span>
              <a className="hld-q__go" href={w.href}>
                {w.action}
              </a>
            </li>
          ))}
          {issues.map(({ a, f }) => (
            <li key={a.kind + f.title} className="hld-q">
              <span className={cx('hl-impact', `hl-impact--${(f.impact ?? 'Low').toLowerCase()}`)}>{f.impact}</span>
              <span className="hld-q__text">
                <b>{f.title}</b>
                <span>Next: {f.fix ?? f.body}</span>
              </span>
              <span className="hld-q__acts">
                <button type="button" className="hld-q__go">
                  Request proposal
                </button>
                <a className="hld-link" href={reportHref(a, f.title)}>
                  {NAME[a.kind]} report <ArrowRight size={13} />
                </a>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** E: the reports' figures in one card, cells split by fine lines (after the reference's stats row). */
function FigureRow() {
  const open = fixes(REPORTS).length;
  const works = REPORTS.reduce((n, a) => n + a.findings.filter((f) => f.good).length, 0);
  const cells = [
    ...REPORTS.map((a) => ({ label: a.score?.label ?? NAME[a.kind], value: a.score?.value ?? '—', st: status(a) as { key: string; label: string } | undefined, href: reportHref(a) as string | undefined })),
    { label: 'Issues to fix', value: String(open), st: undefined, href: undefined },
    { label: 'Working well', value: String(works), st: undefined, href: undefined },
  ];
  return (
    <div className="hld-figs">
      {cells.map((c) => {
        const inner = (
          <>
            <span className="hld-figs__label">{c.label}</span>
            <b>{c.value}</b>
            {c.st && (
              <span className={cx('hld-status', `hld-status--${c.st.key}`)}>
                <i />
                {c.st.label}
              </span>
            )}
          </>
        );
        return c.href ? (
          <a key={c.label} className="hld-figs__cell" href={c.href}>
            {inner}
          </a>
        ) : (
          <span key={c.label} className="hld-figs__cell">
            {inner}
          </span>
        );
      })}
    </div>
  );
}

/** E's right column: the company profile as short blocks of facts, after the reference's side panels. */
function ProfileSide() {
  const { state } = useStore();
  const b = state.brand;
  const team = state.people.filter((p) => p.org !== 'spark');
  const facts: [string, string][] = [
    ['Category', b.category],
    ['Head office', b.hq],
    ['Founded', b.founded],
    ['Footprint', b.footprint],
  ];
  const social = REPORTS.find((a) => a.kind === 'social');
  const web = REPORTS.find((a) => a.kind === 'website');
  const chans: [typeof Globe, string, CompanyAnalysis | undefined][] = [
    [Globe, b.website, web],
    [Instagram, 'Instagram', social],
    [Music2, 'TikTok', social],
  ];
  return (
    <aside className="hld-side">
      <section className="hld-card">
        <h3 className="hld-title">Company profile</h3>
        <dl className="hld-facts">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="hld-card">
        <h3 className="hld-title">Audiences</h3>
        <ul className="hld-aud">
          {b.audiences.map((a) => (
            <li key={a.name}>
              <b>{a.name}</b>
              <span>{a.detail}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="hld-card">
        <h3 className="hld-title">Channels</h3>
        <ul className="hld-chan">
          {chans.map(([I, name, rep]) => (
            <li key={name}>
              <I size={16} strokeWidth={1.7} />
              <span>{name}</span>
              {rep && (
                <a className="hld-link" href={reportHref(rep)}>
                  Report <ArrowRight size={13} />
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section className="hld-card">
        <h3 className="hld-title">
          {b.name} team <span>{team.length}</span>
        </h3>
        <ul className="hld-team">
          {team.map((p) => (
            <li key={p.id}>
              <span className="hld-team__av">
                {p.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)}
              </span>
              <span>
                <b>{p.name}</b>
                <span>{p.title}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

/** F: the company card, its channels as round icons (after the client's reference); each opens the report on it. */
function CompanyCard({ m, tabs, channels = true, team }: { m: Model; tabs?: ReactNode; channels?: boolean; team?: boolean }) {
  const [chat, setChat] = useState(false);
  // Dr.AI on: Ask lives in the menu ("Ask Dr.AI"), so the card drops its own (5 Nov).
  const drai = useDrAi();
  const social = REPORTS.find((a) => a.kind === 'social');
  const web = REPORTS.find((a) => a.kind === 'website');
  const chans: [typeof Globe, string, CompanyAnalysis | undefined][] = [
    [Globe, m.brand.website, web],
    [Instagram, 'Instagram', social],
    [Music2, 'TikTok', social],
    [Linkedin, 'LinkedIn', undefined],
  ];
  return (
    <header className={cx('hld-card hld-co', !!tabs && 'hld-co--tabs')}>
      <div className="hld-co__row">
      <span className="hld-co__mark">B</span>
      <span className="hld-co__text">
        <b>{m.brand.name}</b>
        <span>{m.brand.tagline}</span>
        {team && (
          <span className="hld-co__team">
            <TeamLine />
          </span>
        )}
        {channels && (
        <span className="hld-co__chans">
          {chans.map(([I, name, rep]) => (
            <a key={name} className="hld-chip" href={rep ? reportHref(rep) : undefined} data-tip={rep ? `${name} · ${REPORT_LABEL[rep.kind]}` : name} aria-label={name}>
              <I size={15} strokeWidth={1.8} />
            </a>
          ))}
        </span>
        )}
      </span>
      <span className="hld-co__acts">
        <CreditsIndicator />
        {!drai && <AskButton onClick={() => setChat(true)} />}
        <ChatDrawer open={chat} onClose={() => setChat(false)} />
      </span>
      </div>
      {tabs}
    </header>
  );
}

/** F: Brand Analysis on Home, B's summary: a line on where the brand stands and the key figures with a status. */
function BrandAnalysisSummary({ href = '#/demo/home-rethink?v=f-ba', perReport }: { href?: string; perReport?: boolean }) {
  // F2 (Jean, 4 Nov): a card per report, its score, status and one line, and a link into that report.
  if (perReport)
    return (
      <section className="hld-card">
        <h3 className="hld-title">Brand Analysis</h3>
        <HealthCards named to={(a) => `#/demo/home-rethink?v=f2&tab=analysis&r=${a.kind}`} />
      </section>
    );
  return (
    <section className="hld-card">
      <h3 className="hld-title">
        Brand Analysis
        <a className="hld-link" href={href}>
          View all reports <ArrowRight size={13} />
        </a>
      </h3>
      <FigureRow />
    </section>
  );
}

type Art = 'none' | 'tray' | 'check' | 'clip' | 'fcheck' | 'gcheck' | 'stack' | 'spark';
const ARTS: [Art, string][] = [
  ['none', 'None'],
  ['tray', 'Tray'],
  ['check', 'Checklist'],
  ['clip', 'Checklist · clipboard'],
  ['fcheck', 'Checklist · in a folder'],
  ['gcheck', 'Checklist · on glass'],
  ['stack', 'Stack'],
  ['spark', 'Spark on it'],
];
/** Needs your action, empty: pictures in the folders' glass to compare (#/demo/home-rethink?v=f2&empty=1&art=…).
 *  Tray: an inbox tray. Checklist: the list's own rows, each ticked. Stack: the decisions fanned out, the top one
 *  done. Spark on it: Spark's star in a glass orb, the ball with Spark. */
function CaughtArt() {
  const { query } = useRoute();
  const art = (ARTS.find(([a]) => a === query.get('art'))?.[0] ?? 'none') as Art;
  if (art === 'none') return null;
  const badge = (
    <span className="hld-caught__badge">
      <Check size={16} strokeWidth={2.4} />
    </span>
  );
  if (art === 'check')
    return (
      <span className="hld-caught__art hld-art hld-art--check" aria-hidden>
        <span className="hld-art__card">
          {[0, 1, 2].map((i) => (
            <span key={i} className="hld-art__row">
              <span className="hld-art__tick">
                <Check size={9} strokeWidth={3} />
              </span>
              <i />
            </span>
          ))}
        </span>
      </span>
    );
  // The checklist as the folders are built: the light on a back with its tab, a white page, frosted glass in front.
  const ticks = (n: number) =>
    Array.from({ length: n }, (_, i) => (
      <span key={i} className="hld-art__line">
        <span className="hld-art__tick">
          <Check size={9} strokeWidth={3} />
        </span>
        <i />
      </span>
    ));
  if (art === 'clip')
    return (
      <span className="hld-caught__art hld-art hld-art--clip" aria-hidden>
        <span className="hld-art__board" />
        <span className="hld-art__clip" />
        <span className="hld-art__page">{ticks(3)}</span>
      </span>
    );
  if (art === 'fcheck')
    return (
      <span className="hld-caught__art hld-art hld-art--fcheck" aria-hidden>
        <span className="hld-art__fback" />
        <span className="hld-art__page">{ticks(3)}</span>
        <span className="hld-art__ffront" />
      </span>
    );
  if (art === 'gcheck')
    return (
      <span className="hld-caught__art hld-art hld-art--gcheck" aria-hidden>
        <span className="hld-art__fback" />
        <span className="hld-art__glass">{ticks(3)}</span>
      </span>
    );
  if (art === 'stack')
    return (
      <span className="hld-caught__art hld-art hld-art--stack" aria-hidden>
        <span className="hld-art__plate hld-art__plate--1" />
        <span className="hld-art__plate hld-art__plate--2" />
        <span className="hld-art__plate hld-art__plate--top">
          <i />
          <i />
        </span>
        {badge}
      </span>
    );
  if (art === 'spark')
    return (
      <span className="hld-caught__art hld-art hld-art--spark" aria-hidden>
        <span className="hld-art__orb">
          <SparkStar size={30} strokeWidth={1.8} />
        </span>
        {badge}
      </span>
    );
  return (
    <span className="hld-caught__art hld-tray" aria-hidden>
      <span className="hld-tray__back" />
      <span className="hld-tray__sheet">
        <i />
        <i />
      </span>
      <span className="hld-tray__front" />
      {badge}
    </span>
  );
}

/** F: only what waits on the client soon (decisions, feedback, files to approve); issues live in Brand Analysis. */
function NeedsAction({ m, empty }: { m: Model; empty?: boolean }) {
  const list = empty ? [] : m.waiting;
  return (
    <section className="hld-card">
      <header className="hld-act__head">
        <h3>Needs your action</h3>
        {list.length > 0 && <span className="hld-act__n">{list.length}</span>}
        <a className="hld-link hld-act__all" href="#/requests">
          View all requests <ArrowRight size={13} />
        </a>
      </header>
      {list.length === 0 ? (
        <div className="hld-caught">
          <CaughtArt />
          <b>You’re all caught up.</b>
          <span>Nothing waits on you. Spark will let you know when it does.</span>
        </div>
      ) : (
        <ol className="hld-queue">
          {list.map((w) => (
            <li key={w.key} className="hld-q hld-q--plain">
              <span className="hld-q__text">
                <b>{w.title}</b>
                <span>
                  {w.type}
                  {w.date ? ` · ${w.date.label} ${fmtDate(w.date.iso)}` : ''}
                </span>
              </span>
              <a className="hld-q__go" href={w.href}>
                {w.action}
              </a>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** F: the company's details and its team, the side column (E's blocks without audiences and channels). */
type KnowMode = 'f' | 'short' | 'full';
/** F, F2: what Spark works from. F shows six points; F2's Overview three of them, short; its Company profile all. */
function KnowCard({ mode }: { mode: KnowMode }) {
  const { state } = useStore();
  const { openRequest } = useUI();
  const b = state.brand;
  const rows: [string, ReactNode][] = [];
  if (mode === 'full') rows.push(['Positioning', `${b.positioning} ${b.reach}`]);
  rows.push(['Markets and languages', 'UAE, KSA next · English and Arabic']);
  if (mode !== 'short') rows.push(['Where it sells', b.footprint]);
  rows.push([
    'Audiences',
    mode === 'short' ? (
      b.audiences.map((a) => a.name).join(' · ')
    ) : (
      <ul className="hld-know__aud">
        {b.audiences.map((a) => (
          <li key={a.name}>
            <b>{a.name}</b>
            <span>{a.detail}</span>
          </li>
        ))}
      </ul>
    ),
  ]);
  if (mode !== 'short') rows.push(['Voice', b.voice.join(' · ')], ['Compared with', b.competitors.join(', ')]);
  // The channels Spark reads, and the one it doesn't yet, with a way to ask for it (in place of a Channels card).
  if (mode === 'full')
    rows.push(
      ['Channels', 'Website · Instagram · TikTok'],
      [
        'Not analysed yet',
        <span className="hld-know__gap">
          LinkedIn
          <button
            type="button"
            className="hld-link"
            onClick={() => openRequest({ title: 'Analyse our LinkedIn', description: 'Add LinkedIn to Brand Analysis: how we show up there, what works and what to fix.' })}
          >
            Ask Spark to analyse <ArrowRight size={13} />
          </button>
        </span>,
      ],
    );
  rows.push(['Focus now', 'Ramadan 2027 · the Riyadh flagship · TikTok of its own']);
  if (mode === 'full')
    rows.push([
      'Key dates',
      <ul className="hld-know__aud">
        {b.keyDates.map((d) => (
          <li key={d.label}>
            <b>{d.label}</b>
            <span>{fmtDate(d.date)}</span>
          </li>
        ))}
      </ul>,
    ]);
  return (
    <section className="hld-card">
      <h3 className="hld-title">
        What Spark works from
        {mode === 'short' && (
          <a className="hld-link" href="#/demo/home-rethink?v=f2&tab=profile">
            View profile <ArrowRight size={13} />
          </a>
        )}
      </h3>
      <dl className="hld-know">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function TeamCard() {
  const { state } = useStore();
  const team = state.people.filter((p) => p.org !== 'spark');
  return (
    <section className="hld-card">
      <h3 className="hld-title">
        {state.brand.name} team
      </h3>
      <ul className="hld-team">
        {team.map((p) => (
          <li key={p.id}>
            <span className="hld-team__av">
              {p.name
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)}
            </span>
            <span>
              <b>{p.name}</b>
              <span>{p.title}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** F2's Company profile tab (4 Nov): the Overview card's groups, labels and tags, in full — so opening it from the
 *  card continues what the card showed. Key dates as Coming up, the register facts beside. */
const BRIEF_MARKETS = ['UAE', 'KSA next', 'English', 'Arabic'];
const BRIEF_FOCUS = ['Ramadan 2027', 'Riyadh flagship', 'TikTok'];
function Tags({ items }: { items: string[] }) {
  return (
    <span className="hld-brief__tags">
      {items.map((t) => (
        <span key={t} className="hld-tag">
          {t}
        </span>
      ))}
    </span>
  );
}
export function ProfileFull() {
  const { state } = useStore();
  const b = state.brand;
  // The Overview card's three groups first, in its order and look; the rest under "More about…".
  const glance: [string, ReactNode][] = [
    ['Focus now', <Tags items={BRIEF_FOCUS} />],
    ['Markets', <Tags items={BRIEF_MARKETS} />],
    [
      'Audiences',
      <ul className="hld-brief__aud">
        {b.audiences.map((a) => (
          <li key={a.name}>
            <span className="hld-tag">{a.name}</span>
            <span>{a.detail}</span>
          </li>
        ))}
      </ul>,
    ],
  ];
  const more: [string, ReactNode][] = [
    ['Where it sells', <Tags items={['14 stores in the UAE', 'Online store', '60 partner retailers']} />],
    ['Voice', <Tags items={b.voice} />],
    ['Compared with', <Tags items={b.competitors} />],
    ['Channels', <Tags items={['Website', 'Instagram', 'TikTok']} />],
  ];
  const list = (gs: [string, ReactNode][]) => (
    <div className="hld-brief">
      {gs.map(([k, v]) => (
        <div key={k}>
          <span className="hld-brief__k">{k}</span>
          {v}
        </div>
      ))}
    </div>
  );
  return (
    <section className="hld-card">
      <h3 className="hld-title">Brand brief</h3>
      {/* The positioning as the brief's lead, under its title. */}
      <p className="hld-brief__lead">{`${b.positioning} ${b.reach}`}</p>
      {list([...glance, ...more])}
    </section>
  );
}

type Side = 'list' | 'tags' | 'sentence' | 'coming';
const SIDES: [Side, string][] = [
  ['list', 'Now · list'],
  ['tags', 'Tags'],
  ['sentence', 'One sentence'],
  ['coming', 'Coming up'],
];
/** F2 Overview's side block, four ways to compare (#/demo/home-rethink?v=f2&side=…). */
function SideBrief() {
  const { query } = useRoute();
  const { state } = useStore();
  const b = state.brand;
  const side = (SIDES.find(([x]) => x === query.get('side'))?.[0] ?? 'tags') as Side;
  const profile = (
    <a className="hld-link" href="#/demo/home-rethink?v=f2&tab=profile">
      View all <ArrowRight size={13} />
    </a>
  );
  if (side === 'tags') {
    const groups: [string, string[]][] = [
      ['Focus now', BRIEF_FOCUS],
      ['Markets', BRIEF_MARKETS],
      ['Audiences', b.audiences.map((a) => a.name)],
    ];
    return (
      <section className="hld-card">
        <h3 className="hld-title">
          Company profile
          {profile}
        </h3>
        <div className="hld-brief">
          {groups.map(([k, tags]) => (
            <div key={k}>
              <span className="hld-brief__k">{k}</span>
              <span className="hld-brief__tags">
                {tags.map((t) => (
                  <span key={t} className="hld-tag">
                    {t}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (side === 'sentence')
    return (
      <section className="hld-card">
        <h3 className="hld-title">
          Brand brief
          {profile}
        </h3>
        <p className="hld-brief__text">
          Spark works for <b>{b.name}</b> in the <b>UAE</b>, with <b>KSA</b> next, for young professionals, weekend shoppers and retail partners. Focus now:{' '}
          <b>Ramadan 2027</b>, the <b>Riyadh flagship</b> and a <b>TikTok</b> of its own.
        </p>
      </section>
    );
  if (side === 'coming')
    return (
      <section className="hld-card">
        <h3 className="hld-title">Coming up</h3>
        <ol className="hld-dates">
          {b.keyDates.map((d) => (
            <li key={d.label}>
              <span className="hld-dates__day">
                <b>{new Date(d.date).getDate()}</b>
                <span>{new Date(d.date).toLocaleString('en-GB', { month: 'short' })}</span>
              </span>
              <span className="hld-dates__text">{d.label}</span>
            </li>
          ))}
        </ol>
        <a className="hld-link hld-dates__more" href="#/demo/home-rethink?v=f2&tab=profile">
          Markets, audiences and voice in Company profile <ArrowRight size={13} />
        </a>
      </section>
    );
  return <KnowCard mode="short" />;
}


/** F2's Company profile: the company's register facts beside what Spark works from. */
export function FactsCard({ more }: { more?: string }) {
  const { state } = useStore();
  const b = state.brand;
  const facts: [string, string][] = [
    ['Legal name', b.legalName],
    ['Category', b.category],
    ['Founded', b.founded],
    ['Head office', b.hq],
    ['Website', b.website],
  ];
  return (
    <section className="hld-card">
      <h3 className="hld-title">
        Company details
        {more && (
          <a className="hld-link" href={`#${more}`}>
            Full profile <ArrowRight size={13} />
          </a>
        )}
      </h3>
      <dl className="hld-facts">
        {facts.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function DetailsSide() {
  return (
    <aside className="hld-side">
      <KnowCard mode="f" />
      <TeamCard />
    </aside>
  );
}

function SlimHead({ m }: { m: Model }) {
  return (
    <header className="hld-head">
      <span className="hld-head__mark">B</span>
      <span className="hld-head__name">
        <b>{m.brand.name}</b>
        <span>{m.brand.tagline}</span>
      </span>
      <span className="hld-head__credits">USD 64.20 credits</span>
      <button type="button" className="hl-mchat">
        <SparkDisc size={28} /> Ask Spark
      </button>
    </header>
  );
}

function Scores({ compact }: { compact?: boolean }) {
  return (
    <div className={cx('hld-scores', compact && 'hld-scores--compact')}>
      {REPORTS.map((a) => (
        <a key={a.kind} className="hld-score" href={reportHref(a)}>
          <span className="hld-label">{NAME[a.kind]}</span>
          {a.score && (
            <span className="hld-score__num">
              <b>{a.score.value}</b> <span>{a.score.label}</span>
            </span>
          )}
          {!compact && <span className="hld-score__head">{a.headline}</span>}
          <span className="hld-link">
            View report <ArrowRight size={13} />
          </span>
        </a>
      ))}
    </div>
  );
}

function IssueList({ limit, kind }: { limit?: number; kind?: string }) {
  const list = fixes(REPORTS)
    .filter(({ a }) => !kind || a.kind === kind)
    .slice(0, limit);
  const p = useContext(GPathsCtx);
  return (
    <ol className="hld-issues">
      {list.map(({ a, f }) => (
        <li key={a.kind + f.title} className="hld-issue">
          <span className={cx('hl-impact', `hl-impact--${(f.impact ?? 'Low').toLowerCase()}`)}>{f.impact ?? 'Low'}</span>
          <span className="hld-issue__text">
            <b>{f.title}</b>
            <span>{f.fix ?? f.body}</span>
          </span>
          <span className="hld-label">{NAME[a.kind]}</span>
          <a className="hld-link" href={`#${p.report(a.kind)}${p.report(a.kind).includes('?') ? '&' : '?'}issue=${encodeURIComponent(f.title)}`}>
            See in report <ArrowRight size={13} />
          </a>
        </li>
      ))}
    </ol>
  );
}

function NeedsYou({ m }: { m: Model }) {
  return (
    <section className="hld-card">
      <h3 className="hld-title">
        Needs you <span>{m.waiting.length}</span>
      </h3>
      <ul className="hld-needs">
        {m.waiting.map((w) => (
          <li key={w.key}>
            <a href={w.href} className="hld-need">
              <span className="hld-label">{w.type}</span>
              <b>{w.title}</b>
              <span className="hld-need__meta">
                {w.date ? `${w.date.label} ${fmtDate(w.date.iso)}` : w.statusLabel}
                <span className="hld-link">{w.action}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Latest() {
  return (
    <section className="hld-card">
      {/* No "View all" (5 Nov): there's no history to open yet, so the card shows the last four (the team card
          sits under it). */}
      {/* Sparki by the title (9 Nov, Jean #23: "mascot in this section to make it visually interesting"). */}
      <h3 className="hld-title hld-title--sparki">
        <SparkiStill size={28} />
        Latest from Spark
      </h3>
      <LatestFromSpark bare limit={4} typed />
    </section>
  );
}

function BrandAnalysisBlock({ tabs }: { tabs?: boolean }) {
  return (
    <section className="hld-card">
      <h3 className="hld-title">Brand Analysis</h3>
      {tabs && (
        <nav className="hl-tabs hld-tabs">
          {['Overview', 'Company profile', ...REPORTS.map((a) => REPORT_LABEL[a.kind])].map((t, i) => (
            <button key={t} type="button" className={cx(i === 0 && 'is-on')}>
              {t}
            </button>
          ))}
        </nav>
      )}
      <Scores />
      <h4 className="hld-sub">
        Issues to fix <span>{fixes(REPORTS).length}</span>
      </h4>
      <IssueList />
    </section>
  );
}

// ---- G: Home and Brand Analysis apart (5 Nov) — the portal's Home since 5 Nov; the demo shows the same views ----
/** Where G's links go: on the demo page, or in the portal (/, /brand-analysis, /brand-analysis/social). */
type GPaths = { ba: string; profile: string; report: (kind: string) => string };
const DEMO_PATHS: GPaths = {
  ba: '/demo/home-rethink?v=g-ba',
  profile: '/demo/home-rethink?v=g-ba&tab=profile',
  report: (k) => `/demo/home-rethink?v=g-report&r=${k}`,
};
const PORTAL_PATHS: GPaths = { ba: '/brand-analysis', profile: '/brand-analysis?tab=profile', report: (k) => `/brand-analysis/${k}` };
const GPathsCtx = createContext<GPaths>(DEMO_PATHS);

/** The credits on Home's head (5 Nov): plain text on one line: a small ring of what's left, the balance,
 *  "credits" and a chevron that turns up while the breakdown (with Top up) is open. No hover; a click opens and
 *  closes it, Escape or a click elsewhere closes it too. */
export function HomeCredits() {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const [topUp, setTopUp] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  const left = state.credits;
  const total = state.creditsTotal;
  const usd = (n: number) => `USD ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  return (
    <span ref={box} className={cx('hld-credits', open && 'is-open', left < total * 0.2 && 'is-low')}>
      <button type="button" className="hld-credits__main" aria-expanded={open} aria-controls="hld-credits-card" onClick={() => setOpen((o) => !o)}>
        <CreditRing left={left} total={total} size={16} stroke={2.5} />
        <b>{usd(left)}</b>
        <span>credits</span>
        <ChevronDown size={14} strokeWidth={2} className="hld-credits__chev" aria-hidden />
      </button>
      {open && (
        <span className="hl-cind__card hld-credits__card" id="hld-credits-card" role="dialog" aria-label="Credits">
          <CreditsCard
            left={left}
            total={total}
            onTopUp={() => {
              setOpen(false);
              setTopUp(true);
            }}
          />
        </span>
      )}
      <TopUpDialog open={topUp} onClose={() => setTopUp(false)} />
    </span>
  );
}

/** The company's bar on Home (9 Nov, Jean #29: "there was a company name bar at the top in last version, which
 *  was good"; #21: the profile near the scores, not two layers down): the mark, the name and the line, the
 *  channels Spark reports on, a link to the company profile; the credits on the right. */
function HomeCompanyBar({ m }: { m: Model }) {
  const p = useContext(GPathsCtx);
  const [chat, setChat] = useState(false);
  const drai = useDrAi();
  // No channel icons (9 Nov, review): the report tiles under the bar lead to the same reports.
  return (
    <header className="hld-cobar">
      <span className="hld-co__mark">{m.brand.name[0]}</span>
      <span className="hld-cobar__text">
        <h1>{m.brand.name}</h1>
        <span>
          {m.brand.category} · {m.brand.hq}
          <a className="hld-link hld-cobar__profile" href={`#${p.profile}`}>
            Company profile <ArrowRight size={13} />
          </a>
        </span>
      </span>
      <span className="hld-cobar__acts">
        <HomeCredits />
        {!drai && <AskButton onClick={() => setChat(true)} />}
        <ChatDrawer open={chat} onClose={() => setChat(false)} />
      </span>
    </header>
  );
}

/** Under the figures (9 Nov, Jean #22: "encourage to learn more and book consultation, services"): one line and a
 *  button that opens a request to talk it through with Spark. */
export function BookSpark() {
  const { openRequest } = useUI();
  return (
    <div className="hld-book">
      <span className="hld-book__label">Spark strategists · 30 min</span>
      <span>
        <b>Want these numbers to move?</b>
        <span>We walk you through the reports and what to fix first.</span>
      </span>
      <button
        type="button"
        className="hv-btn hv-btn--white hld-book__go"
        onClick={() => openRequest({ type: 'Strategy', title: 'Consultation on the brand analysis' })}
      >
        Book a consultation
      </button>
    </div>
  );
}

function GHomeView({ m, empty }: { m: Model; empty?: boolean }) {
  const p = useContext(GPathsCtx);
  return (
    <>
      {/* 9 Nov, Jean's review of 6 Nov: the company's bar back at the top (#29), with its profile one click away
          (#21); Brand Analysis in big figures with a way to book Spark (#22); fewer boxes (#20); Sparki at the
          latest (#23); no team card, Home was heavy (#24). */}
      <HomeCompanyBar m={m} />
      <div className="hld-cols">
        <div className="hld-main">
          <section className="hld-ba-home">
            <h3 className="hld-title">
              Brand Analysis
              <a className="hld-link" href={`#${p.ba}`}>
                All reports <ArrowRight size={13} />
              </a>
            </h3>
            <ReportTiles href={(a) => `#${p.report(a.kind)}`} />
          </section>
          <NeedsAction m={m} empty={empty} />
        </div>
        <aside className="hld-side">
          {/* The consultation, accented, first in the side column (9 Nov, review). */}
          <BookSpark />
          <Latest />
        </aside>
      </div>
    </>
  );
}

function GBrandAnalysisView({ m, tab, empty }: { m: Model; tab: 'overview' | 'profile'; empty?: boolean }) {
  const p = useContext(GPathsCtx);
  const toast = useToast();
  return (
    <>
      <header className="hld-page">
        <h1 className="hld-greet">Brand Analysis</h1>
        <p>What Spark found about {m.brand.name}, report by report, and what it works from.</p>
        <nav className="hl-tabs hld-tabs hld-page__tabs">
          {(
            [
              ['overview', 'Reports'],
              ['profile', 'Company profile'],
            ] as const
          ).map(([t, label]) => (
            <button key={t} type="button" className={cx(tab === t && 'is-on')} onClick={() => navigate(t === 'profile' ? p.profile : p.ba)}>
              {label}
            </button>
          ))}
        </nav>
      </header>
      {tab === 'overview' && empty ? (
        // A new company (onboarding, 6 Nov): no reports until it asks for one.
        <NoReports />
      ) : tab === 'overview' ? (
        // The Reports tab, a layer under Home (9 Nov, Jean #25: "different layer information"; #21: the profile near
        // the scores): Home has the headline figures; here each report's card, then every issue by impact, and the
        // company's details beside them.
        <div className="hld-cols">
        <div className="hld-main">
        <section className="hld-ba-reports">
          <HealthCards
            named
            to={(a) => `#${p.report(a.kind)}`}
            extra={
              <button
                type="button"
                className="hld-score hld-score--new"
                // The flow isn't designed yet (5 Nov): the card looks and feels clickable, a click says it's coming.
                onClick={() => toast({ title: 'Requesting a report is coming soon.', tone: 'info' })}
              >
                {/* No icon (5 Nov, review): the title and the line say it. */}
                <b>Request a report</b>
                <span>Your LinkedIn, a competitor, a campaign: ask Spark to look into anything, and the report appears here.</span>
              </button>
            }
          />
        </section>
          <section className="hld-card">
            <h3 className="hld-title">
              What to fix, by impact <span>{fixes(REPORTS).length}</span>
            </h3>
            <IssueList />
          </section>
        </div>
          <aside className="hld-side">
            <FactsCard more={p.profile} />
          </aside>
        </div>
      ) : (
        <div className="hld-cols">
          <ProfileFull />
          <aside className="hld-side">
            <FactsCard />
          </aside>
        </div>
      )}
    </>
  );
}

function GReportView({ kind, issue }: { kind?: string; issue?: string }) {
  const p = useContext(GPathsCtx);
  const report = REPORTS.find((a) => a.kind === kind) ?? REPORTS[0];
  return (
    <>
      <span className="hld-report-top">
        {/* In the portal a report goes back to Home (9 Nov: no Brand Analysis tab, Home is the analysis). */}
        {p === PORTAL_PATHS ? (
          <a className="back hld-back" href="#/">
            <ArrowLeft size={15} /> Home
          </a>
        ) : (
          <a className="back hld-back" href={`#${p.ba}`}>
            <ArrowLeft size={15} /> Brand Analysis
          </a>
        )}
        {/* Jean #26 (9 Nov): the live report lives here; a PDF copy, to share or download, is in Documents. */}
        <a className="hld-link hld-report-pdf" href={`#/documents/f-research?doc=d-rep-${report.kind}`}>
          PDF copy in Documents · Research reports <ArrowRight size={13} />
        </a>
      </span>
      <AnalysisView key={report.kind} a={report} look="cards" page focus={issue} />
    </>
  );
}

/** The portal's pages (5 Nov): Home, Brand Analysis (#/brand-analysis, ?tab=profile) and a report
 *  (#/brand-analysis/social), with the portal's links. */
export function GHomePage() {
  const m = useModel(analyses);
  // Links from before 5 Nov (#/?tab=social&issue=…) open the report's page now.
  const { query } = useRoute();
  const old = query.get('tab');
  useEffect(() => {
    if (old === 'profile') navigate(PORTAL_PATHS.profile, { replace: true });
    else if (old && REPORTS.some((a) => a.kind === old)) {
      const issue = query.get('issue');
      navigate(`${PORTAL_PATHS.report(old)}${issue ? `?issue=${encodeURIComponent(issue)}` : ''}`, { replace: true });
    }
  }, [old, query]);
  return (
    <GPathsCtx.Provider value={PORTAL_PATHS}>
      {/* Home since 9 Nov: the reports and the consultation, the latest from Spark (#/demo/home-cards?v=d). */}
      <div className="hld">
        <PortalHome m={m} />
      </div>
    </GPathsCtx.Provider>
  );
}

/** The company profile, its own page under Home (9 Nov): back to Home, the profile and the company's details. */
function ToHome() {
  useEffect(() => navigate('/', { replace: true }), []);
  return null;
}

function ProfilePage() {
  const { state } = useStore();
  return (
    <>
      <a className="back hld-back" href="#/">
        <ArrowLeft size={15} /> Home
      </a>
      <header className="hld-page">
        <h1 className="hld-greet">Company profile</h1>
        <p>What Spark knows about {state.brand.name} and works from.</p>
      </header>
      <div className="hld-cols">
        <ProfileFull />
        <aside className="hld-side">
          <FactsCard />
        </aside>
      </div>
    </>
  );
}

/** Old links (#/brand-analysis/website, ?tab=profile) open Home's tab since 9 Nov (the tabs Home). */
function ToHomeTab({ tab, issue }: { tab: string; issue?: string | null }) {
  useEffect(() => navigate(`/?tab=${tab}${issue ? `&issue=${encodeURIComponent(issue)}` : ''}`, { replace: true }), [tab, issue]);
  return null;
}

export function GBrandAnalysisPage({ kind }: { kind?: string }) {
  const m = useModel(analyses);
  const { query } = useRoute();
  const empty = !!useStore().state.onboarding;
  if (!empty && kind && REPORTS.some((a) => a.kind === kind)) return <ToHomeTab tab={kind} issue={query.get('issue')} />;
  if (!empty && query.get('tab') === 'profile') return <ToHomeTab tab="profile" />;
  return (
    <GPathsCtx.Provider value={PORTAL_PATHS}>
      <div className="hld">
        {kind && !empty ? (
          <GReportView kind={kind} issue={query.get('issue') ?? undefined} />
        ) : query.get('tab') === 'profile' ? (
          <ProfilePage />
        ) : empty ? (
          // A new company: no reports yet (onboarding keeps this page for its links).
          <GBrandAnalysisView m={m} tab="overview" empty />
        ) : (
          // No Brand Analysis tab since 9 Nov: the overview is Home.
          <ToHome />
        )}
      </div>
    </GPathsCtx.Provider>
  );
}

export function HomeRethinkDemo() {
  const { query } = useRoute();
  const m = useModel(analyses);
  const { state } = useStore();
  const look: Look = (LOOKS.find((x) => x.v === query.get('v'))?.v ?? 'g') as Look;
  const first = state.people.find((p) => p.id === 'u-layla')?.name.split(' ')[0] ?? 'there';

  let body;
  if (look === 'a')
    body = (
      <>
        <SlimHead m={m} />
        <div className="hld-cols">
          <BrandAnalysisBlock tabs />
          <aside className="hld-side">
            <NeedsYou m={m} />
            <Latest />
          </aside>
        </div>
      </>
    );
  else if (look === 'b')
    body = (
      <>
        <SlimHead m={m} />
        <section className="hld-card hld-health">
          <span className="hld-label">Brand health · illustrative</span>
          <span className="hld-health__num">
            <b>58</b>
            <span>/100</span>
          </span>
          <p>Strong in stores and on Instagram; slow on mobile and quiet on TikTok.</p>
          <Scores compact />
        </section>
        <section className="hld-card">
          <h3 className="hld-title">Top 3 things to fix</h3>
          <IssueList limit={3} />
        </section>
        <nav className="hl-tabs hld-tabs">
          {['Overview', 'Company profile', ...REPORTS.map((a) => REPORT_LABEL[a.kind])].map((t, i) => (
            <button key={t} type="button" className={cx(i === 0 && 'is-on')}>
              {t}
            </button>
          ))}
        </nav>
      </>
    );
  else if (look === 'c-home')
    body = (
      <>
        <h1 className="hld-greet">Good morning, {first}.</h1>
        <div className="hld-cols hld-cols--even">
          <NeedsYou m={m} />
          <section className="hld-card">
            <h3 className="hld-title">
              Brand Analysis
              <a className="hld-link" href="#/demo/home-rethink?v=c-ba">
                Open <ArrowRight size={13} />
              </a>
            </h3>
            <Scores compact />
          </section>
        </div>
        <Latest />
      </>
    );
  else if (look === 'c-ba')
    body = (
      <>
        <h1 className="hld-greet">Brand Analysis</h1>
        <nav className="hl-tabs hld-tabs">
          {['Overview', 'Company profile', ...REPORTS.map((a) => REPORT_LABEL[a.kind])].map((t, i) => (
            <button key={t} type="button" className={cx(i === 0 && 'is-on')}>
              {t}
            </button>
          ))}
        </nav>
        <Scores />
        <section className="hld-card">
          <h3 className="hld-title">
            Issues to fix <span>{fixes(REPORTS).length}</span>
          </h3>
          <IssueList />
        </section>
      </>
    );
  else if (look === 'f')
    body = (
      <>
        <CompanyCard m={m} />
        <div className="hld-cols">
          <div className="hld-main">
            <BrandAnalysisSummary />
            <NeedsAction m={m} empty={query.get('empty') === '1'} />
            <Latest />
          </div>
          <DetailsSide />
        </div>
      </>
    );
  else if (look === 'g') body = <GHomeView m={m} empty={query.get('empty') === '1'} />;
  else if (look === 'g-ba') body = <GBrandAnalysisView m={m} tab={query.get('tab') === 'profile' ? 'profile' : 'overview'} />;
  else if (look === 'g-report') body = <GReportView kind={query.get('r') ?? undefined} />;
  else if (look === 'f2') {
    const tab = (['overview', 'analysis', 'profile'] as const).find((t) => t === query.get('tab')) ?? 'overview';
    const go = (t: string, r?: string) => navigate(`/demo/home-rethink?v=f2&tab=${t}${r ? `&r=${r}` : ''}`);
    const report = REPORTS.find((a) => a.kind === query.get('r')) ?? REPORTS[0];
    body = (
      <>
        <CompanyCard
          m={m}
          channels={false}
          team
          tabs={
            <nav className="hl-tabs hld-tabs hld-co__tabs">
              {(
                [
                  ['overview', 'Overview'],
                  ['analysis', 'Brand Analysis'],
                  ['profile', 'Company profile'],
                ] as const
              ).map(([t, label]) => (
                <button key={t} type="button" className={cx(tab === t && 'is-on')} onClick={() => go(t)}>
                  {label}
                </button>
              ))}
            </nav>
          }
        />
        {tab === 'overview' && (
          <div className="hld-cols">
            <div className="hld-main">
              <BrandAnalysisSummary perReport />
              <NeedsAction m={m} empty={query.get('empty') === '1'} />
              <Latest />
            </div>
            <aside className="hld-side">
              <SideBrief />
            </aside>
          </div>
        )}
        {tab === 'analysis' && (
          <AnalysisView
            key={report.kind}
            a={report}
            look="cards"
            switcher={
              <>
                <h3 className="hld-title">Reports</h3>
                <GlassTabs
                  label="Report"
                  value={report.kind as string}
                  onChange={(k) => go('analysis', k)}
                  items={REPORTS.map((a) => ({ value: a.kind as string, label: NAME[a.kind], count: fixes([a]).length }))}
                />
              </>
            }
          />
        )}
        {tab === 'profile' && (
          <div className="hld-cols">
            <ProfileFull />
            <aside className="hld-side">
              <FactsCard />
            </aside>
          </div>
        )}
      </>
    );
  }
  else if (look === 'f-ba')
    body = (
      <>
        <a className="back hld-back" href="#/demo/home-rethink?v=f">
          <ArrowLeft size={15} /> Home
        </a>
        <h1 className="hld-greet">Brand Analysis</h1>
        <nav className="hl-tabs hld-tabs">
          {['Overview', ...REPORTS.map((a) => REPORT_LABEL[a.kind])].map((t, i) => (
            <button key={t} type="button" className={cx(i === 0 && 'is-on')}>
              {t}
            </button>
          ))}
        </nav>
        <HealthCards />
        <section className="hld-card">
          <h3 className="hld-title">
            What we recommend fixing <span>{fixes(REPORTS).length}</span>
          </h3>
          <IssueList />
        </section>
      </>
    );
  else if (look === 'e')
    body = (
      <>
        <SlimHead m={m} />
        <div className="hld-cols">
          <div className="hld-main">
            <nav className="hl-tabs hld-tabs">
              {['Overview', ...REPORTS.map((a) => REPORT_LABEL[a.kind])].map((t, i) => (
                <button key={t} type="button" className={cx(i === 0 && 'is-on')}>
                  {t}
                </button>
              ))}
            </nav>
            <FigureRow />
            <NextSteps m={m} empty={query.get('empty') === '1'} />
            <Latest />
          </div>
          <ProfileSide />
        </div>
      </>
    );
  else if (look === 'd')
    body = (
      <>
        <SlimHead m={m} />
        <section className="hld-card">
          <h3 className="hld-title">
            Brand Analysis
            <a className="hld-link" href="#/demo/home-rethink?v=c-ba">
              Open <ArrowRight size={13} />
            </a>
          </h3>
          <p className="hld-summary">Strong in stores and on Instagram; slow on mobile and quiet on TikTok. Two things are worth doing first.</p>
          <HealthCards />
        </section>
        <div className="hld-cols">
          <NextSteps m={m} empty={query.get('empty') === '1'} />
          <aside className="hld-side">
            <Latest />
          </aside>
        </div>
      </>
    );
  else
    body = (
      <>
        <SlimHead m={m} />
        <div className="hld-cols">
          <BrandAnalysisBlock />
          <aside className="hld-side">
            <NeedsYou m={m} />
            <Latest />
          </aside>
        </div>
      </>
    );

  return (
    <div className="cdemo">
      <PageHeader title="Home · layouts" sub="Home rethought on the same data, after the review of 4 Nov. Switch between the directions. Prototype only." />
      <div className="fdm-switch">
        {LOOKS.map((x) => (
          <button key={x.v} className={cx(look === x.v && 'is-on')} onClick={() => navigate(`/demo/home-rethink?v=${x.v}`, { replace: true })}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{LOOKS.find((x) => x.v === look)!.note}</p>
      {(look === 'd' || look === 'f' || look === 'f2' || look === 'g') && (
        <div className="fdm-switch hd-looks">
          <span className="faint">Needs your action</span>
          <button className={cx(query.get('empty') !== '1' && 'is-on')} onClick={() => navigate(`/demo/home-rethink?v=${look}`, { replace: true })}>
            With items
          </button>
          <button className={cx(query.get('empty') === '1' && 'is-on')} onClick={() => navigate(`/demo/home-rethink?v=${look}&empty=1`, { replace: true })}>
            Empty
          </button>
        </div>
      )}
      {look === 'f2' && (query.get('tab') ?? 'overview') === 'overview' && (
        <div className="fdm-switch hd-looks">
          <span className="faint">Side block</span>
          {SIDES.map(([x, label]) => (
            <button key={x} className={cx((query.get('side') ?? 'tags') === x && 'is-on')} onClick={() => navigate(`/demo/home-rethink?v=f2&side=${x}`, { replace: true })}>
              {label}
            </button>
          ))}
        </div>
      )}
      {(look === 'd' || look === 'f' || look === 'f2') && query.get('empty') === '1' && (
        <div className="fdm-switch hd-looks">
          <span className="faint">Empty picture</span>
          {ARTS.map(([a, label]) => (
            <button key={a} className={cx((query.get('art') ?? 'none') === a && 'is-on')} onClick={() => navigate(`/demo/home-rethink?v=${look}&empty=1&art=${a}`, { replace: true })}>
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="hld">{body}</div>
    </div>
  );
}

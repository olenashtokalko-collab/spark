// Prototype-only page (#/demo/home-variants?v=a|b|c): Home after the client's feedback of 6 Nov. The page felt
// crowded and stressful (boxes of one weight, one type size); Brand Analysis repeated on Home and on its own page;
// Dr.AI was only the chat's avatar. "They have no time, no patience: grab their eyes." Three directions on the same
// data, each with one thing to see first, a real type scale, fewer boxes, Brand Analysis as a snapshot with a reason
// to open it, and Dr.AI (with Sparki) doing a job on the page.
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import { navigate, useRoute } from '../../lib/router';
import { useStore } from '../../state/store';
import { analyses } from '../../data/mock';
import { fmtDate } from '../../lib/format';
import { cx } from '../../components/ui/primitives';
import { DrAiHead, SparkiStill } from '../../components/ui/DrAi';
import { ChatDrawer } from '../assistant/ChatDrawer';
import { LatestFromSpark, useModel, type Model } from '../home/HomeLayouts';
import { HomeCredits } from './HomeRethinkDemo';
import { MascotClip } from './MascotDemo';
import type { CompanyAnalysis } from '../../data/types';

const VARIANTS = [
  { v: 'a', label: 'A · Dr.AI briefs you' },
  { v: 'b', label: 'B · One thing first' },
  { v: 'c', label: 'C · The headline' },
] as const;
type V = (typeof VARIANTS)[number]['v'];

const REPORTS = (['website', 'social'] as const).map((k) => analyses.find((a) => a.kind === k)!).filter(Boolean);
const NAME: Record<string, string> = { social: 'Social media', website: 'Website', brand: 'Brand', pr: 'PR' };
// The change since the previous report (illustrative, as on Home).
const SINCE: Record<string, { text: string; up: boolean }> = {
  social: { text: '−0.4 pt since Sep', up: false },
  website: { text: '+6 since Sep', up: true },
};
const topIssue = (a: CompanyAnalysis) => a.findings.find((f) => !f.good && f.impact === 'High') ?? a.findings.find((f) => !f.good);
const issues = (a: CompanyAnalysis) => a.findings.filter((f) => !f.good).length;
const reportHref = (a: CompanyAnalysis) => `#/brand-analysis/${a.kind}`;

/** Text with [brackets] round the words that take the brand gradient. */
function Marked({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/).map((s, i) =>
        s.startsWith('[') ? (
          <span key={i} className="hv-hl">
            {s.slice(1, -1)}
          </span>
        ) : (
          s
        ),
      )}
    </>
  );
}

/** Types the line once; `done` when it's out. Reduced motion: at once. */
function useTypeOnce(text: string, lead = 900) {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (n >= text.length) return;
    const t = setTimeout(() => setN(n + 1), n === 0 ? lead : 22);
    return () => clearTimeout(t);
  }, [n, text, lead]);
  return { n, done: n >= text.length };
}

/** A line typed with its marks kept: what's typed shows, the rest waits invisible so the block doesn't jump. */
function TypedMarked({ text, n }: { text: string; n: number }) {
  // Walk the marked text, counting only the visible characters.
  let k = 0;
  return (
    <>
      {text.split(/(\[[^\]]+\])/).map((s, i) => {
        const mark = s.startsWith('[');
        const body = mark ? s.slice(1, -1) : s;
        const from = k;
        k += body.length;
        const shown = Math.max(0, Math.min(body.length, n - from));
        return (
          <span key={i} className={cx(mark && 'hv-hl')}>
            {body.slice(0, shown)}
            <span className="hv-ghost">{body.slice(shown)}</span>
          </span>
        );
      })}
    </>
  );
}

function plain(text: string) {
  return text.replace(/[[\]]/g, '');
}

function Delta({ a }: { a: CompanyAnalysis }) {
  const s = SINCE[a.kind];
  if (!s) return null;
  const I = s.up ? TrendingUp : TrendingDown;
  return (
    <span className={cx('hv-delta', s.up ? 'is-up' : 'is-down')}>
      <I size={13} strokeWidth={2} /> {s.text}
    </span>
  );
}

/** The day's brief in Dr.AI's words, from the data: what waits first, and the biggest win. */
function useBrief(m: Model) {
  const first = m.waiting[0];
  const n = m.waiting.length;
  const web = REPORTS.find((a) => a.kind === 'website');
  return {
    first,
    line: `${n} ${n === 1 ? 'thing needs' : 'things need'} you this week, [${first?.title ?? 'nothing'}] first.${
      web ? ` And your website is [slow on mobile]: fixing it is the biggest win this month.` : ''
    }`,
  };
}

function Head({ title, sub, onAsk }: { title: ReactNode; sub?: ReactNode; onAsk?: () => void }) {
  return (
    <header className="hv-head">
      <span>
        <h1 className="hv-head__title">{title}</h1>
        {sub && <p className="hv-head__sub">{sub}</p>}
      </span>
      <span className="hv-head__acts">
        <HomeCredits />
        {onAsk && (
          <button type="button" className="hv-btn hv-btn--ghost" onClick={onAsk}>
            <DrAiHead size={20} /> Ask Dr.AI
          </button>
        )}
      </span>
    </header>
  );
}

// ---- A · Dr.AI briefs you -------------------------------------------------------------------------
// He stands on the page and says the day in two sentences while he speaks; the figures follow in a big type with
// no boxes; then what needs you and what's new side by side, as lists on the ground.
function VariantA({ m, onAsk }: { m: Model; onAsk: () => void }) {
  const { me } = useStore();
  const brief = useBrief(m);
  const typed = useTypeOnce(plain(brief.line), 1400);
  return (
    <>
      <section className="hv-a-hero">
        <MascotClip state={typed.n > 0 && !typed.done ? 'speaking' : 'idle'} width={230} intro className="hv-a-hero__fig" />
        <div className="hv-a-hero__text">
          <span className="hv-eyebrow">Dr.AI · your brief for {fmtDate(new Date().toISOString())}</span>
          <h1 className="hv-display">Good morning, {me.name.split(' ')[0]}.</h1>
          <p className="hv-a-hero__brief" aria-label={plain(brief.line)}>
            <TypedMarked text={brief.line} n={typed.n} />
          </p>
          <span className={cx('hv-a-hero__acts', typed.done && 'is-in')}>
            {brief.first && (
              <a className="hv-btn hv-btn--primary" href={brief.first.href}>
                Start with {brief.first.title} <ArrowRight size={15} />
              </a>
            )}
            <button type="button" className="hv-btn hv-btn--ghost" onClick={onAsk}>
              Ask me anything
            </button>
          </span>
        </div>
        <span className="hv-a-hero__credits">
          <HomeCredits />
        </span>
      </section>

      <section className="hv-figs" aria-label="At a glance">
        <a className="hv-fig" href="#/requests">
          <b className="hv-fig__num">{m.waiting.length}</b>
          <span className="hv-fig__label">decisions waiting</span>
          <span className="hv-fig__note">The first is due {m.waiting[0]?.date ? fmtDate(m.waiting[0].date.iso) : 'soon'}</span>
        </a>
        {REPORTS.map((a) => (
          <a key={a.kind} className="hv-fig" href={reportHref(a)}>
            <b className="hv-fig__num">{a.score?.value}</b>
            <span className="hv-fig__label">{a.score?.label}</span>
            <Delta a={a} />
          </a>
        ))}
      </section>

      <div className="hv-cols">
        <section>
          <h2 className="hv-h2">
            Your move <span className="hv-count">{m.waiting.length}</span>
            <a className="hv-link" href="#/requests">
              All requests <ArrowRight size={13} />
            </a>
          </h2>
          <ol className="hv-moves">
            {m.waiting.map((w) => (
              <li key={w.key}>
                <span className="hv-date">
                  <b>{w.date ? new Date(w.date.iso).getDate() : '–'}</b>
                  <span>{w.date ? new Date(w.date.iso).toLocaleString('en', { month: 'short' }) : ''}</span>
                </span>
                <span className="hv-moves__text">
                  <b>{w.title}</b>
                  <span>{w.type}</span>
                </span>
                <a className="hv-btn hv-btn--line" href={w.href}>
                  {w.action}
                </a>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2 className="hv-h2">What’s new</h2>
          <div className="hv-latest hld-card">
            <LatestFromSpark bare limit={4} typed />
          </div>
        </section>
      </div>
    </>
  );
}

// ---- B · One thing first --------------------------------------------------------------------------
// The one decision that's due first, big, on the video's dark ground, Dr.AI's face leaning in to say why; the
// reports as two different pictures (a gauge, a comparison bar), each with the reason to open it; what's new short.
function Gauge({ value, max = 100 }: { value: number; max?: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const part = 0.75; // a three-quarter ring
  const f = Math.max(0, Math.min(1, value / max));
  return (
    <svg className="hv-gauge" viewBox="0 0 128 128" aria-hidden>
      <defs>
        <linearGradient id="hv-g" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0" stopColor="#ec6a4c" />
          <stop offset="0.6" stopColor="#9a55ec" />
          <stop offset="1" stopColor="#3c64f0" />
        </linearGradient>
      </defs>
      <circle cx="64" cy="64" r={r} className="hv-gauge__track" strokeDasharray={`${c * part} ${c}`} transform="rotate(135 64 64)" />
      <circle cx="64" cy="64" r={r} className="hv-gauge__val" strokeDasharray={`${c * part * f} ${c}`} transform="rotate(135 64 64)" />
    </svg>
  );
}

function VariantB({ m, onAsk }: { m: Model; onAsk: () => void }) {
  const { me } = useStore();
  const [first, ...rest] = m.waiting;
  const web = REPORTS.find((a) => a.kind === 'website')!;
  const social = REPORTS.find((a) => a.kind === 'social')!;
  return (
    <>
      <Head title={`Hi, ${me.name.split(' ')[0]}`} sub="Here’s what matters today." onAsk={onAsk} />

      {first && (
        <section className="hv-b-focus">
          <div className="hv-b-focus__text">
            <span className="hv-eyebrow hv-eyebrow--light">
              Next up · {first.date ? `${first.date.label.toLowerCase()} ${fmtDate(first.date.iso)}` : first.type}
            </span>
            <h2 className="hv-b-focus__title">{first.title}</h2>
            <p>{first.type === 'Proposal' ? 'Spark’s proposal is ready: the idea, the budget and the timeline, on one page.' : 'Spark is waiting for your feedback on the file.'}</p>
            <span className="hv-b-focus__acts">
              <a className="hv-btn hv-btn--white" href={first.href}>
                {first.action} <ArrowRight size={15} />
              </a>
              {rest.length > 0 && (
                <a className="hv-b-focus__more" href="#/requests">
                  +{rest.length} more waiting: {rest.map((w) => w.title).join(', ')}
                </a>
              )}
            </span>
          </div>
          <div className="hv-b-focus__fig">
            <span className="hv-b-focus__say">I’d start here. It’s due first.</span>
            <MascotClip state="idle" crop="face" width={260} shape="free" />
          </div>
        </section>
      )}

      <div className="hv-b-grid">
        <a className="hv-b-tile" href={reportHref(web)}>
          <span className="hv-eyebrow">{NAME.website}</span>
          <span className="hv-b-tile__gauge">
            <Gauge value={parseInt(web.score?.value ?? '0', 10)} />
            <span>
              <b>{parseInt(web.score?.value ?? '0', 10)}</b>
              <i>/100</i>
            </span>
          </span>
          <span className="hv-b-tile__label">
            {web.score?.label} <Delta a={web} />
          </span>
          <b className="hv-b-tile__why">{topIssue(web)?.title}: product pages take 6.8 s on 4G.</b>
          <span className="hv-link">
            See what to fix · {issues(web)} <ArrowRight size={13} />
          </span>
        </a>
        <a className="hv-b-tile" href={reportHref(social)}>
          <span className="hv-eyebrow">{NAME.social}</span>
          <span className="hv-b-tile__big">{social.score?.value}</span>
          <span className="hv-b-tile__label">
            {social.score?.label} <Delta a={social} />
          </span>
          <span className="hv-bars" aria-label="3.4% for Brand Co. against 1.9% typical for UAE retail">
            <span>
              <i style={{ width: '100%' }} />
              You
            </span>
            <span>
              <i style={{ width: `${(1.9 / 3.4) * 100}%` }} />
              UAE retail, typical
            </span>
          </span>
          <b className="hv-b-tile__why">Instagram works. TikTok is reposted Reels, under 2K views.</b>
          <span className="hv-link">
            See what to fix · {issues(social)} <ArrowRight size={13} />
          </span>
        </a>
        <section className="hv-b-tile hv-b-tile--new">
          <span className="hv-b-new">
            <SparkiStill size={34} />
            <span className="hv-eyebrow">New from Spark</span>
          </span>
          <div className="hv-latest hv-latest--short hld-card">
            <LatestFromSpark bare limit={3} typed />
          </div>
        </section>
      </div>
    </>
  );
}

// ---- C · The headline -----------------------------------------------------------------------------
// Dr.AI's read of the week as a big headline (the gradient on the two words that matter), signed with his face;
// the figures as large numerals between rules; what needs you as a numbered list; what's new as three cards in a
// row, Sparki on the ones you haven't seen.
function VariantC({ m, onAsk }: { m: Model; onAsk: () => void }) {
  return (
    <>
      <section className="hv-c-hero">
        <span className="hv-c-hero__by">
          <MascotClip state="idle" crop="head" width={44} shape="circle" />
          <span>
            <b>Dr.AI’s read</b> on {m.brand.name} this week
          </span>
          <span className="hv-c-hero__credits">
            <HomeCredits />
          </span>
        </span>
        <h1 className="hv-c-hero__line">
          <Marked text="Instagram is [working]. Mobile speed is [costing you sales]." />
        </h1>
        <span className="hv-c-hero__acts">
          <a className="hv-btn hv-btn--primary" href="#/brand-analysis">
            See the reports <ArrowRight size={15} />
          </a>
          <button type="button" className="hv-btn hv-btn--ghost" onClick={onAsk}>
            <DrAiHead size={20} /> Ask why
          </button>
        </span>
      </section>

      <section className="hv-c-figs" aria-label="Brand Analysis">
        {REPORTS.map((a) => (
          <a key={a.kind} className="hv-c-fig" href={reportHref(a)}>
            <span className="hv-eyebrow">{NAME[a.kind]}</span>
            <b>{a.score?.value}</b>
            <span className="hv-c-fig__label">
              {a.score?.label} <Delta a={a} />
            </span>
            <span className="hv-c-fig__go">
              {issues(a)} to fix <ArrowUpRight size={14} />
            </span>
          </a>
        ))}
        <a className="hv-c-fig" href="#/requests">
          <span className="hv-eyebrow">Requests</span>
          <b>{m.ongoing.length}</b>
          <span className="hv-c-fig__label">in progress with Spark</span>
          <span className="hv-c-fig__go">
            Open <ArrowUpRight size={14} />
          </span>
        </a>
      </section>

      <div className="hv-cols hv-cols--c">
        <section>
          <h2 className="hv-h2">
            {m.waiting.length} {m.waiting.length === 1 ? 'thing needs' : 'things need'} you
          </h2>
          <ol className="hv-c-list">
            {m.waiting.map((w, i) => (
              <li key={w.key}>
                <a href={w.href}>
                  <span className="hv-c-list__n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="hv-c-list__text">
                    <b>{w.title}</b>
                    <span>
                      {w.type}
                      {w.date ? ` · ${w.date.label.toLowerCase()} ${fmtDate(w.date.iso)}` : ''}
                    </span>
                  </span>
                  <span className="hv-c-list__go">
                    {w.action} <ArrowRight size={14} />
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2 className="hv-h2">
            <SparkiStill size={26} /> New from Spark
          </h2>
          <div className="hv-latest hld-card">
            <LatestFromSpark bare limit={4} typed />
          </div>
        </section>
      </div>
    </>
  );
}

export function HomeVariantsDemo() {
  const { query } = useRoute();
  const m = useModel(analyses);
  const v: V = (VARIANTS.find((x) => x.v === query.get('v'))?.v ?? 'a') as V;
  const [chat, setChat] = useState(false);
  const ask = () => setChat(true);
  return (
    <div className={cx('hv', `hv--${v}`)}>
      {v === 'a' && <VariantA m={m} onAsk={ask} />}
      {v === 'b' && <VariantB m={m} onAsk={ask} />}
      {v === 'c' && <VariantC m={m} onAsk={ask} />}
      <ChatDrawer open={chat} onClose={() => setChat(false)} />
      <nav className="hv-bar" aria-label="Home variants">
        {VARIANTS.map((x) => (
          <button key={x.v} type="button" className={cx(v === x.v && 'is-on')} onClick={() => navigate(`/demo/home-variants?v=${x.v}`, { replace: true })}>
            {x.label}
          </button>
        ))}
        <a href="#/">Current Home</a>
      </nav>
    </div>
  );
}

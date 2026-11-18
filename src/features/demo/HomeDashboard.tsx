// Layout 7 · Dashboard, fourth pass (13 Nov, review: "the credits as a quiet line where the reports pill is; Book
// consultation in the balance's place with Layout 6's glass button; make clear the first card is the company
// profile's analysis, its figures parted by dividers; one set of faces everywhere; the reports' found-dots and
// 'below what's typical' say nothing: a short summary instead, Open on hover; drop What to look at first: four cards").
// Before it, the third pass (13 Nov, review: "the cards and the transparency I like; the content I don't. The
// client wants to see her brand: how Spark analysed it, what problems it found, which reports it prepared for her
// free, what to pay attention to. No credits used month by month, no split of where they went: she hasn't spent any,
// give her the full balance. No Export: the page is about the brand. The findings look good, but the bars in them
// don't say anything"). So: three rows, the same clear glass over the brand's spectrum.
//   · the brand analysis, read in one sentence, with what Spark read to get there; beside it, the balance in full
//   · the two reports as twin cards: the score on a gauge against the typical, what each found, what it is based on
//   · what to look at first: the problems, each with what to do and the report it comes from
// Transparency: every figure says what it's measured against, every finding where it comes from.
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useStore } from '../../state/store';
import { analyses } from '../../data/mock';
import { Avatar } from '../../components/ui/primitives';
import { useUI } from '../../state/ui';
import { dotted } from './dotted';
import '../../styles/dashboard.css';

/** A half-ring gauge: the score's arc on its scale, a tick where the typical sits. */
function Gauge({ id, value, scale, typical }: { id: string; value: number; scale: number; typical: number }) {
  const W = 240, H = 136, cx0 = 120, cy0 = 124, r = 100;
  const at = (f: number) => {
    const a = Math.PI * (1 - Math.min(1, Math.max(0, f)));
    return [cx0 + r * Math.cos(a), cy0 - r * Math.sin(a)] as const;
  };
  const arc = (f: number) => {
    const [x, y] = at(f);
    return `M ${cx0 - r} ${cy0} A ${r} ${r} 0 0 1 ${x} ${y}`;
  };
  const t = typical / scale;
  const a = Math.PI * (1 - t);
  const tick = (d: number) => [cx0 + (r + d) * Math.cos(a), cy0 - (r + d) * Math.sin(a)] as const;
  const [x1, y1] = tick(-13), [x2, y2] = tick(13);
  return (
    <svg className="db-gauge__svg" viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <defs>
        <linearGradient id={`db-gauge-${id}`} x1="0" x2="1">
          {/* Overview's indicator colours (17 Nov, review): Cobalt into violet into Ember */}
          <stop offset="0" stopColor="#1e3bd6" />
          <stop offset="0.55" stopColor="#7c4ae0" />
          <stop offset="1" stopColor="#e8501f" />
        </linearGradient>
      </defs>
      <path d={arc(1)} className="db-gauge__track" />
      {/* pathLength 1, so the arc can draw itself in on arrival (Layout 9, 13 Nov, review) */}
      <path d={arc(value / scale)} pathLength={1} className="db-gauge__val" stroke={`url(#db-gauge-${id})`} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} className="db-gauge__tick" />
    </svg>
  );
}

type Report = { id: string; name: string; href: string; fig: string; unit?: string; label: string; value: number; scale: number; typical: number; typicalText: string; verdict: { good: boolean; text: string } };
const REPORTS: Report[] = [
  { id: 'an-website', name: 'Website report', href: '#/?tab=website', fig: '41', unit: '/100', label: 'Mobile speed', value: 41, scale: 100, typical: 58, typicalText: 'Typical in UAE retail: 58', verdict: { good: false, text: 'Below typical' } },
  { id: 'an-social', name: 'Social media report', href: '#/?tab=social', fig: '4%', label: 'Instagram engagement', value: 4, scale: 5, typical: 1.9, typicalText: 'Typical in UAE retail: 1.9%', verdict: { good: true, text: 'Above typical' } },
];

/** A report as a card (Layout 7's, 13 Nov, review; Layout 9 has them too): the report's name, its headline, the
 *  score on a gauge with the typical's tick, what it measures, what it's based on; the whole card opens the report,
 *  its link showing on hover. */
export function ReportCard({ id, className, verdict }: { id: string; className?: string; verdict?: boolean }) {
  const r = REPORTS.find((x) => x.id === id)!;
  const a = analyses.find((x) => x.id === r.id)!;
  return (
    <a className={className ? `db-card db-rep ${className}` : 'db-card db-rep'} href={r.href}>
      {/* only the report's name (13 Nov, review: "many names only confuse; the date isn't needed"); the link
          on hover, top right (13 Nov, review) */}
      <span className="db-cardhead">
        <span className="db-label">{r.name}</span>
        {/* Layout 9 (13 Nov, review): good or not, as its figure cards say it, green or red, across from the label;
            the link takes its place on hover */}
        {verdict && <span className={`hh-status db-rep__verdict ${r.verdict.good ? 'is-good' : 'is-work'}`}>{r.verdict.text}</span>}
        <span className="db-hoverlink">
          Read the report <ArrowUpRight size={16} aria-hidden />
        </span>
      </span>
      <h2 className="db-rep__title">{a.headline}</h2>
      <div className="db-rep__body">
        <div className="db-gauge">
          <Gauge id={r.id} value={r.value} scale={r.scale} typical={r.typical} />
          <span className="db-gauge__fig db-fig" role="img" aria-label={`${r.label} ${r.fig}${r.unit ?? ''}`}>
            {dotted(r.fig)}
            {r.unit && <i>{r.unit}</i>}
          </span>
        </div>
        {/* what the figure measures heads the words beside the gauge, not under it (13 Nov, review) */}
        <div className="db-rep__side">
          <span className="db-rep__what">{r.label}</span>
          <span className="db-gauge__typical">
            <i aria-hidden />
            {r.typicalText}
          </span>
          {/* no summary (13 Nov, review: "still heavy"): what it measures, the typical, what it's based on */}
          <span className="db-label">Based on</span>
          <span className="db-rep__basis">{(a.signals ?? []).map((s) => s.value).join(' · ')}</span>
        </div>
      </div>
    </a>
  );
}

/** What Spark read to get there (the analysis's and the reports' own bases). */
const READ = [
  { fig: '1,200', label: 'reviews and posts' },
  { fig: '23', label: 'site pages' },
  { fig: '412', label: 'social posts' },
  { fig: '300', label: 'shoppers asked' },
];

/** Home as a dashboard of the brand. `balance` is the balance pill with its top-up (HomeBentoDemo's BalancePill). */
export function HomeDashboard({ balance }: { balance: ReactNode }) {
  const { state } = useStore();
  const { openRequest } = useUI();
  const b = state.brand;
  const person = (id: string) => state.people.find((p) => p.id === id);
  const strategist = person('s-youssef');
  return (
    <div className="db">
      <span className="db-field" aria-hidden />
      <header className="db-head">
        <span className="db-head__who">
          <span className="db-head__mark" aria-hidden>
            {b.name[0]}
          </span>
          {/* no "Overview" over the name (13 Nov, review); what the company is under it (13 Nov, review: "the company's
              avatar and its description"), from its profile */}
          <span>
            <h1 className="db-head__title">{b.name}</h1>
            <p className="db-head__sub">
              {b.positioning} {b.reach}
            </p>
          </span>
        </span>
        <span className="db-head__tools">{balance}</span>
      </header>

      {/* the company profile's analysis, and the consultation */}
      <div className="db-row db-row--top">
        {/* the whole card opens the analysis; its link shows on hover, top right across from the label (13 Nov, review) */}
        <a className="db-card db-brand" href="#/brand-analysis">
          <span className="db-cardhead">
            <span className="db-label">Company profile analysis · by Spark</span>
            <span className="db-hoverlink">
              Read the analysis <ArrowUpRight size={16} aria-hidden />
            </span>
          </span>
          <h2 className="db-brand__title">
            Loved in your stores. <span>Generic online,</span> and still unknown in Riyadh.
          </h2>
          <dl className="db-brand__read">
            {READ.map((r) => (
              <div key={r.label}>
                <dd className="db-fig" role="img" aria-label={`${r.fig} ${r.label}`}>
                  {dotted(r.fig)}
                </dd>
                <dt>{r.label}</dt>
              </div>
            ))}
          </dl>
        </a>
        <section className="db-card db-consult">
          <span className="db-label">Consultation · 45 min</span>
          <h2 className="db-consult__title">Talk it through</h2>
          <p className="db-text">Go through the reports with the strategist who wrote them, and leave with what to do first.</p>
          {strategist && (
            <span className="db-consult__who">
              <Avatar person={strategist} size={32} ring />
              <span>
                <b>{strategist.name}</b>
                <span>{strategist.title}</span>
              </span>
            </span>
          )}
          {/* Layout 6's floating button, standing in its card here (13 Nov, review) */}
          <button type="button" className="db-book" onClick={() => openRequest({ type: 'Strategy', title: 'Consultation on the brand analysis' })}>
            Book consultation
          </button>
        </section>
      </div>

      {/* the two reports, twins: the whole card opens the report, its link shows on hover */}
      <div className="db-row db-row--twin">
        {REPORTS.map((r) => (
          <ReportCard key={r.id} id={r.id} />
        ))}
      </div>
    </div>
  );
}

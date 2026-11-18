// Layout 5's cards under the Qindeel band, four more ways (13 Nov, review), all on the same content: the three
// analyses (website, social media, brand), then the two next steps (a consultation, Dr.AI). Our colours, corners and
// type throughout; only the card's manner changes, after the references the client sent:
//   results: a pale tinted header holding one of our glass icons, pill tags, the finding, and a results strip with a
//            Cobalt rule (after a case-study card).
//   tiles:   a top field of fine grid with a Cobalt key in it, a mono number, a large light title and mono tags, a
//            divider and the way in (after puture.co.kr's feature cards: the key #3d8bff with a darker foot for
//            thickness and its colour as shadow; tags in mono on a tenth of the key's colour).
//   slabs:   each card a slab of Cobalt glass floating over a floor of crosses, tilted in perspective, its thickness
//            showing, rising flat under the pointer (after puture.co.kr's floating keys).
//   scenes:  bento cards on a faint hex grid with a boxed label (after mbidirectmail.com), under an open page top
//            instead of the dark band; the consultation holds a living scene, a calendar of glass tiles laying itself
//            down until one day lights up in Ember. (A prism scene for Dr.AI was tried and dropped, 13 Nov.)
import { dotted } from './dotted';
import { type ReactNode } from 'react';
import { ArrowRight, Building2, CalendarClock, Globe, Heart, MessageCircle, Sparkles, type LucideIcon } from 'lucide-react';
import { analyses } from '../../data/mock';
import { useStore } from '../../state/store';
import { Avatar } from '../../components/ui/primitives';
import { MorphVideo } from '../../components/ui/MorphVideo';
import { useUI } from '../../state/ui';
import { cx } from '../../components/ui/primitives';
import '../../styles/card-variants.css';

export type CardVariant = 'results' | 'tiles' | 'slabs' | 'scenes';

type Item = {
  id: string;
  n: string;
  kind: string;
  icon: LucideIcon;
  glass: string;
  title: string;
  text: string;
  tags: string[];
  period: string;
  results: string[];
  fig: string;
  unit?: string;
  href?: string;
  onClick?: () => void;
  cta: string;
};

function useItems(webScore: number, social: string): { reports: Item[]; next: Item[] } {
  const { openRequest } = useUI();
  const web = analyses.find((a) => a.kind === 'website');
  const soc = analyses.find((a) => a.kind === 'social');
  const brand = analyses.find((a) => a.kind === 'brand');
  return {
    reports: [
      { id: 'web', n: '01', kind: 'Website report', icon: Globe, glass: 'brand/glass/chart.webp', title: web?.headline ?? '', text: web?.summary ?? '', tags: ['23 pages', '4G and broadband', 'Arabic and English'], period: 'Oct 2026', results: [`${webScore}/100 mobile speed`, '6.8 s on 4G', '2:40 on a product page'], fig: String(webScore), unit: '/100', href: '#/?tab=website', cta: 'Open the report' },
      { id: 'social', n: '02', kind: 'Social media report', icon: Heart, glass: 'brand/glass/chat.webp', title: soc?.headline ?? '', text: soc?.summary ?? '', tags: ['412 posts', '3,860 comments', 'Instagram and TikTok'], period: '1 Sep – 4 Oct', results: [`${social} engagement`, '38K followers', '26 h to reply'], fig: social, href: '#/?tab=social', cta: 'Open the report' },
      { id: 'brand', n: '03', kind: 'Brand analysis', icon: Building2, glass: 'brand/glass/reports.webp', title: brand?.headline ?? '', text: brand?.summary ?? '', tags: ['1,200 reviews', '14 store visits', '300 shoppers'], period: 'Sep 2026', results: ['“Quality” said most', '4% recall in KSA', 'Photography first'], fig: '4%', unit: 'recall in KSA', href: '#/brand-analysis', cta: 'Open the analysis' },
    ],
    next: [
      { id: 'consult', n: '04', kind: 'Strategy · 45 min', icon: CalendarClock, glass: 'brand/glass/glass-grid.webp', title: 'Book a consultation', text: 'Go through the analysis with Youssef, who wrote it, and decide what to fix first.', tags: ['45 minutes', 'Video call', 'With your strategist'], period: 'This week', results: ['What to fix first', 'A proposal from Spark'], fig: '45', unit: 'min', onClick: () => openRequest({ type: 'Strategy', title: 'Consultation on the brand analysis' }), cta: 'Book a consultation' },
      { id: 'ai', n: '05', kind: 'Dr.AI · any time', icon: Sparkles, glass: 'brand/drai-head.png', title: 'Your question. Every angle.', text: 'He knows your reports and your brand. Ask what a figure means, what to fix first or how a post should sound.', tags: ['Your reports', 'Your brand', 'Any time'], period: 'Any time', results: ['What a figure means', 'What to fix first'], fig: '24/7', href: '#/assistant', cta: 'Ask Dr.AI' },
    ],
  };
}

/** The card's way in: a link or a button, same look. */
function Go({ it, className, children }: { it: Item; className: string; children: ReactNode }) {
  return it.href ? (
    <a className={className} href={it.href}>
      {children}
    </a>
  ) : (
    <button type="button" className={className} onClick={it.onClick}>
      {children}
    </button>
  );
}

// ---------------------------------------------------------------- 1 · results
function ResultsCard({ it }: { it: Item }) {
  return (
    <article className="cv1">
      <div className="cv1__head">
        <img src={it.glass} alt="" />
      </div>
      <div className="cv1__body">
        <div className="cv1__pills">
          <span className="cv1__pill">{it.kind}</span>
          <span className="cv1__pill cv1__pill--v">{it.tags[0]}</span>
          <span className="cv1__pill cv1__pill--b">{it.period}</span>
        </div>
        <h3 className="cv1__title">{it.title}</h3>
        <p className="cv1__text">{it.text}</p>
        <Go it={it} className="cv1__results">
          {it.results.map((r, i) => (
            <span key={r}>
              {i > 0 && <i aria-hidden>✦</i>}
              {r}
            </span>
          ))}
          <ArrowRight className="cv1__go" size={16} aria-hidden />
        </Go>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------- 2 · tiles
// Second pass (13 Nov, review: "plates like sparkstudios.ae's keys, in its colours; big figures or a chart instead of
// the icons; no grid, so it reads; a message for the question, the calendar for the consultation; and the credits"):
// each card's picture is one of the site's jelly keys rendered in Blender (blender/morph_four.py plates), in the
// colour of its service (website Strategy blue, social Reach pink, credits Key moments Ember, consultation PR violet,
// Dr.AI AI magenta), the figure or icon set on its face; the reports carry their six months under the words.
type Plate = { id: string; n: string; plate: 's' | 'p' | 'a' | 'r' | 'k'; face: ReactNode; chart?: 'gauge_web' | 'gauge_credits' | 'bars_social' | 'bar_credits' | 'question_ai' | 'calendar_consult'; inField?: boolean; title: string; text: string; tags: string[]; line?: { months: number[]; typical: number }; body?: ReactNode; href?: string; onClick?: () => void; cta: string };
function MiniLine({ months, typical }: { months: number[]; typical: number }) {
  const vals = [...months, typical];
  const lo = Math.min(...vals), hi = Math.max(...vals), pad = (hi - lo) * 0.25 || 1;
  const W = 300, H = 64;
  const y = (v: number) => H - 6 - ((v - (lo - pad)) / (hi + pad - (lo - pad))) * (H - 12);
  const x = (i: number) => 6 + (i * (W - 12)) / (months.length - 1);
  const pts = months.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  return (
    <span className="cv2__chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        <line x1="0" x2={W} y1={y(typical)} y2={y(typical)} className="cv2__typ" />
        <polyline points={pts} className="cv2__path" />
      </svg>
      <span className="cv2__months" aria-hidden>
        <span>Jun</span>
        <span>Nov</span>
      </span>
    </span>
  );
}
function PlateCard({ it }: { it: Plate }) {
  // the balance (13 Nov, review): everything on the tinted field, its glass bar under the figure; only the way in on
  // the white below
  const inner = it.inField ? (
    <>
      <span className="cv2__field cv2__field--words">
        <span className="cv2__n">{it.n}</span>
        <span className="cv2__fwords">
          <span className="cv2__flabel">{it.title}</span>
          {it.face}
          <img className="cv2__fbar" src={`brand/charts/${it.chart}.webp`} alt="" />
          <span className="cv2__ftext">{it.text}</span>
        </span>
      </span>
      <span className="cv2__foot">
        {it.cta}
        <ArrowRight size={17} aria-hidden />
      </span>
    </>
  ) : (
    <>
      <span className={cx('cv2__field', `cv2__field--${it.plate}`)}>
        <span className="cv2__n">{it.n}</span>
        <span className={cx('cv2__plate', it.chart && 'cv2__plate--chart', it.chart && `cv2__plate--${it.chart}`)}>
          <img src={it.chart ? `brand/charts/${it.chart}.webp` : `brand/plates/${it.plate}.webp`} alt="" />
          <span className="cv2__face">{it.face}</span>
        </span>
      </span>
      <span className="cv2__title">{it.title}</span>
      <span className="cv2__text">{it.text}</span>
      {it.line && <MiniLine months={it.line.months} typical={it.line.typical} />}
      {it.body}
      <span className="cv2__tags">
        {it.tags.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </span>
      <span className="cv2__foot">
        {it.cta}
        <ArrowRight size={17} aria-hidden />
      </span>
    </>
  );
  return it.href ? (
    <a className={cx('cv2', `cv2--${it.plate}`)} href={it.href}>
      {inner}
    </a>
  ) : (
    <button type="button" className={cx('cv2', `cv2--${it.plate}`)} onClick={it.onClick}>
      {inner}
    </button>
  );
}
/* Grid tiles, third pass (13 Nov, review: "the 3D charts look heavy; a classic chart, the figure big, the trend as in
   Layout 3, under it only what the problem is and the way in; all arrows one colour; the balance in line with the two
   reports; the consultation without the calendar, showing what one could ask"): the first three cards share one
   build: on the tinted field the kind, the trend, a flat chart and the figure large; on the white the finding, what to
   fix, and the button. */
function Trend({ up, text }: { up: boolean; text: string }) {
  return (
    <span className={cx('cv2t', up ? 'is-up' : 'is-down')}>
      {up ? '↗' : '↘'} {text}
    </span>
  );
}
/** Layout 3's gauge, flat: a ring open at its foot, the share in the card's colour, the figure in its middle. */
function FlatGauge({ value, of = 100 }: { value: number; of?: number }) {
  const R = 62, C = 2 * Math.PI * R, arc = C * 0.75, filled = arc * Math.min(1, value / of);
  return (
    <span className="cv2g">
      <svg viewBox="0 0 160 160" aria-hidden>
        <circle cx="80" cy="80" r={R} className="cv2g__track" strokeDasharray={`${arc} ${C}`} transform="rotate(135 80 80)" />
        <circle cx="80" cy="80" r={R} className="cv2g__val" strokeDasharray={`${filled} ${C}`} transform="rotate(135 80 80)" />
      </svg>
      <span className="cv2g__fig">
        <b>{value}</b>
        <i>/{of}</i>
      </span>
    </span>
  );
}
function FlatBars({ rows }: { rows: { label: string; v: number; text: string; ours?: boolean }[] }) {
  const max = Math.max(...rows.map((r) => r.v)) * 1.05;
  return (
    <span className="cv2b">
      {rows.map((r) => (
        <span key={r.label} className={cx('cv2b__row', r.ours && 'is-ours')}>
          <span className="cv2b__label">{r.label}</span>
          <span className="cv2b__track">
            <i style={{ width: `${(r.v / max) * 100}%` }} />
          </span>
          <b>{r.text}</b>
        </span>
      ))}
    </span>
  );
}
export function Tile({ tone, n, kind, trend, chart, title, fixLabel, fix, cta, href, onClick, extra }: { tone: 's' | 'p' | 'a' | 'r' | 'k'; n?: string; kind?: string; trend?: ReactNode; chart: ReactNode; title: string; fixLabel?: string; fix: ReactNode; cta: string; href?: string; onClick?: () => void; extra?: ReactNode }) {
  const inner = (
    <>
      <span className="cv2__field cv2__field--flat">
        {(kind || trend) && (
          <span className="cv2f__top">
            <span className="cv2f__kind">
              {n && <span className="cv2__n2">{n}</span>} {kind}
            </span>
            {trend}
          </span>
        )}
        {chart}
      </span>
      <span className="cv2__title">{title}</span>
      {fixLabel && <span className="cv2__fixlabel">{fixLabel}</span>}
      <span className="cv2__text">{fix}</span>
      {extra}
      <span className="cv2__foot">
        {cta}
        <ArrowRight size={17} aria-hidden />
      </span>
    </>
  );
  return href ? (
    <a className={cx('cv2', `cv2--${tone}`)} href={href}>
      {inner}
    </a>
  ) : (
    <button type="button" className={cx('cv2', `cv2--${tone}`)} onClick={onClick}>
      {inner}
    </button>
  );
}

function TilesLayout({ webScore, social }: { webScore: number; social: string }) {
  const { state, actions } = useStore();
  const { openRequest } = useUI();
  const web = analyses.find((a) => a.kind === 'website');
  const soc = analyses.find((a) => a.kind === 'social');
  const webIssue = web?.findings?.find((f) => f.issue);
  const socIssue = soc?.findings?.find((f) => f.issue);
  const whole = String(Math.floor(state.credits));
  const of = Math.round(Math.max(state.creditsTotal, state.credits));
  const asks = [
    ...(webIssue?.asks ?? []).slice(0, 1),
    ...(socIssue?.asks ?? []).slice(0, 1),
    'What should we fix first, and what would it cost?',
  ];
  const ai: Plate = { id: 'ai', n: '05', plate: 'a', chart: 'question_ai', face: null, title: 'Your question. Every angle.', text: 'Dr.AI knows your reports and your brand. Ask what a figure means or what to fix first.', tags: ['Any time', 'Your reports'], href: '#/assistant', cta: 'Ask Dr.AI' };
  return (
    <div className="cvx cvx--tiles">
      <div className="cvx__row cvx__row--3">
        <Tile
          tone="s" n="01" kind="Website report" trend={<Trend up text="6 since Sep" />}
          chart={<FlatGauge value={webScore} />}
          title={web?.headline ?? ''} fixLabel="What to fix" fix={webIssue?.body ?? ''}
          href="#/?tab=website" cta="Open the website report"
        />
        <Tile
          tone="r" n="02" kind="Social media report" trend={<Trend up={false} text="0.4 since Sep" />}
          chart={
            <span className="cv2f__big">
              <span className="cv2f__fig">
                <b>{social}</b>
                <i>Engagement, Instagram</i>
              </span>
              <FlatBars rows={[{ label: 'Yours', v: 4, text: social, ours: true }, { label: 'Typical', v: 1.9, text: '1.9%' }]} />
            </span>
          }
          title={soc?.headline ?? ''} fixLabel="What to fix" fix={socIssue?.body ?? ''}
          href="#/?tab=social" cta="Open the social media report"
        />
        <Tile
          tone="k" n="03" kind="Your balance"
          chart={
            <span className="cv2f__big">
              <span className="cv2f__fig">
                <b>{whole}</b>
                <i>USD of {of}</i>
              </span>
              <FlatBars rows={[{ label: 'Left', v: state.credits, text: `${Math.round((state.credits / of) * 100)}%`, ours: true }]} />
            </span>
          }
          title="Credits for what's next" fix="New reports and time with your strategist are paid from your balance."
          onClick={() => actions.topUp(50)} cta="Top up USD 50"
        />
      </div>
      <div className="cvx__row cvx__row--2">
        <button type="button" className="cv2 cv2--p cv2--asks" onClick={() => openRequest({ type: 'Strategy', title: 'Consultation on the brand analysis' })}>
          <span className="cv2__field cv2__field--flat cv2__field--asks">
            <span className="cv2f__top">
              <span className="cv2f__kind">
                <span className="cv2__n2">04</span> Questions you could bring
              </span>
              <span className="cv2t is-plain">45 min</span>
            </span>
            <span className="cv2q">
              {asks.map((q) => (
                <span key={q}>
                  <MessageCircle size={16} aria-hidden />
                  {q}
                </span>
              ))}
            </span>
          </span>
          <span className="cv2__title">Book a consultation</span>
          <span className="cv2__text">Go through the analysis with Youssef, who wrote it, and leave knowing what to fix first.</span>
          <span className="cv2__foot">
            Book a consultation
            <ArrowRight size={17} aria-hidden />
          </span>
        </button>
        <PlateCard it={ai} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 3 · slabs
function SlabCard({ it, k }: { it: Item; k: number }) {
  const Icon = it.icon;
  return (
    <div className="cv3__float" style={{ ['--d' as string]: `${-k * 1.3}s`, ['--tilt' as string]: `${k % 2 ? 7 : -7}deg` }}>
      <Go it={it} className="cv3">
        <span className="cv3__top">
          <span className="cv3__icon">
            <Icon size={20} strokeWidth={2} aria-hidden />
          </span>
          <span className="cv3__kind">{it.kind}</span>
        </span>
        {/* the digits in Doto, the % . , / in the classic face, so they read (13 Nov, review) */}
        <span className="cv3__fig" role="img" aria-label={`${it.fig}${it.unit ? ` ${it.unit}` : ''}`}>
          {dotted(it.fig)}
          {it.unit && <i>{it.unit}</i>}
        </span>
        <span className="cv3__title">{it.title}</span>
        <span className="cv3__text">{it.text}</span>
        <span className="cv3__foot">
          {it.cta} <ArrowRight size={16} aria-hidden />
        </span>
      </Go>
    </div>
  );
}

// ---------------------------------------------------------------- 4 · scenes
/** The consultation's scene: a month of glass tiles lays itself down, then one day rises in Ember. */
export function CalendarScene() {
  const cells = Array.from({ length: 20 }, (_, i) => i);
  return (
    <div className="cv4__cal" aria-hidden>
      <div className="cv4__iso">
        {cells.map((i) => (
          <span key={i} className={cx('cv4__day', i === 12 && 'is-booked')} style={{ ['--i' as string]: i }}>
            {i === 12 && <b>45</b>}
          </span>
        ))}
      </div>
    </div>
  );
}

// 4 · scenes, second pass (13 Nov, review: "the hexagons show through everything, the words and figures read badly; a
// composition like the reference, the figures clear, and charts as in Layout 3"): the hex field only where the scene or
// chart is, faded away under the words; a boxed label in one corner, the title large and light in the other; the
// figure big in Doto; and each report with its chart: the website's six months as a line, the social media's two
// comparisons as bars, the brand's 4% recall as a hundred dots with four lit.
const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
function LineChart({ months, typical, typicalLabel }: { months: number[]; typical: number; typicalLabel: string }) {
  const vals = [...months, typical];
  const lo = Math.min(...vals), hi = Math.max(...vals), pad = (hi - lo) * 0.25 || 1;
  const W = 400, H = 150;
  const y = (v: number) => H - 8 - ((v - (lo - pad)) / (hi + pad - (lo - pad))) * (H - 16);
  const x = (i: number) => 8 + (i * (W - 16)) / (months.length - 1);
  const pts = months.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const lx = x(months.length - 1);
  return (
    <figure className="cv5-line">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="cv5-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1e3bd6" stopOpacity="0.16" />
            <stop offset="1" stopColor="#1e3bd6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} className="cv5-line__grid" />
        ))}
        <line x1="0" x2={W} y1={y(typical)} y2={y(typical)} className="cv5-line__typ" />
        <polygon points={`${x(0)},${H} ${pts} ${lx},${H}`} fill="url(#cv5-area)" />
        <polyline points={pts} className="cv5-line__path" />
      </svg>
      {months.map((v, i) => (
        <span key={i} className={cx('cv5-line__dot', i === months.length - 1 && 'is-now')} style={{ left: `${(x(i) / W) * 100}%`, top: `${(y(v) / H) * 100}%` }} aria-hidden />
      ))}
      <span className="cv5-line__tlabel" style={{ top: `${(y(typical) / H) * 100}%` }}>
        {typicalLabel}
      </span>
      <figcaption className="cv5-line__months" aria-hidden>
        {MONTHS.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </figcaption>
    </figure>
  );
}
function Bars({ rows }: { rows: { label: string; ours: number; ref: number; oursText: string; refText: string }[] }) {
  return (
    <div className="cv5-bars">
      {rows.map((r) => {
        const max = Math.max(r.ours, r.ref) * 1.05;
        return (
          <div key={r.label} className="cv5-bars__row">
            <span className="cv5-bars__label">{r.label}</span>
            <span className="cv5-bars__bar is-ours">
              <i style={{ width: `${(r.ours / max) * 100}%` }} />
              <b>{r.oursText}</b>
            </span>
            <span className="cv5-bars__bar is-ref">
              <i style={{ width: `${(r.ref / max) * 100}%` }} />
              <b>{r.refText}</b>
            </span>
          </div>
        );
      })}
    </div>
  );
}
/** A hundred dots, n of them lit: a share at a glance, in Doto's own manner. */
function DotGrid({ n }: { n: number }) {
  return (
    <span className="cv5-dots" aria-hidden>
      {Array.from({ length: 100 }, (_, i) => (
        <i key={i} className={cx(i < n && 'is-on')} />
      ))}
    </span>
  );
}
function Fig({ fig, unit }: { fig: string; unit?: string }) {
  return (
    <span className="cv5-fig" role="img" aria-label={`${fig}${unit ? ` ${unit}` : ''}`}>
      <b>{fig}</b>
      {unit && <i>{unit}</i>}
    </span>
  );
}
function Label({ children }: { children: ReactNode }) {
  return <span className="cv5-label">{children}</span>;
}

function ScenesLayout({ reports, next, webScore, social }: { reports: Item[]; next: Item[]; webScore: number; social: string }) {
  const [web, soc, brand] = reports;
  const [consult, ai] = next;
  return (
    <div className="cvx cvx--scenes">
      {/* the website report, second pass (13 Nov, review: "it reads left to right, the chart doesn't read"): top to
          bottom: the label, the finding and the figure, then the chart under its own heading with its scale, the
          months and the typical line named, then the details in the plain face */}
      <Go it={web} className="cv5 cv5--wide cv5--report">
        <Label>Website report</Label>
        <span className="cv5-rhead">
          <span className="cv5-rhead__words">
            <span className="cv5-title">{web.title}.</span>
            <span className="cv5-text">{web.text}</span>
          </span>
          <span className="cv5-rhead__fig">
            <Fig fig={`${webScore}`} unit="/100" />
            <span className="cv5-delta is-up">↗ 6 since September</span>
          </span>
        </span>
        <span className="cv5-chartbox">
          <span className="cv5-charthead">
            <b>Mobile speed score, June to November</b>
            <span>
              <i className="cv5-key cv5-key--ours" /> Qindeel <i className="cv5-key cv5-key--typ" /> Typical, 58
            </span>
          </span>
          <LineChart months={[31, 33, 35, webScore - 6, webScore - 3, webScore]} typical={58} typicalLabel="" />
        </span>
        <span className="cv5-details">
          <span>
            <b>6.8 s</b> to open a product page on 4G
          </span>
          <span>
            <b>2:40</b> spent on a product page
          </span>
          <span>
            <b>23</b> pages reviewed
          </span>
          <span className="cv5-go">
            {web.cta} <ArrowRight size={15} aria-hidden />
          </span>
        </span>
      </Go>
      {/* social media: narrow, the figure up top, the bars in the middle, the title at the foot */}
      <Go it={soc} className="cv5 cv5--hex-mid">
        <Label>Social media report</Label>
        <Fig fig={social} unit="engagement, Instagram" />
        <Bars
          rows={[
            { label: 'Instagram engagement', ours: 4, ref: 1.9, oursText: '4%', refText: '1.9% typical' },
            { label: 'TikTok views a video', ours: 2, ref: 40, oursText: 'under 2K', refText: '20–60K competitors' },
          ]}
        />
        <span className="cv5-bottom">
          <span className="cv5-title cv5-title--md">{soc.title}.</span>
          <span className="cv5-go">
            {soc.cta} <ArrowRight size={15} aria-hidden />
          </span>
        </span>
      </Go>
      {/* the brand: narrow, a hundred dots with four lit */}
      <Go it={brand} className="cv5 cv5--hex-mid">
        <Label>Brand analysis</Label>
        <span className="cv5-share">
          <Fig fig="4%" unit="recall in KSA" />
          <DotGrid n={4} />
        </span>
        <span className="cv5-bottom">
          <span className="cv5-title cv5-title--md">{brand.title}.</span>
          <span className="cv5-text">People see Qindeel as well-made and local; online it looks like any global chain.</span>
          <span className="cv5-go">
            {brand.cta} <ArrowRight size={15} aria-hidden />
          </span>
        </span>
      </Go>
      {/* Dr.AI, second pass (13 Nov, review: "the question section looks too big; no illustration"): one narrow card,
          the questions people ask about these reports, each one a way in */}
      <Go it={ai} className="cv5 cv5--plain">
        <Label>Dr.AI · any time</Label>
        <span className="cv5-title cv5-title--md">Your question. Every angle.</span>
        <span className="cv5-asks">
          {['How many sales do we lose to the 6.8 s load?', 'Which creators would fit us on TikTok?', 'What should we fix first?'].map((q) => (
            <span key={q}>
              <MessageCircle size={15} aria-hidden />
              {q}
            </span>
          ))}
        </span>
        <span className="cv5-bottom">
          <span className="cv5-go">
            {ai.cta} <ArrowRight size={15} aria-hidden />
          </span>
        </span>
      </Go>
      {/* the consultation, narrow again (13 Nov, review: "I liked it better smaller"): the calendar laying itself down,
          then who and why, and the button */}
      <Go it={consult} className="cv5 cv5--scene cv5--cal">
        <Label>Strategy · 45 min</Label>
        <CalendarScene />
        <span className="cv5-bottom">
          <span className="cv5-title cv5-title--md">Go through it with Youssef.</span>
          <span className="cv5-text">He wrote your brand analysis. In 45 minutes you decide what to fix first.</span>
          <span className="cv5-btn">
            <CalendarClock size={16} aria-hidden /> Book a consultation
          </span>
        </span>
      </Go>
    </div>
  );
}

export function VariantCards({ variant, webScore, social }: { variant: CardVariant; webScore: number; social: string }) {
  const { reports, next } = useItems(webScore, social);
  if (variant === 'results')
    return (
      <div className="cvx">
        <div className="cvx__row cvx__row--3">{reports.map((it) => <ResultsCard key={it.id} it={it} />)}</div>
        <div className="cvx__row cvx__row--2">{next.map((it) => <ResultsCard key={it.id} it={it} />)}</div>
      </div>
    );
  if (variant === 'tiles') return <TilesLayout webScore={webScore} social={social} />;
  if (variant === 'slabs')
    return (
      <div className="cvx cvx--floor">
        <div className="cvx__row cvx__row--3">{reports.map((it, k) => <SlabCard key={it.id} it={it} k={k} />)}</div>
        <div className="cvx__row cvx__row--2">{next.map((it, k) => <SlabCard key={it.id} it={it} k={k + 3} />)}</div>
      </div>
    );
  return <ScenesLayout reports={reports} next={next} webScore={webScore} social={social} />;
}

/** Scenes' page top (13 Nov, review: "make the page open: the dark band stays for the other variants; for these cards
 *  the company's data as the reference sets its '37 YEARS — WHY MBI', and the animation in the right corner, in light,
 *  so the page reads lighter"): a fine rule; the year big in Doto with its label and a dashed name under it, a light
 *  title, the company in a few words and its team, each part between hairlines; the company's figures in a row under
 *  it; and the glass shapes in the top right corner over a pool of the brand's light. */
export function OpenHead() {
  const { state, me } = useStore();
  const b = state.brand;
  const colleagues = state.people.filter((p) => p.org === 'client' && p.id !== me.id);
  const since = b.founded.split(',')[0];
  return (
    <header className="oh">
      <span className="oh__light" aria-hidden>
        <MorphVideo className="oh__shape" light />
      </span>
      {/* second pass (13 Nov, review): the company's name large up top in our title face, what it is and its team
          beside it, the corner on the right left to the glass; its figures under it as large as the cards' figures */}
      <div className="oh__top">
        <div className="oh__name">
          <span className="oh__cat">Your brand · {b.category.split(" · ")[0]}</span>
          <h1>{b.name}</h1>
        </div>
        <div className="oh__about">
          <p>
            {b.positioning} {b.reach}
          </p>
          <a className="oh__team" href="#/team?from=home">
            <span className="oh__faces" aria-hidden>
              {(colleagues.length ? colleagues : [me]).slice(0, 3).map((p) => (
                <Avatar key={p.id} person={p} size={26} ring />
              ))}
            </span>
            {b.name} team · {colleagues.length ? `you and ${colleagues.length} colleague${colleagues.length === 1 ? '' : 's'}` : 'just you so far'}
            <ArrowRight size={15} aria-hidden />
          </a>
        </div>
      </div>
      <dl className="oh__facts">
        {[
          [since, 'Since'],
          ['14', 'Stores in the UAE'],
          ['60', 'Partner retailers'],
          ['Dubai', 'Home'],
        ].map(([v, k]) => (
          <div key={k}>
            <dd>{v}</dd>
            <dt>{k}</dt>
          </div>
        ))}
      </dl>
    </header>
  );
}

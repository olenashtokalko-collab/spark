// Prototype-only page (#/demo/brand-glass): the glass the client liked in the social series (Brand Guidelines 2026,
// p. 40), rebuilt as close to the posts as the browser allows, each beside its post. 1 · "Make it brighter. We're on
// it." (chat bubbles), 2 · "Search less. Spark more." (the Ask field), 3 · "Different tools. One spark." (buttons,
// slider, lens, switch). The recipe is the book's (p. 36): a frosted glass body, the spectrum underneath, Ink or white
// on top. Each object is drawn in SVG layers so the edge follows its shape (the bubble's tail included): its shadow,
// the body, the thickness inside the edge, the refracted colour in the rim, the inner face, the gloss and the glints.
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Search } from 'lucide-react';
import { PageHeader, cx } from '../../components/ui/primitives';
import { GlassInPortal } from './GlassInPortal';

type Stop = [number, string];
type Shape = 'capsule' | 'circle' | 'bubble';
type Spec = {
  shape: Shape;
  w: number;
  h: number;
  /** A tint under the white wash, left to right (or along `bodyAngle`). */
  body?: Stop[];
  /** The white wash over the body, top to bottom. */
  wash: Stop[];
  /** The colour refracted inside the edge, left to right (or along `rimAngle`). */
  rim: Stop[];
  rimAngle?: [number, number, number, number];
  rimW: number;
  rimOpacity?: number;
  /** A soft band inside the edge: the glass's thickness. */
  depth: string;
  /** The inner face: a second, lighter outline inset by the rim. */
  face?: boolean;
  /** A coloured line just inside the lower edge, where the spectrum gathers. */
  base?: Stop[];
  /** Glints as fractions of the size: x, y, rx, ry (px), opacity. */
  glints?: [number, number, number, number, number?][];
  /** Shadows and glows, drawn with the object's own outline. */
  shadows?: { dx: number; dy: number; blur: number; color: string }[];
};

function path(shape: Shape, w: number, h: number, i = 0) {
  if (shape === 'circle') {
    const r = w / 2 - i;
    return `M ${w / 2} ${i} A ${r} ${r} 0 1 1 ${w / 2} ${w - i} A ${r} ${r} 0 1 1 ${w / 2} ${i} Z`;
  }
  const x = i;
  const y = i;
  const W = w - 2 * i;
  const H = h - 2 * i;
  const r = H / 2;
  if (shape === 'capsule' || i > 0) return `M ${x + r} ${y} H ${x + W - r} A ${r} ${r} 0 0 1 ${x + W - r} ${y + H} H ${x + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
  // A bubble: the capsule with a tail that runs out of its lower left and back up its side.
  const ay = h * 0.66;
  const ax = r - Math.sqrt(r * r - (ay - r) * (ay - r));
  return [
    `M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w - r} ${h}`,
    `H ${r * 1.08}`,
    `C ${r * 0.62} ${h} ${r * 0.28} ${h + 1} ${-r * 0.3} ${h + r * 0.11}`,
    `C ${r * 0.03} ${h - r * 0.1} ${ax * 0.55} ${h - r * 0.32} ${ax} ${ay}`,
    `A ${r} ${r} 0 0 1 ${r} 0 Z`,
  ].join(' ');
}

const grad = (id: string, stops: Stop[], [x1, y1, x2, y2]: [number, number, number, number]) => (
  <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
    {stops.map(([o, c], k) => (
      <stop key={k} offset={o} stopColor={c} />
    ))}
  </linearGradient>
);

function Glass({ s, className, style, children }: { s: Spec; className?: string; style?: CSSProperties; children?: ReactNode }) {
  const id = 'g' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const { w, h, shape, rimW } = s;
  const d = path(shape, w, h);
  const face = path(shape === 'bubble' ? 'capsule' : shape, w, h, rimW);
  const gloss = path(shape === 'bubble' ? 'capsule' : shape, w, h, rimW + 2);
  const blurs = [...new Set([1.2, 3, 6, ...(s.shadows ?? []).map((x) => x.blur)])];
  const f = (b: number) => `url(#${id}b${String(b).replace('.', '_')})`;
  return (
    <div className={cx('gk-obj', className)} style={{ width: w, height: h, ...style }}>
      <svg className="gk-obj__svg" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
        <defs>
          {blurs.map((b) => (
            <filter key={b} id={`${id}b${String(b).replace('.', '_')}`} x={-w} y={-h} width={w * 3} height={h * 3} filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation={b} />
            </filter>
          ))}
          <clipPath id={`${id}c`}>
            <path d={d} />
          </clipPath>
          <clipPath id={`${id}low`}>
            <rect x={-w} y={h * 0.5} width={w * 3} height={h * 2} />
          </clipPath>
          {s.body && grad(`${id}body`, s.body, [0, 0, 1, 0])}
          {grad(`${id}wash`, s.wash, [0, 0, 0, 1])}
          {grad(`${id}rim`, s.rim, s.rimAngle ?? [0, 0, 1, 0])}
          {s.base && grad(`${id}base`, s.base, [0, 0, 1, 0])}
          {grad(
            `${id}gloss`,
            [
              [0, 'rgba(255,255,255,0.8)'],
              [0.42, 'rgba(255,255,255,0)'],
            ],
            [0, 0, 0, 1],
          )}
        </defs>
        {(s.shadows ?? []).map((x, k) => (
          <path key={k} d={d} fill={x.color} transform={`translate(${x.dx} ${x.dy})`} filter={f(x.blur)} />
        ))}
        {s.body && <path d={d} fill={`url(#${id}body)`} />}
        <path d={d} fill={`url(#${id}wash)`} />
        <g clipPath={`url(#${id}c)`}>
          <path d={d} fill="none" stroke={s.depth} strokeWidth={rimW * 3.2} filter={f(6)} />
          <path d={d} fill="none" stroke={`url(#${id}rim)`} strokeWidth={rimW * 2} opacity={s.rimOpacity ?? 1} filter={f(1.2)} />
          {s.face && (
            <>
              <path d={face} fill="none" stroke="rgba(14,17,22,0.07)" strokeWidth={2.5} filter={f(1.2)} />
              <path d={face} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={1.4} />
            </>
          )}
          <path d={gloss} fill={`url(#${id}gloss)`} />
          {s.base && (
            <g clipPath={`url(#${id}low)`}>
              <path d={face} fill="none" stroke={`url(#${id}base)`} strokeWidth={3} filter={f(1.2)} />
            </g>
          )}
          <path d={d} fill="none" stroke="#fff" strokeWidth={8} opacity={0.55} filter={f(3)} />
          <path d={d} fill="none" stroke="#fff" strokeWidth={2.6} />
        </g>
        <path d={d} fill="none" stroke="rgba(14,17,22,0.11)" strokeWidth={1} />
        {(s.glints ?? []).map(([x, y, rx, ry, o = 1], k) => (
          <ellipse key={k} cx={x * w} cy={y * h} rx={rx} ry={ry} fill="#fff" opacity={o} filter={f(1.2)} />
        ))}
      </svg>
      {children}
    </div>
  );
}

// ---- The objects -------------------------------------------------------------------------------------

const clearWash: Stop[] = [
  [0, 'rgba(255,255,255,0.86)'],
  [0.5, 'rgba(255,255,255,0.56)'],
  [1, 'rgba(255,255,255,0.74)'],
];
const restShadow = [
  { dx: 0, dy: 12, blur: 10, color: 'rgba(70,58,46,0.11)' },
  { dx: 0, dy: 2, blur: 1.2, color: 'rgba(70,58,46,0.07)' },
];

const BUBBLE: Record<'clear' | 'light' | 'warm', Spec> = {
  clear: { shape: 'bubble', w: 268, h: 86, wash: clearWash, rim: [[0, '#ffffff'], [1, '#ffffff']], rimOpacity: 0.7, rimW: 6, depth: 'rgba(120,108,96,0.08)', shadows: restShadow, glints: [[0.18, 0.12, 14, 2, 0.9]] },
  light: {
    shape: 'bubble',
    w: 300,
    h: 86,
    body: [
      [0, '#a2b2ff'],
      [0.4, '#d9d7fb'],
      [0.75, '#d6c9f8'],
      [1, '#c3a8f4'],
    ],
    wash: [
      [0, 'rgba(255,255,255,0.6)'],
      [0.45, 'rgba(255,255,255,0.08)'],
      [1, 'rgba(255,255,255,0.32)'],
    ],
    rim: [
      [0, '#e6ebff'],
      [1, '#f4eaff'],
    ],
    rimW: 6,
    depth: 'rgba(104,86,226,0.28)',
    shadows: [
      { dx: -8, dy: 0, blur: 16, color: 'rgba(78,98,255,0.6)' },
      { dx: 10, dy: 2, blur: 16, color: 'rgba(160,96,250,0.55)' },
      { dx: 0, dy: 12, blur: 12, color: 'rgba(90,70,200,0.2)' },
    ],
    glints: [[0.14, 0.14, 16, 2, 0.95]],
  },
  warm: {
    shape: 'bubble',
    w: 236,
    h: 86,
    wash: [
      [0, 'rgba(255,253,250,0.88)'],
      [0.5, 'rgba(255,248,242,0.56)'],
      [1, 'rgba(255,240,228,0.74)'],
    ],
    rim: [
      [0, '#fff4ea'],
      [1, '#ffd2b2'],
    ],
    rimW: 6,
    depth: 'rgba(240,146,84,0.16)',
    shadows: [
      { dx: 0, dy: 10, blur: 14, color: 'rgba(240,140,80,0.3)' },
      { dx: 0, dy: 2, blur: 1.2, color: 'rgba(120,70,40,0.07)' },
    ],
    glints: [[0.2, 0.12, 12, 2, 0.9]],
  },
};

const SEARCH: Spec = {
  shape: 'capsule',
  w: 420,
  h: 116,
  wash: [
    [0, 'rgba(255,255,255,0.5)'],
    [0.5, 'rgba(255,255,255,0.16)'],
    [1, 'rgba(255,255,255,0.4)'],
  ],
  rim: [
    [0, '#1d3ce6'],
    [0.045, '#3d5dff'],
    [0.11, '#a08eff'],
    [0.2, 'rgba(255,255,255,0.95)'],
    [0.8, 'rgba(255,255,255,0.95)'],
    [0.89, '#ffb27c'],
    [0.955, '#ff7a2c'],
    [1, '#e65a16'],
  ],
  rimW: 10,
  depth: 'rgba(88,82,110,0.15)',
  face: true,
  base: [
    [0, '#3a58ff'],
    [0.35, '#9c7cff'],
    [0.62, '#ff8db0'],
    [1, '#ff8a3a'],
  ],
  glints: [
    [0.78, 0.05, 16, 2.4],
    [0.87, 0.08, 6, 2],
    [0.13, 0.1, 9, 2, 0.9],
    [0.91, 0.91, 12, 2.4],
    [0.09, 0.88, 9, 2, 0.9],
    [0.975, 0.5, 2.5, 9, 0.8],
  ],
  shadows: [{ dx: 0, dy: 3, blur: 3, color: 'rgba(70,58,46,0.08)' }],
};

const capsule = (rim: Stop[], depth: string, body: Stop[], glow: string): Spec => ({
  shape: 'capsule',
  w: 206,
  h: 86,
  body,
  wash: [
    [0, 'rgba(255,255,255,0.6)'],
    [0.5, 'rgba(255,255,255,0.2)'],
    [1, 'rgba(255,255,255,0.45)'],
  ],
  rim,
  rimW: 9,
  depth,
  face: true,
  glints: [
    [0.32, 0.07, 26, 2.4, 0.95],
    [0.9, 0.86, 7, 2, 0.8],
  ],
  shadows: [
    { dx: 16, dy: 18, blur: 12, color: 'rgba(70,58,46,0.16)' },
    { dx: 20, dy: 12, blur: 12, color: glow },
  ],
});
const CAP_BLUE = capsule(
  [
    [0, '#2f4cff'],
    [0.5, '#5268ff'],
    [1, '#3550ff'],
  ],
  'rgba(58,80,232,0.26)',
  [
    [0, 'rgba(214,220,255,0.45)'],
    [1, 'rgba(232,234,255,0.4)'],
  ],
  'rgba(58,84,255,0.42)',
);
const CAP_PINK = capsule(
  [
    [0, '#f4a2bd'],
    [0.6, '#eb8fbd'],
    [1, '#b97eff'],
  ],
  'rgba(230,120,170,0.24)',
  [
    [0, 'rgba(255,225,236,0.45)'],
    [1, 'rgba(240,226,255,0.45)'],
  ],
  'rgba(170,100,250,0.45)',
);

const TRACK: Spec = {
  shape: 'capsule',
  w: 470,
  h: 42,
  wash: clearWash,
  rim: [
    [0, '#ffffff'],
    [1, '#ffffff'],
  ],
  rimOpacity: 0.75,
  rimW: 6,
  depth: 'rgba(110,104,124,0.16)',
  face: true,
  glints: [
    [0.975, 0.32, 3, 6, 0.95],
    [0.5, 0.1, 30, 1.6, 0.8],
  ],
  shadows: [{ dx: 8, dy: 12, blur: 8, color: 'rgba(70,58,46,0.14)' }],
};

const LENS: Spec = {
  shape: 'circle',
  w: 196,
  h: 196,
  body: [
    [0, 'rgba(226,230,255,0.4)'],
    [1, 'rgba(255,236,228,0.4)'],
  ],
  wash: [
    [0, 'rgba(255,255,255,0.62)'],
    [0.5, 'rgba(255,255,255,0.3)'],
    [1, 'rgba(255,255,255,0.5)'],
  ],
  rim: [
    [0, '#3550ff'],
    [0.32, '#8d7bff'],
    [0.6, '#ff9cc8'],
    [0.82, '#ffad6c'],
    [1, '#ff7a2a'],
  ],
  rimAngle: [0, 0.35, 1, 0.75],
  rimW: 13,
  depth: 'rgba(110,100,140,0.15)',
  face: true,
  glints: [[0.2, 0.3, 3, 8, 0.7]],
  shadows: [
    { dx: 18, dy: 22, blur: 16, color: 'rgba(70,58,46,0.16)' },
    { dx: 16, dy: 14, blur: 18, color: 'rgba(255,140,80,0.32)' },
    { dx: -6, dy: 10, blur: 16, color: 'rgba(90,100,255,0.28)' },
  ],
};

const SWITCH: Spec = {
  shape: 'capsule',
  w: 126,
  h: 68,
  body: [
    [0, '#1a33cf'],
    [1, '#2f4dff'],
  ],
  wash: [
    [0, 'rgba(255,255,255,0.32)'],
    [0.42, 'rgba(255,255,255,0.04)'],
    [1, 'rgba(0,0,40,0.2)'],
  ],
  rim: [
    [0, '#8fa1ff'],
    [1, '#7d92ff'],
  ],
  rimOpacity: 0.8,
  rimW: 5,
  depth: 'rgba(8,18,120,0.4)',
  glints: [[0.3, 0.12, 14, 1.8, 0.8]],
  shadows: [
    { dx: 8, dy: 16, blur: 14, color: 'rgba(40,70,255,0.55)' },
    { dx: 4, dy: 6, blur: 6, color: 'rgba(20,30,120,0.25)' },
  ],
};
const SWITCH_OFF: Spec = { ...SWITCH, body: undefined, wash: clearWash, rim: TRACK.rim, rimOpacity: 0.75, depth: TRACK.depth, shadows: TRACK.shadows, face: true };

// ---- The page ----------------------------------------------------------------------------------------

/** Scales the objects down (never up) so they fit their stage: they are drawn at the posts' proportions. A transform
 *  leaves the layout size alone, so the natural size is read from offsetWidth and the box takes the scaled height. */
function Fit({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ k: 1, h: 0 });
  useEffect(() => {
    const el = box.current;
    const c = inner.current;
    if (!el || !c) return;
    const update = () => {
      const k = Math.min(1, el.clientWidth / c.offsetWidth);
      setFit({ k, h: c.offsetHeight * k });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="gk-fit" style={{ height: fit.h || undefined }}>
      <div ref={inner} className="gk-fit__inner" style={{ transform: `scale(${fit.k})` }}>
        {children}
      </div>
    </div>
  );
}

function Pair({ n, title, post, where, stage, children }: { n: string; title: string; post: string; where: string; stage?: string; children: ReactNode }) {
  return (
    <section className="gk-sec">
      <div className="gk-sec__head">
        <span className="gk-label">{n}</span>
        <h2 className="gk-sec__title">{title}</h2>
        <p className="gk-sec__where">{where}</p>
      </div>
      <div className="gk-pair">
        <figure className="gk-ref">
          <img src={post} alt={`The post "${title}" from the brand guidelines`} />
          <figcaption className="gk-label">Brand book · p. 40</figcaption>
        </figure>
        <figure className="gk-ours">
          <div className={cx('gk-stage', stage)}>
            <Fit>{children}</Fit>
          </div>
          <figcaption className="gk-label">In the browser · live</figcaption>
        </figure>
      </div>
    </section>
  );
}

function Bubbles() {
  return (
    <div className="gk-bubbles">
      <Glass s={BUBBLE.clear} className="gk-bubble">
        <span className="gk-bubble__text">Make it brighter</span>
      </Glass>
      <Glass s={BUBBLE.light} className="gk-bubble" />
      <Glass s={BUBBLE.warm} className="gk-bubble">
        <span className="gk-bubble__text">
          On it
          <span className="gk-dots" aria-label="Working">
            <i />
            <i />
            <i />
          </span>
        </span>
      </Glass>
    </div>
  );
}

function SearchPill() {
  const [q, setQ] = useState('');
  return (
    <div className="gk-search-wrap">
      <span className="gk-search__shadow" aria-hidden />
      <Glass s={SEARCH} className={cx('gk-search', q && 'has-text')}>
        <label className="gk-search__field">
          <Search size={30} strokeWidth={1.5} className="gk-search__icon" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything" aria-label="Ask Spark" />
        </label>
      </Glass>
    </div>
  );
}

/** The post's corner marks round an object, and its mono tag above. */
function Marked({ tag, tone, children }: { tag?: string; tone?: 'ink' | 'cobalt' | 'ember'; children: ReactNode }) {
  return (
    <div className="gk-marked">
      {tag && <span className={cx('gk-tag', `gk-tag--${tone}`)}>{tag}</span>}
      <div className="gk-marks">
        <i />
        <i />
        <i />
        <i />
        {children}
      </div>
    </div>
  );
}

function Tools() {
  const [v, setV] = useState(62);
  const [on, setOn] = useState(true);
  return (
    <div className="gk-tools">
      <Marked tag="01 · Strategy" tone="ink">
        <button type="button" className="gk-press" aria-label="Strategy">
          <Glass s={CAP_BLUE} />
        </button>
      </Marked>
      <button type="button" className="gk-press gk-tools__pink" aria-label="Creative">
        <Glass s={CAP_PINK} />
      </button>
      <div className="gk-slider" style={{ '--v': `${v}%` } as CSSProperties}>
        <Glass s={TRACK} />
        <span className="gk-slider__fill" aria-hidden />
        <span className="gk-slider__thumb" aria-hidden />
        <input type="range" min={4} max={96} value={v} onChange={(e) => setV(+e.target.value)} aria-label="Amount" />
      </div>
      <Marked tag="02 · Creative" tone="cobalt">
        <button type="button" className="gk-press" aria-label="Lens">
          <Glass s={LENS}>
            <span className="gk-lens__streak" aria-hidden />
          </Glass>
        </button>
      </Marked>
      <Marked tag="03 · Tech" tone="ember">
        <button type="button" role="switch" aria-checked={on} className={cx('gk-switch', on && 'is-on')} onClick={() => setOn((x) => !x)} aria-label="Switch">
          <Glass s={on ? SWITCH : SWITCH_OFF}>
            <span className="gk-switch__knob" />
          </Glass>
        </button>
      </Marked>
    </div>
  );
}

export function GlassKitDemo() {
  return (
    <div className="cdemo gk">
      <PageHeader
        title="Glass, by the posts"
        sub="The three posts the client liked, each beside the same objects built for the browser: real controls you can type in, drag and switch. Prototype only; nothing here is in the portal yet."
      />
      <Pair n="01 · Chat" title="Make it brighter. We're on it." post="/brand/ref/post-brighter.jpg" where="Chats and the Ask Spark drawer: your message, Spark's light while it works, then On it with what it is doing.">
        <Bubbles />
      </Pair>
      <Pair n="02 · Field" title="Search less. Spark more." post="/brand/ref/post-search.jpg" where="The Ask Spark box on a new chat and in the drawer. Not the search on Requests or Documents: lists stay quiet.">
        <SearchPill />
      </Pair>
      <Pair n="03 · Controls" title="Different tools. One spark." post="/brand/ref/post-tools.jpg" stage="gk-stage--warm" where="Settings (switches), Top up credits (the amount as a slider), a choice between two (the capsules), the send or record button (the lens).">
        <Tools />
      </Pair>
      <GlassInPortal />
    </div>
  );
}

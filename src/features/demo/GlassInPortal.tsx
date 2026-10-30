// The glass in the portal's own parts (#/demo/brand-glass, 04): four effects the client sent, adapted to Sand.
// 1 · filter tabs with a glass marker that slides to the tab picked, 2 · a switch whose knob turns into a clear
// lens while pressed or hovered (as iOS 26), 3 · cards that light their edge where the pointer is, 4 · glass icons
// (the book's "Icons & interface", p. 36: a frosted body, light under it) for the few big moments.
import { useEffect, useId, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { cx } from '../../components/ui/primitives';

function Block({ n, title, use, avoid, children }: { n: string; title: string; use: string; avoid: string; children: ReactNode }) {
  return (
    <div className="gp-block">
      <span className="gk-label">{n}</span>
      <h3 className="gp-block__title">{title}</h3>
      <div className="gp-block__stage">{children}</div>
      <p className="gp-block__note">
        <b>Where:</b> {use}
      </p>
      <p className="gp-block__note">
        <b>Not:</b> {avoid}
      </p>
    </div>
  );
}

// ---- 1 · Tabs with a sliding glass marker -------------------------------------------------------------

const TABS: [string, number][] = [
  ['All', 8],
  ['Needs you', 3],
  ['In progress', 3],
  ['Closed', 2],
];

function GlassTabs({ look }: { look: 'white' | 'ink' | 'soft' | 'bubble' }) {
  const [on, setOn] = useState(0);
  // C: the tab under the pointer gets a clear glass bubble, which slides from tab to tab as the marker does.
  const [hover, setHover] = useState<number | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pos, setPos] = useState({ x: 0, w: 0 });
  const [hpos, setHpos] = useState({ x: 0, w: 0 });
  const box = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(0);
  // Measure again once the brand font has loaded and whenever the tabs change size: the first measure can run
  // on the fallback face, which is narrower.
  useEffect(() => {
    const again = () => setTick((t) => t + 1);
    document.fonts?.ready.then(again);
    const ro = new ResizeObserver(again);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, []);
  useLayoutEffect(() => {
    const b = refs.current[on];
    if (b) setPos({ x: b.offsetLeft, w: b.offsetWidth });
  }, [on, tick]);
  useLayoutEffect(() => {
    const b = hover === null ? null : refs.current[hover];
    if (b) setHpos({ x: b.offsetLeft, w: b.offsetWidth });
  }, [hover, tick]);
  const bubble = look === 'soft' && hover !== null && hover !== on;
  // D: the clear bubble is the picked tab. Hovering another tab leaves a faint frosted trace under it, and the
  // bubble leans a few pixels towards it, as a drop of liquid would.
  const away = look === 'bubble' && hover !== null && hover !== on;
  const lean = away ? 8 : 0;
  const marker = away && hover! < on ? { x: pos.x - lean, w: pos.w + lean } : { x: pos.x, w: pos.w + lean };
  return (
    <div ref={box} className={cx('gp-tabs', `gp-tabs--${look}`)} role="tablist" aria-label="Requests" onMouseLeave={() => setHover(null)}>
      {look === 'soft' && <span className={cx('gp-tabs__bubble', bubble && 'is-on')} style={{ transform: `translateX(${hpos.x}px)`, width: hpos.w }} aria-hidden />}
      {look === 'bubble' && <span className={cx('gp-tabs__wash', away && 'is-on')} style={{ transform: `translateX(${hpos.x}px)`, width: hpos.w }} aria-hidden />}
      <span className={cx('gp-tabs__marker', hover === on && 'is-hover')} style={{ transform: `translateX(${marker.x}px)`, width: marker.w }} aria-hidden />
      {TABS.map(([label, n], i) => (
        <button
          key={label}
          ref={(el) => {
            refs.current[i] = el;
          }}
          role="tab"
          aria-selected={on === i}
          className={cx(on === i && 'is-on')}
          onClick={() => setOn(i)}
          onMouseEnter={() => setHover(i)}
        >
          {label}
          <span className={cx(i === 1 && 'is-you')}>{n}</span>
        </button>
      ))}
    </div>
  );
}

// ---- 2 · A switch whose knob turns into a lens --------------------------------------------------------

function LensSwitch({ label, initial = false }: { label: string; initial?: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <label className="gp-row">
      <span>{label}</span>
      <button type="button" role="switch" aria-checked={on} className={cx('gp-switch', on && 'is-on')} onClick={() => setOn((x) => !x)}>
        <span className="gp-switch__knob" />
      </button>
    </label>
  );
}

// ---- 3 · Cards that light their edge where the pointer is ---------------------------------------------

function GlowCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  const track = (e: MouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
  };
  return (
    <a className="gp-card" href="#/demo/brand-glass" onMouseMove={track} onClick={(e) => e.preventDefault()}>
      <span className="gp-card__icon">{icon}</span>
      <span className="gp-card__text">
        <b>{title}</b>
        <span>{body}</span>
      </span>
    </a>
  );
}

// ---- 4 · Glass icons ----------------------------------------------------------------------------------
// Each icon is filled shapes in a 48 box, drawn in layers: a coloured shadow, the body (lavender to Cobalt), a
// darker band inside the edge, a white rim, the gloss and a glint. Stand-like parts are strokes in the same light.

type Part = { d: string; stroke?: number };

function GlassIcon({ parts, size = 52, hue = 'cobalt' }: { parts: Part[]; size?: number; hue?: 'cobalt' | 'ember' }) {
  const id = 'i' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [a, b, c] = hue === 'cobalt' ? ['#f1edff', '#bfb4ff', '#7468ef'] : ['#fff0e6', '#ffbe9c', '#ec7440'];
  const shadow = hue === 'cobalt' ? 'rgba(96,76,230,0.32)' : 'rgba(232,96,42,0.3)';
  const edge = hue === 'cobalt' ? 'rgba(80,60,200,0.35)' : 'rgba(200,80,30,0.35)';
  const fills = parts.filter((p) => !p.stroke);
  const strokes = parts.filter((p) => p.stroke);
  return (
    <svg className="gp-icon" width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <defs>
        <linearGradient id={`${id}b`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="0.45" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}s`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>
        <filter id={`${id}s1`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
        <clipPath id={`${id}c`}>
          {fills.map((p, k) => (
            <path key={k} d={p.d} />
          ))}
        </clipPath>
      </defs>
      {/* the light the glass throws */}
      <g transform="translate(0.6 2.6)" filter={`url(#${id}s)`}>
        {fills.map((p, k) => (
          <path key={k} d={p.d} fill={shadow} />
        ))}
        {strokes.map((p, k) => (
          <path key={k} d={p.d} fill="none" stroke={shadow} strokeWidth={p.stroke} strokeLinecap="round" />
        ))}
      </g>
      {strokes.map((p, k) => (
        <g key={k}>
          <path d={p.d} fill="none" stroke={`url(#${id}b)`} strokeWidth={p.stroke} strokeLinecap="round" />
          <path d={p.d} fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth={0.9} strokeLinecap="round" transform="translate(-0.4 -0.6)" />
        </g>
      ))}
      {fills.map((p, k) => (
        <path key={k} d={p.d} fill={`url(#${id}b)`} />
      ))}
      <g clipPath={`url(#${id}c)`}>
        {fills.map((p, k) => (
          <g key={k}>
            <path d={p.d} fill="none" stroke={c} strokeOpacity="0.4" strokeWidth="3.6" filter={`url(#${id}s1)`} />
            <path d={p.d} fill={`url(#${id}g)`} transform="translate(0 -1.5) scale(1 0.94)" style={{ transformOrigin: '24px 10px' }} />
            <path d={p.d} fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="1.3" />
          </g>
        ))}
      </g>
      {fills.map((p, k) => (
        <path key={k} d={p.d} fill="none" stroke={edge} strokeWidth="0.6" />
      ))}
    </svg>
  );
}

const ICON = {
  spark: [{ d: 'M24 5 C25.2 16.6 31.4 22.8 43 24 C31.4 25.2 25.2 31.4 24 43 C22.8 31.4 16.6 25.2 5 24 C16.6 22.8 22.8 16.6 24 5 Z' }],
  mic: [{ d: 'M17 13 a7 7 0 0 1 14 0 v10 a7 7 0 0 1 -14 0 Z' }, { d: 'M12 22 a12 12 0 0 0 24 0', stroke: 3.4 }, { d: 'M24 34 v7 M18 42 h12', stroke: 3.4 }],
  brief: [{ d: 'M13 10 a5 5 0 0 1 5 -5 h12 a5 5 0 0 1 5 5 v29 c0 2 -2.2 3.1 -3.8 1.9 l-7.2 -5.2 l-7.2 5.2 c-1.6 1.2 -3.8 0.1 -3.8 -1.9 Z' }],
  team: [
    { d: 'M30 10 a6 6 0 1 1 0 12 a6 6 0 1 1 0 -12 Z M22 36 c0 -6 3.6 -10 8 -10 s8 4 8 10 c0 2 -1.6 3 -3 3 h-10 c-1.4 0 -3 -1 -3 -3 Z' },
    { d: 'M18 15 a7 7 0 1 1 0 14 a7 7 0 1 1 0 -14 Z M7 40 c0 -6.6 4.6 -10.5 11 -10.5 s11 3.9 11 10.5 c0 2 -1.6 3 -3.2 3 h-15.6 c-1.6 0 -3.2 -1 -3.2 -3 Z' },
  ],
} satisfies Record<string, Part[]>;

// ---- The section --------------------------------------------------------------------------------------

export function GlassInPortal() {
  return (
    <section className="gk-sec">
      <div className="gk-sec__head">
        <span className="gk-label">04 · In the portal</span>
        <h2 className="gk-sec__title">The four effects you sent, on Sand</h2>
        <p className="gk-sec__where">Each one live, in the portal's own parts. The references are dark; on Sand the light has to be quieter, or it reads as a stain.</p>
      </div>
      <div className="gp-grid">
        <Block
          n="1 · Tabs"
          title="A glass marker that slides to the tab"
          use="the filter tabs on Requests and Documents, the view switch (grid / list). One set per page."
          avoid="the underline tabs inside a request (Overview, Messages…): two glass sets on one page is too much."
        >
          <div className="gp-stack">
            <span className="gk-label">A · white glass, the light under it</span>
            <GlassTabs look="white" />
            <span className="gk-label">B · Ink glass, as the primary (selected is Ink)</span>
            <GlassTabs look="ink" />
            <span className="gk-label">C · white glass, a quieter shadow, a bubble on hover</span>
            <GlassTabs look="soft" />
            <span className="gk-label">D · the clear bubble is the picked tab; hover leaves a frosted trace</span>
            <GlassTabs look="bubble" />
          </div>
        </Block>
        <Block n="2 · Switch" title="The knob turns into a lens while you hold it" use="the switches in Settings (notifications, email). Hover or press to see it." avoid="checkboxes in filters and tables: they stay plain.">
          <div className="gp-list">
            <LensSwitch label="Email me when Spark replies" initial />
            <LensSwitch label="Only requests I follow" />
            <LensSwitch label="Weekly digest" initial />
          </div>
        </Block>
        <Block
          n="3 · Card"
          title="The edge lights up where the pointer is"
          use="cards you open: the issues on Home, folders on Documents, the open decision card."
          avoid="table rows (they keep the grey hover) and cards you only read."
        >
          <div className="gp-cards">
            <GlowCard icon={<GlassIcon parts={ICON.mic} size={40} />} title="Ask by voice" body="Speak to Spark; it writes the brief." />
            <GlowCard icon={<GlassIcon parts={ICON.brief} size={40} />} title="Smart brief after every chat" body="What you asked, what Spark found, what to do." />
          </div>
        </Block>
        <Block
          n="4 · Icons"
          title="Glass icons, lit from inside"
          use="the few big moments: empty pages, joining, the start of a chat, Spark's suggestions. Large, one or two per screen."
          avoid="navigation, tables, menus and buttons: the line icons stay (they read at 15px; glass does not)."
        >
          <div className="gp-icons">
            <GlassIcon parts={ICON.spark} size={64} />
            <GlassIcon parts={ICON.mic} size={64} />
            <GlassIcon parts={ICON.brief} size={64} />
            <GlassIcon parts={ICON.team} size={64} />
            <GlassIcon parts={ICON.spark} size={64} hue="ember" />
          </div>
        </Block>
      </div>
    </section>
  );
}


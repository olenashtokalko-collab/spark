import type { Meta, StoryObj } from '@storybook/react';
import './stories.css';

// Health's foundations, as the consistency audit kept them (18 Nov): the values in health-system.css.
const meta: Meta = { title: 'Foundations' };
export default meta;
type Story = StoryObj;

const COLOURS: { group: string; items: [string, string, string][] }[] = [
  {
    group: 'Text',
    items: [
      ['ink', '#0e1116', 'titles, body'],
      ['ink-2', 'rgba(14, 17, 22, 0.72)', 'secondary text, labels'],
      ['ink-3', 'rgba(14, 17, 22, 0.5)', 'meta, hints, captions'],
      ['ink-4', 'rgba(14, 17, 22, 0.4)', 'placeholders, disabled'],
    ],
  },
  {
    group: 'Brand',
    items: [
      ['cobalt', '#1e3bd6', 'links, admin tag, Watch, proposals'],
      ['violet', '#7c4ae0', 'the spectrum’s middle'],
      ['ember', '#e8501f', 'attention dots, the spectrum’s end'],
      ['ember-text', '#c2410c', 'Ember as words on white'],
      ['good', '#13804f', 'On track, approved'],
    ],
  },
  {
    group: 'Ground',
    items: [
      ['sand', '#f6f5f2', 'the page'],
      ['spectrum', 'linear-gradient(110deg, #1e3bd6, #7c4ae0 55%, #e8501f)', 'bars, rings, the picked amount'],
    ],
  },
];

export const Colours: Story = {
  render: () => (
    <div>
      {COLOURS.map((g) => (
        <section key={g.group} className="sb-section">
          <h3 className="sb-h">{g.group}</h3>
          <div className="sb-grid">
            {g.items.map(([name, value, use]) => (
              <div key={name} className="sb-swatch">
                <i style={{ background: value }} />
                <b>{name}</b>
                <code>{value.length > 30 ? 'spectrum' : value}</code>
                <span style={{ color: 'rgba(14,17,22,.5)' }}>{use}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

const TYPE: [string, React.CSSProperties, string, string][] = [
  ['display', { font: "700 38px/1.3 'ABC Diatype Extended'", letterSpacing: '-0.02em' }, '700 38', 'What shall we bring to light?'],
  ['page title', { font: "700 32px/1.1 'ABC Diatype Extended'", letterSpacing: '-0.03em' }, '700 32', 'Requests'],
  ['modal title', { font: "700 28px/32px 'ABC Diatype Extended'", letterSpacing: '-0.03em' }, '700 28', 'New request.'],
  ['section title', { font: "700 22px/26px 'ABC Diatype Extended'", letterSpacing: '-0.02em' }, '700 22', 'Strong in your stores, held back online.'],
  ['item title', { font: "500 15px/20px 'ABC Diatype Extended'" }, '500 15', 'Riyadh launch campaign'],
  ['body', { font: "400 15px/22px 'ABC Diatype Extended'" }, '400 15 · 14', 'People’s love for Qindeel in its stores lifts the score.'],
  ['small', { font: "400 13px/18px 'ABC Diatype Extended'", color: 'rgba(14,17,22,.5)' }, '400 13 · 12', 'Charged to the card on file. Receipts go to Documents.'],
  ['label', { font: "500 11.5px/16px 'ABC Diatype Mono'", letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(14,17,22,.72)' }, 'mono 500 11.5 · 0.12em', 'Brand health · what we found'],
  ['tag', { font: "500 10px/1 'ABC Diatype Mono'", letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1e3bd6' }, 'mono 500 10 · 0.10em', 'Admin'],
  ['button', { font: "500 13px/16px 'ABC Diatype Mono'", letterSpacing: '0.1em', textTransform: 'uppercase' }, 'mono 500 12 · 13 · 14', 'Request proposal'],
  ['figure', { font: "900 56px/1 'Doto Rounded', 'Doto'" }, 'Doto 900 56', '72'],
];

export const Type: Story = {
  render: () => (
    <div>
      {TYPE.map(([role, style, spec, sample]) => (
        <div key={role} className="sb-spec">
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{role}</div>
            <code>{spec}</code>
          </div>
          <div style={style}>{sample}</div>
        </div>
      ))}
    </div>
  ),
};

const RADII: [string, string, string][] = [
  ['6', '6px', 'badges, tiny parts'],
  ['12', '12px', 'rows, menu items, small fields'],
  ['16', '16px', 'form fields, amount tiles, lists'],
  ['24', '24px', 'the chat box, the chat bubble'],
  ['32', '32px', 'cards, drawers, modals'],
  ['full', '999px', 'pills, buttons, tags, avatars'],
];

export const Corners: Story = {
  render: () => (
    <div className="sb-grid">
      {RADII.map(([name, r, use]) => (
        <div key={name} className="sb-swatch">
          <div className="sb-box" style={{ borderRadius: r, boxShadow: 'inset 0 0 0 1.5px rgba(14,17,22,.2)' }}>
            {name}
          </div>
          <span style={{ color: 'rgba(14,17,22,.5)' }}>{use}</span>
        </div>
      ))}
    </div>
  ),
};

const SHADOWS: [string, string, string][] = [
  ['card', 'var(--hs-sh-card)', 'Home’s cards, the Requests list, the sidebar'],
  ['floating', 'var(--hs-sh-float)', 'menus, popovers'],
  ['overlay', 'var(--hs-sh-overlay)', 'drawers, modals'],
];

export const Elevation: Story = {
  render: () => (
    <div className="sb-col">
      <div className="sb-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 32 }}>
        {SHADOWS.map(([name, sh, use]) => (
          <div key={name} className="sb-swatch">
            <div className="sb-box" style={{ borderRadius: 24, boxShadow: sh }}>
              {name}
            </div>
            <span style={{ color: 'rgba(14,17,22,.5)' }}>{use}</span>
          </div>
        ))}
      </div>
      <div className="sb-light">
        <div className="sb-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 32 }}>
          <div className="sb-swatch">
            <div className="sb-box" style={{ borderRadius: 32, background: 'var(--hs-glass-card)', border: '1px solid rgba(255,255,255,.95)', boxShadow: 'inset 0 1px 0 #fff, var(--hs-sh-card)', backdropFilter: 'blur(24px) saturate(1.6)' }}>
              card glass
            </div>
          </div>
          <div className="sb-swatch">
            <div className="sb-box" style={{ borderRadius: 32, background: 'var(--hs-glass-overlay)', border: '1px solid rgba(255,255,255,.9)', boxShadow: 'var(--hs-sh-overlay)', backdropFilter: 'blur(24px) saturate(1.4)' }}>
              overlay glass
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

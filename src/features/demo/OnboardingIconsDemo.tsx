// Prototype-only page (#/demo/onboarding-icons, 18 Nov, review: "can we add icons from our empty states to the
// onboarding Home, in Health's style?"): the new company's Home cards (Website, Social, PR, Latest update) with no
// report yet, three ways to picture what's coming. A · the Blender glass icons as the empty states have them; B · a
// thin line icon in Health's spectrum on a soft glass tile; C · the glass icon small, beside the label.
import { ChartColumn, Inbox, MessageCircle, Newspaper, type LucideIcon } from 'lucide-react';
import { cx } from '../../components/ui/primitives';

type Look = 'glass' | 'line' | 'badge';
const LOOKS: { id: Look; name: string; note: string }[] = [
  {
    id: 'glass',
    name: 'A · Glass, in place of the figure',
    note: 'The Blender glass icons from the empty states, 64 px, where the figure will be. The card reads as "something is coming" at a glance; the most visual.',
  },
  {
    id: 'line',
    name: 'B · Line icon on a glass tile',
    note: 'A thin icon drawn in Health’s spectrum (Cobalt to Ember, as the bars) on a small frosted tile. Quiet, the same family as the start’s pills.',
  },
  {
    id: 'badge',
    name: 'C · Glass, small by the label',
    note: 'The glass icon at 22 px beside the card’s label; the dash and the empty bar stay. The least change to the cards as they are.',
  },
];

const CARDS: { from: string; title: string; vs: string; glass: string; Icon: LucideIcon }[] = [
  { from: 'Website', title: 'Website score', vs: 'Speed, design and how it sells', glass: 'chart', Icon: ChartColumn },
  { from: 'Social', title: 'Instagram engagement', vs: 'How people answer your posts', glass: 'chat', Icon: MessageCircle },
  { from: 'PR', title: 'Press mentions', vs: 'Where the press writes about you', glass: 'reports', Icon: Newspaper },
];

function Pic({ look, glass, Icon }: { look: Look; glass: string; Icon: LucideIcon }) {
  if (look === 'line')
    return (
      <span className="oid__tile" aria-hidden>
        <Icon size={22} strokeWidth={1.6} stroke="url(#oid-spectrum)" />
      </span>
    );
  return <img className={cx('oid__glass', look === 'badge' && 'oid__glass--sm')} src={`brand/glass/${glass}.webp`} alt="" aria-hidden />;
}

export function OnboardingIconsDemo() {
  return (
    <div className="oid">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <defs>
          <linearGradient id="oid-spectrum" gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="22" y2="22">
            <stop offset="0" stopColor="#1e3bd6" />
            <stop offset="0.55" stopColor="#7c4ae0" />
            <stop offset="1" stopColor="#e8501f" />
          </linearGradient>
        </defs>
      </svg>
      <header className="oid__head">
        <span className="oid__eyebrow">Onboarding · Home</span>
        <h1>Icons for the cards with nothing yet</h1>
        <p>A new company’s Home before its first reports, with the empty states’ icons in Health’s look. Three ways to place them.</p>
      </header>
      {LOOKS.map((l) => (
        <section key={l.id} className="oid__row">
          <div className="oid__text">
            <b>{l.name}</b>
            <p>{l.note}</p>
          </div>
          <div className={cx('oid__grid', `oid--${l.id}`)}>
            {CARDS.map((c) => (
              <div key={c.from} className="oid__card">
                <span className="oid__top">
                  <span className="oid__label">
                    {l.id === 'badge' && <Pic look={l.id} glass={c.glass} Icon={c.Icon} />}
                    {c.from}
                  </span>
                  <span className="oid__status">No report yet</span>
                </span>
                {l.id === 'badge' ? (
                  <span className="oid__fig">
                    <span className="oid__dash">—</span>
                    <span className="oid__bar" />
                  </span>
                ) : (
                  <span className="oid__pic">
                    <Pic look={l.id} glass={c.glass} Icon={c.Icon} />
                  </span>
                )}
                <span className="oid__title">{c.title}</span>
                <span className="oid__vs">{c.vs}</span>
              </div>
            ))}
            <div className="oid__card oid__card--wide">
              <span className="oid__top">
                <span className="oid__label">
                  {l.id === 'badge' && <Pic look={l.id} glass="request" Icon={Inbox} />}
                  Latest update
                </span>
              </span>
              <div className="oid__empty">
                {l.id !== 'badge' && <Pic look={l.id} glass="request" Icon={Inbox} />}
                <span>
                  <b>Nothing yet</b>
                  Your requests and Spark’s reports will show here.
                </span>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

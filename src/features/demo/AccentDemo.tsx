// Prototype-only page (#/demo/accent): with the primary button now Ink, what happens to the other places
// where Cobalt is "the active thing": the current step in Stages, the unread notifications, the "Mark all
// read" link and the unread dot. Each look shows the same two cards (the real classes, sample content).
//   Now  Cobalt tint, Cobalt tile, Cobalt text, Cobalt dot and link
//   A    Ink: an Ink tile with a white glyph, a neutral tint, Ink text and link
//   B    Quiet: a white tile with an Ink ring; Cobalt stays only as the small unread dot
//   C    Lit glass: the current / unread tile is the one lit glass tile of the recipe (spectrum, white glyph)
import { CheckCheck, Clock, FileText, Folder, Hammer, Inbox, PackageCheck, ScanSearch, Send, BadgeCheck } from 'lucide-react';
import { PageHeader, cx } from '../../components/ui/primitives';

type Look = 'now' | 'a' | 'b' | 'c';
const LOOKS: { id: Look; name: string; note: string }[] = [
  { id: 'now', name: 'Now · Cobalt is the active colour', note: 'The current step has a Cobalt-tinted row, Cobalt label and tile; unread notifications a Cobalt tile and dot; “Mark all read” is a Cobalt link. Next to the black primary button it is now a second, competing “main colour”.' },
  { id: 'a', name: 'A · Ink: the active thing is black', note: 'The current step and the unread tile are solid Ink with a white glyph, like the primary pill; the row tint is a neutral grey, the label Ink, the link Ink Medium, the dot Ink. One colour for “the thing to look at”.' },
  { id: 'b', name: 'B · Quiet: a ring, Cobalt only in the dot', note: 'The tile stays white with an Ink glyph and an Ink ring when it is current or unread; the row tint is neutral, the label Ink. Cobalt remains only as the small unread dot, so it means “new” and nothing else.' },
  { id: 'c', name: 'C · One lit glass tile', note: 'The current step and the unread tiles are the lit glass tile of the brand recipe: spectrum underneath, white glyph on top. The row tint is neutral, the text and links Ink. The most on-brand; the unread ones are few, so it stays one cluster.' },
];

const STAGES = [
  { icon: Send, label: 'Submitted', info: 'Your request is in Spark’s queue.', s: 'done' },
  { icon: ScanSearch, label: 'In review', info: 'Spark scopes the work and may come back with questions.', s: 'done' },
  { icon: FileText, label: 'Proposal', info: 'You get scope, price and timeline to approve or change.', s: 'current' },
  { icon: BadgeCheck, label: 'Approved', info: 'Spark schedules the kick-off.', s: 'todo' },
  { icon: Hammer, label: 'In progress', info: 'Spark works on the deliverables; you review drafts.', s: 'todo' },
  { icon: PackageCheck, label: 'Delivered', info: 'Final files land in Documents.', s: 'todo' },
] as const;

const NOTIFS = [
  { icon: FileText, title: 'Proposal ready: UAE National Day window displays', body: 'AED 54,000 · 6 weeks · decision by 18 Oct', time: '6 days ago', unread: true },
  { icon: Inbox, title: 'Spark started reviewing REQ-105', body: 'Response plan for delivery fee complaints', time: '8 Oct' },
  { icon: Folder, title: 'Approval requested on packaging concepts', body: 'Spark shared round 1 for Ramadan 2027 · due 15 Oct', time: '7 Oct' },
];

function Stages() {
  return (
    <section className="side-card stg stg--discs" aria-label="Stages">
      <h3 className="side-card__title">
        Stages <span className="block__count status-card__step">3 of 6</span>
      </h3>
      <ol className="stg__list">
        {STAGES.map((st) => {
          const I = st.icon;
          return (
            <li key={st.label} className={cx('stg__item', `is-${st.s}`)}>
              <span className="stg__mark">
                <I size={15} strokeWidth={1.8} />
              </span>
              <div className="stg__body">
                <div className="stg__label">{st.label}</div>
                <div className="stg__info">{st.info}</div>
                {st.s === 'current' && (
                  <div className="stg__due is-on-you">
                    <Clock size={14} />
                    <span className="stg__due-when">Due Sun 18 Oct · in 2 days</span>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Notifs() {
  return (
    <div className="acc__notifs">
      <div className="notifs">
        <div className="notifs__head">
          <span>Notifications</span>
          <button className="link-btn">
            <CheckCheck size={14} /> Mark all read
          </button>
        </div>
        <div className="notifs__list">
          {NOTIFS.map((n) => {
            const I = n.icon;
            return (
              <div key={n.title} className={cx('notif', n.unread && 'is-unread')}>
                <span className="notif__icon">
                  <I size={15} strokeWidth={1.7} />
                </span>
                <span className="notif__text">
                  <span className="notif__title">{n.title}</span>
                  <span className="notif__body">{n.body}</span>
                  <span className="notif__time">{n.time}</span>
                </span>
                {n.unread && <span className="notif__dot" aria-label="Unread" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AccentDemo() {
  return (
    <div className="cdemo accdemo">
      <PageHeader
        title="Active states with a black primary"
        sub="Now that the main button is Ink, the current step in Stages, the unread notifications and their link still use Cobalt as “the active colour”, so two colours compete. Four ways to bring them in line, on the same two cards. Nothing here is applied to the app."
      />
      <div className="accdemo__grid">
        {LOOKS.map((l) => (
          <section key={l.id} className={cx('gdemo__card', 'acc', `acc--${l.id}`)}>
            <header>
              <h3>{l.name}</h3>
              <p>{l.note}</p>
            </header>
            <div className="acc__row">
              <div className="acc__col">
                <Stages />
              </div>
              <div className="acc__col">
                <Notifs />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

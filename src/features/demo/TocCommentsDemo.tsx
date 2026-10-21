// Prototype-only page (#/demo/toc-comments): looks for the comment count in the
// proposal's "On this page" menu that match the mark next to a section title
// (the client's avatar with a small dark comment badge).
import { AlignLeft, MessageSquare } from 'lucide-react';
import { Avatar, PageHeader } from '../../components/ui/primitives';

const layla = { name: 'Layla Haddad', hue: 20, org: 'client' as const };
const omar = { name: 'Omar Saeed', hue: 150, org: 'client' as const };
const ITEMS = [
  { label: 'Overview' },
  { label: 'Objectives' },
  { label: 'Scope & deliverables', n: 2, who: [omar] },
  { label: 'Timeline', n: 1, who: [layla] },
  { label: 'Investment' },
  { label: 'Terms', n: 2, who: [layla, omar] },
];

const VARIANTS = [
  { id: 'badge', name: '1 · Dark badge and count', note: 'The same small dark comment badge as on the avatar, with the count beside it. One icon across the page.' },
  { id: 'avatar', name: '2 · Mini avatar', note: 'The section mark in miniature: who commented, with the dark badge on the corner. No number.' },
  { id: 'stack', name: '3 · Avatars and count', note: 'Small avatars of everyone who commented, overlapping, then the count. Who and how many.' },
  { id: 'count', name: '4 · Count in the badge', note: 'Just the dark round badge with the number inside, like an unread count. The quietest match.' },
] as const;
type Id = (typeof VARIANTS)[number]['id'];

function Badge() {
  return (
    <i className="tcd-badge">
      <MessageSquare size={9} strokeWidth={2.6} />
    </i>
  );
}

function Count({ id, n, who }: { id: Id; n: number; who: typeof layla[] }) {
  if (id === 'avatar')
    return (
      <span className="tcd tcd--avatar">
        <span className="cmk__av">
          <Avatar person={who[0]} size={18} />
          <Badge />
        </span>
      </span>
    );
  if (id === 'stack')
    return (
      <span className="tcd tcd--stack">
        <span className="tcd-stack">
          {who.map((w) => (
            <Avatar key={w.name} person={w} size={18} />
          ))}
        </span>
        {n}
      </span>
    );
  if (id === 'count')
    return (
      <span className="tcd tcd--count">
        <i className="tcd-num">{n}</i>
      </span>
    );
  return (
    <span className="tcd">
      <Badge /> {n}
    </span>
  );
}

export function TocCommentsDemo() {
  return (
    <div className="cdemo cmddemo">
      <PageHeader title="Comments in “On this page”" sub="Four ways to show comments in the menu that match the mark next to a section title." />
      <div className="tcd-ref">
        <span className="faint">Section title today:</span>
        <span className="psec__title">Timeline</span>
        <span className="cmk cmk--avatar">
          <span className="cmk__av">
            <Avatar person={layla} size={22} />
            <Badge />
          </span>
          Layla commented
        </span>
      </div>
      <div className="cmddemo__grid">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className="cmddemo__stage">
              <nav className="ptoc tcd-toc">
                <div className="ptoc__title">
                  <AlignLeft size={15} strokeWidth={1.8} /> On this page
                </div>
                <div className="ptoc__items">
                  {ITEMS.map((it, i) => (
                    <a key={it.label} className={`ptoc__item${i === 2 ? ' is-active' : ''}`} href="#/demo/toc-comments">
                      {it.label}
                      {it.n && <Count id={v.id} n={it.n} who={it.who} />}
                    </a>
                  ))}
                </div>
              </nav>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

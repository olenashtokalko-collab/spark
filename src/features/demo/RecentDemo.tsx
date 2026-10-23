// Prototype-only page (#/demo/recent): "Continue where you left off" on the home page, more compact. The same four
// items as the home page, at the home page's width. Looks:
//   Now  a display heading and 56px rows with hairlines
//   A    a small heading and 40px rows
//   B    four small cards in a 2×2 grid, with the kind and when
//   C    one line of pills
//   D    40px rows without hairlines, the kind and when on the right
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '../../components/ui/primitives';
import { fmtRelative } from '../../lib/format';
import { useRecent } from '../assistant/Home';

type Item = ReturnType<typeof useRecent>[number];

const LOOKS: { id: string; name: string; note: string }[] = [
  { id: 'now', name: 'Now', note: 'A display heading, rows of 56px with hairlines.' },
  { id: 'a', name: 'A · Small heading, tighter rows', note: 'The heading as a quiet label, rows of 40px. The same list, about 30% shorter.' },
  { id: 'b', name: 'B · Four cards, 2×2', note: 'Each item as a small card with its kind and when. Two rows instead of four; reads as “things”, not a table.' },
  { id: 'c', name: 'C · One line of pills', note: 'The most compact: the four items as pills, like the prompts above. Long titles are cut short.' },
  { id: 'd', name: 'D · Rows with the kind and when', note: 'Rows of 40px without hairlines; the kind and how long ago on the right, so each row says more in less space.' },
];

const Go = () => <ArrowRight size={15} className="home-recent__go" aria-hidden />;

function Now({ items }: { items: Item[] }) {
  return (
    <section className="home__recent rcd-reset">
      <h2 className="home__h2">Continue where you left off</h2>
      <div className="home__rows">
        {items.map((i) => (
          <a key={i.key} className="home__row" href={i.href}>
            <i.icon size={16} strokeWidth={1.7} className="home__icon" aria-hidden />
            <span className="rq-row3__name">
              <span className="rq-row3__title">{i.title}</span>
              {i.mark}
            </span>
            <Go />
          </a>
        ))}
      </div>
    </section>
  );
}

function LookA({ items }: { items: Item[] }) {
  return (
    <section className="rcd-a">
      <h2 className="rcd-label">Continue where you left off</h2>
      <div className="home__rows">
        {items.map((i) => (
          <a key={i.key} className="home__row rcd-a__row" href={i.href}>
            <i.icon size={15} strokeWidth={1.7} className="home__icon" aria-hidden />
            <span className="rq-row3__name">
              <span className="rq-row3__title">{i.title}</span>
              {i.mark}
            </span>
            <Go />
          </a>
        ))}
      </div>
    </section>
  );
}

function LookB({ items }: { items: Item[] }) {
  return (
    <section>
      <h2 className="rcd-label">Continue where you left off</h2>
      <div className="rcd-b">
        {items.map((i) => (
          <a key={i.key} className="rcd-b__card" href={i.href}>
            <i.icon size={16} strokeWidth={1.7} className="rcd-b__icon" aria-hidden />
            <span className="rcd-b__text">
              <span className="rcd-b__title">
                <span className="rcd-ellipsis">{i.title}</span>
                {i.mark}
              </span>
              <span className="rcd-meta">
                {i.kind} · {fmtRelative(i.when)}
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function LookC({ items }: { items: Item[] }) {
  return (
    <section className="rcd-c">
      <span className="rcd-label rcd-c__label">Continue</span>
      {items.map((i) => (
        <a key={i.key} className="home__prompt rcd-c__pill" href={i.href} title={i.title}>
          <i.icon size={15} strokeWidth={1.7} />
          <span className="rcd-ellipsis">{i.title}</span>
          {i.mark}
        </a>
      ))}
    </section>
  );
}

function LookD({ items }: { items: Item[] }) {
  return (
    <section>
      <h2 className="rcd-label">Continue where you left off</h2>
      <div className="rcd-d">
        {items.map((i) => (
          <a key={i.key} className="rcd-d__row" href={i.href}>
            <i.icon size={15} strokeWidth={1.7} className="home__icon" aria-hidden />
            <span className="rcd-d__title">
              <span className="rcd-ellipsis">{i.title}</span>
              {i.mark}
            </span>
            <span className="rcd-meta">
              {i.kind} · {fmtRelative(i.when)}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

const VIEWS: Record<string, (p: { items: Item[] }) => JSX.Element> = { now: Now, a: LookA, b: LookB, c: LookC, d: LookD };

export function RecentDemo() {
  const items = useRecent();
  return (
    <div className="cdemo">
      <PageHeader
        title="Continue where you left off, more compact"
        sub="The same four items as the home page, at its width. Nothing here is applied to the app."
      />
      <div className="rcd__grid">
        {LOOKS.map((l) => {
          const View = VIEWS[l.id];
          return (
            <section key={l.id} className="rcd__card">
              <header>
                <h3>{l.name}</h3>
                <p>{l.note}</p>
              </header>
              <div className="rcd__stage home home--calm">
                <View items={items} />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

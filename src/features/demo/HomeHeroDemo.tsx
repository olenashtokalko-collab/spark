// Prototype-only page (#/demo/home-hero?v=…): Home's header with the client's team under the description
// (their faces and how many work here besides you) and in one card with a stroke, after the client's
// references. The page is the real Home otherwise.
import { useRoute, navigate } from '../../lib/router';
import { analyses as seedAnalyses } from '../../data/mock';
import { PageHeader, cx } from '../../components/ui/primitives';
import { MainSide, useModel, type ReqIcons } from '../home/HomeLayouts';

const VARIANTS = [
  { v: 'now', label: 'Before', team: false, framed: false, note: 'The header before: no team, no card.' },
  { v: 'team', label: 'A · Team', team: true, framed: false, note: 'The client’s team under the description: their faces and “Brand Co. team · you and 2 colleagues”; it opens Team. Only the client’s people: Spark stays one team.' },
  { v: 'frame', label: 'B · Card', team: false, framed: true, note: 'The header, from the cover to the requests, in one card with a hairline stroke, no fill; the tabs stay under it.' },
  { v: 'both', label: 'C · Team + card', team: true, framed: true, note: 'Both: the team line inside the card.' },
  { v: 'divider', label: 'D · Divider', team: true, framed: 'divider', note: 'One card; the requests under a hairline across it, so the company and its requests read as two parts of one header.' },
  { v: 'split', label: 'E · Two cards (on Home)', team: true, framed: 'split', note: 'Two cards: the company (cover, name, description, team, credits, Ask Spark), then the requests in a card of their own.' },
] as const;

export function HomeHeroDemo() {
  const { query } = useRoute();
  const cur = VARIANTS.find((x) => x.v === query.get('v')) ?? VARIANTS[5];
  const icons: ReqIcons = query.get('icons') === 'line' ? 'line' : 'emoji';
  const go = (v: string, i: ReqIcons) => navigate(`/demo/home-hero?v=${v}&icons=${i}`, { replace: true });
  const m = useModel(seedAnalyses);
  return (
    <div className="cdemo">
      <PageHeader title="Home · team and card" sub="The client’s team in the header, and the header in one card. Prototype only: this page isn’t in the portal’s navigation." />
      <div className="fdm-switch">
        {VARIANTS.map((x) => (
          <button key={x.v} className={cx(cur.v === x.v && 'is-on')} onClick={() => go(x.v, icons)}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{cur.note}</p>
      <div className="fdm-switch hd-looks">
        <span className="faint">Request icons</span>
        {(
          [
            ['emoji', 'Emoji (on Home)'],
            ['line', 'Icons'],
          ] as const
        ).map(([i, label]) => (
          <button key={i} className={cx(icons === i && 'is-on')} onClick={() => go(cur.v, i)}>
            {label}
          </button>
        ))}
      </div>
      <div className="hd-frame hl-frame">
        <MainSide m={m} reqs="summary" team={cur.team} framed={cur.framed} reqIcons={icons} />
      </div>
    </div>
  );
}

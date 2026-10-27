// Prototype-only page (#/demo/home-next?p=…&s=…): Home with what Spark is working on, in four looks, and
// Home in two other states: credits running low, and a new client with nothing from Spark yet (the empty
// states). The page is the real Home otherwise.
import { useRoute, navigate } from '../../lib/router';
import { analyses as seedAnalyses } from '../../data/mock';
import { PageHeader, cx } from '../../components/ui/primitives';
import { MainSide, useModel, type ProgressLook } from '../home/HomeLayouts';

const LOOKS: { p: ProgressLook; label: string; note: string }[] = [
  { p: 'rows', label: 'A · Rows (on Home)', note: 'Rows on hairlines under the issues, like Latest from Spark: what it is, the next step and its date, the stage on the right. Quiet and consistent with the rest of the page.' },
  { p: 'cards', label: 'B · Cards', note: 'White cards like the issue cards: the type and stage as a label, the latest update, the next step at the foot. More visible, but the page gets two card rows.' },
  { p: 'steps', label: 'C · Stage tracker', note: 'Rows with a short tracker: Submitted, Scoping, Proposal, In progress, Delivered. Shows how far along each request is at a glance.' },
  { p: 'line', label: 'D · One line', note: 'One line at the top of Overview: how many requests Spark has in hand and the nearest next step; See progress opens Requests. The lightest; the detail is on Requests.' },
];
const STATES = [
  { s: 'default', label: 'Default' },
  { s: 'low', label: 'Credits running low' },
  { s: 'fresh', label: 'New client (empty)' },
] as const;
type St = (typeof STATES)[number]['s'];

export function HomeNextDemo() {
  const { query } = useRoute();
  const p: ProgressLook = LOOKS.some((x) => x.p === query.get('p')) ? (query.get('p') as ProgressLook) : 'rows';
  const st: St = STATES.some((x) => x.s === query.get('s')) ? (query.get('s') as St) : 'default';
  const go = (np: ProgressLook, ns: St) => navigate(`/demo/home-next?p=${np}&s=${ns}`, { replace: true });
  const model = useModel(seedAnalyses);
  const m = st === 'fresh' ? { ...model, waiting: [], ongoing: [], done: [], analyses: [] } : model;
  return (
    <div className="cdemo">
      <PageHeader title="Home · work in progress and states" sub="What Spark is working on, in four looks; Home with credits running low and for a new client. Prototype only: this page isn’t in the portal’s navigation." />
      <div className="fdm-switch">
        {LOOKS.map((x) => (
          <button key={x.p} className={cx(p === x.p && 'is-on')} onClick={() => go(x.p, st)}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{LOOKS.find((x) => x.p === p)!.note}</p>
      <div className="fdm-switch hd-looks">
        <span className="faint">State</span>
        {STATES.map((x) => (
          <button key={x.s} className={cx(st === x.s && 'is-on')} onClick={() => go(p, x.s)}>
            {x.label}
          </button>
        ))}
      </div>
      <div className="hd-frame hl-frame">
        <MainSide
          key={st}
          m={m}
          reqs="alert"
          bannerArt="none"
          progress={p}
          fresh={st === 'fresh'}
          credits={st === 'low' ? { left: 12.4, total: 100 } : st === 'fresh' ? { left: 100, total: 100 } : undefined}
        />
      </div>
    </div>
  );
}

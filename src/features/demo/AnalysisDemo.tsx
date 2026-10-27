// Prototype-only page (#/demo/analysis?v=…&kind=…): the analysis page in four looks, for any of the three
// analyses. The live page (#/analysis/:kind) is unchanged until one is picked.
import { useRoute, navigate } from '../../lib/router';
import { analyses } from '../../data/mock';
import { PageHeader, cx } from '../../components/ui/primitives';
import { AnalysisView, type AnalysisLook } from '../home/AnalysisLooks';

const LOOKS: { v: AnalysisLook; label: string; note: string }[] = [
  { v: 'priorities', label: 'A · Priorities', note: 'One column. The verdict as a lead, three figures, then “Fix first”: numbered rows by impact, each with what Spark found, what Spark would do, Ask Spark to fix and Make it a request. What works and how Spark did it follow, quieter.' },
  { v: 'side', label: 'B · Side panel', note: 'The same content on the left; on the right a sticky panel to talk about it: ready questions and a box. Sending starts the chat. The chat is always in view while reading.' },
  { v: 'conversation', label: 'C · Conversation', note: 'Spark presents the analysis as a message (the verdict, what to fix first, what works) and you reply below, with ready questions. The page reads like a chat that has already started.' },
  { v: 'report', label: 'D · Report', note: 'A document with “On this page”, as the proposal: Summary, Fix first, What works, How Spark did this. Each section has Ask about this beside its title; Ask Spark stays in the navigation.' },
  { v: 'compare', label: 'E · Found → fix', note: 'Each issue as one row in two columns: what Spark found on the left, what Spark would do on the right with the actions under it. Problem and answer read side by side.' },
  { v: 'board', label: 'F · By impact', note: 'The issues as cards in columns: High, Medium, Low impact, and what works in a fourth. The weight of each issue is the column it sits in.' },
  { v: 'focus', label: 'G · One by one', note: 'One issue at a time, large, with all of them listed beside it; click or step through with the arrows. Good for going through the analysis together on a call.' },
  { v: 'tabs', label: 'I · Cards (live)', note: 'On the analysis page: Issues to fix as a grid of cards, each with what Spark found, what Spark would do and the actions; What works under them. Opened from Home, the clicked issue is brought into view and outlined.' },
  { v: 'agent', label: 'J · Agent', note: 'After the control-centre reference: a header card with Spark’s light along the top, the verdict and figures as cells. Then each issue as a “decision”: the impact and channel, the evidence quoted, Spark’s recommendation in a tinted box with the actions. What it’s based on as signals in a column beside, with what works.' },
  { v: 'featured', label: 'K · Featured', note: 'The same header. The most important issue (or the one opened from Home) large, with its signals beside it, as the reference’s “Most recent decision”; the other issues as smaller cards tinted by impact, and what works in green.' },
  { v: 'ink', label: 'H · Ink cover', note: 'The verdict and figures on an Ink card at the top (an Ink object carries the spark), then the issues folded to one line each; the first is open. The shortest page.' },
];

export function AnalysisDemo() {
  const { query } = useRoute();
  const v: AnalysisLook = LOOKS.some((x) => x.v === query.get('v')) ? (query.get('v') as AnalysisLook) : 'priorities';
  const a = analyses.find((x) => x.kind === query.get('kind')) ?? analyses[0];
  const go = (nv: AnalysisLook, kind: string) => navigate(`/demo/analysis?v=${nv}&kind=${kind}`, { replace: true });
  return (
    <div className="cdemo">
      <PageHeader title="Analysis page" sub="Hierarchy and talking to Spark, four ways. Prototype only: this page isn’t in the portal’s navigation." />
      <div className="fdm-switch">
        {LOOKS.map((x) => (
          <button key={x.v} className={cx(v === x.v && 'is-on')} onClick={() => go(x.v, a.kind)}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{LOOKS.find((x) => x.v === v)!.note}</p>
      <div className="fdm-switch hd-looks">
        <span className="faint">Analysis</span>
        {analyses.map((x) => (
          <button key={x.kind} className={cx(a.kind === x.kind && 'is-on')} onClick={() => go(v, x.kind)}>
            {x.title.replace(' analysis', '')}
          </button>
        ))}
      </div>
      <div className="hd-frame anx-frame">
        <AnalysisView key={`${v}-${a.kind}`} a={a} look={v} />
      </div>
    </div>
  );
}

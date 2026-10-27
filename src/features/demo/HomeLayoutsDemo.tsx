// Prototype-only comparison page (#/demo/home-layouts?v=action|intel|workspace|mainside): the Home layouts
// side by side on the same content. D (Profile) is the Home page itself.
import { useState } from 'react';
import { useRoute, navigate } from '../../lib/router';
import { analyses as seedAnalyses } from '../../data/mock';
import { PageHeader, cx } from '../../components/ui/primitives';
import { ActionFirst, Intelligence, MainSide, Workspace, useModel } from '../home/HomeLayouts';

type Variant = 'action' | 'intel' | 'workspace' | 'mainside';
const VARIANTS: { v: Variant; label: string; note: string }[] = [
  { v: 'action', label: 'A · Action-first', note: 'What needs the client leads: a one-line summary, then the decisions with their deadlines and a review action each, then the work in progress. The company and Spark’s analysis share a row below.' },
  { v: 'intel', label: 'B · Company intelligence', note: 'Spark’s work leads: the company’s identity, then each analysis as a short dossier with what works and where it gets lost. Decisions, work in progress and deliveries sit in a narrower column beside it.' },
  { v: 'workspace', label: 'C · Workspace', note: 'The partnership: three lanes say who has the ball (with you, with Spark, delivered). The company follows as an editorial spread, then the analysis library, split into what Spark prepared and what you asked for.' },
  { v: 'mainside', label: 'D · Profile', note: 'A profile page, after the references: a tall cover in the brand’s light with the company’s tile over its edge, its name and the credits on it; then its line, positioning and tabs (Overview, Company profile, Spark’s analysis). Below, a wide column (company details and Spark’s analysis as a reading column) and two cards beside it: requests (what needs your decision, what’s in progress and its next step) and Ask Spark with the mascot, New chat and the three latest chats.' },
];

export function HomeLayoutsDemo() {
  const { query } = useRoute();
  const v: Variant = VARIANTS.some((x) => x.v === query.get('v')) ? (query.get('v') as Variant) : 'action';
  const [withAnalysis, setWithAnalysis] = useState(true);
  const m = useModel(withAnalysis ? seedAnalyses : []);
  const cur = VARIANTS.find((x) => x.v === v)!;
  return (
    <div className="cdemo">
      <PageHeader title="Home · layouts" sub="Same content, four information architectures. Prototype only: this page isn’t in the portal’s navigation." />
      <div className="fdm-switch">
        {VARIANTS.map((x) => (
          <button key={x.v} className={cx(v === x.v && 'is-on')} onClick={() => navigate(`/demo/home-layouts?v=${x.v}`, { replace: true })}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{cur.note}</p>
      <div className="fdm-switch hd-looks">
        <span className="faint">Spark’s analysis</span>
        <button className={cx(withAnalysis && 'is-on')} onClick={() => setWithAnalysis(true)}>
          Available (3)
        </button>
        <button className={cx(!withAnalysis && 'is-on')} onClick={() => setWithAnalysis(false)}>
          None yet
        </button>
      </div>
      <div className="hd-frame hl-frame">
        {v === 'action' && <ActionFirst m={m} />}
        {v === 'intel' && <Intelligence m={m} />}
        {v === 'workspace' && <Workspace m={m} />}
        {v === 'mainside' && <MainSide m={m} />}
      </div>
    </div>
  );
}

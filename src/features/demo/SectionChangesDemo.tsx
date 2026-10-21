// Prototype-only page (#/demo/section-changes): when the Spark team opens the new version of a proposal the client
// asked to change, which sections did the client comment on? A mark in the Sections menu and on the section's
// heading. The amber "!" already means "not filled in yet", so this mark must not look like it. Looks:
//   A  speech bubble with the number of comments
//   B  a small violet dot
//   C  a "Changes" pill
//   D  a "revise" arrow
import { AlertCircle, MessageSquare, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageHeader } from '../../components/ui/primitives';
import { ProposalToc } from '../requests/ProposalView';

type Look = 'a' | 'b' | 'c' | 'd';
const LOOKS: { id: Look; name: string; note: string }[] = [
  { id: 'a', name: 'A · Speech bubble and count', note: 'Says what it is (comments) and how many. Clear next to the amber “!”, a little busier.' },
  { id: 'b', name: 'B · Dot', note: 'The quietest: a violet dot like an unread mark. Needs the tooltip to say what it means.' },
  { id: 'c', name: 'C · “Changes” pill', note: 'A word, not an icon, so nothing to learn. The widest; long section names may wrap.' },
  { id: 'd', name: 'D · Revise arrow', note: 'Reads as “to rework”, not as “has comments”. Close in shape to the amber “!”.' },
];

// The sections as in the editor, with the sample client's comments (REQ-203): one on Timeline, one on Investment.
const SECTIONS = [
  { id: 'overview', label: 'Overview', comments: 0 },
  { id: 'objectives', label: 'Objectives', comments: 0 },
  { id: 'scope', label: 'Scope and deliverables', comments: 0 },
  { id: 'timeline', label: 'Timeline and decision', comments: 1 },
  { id: 'investment', label: 'Investment', comments: 1 },
  { id: 'terms', label: 'Terms', comments: 0 },
  { id: 'file', label: 'Proposal file', comments: 0, todo: true },
];

function Mark({ look, n }: { look: Look; n: number }): ReactNode {
  const tip = `${n} ${n === 1 ? 'comment' : 'comments'} from the client`;
  switch (look) {
    case 'a':
      return (
        <span className="scd-mark scd-mark--a" data-tip={tip}>
          <MessageSquare size={14} strokeWidth={2} />
          {n}
        </span>
      );
    case 'b':
      return <span className="scd-mark scd-mark--b" data-tip={tip} aria-label={tip} />;
    case 'c':
      return <span className="scd-mark scd-mark--c">Changes</span>;
    case 'd':
      return (
        <span className="scd-mark scd-mark--d" data-tip={tip} aria-label={tip}>
          <RotateCcw size={15} strokeWidth={2} />
        </span>
      );
  }
}

const Todo = () => (
  <span className="pe-mark pe-mark--todo">
    <AlertCircle size={16} strokeWidth={2} />
  </span>
);

export function SectionChangesDemo() {
  return (
    <div className="cdemo">
      <PageHeader
        title="Sections the client asked to change"
        sub="In the new version's editor: a mark in the Sections menu and on the section's heading. Proposal file shows the amber “!” (not filled in yet) for comparison. Nothing here is applied to the app."
      />
      <div className="scd__grid">
        {LOOKS.map((l) => (
          <section key={l.id} className="gdemo__card">
            <header>
              <h3>{l.name}</h3>
              <p>{l.note}</p>
            </header>
            <div className="scd__row">
              <div className="proposal__side pe-menu scd__menu">
                <ProposalToc
                  title="Sections"
                  items={SECTIONS.map((s) => ({ id: `${l.id}-${s.id}`, label: s.label, trail: s.comments ? <Mark look={l.id} n={s.comments} /> : s.todo ? <Todo /> : undefined }))}
                />
              </div>
              <div className="pe-pane scd__pane">
                <header className="pe-pane__head">
                  <div>
                    <h3>Investment</h3>
                    <p className="muted">The price as line items; the total adds up by itself.</p>
                  </div>
                  <Mark look={l.id} n={1} />
                </header>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

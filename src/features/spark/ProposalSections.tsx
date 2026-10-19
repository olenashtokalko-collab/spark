// The sections of a proposal, as the Spark team fills them in, and how complete each one is.
// Shared by the proposal editor layouts (#/spark/layouts). Each section has an editor and a "done" test.
import { useMemo, useState } from 'react';
import { Calendar, FileText, Package, Paperclip, Plus, ScrollText, Banknote, Target, Trash2, UploadCloud } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button, Field, Input, Textarea } from '../../components/ui/primitives';
import { addDays, aed, nowIso } from '../../lib/format';

export type SectionId = 'overview' | 'objectives' | 'scope' | 'timeline' | 'investment' | 'terms' | 'file';

export const SECTIONS: { id: SectionId; label: string; hint: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Overview', hint: 'The title and the two sentences the client reads first.', icon: FileText },
  { id: 'objectives', label: 'Objectives', hint: 'What the client and Spark agreed to achieve.', icon: Target },
  { id: 'scope', label: 'Scope and deliverables', hint: 'What the client gets, one line per deliverable.', icon: Package },
  { id: 'timeline', label: 'Timeline and decision', hint: 'The phases, when work starts and when the client must decide.', icon: Calendar },
  { id: 'investment', label: 'Investment', hint: 'The price as line items; the total adds up by itself.', icon: Banknote },
  { id: 'terms', label: 'Terms', hint: 'Payment, revisions and anything else that applies.', icon: ScrollText },
  { id: 'file', label: 'Proposal file', hint: 'The PDF the client can download.', icon: Paperclip },
];

const today = () => nowIso().slice(0, 10);
const num = (v: string) => Number(v.replace(/[^\d]/g, '')) || 0;

export function useProposalForm() {
  const [title, setTitle] = useState('Response plan for delivery fee complaints');
  const [summary, setSummary] = useState('A reply approach for the community team and a view on the pricing message before Riyadh.');
  const [objectives, setObjectives] = useState(['']);
  const [scope, setScope] = useState([{ title: '', detail: '' }]);
  const [phases, setPhases] = useState([
    { name: 'Analysis', weeks: '2' },
    { name: 'Reply plan and playbook', weeks: '3' },
  ]);
  const [start, setStart] = useState(addDays(today(), 7));
  const [until, setUntil] = useState(addDays(today(), 5));
  const [lines, setLines] = useState([{ item: '', amount: '' }]);
  const [terms, setTerms] = useState(['50% is invoiced on approval and 50% on delivery.', 'Prices exclude VAT.']);
  const [file, setFile] = useState<string | null>(null);

  const done: Record<SectionId, boolean> = {
    overview: !!title.trim() && !!summary.trim(),
    objectives: objectives.some((o) => o.trim()),
    scope: scope.some((s) => s.title.trim()),
    timeline: phases.some((p) => p.name.trim() && num(p.weeks) > 0) && !!start && !!until,
    investment: lines.some((l) => l.item.trim() && num(l.amount) > 0),
    terms: terms.some((t) => t.trim()),
    file: !!file,
  };
  const ready = SECTIONS.filter((s) => done[s.id]).length;
  const total = useMemo(() => lines.reduce((a, l) => a + num(l.amount), 0), [lines]);
  const weeks = useMemo(() => phases.reduce((a, p) => a + num(p.weeks), 0), [phases]);
  return { title, setTitle, summary, setSummary, objectives, setObjectives, scope, setScope, phases, setPhases, start, setStart, until, setUntil, lines, setLines, terms, setTerms, file, setFile, done, ready, total, weeks };
}
export type ProposalForm = ReturnType<typeof useProposalForm>;

const RowRemove = ({ onClick }: { onClick: () => void }) => (
  <button className="btn btn--ghost btn--sm btn--icon" aria-label="Remove" onClick={onClick}>
    <Trash2 size={15} />
  </button>
);

/** The editor of one section. The fields are the same in every layout. */
export function SectionEditor({ id, f }: { id: SectionId; f: ProposalForm }) {
  switch (id) {
    case 'overview':
      return (
        <div className="spk-form">
          <Field label="Title" htmlFor="pe-title">
            <Input id="pe-title" value={f.title} onChange={(e) => f.setTitle(e.target.value)} />
          </Field>
          <Field label="Summary" htmlFor="pe-sum" hint="Two sentences the client reads first.">
            <Textarea id="pe-sum" rows={4} value={f.summary} onChange={(e) => f.setSummary(e.target.value)} />
          </Field>
        </div>
      );
    case 'objectives':
      return (
        <div className="spk-form">
          {f.objectives.map((o, i) => (
            <div key={i} className="spk-rowfields spk-rowfields--one">
              <Input value={o} onChange={(e) => f.setObjectives((a) => a.map((x, j) => (j === i ? e.target.value : x)))} placeholder="What we agreed to achieve" aria-label="Objective" />
              <RowRemove onClick={() => f.setObjectives((a) => (a.length > 1 ? a.filter((_, j) => j !== i) : ['']))} />
            </div>
          ))}
          <div>
            <Button size="sm" icon={Plus} onClick={() => f.setObjectives((a) => [...a, ''])}>
              Add an objective
            </Button>
          </div>
        </div>
      );
    case 'scope':
      return (
        <div className="spk-form">
          {f.scope.map((s, i) => (
            <div key={i} className="spk-rowfields">
              <Input value={s.title} onChange={(e) => f.setScope((a) => a.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} placeholder="Deliverable" aria-label="Deliverable" />
              <Input value={s.detail} onChange={(e) => f.setScope((a) => a.map((x, j) => (j === i ? { ...x, detail: e.target.value } : x)))} placeholder="What the client gets" aria-label="Description" />
              <RowRemove onClick={() => f.setScope((a) => (a.length > 1 ? a.filter((_, j) => j !== i) : [{ title: '', detail: '' }]))} />
            </div>
          ))}
          <div>
            <Button size="sm" icon={Plus} onClick={() => f.setScope((a) => [...a, { title: '', detail: '' }])}>
              Add a deliverable
            </Button>
          </div>
        </div>
      );
    case 'timeline':
      return (
        <div className="spk-form">
          {f.phases.map((p, i) => (
            <div key={i} className="spk-rowfields spk-rowfields--price">
              <Input value={p.name} onChange={(e) => f.setPhases((a) => a.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Phase" aria-label="Phase" />
              <Input value={p.weeks} onChange={(e) => f.setPhases((a) => a.map((x, j) => (j === i ? { ...x, weeks: e.target.value } : x)))} placeholder="Weeks" aria-label="Weeks" />
              <RowRemove onClick={() => f.setPhases((a) => a.filter((_, j) => j !== i))} />
            </div>
          ))}
          <div>
            <Button size="sm" icon={Plus} onClick={() => f.setPhases((a) => [...a, { name: '', weeks: '' }])}>
              Add a phase
            </Button>
          </div>
          <div className="spk-three spk-three--two">
            <Field label="Work starts" htmlFor="pe-s">
              <Input id="pe-s" type="date" value={f.start} onChange={(e) => f.setStart(e.target.value)} />
            </Field>
            <Field label="Decision needed by" htmlFor="pe-u" hint="Shown as a countdown to the client.">
              <Input id="pe-u" type="date" value={f.until} onChange={(e) => f.setUntil(e.target.value)} />
            </Field>
          </div>
        </div>
      );
    case 'investment':
      return (
        <div className="spk-form">
          {f.lines.map((l, i) => (
            <div key={i} className="spk-rowfields spk-rowfields--price">
              <Input value={l.item} onChange={(e) => f.setLines((a) => a.map((x, j) => (j === i ? { ...x, item: e.target.value } : x)))} placeholder="Line item" aria-label="Line item" />
              <Input value={l.amount} onChange={(e) => f.setLines((a) => a.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))} placeholder="AED" aria-label="Amount" />
              <RowRemove onClick={() => f.setLines((a) => (a.length > 1 ? a.filter((_, j) => j !== i) : [{ item: '', amount: '' }]))} />
            </div>
          ))}
          <div className="spk-total">
            <Button size="sm" icon={Plus} onClick={() => f.setLines((a) => [...a, { item: '', amount: '' }])}>
              Add a line
            </Button>
            <span>
              Total <strong>{aed(f.total)}</strong> <span className="faint">excl. VAT</span>
            </span>
          </div>
        </div>
      );
    case 'terms':
      return (
        <div className="spk-form">
          {f.terms.map((t, i) => (
            <div key={i} className="spk-rowfields spk-rowfields--one">
              <Input value={t} onChange={(e) => f.setTerms((a) => a.map((x, j) => (j === i ? e.target.value : x)))} placeholder="A term" aria-label="Term" />
              <RowRemove onClick={() => f.setTerms((a) => (a.length > 1 ? a.filter((_, j) => j !== i) : ['']))} />
            </div>
          ))}
          <div>
            <Button size="sm" icon={Plus} onClick={() => f.setTerms((a) => [...a, ''])}>
              Add a term
            </Button>
          </div>
        </div>
      );
    case 'file':
      return f.file ? (
        <div className="spk-file">
          <Paperclip size={15} />
          <span>{f.file}</span>
          <button className="link-btn" onClick={() => f.setFile(null)}>
            Remove
          </button>
        </div>
      ) : (
        <button className="spk-drop" onClick={() => f.setFile('Proposal v1 — Response plan.pdf')}>
          <UploadCloud size={20} />
          <span>Drop the proposal PDF here, or click to choose a file</span>
        </button>
      );
  }
}

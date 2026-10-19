// Screen 4 · New proposal: what Spark fills in and sends. The fields are the ones the client's proposal page
// shows (objectives, scope, phases, investment, terms), so a sent proposal opens there as it is.
// On the right, what the client will see. For Brand Co. the proposal is really sent (shared store).
import { useMemo, useState } from 'react';
import { ArrowLeft, Paperclip, Plus, Trash2, UploadCloud } from 'lucide-react';
import { Button, EmptyState, Field, Input, PageHeader, Textarea } from '../../components/ui/primitives';
import { Dialog } from '../../components/ui/overlay';
import { StateRing } from '../../components/ui/StateTile';
import { useToast } from '../../components/ui/toast';
import { useStore } from '../../state/store';
import { addDays, aed, fmtDate, nowIso } from '../../lib/format';
import { navigate } from '../../lib/router';
import { clientOf } from './data';
import { useSparkRequests } from './model';

const today = () => nowIso().slice(0, 10);

const RowRemove = ({ onClick }: { onClick: () => void }) => (
  <button className="btn btn--ghost btn--sm btn--icon" aria-label="Remove" onClick={onClick}>
    <Trash2 size={15} />
  </button>
);

export function NewProposal({ id }: { id: string }) {
  const { list, isLive } = useSparkRequests();
  const { actions } = useStore();
  const toast = useToast();
  const r = list.find((x) => x.id === id);
  const version = (r?.proposal?.version ?? 0) + 1;
  const [title, setTitle] = useState(r ? r.title : '');
  const [summary, setSummary] = useState(r ? `A proposal for “${r.title}”: the scope, the timeline and the price.` : '');
  const [objectives, setObjectives] = useState(['Deliver one clear idea, adapted to every location.']);
  const [scope, setScope] = useState([{ title: 'Concept and design', detail: 'One idea, adapted per store.' }]);
  const [phases, setPhases] = useState([
    { name: 'Concept', weeks: '2' },
    { name: 'Design and production', weeks: '4' },
  ]);
  const [start, setStart] = useState(addDays(today(), 7));
  const [until, setUntil] = useState(addDays(today(), 5));
  const [lines, setLines] = useState([
    { item: 'Concept and design', amount: '30000' },
    { item: 'Production management', amount: '24000' },
  ]);
  const [terms, setTerms] = useState(['50% is invoiced on approval and 50% on delivery.', 'Prices exclude VAT.', 'Two rounds of revisions are included.']);
  const [file, setFile] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const num = (v: string) => Number(v.replace(/[^\d]/g, '')) || 0;
  const total = useMemo(() => lines.reduce((s, l) => s + num(l.amount), 0), [lines]);
  const weeks = useMemo(() => phases.reduce((s, p) => s + num(p.weeks), 0), [phases]);
  if (!r) return <EmptyState title="Request not found" action={<Button onClick={() => navigate('/spark')}>Back to inbox</Button>} />;
  const client = clientOf(r.clientId);
  const first = r.requester.name.split(' ')[0];
  const live = isLive(r.id);
  const sendable = title.trim() && lines.some((l) => num(l.amount) > 0) && weeks > 0;

  const send = () => {
    setConfirm(false);
    if (live) {
      actions.sendProposal(r.id, {
        title: title.trim(),
        summary: summary.trim(),
        objectives: objectives.map((o) => o.trim()).filter(Boolean),
        scope: scope.filter((s) => s.title.trim()).map((s) => ({ title: s.title.trim(), detail: s.detail.trim() })),
        phases: phases.filter((p) => p.name.trim()).map((p) => ({ name: p.name.trim(), weeks: num(p.weeks) })),
        startDate: start,
        validUntil: until,
        investment: lines.filter((l) => l.item.trim()).map((l) => ({ item: l.item.trim(), amount: num(l.amount) })),
        terms: terms.map((t) => t.trim()).filter(Boolean),
      });
      toast({ title: 'Proposal sent', body: `${first} sees it now: the request shows “Needs your decision” in the client portal.`, tone: 'success' });
    } else toast({ title: 'Proposal sent', body: `${first} can review it now. (Sample client: nothing changes in the portal.)`, tone: 'success' });
    navigate(`/spark/requests/${r.id}`);
  };

  return (
    <div className="spk-prop-page">
      <a className="back" href={`#/spark/requests/${r.id}`} onClick={(e) => (e.preventDefault(), navigate(`/spark/requests/${r.id}`))}>
        <ArrowLeft size={14} /> {r.id} · {r.title}
      </a>
      <PageHeader
        title={`New proposal${version > 1 ? ` · version ${version}` : ''}`}
        sub={`For ${client.name.replace(/\.$/, '')}: ${first} reviews it, comments on any section and approves, asks for changes or declines.`}
        actions={
          <>
            <Button onClick={() => toast({ title: 'Draft saved', body: 'Only the Spark team sees drafts.' })}>Save draft</Button>
            <Button variant="primary" disabled={!sendable} onClick={() => setConfirm(true)}>
              Send to client
            </Button>
          </>
        }
      />
      <div className="spk-prop-grid">
        <div className="spk-form">
          <section className="block">
            <h3 className="block__title">Overview</h3>
            <Field label="Title" htmlFor="np-title">
              <Input id="np-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Summary" htmlFor="np-sum" hint="Two sentences the client reads first.">
              <Textarea id="np-sum" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
            </Field>
          </section>

          <section className="block">
            <h3 className="block__title">Objectives</h3>
            {objectives.map((o, i) => (
              <div key={i} className="spk-rowfields spk-rowfields--one">
                <Input value={o} onChange={(e) => setObjectives((a) => a.map((x, j) => (j === i ? e.target.value : x)))} placeholder="What we agreed to achieve" aria-label="Objective" />
                <RowRemove onClick={() => setObjectives((a) => a.filter((_, j) => j !== i))} />
              </div>
            ))}
            <Button size="sm" icon={Plus} onClick={() => setObjectives((a) => [...a, ''])}>
              Add an objective
            </Button>
          </section>

          <section className="block">
            <h3 className="block__title">Scope and deliverables</h3>
            {scope.map((s, i) => (
              <div key={i} className="spk-rowfields">
                <Input value={s.title} onChange={(e) => setScope((a) => a.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} placeholder="Deliverable" aria-label="Deliverable" />
                <Input value={s.detail} onChange={(e) => setScope((a) => a.map((x, j) => (j === i ? { ...x, detail: e.target.value } : x)))} placeholder="What the client gets" aria-label="Description" />
                <RowRemove onClick={() => setScope((a) => a.filter((_, j) => j !== i))} />
              </div>
            ))}
            <Button size="sm" icon={Plus} onClick={() => setScope((a) => [...a, { title: '', detail: '' }])}>
              Add a deliverable
            </Button>
          </section>

          <section className="block">
            <h3 className="block__title">Timeline and decision</h3>
            {phases.map((p, i) => (
              <div key={i} className="spk-rowfields spk-rowfields--price">
                <Input value={p.name} onChange={(e) => setPhases((a) => a.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Phase" aria-label="Phase" />
                <Input value={p.weeks} onChange={(e) => setPhases((a) => a.map((x, j) => (j === i ? { ...x, weeks: e.target.value } : x)))} placeholder="Weeks" aria-label="Weeks" />
                <RowRemove onClick={() => setPhases((a) => a.filter((_, j) => j !== i))} />
              </div>
            ))}
            <Button size="sm" icon={Plus} onClick={() => setPhases((a) => [...a, { name: '', weeks: '' }])}>
              Add a phase
            </Button>
            <div className="spk-three spk-three--two">
              <Field label="Work starts" htmlFor="np-s">
                <Input id="np-s" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              </Field>
              <Field label="Decision needed by" htmlFor="np-u" hint="Shown as a countdown to the client.">
                <Input id="np-u" type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="block">
            <h3 className="block__title">Investment</h3>
            {lines.map((l, i) => (
              <div key={i} className="spk-rowfields spk-rowfields--price">
                <Input value={l.item} onChange={(e) => setLines((a) => a.map((x, j) => (j === i ? { ...x, item: e.target.value } : x)))} placeholder="Line item" aria-label="Line item" />
                <Input value={l.amount} onChange={(e) => setLines((a) => a.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))} placeholder="AED" aria-label="Amount" />
                <RowRemove onClick={() => setLines((a) => a.filter((_, j) => j !== i))} />
              </div>
            ))}
            <div className="spk-total">
              <Button size="sm" icon={Plus} onClick={() => setLines((a) => [...a, { item: '', amount: '' }])}>
                Add a line
              </Button>
              <span>
                Total <strong>{aed(total)}</strong> <span className="faint">excl. VAT</span>
              </span>
            </div>
          </section>

          <section className="block">
            <h3 className="block__title">Terms</h3>
            {terms.map((t, i) => (
              <div key={i} className="spk-rowfields spk-rowfields--one">
                <Input value={t} onChange={(e) => setTerms((a) => a.map((x, j) => (j === i ? e.target.value : x)))} placeholder="A term" aria-label="Term" />
                <RowRemove onClick={() => setTerms((a) => a.filter((_, j) => j !== i))} />
              </div>
            ))}
            <Button size="sm" icon={Plus} onClick={() => setTerms((a) => [...a, ''])}>
              Add a term
            </Button>
          </section>

          <section className="block">
            <h3 className="block__title">Proposal file</h3>
            {file ? (
              <div className="spk-file">
                <Paperclip size={15} />
                <span>{file}</span>
                <button className="link-btn" onClick={() => setFile(null)}>
                  Remove
                </button>
              </div>
            ) : (
              <button className="spk-drop" onClick={() => setFile(`Proposal v${version} — ${r.title}.pdf`)}>
                <UploadCloud size={20} />
                <span>Drop the proposal PDF here, or click to choose a file</span>
              </button>
            )}
          </section>
        </div>

        <aside className="spk-preview" aria-label="What the client sees">
          <div className="spk-preview__label">What {first} will see</div>
          <div className="proposal__side spk-preview__card">
            <section className="decision decision--timed">
              <div className="decision__eyebrow">
                <span>Due {fmtDate(until, { weekday: true })}</span>
              </div>
              <div className="decision__timed">
                <div>
                  <div className="decision__total">{aed(total)}</div>
                  <div className="decision__meta">
                    {weeks} weeks · starts {fmtDate(start)}
                  </div>
                </div>
                <StateRing used={0.1} glyph="hourglass" tone="cobalt" ink />
              </div>
              <div className="decision__btns">
                <Button variant="primary" size="lg" disabled>
                  Approve proposal
                </Button>
                <div className="decision__row">
                  <Button disabled>Request changes</Button>
                  <Button disabled>Decline</Button>
                </div>
              </div>
            </section>
          </div>
          <p className="faint spk-preview__note">
            {first} gets a notification, “Proposal ready: {title || 'untitled'}”, and opens the proposal page with the objectives, scope, timeline, investment and terms from this form. Version {version} {version > 1 ? 'replaces the earlier one.' : 'is the first.'}
          </p>
        </aside>
      </div>

      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        size="sm"
        title={`Send to ${client.name}?`}
        description={`${first} and the other owners at ${client.name} are notified in the portal and by email.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={send}>
              Send proposal
            </Button>
          </>
        }
      >
        <p className="muted">
          Version {version} · {aed(total)} · {weeks} weeks · decision needed by {fmtDate(until, { weekday: true })}
        </p>
      </Dialog>
    </div>
  );
}

// Screen 4 · New proposal: what Spark fills in and sends. On the right, what the client will see.
import { useMemo, useState } from 'react';
import { ArrowLeft, Paperclip, Plus, Trash2, UploadCloud } from 'lucide-react';
import { Button, EmptyState, Field, Input, PageHeader, Textarea } from '../../components/ui/primitives';
import { Dialog } from '../../components/ui/overlay';
import { StateRing } from '../../components/ui/StateTile';
import { useToast } from '../../components/ui/toast';
import { aed } from '../../lib/format';
import { navigate } from '../../lib/router';
import { clientOf, requests } from './data';

interface Line {
  item: string;
  amount: string;
}

export function NewProposal({ id }: { id: string }) {
  const r = requests.find((x) => x.id === id);
  const toast = useToast();
  const version = (r?.proposal?.version ?? 0) + 1;
  const [title, setTitle] = useState(r ? r.title : '');
  const [summary, setSummary] = useState(r ? `A proposal for ${r.title.toLowerCase()}, with the scope, the timeline and the price.` : '');
  const [weeks, setWeeks] = useState('6');
  const [start, setStart] = useState('Mon 26 Oct');
  const [until, setUntil] = useState('Fri 30 Oct');
  const [scope, setScope] = useState([{ t: 'Concept and design', d: 'One idea, adapted per store.' }]);
  const [lines, setLines] = useState<Line[]>([
    { item: 'Concept and design', amount: '30000' },
    { item: 'Production management', amount: '24000' },
  ]);
  const [file, setFile] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const total = useMemo(() => lines.reduce((s, l) => s + (Number(l.amount.replace(/[^\d]/g, '')) || 0), 0), [lines]);
  if (!r) return <EmptyState title="Request not found" action={<Button onClick={() => navigate('/spark')}>Back to inbox</Button>} />;
  const client = clientOf(r.clientId);
  const first = r.requester.name.split(' ')[0];

  return (
    <div className="spk-prop-page">
      <a className="back" href={`#/spark/requests/${r.id}`} onClick={(e) => (e.preventDefault(), navigate(`/spark/requests/${r.id}`))}>
        <ArrowLeft size={14} /> {r.id} · {r.title}
      </a>
      <PageHeader
        title={`New proposal${version > 1 ? ` · version ${version}` : ''}`}
        sub={`For ${client.name}. ${first} reviews it, comments on any section and approves, asks for changes or declines.`}
        actions={
          <>
            <Button onClick={() => toast({ title: 'Draft saved', body: 'Only the Spark team sees drafts.' })}>Save draft</Button>
            <Button variant="primary" onClick={() => setConfirm(true)}>
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
            <h3 className="block__title">Scope and deliverables</h3>
            {scope.map((s, i) => (
              <div key={i} className="spk-rowfields">
                <Input value={s.t} onChange={(e) => setScope((a) => a.map((x, j) => (j === i ? { ...x, t: e.target.value } : x)))} placeholder="Deliverable" aria-label="Deliverable" />
                <Input value={s.d} onChange={(e) => setScope((a) => a.map((x, j) => (j === i ? { ...x, d: e.target.value } : x)))} placeholder="What the client gets" aria-label="Description" />
                <button className="btn btn--ghost btn--sm btn--icon" aria-label="Remove" onClick={() => setScope((a) => a.filter((_, j) => j !== i))}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <Button size="sm" icon={Plus} onClick={() => setScope((a) => [...a, { t: '', d: '' }])}>
              Add a deliverable
            </Button>
          </section>

          <section className="block">
            <h3 className="block__title">Timeline and decision</h3>
            <div className="spk-three">
              <Field label="Duration (weeks)" htmlFor="np-w">
                <Input id="np-w" value={weeks} onChange={(e) => setWeeks(e.target.value)} />
              </Field>
              <Field label="Starts" htmlFor="np-s">
                <Input id="np-s" value={start} onChange={(e) => setStart(e.target.value)} />
              </Field>
              <Field label="Decision needed by" htmlFor="np-u" hint="Shown as a countdown to the client.">
                <Input id="np-u" value={until} onChange={(e) => setUntil(e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="block">
            <h3 className="block__title">Investment</h3>
            {lines.map((l, i) => (
              <div key={i} className="spk-rowfields spk-rowfields--price">
                <Input value={l.item} onChange={(e) => setLines((a) => a.map((x, j) => (j === i ? { ...x, item: e.target.value } : x)))} placeholder="Line item" aria-label="Line item" />
                <Input value={l.amount} onChange={(e) => setLines((a) => a.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))} placeholder="AED" aria-label="Amount" />
                <button className="btn btn--ghost btn--sm btn--icon" aria-label="Remove" onClick={() => setLines((a) => a.filter((_, j) => j !== i))}>
                  <Trash2 size={15} />
                </button>
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
                <span>Due {until}</span>
              </div>
              <div className="decision__timed">
                <div>
                  <div className="decision__total">{aed(total)}</div>
                  <div className="decision__meta">
                    {weeks} weeks · starts {start}
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
            {first} gets a notification, “Proposal ready: {title || 'untitled'}”, and opens this page. Version {version} {version > 1 ? 'replaces the earlier one.' : 'is the first.'}
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
            <Button
              variant="primary"
              onClick={() => {
                setConfirm(false);
                toast({ title: 'Proposal sent', body: `${first} can review it now. The status is “Awaiting client decision”.`, tone: 'success' });
                navigate(`/spark/requests/${r.id}`);
              }}
            >
              Send proposal
            </Button>
          </>
        }
      >
        <p className="muted">
          Version {version} · {aed(total)} · {weeks} weeks · decision needed by {until}
        </p>
      </Dialog>
    </div>
  );
}

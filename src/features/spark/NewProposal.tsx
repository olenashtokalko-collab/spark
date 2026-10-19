// Screen 4 · New proposal: the section editor (a list of sections on the left, the open section on the right,
// what is empty highlighted), after the contract-review reference. The fields are the ones the client's proposal page shows, so a
// sent proposal opens there as it is. For Brand Co. the proposal is really sent (shared store).
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Badge, Button, EmptyState } from '../../components/ui/primitives';
import { Dialog } from '../../components/ui/overlay';
import { useToast } from '../../components/ui/toast';
import { useStore } from '../../state/store';
import { aed, fmtDate } from '../../lib/format';
import { navigate } from '../../lib/router';
import { clientOf } from './data';
import { useSparkRequests } from './model';
import { SectionsEditor } from './ProposalEditor';
import { SECTIONS, useProposalForm } from './ProposalSections';

const num = (v: string) => Number(v.replace(/[^\d]/g, '')) || 0;

export function NewProposal({ id }: { id: string }) {
  const { list, isLive } = useSparkRequests();
  const { actions } = useStore();
  const toast = useToast();
  const r = list.find((x) => x.id === id);
  const f = useProposalForm({ title: r?.title ?? '', summary: r ? `A proposal for “${r.title}”: the scope, the timeline and the price.` : '' });
  const [confirm, setConfirm] = useState(false);
  if (!r) return <EmptyState title="Request not found" action={<Button onClick={() => navigate('/spark')}>Back to inbox</Button>} />;
  const client = clientOf(r.clientId);
  const first = r.requester.name.split(' ')[0];
  const version = (r.proposal?.version ?? 0) + 1;
  const live = isLive(r.id);

  const send = () => {
    setConfirm(false);
    if (live) {
      actions.sendProposal(r.id, {
        title: f.title.trim(),
        summary: f.summary.trim(),
        objectives: f.objectives.map((o) => o.trim()).filter(Boolean),
        scope: f.scope.filter((s) => s.title.trim()).map((s) => ({ title: s.title.trim(), detail: s.detail.trim() })),
        phases: f.phases.filter((p) => p.name.trim()).map((p) => ({ name: p.name.trim(), weeks: num(p.weeks) })),
        startDate: f.start,
        validUntil: f.until,
        investment: f.lines.filter((l) => l.item.trim()).map((l) => ({ item: l.item.trim(), amount: num(l.amount) })),
        terms: f.terms.map((t) => t.trim()).filter(Boolean),
      });
      toast({ title: 'Proposal sent', body: `${first} sees it now: the request shows “Needs your decision” in the client portal.`, tone: 'success' });
    } else toast({ title: 'Proposal sent', body: `${first} can review it now. (Sample client: nothing changes in the portal.)`, tone: 'success' });
    navigate(`/spark/requests/${r.id}`);
  };

  return (
    <div className="req-detail">
      <a className="back" href={`#/spark/requests/${r.id}`} onClick={(e) => (e.preventDefault(), navigate(`/spark/requests/${r.id}`))}>
        <ArrowLeft size={15} /> Back
      </a>
      <header className="req-head spk-prophead">
        <div>
          <div className="req-head__top">
            <span className="mono faint">{r.id}</span>
            <Badge>Draft</Badge>
            <span className="spk__client">{client.name}</span>
          </div>
          <h1 className="req-head__title">New proposal{version > 1 ? ` · version ${version}` : ''}</h1>
        </div>
        <div className="spk-prophead__actions">
          <Button onClick={() => toast({ title: 'Draft saved', body: 'Only the Spark team sees drafts.' })}>Save draft</Button>
          <Button variant="primary" disabled={f.ready < SECTIONS.length} onClick={() => setConfirm(true)}>
            Send to client
          </Button>
        </div>
      </header>
      <SectionsEditor f={f} onSaved={(label) => toast({ title: 'Saved', body: `${label} is saved in the draft.` })} />
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
          Version {version} · {aed(f.total)} · {f.weeks} weeks · decision needed by {fmtDate(f.until, { weekday: true })}
        </p>
      </Dialog>
    </div>
  );
}

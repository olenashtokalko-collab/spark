import { useMemo, useState } from 'react';
import { Inbox, Plus, Search, Sparkles } from 'lucide-react';
import { latestProposal, personById, proposalTotal, useStore } from '../../state/store';
import { useUI } from '../../state/ui';
import { Avatar, Button, EmptyState, Input, PageHeader, Tabs } from '../../components/ui/primitives';
import { RequestStatus, isOpen } from '../../components/domain';
import { aed, fmtRelative } from '../../lib/format';
import { navigate } from '../../lib/router';
import type { WorkRequest } from '../../data/types';

type Filter = 'all' | 'decision' | 'active' | 'closed';

export function Requests() {
  const { state } = useStore();
  const { openRequest } = useUI();
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');

  const needsDecision = (r: WorkRequest) => r.status === 'proposal';
  const groups: Record<Filter, (r: WorkRequest) => boolean> = {
    all: () => true,
    decision: needsDecision,
    active: (r) => isOpen(r.status) && !needsDecision(r),
    closed: (r) => !isOpen(r.status),
  };

  const list = useMemo(
    () =>
      state.requests
        .filter(groups[filter])
        .filter((r) => (q ? `${r.id} ${r.title} ${r.type}`.toLowerCase().includes(q.toLowerCase()) : true))
        .sort((a, b) => Number(needsDecision(b)) - Number(needsDecision(a)) || b.updatedAt.localeCompare(a.updatedAt)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.requests, filter, q],
  );

  return (
    <div>
      <PageHeader
        title="Requests"
        sub="Ask Spark for new work and follow it to delivery. Each request shows its current status, and when Spark sends a proposal, you review and approve it here."
        actions={
          <>
            <Button icon={Sparkles} onClick={() => navigate('/assistant')}>
              Start in assistant
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => openRequest()}>
              New request
            </Button>
          </>
        }
      />
      <div className="toolbar">
        <Tabs
          value={filter}
          onChange={setFilter}
          items={[
            { value: 'all', label: 'All', count: state.requests.length },
            { value: 'decision', label: 'Needs your decision', count: state.requests.filter(groups.decision).length },
            { value: 'active', label: 'In progress', count: state.requests.filter(groups.active).length },
            { value: 'closed', label: 'Closed', count: state.requests.filter(groups.closed).length },
          ]}
        />
        <Input icon={Search} placeholder="Search requests" value={q} onChange={(e) => setQ(e.target.value)} className="toolbar__search" aria-label="Search requests" />
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={q ? `No requests match “${q}”` : filter === 'decision' ? 'Nothing needs a decision' : 'No requests here yet'}
          body={q ? 'Try another word, or clear the search.' : 'Ask the assistant about your brand and turn a useful answer into a request.'}
          action={q ? <Button onClick={() => setQ('')}>Clear search</Button> : <Button onClick={() => openRequest()}>New request</Button>}
        />
      ) : (
        <div className="req-table" role="table" aria-label="Requests">
          <div className="req-row req-row--head" role="row">
            <span role="columnheader">Request</span>
            <span role="columnheader">Status</span>
            <span role="columnheader" className="hide-sm">
              Proposal
            </span>
            <span role="columnheader" className="hide-md">
              Spark owner
            </span>
            <span role="columnheader" className="hide-sm">
              Updated
            </span>
          </div>
          {list.map((r) => {
            const p = latestProposal(state, r.id);
            const owner = personById(state, r.ownerId);
            return (
              <a key={r.id} role="row" className={'req-row' + (needsDecision(r) ? ' is-hot' : '')} href={`#/requests/${r.id}`}>
                <span role="cell" className="req-row__main">
                  <span className="mono faint">{r.id}</span>
                  <span className="req-row__title">{r.title}</span>
                  <span className="req-row__type">{r.type}</span>
                </span>
                <span role="cell">
                  <RequestStatus status={r.status} />
                </span>
                <span role="cell" className="hide-sm mono muted">
                  {p ? `v${p.version} · ${aed(proposalTotal(p))}` : '—'}
                </span>
                <span role="cell" className="hide-md req-row__owner">
                  <Avatar person={owner} size={22} />
                  {owner.name}
                </span>
                <span role="cell" className="hide-sm faint">
                  {fmtRelative(r.updatedAt)}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

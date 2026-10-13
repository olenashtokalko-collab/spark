import { useMemo, useState } from 'react';
import { Calendar, Plus, Search, Tag, X } from 'lucide-react';
import { FluidOrb } from '../../components/ui/FluidOrb';
import { latestProposal, proposalTotal, useStore } from '../../state/store';
import { useUI } from '../../state/ui';
import { Button, EmptyState, Input, PageHeader, Tabs } from '../../components/ui/primitives';
import { FilterMenu } from '../../components/ui/overlay';
import { RequestStatus, isOpen } from '../../components/domain';
import { aed, fmtRelative } from '../../lib/format';
import { navigate } from '../../lib/router';
import type { RequestType, WorkRequest } from '../../data/types';
import { TYPES } from './CreateRequestDialog';

type Filter = 'all' | 'decision' | 'active' | 'closed';
type Updated = 'any' | 'week' | 'month';
const UPDATED_DAYS: Record<Exclude<Updated, 'any'>, number> = { week: 7, month: 30 };

export function Requests() {
  const { state } = useStore();
  const { openRequest } = useUI();
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [type, setType] = useState<RequestType | 'any'>('any');
  const [updated, setUpdated] = useState<Updated>('any');
  const narrowed = !!q || type !== 'any' || updated !== 'any';
  const clearFilters = () => {
    setQ('');
    setType('any');
    setUpdated('any');
  };

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
        .filter((r) => type === 'any' || r.type === type)
        .filter((r) => updated === 'any' || Date.now() - new Date(r.updatedAt).getTime() <= UPDATED_DAYS[updated] * 86400000)
        .sort((a, b) => Number(needsDecision(b)) - Number(needsDecision(a)) || b.updatedAt.localeCompare(a.updatedAt)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.requests, filter, q, type, updated],
  );

  return (
    <div>
      <PageHeader
        title="Requests"
        sub="Ask Spark for new work and follow it to delivery. Each request shows its current status, and when Spark sends a proposal, you review and approve it here."
        actions={
          <>
            <Button variant="ai" lead={<FluidOrb size={20} />} onClick={() => navigate('/assistant')}>
              Start a chat
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => openRequest()}>
              New request
            </Button>
          </>
        }
      />
      <div className="toolbar">
        <Tabs
          className="tabs--underline"
          value={filter}
          onChange={setFilter}
          items={[
            { value: 'all', label: 'All', count: state.requests.length },
            { value: 'decision', label: 'Needs your decision', count: state.requests.filter(groups.decision).length },
            { value: 'active', label: 'In progress', count: state.requests.filter(groups.active).length },
            { value: 'closed', label: 'Closed', count: state.requests.filter(groups.closed).length },
          ]}
        />
      </div>
      <div className="filter-bar">
        <Input icon={Search} placeholder="Search requests" value={q} onChange={(e) => setQ(e.target.value)} className="filter-bar__search" aria-label="Search requests" />
        <FilterMenu icon={Tag} label="Type" value={type} onChange={setType} options={[{ value: 'any', label: 'Any type' }, ...TYPES.map((t) => ({ value: t, label: t }))]} />
        <FilterMenu
          icon={Calendar}
          label="Updated"
          value={updated}
          onChange={setUpdated}
          options={[
            { value: 'any', label: 'Any time' },
            { value: 'week', label: 'Past 7 days' },
            { value: 'month', label: 'Past 30 days' },
          ]}
        />
        {narrowed && (
          <button
            className="link-btn filter-bar__clear"
            onClick={clearFilters}
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={narrowed ? 'No requests match these filters.' : filter === 'decision' ? 'Nothing needs your decision.' : 'No requests yet.'}
          body={narrowed ? 'Try another word or clear the filters.' : 'Start a chat about your brand and turn a useful answer into a request.'}
          action={
            !narrowed && (
              <Button size="sm" onClick={() => openRequest()}>
                New request
              </Button>
            )
          }
        />
      ) : (
        <div className="req-table" role="table" aria-label="Requests">
          <div className="req-row req-row--head" role="row">
            <span role="columnheader">Request</span>
            <span role="columnheader">Status</span>
            <span role="columnheader" className="hide-sm">
              Proposal
            </span>
            <span role="columnheader" className="hide-sm">
              Updated
            </span>
          </div>
          {list.map((r) => {
            const p = latestProposal(state, r.id);
            return (
              <a key={r.id} role="row" className="req-row" href={`#/requests/${r.id}`}>
                <span role="cell" className="req-row__main">
                  <span className="mono faint">{r.id}</span>
                  <span className="req-row__title">{r.title}</span>
                  <span className="req-row__type">{r.type}</span>
                </span>
                <span role="cell">
                  <RequestStatus status={r.status} />
                </span>
                <span role="cell" className="hide-sm mono muted">
                  {p ? aed(proposalTotal(p)) : '—'}
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

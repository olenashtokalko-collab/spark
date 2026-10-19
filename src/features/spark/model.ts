// The Spark team's view of requests: Brand Co.'s come live from the shared store (so what Spark does shows
// on the client side, and the other way round); the other clients are sample data.
import { useMemo } from 'react';
import { latestProposal, personById, proposalTotal, useStore, type State } from '../../state/store';
import { fmtDate, fmtRelative } from '../../lib/format';
import type { WorkRequest } from '../../data/types';
import { sampleRequests, type SparkRequest, type Waiting } from './data';

export const BRAND_CLIENT = 'brandco';

function waitingOf(r: WorkRequest): { waiting: Waiting; waitingFor?: string } {
  if (r.status === 'proposal') return { waiting: 'client', waitingFor: 'Decision on the proposal' };
  if (r.nextStep?.onClient) return { waiting: 'client', waitingFor: r.nextStep.label };
  if (r.status === 'submitted') return { waiting: 'spark', waitingFor: 'First reply' };
  if (r.status === 'in_review') return { waiting: 'spark', waitingFor: 'A reply or a proposal' };
  if (r.status === 'changes_requested') return { waiting: 'spark', waitingFor: 'A revised proposal' };
  return { waiting: null };
}

const real = (state: State, id: string) => state.people.find((p) => p.id === id) ?? personById(state, id);

export function toSparkRequest(state: State, r: WorkRequest): SparkRequest {
  const p = latestProposal(state, r.id);
  const w = waitingOf(r);
  return {
    id: r.id,
    title: r.title,
    type: r.type,
    clientId: BRAND_CLIENT,
    requester: real(state, r.createdBy),
    status: r.status,
    ...w,
    owner: real(state, r.ownerId),
    due: r.nextStep?.date ? fmtDate(r.nextStep.date, { weekday: true }) : undefined,
    dueIso: r.nextStep?.date,
    updated: fmtRelative(r.updatedAt),
    budget: r.budget,
    timing: r.timing,
    created: fmtDate(r.createdAt),
    description: r.description,
    proposal: p ? { version: p.version, total: proposalTotal(p), sent: fmtDate(p.sentAt), state: p.status === 'awaiting' ? 'Awaiting decision' : p.status === 'approved' ? 'Approved' : p.status === 'declined' ? 'Declined' : p.status === 'changes_requested' ? 'Changes requested' : 'Superseded' } : undefined,
  };
}

/** Every request the Spark team sees: Brand Co.'s live ones and the other clients' samples. */
export function useSparkRequests() {
  const { state } = useStore();
  return useMemo(() => {
    const live = state.requests.map((r) => toSparkRequest(state, r));
    return { list: [...live, ...sampleRequests], isLive: (id: string) => state.requests.some((r) => r.id === id) };
  }, [state]);
}

// Sample requests (other clients) aren't in the shared store, so their proposal page is built from
// the sample row: the version sent, the client's answer and comments, and the people involved.
// Sending from it changes nothing in the portal; it's a prototype of the same page as Brand Co.'s.
import type { Person, Proposal } from '../../data/types';
import { addDays } from '../../lib/format';
import { clientOf, type SparkRequest } from './data';

/** "16 Oct" (how sample rows write dates) as an ISO date in 2026. */
const isoOf = (d: string | undefined) => {
  if (!d) return undefined;
  const t = new Date(`${d} 2026 12:00`);
  return isNaN(t.getTime()) ? undefined : t.toISOString().slice(0, 10);
};
const num = (v: string) => Number(v.replace(/[^\d]/g, '')) || 0;

const STATUS: Record<string, Proposal['status']> = {
  'Awaiting decision': 'awaiting',
  'Changes requested': 'changes_requested',
  Approved: 'approved',
  Declined: 'declined',
};

export interface SampleProposal {
  title: string;
  clientName: string;
  client: Person;
  people: Person[];
  proposals: Proposal[];
}

export function sampleProposalOf(base: SparkRequest): SampleProposal {
  const pr = base.proposal;
  const fb = pr?.feedback;
  const people = [base.requester, ...(fb ? [fb.by, ...fb.comments.map((c) => c.by)] : [])];
  if (!pr) return { title: base.title, clientName: clientOf(base.clientId).name, client: base.requester, people, proposals: [] };
  const sentAt = isoOf(pr.sent) ?? '2026-10-01';
  const f = pr.fields;
  // A row without the proposal's sections gets the essentials: the request as the summary, one price line.
  const proposal: Proposal = {
    id: `S-${base.id}-${pr.version}`,
    requestId: base.id,
    version: pr.version,
    title: f?.title ?? base.title,
    sentBy: base.owner.id,
    sentAt,
    validUntil: f?.until || addDays(sentAt, 30),
    summary: f?.summary ?? base.description,
    objectives: f?.objectives?.filter(Boolean) ?? [],
    scope: f?.scope?.map((s) => ({ title: s.title, detail: s.detail, deliverables: [] })) ?? [],
    phases: f?.phases?.map((p) => ({ name: p.name, weeks: num(p.weeks) })) ?? [],
    startDate: f?.start || addDays(sentAt, 14),
    investment: f?.lines?.map((l) => ({ item: l.item, amount: num(l.amount) })) ?? [{ item: base.title, amount: pr.total }],
    terms: f?.terms ?? [],
    status: STATUS[pr.state] ?? 'awaiting',
    decision: fb ? { by: fb.by.id, at: isoOf(fb.at) ?? sentAt, note: fb.note } : undefined,
    comments: fb ? fb.comments.map((c, i) => ({ id: `${base.id}-c${i}`, by: c.by.id, at: isoOf(fb.at) ?? sentAt, text: c.text, section: c.section })) : [],
  };
  return { title: base.title, clientName: clientOf(base.clientId).name, client: base.requester, people, proposals: [proposal] };
}

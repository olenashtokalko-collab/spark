// Mock data for the Spark team view (prototype only, not connected to the client-side store).
// It shows requests from several clients; Brand Co. is the client of the main prototype.
import type { ProposalFields } from './ProposalSections';
import type { Person } from '../../data/types';
import { people as seedPeople } from '../../data/mock';
import type { ConvItem } from '../requests/Conversation';
import { sparkStatusLabel } from '../../components/domain';

export type Waiting = 'spark' | 'client' | null;
export type SparkStatus = 'submitted' | 'in_review' | 'proposal' | 'changes_requested' | 'approved' | 'in_progress' | 'delivered' | 'declined';

export const STATUS_LABEL: Record<SparkStatus, string> = sparkStatusLabel;

const byId = (id: string) => seedPeople.find((p) => p.id === id)!;
export const dana = byId('s-dana');
export const youssef = byId('s-youssef');
export const mira = byId('s-mira');
export const sparkTeam: Person[] = [dana, youssef, mira];

const client = (id: string, name: string, title: string, hue: number): Person => ({ id, name, email: '', title, org: 'client', hue });
export const layla = byId('u-layla');
export const omar = byId('u-omar');
export const rania = byId('u-rania');

export interface Client {
  id: string;
  name: string;
  industry: string;
  lead: Person;
  people: Person[];
  lastActive: string;
}

export const clients: Client[] = [
  { id: 'brandco', name: 'Brand Co.', industry: 'Retail · UAE and KSA', lead: dana, people: [layla, omar, rania], lastActive: 'Today' },
  {
    id: 'noor',
    name: 'Noor Hospitality Group',
    industry: 'Hospitality · Abu Dhabi',
    lead: youssef,
    people: [client('n1', 'Hessa Al Mansoori', 'Marketing Director', 200), client('n2', 'Tariq Nasser', 'Brand Manager', 100), client('n3', 'Mariam Yousef', 'Events Lead', 330)],
    lastActive: 'Yesterday',
  },
  { id: 'gulf', name: 'Gulf Logistics Co.', industry: 'Logistics · Dubai', lead: mira, people: [client('g1', 'Faisal Qureshi', 'Head of Comms', 30), client('g2', 'Aisha Rahman', 'Marketing Lead', 260)], lastActive: '2 days ago' },
  {
    id: 'fajr',
    name: 'Al Fajr Retail',
    industry: 'Retail · Sharjah',
    lead: dana,
    people: [client('f1', 'Omar Khalid', 'CEO', 80), client('f2', 'Salma Idris', 'Brand Lead', 300), client('f3', 'Yara Hadid', 'Social Manager', 150), client('f4', 'Nabil Saad', 'Finance', 20)],
    lastActive: '12 Oct',
  },
];

export interface SparkRequest {
  id: string;
  title: string;
  type: string;
  clientId: string;
  requester: Person;
  status: SparkStatus;
  waiting: Waiting;
  waitingFor?: string; // what is being waited for
  owner: Person;
  due?: string;
  dueIso?: string; // the same date, for the stage card
  updated: string;
  budget?: string;
  timing: string;
  created: string;
  description: string;
  proposal?: { version: number; total: number; sent: string; state: string; feedback?: ProposalFeedback; fields?: Partial<ProposalFields> };
}

/** What the client said when it asked for changes: the note with the decision and the comments on sections. */
export interface ProposalFeedback {
  by: Person;
  at: string;
  note?: string;
  comments: { by: Person; text: string; section?: string }[];
}

/** Sample requests from other clients. Brand Co.'s requests are live: they come from the shared store. */
const hessa = client('n1', 'Hessa Al Mansoori', 'Marketing Director', 200);

export const sampleRequests: SparkRequest[] = [
  {
    id: 'REQ-212', title: 'Ramadan menu launch film', type: 'Content', clientId: 'noor', requester: hessa, status: 'in_review', waiting: 'spark', waitingFor: 'Reply to the client’s question', owner: youssef, due: 'Tue 20 Oct', dueIso: '2026-10-20', updated: '3 h ago', budget: 'AED 80–120k', timing: 'ASAP', created: '14 Oct',
    description: 'A 60-second film introducing the Ramadan menu across three venues, with a cut-down for social.',
  },
  {
    id: 'REQ-207', title: 'Quarterly brand tracker', type: 'Research', clientId: 'fajr', requester: client('f2', 'Salma Idris', 'Brand Lead', 300), status: 'in_review', waiting: 'spark', waitingFor: 'Proposal to send', owner: dana, due: 'Thu 22 Oct', dueIso: '2026-10-22', updated: 'Yesterday', budget: 'AED 30–45k', timing: 'This quarter', created: '12 Oct',
    description: 'A repeatable survey tracking awareness and preference across the four emirates, with a dashboard for the leadership team.',
  },
  {
    id: 'REQ-210', title: 'Driver recruitment video', type: 'Content', clientId: 'gulf', requester: client('g1', 'Faisal Qureshi', 'Head of Comms', 30), status: 'proposal', waiting: 'client', waitingFor: 'Decision on the proposal', owner: mira, due: 'Fri 23 Oct', dueIso: '2026-10-23', updated: '2 days ago', budget: 'AED 40–60k', timing: 'This quarter', created: '8 Oct',
    description: 'Two short videos to recruit drivers on social, in Arabic and English.',
    proposal: { version: 1, total: 52000, sent: '16 Oct', state: 'Awaiting decision' },
  },
  {
    id: 'REQ-203', title: 'Summer loyalty campaign', type: 'Campaign', clientId: 'noor', requester: hessa, status: 'changes_requested', waiting: 'spark', waitingFor: 'A revised proposal', owner: youssef, due: 'Wed 21 Oct', dueIso: '2026-10-21', updated: '5 h ago', budget: 'AED 60–80k', timing: 'This quarter', created: '2 Oct',
    description: 'A summer campaign for the loyalty app: double points in July and August, with social and in-venue material.',
    proposal: {
      version: 1, total: 78000, sent: '13 Oct', state: 'Changes requested',
      // What v1 said, so the new version opens with it.
      fields: {
        title: 'Summer loyalty campaign',
        summary: 'Double points in July and August, launched on social and in the three venues.',
        objectives: ['Grow active loyalty members by 15% over the summer', 'Lift weekday visits in July and August'],
        scope: [
          { title: 'Campaign concept', detail: 'The double-points idea, the key message and the visual direction.' },
          { title: 'Social content', detail: '12 posts and 4 reels for Instagram and TikTok.' },
          { title: 'In-venue material', detail: 'Posters, table cards and menu inserts for three venues.' },
        ],
        phases: [
          { name: 'Concept', weeks: '2' },
          { name: 'Production', weeks: '3' },
          { name: 'Live campaign', weeks: '8' },
        ],
        start: '2027-07-01',
        lines: [
          { item: 'Campaign concept', amount: '22,000' },
          { item: 'Social content', amount: '38,000' },
          { item: 'In-venue print material', amount: '18,000' },
        ],
        terms: ['50% is invoiced on approval and 50% on delivery.', 'Prices exclude VAT.'],
        file: 'Summer loyalty campaign · v1.pdf',
      },
      feedback: {
        by: hessa, at: '18 Oct',
        note: 'The budget is above what we planned for the summer. Can we drop the in-venue material and start a week later, after Eid?',
        comments: [
          { by: hessa, section: 'Investment', text: 'In-venue print is AED 18,000 on its own. We can print in-house.' },
          { by: hessa, section: 'Timeline', text: 'Starting on 1 July clashes with Eid. 8 July works better.' },
        ],
      },
    },
  },
  {
    id: 'REQ-205', title: 'New website content audit', type: 'Strategy', clientId: 'fajr', requester: client('f1', 'Omar Khalid', 'CEO', 80), status: 'in_progress', waiting: null, owner: dana, updated: '10 Oct', budget: 'AED 24,000', timing: 'Flexible', created: '21 Sep',
    description: 'An audit of the current site content and a plan for the new site.',
    proposal: { version: 1, total: 24000, sent: '24 Sep', state: 'Approved' },
  },
];

export const clientOf = (id: string) => clients.find((c) => c.id === id)!;


/** The conversation on a sample request (other clients). Brand Co.'s conversations are live, from the store. */
export function sampleThread(r: SparkRequest): ConvItem[] {
  if (r.id === 'REQ-212')
    return [
      { id: 'm1', kind: 'message', by: r.requester, at: '14 Oct, 11:20', text: r.description },
      { id: 'm2', kind: 'system', at: '15 Oct, 09:00', text: 'Youssef Malik started reviewing.' },
      { id: 'm3', kind: 'message', by: r.requester, at: 'Today, 08:50', text: 'One more thing: can the film also work as a 15-second cut for stories? We would need it in vertical too.', question: true },
    ];
  return [
    { id: 'm1', kind: 'message', by: r.requester, at: r.created, text: r.description },
    ...(r.status === 'submitted' ? [] : [{ id: 'm2', kind: 'system' as const, at: r.updated, text: `${r.owner.name} is handling this request.` }]),
  ];
}

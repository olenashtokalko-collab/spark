// Mock data for the Spark team view (prototype only, not connected to the client-side store).
// It shows requests from several clients; Brand Co. is the client of the main prototype.
import type { Person } from '../../data/types';
import { people as seedPeople } from '../../data/mock';

export type Waiting = 'spark' | 'client' | null;
export type SparkStatus = 'submitted' | 'in_review' | 'proposal' | 'approved' | 'in_progress' | 'delivered' | 'declined';

export const STATUS_LABEL: Record<SparkStatus, string> = {
  submitted: 'New',
  in_review: 'In review',
  proposal: 'Awaiting client decision',
  approved: 'Approved',
  in_progress: 'In progress',
  delivered: 'Delivered',
  declined: 'Declined',
};

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
  updated: string;
  budget?: string;
  timing: string;
  created: string;
  description: string;
  proposal?: { version: number; total: number; sent: string; state: string };
}

export const requests: SparkRequest[] = [
  {
    id: 'REQ-100', title: 'UAE National Day window displays', type: 'Creative', clientId: 'brandco', requester: layla, status: 'proposal', waiting: 'client', waitingFor: 'Decision on the proposal', owner: dana, due: 'Sun 18 Oct', updated: '9 days ago', budget: 'Up to AED 60,000', timing: 'This quarter', created: '1 Oct',
    description: 'Window displays for the five UAE stores for National Day on 2 December: one idea, adapted per store, with a matching social post.',
    proposal: { version: 1, total: 54000, sent: '10 Oct', state: 'Awaiting decision' },
  },
  {
    id: 'REQ-108', title: 'Spring campaign brief', type: 'Strategy', clientId: 'brandco', requester: layla, status: 'submitted', waiting: 'spark', waitingFor: 'First reply', owner: dana, due: 'Wed 21 Oct', updated: '2 min ago', timing: 'Within 2 weeks', created: 'Today',
    description: 'A short brief for the spring campaign. Key findings from the assistant: the audience is already defined, the brand voice is set, and spring needs Q1 2027 budget.',
  },
  {
    id: 'REQ-212', title: 'Ramadan menu launch film', type: 'Content', clientId: 'noor', requester: client('n1', 'Hessa Al Mansoori', 'Marketing Director', 200), status: 'in_review', waiting: 'spark', waitingFor: 'Reply to the client’s question', owner: youssef, due: 'Tue 20 Oct', updated: '3 h ago', budget: 'AED 80–120k', timing: 'ASAP', created: '14 Oct',
    description: 'A 60-second film introducing the Ramadan menu across three venues, with a cut-down for social.',
  },
  {
    id: 'REQ-207', title: 'Quarterly brand tracker', type: 'Research', clientId: 'fajr', requester: client('f2', 'Salma Idris', 'Brand Lead', 300), status: 'in_review', waiting: 'spark', waitingFor: 'Proposal to send', owner: dana, due: 'Thu 22 Oct', updated: 'Yesterday', budget: 'AED 30–45k', timing: 'This quarter', created: '12 Oct',
    description: 'A repeatable survey tracking awareness and preference across the four emirates, with a dashboard for the leadership team.',
  },
  {
    id: 'REQ-104', title: 'Riyadh launch campaign', type: 'Strategy', clientId: 'brandco', requester: layla, status: 'proposal', waiting: 'client', waitingFor: 'Decision on the proposal', owner: dana, due: 'Today', updated: '6 Oct', budget: 'Up to AED 190,000', timing: 'Within 2 weeks', created: '29 Sep',
    description: 'Positioning, audience and the opening-week campaign for the new Riyadh flagship in January 2027.',
    proposal: { version: 2, total: 186000, sent: '6 Oct', state: 'Awaiting decision' },
  },
  {
    id: 'REQ-210', title: 'Driver recruitment video', type: 'Content', clientId: 'gulf', requester: client('g1', 'Faisal Qureshi', 'Head of Comms', 30), status: 'proposal', waiting: 'client', waitingFor: 'Decision on the proposal', owner: mira, due: 'Fri 23 Oct', updated: '2 days ago', budget: 'AED 40–60k', timing: 'This quarter', created: '8 Oct',
    description: 'Two short videos to recruit drivers on social, in Arabic and English.',
    proposal: { version: 1, total: 52000, sent: '16 Oct', state: 'Awaiting decision' },
  },
  {
    id: 'REQ-105', title: 'Response plan for delivery fee complaints', type: 'Social', clientId: 'brandco', requester: omar, status: 'in_review', waiting: 'client', waitingFor: 'Answer to Spark’s question', owner: mira, updated: '8 Oct', timing: 'ASAP', created: '6 Oct',
    description: 'Complaints about the delivery fee tripled in week 40. A response plan with replies and a policy line.',
  },
  {
    id: 'REQ-103', title: 'Ramadan 2027 packaging', type: 'Creative', clientId: 'brandco', requester: layla, status: 'in_progress', waiting: 'client', waitingFor: 'Feedback on round 1', owner: youssef, updated: '7 Oct', budget: 'AED 96,000', timing: 'This quarter', created: '4 Sep',
    description: 'A Ramadan edition customers want to keep and gift: tote, gift box and sleeve.',
    proposal: { version: 1, total: 96000, sent: '4 Sep', state: 'Approved' },
  },
  {
    id: 'REQ-205', title: 'New website content audit', type: 'Strategy', clientId: 'fajr', requester: client('f1', 'Omar Khalid', 'CEO', 80), status: 'in_progress', waiting: null, owner: dana, updated: '10 Oct', budget: 'AED 24,000', timing: 'Flexible', created: '21 Sep',
    description: 'An audit of the current site content and a plan for the new site.',
    proposal: { version: 1, total: 24000, sent: '24 Sep', state: 'Approved' },
  },
  {
    id: 'REQ-102', title: 'Brand guidelines refresh', type: 'Creative', clientId: 'brandco', requester: layla, status: 'delivered', waiting: null, owner: youssef, updated: '28 Aug', budget: 'AED 34,000', timing: 'This quarter', created: '10 Jun',
    description: 'Refresh of the brand guidelines for the new colour system.',
    proposal: { version: 1, total: 34000, sent: '15 Jun', state: 'Approved' },
  },
];

export const clientOf = (id: string) => clients.find((c) => c.id === id)!;

export interface Msg {
  id: string;
  kind: 'client' | 'spark' | 'internal' | 'system';
  by?: Person;
  at: string;
  text: string;
  question?: boolean;
}

/** The conversation for a request. REQ-100 and REQ-212 have a real one; the rest start with the request itself. */
export function threadFor(r: SparkRequest): Msg[] {
  if (r.id === 'REQ-100')
    return [
      { id: 'm1', kind: 'client', by: layla, at: '1 Oct, 10:00', text: 'Hi Dana, we need window displays for the five UAE stores for National Day on 2 December. One idea, adapted per store, and a matching social post.' },
      { id: 'm2', kind: 'system', at: '2 Oct, 09:30', text: 'Dana Kareem moved the request to In review.' },
      { id: 'm3', kind: 'spark', by: dana, at: '2 Oct, 09:41', text: 'Thanks Layla. Two quick questions before we scope it: are the five stores the same size, and is the Mall of the Emirates window the largest?', question: true },
      { id: 'm4', kind: 'client', by: layla, at: '2 Oct, 14:10', text: 'Four are similar. The Mall of the Emirates window is about twice as wide.' },
      { id: 'm5', kind: 'internal', by: dana, at: '3 Oct, 11:00', text: 'Budget range up to AED 60k. Layla will want a clear price per store, so show it as a line item.' },
      { id: 'm6', kind: 'system', at: '10 Oct, 12:00', text: 'Dana Kareem sent proposal v1 · AED 54,000 · 6 weeks.' },
    ];
  if (r.id === 'REQ-212')
    return [
      { id: 'm1', kind: 'client', by: r.requester, at: '14 Oct, 11:20', text: r.description },
      { id: 'm2', kind: 'system', at: '15 Oct, 09:00', text: 'Youssef Malik moved the request to In review.' },
      { id: 'm3', kind: 'client', by: r.requester, at: 'Today, 08:50', text: 'One more thing: can the film also work as a 15-second cut for stories? We would need it in vertical too.', question: true },
    ];
  return [
    { id: 'm1', kind: 'client', by: r.requester, at: `${r.created}`, text: r.description },
    ...(r.status === 'submitted' ? [] : [{ id: 'm2', kind: 'system' as const, at: r.updated, text: `${r.owner.name} is handling this request.` }]),
  ];
}

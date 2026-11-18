// Mock data for every Home variant.
//
// ROUND 2 (12 Nov) — the designer's answers about what the client actually said:
//  1. Users are marketing leaders of large companies and UAE government entities. Clients often don't
//     know what they want; a bare chat is too little. The client: "we are not ChatGPT" — Home is NOT chat-first.
//  2. Core loop: the client talks with Dr.AI → sends part of that conversation to Spark (= a Request)
//     → Spark comes back with a proposal. Purpose: save time — no forms, fewer calls.
//  3. The client never talked about money. No credits, balance or prices anywhere.
//  4. A request: client sends → Spark proposes → discussion, files, photos, approvals. Stages never named.
//  5. Reports are made by someone on the Spark team.
//  6. Access by invitation, then a code by email.
// Everything marked SAMPLE is illustrative copy, not a fact from the client.

export type ServiceKey = 's' | 'p' | 'a' | 'r' | 'k'

export const user = {
  name: 'Layla Haddad',
  firstName: 'Layla',
  initials: 'LH',
  role: 'Marketing Director', // SAMPLE: the audience is marketing leaders of large companies / government
}

// SAMPLE client: a large UAE organisation (name stays an obvious placeholder on purpose).
export const company = {
  name: 'Qindeel',
  initial: 'Q',
  description: 'A UAE group in energy, mobility and real estate. 6,000 people across the GCC.',
  profileLine: 'Abu Dhabi group since 2009: energy, mobility and real estate, 6,000 people, a government partner.',
  chips: ['Energy · Mobility · Real estate', 'Abu Dhabi, since 2009', '6,000 people', 'Government partner', 'Arabic and English'],
  team: [
    { initials: 'OS', name: 'Colleague' },
    { initials: 'RA', name: 'Colleague' },
  ],
  teamLine: 'Qindeel team · you and 2 colleagues',
}

/** SAMPLE. The client never discussed money, so A, C and D show no balance or prices.
 *  The designer asked for it in two places (12 Nov): the balance panel in E, and the sidebar budget with a top-up in A2.
 *  `amount` = what is left, `max` = what was put in so far. */
export const balance = {
  amount: 64.2,
  whole: '64',
  cents: '20',
  max: 100,
  currency: 'USD',
  label: 'credits · USD',
}

export type ReadyReport = {
  id: string
  status: 'ready'
  kind: string        // mono label
  title: string
  value: string       // shown in Doto
  unit: string
  benchmark: string
  note: string
  delta: string
  trend: 'up' | 'down'
  // 6 monthly points for a chart, last = current. PLACEHOLDER shape: only the last value and the change
  // since September (index 3) come from the report copy.
  series: number[]
  typical: number
}

export type LockedReport = {
  id: string
  status: 'available'
  kind: string
  title: string
  body: string
  eta: string        // from the old prototype (an assumption, not confirmed)
  /** @deprecated Round 2: no prices anywhere. Ordering a report = sending a request to Spark. */
  price: string
}

/** Month labels for `series` (PLACEHOLDER: the reports say "since September", so the six points run June to November). */
export const seriesMonths = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']

/** Round 2: ordering a report sends a request to the Spark team (no price). */
export const reportAction = 'Request this report'

export const readyReports: ReadyReport[] = [
  {
    id: 'website',
    status: 'ready',
    kind: 'Website report',
    title: 'Website score',
    value: '41',
    unit: '/100',
    benchmark: 'typical 58',
    note: 'Mobile speed on 4G, below the 58 typical',
    delta: '+6 since September',
    trend: 'up',
    series: [33, 35, 34, 35, 38, 41],
    typical: 58,
  },
  {
    id: 'instagram',
    status: 'ready',
    kind: 'Social media report',
    title: 'Instagram engagement',
    value: '3.4',
    unit: '%',
    benchmark: 'typical 1.9%',
    note: 'Still above the 1.9% typical for UAE brands',
    delta: '−0.4 pt since September',
    trend: 'down',
    series: [3.9, 3.9, 3.8, 3.8, 3.6, 3.4], // September = 3.8, so today is −0.4 pt
    typical: 1.9,
  },
]

export const lockedReports: LockedReport[] = [
  {
    id: 'competitors',
    status: 'available',
    kind: 'Competitors',
    title: 'Who’s taking your buyers.',
    body: 'Three organisations you name, side by side: reach, share of voice, what people praise.', // SAMPLE
    eta: 'Ready in about 3 days',
    price: '',
  },
  {
    id: 'reviews',
    status: 'available',
    kind: 'Reputation',
    title: 'What 2,100 mentions say.',
    body: 'News, LinkedIn and Google reviews read for you: the praise, the complaints, the words people use.', // SAMPLE (enterprise audience)
    eta: 'Ready in about 3 days',
    price: '',
  },
  {
    id: 'search',
    status: 'available',
    kind: 'Search',
    title: 'How people find you.',
    body: 'What people search for, in Arabic and English, and where you show up.',
    eta: 'Ready in about 3 days',
    price: '',
  },
]

export const consultation = {
  label: 'Consultation',
  title: 'Your plan, in 45 minutes.',
  altTitle: 'Talk it through. Leave with a plan.',
  body: 'On video with the strategist who wrote your reports: what to fix first, and what it’s worth.',
  minutes: 45,
  cta: 'Book a consultation',
}

export const drai = {
  name: 'Dr.AI',
  label: 'Dr.AI knows your brand',
  title: 'Bring your question to light.',
  altTitle: 'Your question. Every angle.',
  body: 'He knows your reports and your brand. Ask what a figure means, what to fix first or how a post should sound, any time.',
  // Example prompts, derived from the three things the prototype says Dr.AI can do.
  prompts: [
    'What does 41/100 mean for us?',
    'What should we fix first?',
    'How should our next post sound?',
  ],
}

/* ───────────── Round 2: the core loop ─────────────
   Talk with Dr.AI → send the part that matters to Spark (a Request) → Spark comes back with a proposal.
   Known request life (designer): sent → Spark proposes → discussion, files, photos, approval.
   Stage names below are the SMALLEST honest set; the client never named stages. */

export const loop = {
  title: 'Talk it through. Send it to Spark. Get a proposal.',
  steps: [
    { n: '01', label: 'Talk', line: 'Think it through with Dr.AI.' },
    { n: '02', label: 'Send', line: 'Send the part that matters to Spark.' },
    { n: '03', label: 'Proposal', line: 'Spark comes back with a proposal.' },
  ],
  sendLabel: 'Send to Spark',
  sendHint: 'Spark reads this conversation and comes back with a proposal. No forms.',
  sentLine: 'Sent to Spark. A proposal is on its way.',
}

export type RequestState = 'sent' | 'proposal' | 'discussion'
export const requestStates: Record<RequestState, { label: string; line: string }> = {
  sent: { label: 'Sent', line: 'Spark is preparing a proposal' },
  proposal: { label: 'Proposal ready', line: 'Spark replied with a proposal' },
  discussion: { label: 'In discussion', line: 'Messages, files and approvals' },
}

export type SparkRequest = {
  id: string
  title: string
  service: ServiceKey
  state: RequestState
  from: string        // where it started
  when: string
  unread?: number
}

// SAMPLE requests (illustrative only).
export const requests: SparkRequest[] = [
  { id: 'r1', title: 'Arabic and English launch for the new mobility app', service: 'r', state: 'proposal', from: 'From a Dr.AI chat', when: 'Today', unread: 2 },
  { id: 'r2', title: 'Keynote for the CEO at a tech summit', service: 'k', state: 'discussion', from: 'From a Dr.AI chat', when: 'Yesterday', unread: 1 },
  { id: 'r3', title: 'Fix the website’s mobile speed', service: 'a', state: 'sent', from: 'From the Website report', when: 'Mon' },
]

// The five services from sparkstudios.ae ("Five capabilities. One spark.")
export const services: { key: ServiceKey; letter: string; label: string; title: string; line: string; color: string; items: string[] }[] = [
  { key: 's', letter: 'S', label: 'Strategy', title: 'Strategy & positioning', line: 'We find the one truth that makes complex technology clear, and build the story around it.', color: '#1E3BD6', items: ['Positioning & messaging', 'Brand strategy', 'Narrative architecture', 'Go-to-market', 'GCC market entry'] },
  { key: 'p', letter: 'P', label: 'PR & comms', title: 'PR & tech comms', line: 'Reputation, influence and stories people repeat, in Arabic and English.', color: '#6A4BEE', items: ['PR & media relations', 'Thought leadership', 'Executive communications', 'Social media & content', 'Storytelling & film'] },
  { key: 'a', letter: 'A', label: 'AI', title: 'AI solutions', line: 'AI built into how organisations communicate, with people making every call.', color: '#C83CBE', items: ['AI-amplified content & campaigns', 'Audience & media intelligence', 'Arabic & English at scale', 'AI tools for comms teams'] },
  { key: 'r', letter: 'R', label: 'Reach', title: 'Reach & campaigns', line: 'The right story in front of the right people, measured all the way through.', color: '#F2457D', items: ['Integrated campaigns', 'Digital & social media', 'Community & partnerships', 'Analytics & reporting'] },
  { key: 'k', letter: 'K', label: 'Key moments', title: 'Events & exhibitions', line: 'Experiences that turn a moment into a lasting connection.', color: '#E8501F', items: ['Exhibition stands & pavilions', 'Launches & summits', 'Keynotes & leadership moments', 'Immersive brand experiences'] },
]

// The method from the brand book / site: "Three steps. Every time."
export const method = [
  { n: '01', title: 'Find the spark.', line: 'Strategy, analysis and audience insight.' },
  { n: '02', title: 'Power it up.', line: 'People set the direction. AI gives it reach.' },
  { n: '03', title: 'Bring it to light.', line: 'Launch, PR, campaign, film, keynote, event.' },
]

export const nav = [
  { id: 'home', label: 'Home' },
  { id: 'requests', label: 'Requests', dot: true },
  { id: 'documents', label: 'Documents', dot: true },
]

export const notifications = 4

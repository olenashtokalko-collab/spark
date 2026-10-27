// Seed data for the prototype. Brand Co. is a neutral placeholder client;
// people, numbers and social posts are invented. "Today" is 9 Oct 2026.
import type {
  Brand,
  CompanyAnalysis,
  Conversation,
  Doc,
  Folder,
  Invitation,
  Notification,
  Person,
  Proposal,
  ResearchReport,
  WorkRequest,
} from './types';

export const TODAY = '2026-10-09T09:12:00';

export const people: Person[] = [
  { id: 'u-layla', name: 'Layla Haddad', email: 'layla.haddad@brandco.example', title: 'Head of Brand', org: 'client', role: 'owner', hue: 18, lastActive: TODAY },
  { id: 'u-omar', name: 'Omar Saeed', email: 'omar.saeed@brandco.example', title: 'Marketing Manager', org: 'client', role: 'member', hue: 160, lastActive: '2026-10-08T17:40:00' },
  { id: 'u-rania', name: 'Rania Aziz', email: 'rania.aziz@brandco.example', title: 'Finance Director', org: 'client', role: 'viewer', hue: 280, lastActive: '2026-10-02T11:05:00' },
  { id: 's-dana', name: 'Dana Kareem', email: 'dana@sparkstudios.example', title: 'Account Lead', org: 'spark', hue: 220, lastActive: TODAY, focus: 'Your main contact. Scopes requests and sends proposals.' },
  { id: 's-youssef', name: 'Youssef Malik', email: 'youssef@sparkstudios.example', title: 'Brand Strategist', org: 'spark', hue: 45, lastActive: '2026-10-08T15:20:00', focus: 'Positioning, audience and KSA market entry.' },
  { id: 's-mira', name: 'Mira Chen', email: 'mira@sparkstudios.example', title: 'Social & Insights', org: 'spark', hue: 330, lastActive: '2026-10-07T10:00:00', focus: 'Weekly monitoring digest and research reports.' },
];

export const invitations: Invitation[] = [
  { id: 'inv-1', email: 'karim.nasser@brandco.example', role: 'member', invitedBy: 'u-layla', invitedAt: '2026-10-06T10:30:00', message: 'Joining for the Riyadh launch.' },
];

export const brand: Brand = {
  id: 'b-brandco',
  name: 'Brand Co.',
  legalName: 'Brand Co. L.L.C.',
  tagline: 'Design-led everyday products',
  website: 'brandco.example',
  category: 'Consumer brand · retail & online',
  founded: '2017, Dubai',
  hq: 'Al Quoz, Dubai',
  footprint: '14 stores in the UAE · online store · 60 partner retailers',
  // Shown under the company's name on Home: what the company is, then where it sells, a line each.
  positioning: 'Brand Co. makes everyday products with a Gulf point of view.',
  reach: 'Sold in 14 stores across the UAE and online.',
  audiences: [
    { name: 'Young professionals', detail: '25–38, buys for quality, discovers new products on Instagram and TikTok.' },
    { name: 'Weekend shoppers', detail: 'Families and friend groups visiting flagship stores at the weekend.' },
    { name: 'Retail partners', detail: 'Department stores and concept shops stocking a curated range.' },
  ],
  voice: ['Warm, never loud', 'Proud of origin, light on jargon', 'Bilingual by default'],
  competitors: ['Competitor A', 'Competitor B', 'Competitor C', 'Global chains'],
  keyDates: [
    { date: '2026-11-14', label: 'Ramadan packaging to print' },
    { date: '2027-01-15', label: 'Riyadh flagship opens (Al Olaya)' },
    { date: '2027-02-18', label: 'Ramadan 2027 begins (approx.)' },
  ],
  updatedAt: '2026-09-22T12:00:00',
  updatedBy: 's-youssef',
};

// ---- Documents ------------------------------------------------------------

// What Spark already looked at for the company, shown on Home. There's no PR analysis yet, so it isn't shown.
export const analyses: CompanyAnalysis[] = [
  {
    id: 'an-website',
    kind: 'website',
    origin: 'spark',
    basis: '23 pages, speed tested on 4G and broadband, Arabic and English versions',
    reviewedBy: 's-youssef',
    title: 'Website analysis',
    summary: 'brandco.example looks calm and on brand, but it is slow on mobile and the Arabic version is incomplete.',
    score: { label: 'Mobile speed', value: '41/100' },
    findings: [
      { title: 'Calm and on brand', good: true, body: 'The look matches the stores: quiet layouts, real product photos, prices up front. Visitors who reach a product page stay 2 min 40 s.' },
      { title: 'Slow on mobile', issue: true, body: 'Product pages take 6.8 s to load on 4G, mostly because of uncompressed hero images. Most visits come from phones.' },
      { title: 'Arabic is half done', body: 'Only the home page and three category pages are in Arabic. Checkout, delivery and returns are English only.' },
      { title: 'Hard to find a store', body: 'The store locator sits in the footer. Weekend shoppers search for opening hours first.' },
    ],
    updatedAt: '2026-10-02T10:00:00',
  },
  {
    id: 'an-social',
    kind: 'social',
    origin: 'requested',
    basis: '412 posts and 3,860 comments on Instagram and TikTok, 1 Sep – 4 Oct',
    reviewedBy: 's-mira',
    title: 'Social media analysis',
    summary: 'Instagram does the work: strong saves on product stories. TikTok is posted to, but not made for.',
    score: { label: 'Engagement, Instagram', value: '3.4%' },
    findings: [
      { title: 'Instagram works', good: true, body: '38K followers, engagement of 3.4%, above the 1.9% typical for retail in the UAE. Behind-the-design stories are saved most.' },
      { title: 'TikTok is reposted Reels', issue: true, body: 'Videos are cut for Instagram and reposted. Views stay under 2K; the native creator-led posts of competitors reach 20–60K.' },
      { title: 'Replies are slow', body: 'Comments asking about stock wait 26 hours for an answer on average.' },
    ],
    docId: 'd-digest-w40',
    updatedAt: '2026-10-06T10:00:00',
  },
  {
    id: 'an-brand',
    kind: 'brand',
    origin: 'spark',
    basis: '1,200 reviews and posts, 14 store visits, a panel of 300 shoppers in the UAE and KSA',
    reviewedBy: 's-youssef',
    title: 'Brand analysis',
    summary: 'People see Brand Co. as well-made and local. The “Gulf point of view” is clear in stores, less so online.',
    findings: [
      { title: 'What people say', good: true, body: 'In 1,200 reviews and posts, the words used most are “quality”, “gift” and “calm store”. Price is mentioned, rarely as a complaint.' },
      { title: 'Where it gets lost', issue: true, body: 'Online, product photos on white look like any global chain. The regional story lives only in store design.' },
      { title: 'Ahead of Riyadh', body: 'In KSA the brand is little known: 4% unprompted recall in our panel. The flagship launch needs to introduce it, not remind.' },
    ],
    docId: 'd-audit',
    updatedAt: '2026-09-22T12:00:00',
  },
];

export const folders: Folder[] = [
  { id: 'f-guidelines', name: 'Brand guidelines', parentId: null, description: 'Logo, colour and voice' },
  { id: 'f-strategy', name: 'Strategy', parentId: null, description: 'Positioning and audience' },
  { id: 'f-proposals', name: 'Proposals', parentId: null, description: 'Every proposal from Spark' },
  { id: 'f-creative', name: 'Creative', parentId: null, description: 'Concepts and photography' },
  { id: 'f-ramadan', name: 'Ramadan 2027 packaging', parentId: 'f-creative' },
  { id: 'f-research', name: 'Research reports', parentId: null, description: 'Audits and social digests' },
  { id: 'f-uploads', name: 'From your team', parentId: null, description: 'Shared with Spark' },
];

const pages = (...p: [string, ...string[]][]) => ({
  type: 'pages' as const,
  pages: p.map(([heading, ...body]) => ({ heading, body })),
});

export const docs: Doc[] = [
  {
    id: 'd-guidelines', name: 'Brand Guidelines v3.2.pdf', kind: 'pdf', folderId: 'f-guidelines', sizeKb: 18400, uploadedBy: 's-youssef', uploadedAt: '2026-08-28T16:00:00', version: 3, requestId: 'REQ-102',
    summary: 'The refreshed identity: logo usage, colour, type, photography and tone of voice.',
    preview: pages(
      ['Brand Guidelines', 'Version 3.2 · August 2026', 'Prepared by Spark Studios for Brand Co.'],
      ['Our idea', 'Familiar, then unexpected: every product and every store visit should feel considered.', 'We lead with craft, and we speak Arabic and English with equal care.'],
      ['Tone of voice', 'Warm, never loud. Proud of origin, light on jargon. Bilingual by default.', 'We avoid superlatives ("the best in Dubai") and let details do the work.'],
      ['Colour', 'Sand #E9DCC6 · Ink #1E2430 · Olive #5E6B3A · Night #101418', 'Night is used for evening and Ramadan communication only.'],
    ),
  },
  {
    id: 'd-logo', name: 'Logo pack.zip', kind: 'archive', folderId: 'f-guidelines', sizeKb: 42100, uploadedBy: 's-youssef', uploadedAt: '2026-08-28T16:05:00',
    preview: { type: 'files', files: [
      { name: 'brandco-logo-primary.svg', size: '24 KB' }, { name: 'brandco-logo-arabic.svg', size: '31 KB' },
      { name: 'brandco-monogram.svg', size: '9 KB' }, { name: 'brandco-logo-primary@4x.png', size: '1.2 MB' },
      { name: 'README.txt', size: '2 KB' },
    ] },
  },
  {
    id: 'd-ksa', name: 'KSA market entry strategy.pdf', kind: 'pdf', folderId: 'f-strategy', sizeKb: 6200, uploadedBy: 's-youssef', uploadedAt: '2026-09-02T10:00:00',
    summary: 'Where Brand Co. wins in Riyadh, who it is for and how to open.',
    preview: pages(
      ['KSA market entry strategy', 'Spark Studios · September 2026'],
      ['Opportunity', 'Riyadh premium retail spend grew an estimated 19% year on year. Premium stores cluster in Al Olaya, Hittin and King Abdullah Financial District.', 'Saudi shoppers value local relevance; Brand Co. should lead with craft, not with Dubai.'],
      ['Who we open for', 'Riyadh young professionals (24–35), heavy Instagram and TikTok users, who discover brands through creators and queue for openings.', 'Secondary: families on weekend evenings, after 8 pm.'],
      ['Risks', 'Name confusion with local businesses using "Brand Co.". Price sensitivity on extras such as delivery fees. Opening-week queues.'],
    ),
  },
  {
    id: 'd-personas', name: 'Audience personas — GCC.pdf', kind: 'pdf', folderId: 'f-strategy', sizeKb: 3100, uploadedBy: 's-youssef', uploadedAt: '2026-09-12T14:00:00',
    summary: 'Four GCC personas with motivations, channels and what they pay for.',
    preview: pages(
      ['Audience personas — GCC', 'Four personas, built from 22 interviews in Dubai and Riyadh.'],
      ['Noura, 29 · Riyadh', 'Product manager in KAFD. Shops in malls 2× a week, mostly after 7 pm. Cares about service and a signature product worth posting.', 'Will pay more for a "first in Riyadh" experience; dislikes surcharges she sees as unfair (delivery fee, extra shot).'],
      ['Faisal, 34 · Riyadh', 'Founder, short on time. Wants fast service and easy online ordering. Loyal once a store knows him.'],
      ['Aisha, 31 · Dubai', 'Existing Brand Co. customer. Follows the brand, shares new launches, expects regional touches.'],
    ),
  },
  {
    id: 'd-competitive', name: 'Competitive landscape Q3.pdf', kind: 'pdf', folderId: 'f-strategy', sizeKb: 2400, uploadedBy: 's-mira', uploadedAt: '2026-09-25T09:00:00',
    summary: 'How Competitors A, B and C position, price and communicate.',
    preview: pages(
      ['Competitive landscape · Q3 2026'],
      ['Summary', 'Competitor B leads on volume and price. Competitor A owns "heritage" in the UAE. Nobody owns regional design with design-led stores; that is Brand Co.\'s space.'],
      ['Pricing', 'Average basket: Brand Co. AED 240 · A AED 250 · C AED 220 · B AED 190. Delivery fee: Brand Co. AED 15, others AED 0–10.'],
    ),
  },
  {
    id: 'd-prop-104', name: 'Proposal — Riyadh launch campaign.pdf', kind: 'pdf', folderId: 'f-proposals', sizeKb: 1800, uploadedBy: 's-dana', uploadedAt: '2026-10-06T15:30:00', version: 2, requestId: 'REQ-104',
    summary: 'Films in a second wave around Ramadan, AED 186,000 over 10 weeks.',
    preview: pages(['Riyadh launch campaign', 'Proposal · 6 Oct 2026', 'Open the interactive proposal in Requests to comment and decide.']),
  },
  {
    id: 'd-prop-103', name: 'Proposal — Ramadan 2027 packaging.pdf', kind: 'pdf', folderId: 'f-proposals', sizeKb: 1200, uploadedBy: 's-dana', uploadedAt: '2026-09-04T11:00:00', version: 1, requestId: 'REQ-103',
    preview: pages(['Ramadan 2027 packaging', 'Approved 10 Sep 2026 by Layla Haddad']),
  },
  {
    id: 'd-pack-r1', name: 'Packaging concepts — round 1.pdf', kind: 'deck', folderId: 'f-ramadan', sizeKb: 24800, uploadedBy: 's-youssef', uploadedAt: '2026-10-07T18:00:00', requestId: 'REQ-103',
    summary: 'Three routes for the Ramadan 2027 bag and gift box: Night Market, Desert Bloom, Lantern.',
    preview: { type: 'art', palette: ['#101418', '#C9A15B', '#E9DCC6'], motif: 'pack' },
    review: { requestedBy: 's-youssef', due: '2026-10-15', note: 'Please pick a favourite route (or two) and tell us what to push further.', status: 'open', feedback: [] },
  },
  {
    id: 'd-mood-night', name: 'Moodboard — Night Market.png', kind: 'image', folderId: 'f-ramadan', sizeKb: 5300, uploadedBy: 's-youssef', uploadedAt: '2026-10-07T18:02:00', requestId: 'REQ-103',
    preview: { type: 'art', palette: ['#0E1220', '#E0A43A', '#7A2E2E'], motif: 'night' },
  },
  {
    id: 'd-mood-bloom', name: 'Moodboard — Desert Bloom.png', kind: 'image', folderId: 'f-ramadan', sizeKb: 4900, uploadedBy: 's-youssef', uploadedAt: '2026-10-07T18:03:00', requestId: 'REQ-103',
    preview: { type: 'art', palette: ['#E9DCC6', '#D6845E', '#5E6B3A'], motif: 'bloom' },
  },
  {
    id: 'd-photo-difc', name: 'Store photography — DIFC.jpg', kind: 'image', folderId: 'f-creative', sizeKb: 8700, uploadedBy: 's-youssef', uploadedAt: '2026-07-14T10:00:00',
    preview: { type: 'art', palette: ['#2B211B', '#B98D63', '#EFE6D8'], motif: 'store' },
  },
  {
    id: 'd-audit', name: 'Brand audit — Sep 2026.pdf', kind: 'pdf', folderId: 'f-research', sizeKb: 3900, uploadedBy: 's-mira', uploadedAt: '2026-09-18T09:00:00',
    summary: 'Awareness, perception and consistency across 14 stores and 6 channels.',
    preview: pages(
      ['Brand audit · September 2026', 'Spark Studios · Social & Insights'],
      ['Headline', 'Brand Co. is known for quality and design, less for value. Regional design details are the most-mentioned reason to buy.'],
      ['Consistency', '11 of 14 stores match the v3 identity. Al Barsha, JLT and Mirdif still use v2 in-store signage.'],
    ),
  },
  {
    id: 'd-digest-w40', name: 'Social listening digest — W40.pdf', kind: 'pdf', folderId: 'f-research', sizeKb: 1400, uploadedBy: 's-mira', uploadedAt: '2026-10-06T08:30:00',
    summary: 'Week of 28 Sep – 4 Oct: mentions up 18%, delivery fee complaints rising.',
    preview: pages(
      ['Social listening digest · W40', '28 Sep – 4 Oct 2026 · curated by Spark'],
      ['In one line', 'The signature collection keeps carrying the conversation; complaints about the AED 15 delivery fee tripled.'],
    ),
  },
  {
    id: 'd-digest-w39', name: 'Social listening digest — W39.pdf', kind: 'pdf', folderId: 'f-research', sizeKb: 1300, uploadedBy: 's-mira', uploadedAt: '2026-09-29T08:30:00',
    summary: 'Week of 21 – 27 Sep: a steady week; recyclable packaging praised, first Riyadh mentions.',
    preview: pages(
      ['Social listening digest · W39', '21 – 27 Sep 2026 · curated by Spark'],
      ['In one line', 'A steady week. Recyclable packaging earned positive comments; the first Riyadh mentions came from job listings.'],
    ),
  },
  {
    id: 'd-siteplan', name: 'Riyadh site plan — Al Olaya.pdf', kind: 'pdf', folderId: 'f-uploads', sizeKb: 9600, uploadedBy: 'u-omar', uploadedAt: '2026-09-15T13:00:00', requestId: 'REQ-104',
    preview: pages(['Al Olaya flagship · site plan', '182 m² · 46 seats · terrace 30 m² · opening target 15 Jan 2027']),
  },
  {
    id: 'd-budget', name: 'Q4 marketing budget.xlsx', kind: 'sheet', folderId: 'f-uploads', sizeKb: 86, uploadedBy: 'u-rania', uploadedAt: '2026-09-20T09:45:00',
    preview: { type: 'table', columns: ['Line', 'Q4 budget (AED)', 'Committed', 'Remaining'], rows: [
      ['Riyadh launch', '190,000', '0', '190,000'],
      ['Ramadan packaging', '96,000', '96,000', '0'],
      ['Always-on social', '45,000', '30,000', '15,000'],
      ['Store refresh (3 stores)', '60,000', '12,000', '48,000'],
      ['Total', '391,000', '138,000', '253,000'],
    ] },
  },
];

// ---- Requests & proposals -------------------------------------------------

export const requests: WorkRequest[] = [
  // A proposal awaiting the client's decision, due in a few days (shows the deadline hourglass).
  {
    id: 'REQ-100', title: 'UAE National Day window displays', type: 'Creative',
    description: 'Window displays for the five UAE stores for National Day on 2 December: one idea, adapted per store, with a matching social post.',
    timing: 'This quarter', budget: 'Up to AED 60,000', status: 'proposal', createdBy: 'u-layla', createdAt: '2026-10-01T10:00:00', updatedAt: '2026-10-10T12:00:00', ownerId: 's-dana',
    nextStep: { label: 'Your decision on the proposal', date: '2026-10-18', onClient: true },
    proposalIds: ['P-100-1'],
    activity: [
      { id: 'g1', at: '2026-10-01T10:00:00', by: 'u-layla', kind: 'created', text: 'created this request' },
      { id: 'g2', at: '2026-10-02T09:30:00', by: 's-dana', kind: 'status', text: 'started reviewing' },
      { id: 'g3', at: '2026-10-10T12:00:00', by: 's-dana', kind: 'proposal', text: 'sent a proposal · AED 54,000 · 6 weeks' },
    ],
  },
  {
    id: 'REQ-105', title: 'Response plan for delivery fee complaints', type: 'Social',
    description: 'Complaints about the AED 15 delivery fee tripled this week, mostly on Instagram comments and Google reviews. We need a reply approach for the community team and a view on whether to change the pricing message before Riyadh.',
    timing: 'Within 2 weeks', status: 'in_review', createdBy: 'u-omar', createdAt: '2026-10-07T11:20:00', updatedAt: '2026-10-08T09:10:00', ownerId: 's-mira',
    nextStep: { label: 'Spark replies with scope', date: '2026-10-10' },
    excerpt: { conversationId: 'c-fee', messages: [
      { role: 'user', text: 'Why are people complaining about delivery fees this week?' },
      { role: 'assistant', text: 'Mentions of the delivery fee rose from 61 to 188 (3.1×), 72% negative. Most come from Instagram comments on the signature collection post and from Google reviews of the Dubai Mall store.' },
    ] },
    proposalIds: [],
    activity: [
      { id: 'a1', at: '2026-10-07T11:20:00', by: 'u-omar', kind: 'created', text: 'created this request from a chat' },
      { id: 'a2', at: '2026-10-08T09:10:00', by: 's-mira', kind: 'status', text: 'started reviewing' },
      { id: 'a3', at: '2026-10-08T09:12:00', by: 's-mira', kind: 'comment', text: 'Thanks Omar. I\'ll pull the full comment set and come back with a short plan and cost on Friday.' },
    ],
  },
  {
    id: 'REQ-104', title: 'Riyadh launch campaign', type: 'Strategy',
    description: 'Launch campaign for the Al Olaya flagship opening on 15 January 2027: positioning for Saudi audiences, a campaign idea, opening content and the launch event identity. Budget available in Q4: up to AED 190,000.',
    timing: 'This quarter', budget: 'Up to AED 190,000', status: 'proposal', createdBy: 'u-layla', createdAt: '2026-09-16T10:05:00', updatedAt: '2026-10-06T15:30:00', ownerId: 's-dana',
    nextStep: { label: 'Your decision on the proposal', date: '2026-10-14', onClient: true },
    excerpt: { conversationId: 'c-riyadh', messages: [
      { role: 'user', text: 'What should we know about Riyadh shoppers before we open?' },
      { role: 'assistant', text: 'Riyadh target shoppers skew young (24–35), shop after 7 pm, and discover brands through creators. They respond to craft and a signature product, and they are sensitive to extra fees.' },
    ] },
    sourceIds: ['d-ksa', 'd-personas'],
    proposalIds: ['P-104-2'],
    activity: [
      { id: 'b1', at: '2026-09-16T10:05:00', by: 'u-layla', kind: 'created', text: 'created this request from a chat' },
      { id: 'b2', at: '2026-09-17T09:00:00', by: 's-dana', kind: 'status', text: 'started reviewing' },
      { id: 'b3', at: '2026-09-17T09:05:00', by: 'u-omar', kind: 'file', text: 'attached Riyadh site plan — Al Olaya.pdf' },
      { id: 'b6', at: '2026-10-06T15:30:00', by: 's-dana', kind: 'proposal', text: 'sent a proposal · AED 186,000 · 10 weeks' },
    ],
  },
  // Work Spark has in hand, so Home shows what's in progress and what comes next.
  {
    id: 'REQ-106', title: 'November social content', type: 'Social',
    description: 'Twelve posts and four Reels for Instagram and TikTok in November, shot natively for each platform, around the signature collection and National Day.',
    timing: 'Within 2 weeks', budget: 'Up to AED 28,000', status: 'in_progress', createdBy: 'u-layla', createdAt: '2026-10-02T10:00:00', updatedAt: '2026-10-22T16:40:00', ownerId: 's-mira',
    nextStep: { label: 'First posts ready for your review', date: '2026-10-30' },
    proposalIds: [],
    activity: [
      { id: 'h1', at: '2026-10-02T10:00:00', by: 'u-layla', kind: 'created', text: 'created this request' },
      { id: 'h2', at: '2026-10-09T11:00:00', by: 'u-layla', kind: 'decision', text: 'approved the proposal' },
      { id: 'h3', at: '2026-10-22T16:40:00', by: 's-mira', kind: 'status', text: 'finished the shoot plan and booked two creators' },
    ],
  },
  {
    id: 'REQ-107', title: 'Mobile site speed fixes', type: 'Other',
    description: 'Compress the product images and lazy-load the galleries, so product pages load in under 3 s on 4G.',
    timing: 'ASAP', status: 'approved', createdBy: 'u-omar', createdAt: '2026-10-15T09:30:00', updatedAt: '2026-10-21T10:15:00', ownerId: 's-youssef',
    nextStep: { label: 'Spark starts the work', date: '2026-10-28' },
    proposalIds: [],
    activity: [
      { id: 'i1', at: '2026-10-15T09:30:00', by: 'u-omar', kind: 'created', text: 'created this request from the website analysis' },
      { id: 'i2', at: '2026-10-21T10:15:00', by: 'u-omar', kind: 'decision', text: 'approved the proposal' },
    ],
  },
  {
    id: 'REQ-103', title: 'Ramadan 2027 packaging', type: 'Creative',
    description: 'Limited-edition bag, gift box and gift card for Ramadan 2027, across UAE stores and the Riyadh flagship.',
    timing: 'This quarter', status: 'in_progress', createdBy: 'u-layla', createdAt: '2026-08-25T09:00:00', updatedAt: '2026-10-07T18:00:00', ownerId: 's-youssef',
    nextStep: { label: 'Your feedback on round 1 concepts', date: '2026-10-15', onClient: true },
    proposalIds: ['P-103-1'],
    activity: [
      { id: 'c1', at: '2026-08-25T09:00:00', by: 'u-layla', kind: 'created', text: 'created this request' },
      { id: 'c2', at: '2026-09-04T11:00:00', by: 's-dana', kind: 'proposal', text: 'sent a proposal · AED 96,000 · 8 weeks' },
      { id: 'c3', at: '2026-09-10T10:20:00', by: 'u-layla', kind: 'decision', text: 'approved the proposal' },
      { id: 'c4', at: '2026-09-11T09:00:00', by: 's-youssef', kind: 'status', text: 'started work' },
      { id: 'c5', at: '2026-10-07T18:00:00', by: 's-youssef', kind: 'file', text: 'shared Packaging concepts — round 1.pdf for your review' },
    ],
  },
  {
    id: 'REQ-102', title: 'Brand guidelines refresh', type: 'Creative',
    description: 'Update guidelines to v3: Arabic logo lock-ups, a night palette and photography direction.',
    timing: 'Flexible', status: 'delivered', createdBy: 'u-layla', createdAt: '2026-06-30T12:00:00', updatedAt: '2026-08-28T16:00:00', ownerId: 's-youssef',
    proposalIds: ['P-102-1'],
    activity: [
      { id: 'e1', at: '2026-06-30T12:00:00', by: 'u-layla', kind: 'created', text: 'created this request' },
      { id: 'e2', at: '2026-07-08T10:00:00', by: 'u-layla', kind: 'decision', text: 'approved the proposal' },
      { id: 'e3', at: '2026-08-28T16:00:00', by: 's-youssef', kind: 'status', text: 'delivered Brand Guidelines v3.2.pdf' },
    ],
  },
  {
    id: 'REQ-101', title: 'Loyalty app naming', type: 'Strategy',
    description: 'Name and verbal identity for the planned loyalty app.',
    timing: 'Flexible', status: 'declined', createdBy: 'u-omar', createdAt: '2026-06-02T09:00:00', updatedAt: '2026-06-20T14:00:00', ownerId: 's-dana',
    proposalIds: ['P-101-1'],
    activity: [
      { id: 'f1', at: '2026-06-02T09:00:00', by: 'u-omar', kind: 'created', text: 'created this request' },
      { id: 'f2', at: '2026-06-12T12:00:00', by: 's-dana', kind: 'proposal', text: 'sent a proposal · AED 42,000 · 4 weeks' },
      { id: 'f3', at: '2026-06-20T14:00:00', by: 'u-layla', kind: 'decision', text: 'declined: "Loyalty app postponed to 2027."' },
    ],
  },
];

const riyadhBase = {
  requestId: 'REQ-104',
  title: 'Riyadh launch campaign',
  objectives: [
    'Make Brand Co. the most talked-about store opening in Riyadh in January 2027.',
    'Position Brand Co. on regional design and craft, not on being "from Dubai".',
    'Fill the Al Olaya flagship in its first four weeks (target: 900 visitors a day).',
  ],
  terms: [
    'Prices exclude VAT. 50% on approval, 50% on launch.',
    'Media spend, venue hire and event production are not included.',
    'Two rounds of revisions per deliverable.',
  ],
};

export const proposals: Proposal[] = [
  {
    id: 'P-100-1', requestId: 'REQ-100', version: 1, title: 'UAE National Day window displays', sentBy: 's-dana', sentAt: '2026-10-10T12:00:00', validUntil: '2026-10-18', startDate: '2026-10-20',
    summary: 'One window idea built around the flag colours in light and craft, adapted to the five UAE stores, installed by 28 November with a matching social post.',
    objectives: ['Windows people stop for and photograph in National Day week.', 'One idea that fits every store, from Dubai Mall to Al Ain.'],
    scope: [
      { title: 'Window concept', detail: 'Two routes, presented as store renders.', deliverables: ['2 concept routes', 'Renders for Dubai Mall'] },
      { title: 'Store adaptations', detail: 'The chosen route fitted to each window.', deliverables: ['5 store layouts', 'Production files'] },
      { title: 'Social post', detail: 'A post and story from the windows.', deliverables: ['1 post', '3 stories'] },
    ],
    phases: [{ name: 'Concept', weeks: 2 }, { name: 'Adaptation', weeks: 2 }, { name: 'Production', weeks: 2 }],
    investment: [{ item: 'Window concept', amount: 18000 }, { item: 'Store adaptations', amount: 24000 }, { item: 'Social post', amount: 7000 }, { item: 'Project management', amount: 5000 }],
    terms: ['Prices exclude VAT, printing and installation.', '50% on approval, 50% on installation.'],
    status: 'awaiting',
    comments: [],
  },
  {
    ...riyadhBase,
    id: 'P-104-2', version: 2, sentBy: 's-dana', sentAt: '2026-10-06T15:30:00', validUntil: '2026-10-14', startDate: '2026-11-09',
    summary: 'A 10-week programme from positioning to opening week. Films move to a second wave around Ramadan and are quoted separately, which brings this phase within the Q4 budget.',
    scope: [
      { title: 'KSA positioning', detail: 'Adapt the Brand Co. platform for Riyadh, based on the KSA market entry strategy.', deliverables: ['Positioning and message house', 'Arabic naming and trademark-risk check', 'Pricing message for delivery'] },
      { title: 'Campaign idea and key visual', detail: 'One campaign idea that works in-store, outdoor and on social.', deliverables: ['Campaign idea (2 routes → 1)', 'Key visual', 'OOH and digital toolkit'] },
      { title: 'Launch content', detail: 'Content for the opening month, made for Instagram and TikTok.', deliverables: ['12 social assets', 'Creator brief and shortlist (10 creators)', '3 short-form edits from event footage'] },
      { title: 'Launch event identity', detail: 'Identity and materials for the opening night on 15 January.', deliverables: ['Invitation', 'On-site signage', 'Merch (tote, notebook)'] },
    ],
    phases: [{ name: 'Discovery', weeks: 2 }, { name: 'Concept', weeks: 3 }, { name: 'Production', weeks: 4 }, { name: 'Launch', weeks: 1 }],
    investment: [
      { item: 'KSA positioning', amount: 38000 }, { item: 'Campaign idea and key visual', amount: 52000 },
      { item: 'Launch content', amount: 64000 }, { item: 'Launch event identity', amount: 22000 },
      { item: 'Project management', amount: 10000 },
    ],
    status: 'awaiting',
    comments: [
      { id: 'pc3', by: 'u-omar', at: '2026-10-07T09:20:00', text: 'Can the creator shortlist include at least 3 Arabic-first creators?', section: 'Scope & deliverables' },
      { id: 'pc4', by: 's-dana', at: '2026-10-07T11:02:00', text: 'Yes, we\'ll make it at least half Arabic-first.', section: 'Scope & deliverables' },
    ],
  },
  {
    id: 'P-103-1', requestId: 'REQ-103', version: 1, title: 'Ramadan 2027 packaging', sentBy: 's-dana', sentAt: '2026-09-04T11:00:00', validUntil: '2026-09-18', startDate: '2026-09-14',
    summary: 'Three concept routes, one developed design system for bag, gift box and gift card, print-ready by 14 November.',
    objectives: ['A Ramadan edition customers want to keep and gift.', 'One system that works in the UAE and Riyadh.'],
    scope: [
      { title: 'Concepts', detail: 'Three routes, presented as mock-ups.', deliverables: ['3 concept routes', 'Moodboards'] },
      { title: 'Development', detail: 'One route developed across formats.', deliverables: ['Shopping bag (S, L)', 'Gift box', 'Gift card'] },
      { title: 'Print production', detail: 'Artwork and printer liaison.', deliverables: ['Print-ready artwork', 'Colour proofs check'] },
    ],
    phases: [{ name: 'Concepts', weeks: 3 }, { name: 'Development', weeks: 3 }, { name: 'Artwork', weeks: 2 }],
    investment: [{ item: 'Concepts', amount: 28000 }, { item: 'Development', amount: 44000 }, { item: 'Print production', amount: 18000 }, { item: 'Project management', amount: 6000 }],
    terms: ['Prices exclude VAT and printing.'],
    status: 'approved',
    decision: { by: 'u-layla', at: '2026-09-10T10:20:00', note: 'Looks great, let\'s go.' },
    comments: [],
  },
  {
    id: 'P-102-1', requestId: 'REQ-102', version: 1, title: 'Brand guidelines refresh', sentBy: 's-dana', sentAt: '2026-07-03T10:00:00', validUntil: '2026-07-17', startDate: '2026-07-10',
    summary: 'Guidelines v3 with Arabic lock-ups, night palette and photography direction.',
    objectives: ['One source of truth for every store and partner.'],
    scope: [{ title: 'Guidelines v3', detail: 'Full update of the brand book.', deliverables: ['Guidelines PDF', 'Logo pack'] }],
    phases: [{ name: 'Update', weeks: 6 }, { name: 'Handover', weeks: 1 }],
    investment: [{ item: 'Guidelines v3', amount: 34000 }],
    terms: ['Prices exclude VAT.'],
    status: 'approved',
    decision: { by: 'u-layla', at: '2026-07-08T10:00:00' },
    comments: [],
  },
  {
    id: 'P-101-1', requestId: 'REQ-101', version: 1, title: 'Loyalty app naming', sentBy: 's-dana', sentAt: '2026-06-12T12:00:00', validUntil: '2026-06-26', startDate: '2026-06-22',
    summary: 'Naming and verbal identity for the loyalty app.',
    objectives: ['A name that works in Arabic and English.'],
    scope: [{ title: 'Naming', detail: 'Three territories, 30 names, 3 finalists with checks.', deliverables: ['Naming report'] }],
    phases: [{ name: 'Naming', weeks: 4 }],
    investment: [{ item: 'Naming and verbal identity', amount: 42000 }],
    terms: ['Prices exclude VAT and trademark filing.'],
    status: 'declined',
    decision: { by: 'u-layla', at: '2026-06-20T14:00:00', reason: 'Timing', note: 'Loyalty app postponed to 2027.' },
    comments: [],
  },
];

// ---- Brand intelligence ---------------------------------------------------

export const reports: ResearchReport[] = [
  {
    id: 'r-audit', title: 'Brand audit · September 2026', kind: 'Brand audit', date: '2026-09-18', by: 's-mira', docId: 'd-audit',
    summary: 'Brand Co. is known for quality and design, less for value. Regional design details are the most-mentioned reason to buy.',
    findings: ['Awareness among UAE target shoppers: 41% (up from 33%)', '11 of 14 stores match the v3 identity', '"Too expensive" appears in 14% of reviews'],
    prompt: 'What are the main findings of the September brand audit?',
  },
  {
    id: 'r-competitive', title: 'Competitive landscape · Q3', kind: 'Competitive landscape', date: '2026-09-25', by: 's-mira', docId: 'd-competitive',
    summary: 'Nobody owns regional design with design-led stores. Competitor B leads on price, Competitor A on heritage.',
    findings: ['Brand Co. is 5–10% above the market on core products', 'Only Brand Co. charges AED 15 for delivery', 'Competitor A is opening in Riyadh in March 2027'],
    prompt: 'How do we compare with Competitor A and Competitor B?',
  },
  {
    id: 'r-personas', title: 'Audience personas · GCC', kind: 'Audience', date: '2026-09-12', by: 's-youssef', docId: 'd-personas',
    summary: 'Four personas from 22 interviews in Dubai and Riyadh, with channels and price sensitivity.',
    findings: ['Riyadh visits peak after 7 pm', 'Creators drive discovery more than ads', 'Surcharges read as unfair, not premium'],
    prompt: 'What do Riyadh shoppers care about?',
  },
];

// ---- Assistant history ------------------------------------------------------

export const conversations: Conversation[] = [
  {
    id: 'c-bg', title: 'Background check before Riyadh', createdBy: 'u-layla', createdAt: '2026-10-09T08:40:00', updatedAt: '2026-10-09T08:42:00', requestIds: [],
    messages: [
      { id: 'g1', role: 'user', by: 'u-layla', at: '2026-10-09T08:40:00', text: 'Is there anything that could hurt the brand when we open in Riyadh?' },
      { id: 'g2', role: 'assistant', at: '2026-10-09T08:40:20', state: 'done', durationMs: 5100, steps: ['Read the brand profile', 'Read KSA market entry strategy'],
        text: 'Two things to watch: possible **name confusion** with a Jeddah business, and the **delivery fee**, which Riyadh personas read as unfair. Early buzz about the opening is positive.',
        findings: [], sources: [], followUps: ['What would a trademark check involve?'] },
    ],
  },
  {
    id: 'c-reply', title: 'Reply to a Google review', createdBy: 'u-omar', createdAt: '2026-10-08T16:05:00', updatedAt: '2026-10-08T16:07:00', requestIds: [],
    messages: [
      { id: 'h1', role: 'user', by: 'u-omar', at: '2026-10-08T16:05:00', text: 'How should we reply to the 2-star Dubai Mall review about the delivery fee?' },
      { id: 'h2', role: 'assistant', at: '2026-10-08T16:05:18', state: 'done', durationMs: 4300, steps: ['Read the review', 'Checked tone of voice in Brand Guidelines v3.2'],
        text: 'Reply within a day, thank Reem for the detail, say plainly that the fee is under review, and invite her to message the team. Keep it **warm, never loud**.',
        findings: [], sources: [], followUps: ['Draft the reply in Arabic and English'] },
    ],
  },
  {
    id: 'c-compA', title: 'Competitor A opening in Riyadh', createdBy: 'u-layla', createdAt: '2026-10-03T11:30:00', updatedAt: '2026-10-03T11:33:00', requestIds: [],
    messages: [
      { id: 'k1', role: 'user', by: 'u-layla', at: '2026-10-03T11:30:00', text: 'When does Competitor A open in Riyadh, and should we worry?' },
      { id: 'k2', role: 'assistant', at: '2026-10-03T11:30:16', state: 'done', durationMs: 3900, steps: ['Read Competitive landscape Q3'],
        text: 'Competitor A plans to open in **March 2027**, about two months after you. Your space is regional design; theirs is heritage. Use the head start to own the opening conversation.',
        findings: [], sources: [], followUps: ['How should we respond to Competitor A opening in Riyadh?'] },
    ],
  },
  {
    id: 'c-fee', title: 'Delivery fee complaints', createdBy: 'u-omar', createdAt: '2026-10-07T11:02:00', updatedAt: '2026-10-07T11:20:00', requestIds: ['REQ-105'],
    messages: [
      { id: 'm1', role: 'user', by: 'u-omar', at: '2026-10-07T11:02:00', text: 'Why are people complaining about delivery fees this week?' },
      {
        id: 'm2', role: 'assistant', at: '2026-10-07T11:02:20', state: 'done', durationMs: 6200,
        steps: ['Read the W40 social listening digest', 'Checked 188 mentions tagged "delivery fee"', 'Compared with competitor pricing'],
        text: 'Mentions of the **delivery fee** rose from 61 to 188 (3.1×), 72% negative. Most come from Instagram comments on the signature collection post and from Google reviews of the Dubai Mall store.\n\nBrand Co. is the only brand in your competitive set charging AED 15; others charge AED 0–10.',
        findings: [
          { title: 'Complaints tripled in a week', body: '188 mentions vs 61 in W39, 72% negative.', tone: 'negative', sourceIds: ['s-w40'] },
          { title: 'You are the outlier on price', body: 'Competitors A and C charge AED 0–10 for delivery.', tone: 'attention', sourceIds: ['s-comp'] },
        ],
        sources: [
          { id: 's-w40', kind: 'workspace', title: 'Social listening digest — W40.pdf', docId: 'd-digest-w40', snippet: 'Delivery fee: 188 mentions, +208%, 72% negative.' },
          { id: 's-comp', kind: 'workspace', title: 'Competitive landscape Q3.pdf', docId: 'd-competitive', snippet: 'Delivery fee: Brand Co. AED 15, others AED 0–10.' },
        ],
        suggestedRequest: { title: 'Response plan for delivery fee complaints', type: 'Social' },
      },
      { id: 'm3', role: 'system', at: '2026-10-07T11:20:00', text: 'Omar created request REQ-105 from this chat.', link: { label: 'View REQ-105', route: '/requests/REQ-105' } },
    ],
  },
  {
    id: 'c-riyadh', title: 'Riyadh audience', createdBy: 'u-layla', createdAt: '2026-09-16T09:40:00', updatedAt: '2026-09-16T10:05:00', requestIds: ['REQ-104'],
    messages: [
      { id: 'n1', role: 'user', by: 'u-layla', at: '2026-09-16T09:40:00', text: 'What should we know about Riyadh shoppers before we open?' },
      {
        id: 'n2', role: 'assistant', at: '2026-09-16T09:40:18', state: 'done', durationMs: 5400,
        steps: ['Read KSA market entry strategy', 'Read Audience personas — GCC'],
        text: 'Riyadh target shoppers skew young (24–35), shop **after 7 pm**, and discover brands through creators. They respond to craft and a signature product, and they are sensitive to extra fees.',
        findings: [
          { title: 'Evenings, not mornings', body: 'Visits peak after 7 pm; plan opening events and staffing around it.', tone: 'neutral', sourceIds: ['s-ksa'] },
          { title: 'Creators over ads', body: 'Discovery runs through Instagram and TikTok creators.', tone: 'positive', sourceIds: ['s-pers'] },
        ],
        sources: [
          { id: 's-ksa', kind: 'workspace', title: 'KSA market entry strategy.pdf', docId: 'd-ksa', snippet: 'Riyadh young professionals (24–35)… discover brands through creators.' },
          { id: 's-pers', kind: 'workspace', title: 'Audience personas — GCC.pdf', docId: 'd-personas', snippet: 'Shops in malls 2× a week, mostly after 7 pm.' },
        ],
        suggestedRequest: { title: 'Riyadh launch campaign', type: 'Strategy' },
      },
      { id: 'n3', role: 'system', at: '2026-09-16T10:05:00', text: 'Layla created request REQ-104 from this chat.', link: { label: 'View REQ-104', route: '/requests/REQ-104' } },
    ],
  },
];

// ---- Notifications ------------------------------------------------------------

export const notifications: Notification[] = [
  { id: 'nt-100', audience: 'client', at: '2026-10-10T12:00:00', title: 'Proposal ready: UAE National Day window displays', body: 'AED 54,000 · 6 weeks · decision by 18 Oct', route: '/requests/REQ-100/proposal', kind: 'proposal', read: false },
  { id: 'nt1', audience: 'client', at: '2026-10-08T09:10:00', title: 'Spark started reviewing REQ-105', body: 'Response plan for delivery fee complaints', route: '/requests/REQ-105', kind: 'request', read: false },
  { id: 'nt2', audience: 'client', at: '2026-10-07T18:00:00', title: 'Approval requested on packaging concepts', body: 'Spark shared round 1 for Ramadan 2027 · due 15 Oct', route: '/documents/f-ramadan?doc=d-pack-r1', kind: 'file', read: false },
  { id: 'nt3', audience: 'client', at: '2026-10-06T15:30:00', title: 'Proposal ready: Riyadh launch campaign', body: 'AED 186,000 · 10 weeks · decision by 14 Oct', route: '/requests/REQ-104/proposal', kind: 'proposal', read: false },
  { id: 'nt4', audience: 'client', at: '2026-10-06T08:30:00', title: 'Social listening digest · W40 shared', body: 'Mentions up 18%; delivery fee complaints rising', route: '/documents/f-research?doc=d-digest-w40', kind: 'file', read: true },
  { id: 'nt5', audience: 'spark', at: '2026-10-07T11:20:00', title: 'New request from Brand Co.', body: 'REQ-105 · Response plan for delivery fee complaints', route: '/requests/REQ-105', kind: 'request', read: false },
  { id: 'nt6', audience: 'spark', at: '2026-10-07T09:20:00', title: 'Omar commented on the proposal', body: 'Riyadh launch campaign · Scope & deliverables', route: '/requests/REQ-104/proposal', kind: 'proposal', read: true },
];

// ---- Social media monitoring: weekly summaries from Spark ---------------------
// Kept deliberately simple (no charts) until Spark confirms what it reports.

export interface Digest {
  id: string;
  week: string;
  range: string;
  sharedAt: string;
  summary: string;
  highlights: { tone: 'positive' | 'negative' | 'neutral'; text: string }[];
  docId: string;
  prompt: string;
}

export const digests: Digest[] = [
  {
    id: 'W40', week: 'Week 40', range: '28 Sep – 4 Oct 2026', sharedAt: '2026-10-06T08:30:00', docId: 'd-digest-w40',
    summary: 'More people talked about the brand this week, mostly about the signature collection and the Riyadh opening. Complaints about the delivery fee tripled.',
    highlights: [
      { tone: 'positive', text: 'The signature collection got the most positive posts, helped by a creator video.' },
      { tone: 'positive', text: 'People noticed the Riyadh hoarding; most comments are excited.' },
      { tone: 'negative', text: 'Complaints about the AED 15 delivery fee tripled, mostly in comments and reviews.' },
    ],
    prompt: 'What are people saying about our brand right now?',
  },
  {
    id: 'W39', week: 'Week 39', range: '21 – 27 Sep 2026', sharedAt: '2026-09-29T08:30:00', docId: 'd-digest-w39',
    summary: 'A steady week with mostly positive comments.',
    highlights: [
      { tone: 'positive', text: 'Recyclable packaging earned positive comments.' },
      { tone: 'neutral', text: 'First mentions of Riyadh came from job listings.' },
    ],
    prompt: 'What changed in how people talk about us since last week?',
  },
];

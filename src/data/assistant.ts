// Scripted assistant. Stands in for the Waldo-powered chat until the API is
// connected: match a prompt to a prepared answer that cites workspace data.
// Replace `composeAnswer` with a call to the real service; the Message shape
// (steps, text, findings, sources) is what the UI renders.
import type { Finding, Message, RequestType, Source } from './types';

export interface AnswerContext {
  web: boolean;
}

export type Answer = Pick<Message, 'steps' | 'text' | 'findings' | 'sources' | 'followUps' | 'suggestedRequest'>;

export const suggestedPrompts: { label: string; prompt: string; hint: string }[] = [
  { label: 'Background check', prompt: 'Run a background check on our brand before the Riyadh launch', hint: 'Name risks, reviews and press' },
  { label: 'This week on social', prompt: 'How is our brand being talked about this week?', hint: 'From the social listening digest' },
  { label: 'Riyadh audience', prompt: 'What do Riyadh shoppers care about?', hint: 'From strategy and personas' },
  { label: 'Proposal summary', prompt: 'Summarize the Riyadh launch proposal', hint: 'Scope, cost and what changed' },
];

interface Script extends Answer {
  match: RegExp;
  webSteps?: string[];
  webSources?: Source[];
  webFindings?: Finding[];
}

const scripts: Script[] = [
  {
    match: /respond|reply|post from/i,
    steps: ['Read the post and its comments', 'Checked tone of voice in Brand Guidelines v3.2', 'Looked for similar posts in W40'],
    text:
      'Reply within a day, in the language of the post, and keep to the brand voice: **warm, never loud**. Thank the person for the specific detail they mentioned, own the issue plainly if there is one, and say what happens next. Avoid discount codes in public replies; move anything personal to DMs.',
    findings: [
      { title: 'Match the language', body: 'Arabic posts get Arabic replies; the guidelines say "bilingual by default".', tone: 'neutral', sourceIds: ['ws-guide'] },
      { title: 'Similar posts this week', body: 'Most complaints are about the delivery fee, already in REQ-105.', tone: 'attention', sourceIds: ['ws-w40'] },
    ],
    sources: [
      { id: 'ws-guide', kind: 'workspace', title: 'Brand Guidelines v3.2.pdf', docId: 'd-guidelines', snippet: 'Warm, never loud. Bilingual by default.' },
      { id: 'ws-w40', kind: 'workspace', title: 'Social listening digest — W40.pdf', docId: 'd-digest-w40', snippet: 'Delivery fee: 188 mentions, 72% negative.' },
    ],
    followUps: ['Draft a reply in Arabic and English'],
    suggestedRequest: { title: 'Community reply guidelines', type: 'Social' },
  },
  {
    match: /background|check|risk|trademark|name/i,
    steps: ['Read the brand profile', 'Searched 16 workspace documents', 'Read KSA market entry strategy'],
    webSteps: ['Searched trademark registers and business listings in KSA', 'Read 2,140 public reviews'],
    text:
      'Here is a quick background check ahead of the Riyadh opening. Overall the brand is in good shape: strong reviews and positive early buzz. There is **one naming risk** worth checking with legal, and **one pricing issue** that could follow you to Riyadh.',
    findings: [
      { title: 'Possible name confusion in Jeddah', body: 'A company called "Brand Co. Trading" is listed in Jeddah. Different category and city, but worth a trademark check before launch.', tone: 'attention', sourceIds: ['w-listing', 'ws-ksa'] },
      { title: 'Reviews are strong, value is the weak spot', body: 'Average 4.6★ across 2,140 reviews; "expensive" appears in 14% of them.', tone: 'neutral', sourceIds: ['w-reviews', 'ws-audit'] },
      { title: 'The delivery fee is a live complaint', body: 'Complaints tripled in W40. Riyadh personas read extra fees as unfair.', tone: 'negative', sourceIds: ['ws-w40', 'ws-pers'] },
      { title: 'Early Riyadh buzz is positive', body: 'Opening rumours were up 120% in W40, mostly excited.', tone: 'positive', sourceIds: ['ws-w40'] },
    ],
    sources: [
      { id: 'ws-ksa', kind: 'workspace', title: 'KSA market entry strategy.pdf', docId: 'd-ksa', snippet: 'Risks: name confusion with local businesses using "Brand Co.".' },
      { id: 'ws-audit', kind: 'workspace', title: 'Brand audit — Sep 2026.pdf', docId: 'd-audit', snippet: '"Too expensive" appears in 14% of reviews.' },
      { id: 'ws-w40', kind: 'workspace', title: 'Social listening digest — W40.pdf', docId: 'd-digest-w40', snippet: 'Delivery fee +208%; Riyadh opening +120%.' },
      { id: 'ws-pers', kind: 'workspace', title: 'Audience personas — GCC.pdf', docId: 'd-personas', snippet: 'Dislikes surcharges she sees as unfair.' },
    ],
    webSources: [
      { id: 'w-listing', kind: 'web', title: 'Business listing: Brand Co. Trading, Jeddah', domain: 'maps.google.com', snippet: 'General trading · Al Rawdah, Jeddah (sample)' },
      { id: 'w-reviews', kind: 'web', title: 'Public reviews, 14 Brand Co. stores', domain: 'google.com/maps', snippet: '4.6 average across 2,140 reviews (sample)' },
    ],
    followUps: ['What would a trademark check involve?', 'How do we compare with Competitor A on price?'],
    suggestedRequest: { title: 'Trademark and naming check for Riyadh', type: 'Research' },
  },
  {
    match: /talked|social|week|mention|sentiment|monitor/i,
    steps: ['Read the W40 social listening digest', 'Compared with W39', 'Pulled notable posts'],
    webSteps: ['Checked public posts from the last 48 hours'],
    text:
      'Last week (28 Sep – 4 Oct) mentions rose **18% to 2,430**, with an estimated reach of 1.8M. Sentiment is still mostly positive (64%) but slipped 4 points, almost entirely because of the delivery fee.',
    findings: [
      { title: 'The signature collection is carrying the brand', body: '412 mentions, +34%, after a creator reel with 310k views.', tone: 'positive', sourceIds: ['ws-w40', 'w-post'] },
      { title: 'Riyadh opening rumours are building', body: '296 mentions, +120%, after the Al Olaya hoarding went up.', tone: 'positive', sourceIds: ['ws-w40'] },
      { title: 'Delivery fee complaints tripled', body: '188 mentions, 72% negative. Already in review with Spark as REQ-105.', tone: 'negative', sourceIds: ['ws-w40', 'ws-req'] },
      { title: 'Weekend queues at Dubai Mall', body: '97 mentions about 15+ minute waits on Friday and Saturday evenings.', tone: 'attention', sourceIds: ['ws-w40'] },
    ],
    sources: [
      { id: 'ws-w40', kind: 'workspace', title: 'Social listening digest — W40.pdf', docId: 'd-digest-w40', snippet: 'Mentions 2,430 (+18%) · positive 64% (−4 pts).' },
      { id: 'ws-req', kind: 'workspace', title: 'REQ-105 · Delivery fee response plan', route: '/requests/REQ-105', snippet: 'In review with Mira Chen.' },
    ],
    webSources: [
      { id: 'w-post', kind: 'web', title: '@dxb.style.diaries on Instagram', domain: 'instagram.com', snippet: '"The new signature collection at Brand Co. is the best thing I\'ve bought this month." (sample)' },
    ],
    followUps: ['What should we do about Dubai Mall wait times?', 'Which creators are talking about us?'],
    suggestedRequest: { title: 'Fix weekend wait-time perception at Dubai Mall', type: 'Social' },
  },
  {
    match: /riyadh|audience|shopper|customer|persona|care/i,
    steps: ['Read KSA market entry strategy', 'Read Audience personas — GCC', 'Read Competitive landscape Q3'],
    webSteps: ['Searched recent Riyadh store openings'],
    text:
      'Riyadh target shoppers are young (24–35), go out **after 7 pm**, and find new brands through creators rather than ads. They reward craft and a signature product, expect fast service, and see extra fees as unfair rather than premium.',
    findings: [
      { title: 'Plan for evenings', body: 'Visits peak after 7 pm; opening events and staffing should follow.', tone: 'neutral', sourceIds: ['ws-ksa'] },
      { title: 'Lead with craft, not with Dubai', body: 'Saudi shoppers value local relevance; "from Dubai" is not a selling point.', tone: 'attention', sourceIds: ['ws-ksa'] },
      { title: 'Creators drive discovery', body: 'Instagram and TikTok creators matter more than paid ads for openings.', tone: 'positive', sourceIds: ['ws-pers'] },
      { title: 'Watch add-on pricing', body: 'Extra fees like delivery read as unfair to this audience.', tone: 'negative', sourceIds: ['ws-pers', 'ws-comp'] },
    ],
    sources: [
      { id: 'ws-ksa', kind: 'workspace', title: 'KSA market entry strategy.pdf', docId: 'd-ksa', snippet: 'Saudi shoppers value local relevance; lead with craft.' },
      { id: 'ws-pers', kind: 'workspace', title: 'Audience personas — GCC.pdf', docId: 'd-personas', snippet: 'Noura, 29 · visits 4× a week, mostly after 7 pm.' },
      { id: 'ws-comp', kind: 'workspace', title: 'Competitive landscape Q3.pdf', docId: 'd-competitive', snippet: 'Only Brand Co. charges AED 15 for delivery.' },
    ],
    webSources: [
      { id: 'w-openings', kind: 'web', title: 'Recent store openings in Al Olaya', domain: 'timeoutriyadh.com', snippet: 'Three premium stores opened in Al Olaya this year (sample)' },
    ],
    followUps: ['Which persona should the launch target first?', 'What signature product could we launch in Riyadh?'],
    suggestedRequest: { title: 'Signature product concept for Riyadh', type: 'Creative' },
  },
  {
    match: /proposal|summar|cost|budget|quote/i,
    steps: ['Read proposal v2 for REQ-104', 'Compared with v1', 'Checked Q4 marketing budget.xlsx'],
    text:
      'Proposal v2 for the **Riyadh launch campaign** covers positioning, a campaign idea, opening content and the launch event identity over **10 weeks for AED 186,000**. Compared with v1, the two launch films moved to a second wave around Ramadan, which saves AED 28,000 and two weeks. It fits the AED 190,000 Q4 line with AED 4,000 to spare. It is waiting for your decision by 14 October.',
    findings: [
      { title: 'Within budget', body: 'AED 186,000 vs AED 190,000 available in Q4.', tone: 'positive', sourceIds: ['ws-prop', 'ws-budget'] },
      { title: 'Films now quoted separately', body: 'The second wave will need its own budget in Q1 2027.', tone: 'attention', sourceIds: ['ws-prop'] },
      { title: 'Starts 9 November, launches 11 January', body: 'A decision after 14 October puts the opening-week content at risk.', tone: 'neutral', sourceIds: ['ws-prop'] },
    ],
    sources: [
      { id: 'ws-prop', kind: 'workspace', title: 'Proposal v2 · Riyadh launch campaign', route: '/requests/REQ-104/proposal', snippet: 'AED 186,000 · 10 weeks · valid until 14 Oct.' },
      { id: 'ws-budget', kind: 'workspace', title: 'Q4 marketing budget.xlsx', docId: 'd-budget', snippet: 'Riyadh launch: 190,000 remaining.' },
    ],
    followUps: ['What would the films cost in a second wave?', 'What happens if we start in November?'],
  },
  {
    match: /packag|ramadan|concept/i,
    steps: ['Read REQ-103 and its proposal', 'Opened Packaging concepts — round 1'],
    text:
      'The Ramadan 2027 packaging is **in progress**. Round 1 has three routes: **Night Market**, **Desert Bloom** and **Lantern**. Youssef asked for your pick (or two) by **15 October**, so artwork can go to print on 14 November.',
    findings: [
      { title: 'Feedback needed by 15 Oct', body: 'Pick a favourite route and say what to push further.', tone: 'attention', sourceIds: ['ws-pack'] },
      { title: 'Approved budget: AED 96,000', body: 'Concepts, development and print production.', tone: 'neutral', sourceIds: ['ws-req103'] },
    ],
    sources: [
      { id: 'ws-pack', kind: 'workspace', title: 'Packaging concepts — round 1.pdf', docId: 'd-pack-r1', snippet: 'Three routes: Night Market, Desert Bloom, Lantern.' },
      { id: 'ws-req103', kind: 'workspace', title: 'REQ-103 · Ramadan 2027 packaging', route: '/requests/REQ-103', snippet: 'Approved 10 Sep · AED 96,000.' },
    ],
    followUps: ['Which route fits Riyadh best?'],
  },
  {
    match: /audit|compare|competitor/i,
    steps: ['Read Brand audit — Sep 2026', 'Read Competitive landscape Q3'],
    text:
      'You lead on **regional design and quality**, Competitor B on price and Competitor A on heritage. Brand Co. is 5–10% above the market on core products, and the only one charging AED 15 for delivery. Competitor A plans to open in Riyadh in March 2027, about two months after you.',
    findings: [
      { title: 'Your space is regional design', body: 'No competitor combines it with design-led stores.', tone: 'positive', sourceIds: ['ws-comp'] },
      { title: 'Competitor A follows you to Riyadh', body: 'Planned opening March 2027.', tone: 'attention', sourceIds: ['ws-comp'] },
      { title: 'Value perception is the gap', body: '"Too expensive" in 14% of reviews.', tone: 'negative', sourceIds: ['ws-audit'] },
    ],
    sources: [
      { id: 'ws-comp', kind: 'workspace', title: 'Competitive landscape Q3.pdf', docId: 'd-competitive', snippet: 'Nobody owns regional design with design-led stores.' },
      { id: 'ws-audit', kind: 'workspace', title: 'Brand audit — Sep 2026.pdf', docId: 'd-audit', snippet: 'Known for quality and design, less for value.' },
    ],
    followUps: ['How should we respond to Competitor A opening in Riyadh?'],
    suggestedRequest: { title: 'Competitive response plan for Riyadh', type: 'Strategy' },
  },
];

const fallback = (prompt: string): Answer => ({
  steps: ['Read the brand profile', 'Searched 16 workspace documents'],
  text:
    `I couldn't find anything in your workspace that answers "${prompt.trim()}" with confidence, and I'd rather not guess.\n\nYou can rephrase the question, or send it to Spark as a request so the team can research it properly.`,
  findings: [],
  sources: [],
  followUps: ['How is our brand being talked about this week?', 'Run a background check on our brand before the Riyadh launch'],
  suggestedRequest: { title: prompt.length > 60 ? prompt.slice(0, 57) + '…' : prompt, type: 'Research' as RequestType },
});

export function composeAnswer(prompt: string, ctx: AnswerContext, contextDocName?: string): Answer {
  if (contextDocName) {
    return {
      steps: [`Opened ${contextDocName}`, 'Read the brand profile'],
      text: `Here's what **${contextDocName}** covers and how it relates to your current work. Ask a follow-up to go deeper into any section.`,
      findings: [],
      sources: [],
      followUps: ['What are the key decisions in this file?', 'What has changed since the last version?'],
    };
  }
  const s = scripts.find((x) => x.match.test(prompt));
  if (!s) return fallback(prompt);
  const webIds = new Set((s.webSources ?? []).map((w) => w.id));
  const findings = (ctx.web ? [...(s.findings ?? [])] : (s.findings ?? []).map((f) => ({ ...f, sourceIds: f.sourceIds.filter((id) => !webIds.has(id)) })));
  return {
    steps: [...(s.steps ?? []), ...(ctx.web ? s.webSteps ?? [] : []), 'Wrote the answer'],
    text: s.text,
    findings,
    sources: [...(s.sources ?? []), ...(ctx.web ? s.webSources ?? [] : [])],
    followUps: s.followUps,
    suggestedRequest: s.suggestedRequest,
  };
}

export function titleFromPrompt(prompt: string) {
  const t = prompt.replace(/[?.!]+$/, '').trim();
  return t.length > 42 ? t.slice(0, 40).trimEnd() + '…' : t;
}

// Domain model. Shapes mirror what a future API would return, so mock data
// can be swapped for fetch calls without touching the screens.

export type ID = string;
export type ISODate = string;

export type Org = 'client' | 'spark';
export type ClientRole = 'owner' | 'member' | 'viewer';

export interface Person {
  id: ID;
  name: string;
  email: string;
  title: string;
  org: Org;
  role?: ClientRole; // client members only
  hue: number; // avatar tint
  lastActive?: ISODate;
  focus?: string; // Spark team: what they handle
}

export interface Invitation {
  id: ID;
  email: string;
  role: ClientRole;
  invitedBy: ID;
  invitedAt: ISODate;
  message?: string;
}

export interface Brand {
  id: ID;
  name: string;
  legalName: string;
  tagline: string;
  website: string;
  category: string;
  founded: string;
  hq: string;
  footprint: string;
  positioning: string;
  audiences: { name: string; detail: string }[];
  voice: string[];
  competitors: string[];
  keyDates: { date: ISODate; label: string }[];
  updatedAt: ISODate;
  updatedBy: ID;
}

// ---- Documents ----------------------------------------------------------

export type DocKind = 'pdf' | 'image' | 'deck' | 'sheet' | 'archive';

export interface Folder {
  id: ID;
  name: string;
  parentId: ID | null;
  description?: string;
}

export type DocPreview =
  | { type: 'pages'; pages: { heading: string; body: string[] }[] }
  | { type: 'art'; palette: string[]; motif: 'bloom' | 'night' | 'store' | 'pack' | 'logo' }
  | { type: 'table'; columns: string[]; rows: string[][] }
  | { type: 'files'; files: { name: string; size: string }[] }
  | { type: 'none' };

export interface Doc {
  id: ID;
  name: string;
  kind: DocKind;
  folderId: ID;
  sizeKb: number;
  uploadedBy: ID;
  uploadedAt: ISODate;
  version?: number;
  requestId?: ID;
  summary?: string;
  preview: DocPreview;
  review?: {
    requestedBy: ID;
    due: ISODate;
    note: string;
    status: 'open' | 'done';
    feedback: Comment[];
  };
}

// ---- Requests & proposals ----------------------------------------------

export type RequestStatus =
  | 'submitted'
  | 'in_review'
  | 'proposal'
  | 'changes_requested'
  | 'approved'
  | 'in_progress'
  | 'delivered'
  | 'declined';

export type RequestType = 'Strategy' | 'Creative' | 'Content' | 'Research' | 'Social' | 'Other';
export type Timing = 'ASAP' | 'Within 2 weeks' | 'This quarter' | 'Flexible';

export interface Activity {
  id: ID;
  at: ISODate;
  by: ID;
  kind: 'created' | 'status' | 'comment' | 'proposal' | 'decision' | 'file';
  text: string;
}

export interface Excerpt {
  conversationId: ID;
  messages: { role: 'user' | 'assistant'; text: string }[];
  findings?: Finding[]; // the answer's key findings, shown as insight cards
}

export interface WorkRequest {
  id: ID; // REQ-104
  title: string;
  type: RequestType;
  description: string;
  timing: Timing;
  budget?: string;
  status: RequestStatus;
  createdBy: ID;
  createdAt: ISODate;
  updatedAt: ISODate;
  ownerId: ID; // Spark owner
  nextStep?: { label: string; date: ISODate };
  excerpt?: Excerpt;
  sourceIds?: ID[];
  proposalIds: ID[];
  activity: Activity[];
}

export interface Comment {
  id: ID;
  by: ID;
  at: ISODate;
  text: string;
  section?: string;
}

export type ProposalStatus = 'awaiting' | 'changes_requested' | 'approved' | 'declined' | 'superseded';

export interface Proposal {
  id: ID;
  requestId: ID;
  version: number;
  title: string;
  sentBy: ID;
  sentAt: ISODate;
  validUntil: ISODate;
  summary: string;
  objectives: string[];
  scope: { title: string; detail: string; deliverables: string[] }[];
  phases: { name: string; weeks: number }[];
  startDate: ISODate;
  investment: { item: string; amount: number }[];
  terms: string[];
  status: ProposalStatus;
  decision?: { by: ID; at: ISODate; note?: string; reason?: string };
  comments: Comment[];
}

// ---- Assistant -----------------------------------------------------------

export interface Source {
  id: ID;
  kind: 'workspace' | 'web';
  title: string;
  docId?: ID;
  route?: string;
  domain?: string;
  snippet: string;
}

export interface Finding {
  title: string;
  body: string;
  tone: 'positive' | 'negative' | 'neutral' | 'attention';
  sourceIds: ID[];
}

export interface Attachment {
  name: string;
  sizeKb: number;
}

export interface Message {
  id: ID;
  role: 'user' | 'assistant' | 'system';
  by?: ID;
  at: ISODate;
  text: string;
  attachments?: Attachment[]; // files the client added to their message
  steps?: string[];
  findings?: Finding[];
  sources?: Source[];
  followUps?: string[];
  suggestedRequest?: { title: string; type: RequestType };
  link?: { label: string; route: string };
  state?: 'thinking' | 'streaming' | 'done' | 'error';
  durationMs?: number;
}

export interface Conversation {
  id: ID;
  title: string;
  createdBy: ID;
  createdAt: ISODate;
  updatedAt: ISODate;
  messages: Message[];
  requestIds: ID[];
}

// ---- Brand intelligence --------------------------------------------------

export interface ResearchReport {
  id: ID;
  title: string;
  kind: 'Brand audit' | 'Competitive landscape' | 'Audience' | 'Background check';
  date: ISODate;
  by: ID;
  summary: string;
  findings: string[];
  docId: ID;
  prompt: string;
}


// ---- Notifications ---------------------------------------------------------

export interface Notification {
  id: ID;
  audience: Org;
  at: ISODate;
  title: string;
  body: string;
  route: string;
  kind: 'proposal' | 'request' | 'file' | 'team' | 'decision';
  read: boolean;
}

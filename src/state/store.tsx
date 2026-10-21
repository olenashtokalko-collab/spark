// Workspace state. One React context with plain action functions; every
// action is where a future API call goes (see docs/02-implementation.md).
// State persists to localStorage so a demo survives reloads.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as seed from '../data/mock';
import { composeAnswer, titleFromPrompt } from '../data/assistant';
import type {
  Attachment,
  ClientRole,
  Conversation,
  Doc,
  Excerpt,
  ID,
  Invitation,
  Message,
  Notification,
  Person,
  Proposal,
  RequestMessage,
  RequestStatus,
  RequestType,
  Timing,
  WorkRequest,
} from '../data/types';
import { addDays, nowIso } from '../lib/format';
import { kindOf } from '../lib/files';

/** 'sand' is the light theme, after the 2026 brand book (see VISUAL_DIRECTIONS.md). */
export type Theme = 'dark' | 'system' | 'sand';
/** Prototype: which of the 5 request-page layouts is shown (switcher on the page). */
export type RequestLayout = 1 | 2 | 3 | 4 | 5;
export type NotifKey = 'proposals' | 'requests' | 'files' | 'team';

export interface State {
  theme: Theme;
  requestLayout: RequestLayout;
  signedIn: boolean;
  web: boolean;
  failNext: boolean;
  people: Person[];
  invitations: Invitation[];
  brand: typeof seed.brand;
  folders: typeof seed.folders;
  docs: Doc[];
  requests: WorkRequest[];
  proposals: Proposal[];
  conversations: Conversation[];
  notifications: Notification[];
  prefs: Record<NotifKey, { inApp: boolean; email: boolean }>;
  /** Proposals the Spark team saved but has not sent yet, by request. Only the Spark team sees them. */
  proposalDrafts: Record<ID, ProposalDraft>;
  /** The next proposal version the Spark team is writing on the proposal page, by request. Not sent, client can't see it. */
  sparkDrafts: Record<ID, SparkDraft>;
}

/** A proposal being written on the proposal page: its contents, and the sent version it started from. */
export interface SparkDraft {
  data: NewProposal;
  basedOn?: number;
  createdAt: string;
  savedAt: string;
}

/** The proposal form as the Spark team left it: the fields as typed, plus when it was saved. */
export interface ProposalDraft {
  title: string;
  summary: string;
  objectives: string[];
  scope: { title: string; detail: string }[];
  phases: { name: string; weeks: string }[];
  start: string;
  until: string;
  lines: { item: string; amount: string }[];
  terms: string[];
  file: string | null;
  savedAt: string;
}

export const STORAGE_KEY = 'spark-portal-v10';

// Files attached to a message are read like a workspace document.
const attachedContext = (files?: Attachment[]) => (files?.length ? (files.length === 1 ? files[0].name : `${files.length} attached files`) : undefined);

const initial = (): State => ({
  theme: 'sand',
  requestLayout: 1,
  signedIn: true,
  web: true,
  failNext: false,
  people: seed.people,
  invitations: seed.invitations,
  brand: seed.brand,
  folders: seed.folders,
  docs: seed.docs,
  requests: seed.requests,
  proposals: seed.proposals,
  conversations: seed.conversations,
  notifications: seed.notifications,
  prefs: {
    proposals: { inApp: true, email: true },
    requests: { inApp: true, email: false },
    files: { inApp: true, email: false },
    team: { inApp: true, email: false },
  },
  proposalDrafts: {},
  sparkDrafts: {},
});

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const seed = initial();
      const saved = JSON.parse(raw) as Partial<State>;
      // Folder copy comes from the seed, so edits to it reach saved demos too.
      const folders = saved.folders?.map((f) => ({ ...f, description: seed.folders.find((x) => x.id === f.id)?.description ?? f.description }));
      // Requests, proposals and notifications added to the seed later reach saved demos too.
      const missing = <T extends { id: string }>(mine: T[] | undefined, fromSeed: T[]) => (mine ? [...fromSeed.filter((x) => !mine.some((m) => m.id === x.id)), ...mine] : undefined);
      const requests = missing(saved.requests, seed.requests);
      const proposals = missing(saved.proposals, seed.proposals);
      const notifications = missing(saved.notifications, seed.notifications);
      // The Riyadh request's three proposal versions come from the seed, even in saved demos.
      const SEED_WINS = ['P-104-1', 'P-104-2', 'P-104-3'];
      if (proposals) for (let k = 0; k < proposals.length; k++) if (SEED_WINS.includes(proposals[k].id)) proposals[k] = seed.proposals.find((x) => x.id === proposals[k].id)!;
      const riyadh = seed.requests.find((r) => r.id === 'REQ-104');
      if (requests && riyadh)
        for (let k = 0; k < requests.length; k++)
          if (requests[k].id === 'REQ-104')
            requests[k] = { ...requests[k], status: riyadh.status, proposalIds: riyadh.proposalIds, nextStep: riyadh.nextStep, activity: riyadh.activity, updatedAt: riyadh.updatedAt };
      // Light is the only theme for now (dark is switched off); saved demos open in it too.
      saved.theme = 'sand';
      return { ...seed, ...saved, ...(folders && { folders }), ...(requests && { requests }), ...(proposals && { proposals }), ...(notifications && { notifications }) };
    }
  } catch {
    /* storage unavailable: fall back to seed */
  }
  return initial();
}

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface NewRequest {
  title: string;
  type: RequestType;
  description: string;
  timing: Timing;
  budget?: string;
  excerpt?: Excerpt;
  sourceIds?: ID[];
}

/** What the Spark team fills in when it sends a proposal. */
export interface NewProposal {
  title: string;
  summary: string;
  objectives: string[];
  scope: { title: string; detail: string }[];
  phases: { name: string; weeks: number }[];
  startDate: string;
  validUntil: string;
  investment: { item: string; amount: number }[];
  terms: string[];
}

const SPARK_ME = 's-dana'; // the Spark person acting in the prototype's team view

function useStoreValue() {
  const [state, setState] = useState<State>(load);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        // Strip in-flight assistant answers so a reload never shows a frozen "thinking" state.
        const conversations = state.conversations.map((c) => ({
          ...c,
          messages: c.messages.filter((m) => m.state !== 'thinking' && m.state !== 'streaming'),
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, conversations }));
      } catch {
        /* ignore quota / private mode */
      }
    }, 250);
    return () => clearTimeout(t);
  }, [state]);

  const me = useMemo(
    () => state.people.find((p) => p.id === 'u-layla')!,
    [state.people],
  );

  const set = useCallback((fn: (s: State) => Partial<State>) => setState((s) => ({ ...s, ...fn(s) })), []);

  const notify = (s: State, n: Omit<Notification, 'id' | 'at' | 'read'>): Notification[] => [
    { ...n, id: uid('nt'), at: nowIso(), read: false },
    ...s.notifications,
  ];

  const patchRequest = (s: State, id: ID, fn: (r: WorkRequest) => WorkRequest) =>
    s.requests.map((r) => (r.id === id ? fn(r) : r));

  const activity = (by: ID, kind: WorkRequest['activity'][number]['kind'], text: string) => ({
    id: uid('a'),
    at: nowIso(),
    by,
    kind,
    text,
  });

  // ---- Assistant --------------------------------------------------------

  const updateMessage = useCallback(
    (convId: ID, msgId: ID, patch: Partial<Message>) =>
      setState((s) => ({
        ...s,
        conversations: s.conversations.map((c) =>
          c.id !== convId ? c : { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...patch } : m)) },
        ),
      })),
    [],
  );

  const runAnswer = useCallback(
    async (convId: ID, msgId: ID, prompt: string, docName?: string) => {
      const s = stateRef.current;
      const fail = s.failNext;
      if (fail) set(() => ({ failNext: false }));
      const answer = composeAnswer(prompt, { web: s.web }, docName);
      const started = Date.now();
      const steps = answer.steps ?? [];
      for (let i = 0; i < steps.length; i++) {
        updateMessage(convId, msgId, { steps: steps.slice(0, i + 1) });
        await wait(520 + Math.random() * 380);
        if (fail && i === 1) {
          updateMessage(convId, msgId, { state: 'error', durationMs: Date.now() - started });
          return;
        }
      }
      updateMessage(convId, msgId, { state: 'streaming' });
      const words = (answer.text ?? '').split(/(\s+)/);
      let out = '';
      for (let i = 0; i < words.length; i += 3) {
        out += words.slice(i, i + 3).join('');
        updateMessage(convId, msgId, { text: out });
        await wait(28);
      }
      updateMessage(convId, msgId, {
        ...answer,
        steps,
        state: 'done',
        durationMs: Date.now() - started,
      });
    },
    [set, updateMessage],
  );

  const ask = useCallback(
    (convId: ID | null, prompt: string, opts: { docId?: ID; attachments?: Attachment[] } = {}): ID => {
      const s = stateRef.current;
      const meId = 'u-layla';
      const id = convId ?? uid('c');
      const at = nowIso();
      const files = opts.attachments?.length ? opts.attachments : undefined;
      const userMsg: Message = { id: uid('m'), role: 'user', by: meId, at, text: prompt, attachments: files };
      const aiMsg: Message = { id: uid('m'), role: 'assistant', at, text: '', steps: [], state: 'thinking' };
      const doc = opts.docId ? s.docs.find((d) => d.id === opts.docId) : undefined;
      setState((st) => {
        const exists = st.conversations.some((c) => c.id === id);
        const conversations = exists
          ? st.conversations.map((c) => (c.id === id ? { ...c, updatedAt: at, messages: [...c.messages, userMsg, aiMsg] } : c))
          : [
              {
                id,
                title: doc ? `About ${doc.name.replace(/\.[a-z]+$/i, '')}` : prompt ? titleFromPrompt(prompt) : `About ${files![0].name.replace(/\.[a-z0-9]+$/i, '')}`,
                createdBy: meId,
                createdAt: at,
                updatedAt: at,
                messages: [userMsg, aiMsg],
                requestIds: [],
              },
              ...st.conversations,
            ];
        return { ...st, conversations };
      });
      const context = doc?.name ?? attachedContext(files);
      void runAnswer(id, aiMsg.id, prompt, context);
      return id;
    },
    [runAnswer],
  );

  const retry = useCallback(
    (convId: ID, msgId: ID) => {
      const conv = stateRef.current.conversations.find((c) => c.id === convId);
      if (!conv) return;
      const idx = conv.messages.findIndex((m) => m.id === msgId);
      const question = [...conv.messages.slice(0, idx)].reverse().find((m) => m.role === 'user');
      updateMessage(convId, msgId, { state: 'thinking', steps: [], text: '', findings: [], sources: [] });
      void runAnswer(convId, msgId, question?.text ?? '', attachedContext(question?.attachments));
    },
    [runAnswer, updateMessage],
  );

  const deleteConversation = useCallback(
    (id: ID) => set((s) => ({ conversations: s.conversations.filter((c) => c.id !== id) })),
    [set],
  );

  const renameConversation = useCallback(
    (id: ID, title: string) =>
      set((s) => ({ conversations: s.conversations.map((c) => (c.id === id ? { ...c, title } : c)) })),
    [set],
  );

  /** "I like this colour, this direction": mark a sample visual. */
  const toggleVisualLike = useCallback(
    (convId: ID, msgId: ID, visualId: ID) =>
      set((s) => ({
        conversations: s.conversations.map((c) =>
          c.id !== convId
            ? c
            : {
                ...c,
                messages: c.messages.map((m) =>
                  m.id !== msgId ? m : { ...m, visuals: m.visuals?.map((v) => (v.id === visualId ? { ...v, liked: !v.liked } : v)) },
                ),
              },
        ),
      })),
    [set],
  );

  // ---- Requests -----------------------------------------------------------

  const createRequest = useCallback(
    (input: NewRequest): ID => {
      const s = stateRef.current;
      const next = Math.max(...s.requests.map((r) => Number(r.id.split('-')[1]))) + 1;
      const id = `REQ-${next}`;
      const at = nowIso();
      const meId = 'u-layla';
      const me = s.people.find((p) => p.id === meId)!;
      const req: WorkRequest = {
        id,
        ...input,
        status: 'submitted',
        createdBy: meId,
        createdAt: at,
        updatedAt: at,
        ownerId: 's-dana',
        nextStep: { label: 'Spark reviews your request', date: addDays(at.slice(0, 10), 2) },
        proposalIds: [],
        activity: [activity(meId, 'created', input.excerpt ? 'created this request from a chat' : 'created this request')],
      };
      set((st) => ({
        requests: [req, ...st.requests],
        conversations: input.excerpt
          ? st.conversations.map((c) =>
              c.id === input.excerpt!.conversationId
                ? {
                    ...c,
                    requestIds: [...c.requestIds, id],
                    messages: [
                      ...c.messages,
                      {
                        id: uid('m'),
                        role: 'system',
                        at,
                        text: `${me.name.split(' ')[0]} created request ${id} from this chat.`,
                        link: { label: `View ${id}`, route: `/requests/${id}` },
                      },
                    ],
                  }
                : c,
            )
          : st.conversations,
        notifications: notify(st, {
          audience: 'spark',
          title: 'New request from Brand Co.',
          body: `${id} · ${input.title}`,
          route: `/requests/${id}`,
          kind: 'request',
        }),
      }));
      return id;
    },
    [set],
  );

  const commentOnRequest = useCallback(
    (id: ID, text: string) => {
      const meId = 'u-layla';
      set((s) => ({
        requests: patchRequest(s, id, (r) => ({ ...r, updatedAt: nowIso(), activity: [...r.activity, activity(meId, 'comment', text)] })),
        notifications: notify(s, {
          audience: 'spark',
          title: `New comment on ${id}`,
          body: text.length > 80 ? text.slice(0, 77) + '…' : text,
          route: `/requests/${id}`,
          kind: 'request',
        }),
      }));
    },
    [set],
  );

  // Replaces the client's ask (the request description) while Spark hasn't
  // sent a proposal yet.
  const updateBrief = useCallback(
    (id: ID, text: string) => {
      const meId = 'u-layla';
      set((s) => ({
        requests: patchRequest(s, id, (r) => ({ ...r, description: text, updatedAt: nowIso(), activity: [...r.activity, activity(meId, 'status', 'updated the brief')] })),
        notifications: notify(s, {
          audience: 'spark',
          title: `Brief updated on ${id}`,
          body: text.length > 80 ? text.slice(0, 77) + '…' : text,
          route: `/requests/${id}`,
          kind: 'request',
        }),
      }));
    },
    [set],
  );


  // ---- The Spark team's side (prototype: acting as Dana) ---------------------------------

  const addMessage = (r: WorkRequest, m: Omit<RequestMessage, 'id' | 'at'>): RequestMessage[] => [...(r.thread ?? []), { ...m, id: uid('th'), at: nowIso() }];

  /** Spark writes on a request: a reply, a question (the client is asked to answer) or an internal note. */
  const sparkMessage = useCallback(
    (id: ID, text: string, kind: RequestMessage['kind']) => {
      const at = nowIso();
      set((s) => ({
        requests: patchRequest(s, id, (r) => ({
          ...r,
          updatedAt: at,
          thread: addMessage(r, { by: SPARK_ME, kind, text }),
          nextStep: kind === 'question' ? { label: 'Your reply to Spark’s question', date: addDays(at.slice(0, 10), 2), onClient: true } : r.nextStep,
          activity: kind === 'internal' ? r.activity : [...r.activity, activity(SPARK_ME, 'comment', text)],
        })),
        notifications:
          kind === 'internal'
            ? s.notifications
            : notify(s, {
                audience: 'client',
                title: kind === 'question' ? `Spark has a question on ${s.requests.find((r) => r.id === id)?.title ?? id}` : `Spark replied on ${s.requests.find((r) => r.id === id)?.title ?? id}`,
                body: text.length > 80 ? text.slice(0, 77) + '…' : text,
                route: `/requests/${id}`,
                kind: 'request',
              }),
      }));
    },
    [set],
  );

  /** The client writes back on a request. An answer to a question clears "waiting on the client". */
  const clientMessage = useCallback(
    (id: ID, text: string) => {
      const meId = 'u-layla';
      const at = nowIso();
      set((s) => ({
        requests: patchRequest(s, id, (r) => ({
          ...r,
          updatedAt: at,
          thread: addMessage(r, { by: meId, kind: 'message', text }),
          nextStep: r.nextStep?.onClient && r.status !== 'proposal' ? { label: 'Spark reads your reply', date: addDays(at.slice(0, 10), 2) } : r.nextStep,
          activity: [...r.activity, activity(meId, 'comment', text)],
        })),
        notifications: notify(s, {
          audience: 'spark',
          title: `Brand Co. replied on ${id}`,
          body: text.length > 80 ? text.slice(0, 77) + '…' : text,
          route: `/spark/requests/${id}/conversation`,
          kind: 'request',
        }),
      }));
    },
    [set],
  );

  const STATUS_TEXT: Partial<Record<RequestStatus, string>> = {
    in_review: 'started reviewing',
    approved: 'confirmed the approval',
    in_progress: 'started work',
    delivered: 'delivered the final files',
  };

  /** Spark moves a request along. The client sees the new stage and is told. */
  const setRequestStatus = useCallback(
    (id: ID, status: RequestStatus) => {
      const at = nowIso();
      set((s) => ({
        requests: patchRequest(s, id, (r) => ({
          ...r,
          status,
          updatedAt: at,
          nextStep: status === 'delivered' || status === 'declined' ? undefined : status === 'in_review' ? { label: 'Spark scopes your request', date: addDays(at.slice(0, 10), 2) } : r.nextStep,
          activity: [...r.activity, activity(SPARK_ME, 'status', STATUS_TEXT[status] ?? `moved the request to ${status.replace('_', ' ')}`)],
        })),
        notifications: notify(s, {
          audience: 'client',
          title: `${s.requests.find((r) => r.id === id)?.title ?? id}: ${status === 'in_review' ? 'Spark started reviewing' : status === 'in_progress' ? 'work has started' : status === 'delivered' ? 'delivered' : 'updated'}`,
          body: id,
          route: `/requests/${id}`,
          kind: 'request',
        }),
      }));
    },
    [set],
  );

  const setRequestOwner = useCallback((id: ID, ownerId: ID) => set((s) => ({ requests: patchRequest(s, id, (r) => ({ ...r, ownerId })) })), [set]);

  /** Spark sends a proposal (or a new version, which replaces the earlier one). */
  const saveProposalDraft = useCallback((requestId: ID, draft: Omit<ProposalDraft, 'savedAt'>) => {
    set((s) => ({ proposalDrafts: { ...s.proposalDrafts, [requestId]: { ...draft, savedAt: nowIso() } } }));
  }, []);
  const clearProposalDraft = useCallback((requestId: ID) => {
    set((s) => {
      const { [requestId]: _sent, ...rest } = s.proposalDrafts;
      return { proposalDrafts: rest };
    });
  }, []);

  /** Start writing a proposal (or its next version) as a draft. */
  const startSparkDraft = useCallback((requestId: ID, data: NewProposal, basedOn?: number) => {
    const at = nowIso();
    set((s) => ({ sparkDrafts: { ...s.sparkDrafts, [requestId]: { data, basedOn, createdAt: at, savedAt: at } } }));
  }, []);
  const saveSparkDraft = useCallback((requestId: ID, data: NewProposal) => {
    set((s) => (s.sparkDrafts[requestId] ? { sparkDrafts: { ...s.sparkDrafts, [requestId]: { ...s.sparkDrafts[requestId], data, savedAt: nowIso() } } } : {}));
  }, []);
  const discardSparkDraft = useCallback((requestId: ID) => {
    set((s) => {
      const { [requestId]: _gone, ...rest } = s.sparkDrafts;
      return { sparkDrafts: rest };
    });
  }, []);

  const sendProposal = useCallback(
    (requestId: ID, input: NewProposal): ID => {
      const at = nowIso();
      const s0 = stateRef.current;
      const earlier = s0.proposals.filter((p) => p.requestId === requestId);
      const version = earlier.reduce((m, p) => Math.max(m, p.version), 0) + 1;
      const id = `P-${requestId.split('-')[1]}-${version}`;
      const proposal: Proposal = {
        id,
        requestId,
        version,
        title: input.title,
        sentBy: SPARK_ME,
        sentAt: at,
        validUntil: input.validUntil,
        summary: input.summary,
        objectives: input.objectives,
        scope: input.scope.map((x) => ({ ...x, deliverables: [] })),
        phases: input.phases,
        startDate: input.startDate,
        investment: input.investment,
        terms: input.terms,
        status: 'awaiting',
        comments: [],
      };
      const total = input.investment.reduce((a, l) => a + l.amount, 0);
      const weeks = input.phases.reduce((a, p) => a + p.weeks, 0);
      set((s) => ({
        sparkDrafts: Object.fromEntries(Object.entries(s.sparkDrafts).filter(([k]) => k !== requestId)),
        proposals: [...s.proposals.map((p) => (p.requestId === requestId && p.status === 'awaiting' ? { ...p, status: 'superseded' as const } : p)), proposal],
        requests: patchRequest(s, requestId, (r) => ({
          ...r,
          status: 'proposal',
          updatedAt: at,
          proposalIds: [...r.proposalIds, id],
          nextStep: { label: 'Your decision on the proposal', date: input.validUntil, onClient: true },
          activity: [...r.activity, activity(SPARK_ME, 'proposal', `sent a proposal · AED ${total.toLocaleString('en-US')} · ${weeks} weeks`)],
        })),
        notifications: notify(s, {
          audience: 'client',
          title: `Proposal ready: ${input.title}`,
          body: `AED ${total.toLocaleString('en-US')} · ${weeks} weeks · decision by ${input.validUntil}`,
          route: `/requests/${requestId}/proposal`,
          kind: 'proposal',
        }),
      }));
      return id;
    },
    [set],
  );

  // ---- Proposals ----------------------------------------------------------

  const decideProposal = useCallback(
    (id: ID, decision: 'approved' | 'changes_requested' | 'declined', note?: string, reason?: string) => {
      const s = stateRef.current;
      const p = s.proposals.find((x) => x.id === id)!;
      const at = nowIso();
      const meId = 'u-layla';
      const label =
        decision === 'approved'
          ? 'approved the proposal'
          : decision === 'declined'
            ? `declined the proposal${reason ? ` (${reason.toLowerCase()})` : ''}`
            : 'requested changes to the proposal';
      const reqStatus: RequestStatus = decision;
      set((st) => ({
        proposals: st.proposals.map((x) => (x.id === id ? { ...x, status: decision, decision: { by: meId, at, note, reason } } : x)),
        requests: patchRequest(st, p.requestId, (r) => ({
          ...r,
          status: reqStatus,
          updatedAt: at,
          nextStep:
            decision === 'approved'
              ? { label: 'Kick-off with Spark', date: addDays(at.slice(0, 10), 3) }
              : decision === 'changes_requested'
                ? { label: 'Spark sends a revised proposal', date: addDays(at.slice(0, 10), 4) }
                : undefined,
          activity: [...r.activity, activity(meId, 'decision', note ? `${label}: "${note}"` : label)],
        })),
        notifications: notify(st, {
          audience: 'spark',
          title: `Brand Co. ${decision === 'approved' ? 'approved' : decision === 'declined' ? 'declined' : 'requested changes on'} the proposal`,
          body: p.title,
          route: `/spark/requests/${p.requestId}`,
          kind: 'decision',
        }),
      }));
    },
    [set],
  );

  const commentOnProposal = useCallback(
    (id: ID, text: string, section?: string, by?: ID) => {
      // The client comments by default; the Spark team view passes its own person.
      const meId = by ?? 'u-layla';
      set((s) => ({
        proposals: s.proposals.map((p) =>
          p.id === id ? { ...p, comments: [...p.comments, { id: uid('pc'), by: meId, at: nowIso(), text, section }] } : p,
        ),
      }));
    },
    [set],
  );

  // ---- Documents ------------------------------------------------------------

  const uploadFiles = useCallback(
    (files: { name: string; sizeKb: number }[], folderId: ID) => {
      const meId = 'u-layla';
      const at = nowIso();
      const docs: Doc[] = files.map((f) => ({
        id: uid('d'),
        name: f.name,
        kind: kindOf(f.name),
        folderId,
        sizeKb: f.sizeKb,
        uploadedBy: meId,
        uploadedAt: at,
        preview: { type: 'none' },
      }));
      set((s) => ({
        docs: [...docs, ...s.docs],
        notifications: notify(s, {
          audience: 'spark',
          title: `${files.length === 1 ? files[0].name : `${files.length} files`} shared`,
          body: s.folders.find((f) => f.id === folderId)?.name ?? '',
          route: `/documents/${folderId}`,
          kind: 'file',
        }),
      }));
      return docs.map((d) => d.id);
    },
    [set],
  );

  /** Comment on a file Spark shared for review, and optionally decide:
   *  approve it or request changes ("share folders, approvals", 8 Oct). */
  const reviewDoc = useCallback(
    (docId: ID, decision: 'approved' | 'changes_requested' | null, text: string) => {
      const meId = 'u-layla';
      const at = nowIso();
      const doc = stateRef.current.docs.find((d) => d.id === docId);
      if (!doc?.review) return;
      const verb = decision === 'approved' ? 'approved' : decision === 'changes_requested' ? 'requested changes on' : 'commented on';
      set((s) => ({
        docs: s.docs.map((d) =>
          d.id === docId && d.review
            ? {
                ...d,
                review: {
                  ...d.review,
                  status: decision ?? d.review.status,
                  decision: decision ? { by: meId, at } : d.review.decision,
                  feedback: text ? [...d.review.feedback, { id: uid('fb'), by: meId, at, text }] : d.review.feedback,
                },
              }
            : d,
        ),
        requests: doc.requestId
          ? patchRequest(s, doc.requestId, (r) => ({
              ...r,
              updatedAt: at,
              nextStep:
                decision === 'approved'
                  ? { label: 'Spark moves to the next stage', date: addDays(at.slice(0, 10), 7) }
                  : decision === 'changes_requested'
                    ? { label: 'Spark sends a revised version', date: addDays(at.slice(0, 10), 5) }
                    : r.nextStep,
              activity: [...r.activity, activity(meId, decision ? 'decision' : 'comment', `${verb} ${doc.name}${text ? `: "${text}"` : ''}`)],
            }))
          : s.requests,
        notifications: notify(s, {
          audience: 'spark',
          title: `Brand Co. ${verb} a file`,
          body: doc.name,
          route: `/documents/${doc.folderId}?doc=${docId}`,
          kind: 'file',
        }),
      }));
    },
    [set],
  );

  // ---- Team -------------------------------------------------------------

  const invite = useCallback(
    (emails: string[], role: ClientRole, message?: string) => {
      const at = nowIso();
      set((s) => ({
        invitations: [
          ...emails.map((email) => ({ id: uid('inv'), email, role, invitedBy: 'u-layla', invitedAt: at, message })),
          ...s.invitations,
        ],
      }));
    },
    [set],
  );

  const revokeInvite = useCallback((id: ID) => set((s) => ({ invitations: s.invitations.filter((i) => i.id !== id) })), [set]);
  const resendInvite = useCallback(
    (id: ID) => set((s) => ({ invitations: s.invitations.map((i) => (i.id === id ? { ...i, invitedAt: nowIso() } : i)) })),
    [set],
  );
  const changeRole = useCallback(
    (personId: ID, role: ClientRole) => set((s) => ({ people: s.people.map((p) => (p.id === personId ? { ...p, role } : p)) })),
    [set],
  );
  const removeMember = useCallback((personId: ID) => set((s) => ({ people: s.people.filter((p) => p.id !== personId) })), [set]);

  // ---- Notifications & settings -------------------------------------------

  const markRead = useCallback(
    (id: ID) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
    [set],
  );
  const markAllRead = useCallback(
    (audience: 'client' | 'spark' = 'client') => set((s) => ({ notifications: s.notifications.map((n) => (n.audience === audience ? { ...n, read: true } : n)) })),
    [set],
  );
  const setPref = useCallback(
    (key: NotifKey, channel: 'inApp' | 'email', value: boolean) =>
      set((s) => ({ prefs: { ...s.prefs, [key]: { ...s.prefs[key], [channel]: value } } })),
    [set],
  );

  const setRequestLayout = useCallback((requestLayout: RequestLayout) => set(() => ({ requestLayout })), [set]);
  const signOut = useCallback(() => set(() => ({ signedIn: false })), [set]);
  const signIn = useCallback(() => set(() => ({ signedIn: true })), [set]);
  const setTheme = useCallback((theme: Theme) => set(() => ({ theme })), [set]);
  const setWeb = useCallback((web: boolean) => set(() => ({ web })), [set]);
  const setFailNext = useCallback((failNext: boolean) => set(() => ({ failNext })), [set]);
  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setState({ ...initial(), theme: stateRef.current.theme });
  }, []);

  return {
    state,
    me,
    actions: {
      ask,
      retry,
      deleteConversation,
      renameConversation,
      toggleVisualLike,
      createRequest,
      commentOnRequest,
      updateBrief,
      sparkMessage,
      clientMessage,
      setRequestStatus,
      setRequestOwner,
      saveProposalDraft,
      clearProposalDraft,
      startSparkDraft,
      saveSparkDraft,
      discardSparkDraft,
      sendProposal,
      decideProposal,
      commentOnProposal,
      uploadFiles,
      reviewDoc,
      invite,
      revokeInvite,
      resendInvite,
      changeRole,
      removeMember,
      markRead,
      markAllRead,
      setPref,
      setTheme,
      signOut,
      setRequestLayout,
      signIn,
      setWeb,
      setFailNext,
      reset,
    },
  };
}

type Store = ReturnType<typeof useStoreValue>;
const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore outside StoreProvider');
  return ctx;
}

// ---- Selectors ----------------------------------------------------------------

// The client sees Spark as one team, not individuals: they don't know who
// picks up their work, so anyone on Spark's side is shown as "Spark".
export const personById = (s: State, id: ID): Person => {
  const p = s.people.find((x) => x.id === id);
  if (!p) return { id, name: 'Former member', email: '', title: '', org: 'client', hue: 0 };
  return p.org === 'spark' ? { ...p, name: 'Spark', title: 'Spark Studios', email: '' } : p;
};

export const proposalsFor = (s: State, requestId: ID) =>
  s.proposals.filter((p) => p.requestId === requestId).sort((a, b) => a.version - b.version);

export const latestProposal = (s: State, requestId: ID) => {
  const list = proposalsFor(s, requestId);
  return list[list.length - 1];
};

export const proposalTotal = (p: Proposal) => p.investment.reduce((a, b) => a + b.amount, 0);
export const proposalWeeks = (p: Proposal) => p.phases.reduce((a, b) => a + b.weeks, 0);

export const canApprove = (me: Person) => me.org === 'client' && me.role === 'owner';

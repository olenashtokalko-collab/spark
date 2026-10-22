// Prototype-only page (#/demo/home): other ways the home page (today: the new chat) could look.
// Client feedback of 22 Oct: the start page looks like ChatGPT; Spark doesn't want to read as a
// generic chat. Suggested: a quick-access section with what the person touched last and its status
// (e.g. the latest request), so they can pick up where they left off. Real data from the store;
// cards open the real pages; the box starts a real chat.
import { useState, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, CalendarDays, CircleAlert, Clock, FileText, Inbox, Lightbulb, MessageSquare, MessageSquareQuote, Palette, Paperclip, Plus, ShieldCheck, Sparkles, TrendingUp, UsersRound, X } from 'lucide-react';
import { useStore } from '../../state/store';
import { navigate, useRoute } from '../../lib/router';
import { suggestedPrompts } from '../../data/assistant';
import { Button, PageHeader, cx } from '../../components/ui/primitives';
import { NeedsYou, RequestStatus, STAGES, isOpen, requestStatusMeta, stageIndex } from '../../components/domain';
import { fmtDate, fmtRelative } from '../../lib/format';
import { Composer } from '../assistant/Composer';
import { TYPE_ICON } from '../requests/CreateRequestDialog';
import { useUI } from '../../state/ui';
import type { Attachment, WorkRequest } from '../../data/types';

const requestStatusLabel = (st: keyof typeof requestStatusMeta) => requestStatusMeta[st].label;

type Variant = 'linked' | 'pickup' | 'dash' | 'glow' | 'split' | 'status' | 'board' | 'agenda' | 'next' | 'pulse' | 'continue';
const VARIANTS: { v: Variant; label: string; note: string }[] = [
  {
    v: 'linked',
    label: 'K · Linked figures',
    note: 'The home page as it is now, with the three figures tied to the language of the tables: the amber attention mark for what waits on you, status dots for what’s with Spark, a file icon for files. Pick a version of the figures below.',
  },
  {
    v: 'pickup',
    label: 'A · Pick up where you left off',
    note: 'The brief as asked: a small greeting and the box at the top, then one row of cards for what you touched last, each with its status (what needs you, the latest request, the last chat, a file to approve). Prompts sit under the cards, not round the box.',
  },
  {
    v: 'dash',
    label: 'I · Dashboard + recent',
    note: 'A and C together: a small greeting with the three numbers you act on (needs your decision, in progress, files to approve) right under it; then the box with its prompts; then the four things you touched last as plain rows: a request with its type’s icon, “Request · type” and its status; a chat with what was asked in it; hairlines between, no cards.',
  },
  {
    v: 'glow',
    label: 'J · Colour to Sand',
    note: 'I on the brand’s colour: the top of the page is the Cobalt-to-Ember haze (as the sign-in panel), so the dashboard can be frosted glass and the box and prompts sit on colour. Lower down the colour fades into Sand, and Recent reads on a calm ground.',
  },
  {
    v: 'split',
    label: 'B · Workspace',
    note: 'Two columns. Left: “Ask Spark” as a contained card in the brand spectrum, with the prompts. Right: “Your work”, the open requests with their status and next date, files waiting for you and recent chats. Reads as a workspace, not a chat.',
  },
  {
    v: 'status',
    label: 'C · Status first',
    note: 'Three numbers you act on (needs you, in progress, files to approve) open their lists; under them, the latest activity from Spark. The chat is one slim bar at the foot of the page.',
  },
  {
    v: 'board',
    label: 'D · Board',
    note: 'One “What do you want to work on?” box with modes (ask, request, find a file), then the requests on three columns: needs you, in progress, done. Closest to how an agency client thinks about the work.',
  },
  {
    v: 'agenda',
    label: 'E · This week',
    note: 'A plan, not a chat: everything with a date (decisions, feedback, files to approve, what Spark delivers next) on one timeline, what waits on you marked. “Ask Spark” sits beside it as a card.',
  },
  {
    v: 'next',
    label: 'F · Next up',
    note: 'One thing first: the most urgent item as a large card with its actions (review, ask Spark about it). The rest of what you touched last follows as a strip; the box is small and comes after.',
  },
  {
    v: 'pulse',
    label: 'G · Brand pulse',
    note: 'The home is about the brand: this week’s numbers from Spark’s digest and what’s moving, then your recent items with status. No chat on the page: “Ask Spark” opens it as a side panel.',
  },
  {
    v: 'continue',
    label: 'H · Continue',
    note: 'A “continue” row of recent items, each with where it stands on the way to delivery (six steps, as on a request). A compact box above it, no greeting, no orb.',
  },
];

const CHIP_ICON: Record<string, typeof Lightbulb> = {
  'Explore an idea': Lightbulb,
  'Run a background check': ShieldCheck,
  'Explore public feedback': MessageSquareQuote,
  'Understand your audience': UsersRound,
  'Explore a look': Palette,
};

const onYou = (r: WorkRequest) => r.status === 'proposal' || !!(r.nextStep?.onClient && isOpen(r.status));

/** What every variant needs: the person's work, newest first. */
function useWork() {
  const { state, me, actions } = useStore();
  const byDate = <T extends { updatedAt: string }>(a: T, b: T) => b.updatedAt.localeCompare(a.updatedAt);
  const requests = [...state.requests].sort(byDate);
  const needYou = requests.filter(onYou);
  const active = requests.filter((r) => isOpen(r.status) && !onYou(r));
  const done = requests.filter((r) => !isOpen(r.status));
  const toApprove = state.docs.filter((d) => d.review?.status === 'open');
  const chats = [...state.conversations].sort(byDate).filter((c) => c.messages.length > 0);
  const news = state.notifications.filter((n) => n.audience === 'client').sort((a, b) => b.at.localeCompare(a.at));
  const ask = (text: string, attachments: Attachment[] = []) => {
    const id = actions.ask(null, text, { attachments });
    navigate(`/assistant/${id}`);
  };
  return { me, requests, needYou, active, done, toApprove, chats, news, ask };
}

/** A mono, tracked label in Ember, as the brand book's section labels. */
function Label({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <div className="hd-label">
      {children}
      {count !== undefined && <span>{count}</span>}
    </div>
  );
}

function Prompts({ onPick, quiet }: { onPick: (p: string) => void; quiet?: boolean }) {
  return (
    <div className={cx('hd-prompts', quiet && 'hd-prompts--quiet')}>
      {suggestedPrompts.map((p) => {
        const I = CHIP_ICON[p.label] ?? Sparkles;
        return (
          <button key={p.label} className="hd-prompt" onClick={() => onPick(p.prompt)} title={p.prompt}>
            <I size={15} strokeWidth={1.7} />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

/** A request on one line: icon, title, status, when. */
function RequestRow({ r }: { r: WorkRequest }) {
  const I = TYPE_ICON[r.type] ?? FileText;
  return (
    <a className="hd-row" href={`#/requests/${r.id}`}>
      <span className="hd-row__icon">
        <I size={15} strokeWidth={1.7} />
      </span>
      <span className="hd-row__main">
        <span className="hd-row__title">{r.title}</span>
        <span className="hd-row__sub">{r.nextStep ? `${r.nextStep.label} · ${fmtDate(r.nextStep.date)}` : `Updated ${fmtRelative(r.updatedAt)}`}</span>
      </span>
      <RequestStatus status={r.status} onClient={r.nextStep?.onClient} />
    </a>
  );
}

// ---- A · Pick up where you left off ---------------------------------------------------------

type PickLook = 'rows' | 'two' | 'tabs' | 'chips' | 'cards';
const PICK_LOOKS: { v: PickLook; label: string }[] = [
  { v: 'rows', label: 'List' },
  { v: 'two', label: 'Waiting on you · Recent' },
  { v: 'tabs', label: 'Tabs' },
  { v: 'chips', label: 'Compact pills' },
  { v: 'cards', label: 'Cards (before)' },
];

interface PickItem {
  key: string;
  kind: 'request' | 'chat' | 'file';
  label: string;
  title: string;
  status?: ReactNode;
  meta: string;
  href: string;
  you?: boolean;
}

/** What the person touched last, as one list: what waits on them first, then the rest by date. */
function usePickItems(): PickItem[] {
  const w = useWork();
  const reqs: PickItem[] = w.requests.slice(0, 4).map((r) => ({
    key: r.id,
    kind: 'request',
    label: onYou(r) ? 'Needs you' : 'Request',
    title: r.title,
    status: <RequestStatus status={r.status} onClient={r.nextStep?.onClient} />,
    meta: r.nextStep && isOpen(r.status) ? `${r.nextStep.label} · ${fmtDate(r.nextStep.date)}` : `Updated ${fmtRelative(r.updatedAt)}`,
    href: `#/requests/${r.id}`,
    you: onYou(r),
  }));
  const files: PickItem[] = w.toApprove.slice(0, 1).map((d) => ({
    key: d.id,
    kind: 'file',
    label: 'Needs you',
    title: d.name,
    status: (
      <span className="rstatus rstatus--you">
        <span className="rstatus__dot" />
        Needs approval
      </span>
    ),
    meta: `Due ${fmtDate(d.review!.due)}`,
    href: `#/documents/${d.folderId}?doc=${d.id}`,
    you: true,
  }));
  const chats: PickItem[] = w.chats.slice(0, 2).map((c) => ({
    key: c.id,
    kind: 'chat',
    label: 'Chat',
    title: c.title,
    meta: fmtRelative(c.updatedAt),
    href: `#/assistant/${c.id}`,
  }));
  const all = [...reqs, ...files, ...chats];
  return [...all.filter((i) => i.you), ...all.filter((i) => !i.you)];
}

function PickRow({ i }: { i: PickItem }) {
  const I = i.kind === 'chat' ? MessageSquare : i.kind === 'file' ? FileText : Inbox;
  return (
    <a className={cx('hd-prow', i.you && 'is-you')} href={i.href}>
      <span className="hd-row__icon">
        <I size={15} strokeWidth={1.7} />
      </span>
      <span className="hd-row__main">
        <span className="hd-row__title">{i.title}</span>
        <span className="hd-row__sub">{i.meta}</span>
      </span>
      {i.status ?? <span className="hd-prow__open">Continue</span>}
      <ArrowRight size={15} className="hd-prow__go" />
    </a>
  );
}

function PickupList({ look }: { look: Exclude<PickLook, 'cards'> }) {
  const items = usePickItems();
  const [tab, setTab] = useState<'all' | PickItem['kind']>('all');

  if (look === 'two')
    return (
      <div className="hd-section hd-two">
        <section>
          <Label count={items.filter((i) => i.you).length}>Waiting on you</Label>
          <div className="hd-plist">
            {items
              .filter((i) => i.you)
              .map((i) => (
                <PickRow key={i.key} i={i} />
              ))}
          </div>
        </section>
        <section>
          <Label>Recently</Label>
          <div className="hd-plist">
            {items
              .filter((i) => !i.you)
              .map((i) => (
                <PickRow key={i.key} i={i} />
              ))}
          </div>
        </section>
      </div>
    );

  if (look === 'tabs') {
    const tabs: [typeof tab, string][] = [
      ['all', 'All'],
      ['request', 'Requests'],
      ['chat', 'Chats'],
      ['file', 'Files'],
    ];
    const shown = items.filter((i) => tab === 'all' || i.kind === tab);
    return (
      <div className="hd-section">
        <div className="hd-tabsrow">
          <Label>Pick up where you left off</Label>
          <div className="rq-tabs" role="tablist">
            {tabs.map(([v, l]) => (
              <button key={v} role="tab" aria-selected={tab === v} className={cx(tab === v && 'is-on')} onClick={() => setTab(v)}>
                {l}
                <span>{items.filter((i) => v === 'all' || i.kind === v).length}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="hd-plist">
          {shown.map((i) => (
            <PickRow key={i.key} i={i} />
          ))}
        </div>
      </div>
    );
  }

  if (look === 'chips')
    return (
      <div className="hd-section">
        <Label>Pick up where you left off</Label>
        <div className="hd-pills">
          {items.map((i) => (
            <a key={i.key} className={cx('hd-pill', i.you && 'is-you')} href={i.href}>
              <span className="hd-pill__title">{i.title}</span>
              <span className="hd-pill__state">{i.status ?? <span className="hd-prow__open">Continue chat</span>}</span>
              <ArrowRight size={14} />
            </a>
          ))}
        </div>
      </div>
    );

  return (
    <div className="hd-section">
      <Label>Pick up where you left off</Label>
      <div className="hd-plist">
        {items.map((i) => (
          <PickRow key={i.key} i={i} />
        ))}
      </div>
    </div>
  );
}

function Pickup({ look = 'rows' }: { look?: PickLook }) {
  const w = useWork();
  const decision = w.needYou[0];
  // The latest request other than the one already shown as needing you.
  const latest = w.requests.find((r) => r.id !== decision?.id);
  const chat = w.chats[0];
  const file = w.toApprove[0];
  return (
    <div className="hd hd--pickup">
      <div className="hd-pickup__head">
        <h1 className="hd-title">Good to see you, {w.me.name.split(' ')[0]}</h1>
        <p className="hd-sub">Ask Spark anything about your brand, or pick up where you left off.</p>
      </div>
      {/* The prompts right under the box, where you start a chat. */}
      <div className="hd-askbox">
        <Composer onSubmit={w.ask} placeholder="Ask about your brand, market or audience" />
        <Prompts onPick={w.ask} quiet />
      </div>

      {look === 'cards' ? (
        <div className="hd-section">
        <Label>Pick up where you left off</Label>
        <div className="hd-cards">
          {decision && (
            <a className="hd-card hd-card--you" href={`#/requests/${decision.id}`}>
              <span className="hd-card__kind">
                <Inbox size={14} /> Needs you
              </span>
              <b className="hd-card__title">{decision.title}</b>
              <RequestStatus status={decision.status} onClient={decision.nextStep?.onClient} />
              {decision.nextStep && (
                <span className="hd-card__meta">
                  <Clock size={13} /> {decision.nextStep.label} · {fmtDate(decision.nextStep.date)}
                </span>
              )}
            </a>
          )}
          {latest && (
            <a className="hd-card" href={`#/requests/${latest.id}`}>
              <span className="hd-card__kind">
                <FileText size={14} /> Latest request
              </span>
              <b className="hd-card__title">{latest.title}</b>
              <RequestStatus status={latest.status} onClient={latest.nextStep?.onClient} />
              <span className="hd-card__meta">Updated {fmtRelative(latest.updatedAt)}</span>
            </a>
          )}
          {chat && (
            <a className="hd-card" href={`#/assistant/${chat.id}`}>
              <span className="hd-card__kind">
                <MessageSquare size={14} /> Last chat
              </span>
              <b className="hd-card__title">{chat.title}</b>
              <span className="hd-card__meta">
                {chat.messages.length} messages · {fmtRelative(chat.updatedAt)}
              </span>
              <span className="hd-card__go">
                Continue <ArrowRight size={13} />
              </span>
            </a>
          )}
          {file && (
            <a className="hd-card" href={`#/documents/${file.folderId}?doc=${file.id}`}>
              <span className="hd-card__kind">
                <FileText size={14} /> To approve
              </span>
              <b className="hd-card__title">{file.name}</b>
              <span className="rstatus rstatus--you">
                <span className="rstatus__dot" />
                Needs approval
              </span>
              <span className="hd-card__meta">Due {fmtDate(file.review!.due)}</span>
            </a>
          )}
        </div>
      </div>

      ) : (
        <PickupList look={look} />
      )}

    </div>
  );
}

// ---- I · Dashboard + recent ---------------------------------------------------------------------

// The dashboard's numbers, after the brand book V3 (Oct 2026).
type TileLook = 'cards' | 'blocks' | 'steps' | 'glass' | 'band' | 'mono';
const TILE_LOOKS: { v: TileLook; label: string }[] = [
  { v: 'cards', label: 'White cards (now)' },
  { v: 'blocks', label: 'Colour blocks (p. 30)' },
  { v: 'steps', label: 'Three steps (p. 10)' },
  { v: 'glass', label: 'Frosted glass (p. 33)' },
  { v: 'band', label: 'Ink band' },
  { v: 'mono', label: 'Figures, no boxes' },
];
interface Tile {
  n: number;
  label: string;
  href: string;
  tone: string;
}
// Short mono labels in the brand book's manner ("01 · DECIDE").
const TILE_TAG: Record<string, string> = { you: 'Decide', progress: 'With Spark', files: 'Approve' };

function DashTiles({ tiles, look }: { tiles: Tile[]; look: TileLook }) {
  if (look === 'cards')
    return (
      <div className="hd-tiles hd-dash__tiles">
        {tiles.map((t) => (
          <a key={t.label} className={cx('hd-tile', `hd-tile--${t.tone}`)} href={t.href}>
            <span className="hd-tile__n">{t.n}</span>
            <span className="hd-tile__label">
              {t.label} <ArrowRight size={14} />
            </span>
          </a>
        ))}
      </div>
    );
  return (
    <div className={cx('bt', `bt--${look}`)}>
      {tiles.map((t, i) => (
        <a key={t.label} className={cx('bt__tile', `bt__tile--${t.tone}`)} href={t.href}>
          <span className="bt__tag">
            0{i + 1} · {TILE_TAG[t.tone]}
          </span>
          <span className="bt__n">{t.n}</span>
          <span className="bt__label">
            {t.label}
            <ArrowRight size={14} />
          </span>
        </a>
      ))}
    </div>
  );
}

function Dash({ look = 'cards', glow }: { look?: TileLook; glow?: boolean }) {
  const w = useWork();
  const tiles = [
    { n: w.needYou.length, label: 'Need your decision', href: '#/requests', tone: 'you' },
    { n: w.active.length, label: 'In progress with Spark', href: '#/requests', tone: 'progress' },
    { n: w.toApprove.length, label: 'Files to approve', href: '#/documents', tone: 'files' },
  ];
  // The four things touched last. A request shows its type's icon and "Request · type"; a chat shows
  // what was asked in it; a file to approve shows its due date.
  const recent = [
    ...w.requests.map((r) => ({
      key: r.id,
      icon: TYPE_ICON[r.type] ?? FileText,
      title: r.title,
      sub: `Request · ${r.type}`,
      status: <RequestStatus status={r.status} /> as ReactNode,
      mark: <NeedsYou request={r} /> as ReactNode,
      when: r.updatedAt,
      href: `#/requests/${r.id}`,
    })),
    ...w.toApprove.map((d) => ({
      key: d.id,
      icon: Paperclip,
      title: d.name,
      sub: `File · due ${fmtDate(d.review!.due)}`,
      status: (
        <span className="rstatus rstatus--you">
          <span className="rstatus__dot" />
          Needs approval
        </span>
      ) as ReactNode,
      mark: (
        <span className="needs-you" title="Needs your approval" aria-label="Needs your approval" role="img">
          <CircleAlert size={15} strokeWidth={2.2} />
        </span>
      ) as ReactNode,
      when: d.uploadedAt,
      href: `#/documents/${d.folderId}?doc=${d.id}`,
    })),
    ...w.chats.map((c) => ({
      key: c.id,
      icon: MessageSquare,
      title: c.title,
      sub: c.messages.find((m) => m.role === 'user')?.text ?? 'Chat',
      status: null as ReactNode,
      mark: null as ReactNode,
      when: c.updatedAt,
      href: `#/assistant/${c.id}`,
    })),
  ]
    .sort((a, b) => b.when.localeCompare(a.when))
    .slice(0, 4);
  return (
    <div className={cx('hd hd--dash', glow && 'hd--glow')}>
      {glow && <span className="hd-glow__grain" aria-hidden />}
      <div className="hd-pickup__head">
        <h1 className="hd-title">Good to see you, {w.me.name.split(' ')[0]}</h1>
        <p className="hd-sub">Here’s where your work with Spark stands.</p>
      </div>
      <DashTiles tiles={tiles} look={look} />
      {/* A clear gap, then the chat with its prompts, then what you touched last. */}
      <div className="hd-askbox hd-dash__ask">
        <Composer onSubmit={w.ask} placeholder="Ask about your brand, market or audience" />
        <Prompts onPick={w.ask} quiet />
      </div>
      <div className="hd-section">
        <Label>Recent</Label>
        {/* As on the home page: the type's icon (or a chat's), the title, the attention mark, an arrow on hover. */}
        <div className="home-recent">
          {recent.map((i) => (
            <a key={i.key} className="home-recent__row" href={i.href}>
              <i.icon size={15} strokeWidth={1.7} className="home-recent__icon" aria-hidden />
              <span className="rq-row3__name">
                <span className="rq-row3__title">{i.title}</span>
                {i.mark}
              </span>
              <ArrowRight size={15} className="home-recent__go" aria-hidden />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- B · Workspace ------------------------------------------------------------------------------

function Split() {
  const w = useWork();
  const { openRequest } = useUI();
  return (
    <div className="hd hd--split">
      <section className="hd-ask">
        <span className="hd-ask__label">Ask Spark</span>
        <h1 className="hd-ask__title">What do you want to know about your brand today?</h1>
        <Composer onSubmit={w.ask} placeholder="Ask about your brand, market or audience" />
        <Prompts onPick={w.ask} />
      </section>
      <section className="hd-work">
        <div className="hd-work__head">
          <Label count={w.needYou.length + w.active.length}>Your work</Label>
          <button className="hd-link" onClick={() => openRequest()}>
            <Plus size={14} /> New request
          </button>
        </div>
        <div className="hd-rows">
          {[...w.needYou, ...w.active].slice(0, 5).map((r) => (
            <RequestRow key={r.id} r={r} />
          ))}
        </div>
        {w.toApprove.length > 0 && (
          <>
            <Label count={w.toApprove.length}>Files to approve</Label>
            <div className="hd-rows">
              {w.toApprove.slice(0, 2).map((d) => (
                <a key={d.id} className="hd-row" href={`#/documents/${d.folderId}?doc=${d.id}`}>
                  <span className="hd-row__icon">
                    <FileText size={15} strokeWidth={1.7} />
                  </span>
                  <span className="hd-row__main">
                    <span className="hd-row__title">{d.name}</span>
                    <span className="hd-row__sub">Due {fmtDate(d.review!.due)}</span>
                  </span>
                  <span className="rstatus rstatus--you">
                    <span className="rstatus__dot" />
                    Needs approval
                  </span>
                </a>
              ))}
            </div>
          </>
        )}
        <Label>Recent chats</Label>
        <div className="hd-rows">
          {w.chats.slice(0, 3).map((c) => (
            <a key={c.id} className="hd-row" href={`#/assistant/${c.id}`}>
              <span className="hd-row__icon">
                <MessageSquare size={15} strokeWidth={1.7} />
              </span>
              <span className="hd-row__main">
                <span className="hd-row__title">{c.title}</span>
                <span className="hd-row__sub">{fmtRelative(c.updatedAt)}</span>
              </span>
              <ArrowUpRight size={15} className="hd-row__go" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

// ---- C · Status first ---------------------------------------------------------------------------

function Status() {
  const w = useWork();
  const tiles = [
    { n: w.needYou.length, label: 'Need your decision', href: '#/requests', tone: 'you' },
    { n: w.active.length, label: 'In progress with Spark', href: '#/requests', tone: 'progress' },
    { n: w.toApprove.length, label: 'Files to approve', href: '#/documents', tone: 'files' },
  ];
  return (
    <div className="hd hd--status">
      <div className="hd-pickup__head">
        <h1 className="hd-title">Good to see you, {w.me.name.split(' ')[0]}</h1>
        <p className="hd-sub">Here’s where your work with Spark stands.</p>
      </div>
      <div className="hd-tiles">
        {tiles.map((t) => (
          <a key={t.label} className={cx('hd-tile', `hd-tile--${t.tone}`)} href={t.href}>
            <span className="hd-tile__n">{t.n}</span>
            <span className="hd-tile__label">
              {t.label} <ArrowRight size={14} />
            </span>
          </a>
        ))}
      </div>
      <div className="hd-section">
        <Label>Latest from Spark</Label>
        <ol className="hd-feed">
          {w.news.slice(0, 5).map((n) => (
            <li key={n.id}>
              <a href={`#${n.route}`}>
                <span className={cx('hd-feed__dot', !n.read && 'is-new')} />
                <span className="hd-feed__main">
                  <b>{n.title}</b>
                  <span>{n.body}</span>
                </span>
                <span className="hd-feed__when">{fmtRelative(n.at)}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
      <div className="hd-dock">
        <Composer onSubmit={w.ask} placeholder="Ask Spark about your brand, market or audience" />
      </div>
    </div>
  );
}

// ---- D · Board ----------------------------------------------------------------------------------

type Mode = 'ask' | 'request' | 'find';
function Board() {
  const w = useWork();
  const { openRequest } = useUI();
  const [mode, setMode] = useState<Mode>('ask');
  const cols = [
    { label: 'Needs you', list: w.needYou },
    { label: 'In progress', list: w.active },
    { label: 'Done', list: w.done },
  ];
  return (
    <div className="hd hd--board">
      <div className="hd-board__ask">
        <h1 className="hd-title">What do you want to work on?</h1>
        <div className="hd-modes" role="tablist" aria-label="Start with">
          {(
            [
              ['ask', 'Ask Spark AI', Sparkles],
              ['request', 'Request work', Plus],
              ['find', 'Find a file', FileText],
            ] as const
          ).map(([m, label, I]) => (
            <button key={m} role="tab" aria-selected={mode === m} className={cx(mode === m && 'is-on')} onClick={() => setMode(m)}>
              <I size={14} /> {label}
            </button>
          ))}
        </div>
        {mode === 'ask' && <Composer onSubmit={w.ask} placeholder="Ask about your brand, market or audience" />}
        {mode === 'request' && (
          <div className="hd-board__alt">
            <span>Tell Spark what you need: they come back with scope, price and timeline.</span>
            <Button variant="primary" icon={Plus} onClick={() => openRequest()}>
              New request
            </Button>
          </div>
        )}
        {mode === 'find' && (
          <div className="hd-board__alt">
            <span>Guidelines, strategy, proposals, creative and the files your team shares.</span>
            <Button variant="primary" icon={ArrowRight} onClick={() => navigate('/documents')}>
              Open Documents
            </Button>
          </div>
        )}
      </div>
      <div className="hd-cols">
        {cols.map((c) => (
          <section key={c.label} className="hd-col">
            <Label count={c.list.length}>{c.label}</Label>
            {c.list.slice(0, 3).map((r) => {
              const I = TYPE_ICON[r.type] ?? FileText;
              return (
                <a key={r.id} className="hd-bcard" href={`#/requests/${r.id}`}>
                  <span className="hd-bcard__type">
                    <I size={13} strokeWidth={1.8} /> {r.type}
                  </span>
                  <b>{r.title}</b>
                  <RequestStatus status={r.status} onClient={r.nextStep?.onClient} />
                  {r.nextStep && isOpen(r.status) && (
                    <span className="hd-card__meta">
                      <Clock size={13} /> {r.nextStep.label} · {fmtDate(r.nextStep.date)}
                    </span>
                  )}
                </a>
              );
            })}
            {c.list.length === 0 && <p className="hd-empty">Nothing here.</p>}
          </section>
        ))}
      </div>
    </div>
  );
}

// ---- E · This week ----------------------------------------------------------------------------

function Agenda() {
  const w = useWork();
  // Everything with a date: request next steps and files waiting for approval, soonest first.
  const items = [
    ...w.requests
      .filter((r) => r.nextStep && isOpen(r.status))
      .map((r) => ({ id: r.id, date: r.nextStep!.date, title: r.nextStep!.label, what: r.title, you: !!r.nextStep!.onClient || r.status === 'proposal', href: `#/requests/${r.id}` })),
    ...w.toApprove.map((d) => ({ id: d.id, date: d.review!.due, title: 'Approve the file', what: d.name, you: true, href: `#/documents/${d.folderId}?doc=${d.id}` })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div className="hd hd--agenda">
      <section className="hd-agenda">
        <div className="hd-pickup__head">
          <h1 className="hd-title">Your week with Spark</h1>
          <p className="hd-sub">What’s due, and what waits on you.</p>
        </div>
        <ol className="hd-tl">
          {items.map((i) => (
            <li key={i.id + i.title} className={cx(i.you && 'is-you')}>
              <span className="hd-tl__date">
                <b>{fmtDate(i.date).split(' ')[0]}</b>
                <span>{fmtDate(i.date).split(' ').slice(1).join(' ')}</span>
              </span>
              <a className="hd-tl__item" href={i.href}>
                <span className="hd-tl__who">{i.you ? 'On you' : 'Spark'}</span>
                <b>{i.title}</b>
                <span>{i.what}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>
      <aside className="hd-ask hd-ask--side">
        <span className="hd-ask__label">Ask Spark</span>
        <h2 className="hd-ask__title">Anything about your brand, market or audience.</h2>
        <Composer onSubmit={w.ask} placeholder="Ask Spark" />
        <Prompts onPick={w.ask} />
      </aside>
    </div>
  );
}

// ---- F · Next up --------------------------------------------------------------------------------

function NextUp() {
  const w = useWork();
  const top = w.needYou[0];
  const rest = [...w.needYou.slice(1), ...w.active].slice(0, 3);
  return (
    <div className="hd hd--next">
      <Label>Next up</Label>
      {top && (
        <section className="hd-hero">
          <div className="hd-hero__main">
            <RequestStatus status={top.status} onClient={top.nextStep?.onClient} />
            <h1 className="hd-hero__title">{top.title}</h1>
            <p className="hd-hero__line">
              {top.nextStep?.label}
              {top.nextStep && ` · by ${fmtDate(top.nextStep.date)}`}
            </p>
            <div className="hd-hero__acts">
              <Button variant="primary" icon={ArrowRight} onClick={() => navigate(`/requests/${top.id}`)}>
                Review the proposal
              </Button>
              <Button variant="secondary" icon={Sparkles} onClick={() => w.ask(`Help me decide on the proposal for “${top.title}”`)}>
                Ask Spark about it
              </Button>
            </div>
          </div>
          <div className="hd-hero__steps" aria-label="Stages">
            {STAGES.map((st, i) => (
              <span key={st} className={cx(i < stageIndex(top.status) && 'is-done', i === stageIndex(top.status) && 'is-now')}>
                {st}
              </span>
            ))}
          </div>
        </section>
      )}
      <div className="hd-section">
        <Label>Also on the go</Label>
        <div className="hd-cards">
          {rest.map((r) => (
            <a key={r.id} className="hd-card" href={`#/requests/${r.id}`}>
              <b className="hd-card__title">{r.title}</b>
              <RequestStatus status={r.status} onClient={r.nextStep?.onClient} />
              <span className="hd-card__meta">Updated {fmtRelative(r.updatedAt)}</span>
            </a>
          ))}
          {w.chats[0] && (
            <a className="hd-card" href={`#/assistant/${w.chats[0].id}`}>
              <span className="hd-card__kind">
                <MessageSquare size={14} /> Last chat
              </span>
              <b className="hd-card__title">{w.chats[0].title}</b>
              <span className="hd-card__go">
                Continue <ArrowRight size={13} />
              </span>
            </a>
          )}
        </div>
      </div>
      <div className="hd-section">
        <Label>Or ask something new</Label>
        <Composer onSubmit={w.ask} placeholder="Ask about your brand, market or audience" />
      </div>
    </div>
  );
}

// ---- G · Brand pulse ----------------------------------------------------------------------------

function Pulse() {
  const w = useWork();
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const digest = state.docs.find((d) => d.id === 'd-digest-w40');
  const stats = [
    { n: '+18%', label: 'Mentions this week', tone: 'up' },
    { n: '188', label: 'Delivery fee complaints', tone: 'warn' },
    { n: '72%', label: 'Of them negative', tone: 'warn' },
  ];
  return (
    <div className="hd hd--pulse">
      <div className="hd-pulse__head">
        <div>
          <span className="hd-ask__label">{state.brand.name} · this week</span>
          <h1 className="hd-title">The signature collection carries the talk. Delivery fees don’t.</h1>
        </div>
        <Button variant="primary" icon={Sparkles} onClick={() => setOpen(true)}>
          Ask Spark
        </Button>
      </div>
      <div className="hd-tiles">
        {stats.map((x) => (
          <div key={x.label} className={cx('hd-tile', `hd-tile--${x.tone}`)}>
            <span className="hd-tile__n">{x.n}</span>
            <span className="hd-tile__label">
              <TrendingUp size={14} /> {x.label}
            </span>
          </div>
        ))}
      </div>
      {digest && (
        <a className="hd-pulse__src" href={`#/documents/${digest.folderId}?doc=${digest.id}`}>
          From {digest.name.replace('.pdf', '')}, curated by Spark <ArrowUpRight size={13} />
        </a>
      )}
      <div className="hd-section">
        <Label>Your recent work</Label>
        <div className="hd-rows hd-rows--card">
          {[...w.needYou, ...w.active].slice(0, 4).map((r) => (
            <RequestRow key={r.id} r={r} />
          ))}
        </div>
      </div>
      {open && (
        <aside className="hd-drawer" aria-label="Ask Spark">
          <div className="hd-drawer__head">
            <span className="hd-ask__label">Ask Spark</span>
            <button className="hd-link" onClick={() => setOpen(false)} aria-label="Close">
              <X size={16} />
            </button>
          </div>
          <h2 className="hd-ask__title">What would you like to know?</h2>
          <Composer onSubmit={w.ask} placeholder="Ask about this week’s numbers" autoFocus />
          <Prompts onPick={w.ask} />
        </aside>
      )}
    </div>
  );
}

// ---- H · Continue -------------------------------------------------------------------------------

function Continue() {
  const w = useWork();
  return (
    <div className="hd hd--continue">
      <div className="hd-continue__ask">
        <Composer onSubmit={w.ask} placeholder="Ask Spark about your brand, market or audience" />
        <Prompts onPick={w.ask} quiet />
      </div>
      <div className="hd-section">
        <Label>Continue</Label>
        <div className="hd-strip">
          {w.requests.slice(0, 5).map((r) => {
            const at = stageIndex(r.status);
            return (
              <a key={r.id} className={cx('hd-ccard', onYou(r) && 'is-you')} href={`#/requests/${r.id}`}>
                <span className="hd-card__kind">
                  <CalendarDays size={13} /> {fmtRelative(r.updatedAt)}
                </span>
                <b className="hd-card__title">{r.title}</b>
                <RequestStatus status={r.status} onClient={r.nextStep?.onClient} />
                {/* Where it stands on the way to delivery: the six request stages. */}
                <span className="hd-progress" aria-label={`Stage ${at + 1} of ${STAGES.length}: ${STAGES[at]}`}>
                  {STAGES.map((st, i) => (
                    <span key={st} className={cx(i <= at && 'is-on', r.status === 'declined' && 'is-off')} />
                  ))}
                </span>
                <span className="hd-card__meta">
                  {STAGES[at]} · step {at + 1} of {STAGES.length}
                </span>
              </a>
            );
          })}
        </div>
      </div>
      <div className="hd-section">
        <Label>Recent chats</Label>
        <div className="hd-strip">
          {w.chats.slice(0, 4).map((c) => (
            <a key={c.id} className="hd-ccard hd-ccard--chat" href={`#/assistant/${c.id}`}>
              <MessageSquare size={16} />
              <b className="hd-card__title">{c.title}</b>
              <span className="hd-card__meta">{fmtRelative(c.updatedAt)}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- K · Linked figures --------------------------------------------------------------------------

type FigLook = 'now' | 'a' | 'b' | 'd';
const FIG_LOOKS: { v: FigLook; label: string }[] = [
  { v: 'now', label: 'Now: coloured numbers' },
  { v: 'a', label: 'A · Ink numbers, marks' },
  { v: 'b', label: 'B · On you / With Spark' },
  { v: 'd', label: 'D · Only what needs you' },
];

/** The amber attention mark of the tables. */
const Attn = () => (
  <span className="needs-you" aria-hidden>
    <CircleAlert size={15} strokeWidth={2.2} />
  </span>
);
/** A file with the attention mark tucked on its corner. */
const FileAttn = () => (
  <span className="lf-file" aria-hidden>
    <FileText size={15} strokeWidth={1.8} />
    <span className="lf-file__dot" />
  </span>
);
/** The status dots a figure counts, as in the tables. */
const Dots = ({ statuses }: { statuses: string[] }) => (
  <span className="lf-dots" aria-hidden>
    {statuses.map((st) => (
      <span key={st} className={`rstatus rstatus--${st}`}>
        <span className="rstatus__dot" />
      </span>
    ))}
  </span>
);

function LinkedFigures({ look }: { look: FigLook }) {
  const w = useWork();
  const withSpark = w.active;
  const byStatus = (['submitted', 'in_review', 'changes_requested', 'approved', 'in_progress'] as const)
    .map((st) => ({ st, n: withSpark.filter((r) => r.status === st).length }))
    .filter((x) => x.n > 0);

  if (look === 'now')
    return (
      <div className="bt bt--mono home__figures">
        {[
          { n: w.needYou.length, label: 'Need your decision', tone: 'you', href: '#/requests' },
          { n: withSpark.length, label: 'In progress with Spark', tone: 'progress', href: '#/requests' },
          { n: w.toApprove.length, label: 'Files to approve', tone: 'files', href: '#/documents' },
        ].map((t) => (
          <a key={t.label} className={cx('bt__tile', `bt__tile--${t.tone}`)} href={t.href}>
            <span className="bt__n">{t.n}</span>
            <span className="bt__label">
              {t.label}
              <ArrowRight size={14} />
            </span>
          </a>
        ))}
      </div>
    );

  if (look === 'a')
    return (
      <div className="bt bt--mono home__figures lf">
        <a className="bt__tile" href="#/requests">
          <span className="bt__n">{w.needYou.length}</span>
          <span className="bt__label">
            <Attn /> Need your decision <ArrowRight size={14} />
          </span>
        </a>
        <a className="bt__tile" href="#/requests">
          <span className="bt__n">{withSpark.length}</span>
          <span className="bt__label">
            <Dots statuses={byStatus.map((x) => x.st)} /> With Spark <ArrowRight size={14} />
          </span>
        </a>
        <a className="bt__tile" href="#/documents">
          <span className="bt__n">{w.toApprove.length}</span>
          <span className="bt__label">
            <FileAttn /> Files to approve <ArrowRight size={14} />
          </span>
        </a>
      </div>
    );

  if (look === 'b')
    return (
      <div className="lf-groups home__figures">
        <section className="lf-group">
          <span className="lf-group__head">
            <Attn /> Waiting on you
          </span>
          <div className="lf-group__row">
            <a className="lf-fig" href="#/requests">
              <span className="bt__n">{w.needYou.length}</span>
              <span className="bt__label">
                Decisions <ArrowRight size={14} />
              </span>
            </a>
            <a className="lf-fig" href="#/documents">
              <span className="bt__n">{w.toApprove.length}</span>
              <span className="bt__label">
                <FileText size={14} strokeWidth={1.8} /> Files to approve <ArrowRight size={14} />
              </span>
            </a>
          </div>
        </section>
        <section className="lf-group">
          <span className="lf-group__head">With Spark</span>
          <div className="lf-group__row">
            <a className="lf-fig" href="#/requests">
              <span className="bt__n">{withSpark.length}</span>
              <span className="bt__label">
                Requests in work <ArrowRight size={14} />
              </span>
            </a>
            <div className="lf-break">
              {(byStatus.length ? byStatus : [{ st: 'in_progress' as const, n: 0 }]).map((x) => (
                <span key={x.st} className={`rstatus rstatus--${x.st}`}>
                  <span className="rstatus__dot" />
                  {x.n} {requestStatusLabel(x.st)}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    );

  return (
    <div className="bt bt--mono home__figures lf lf--two">
      <a className="bt__tile" href="#/requests">
        <span className="bt__n">{w.needYou.length}</span>
        <span className="bt__label">
          <Attn /> Need your decision <ArrowRight size={14} />
        </span>
      </a>
      <a className="bt__tile" href="#/documents">
        <span className="bt__n">{w.toApprove.length}</span>
        <span className="bt__label">
          <Attn /> {w.toApprove.length === 1 ? 'File to approve' : 'Files to approve'} <ArrowRight size={14} />
        </span>
      </a>
    </div>
  );
}

/** The home page as it is now (features/assistant/Home.tsx), with the figures swapped. */
function Linked({ look }: { look: FigLook }) {
  const w = useWork();
  const recent = [
    ...w.requests.map((r) => ({ key: r.id, icon: TYPE_ICON[r.type] ?? FileText, title: r.title, mark: <NeedsYou request={r} /> as ReactNode, when: r.updatedAt, href: `#/requests/${r.id}` })),
    ...w.chats.map((c) => ({ key: c.id, icon: MessageSquare, title: c.title, mark: null as ReactNode, when: c.updatedAt, href: `#/assistant/${c.id}` })),
  ]
    .sort((a, b) => b.when.localeCompare(a.when))
    .slice(0, 4);
  return (
    <div className="hd home home--calm lf-page">
      <div className="home__head">
        <h1 className="home__title">Good to see you, {w.me.name.split(' ')[0]}</h1>
        <p className="home__sub">Here’s where your work with Spark stands.</p>
      </div>
      <LinkedFigures look={look} />
      <div className="home__ask">
        <Composer onSubmit={w.ask} placeholder="Ask about your brand, market or audience…" />
      </div>
      <div className="home__prompts">
        {suggestedPrompts.slice(0, 4).map((p) => {
          const I = CHIP_ICON[p.label] ?? Sparkles;
          return (
            <button key={p.label} className="home__prompt" onClick={() => w.ask(p.prompt)}>
              <I size={15} strokeWidth={1.7} />
              {p.label}
            </button>
          );
        })}
      </div>
      <section className="home__recent">
        <h2 className="home__h2">Pick up where you left off</h2>
        <div className="home__rows">
          {recent.map((i) => (
            <a key={i.key} className="home__row" href={i.href}>
              <i.icon size={16} strokeWidth={1.7} className="home__icon" aria-hidden />
              <span className="rq-row3__name">
                <span className="rq-row3__title">{i.title}</span>
                {i.mark}
              </span>
              <ArrowRight size={15} className="home-recent__go" aria-hidden />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

export function HomeDemo() {
  const { query } = useRoute();
  const [v, setV] = useState<Variant>(() => (VARIANTS.some((x) => x.v === query.get('v')) ? (query.get('v') as Variant) : 'linked'));
  const cur = VARIANTS.find((x) => x.v === v)!;
  const [look, setLook] = useState<PickLook>('rows');
  const [tileLook, setTileLook] = useState<TileLook>('blocks');
  const [figLook, setFigLook] = useState<FigLook>('a');
  return (
    <div className="cdemo">
      <PageHeader title="Home · options" sub="The client finds the chat start page too much like ChatGPT. Other ways in: what you worked on last, with its status, so you can pick up where you left off. Real data; cards open the real pages." />
      <div className="fdm-switch">
        {VARIANTS.map((x) => (
          <button key={x.v} className={cx(v === x.v && 'is-on')} onClick={() => setV(x.v)}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{cur.note}</p>
      {v === 'pickup' && (
        <div className="fdm-switch hd-looks">
          <span className="faint">Pick up as</span>
          {PICK_LOOKS.map((x) => (
            <button key={x.v} className={cx(look === x.v && 'is-on')} onClick={() => setLook(x.v)}>
              {x.label}
            </button>
          ))}
        </div>
      )}
      {v === 'linked' && (
        <div className="fdm-switch hd-looks">
          <span className="faint">Figures</span>
          {FIG_LOOKS.map((x) => (
            <button key={x.v} className={cx(figLook === x.v && 'is-on')} onClick={() => setFigLook(x.v)}>
              {x.label}
            </button>
          ))}
        </div>
      )}
      {v === 'dash' && (
        <div className="fdm-switch hd-looks">
          <span className="faint">Dashboard as</span>
          {TILE_LOOKS.map((x) => (
            <button key={x.v} className={cx(tileLook === x.v && 'is-on')} onClick={() => setTileLook(x.v)}>
              {x.label}
            </button>
          ))}
        </div>
      )}
      <div className="hd-frame">
        {v === 'linked' && <Linked look={figLook} />}
        {v === 'pickup' && <Pickup look={look} />}
        {v === 'dash' && <Dash look={tileLook} />}
        {v === 'glow' && <Dash look="glass" glow />}
        {v === 'split' && <Split />}
        {v === 'status' && <Status />}
        {v === 'board' && <Board />}
        {v === 'agenda' && <Agenda />}
        {v === 'next' && <NextUp />}
        {v === 'pulse' && <Pulse />}
        {v === 'continue' && <Continue />}
      </div>
    </div>
  );
}

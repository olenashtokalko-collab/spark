// The home page (a new chat with no messages yet). After the client's feedback of 22 Oct (the old start
// screen read as ChatGPT): a greeting with the three numbers to act on, then the box with its prompts,
// then the four things touched last, so people can pick up where they left off. Quiet, on Sand.
import type { ReactNode } from 'react';
import { ArrowRight, CircleAlert, FileText, Lightbulb, MessageSquare, Paperclip, MessageSquareQuote, Palette, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { useStore } from '../../state/store';
import { suggestedPrompts } from '../../data/assistant';
import { NeedsYou, isOpen, needsYou } from '../../components/domain';
import { Composer } from './Composer';
import { TYPE_ICON } from '../requests/CreateRequestDialog';
import type { Attachment, WorkRequest } from '../../data/types';

const CHIP_ICON: Record<string, typeof Lightbulb> = {
  'Explore an idea': Lightbulb,
  'Run a background check': ShieldCheck,
  'Explore public feedback': MessageSquareQuote,
  'Understand your audience': UsersRound,
  'Explore a look': Palette,
};

const onYou = (r: WorkRequest) => needsYou(r);


/** The four things touched last: requests, files to approve and chats, newest first. Each has an icon for its
 *  kind, the title, the attention mark when it waits on you, and when it was touched. */
export function useRecent(n = 4) {
  const { state } = useStore();
  const toApprove = state.docs.filter((d) => d.review?.status === 'open');
  return [
    ...state.requests.map((r) => ({ key: r.id, kind: 'Request', icon: TYPE_ICON[r.type] ?? FileText, title: r.title, mark: <NeedsYou request={r} /> as ReactNode, when: r.updatedAt, href: `#/requests/${r.id}` })),
    ...toApprove.map((d) => ({
      key: d.id,
      kind: 'File',
      icon: Paperclip,
      title: d.name,
      mark: (
        <span className="needs-you" title="Needs your approval" aria-label="Needs your approval" role="img">
          <CircleAlert size={15} strokeWidth={2.2} />
        </span>
      ) as ReactNode,
      when: d.uploadedAt,
      href: `#/documents/${d.folderId}?doc=${d.id}`,
    })),
    ...state.conversations
      .filter((c) => c.messages.length > 0)
      .map((c) => ({ key: c.id, kind: 'Chat', icon: MessageSquare, title: c.title, mark: null as ReactNode, when: c.updatedAt, href: `#/assistant/${c.id}` })),
  ]
    .sort((a, b) => b.when.localeCompare(a.when))
    .slice(0, n);
}

export function Home({ onAsk, onTyping }: { onAsk: (text: string, attachments?: Attachment[]) => void; onTyping?: (typing: boolean) => void }) {
  const { state, me } = useStore();
  const needYou = state.requests.filter(onYou);
  const active = state.requests.filter((r) => isOpen(r.status) && !onYou(r));
  const toApprove = state.docs.filter((d) => d.review?.status === 'open');
  // The statuses "In progress" counts (everything with Spark), in the order of the work, each shown once as its dot.
  const sparkStatuses = (['submitted', 'in_review', 'changes_requested', 'approved', 'in_progress'] as const).filter((st) => active.some((r) => r.status === st));
  const attn = (
    <span className="needs-you" aria-hidden>
      <CircleAlert size={15} strokeWidth={2.2} />
    </span>
  );
  // The figures in Ink; what each means is a mark before its label, in the tables' language: the amber
  // attention mark for what waits on you, the status dots for what's with Spark, a file with the mark.
  const tiles: { n: number; label: string; href: string; mark: ReactNode }[] = [
    { n: needYou.length, label: 'Awaiting your decision', href: '#/requests', mark: attn },
    {
      n: active.length,
      label: 'In progress',
      href: '#/requests',
      mark: (
        <span className="lf-dots" aria-hidden>
          {sparkStatuses.map((st) => (
            <span key={st} className={`rstatus rstatus--${st}`}>
              <span className="rstatus__dot" />
            </span>
          ))}
        </span>
      ),
    },
    {
      n: toApprove.length,
      label: 'Files to review',
      href: '#/documents',
      mark: (
        <span className="lf-file" aria-hidden>
          <FileText size={15} strokeWidth={1.8} />
          <span className="lf-file__dot" />
        </span>
      ),
    },
  ];

  const recent = useRecent();

  return (
    // Quiet, after the references: Sand, a centred greeting, the numbers standing on the page between
    // hairlines, a white box, four light prompt pills, and plain rows for Recent.
    <div className="home home--calm">
      <div className="home__head">
        <h1 className="home__title">Good to see you, {me.name.split(' ')[0]}</h1>
        <p className="home__sub">Here’s what needs your attention today.</p>
      </div>

      <div className="bt bt--mono home__figures lf">
        {tiles.map((t) => (
          <a key={t.label} className="bt__tile" href={t.href}>
            <span className="bt__n">{t.n}</span>
            <span className="bt__label">
              {t.mark}
              {t.label}
              <ArrowRight size={14} />
            </span>
          </a>
        ))}
      </div>

      <div className="home__ask">
        <Composer onSubmit={onAsk} onTyping={onTyping} autoFocus placeholder="Ask about your brand, audience or market…" />
      </div>
      <div className="home__prompts">
        {/* Four prompts, one line. */}
        {suggestedPrompts.slice(0, 4).map((p) => {
          const I = CHIP_ICON[p.label] ?? Sparkles;
          return (
            <button key={p.label} className="home__prompt" onClick={() => onAsk(p.prompt)} title={p.prompt}>
              <I size={15} strokeWidth={1.7} />
              {p.label}
            </button>
          );
        })}
      </div>

      {recent.length > 0 && (
        <section className="home__recent">
          <h2 className="home__label">Continue where you left off</h2>
          <div className="home__rows">
            {recent.map((i) => (
              <a key={i.key} className="home__row" href={i.href}>
                <i.icon size={15} strokeWidth={1.7} className="home__icon" aria-hidden />
                <span className="rq-row3__name">
                  <span className="rq-row3__title">{i.title}</span>
                  {i.mark}
                </span>
                <ArrowRight size={15} className="home-recent__go" aria-hidden />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

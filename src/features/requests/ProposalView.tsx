import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CircleAlert, Download, MessageSquare, RotateCcw, ShieldCheck, Check, PenLine, X } from 'lucide-react';
import { canApprove, latestProposal, personById, proposalTotal, proposalWeeks, useStore } from '../../state/store';
import { Avatar, Button, Checkbox, EmptyState, Field, Select, Textarea, cx } from '../../components/ui/primitives';
import { Dialog } from '../../components/ui/overlay';
import { ProposalStatus } from '../../components/domain';
import { SparkDisc } from '../../components/ui/BrandSpark';
import { ChatDrawer } from '../assistant/ChatDrawer';
import { useToast } from '../../components/ui/toast';
import { aed, addDays, daysUntil, fmtDate, fmtDateTime, fmtRelative } from '../../lib/format';
import { navigate, useRoute } from '../../lib/router';
import type { Proposal } from '../../data/types';

const SECTIONS = ['Summary', 'Objectives', 'Scope & deliverables', 'Timeline', 'Investment', 'Terms'] as const;
type Section = (typeof SECTIONS)[number];
type Decision = 'approved' | 'changes_requested' | 'declined';

export function ProposalView({ requestId }: { requestId: string }) {
  const { state, me, actions } = useStore();
  const toast = useToast();
  // Opened from Latest from Spark on Home (?from=home): back goes to Home.
  const fromHome = useRoute().query.get('from') === 'home';
  const [ask, setAsk] = useState<string | null>(null);
  // One proposal per request for now: the client always sees the latest.
  const req = state.requests.find((r) => r.id === requestId);
  const p = latestProposal(state, requestId);
  const [commentFor, setCommentFor] = useState<Section | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);

  if (!req || !p)
    return (
      <EmptyState
        title="No proposal yet"
        body="Spark hasn't sent a proposal for this request."
        action={<Button onClick={() => navigate(req ? `/requests/${req.id}` : '/requests')}>Back to request</Button>}
      />
    );

  const total = proposalTotal(p);
  const weeks = proposalWeeks(p);
  const sender = personById(state, p.sentBy);
  const decider = p.decision ? personById(state, p.decision.by) : undefined;
  const approvedView = p.status === 'approved' && !!p.decision && !!decider;
  // Declined and changes requested are drawn like Approved: the amount, the word and a glass tile, without the ring.
  const endedView = (p.status === 'declined' || p.status === 'changes_requested') && !!p.decision && !!decider;
  const awaiting = p.status === 'awaiting';
  const mayDecide = awaiting && canApprove(me);
  // The deadline in the words of the request page: "11 days overdue · was due 18 Oct", "Due 18 Oct · 3 days left".
  const left = awaiting ? daysUntil(p.validUntil) : null;
  const dueText =
    left === null ? '' : left < 0 ? `${-left} day${left === -1 ? '' : 's'} overdue · was due ${fmtDate(p.validUntil)}` : left === 0 ? 'Due today' : `Due ${fmtDate(p.validUntil)} · ${left} day${left === 1 ? '' : 's'} left`;
  const urgent = left !== null && left <= 1;
  const countFor = (s: Section) => p.comments.filter((c) => c.section === s).length;

  const exportProposal = () => {
    const lines = [
      `${p.title} · Proposal`,
      `Sent ${fmtDate(p.sentAt, { year: true })} by Spark Studios`,
      '',
      p.summary,
      '',
      'SCOPE',
      ...p.scope.flatMap((s) => [`- ${s.title}: ${s.detail}`, ...s.deliverables.map((d) => `    · ${d}`)]),
      '',
      'TIMELINE',
      ...p.phases.map((ph) => `- ${ph.name}: ${ph.weeks} weeks`),
      '',
      'INVESTMENT',
      ...p.investment.map((l) => `- ${l.item}: ${aed(l.amount)}`),
      `Total: ${aed(total)} (excl. VAT)`,
      '',
      ...p.terms,
    ].join('\n');
    const url = URL.createObjectURL(new Blob([lines], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `Proposal — ${p.title}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast({ title: 'Proposal downloaded', body: 'A plain-text copy for sharing internally.' });
  };

  // Opens the chat drawer over the proposal with the question written in, to edit and send.
  const askSpark = () => setAsk(`Help me decide on the proposal for ${p.title}: what's included, what's not, and what to ask before approving.`);

  const sectionHead = (s: Section) => (
    <div className="psec__head">
      <h2 className="psec__title">{s}</h2>
      <button className={cx('psec__comment', countFor(s) > 0 && 'has-count')} onClick={() => setCommentFor(commentFor === s ? null : s)} aria-expanded={commentFor === s}>
        <MessageSquare size={14} />
        {countFor(s) > 0 ? countFor(s) : 'Comment'}
      </button>
    </div>
  );
  const sectionComposer = (s: Section) =>
    commentFor === s && (
      <InlineComment
        section={s}
        onCancel={() => setCommentFor(null)}
        onPost={(t) => {
          actions.commentOnProposal(p.id, t, s);
          setCommentFor(null);
          toast({ title: 'Comment added', body: `${sender.name} will see it on the proposal.` });
        }}
      />
    );

  let weekOffset = 0;

  return (
    <div className="proposal">
      {/* After documentation pages: a back link, the title, and a row of tools over a hairline. */}
      <ChatDrawer open={ask !== null} initial={ask ?? undefined} onClose={() => setAsk(null)} />
      <a className="back" href={fromHome ? '#/' : `#/requests/${req.id}`}>
        <ArrowLeft size={15} /> {fromHome ? 'Home' : 'Request'}
      </a>

      <div className="proposal__layout">
        <article className="proposal__doc">
          {/* As the request page: the id and status over the title; the tools as buttons on the right (Ask Spark
              as the white pill everywhere); when it was sent on a hairline under it. */}
          <header className="proposal__head">
            <div className="req-head__top">
              <span className="mono faint">{req.id}</span>
              <ProposalStatus status={p.status} />
            </div>
            <div className="proposal__headrow">
              <h1 className="proposal__title">{p.title}</h1>
              <div className="proposal__acts">
                <button type="button" className="hl-mchat rq-ask" onClick={askSpark}>
                  <SparkDisc size={22} />
                  Ask Spark
                </button>
                <Button size="sm" variant="secondary" icon={Download} onClick={exportProposal}>
                  Download
                </Button>
              </div>
            </div>
            <p className="proposal__sent">
              Sent {fmtDate(p.sentAt)} by {sender.name.split(' ')[0]} · version {p.version}
            </p>
          </header>

          <StatusBanner p={p} />

          {p.objectives.length > 0 && (
            <section className="psec" id="sec-objectives">
              {sectionHead('Objectives')}
              <ol className="objectives">
                {p.objectives.map((o, i) => (
                  <li key={i}>
                    <span className="list-num">{i + 1}.</span>
                    {o}
                  </li>
                ))}
              </ol>
              {sectionComposer('Objectives')}
            </section>
          )}

          <section className="psec" id="sec-scope">
            {sectionHead('Scope & deliverables')}
            {/* A framed table as on Requests: each workstream and what it delivers. */}
            <div className="scope-tbl" role="table" aria-label="Scope and deliverables">
              <div className="scope-tbl__row scope-tbl__head" role="row">
                <span role="columnheader">Workstream</span>
                <span role="columnheader">Deliverables</span>
              </div>
              {p.scope.map((s) => (
                <div key={s.title} className="scope-tbl__row" role="row">
                  <div role="cell">
                    <div className="scope-tbl__title">{s.title}</div>
                    {s.detail && <p className="scope-tbl__detail">{s.detail}</p>}
                  </div>
                  <ul role="cell" className="scope-tbl__list">
                    {s.deliverables.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {sectionComposer('Scope & deliverables')}
          </section>

          <section className="psec" id="sec-timeline">
            {sectionHead('Timeline')}
            <div className="gantt" role="list">
              {p.phases.map((ph) => {
                const start = weekOffset;
                weekOffset += ph.weeks;
                return (
                  <div key={ph.name} className="gantt__row" role="listitem">
                    <div className="gantt__label">
                      <span>{ph.name}</span>
                      <span className="faint">{ph.weeks} wk</span>
                    </div>
                    <div className="gantt__track">
                      <span className="gantt__bar" style={{ left: `${(start / weeks) * 100}%`, width: `${(ph.weeks / weeks) * 100}%` }}>
                        <span>{fmtDate(addDays(p.startDate, start * 7))}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="gantt__foot faint">
                <span>Start {fmtDate(p.startDate, { year: true })}</span>
                <span>End {fmtDate(addDays(p.startDate, weeks * 7), { year: true })}</span>
              </div>
            </div>
            {sectionComposer('Timeline')}
          </section>

          <section className="psec" id="sec-investment">
            {sectionHead('Investment')}
            <table className="table invest">
              <tbody>
                {p.investment.map((l) => (
                  <tr key={l.item}>
                    <td>{l.item}</td>
                    <td className="num mono">{aed(l.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total, excl. VAT</td>
                  <td className="num mono">{aed(total)}</td>
                </tr>
              </tfoot>
            </table>
            {sectionComposer('Investment')}
          </section>

          <section className="psec" id="sec-terms">
            {sectionHead('Terms')}
            <ul className="terms">
              {p.terms.map((t) => (
                <li key={t}>{t}</li>
              ))}
              <li>Valid until {fmtDate(p.validUntil, { year: true })}.</li>
            </ul>
            {sectionComposer('Terms')}
          </section>

          <section className="psec pcomments" id="sec-comments">
            <h2 className="psec__title">Comments · {p.comments.length}</h2>
            <CommentList p={p} />
            <GeneralComment
              onPost={(t) => {
                actions.commentOnProposal(p.id, t);
                toast({ title: 'Comment added' });
              }}
            />
          </section>
        </article>

        <aside className="proposal__side">
          <section className={cx('decision', (awaiting || approvedView || endedView) && 'decision--timed', awaiting && 'is-open', urgent && 'is-urgent', approvedView && 'decision--ok', endedView && `decision--${p.status === 'declined' ? 'declined' : 'changes'}`)}>
            {approvedView ? (
              // Approved (picked on #/demo/states, B): the same card as while waiting, the ring closed in the spectrum around the thumb.
              <>
                <div className="decision__eyebrow">
                  <span>Decided {fmtDate(p.decision!.at)}</span>
                </div>
                <div className="decision__timed">
                  <div>
                    <div className="decision__total">{aed(total)}</div>
                    <div className="decision__meta decision__meta--ok">Approved</div>
                  </div>
                </div>
              </>
            ) : endedView ? (
              // Declined / changes requested: the same card as Approved, a pen or a thumb turned down in the tile.
              <>
                <div className="decision__eyebrow">
                  <span>Decided {fmtDate(p.decision!.at)}</span>
                </div>
                <div className="decision__timed">
                  <div>
                    <div className="decision__total">{aed(total)}</div>
                    <div className="decision__meta decision__meta--ok">{p.status === 'declined' ? 'Declined' : 'Changes requested'}</div>
                  </div>
                </div>
              </>
            ) : (
            <>
            {awaiting ? (
              // Awaiting a decision (29 Oct, by the book): the deadline, the total and what it buys; no glow and
              // no hourglass, the words say it. Ember once a day or less is left.
              <>
                <div className="decision__eyebrow">
                  <span>{dueText}</span>
                </div>
                <div className="decision__timed">
                  <div>
                    <div className="decision__total">{aed(total)}</div>
                    <div className="decision__meta">
                      excl. VAT · {weeks} weeks from {fmtDate(p.startDate)}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* The download sits in the tools row over the document. */}
                <div className="decision__head">
                  <div className="decision__total">{aed(total)}</div>
                </div>
                <div className="decision__meta">
                  {weeks} weeks · starts {fmtDate(p.startDate)}
                </div>
              </>
            )}
            {mayDecide && (
              <div className="decision__btns">
                <Button variant="primary" size="lg" onClick={() => setDecision('approved')}>
                  Approve proposal
                </Button>
                <div className="decision__row">
                  <Button onClick={() => setDecision('changes_requested')}>
                    Request changes
                  </Button>
                  <Button onClick={() => setDecision('declined')}>
                    Decline
                  </Button>
                </div>
              </div>
            )}
            {awaiting && !mayDecide && (
              <p className="decision__note">
                Only the workspace owner can approve. You can still comment.
              </p>
            )}
            {p.decision && decider && (
              <div className={cx('decision__done', `is-${p.status}`)}>
                <Avatar person={decider} size={22} />
                {/* What happened, the note if there was one, then when. */}
                <div className="decision__done-body">
                  <div className="decision__what">
                    {p.status === 'approved' ? 'Approved' : p.status === 'declined' ? 'Declined' : 'Changes requested'} by {decider.name}
                    {p.decision.reason && <> ({p.decision.reason.toLowerCase()})</>}
                  </div>
                  {p.decision.note && <p className="decision__quote">“{p.decision.note}”</p>}
                  <div className="decision__when">{fmtDateTime(p.decision.at)}</div>
                </div>
              </div>
            )}
            </>
            )}
          </section>
          <ProposalToc
            items={[
              ...(p.objectives.length ? [{ id: 'objectives', label: 'Objectives' }] : []),
              { id: 'scope', label: 'Scope & deliverables' },
              { id: 'timeline', label: 'Timeline' },
              { id: 'investment', label: 'Investment' },
              { id: 'terms', label: 'Terms' },
              { id: 'comments', label: 'Comments', count: p.comments.length },
            ]}
          />
        </aside>
      </div>

      <DecisionDialog
        p={p}
        kind={decision}
        onClose={() => setDecision(null)}
        onConfirm={(note, reason) => {
          actions.decideProposal(p.id, decision!, note, reason);
          setDecision(null);
          toast({
            title: decision === 'approved' ? 'Proposal approved' : decision === 'declined' ? 'Proposal declined' : 'Changes requested',
            body: decision === 'approved' ? `${sender.name} will confirm the kick-off date.` : `${sender.name} has been notified.`,
            tone: decision === 'approved' ? 'success' : 'info',
          });
        }}
      />
    </div>
  );
}

// The decision itself shows in the side card; the banner only says a revised
// proposal is on its way after the client asked for changes.
/** In-page contents for the proposal: jumps to a section and marks the one
 *  in view, so the document stays whole while still easy to move around. */
function ProposalToc({ items }: { items: { id: string; label: string; count?: number }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  // After a click, hold the picked section while the smooth scroll runs, so a
  // short section near the end isn't overruled when the page hits the bottom.
  const hold = useRef(0);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(`sec-${i.id}`)).filter((e): e is HTMLElement => !!e);
    // The section in view is the last one whose top has passed a line under the
    // top bar; at the very bottom of the page it's the last one, however short.
    const update = () => {
      if (Date.now() < hold.current) return;
      const line = 140;
      const doc = document.scrollingElement ?? document.documentElement;
      const scroller = els[0]?.closest('main') ?? doc;
      const atEnd = [scroller, doc].some((s) => s.scrollHeight - s.scrollTop - s.clientHeight < 4 && s.scrollTop > 0);
      let current = els[0];
      for (const e of els) if (e.getBoundingClientRect().top <= line) current = e;
      if (atEnd) current = els[els.length - 1];
      if (current) setActive(current.id.replace('sec-', ''));
    };
    update();
    // Capture, so it hears whichever element actually scrolls (window or main).
    window.addEventListener('scroll', update, { capture: true, passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, { capture: true });
      window.removeEventListener('resize', update);
    };
  }, [items.map((i) => i.id).join()]); // eslint-disable-line react-hooks/exhaustive-deps

  const idx = Math.max(0, items.findIndex((i) => i.id === active));

  return (
    <nav className="ptoc ptoc--rail" style={{ ['--i' as string]: idx }} aria-label="Proposal sections">
      <div className="ptoc__title">
        On this page
      </div>
      {/* A hairline rail; one accent bar slides to the section in view, a pale bar shows on hover. */}
      <div className="ptoc__items">
        {items.map((i) => (
          <a
            key={i.id}
            href={`#sec-${i.id}`}
            className={cx('ptoc__item', active === i.id && 'is-active')}
            aria-current={active === i.id ? 'location' : undefined}
            onClick={(e) => {
              // Hash routing owns the URL hash, so scroll instead of following the link.
              e.preventDefault();
              hold.current = Date.now() + 900;
              setActive(i.id);
              document.getElementById(`sec-${i.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            {i.label}
            {i.count ? <span className="ptoc__count">{i.count}</span> : null}
          </a>
        ))}
      </div>
    </nav>
  );
}

function StatusBanner({ p }: { p: Proposal }) {
  if (p.status !== 'changes_requested') return null;
  return (
    <div className="pbanner">
      <RotateCcw size={16} />
      <span>Spark is preparing a revised proposal.</span>
    </div>
  );
}

function CommentList({ p }: { p: Proposal }) {
  const { state } = useStore();
  const list = p.comments;
  if (list.length === 0) return <div className="pcomments__empty faint">No comments yet.</div>;
  return (
    <div className="pcomments__list">
      {list.map((c) => {
        const who = personById(state, c.by);
        return (
          <div key={c.id} className="pcomment">
            <Avatar person={who} size={24} />
            <div>
              <div className="pcomment__who">
                {who.name}
                <span className="faint"> · {fmtRelative(c.at)}</span>
              </div>
              {c.section && <div className="pcomment__section">on {c.section}</div>}
              <p>{c.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InlineComment({ section, onPost, onCancel }: { section: Section; onPost: (t: string) => void; onCancel: () => void }) {
  const [t, setT] = useState('');
  return (
    <div className="inline-comment">
      <Textarea autoFocus rows={2} value={t} onChange={(e) => setT(e.target.value)} placeholder={`Comment on ${section.toLowerCase()}…`} aria-label={`Comment on ${section}`} onKeyDown={(e) => e.key === 'Escape' && onCancel()} />
      <div className="inline-comment__bar">
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" variant="primary" disabled={!t.trim()} onClick={() => onPost(t.trim())}>
          Comment
        </Button>
      </div>
    </div>
  );
}

function GeneralComment({ onPost }: { onPost: (t: string) => void }) {
  const [t, setT] = useState('');
  return (
    <div className="general-comment">
      <Textarea rows={2} value={t} onChange={(e) => setT(e.target.value)} placeholder="Add a general comment…" aria-label="General comment" />
      {t.trim() && (
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            onPost(t.trim());
            setT('');
          }}
        >
          Comment
        </Button>
      )}
    </div>
  );
}

const REASONS = ['Budget', 'Timing', 'Scope', 'Going another direction', 'Other'];

function DecisionDialog({ p, kind, onClose, onConfirm }: { p: Proposal; kind: Decision | null; onClose: () => void; onConfirm: (note?: string, reason?: string) => void }) {
  const [note, setNote] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [authorised, setAuthorised] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const total = proposalTotal(p);

  const reset = () => {
    setNote('');
    setReason(REASONS[0]);
    setAuthorised(false);
    setError(null);
    setBusy(false);
  };
  const close = () => {
    reset();
    onClose();
  };
  const confirm = async () => {
    if (kind === 'changes_requested' && note.trim().length < 5) return setError('Tell Spark what to change.');
    if (kind === 'approved' && !authorised) return setError('Confirm you can approve this spend.');
    setBusy(true);
    await new Promise((r) => setTimeout(r, 650));
    onConfirm(note.trim() || undefined, kind === 'declined' ? reason : undefined);
    reset();
  };

  const copy = {
    approved: { title: 'Approve this proposal?', cta: 'Approve', variant: 'primary' as const, icon: Check, tone: 'accent' as const },
    changes_requested: { title: 'Request changes', cta: 'Send changes', variant: 'primary' as const, icon: PenLine, tone: 'accent' as const },
    // Declining is a business decision, not a deletion: Ink like the other two, no red (danger is for deleting).
    declined: { title: 'Decline this proposal?', cta: 'Decline proposal', variant: 'primary' as const, icon: X, tone: 'neutral' as const },
  };
  if (!kind) return null;
  const c = copy[kind];

  return (
    <Dialog
      open={!!kind}
      onClose={close}
      size="sm"
      icon={c.icon}
      tone={c.tone}
      title={c.title}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button variant={c.variant} onClick={confirm} loading={busy}>
            {c.cta}
          </Button>
        </>
      }
    >
      <div className="stack">
        {/* What this decision means, in one box (the dialogs have no subtitle). */}
        {kind === 'approved' && (
          <div className="approve-sum">
            <ShieldCheck size={18} />
            <span>
              <strong>
                {aed(total)} excl. VAT · {proposalWeeks(p)} weeks
              </strong>
              Approving confirms scope, timeline and investment. Spark will invoice 50% on approval, per the terms.
            </span>
          </div>
        )}
        {kind === 'changes_requested' && (
          <div className="approve-sum approve-sum--neutral">
            <RotateCcw size={18} />
            <span>Spark will send a revised proposal. Be specific about what should change.</span>
          </div>
        )}
        {kind === 'declined' && (
          <div className="approve-sum approve-sum--neutral">
            <CircleAlert size={18} />
            <span>The request will be closed. You can always start a new one.</span>
          </div>
        )}
        {kind === 'declined' && (
          <Field label="Main reason" htmlFor="dc-reason">
            <Select id="dc-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              {REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
          </Field>
        )}
        <Field label={kind === 'changes_requested' ? 'What should change?' : 'Note (optional)'} htmlFor="dc-note">
          <Textarea
            id="dc-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={kind === 'approved' ? 'e.g. Please confirm the kick-off date.' : kind === 'changes_requested' ? 'e.g. Can the creator shortlist be 60% Arabic-first?' : 'Anything Spark should know.'}
            data-autofocus
          />
        </Field>
        {kind === 'approved' && (
          <Checkbox
            checked={authorised}
            onChange={(v) => {
              setAuthorised(v);
              setError(null);
            }}
          >
            I'm authorised to approve spend of {aed(total)} for Brand Co.
          </Checkbox>
        )}
        {error && <div className="field__error">{error}</div>}
      </div>
    </Dialog>
  );
}

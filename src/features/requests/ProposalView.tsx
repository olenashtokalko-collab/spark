import { useMemo, useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, Download, MessageSquare, RotateCcw, Search, ShieldCheck, X, XCircle, GitCompare } from 'lucide-react';
import { canApprove, personById, proposalTotal, proposalWeeks, proposalsFor, useStore } from '../../state/store';
import { Avatar, Badge, Button, Checkbox, EmptyState, Field, Segmented, Select, Textarea, cx } from '../../components/ui/primitives';
import { Dialog } from '../../components/ui/overlay';
import { ProposalStatus } from '../../components/domain';
import { useToast } from '../../components/ui/toast';
import { aed, addDays, dueLabel, fmtDate, fmtDateTime, fmtRelative } from '../../lib/format';
import { navigate, withQuery } from '../../lib/router';
import type { Proposal } from '../../data/types';

const SECTIONS = ['Summary', 'Objectives', 'Scope & deliverables', 'Timeline', 'Investment', 'Terms'] as const;
type Section = (typeof SECTIONS)[number];
type Decision = 'approved' | 'changes_requested' | 'declined';

export function ProposalView({ requestId, version }: { requestId: string; version?: number }) {
  const { state, me, actions } = useStore();
  const toast = useToast();
  const versions = proposalsFor(state, requestId);
  const req = state.requests.find((r) => r.id === requestId);
  const p = versions.find((v) => v.version === version) ?? versions[versions.length - 1];
  const [commentFor, setCommentFor] = useState<Section | null>(null);
  const [filter, setFilter] = useState<Section | 'all'>('all');
  const [decision, setDecision] = useState<Decision | null>(null);

  if (!req || !p)
    return (
      <EmptyState
        icon={Search}
        title="No proposal yet"
        body="Spark hasn't sent a proposal for this request."
        action={<Button onClick={() => navigate(req ? `/requests/${req.id}` : '/requests')}>Back to request</Button>}
      />
    );

  const latest = versions[versions.length - 1];
  const prev = versions.find((v) => v.version === p.version - 1);
  const total = proposalTotal(p);
  const weeks = proposalWeeks(p);
  const sender = personById(state, p.sentBy);
  const decider = p.decision ? personById(state, p.decision.by) : undefined;
  const awaiting = p.status === 'awaiting';
  const mayDecide = awaiting && canApprove(me);
  const countFor = (s: Section) => p.comments.filter((c) => c.section === s).length;

  const exportProposal = () => {
    const lines = [
      `${p.title} · Proposal v${p.version}`,
      `Sent ${fmtDate(p.sentAt, { year: true })} by ${sender.name}, Spark Studios`,
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
    a.download = `Proposal — ${p.title} v${p.version}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast({ title: 'Proposal downloaded', body: 'A plain-text copy for sharing internally.' });
  };

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
          setFilter(s);
          toast({ title: 'Comment added', body: `${sender.name} will see it on the proposal.` });
        }}
      />
    );

  let weekOffset = 0;

  return (
    <div className="proposal">
      <a className="back" href={`#/requests/${req.id}`}>
        <ArrowLeft size={15} /> {req.id} · {req.title}
      </a>

      <div className="proposal__layout">
        <article className="proposal__doc">
          <header className="proposal__head">
            {versions.length > 1 && (
              <div className="proposal__eyebrow">
                <Segmented
                  label="Version"
                  value={String(p.version)}
                  onChange={(v) => navigate(withQuery(`/requests/${req.id}/proposal`, { v: v === String(latest.version) ? null : v }), { replace: true })}
                  items={versions.map((v) => ({ value: String(v.version), label: `v${v.version}` }))}
                />
              </div>
            )}
            <h1 className="proposal__title">{p.title}</h1>
            <div className="proposal__by">
              <Avatar person={sender} size={22} />
              <span>
                {sender.name}, {sender.title} · Spark Studios · sent {fmtDate(p.sentAt, { year: true })}
              </span>
              <ProposalStatus status={p.status} />
            </div>
          </header>

          <StatusBanner p={p} latestVersion={latest.version} requestId={req.id} />

          {prev && (
            <div className="diff">
              <GitCompare size={15} />
              <span>
                <strong>Changed from v{prev.version}:</strong> {total === proposalTotal(prev) ? 'same investment' : `${aed(Math.abs(total - proposalTotal(prev)))} ${total < proposalTotal(prev) ? 'less' : 'more'}`},{' '}
                {weeks - proposalWeeks(prev) === 0 ? 'same duration' : `${Math.abs(weeks - proposalWeeks(prev))} weeks ${weeks < proposalWeeks(prev) ? 'shorter' : 'longer'}`}
                {prev.decision?.note && <> · responds to “{prev.decision.note}”</>}
              </span>
            </div>
          )}

          <section className="psec">
            {sectionHead('Summary')}
            <p className="psec__lead">{p.summary}</p>
            {sectionComposer('Summary')}
          </section>

          {p.objectives.length > 0 && (
            <section className="psec">
              {sectionHead('Objectives')}
              <ol className="objectives">
                {p.objectives.map((o, i) => (
                  <li key={i}>
                    <span className="mono faint">0{i + 1}</span>
                    {o}
                  </li>
                ))}
              </ol>
              {sectionComposer('Objectives')}
            </section>
          )}

          <section className="psec">
            {sectionHead('Scope & deliverables')}
            <div className="scope">
              {p.scope.map((s, i) => (
                <div key={i} className="scope__item">
                  <div className="scope__num mono">{String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <div className="scope__title">{s.title}</div>
                    {s.detail && <p className="muted">{s.detail}</p>}
                    <ul className="scope__list">
                      {s.deliverables.filter(Boolean).map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            {sectionComposer('Scope & deliverables')}
          </section>

          <section className="psec">
            {sectionHead('Timeline')}
            <div className="gantt" role="list">
              {p.phases.map((ph) => {
                const start = weekOffset;
                weekOffset += ph.weeks;
                return (
                  <div key={ph.name} className="gantt__row" role="listitem">
                    <div className="gantt__label">
                      <span>{ph.name}</span>
                      <span className="faint mono">{ph.weeks}w</span>
                    </div>
                    <div className="gantt__track">
                      <span className="gantt__bar" style={{ left: `${(start / weeks) * 100}%`, width: `${(ph.weeks / weeks) * 100}%` }}>
                        <span className="mono">{fmtDate(addDays(p.startDate, start * 7))}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="gantt__foot faint">
                <span className="mono">Start {fmtDate(p.startDate, { year: true })}</span>
                <span className="mono">End {fmtDate(addDays(p.startDate, weeks * 7), { year: true })}</span>
              </div>
            </div>
            {sectionComposer('Timeline')}
          </section>

          <section className="psec">
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

          <section className="psec">
            {sectionHead('Terms')}
            <ul className="terms">
              {p.terms.map((t) => (
                <li key={t}>{t}</li>
              ))}
              <li>Valid until {fmtDate(p.validUntil, { year: true })}.</li>
            </ul>
            {sectionComposer('Terms')}
          </section>
        </article>

        <aside className="proposal__side">
          <section className="decision">
            <div className="decision__total">{aed(total)}</div>
            <div className="decision__meta">
              {weeks} weeks · starts {fmtDate(p.startDate)}
              {awaiting && <> · {dueLabel(p.validUntil)}</>}
            </div>
            {mayDecide && (
              <div className="decision__btns">
                <Button variant="primary" size="lg" icon={Check} onClick={() => setDecision('approved')}>
                  Approve proposal
                </Button>
                <div className="decision__row">
                  <Button icon={RotateCcw} onClick={() => setDecision('changes_requested')}>
                    Request changes
                  </Button>
                  <Button variant="ghost" icon={X} onClick={() => setDecision('declined')}>
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
                <span>
                  {p.status === 'approved' ? 'Approved' : p.status === 'declined' ? 'Declined' : 'Changes requested'} by {decider.name}
                  <span className="faint"> · {fmtDateTime(p.decision.at)}</span>
                </span>
              </div>
            )}
            <button className="link-btn decision__dl" onClick={exportProposal}>
              <Download size={14} /> Download a copy
            </button>
          </section>

          <section className="pcomments">
            <div className="pcomments__head">
              <h3>Comments</h3>
              <span className="faint mono">{p.comments.length}</span>
            </div>
            <div className="pcomments__filters">
              <button className={cx('chip', filter === 'all' && 'is-active')} onClick={() => setFilter('all')}>
                All
              </button>
              {SECTIONS.filter((s) => countFor(s) > 0).map((s) => (
                <button key={s} className={cx('chip', filter === s && 'is-active')} onClick={() => setFilter(s)}>
                  {s} · {countFor(s)}
                </button>
              ))}
            </div>
            <CommentList p={p} filter={filter} />
            <GeneralComment
              onPost={(t) => {
                actions.commentOnProposal(p.id, t);
                toast({ title: 'Comment added' });
              }}
            />
          </section>
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

function StatusBanner({ p, latestVersion, requestId }: { p: Proposal; latestVersion: number; requestId: string }) {
  const { state } = useStore();
  const who = p.decision ? personById(state, p.decision.by) : undefined;
  if (p.status === 'approved')
    return (
      <div className="pbanner pbanner--positive">
        <CheckCircle2 size={16} />
        <span>
          Approved by {who?.name} on {fmtDate(p.decision!.at, { year: true })}.{p.decision?.note && <> “{p.decision.note}”</>}
        </span>
      </div>
    );
  if (p.status === 'declined')
    return (
      <div className="pbanner pbanner--danger">
        <XCircle size={16} />
        <span>
          Declined by {who?.name}
          {p.decision?.reason && <> ({p.decision.reason.toLowerCase()})</>}.{p.decision?.note && <> “{p.decision.note}”</>}
        </span>
      </div>
    );
  if (p.version < latestVersion)
    return (
      <div className="pbanner">
        <RotateCcw size={16} />
        <span>
          {p.status === 'changes_requested' && who ? <>{who.name} requested changes: “{p.decision?.note}”. </> : null}
          This is an older version.
        </span>
        <a className="link" href={`#/requests/${requestId}/proposal`}>
          See v{latestVersion}
        </a>
      </div>
    );
  if (p.status === 'changes_requested')
    return (
      <div className="pbanner">
        <RotateCcw size={16} />
        <span>
          {who?.name} requested changes: “{p.decision?.note}”. Spark is preparing a revised version.
        </span>
      </div>
    );
  return null;
}

function CommentList({ p, filter }: { p: Proposal; filter: Section | 'all' }) {
  const { state } = useStore();
  const list = useMemo(() => p.comments.filter((c) => filter === 'all' || c.section === filter), [p.comments, filter]);
  if (list.length === 0) return <div className="pcomments__empty faint">No comments yet. Use “Comment” on any section to point at something specific.</div>;
  return (
    <div className="pcomments__list">
      {list.map((c) => {
        const who = personById(state, c.by);
        return (
          <div key={c.id} className="pcomment">
            <Avatar person={who} size={24} />
            <div>
              <div className="pcomment__who">
                {who.name} {who.org === 'spark' && <Badge>Spark</Badge>}
                <span className="faint"> · {fmtRelative(c.at)}</span>
              </div>
              {c.section && <div className="pcomment__section mono">on {c.section}</div>}
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
    approved: { title: `Approve proposal v${p.version}?`, desc: `${p.title} · ${aed(total)} excl. VAT · ${proposalWeeks(p)} weeks`, cta: 'Approve', variant: 'primary' as const },
    changes_requested: { title: 'Request changes', desc: 'Spark will send a revised version. Be specific about what should change.', cta: 'Send to Spark', variant: 'primary' as const },
    declined: { title: `Decline proposal v${p.version}?`, desc: 'The request will be closed. You can always start a new one.', cta: 'Decline proposal', variant: 'danger' as const },
  };
  if (!kind) return null;
  const c = copy[kind];

  return (
    <Dialog
      open={!!kind}
      onClose={close}
      size="sm"
      title={c.title}
      description={c.desc}
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button variant={c.variant} onClick={confirm} loading={busy}>
            {c.cta}
          </Button>
        </>
      }
    >
      <div className="stack">
        {kind === 'approved' && (
          <div className="approve-sum">
            <ShieldCheck size={18} />
            <span>Approving confirms scope, timeline and investment. Spark will invoice 50% on approval, per the terms.</span>
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
        <Field label={kind === 'changes_requested' ? 'What should change?' : 'Note for Spark'} htmlFor="dc-note" optional={kind !== 'changes_requested'}>
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
            I'm authorised to approve spend of {aed(total)} for Brand Co..
          </Checkbox>
        )}
        {error && <div className="field__error">{error}</div>}
      </div>
    </Dialog>
  );
}

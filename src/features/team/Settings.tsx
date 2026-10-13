import { useEffect, useRef, useState } from 'react';
import { Mail, MoreHorizontal, RefreshCw, Trash2, UserMinus, UserPlus, X, AlertTriangle } from 'lucide-react';
import { useStore, type NotifKey } from '../../state/store';
import { Avatar, Badge, Button, Field, PageHeader, Select, Switch, Textarea, cx } from '../../components/ui/primitives';
import { Dialog, Menu } from '../../components/ui/overlay';
import { useToast } from '../../components/ui/toast';
import { fmtRelative } from '../../lib/format';
import type { ClientRole, Person } from '../../data/types';

export const ROLE_INFO: Record<ClientRole, { label: string; desc: string }> = {
  owner: { label: 'Owner', desc: 'Approves proposals and manages the team.' },
  member: { label: 'Member', desc: 'Chats, creates requests, comments and uploads.' },
  viewer: { label: 'Viewer', desc: 'Reads everything and comments. No requests or approvals.' },
};

export function TeamPage() {
  return (
    <div>
      <PageHeader title="Team" sub="Invite colleagues to this workspace. They see requests, proposals and documents. Chats stay private." />
      <Team />
    </div>
  );
}

export function Settings() {
  return (
    <div>
      <PageHeader title="Settings" sub="Choose how you hear about updates." />
      <NotificationPrefs />
    </div>
  );
}

function Team() {
  const { state, me, actions } = useStore();
  const toast = useToast();
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<Person | null>(null);
  const clients = state.people.filter((p) => p.org === 'client');
  const isOwner = me.org === 'client' && me.role === 'owner';

  return (
    <div className="team">
      <section>
        <div className="section-head">
          <h2 className="section-head__title">
            {state.brand.name} <span className="section-head__meta">· {clients.length} members</span>
          </h2>
          {isOwner && (
            <Button variant="primary" icon={UserPlus} onClick={() => setInviting(true)}>
              Invite people
            </Button>
          )}
        </div>
        <div className="members">
          {clients.map((p) => (
            <div key={p.id} className="member">
              <Avatar person={p} size={34} />
              <div className="member__who">
                <div className="member__name">
                  {p.name} {p.id === me.id && <span className="faint">(you)</span>}
                </div>
                <div className="faint">
                  {p.title} · {p.email}
                </div>
              </div>
              {isOwner && p.id !== me.id ? (
                <Select
                  aria-label={`Role for ${p.name}`}
                  value={p.role}
                  onChange={(e) => {
                    actions.changeRole(p.id, e.target.value as ClientRole);
                    toast({ title: `${p.name.split(' ')[0]} is now ${ROLE_INFO[e.target.value as ClientRole].label.toLowerCase()}` });
                  }}
                  className="member__role"
                >
                  {(Object.keys(ROLE_INFO) as ClientRole[]).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_INFO[r].label}
                    </option>
                  ))}
                </Select>
              ) : (
                <Badge>{ROLE_INFO[p.role ?? 'member'].label}</Badge>
              )}
              {isOwner && p.id !== me.id ? (
                <Menu
                  width={200}
                  trigger={({ toggle, ref }) => (
                    <button ref={ref} className="btn btn--ghost btn--sm btn--icon" onClick={toggle} aria-label={`More for ${p.name}`}>
                      <MoreHorizontal size={16} />
                    </button>
                  )}
                  items={[{ label: 'Remove from workspace', icon: UserMinus, danger: true, onSelect: () => setRemoving(p) }]}
                />
              ) : (
                <span className="member__spacer" />
              )}
            </div>
          ))}
        </div>

        {state.invitations.length > 0 && (
          <>
            <div className="eyebrow sub-eyebrow">Pending invitations</div>
            <div className="members">
              {state.invitations.map((inv) => (
                <div key={inv.id} className="member member--pending">
                  <span className="avatar avatar--pending">
                    <Mail size={15} />
                  </span>
                  <div className="member__who">
                    <div className="member__name">{inv.email}</div>
                    <div className="faint">
                      Invited {fmtRelative(inv.invitedAt)} · {ROLE_INFO[inv.role].label}
                    </div>
                  </div>
                  <Badge tone="warning">Pending</Badge>
                  {isOwner ? (
                    <Menu
                      width={200}
                      trigger={({ toggle, ref }) => (
                        <button ref={ref} className="btn btn--ghost btn--sm btn--icon" onClick={toggle} aria-label={`More for ${inv.email}`}>
                          <MoreHorizontal size={16} />
                        </button>
                      )}
                      items={[
                        {
                          label: 'Resend invitation',
                          icon: RefreshCw,
                          onSelect: () => {
                            actions.resendInvite(inv.id);
                            toast({ title: 'Invitation resent', body: inv.email });
                          },
                        },
                        {
                          label: 'Revoke invitation',
                          icon: Trash2,
                          danger: true,
                          onSelect: () => {
                            actions.revokeInvite(inv.id);
                            toast({ title: 'Invitation revoked', body: inv.email });
                          },
                        },
                      ]}
                    />
                  ) : (
                    <span className="member__spacer" />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <InviteDialog open={inviting} onClose={() => setInviting(false)} />
      <Dialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        size="sm"
        icon={UserMinus}
        tone="danger"
        title={`Remove ${removing?.name}?`}
        description="They lose access straight away. Their comments and requests stay."
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => {
                actions.removeMember(removing!.id);
                toast({ title: `${removing!.name} removed` });
                setRemoving(null);
              }}
            >
              Remove
            </Button>
          </>
        }
      >
        <span />
      </Dialog>
    </div>
  );
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [role, setRole] = useState<ClientRole>('member');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setEmails([]);
      setDraft('');
      setRole('member');
      setMessage('');
      setError(null);
    }
  }, [open]);

  const domain = state.people.find((p) => p.id === 'u-layla')!.email.split('@')[1];
  const taken = new Set([...state.people.map((p) => p.email.toLowerCase()), ...state.invitations.map((i) => i.email.toLowerCase())]);
  const external = emails.filter((e) => e.split('@')[1] !== domain);

  /** Turns typed text into address tokens. Valid addresses become tokens;
   *  anything invalid stays in the field with an explanation. */
  const commit = (raw: string) => {
    const parts = raw.split(/[\s,;]+/).map((x) => x.trim().toLowerCase()).filter(Boolean);
    if (!parts.length) return true;
    const ok: string[] = [];
    const rest: string[] = [];
    let msg: string | null = null;
    for (const p of parts) {
      if (!EMAIL.test(p)) {
        rest.push(p);
        msg ??= `“${p}” doesn't look like an email address.`;
      } else if (taken.has(p)) {
        msg ??= `${p} is already in the workspace or invited.`;
      } else ok.push(p);
    }
    if (ok.length) setEmails((l) => [...new Set([...l, ...ok])]);
    setDraft(rest.join(' '));
    setError(msg);
    return msg === null;
  };

  const send = async () => {
    let list = emails;
    if (draft.trim()) {
      const parts = draft.split(/[\s,;]+/).map((x) => x.trim().toLowerCase()).filter(Boolean);
      if (!commit(draft)) return; // show the problem before sending anything
      list = [...new Set([...emails, ...parts])];
    }
    if (!list.length) return setError('Add at least one email address.');
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    actions.invite(list, role, message.trim() || undefined);
    setBusy(false);
    onClose();
    toast({ title: list.length === 1 ? `Invitation sent to ${list[0]}` : `${list.length} invitations sent`, body: `They'll join as ${ROLE_INFO[role].label.toLowerCase()}s.` });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon={UserPlus}
      title="Invite people to Brand Co."
      description="They'll see this workspace: requests, proposals and documents. Chats stay private."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={send} loading={busy}>
            Send invitation{emails.length > 1 ? 's' : ''}
          </Button>
        </>
      }
    >
      <div className="stack">
        <Field label="Email addresses" htmlFor="inv-emails" error={error ?? undefined} hint="Press Enter or comma after each address.">
          <div className={cx('token-input', error && 'has-error')} onClick={() => inputRef.current?.focus()}>
            {emails.map((e) => (
              <span key={e} className={cx('token', e.split('@')[1] !== domain && 'token--ext')}>
                {e}
                <button aria-label={`Remove ${e}`} onClick={() => setEmails((l) => l.filter((x) => x !== e))}>
                  <X size={12} />
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              id="inv-emails"
              value={draft}
              placeholder={emails.length ? '' : `name@${domain}`}
              onChange={(e) => {
                const v = e.target.value;
                setError(null);
                // Commit on a trailing separator too (paste, IME, mobile keyboards).
                if (/[,;\s]$/.test(v) && v.trim()) commit(v);
                else setDraft(v);
              }}
              onKeyDown={(e) => {
                if (['Enter', ',', ' ', 'Tab'].includes(e.key) && draft.trim()) {
                  e.preventDefault();
                  commit(draft);
                } else if (e.key === 'Backspace' && !draft && emails.length) {
                  setEmails((l) => l.slice(0, -1));
                }
              }}
              onBlur={() => draft.trim() && commit(draft)}
              onPaste={(e) => {
                e.preventDefault();
                commit(e.clipboardData.getData('text'));
              }}
              data-autofocus
            />
          </div>
        </Field>
        {external.length > 0 && (
          <div className="warn-note">
            <AlertTriangle size={15} />
            <span>
              {external.join(', ')} {external.length === 1 ? 'is' : 'are'} outside @{domain}. They'll see pricing and internal discussions.
            </span>
          </div>
        )}
        <Field label="Role" htmlFor="inv-role" hint={ROLE_INFO[role].desc}>
          <Select id="inv-role" value={role} onChange={(e) => setRole(e.target.value as ClientRole)}>
            {(Object.keys(ROLE_INFO) as ClientRole[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_INFO[r].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Personal note" htmlFor="inv-msg" optional>
          <Textarea id="inv-msg" rows={2} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Joining for the Riyadh launch." />
        </Field>
      </div>
    </Dialog>
  );
}

const PREF_ROWS: { key: NotifKey; label: string; desc: string }[] = [
  { key: 'proposals', label: 'Proposals and decisions', desc: 'New proposals, revisions and approvals.' },
  { key: 'requests', label: 'Request updates', desc: 'Status changes and comments on requests.' },
  { key: 'files', label: 'Files and approvals', desc: 'New documents and files waiting for your approval.' },
  { key: 'team', label: 'Team', desc: 'People joining or leaving the workspace.' },
];

function NotificationPrefs() {
  const { state, actions } = useStore();
  return (
    <div className="prefs">
      <div className="prefs__row prefs__row--head">
        <span />
        <span>In app</span>
        <span>Email</span>
      </div>
      {PREF_ROWS.map((r) => (
        <div key={r.key} className="prefs__row">
          <div>
            <div className="member__name">{r.label}</div>
            <div className="faint">{r.desc}</div>
          </div>
          <Switch checked={state.prefs[r.key].inApp} onChange={(v) => actions.setPref(r.key, 'inApp', v)} label={`${r.label} in app`} />
          <Switch checked={state.prefs[r.key].email} onChange={(v) => actions.setPref(r.key, 'email', v)} label={`${r.label} by email`} />
        </div>
      ))}
    </div>
  );
}

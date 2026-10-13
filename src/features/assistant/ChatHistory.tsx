// Chat history, opened from the rail as a panel, with a search on top. It lists
// every chat in the brand workspace: Hassan wants invited teammates "to see the
// conversation going on" (call, 8 Oct). Teammates' chats show the author and
// can be read, not renamed or deleted.
import { useMemo, useState } from 'react';
import { MoreHorizontal, Pencil, Search, Trash2 } from 'lucide-react';
import { personById, useStore } from '../../state/store';
import { navigate, useRoute } from '../../lib/router';
import { Button, Input, cx } from '../../components/ui/primitives';
import { Dialog, Menu } from '../../components/ui/overlay';
import { useToast } from '../../components/ui/toast';
import { fmtRelative } from '../../lib/format';
import type { Conversation } from '../../data/types';

function group(list: Conversation[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const week = today.getTime() - 6 * 86400000;
  const out: { label: string; items: Conversation[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Previous 7 days', items: [] },
    { label: 'Older', items: [] },
  ];
  for (const c of list) {
    const t = new Date(c.updatedAt).getTime();
    out[t >= today.getTime() ? 0 : t >= week ? 1 : 2].items.push(c);
  }
  return out.filter((g) => g.items.length);
}

export function ChatHistory() {
  const { state, me, actions } = useStore();
  const toast = useToast();
  const { parts } = useRoute();
  const activeId = parts[0] === 'assistant' ? parts[1] : undefined;
  const [q, setQ] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [confirm, setConfirm] = useState<string | null>(null);

  const list = useMemo(
    () =>
      [...state.conversations]
        .filter((c) => c.messages.some((m) => m.role === 'user'))
        .filter((c) => c.title.toLowerCase().includes(q.trim().toLowerCase()))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [state.conversations, q],
  );
  const toDelete = state.conversations.find((c) => c.id === confirm);

  return (
    <div className="history history--sidebar">
      <Input icon={Search} placeholder="Search chats" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search chats" className="history__search" />

      <div className="history__list">
        {list.length === 0 && <div className="history__empty">{q.trim() ? 'No chats match your search.' : 'No chats yet. Start one above.'}</div>}
        {group(list).map((g) => (
          <div key={g.label} className="history__group">
            <div className="history__label">{g.label}</div>
            {g.items.map((c) => (
              <div key={c.id} className={cx('hitem', c.id === activeId && 'is-active')}>
                {renaming === c.id ? (
                  <form
                    className="hitem__rename"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (draft.trim()) actions.renameConversation(c.id, draft.trim());
                      setRenaming(null);
                    }}
                  >
                    <Input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => setRenaming(null)} onKeyDown={(e) => e.key === 'Escape' && setRenaming(null)} aria-label="Chat name" />
                  </form>
                ) : (
                  <a className="hitem__link" href={`#/assistant/${c.id}`} title={`${c.title} · ${fmtRelative(c.updatedAt)}`}>
                    <span className="hitem__title">{c.title}</span>
                    {c.createdBy !== me.id && <span className="hitem__meta">{personById(state, c.createdBy).name.split(' ')[0]}</span>}
                  </a>
                )}
                {c.createdBy === me.id && (
                <Menu
                  width={170}
                  trigger={({ toggle, ref }) => (
                    <button ref={ref} className="hitem__more" onClick={toggle} aria-label={`Options for ${c.title}`}>
                      <MoreHorizontal size={15} />
                    </button>
                  )}
                  items={[
                    { label: 'Rename', icon: Pencil, onSelect: () => (setDraft(c.title), setRenaming(c.id)) },
                    { label: 'Delete', icon: Trash2, danger: true, onSelect: () => setConfirm(c.id) },
                  ]}
                />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <Dialog
        open={!!toDelete}
        onClose={() => setConfirm(null)}
        size="sm"
        icon={Trash2}
        tone="danger"
        title="Delete this chat?"
        description={toDelete?.requestIds.length ? 'Requests created from it stay in Requests, with their excerpt.' : 'This can’t be undone.'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => {
                const id = confirm!;
                actions.deleteConversation(id);
                setConfirm(null);
                toast({ title: 'Chat deleted' });
                if (id === activeId) navigate('/assistant');
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="muted">“{toDelete?.title}”</p>
      </Dialog>
    </div>
  );
}

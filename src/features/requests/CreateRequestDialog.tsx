// Creating a request for Spark: a dialog with just the form. The conversation
// it came from is attached automatically (the focused answer and the question
// before it) and shown back to the client once the request is sent.
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BarChart3, Camera, Check, FileText, Lightbulb, Megaphone, Palette, Send, type LucideIcon } from 'lucide-react';
import { Dialog, IconTile } from '../../components/ui/overlay';
import { Button, Field, Input, Select, Textarea, cx } from '../../components/ui/primitives';
import { useStore } from '../../state/store';
import type { Conversation, Message, RequestType, Source, Timing } from '../../data/types';
import { navigate } from '../../lib/router';

export interface RequestPrefill {
  title?: string;
  type?: RequestType;
  description?: string;
  conversationId?: string;
  focusMessageId?: string;
}

export const TYPES: RequestType[] = ['Strategy', 'Creative', 'Content', 'Research', 'Social', 'Other'];

// Each request type has its icon, shown beside the type's name (picked on #/demo/requests-ui, 5).
export const TYPE_ICON: Record<RequestType, LucideIcon> = {
  Strategy: Lightbulb,
  Creative: Palette,
  Content: FileText,
  Research: BarChart3,
  Social: Megaphone,
  Other: Camera,
};
export const TIMINGS: Timing[] = ['ASAP', 'Within 2 weeks', 'This quarter', 'Flexible'];
const plain = (t: string) => t.replace(/\*\*/g, '');

export interface Fields {
  title: string;
  type: RequestType;
  timing: Timing;
  description: string;
  budget: string;
}
type Errors = Partial<Record<'title' | 'description', string>>;

// ---- What the request is based on -----------------------------------------------

export interface Basis {
  conversation: Conversation;
  messages: Message[]; // question + answer
  sources: Source[];
}

export function useBasis(conversationId?: string, focusMessageId?: string): Basis | undefined {
  const { state } = useStore();
  return useMemo(() => {
    const conversation = conversationId ? state.conversations.find((c) => c.id === conversationId) : undefined;
    if (!conversation) return undefined;
    const list = conversation.messages.filter((m) => (m.role === 'user' || m.role === 'assistant') && m.state !== 'thinking' && m.state !== 'error' && m.text);
    if (!list.length) return undefined;
    let i = focusMessageId ? list.findIndex((m) => m.id === focusMessageId) : -1;
    if (i < 0) i = list.length - 1;
    const messages = i > 0 && list[i - 1].role === 'user' ? [list[i - 1], list[i]] : [list[i]];
    const sources = messages.flatMap((m) => m.sources ?? []);
    return { conversation, messages, sources };
  }, [state.conversations, conversationId, focusMessageId]);
}

export function defaultFields(prefill: RequestPrefill | undefined, basis: Basis | undefined): Fields {
  const answer = basis?.messages.find((m) => m.role === 'assistant');
  // Liked sample visuals become the start of the client's own ask.
  const liked = answer?.visuals?.filter((v) => v.liked).map((v) => v.name) ?? [];
  const likedLine = liked.length ? `We like the ${liked.join(' and ')} direction${liked.length > 1 ? 's' : ''}. ` : '';
  return {
    title: prefill?.title ?? '',
    type: prefill?.type ?? 'Strategy',
    timing: 'Within 2 weeks',
    budget: '',
    description:
      prefill?.description ??
      (answer
        ? answer.findings?.length
          ? `Key findings from the assistant:\n${answer.findings.map((f) => `• ${f.title}`).join('\n')}\n\nWhat we'd like from Spark: ${likedLine}`
          : `From the assistant: ${plain(answer.text).split('\n')[0]}\n\nWhat we'd like from Spark: ${likedLine}`
        : ''),
  };
}

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.title.trim().length < 4) e.title = 'Give the request a short, specific title.';
  if (f.description.trim().length < 12) e.description = 'Describe what you need, in a sentence or two.';
  return e;
}

/** Shared submit: creates the request with the conversation attached. */
function useSubmit() {
  const { actions } = useStore();
  return (f: Fields, basis?: Basis) =>
    actions.createRequest({
      title: f.title.trim(),
      type: f.type,
      timing: f.timing,
      budget: f.budget.trim() || undefined,
      description: f.description.trim(),
      excerpt: basis
        ? {
            conversationId: basis.conversation.id,
            messages: basis.messages.map((m) => ({ role: m.role as 'user' | 'assistant', text: plain(m.text) })),
            findings: basis.messages.find((m) => m.role === 'assistant')?.findings,
          }
        : undefined,
      sourceIds: [...new Set(basis?.sources.filter((s) => s.docId).map((s) => s.docId!) ?? [])],
    });
}

// ---- Building blocks ------------------------------------------------------------------

export function RequestFields({ value, onChange, errors, idPrefix = 'rq', compact }: { value: Fields; onChange: (f: Fields) => void; errors: Errors; idPrefix?: string; compact?: boolean }) {
  const set = (patch: Partial<Fields>) => onChange({ ...value, ...patch });
  return (
    <div className={cx('stack', compact && 'stack--tight')}>
      <Field label="Title" htmlFor={`${idPrefix}-title`} error={errors.title}>
        <Input id={`${idPrefix}-title`} value={value.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Trademark check for Riyadh" data-autofocus />
      </Field>
      <div className="row">
        <Field label="Type" htmlFor={`${idPrefix}-type`}>
          <Select id={`${idPrefix}-type`} icon={TYPE_ICON[value.type]} value={value.type} onChange={(e) => set({ type: e.target.value as RequestType })}>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Timing" htmlFor={`${idPrefix}-timing`}>
          <Select id={`${idPrefix}-timing`} value={value.timing} onChange={(e) => set({ timing: e.target.value as Timing })}>
            {TIMINGS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="What do you need?" htmlFor={`${idPrefix}-desc`} error={errors.description}>
        <Textarea id={`${idPrefix}-desc`} rows={compact ? 5 : 6} value={value.description} onChange={(e) => set({ description: e.target.value })} placeholder="Context, what a good result looks like, any constraints." />
      </Field>
      <Field label="Budget" htmlFor={`${idPrefix}-budget`} optional hint="A range helps Spark scope the right proposal.">
        <Input id={`${idPrefix}-budget`} value={value.budget} onChange={(e) => set({ budget: e.target.value })} placeholder="e.g. AED 20–40k" />
      </Field>
    </div>
  );
}

/** Success screen, after the "autopilot is on" reference: a lit icon tile,
 *  a clear title, then the way on. */
export function RequestSent({ onClose, closeLabel }: { id?: string; title?: string; onClose: () => void; closeLabel: string }) {
  return (
    <div className="req-done">
      <IconTile icon={Check} tone="ai" />
      <h2 className="req-done__title">Request sent</h2>
      <p className="req-done__reply">Your request has been sent successfully! You’ll usually receive a reply within 2 business days. We’ll notify you as soon as Spark responds.</p>
      <div className="req-done__actions">
        <Button variant="secondary" onClick={onClose}>
          {closeLabel}
        </Button>
        <Button
          variant="primary"
          iconRight={ArrowRight}
          onClick={() => {
            onClose();
            navigate('/requests');
          }}
          data-autofocus
        >
          Go to requests
        </Button>
      </div>
    </div>
  );
}

// ---- Dialog ------------------------------------------------------------------------

export function CreateRequestDialog({ open, onClose, prefill }: { open: boolean; onClose: () => void; prefill?: RequestPrefill }) {
  const basis = useBasis(prefill?.conversationId, prefill?.focusMessageId);
  const submit = useSubmit();
  const [fields, setFields] = useState<Fields>(() => defaultFields(prefill, basis));
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    setFields(defaultFields(prefill, basis));
    setErrors({});
    setBusy(false);
    setDone(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const send = async () => {
    const e = validate(fields);
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 650));
    const id = submit(fields, basis);
    setBusy(false);
    setDone({ id, title: fields.title.trim() });
  };

  if (done)
    return (
      <Dialog open={open} onClose={onClose} size="md">
        <RequestSent id={done.id} title={done.title} onClose={onClose} closeLabel={basis ? 'Back to chat' : 'Close'} />
      </Dialog>
    );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="md"
      icon={Send}
      title="New request"
      description={basis ? 'Describe what you need.' : 'Describe what you need. You’ll get questions or a proposal back.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={send} loading={busy}>
            Send request
          </Button>
        </>
      }
    >
      <RequestFields value={fields} onChange={setFields} errors={errors} />
    </Dialog>
  );
}

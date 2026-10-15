// Prototype-only page (#/demo/modals): every modal in the portal, with six
// looks for the icon tile, each after BRAND_GUIDELINES.md. Pick a look at the
// top; the strip under it compares the three kinds of moment (human, AI,
// destructive) across all looks.
import { useState } from 'react';
import { Check, PenLine, Send, Trash2, UserMinus, UserPlus, X, type LucideIcon } from 'lucide-react';
import { Button, PageHeader, cx } from '../../components/ui/primitives';

/** human: the client acts (Cobalt) · ai: Spark takes over (Noor) · danger: can't be undone. */
type Kind = 'human' | 'ai' | 'danger';

const MODALS: { icon: LucideIcon; kind: Kind; title: string; desc: string; where: string; cta: string; danger?: boolean }[] = [
  { icon: Send, kind: 'human', title: 'New request', desc: 'Describe what you need. You’ll get questions or a proposal back.', where: 'Requests · New request', cta: 'Send to Spark' },
  { icon: Check, kind: 'ai', title: 'Request sent to Spark', desc: 'Dana will reply within a working day.', where: 'After sending a request', cta: 'Open request' },
  { icon: Check, kind: 'human', title: 'Approve this proposal?', desc: 'AED 54,000 excl. VAT · 6 weeks. Spark will invoice 50% on approval.', where: 'Proposal · Approve', cta: 'Approve' },
  { icon: PenLine, kind: 'human', title: 'Request changes', desc: 'Tell Dana what should change before you approve.', where: 'Proposal · Request changes', cta: 'Send changes' },
  { icon: X, kind: 'danger', title: 'Decline this proposal?', desc: 'The request closes. You can start a new one any time.', where: 'Proposal · Decline', cta: 'Decline proposal', danger: true },
  { icon: PenLine, kind: 'human', title: 'Request changes', desc: 'Tell Youssef what should change in Packaging concepts — round 1.', where: 'Documents · File review', cta: 'Send changes' },
  { icon: UserPlus, kind: 'human', title: 'Invite your team', desc: 'They’ll see this workspace: requests, proposals and documents.', where: 'Team · Invite people', cta: 'Send invitation' },
  { icon: UserMinus, kind: 'danger', title: 'Remove Omar Saeed?', desc: 'They lose access straight away. Their comments and requests stay.', where: 'Team · Remove', cta: 'Remove', danger: true },
  { icon: Trash2, kind: 'danger', title: 'Delete this chat?', desc: 'This can’t be undone.', where: 'Chats · Delete', cta: 'Delete chat', danger: true },
];

const LOOKS = [
  {
    id: 'today',
    name: 'Today',
    ref: 'Cobalt glass for the client, the Noor spectrum for AI, Ink for destructive.',
  },
  {
    id: 'frosted',
    name: 'Frosted + light beneath',
    ref: 'Picked, now on every modal. “01 Frosted glass body · 02 Spectrum underneath · 03 Ink or white on top” (p. 16). Depth from light, not shadow (Material). A milky glass squircle, an Ink glyph, the glow of its kind under it.',
  },
  {
    id: 'inside',
    name: 'Light inside the glass',
    ref: 'Icon tile: “glass squircle with the spectrum inside and a white glyph” (p. 16); the app icon is “lit from inside” (pp. 9, 16). The light is blurred and grainy, never a flat gradient (Noor rules).',
  },
  {
    id: 'ink',
    name: 'Ink object, the spark',
    ref: '“Ink objects carry the spark” (p. 18). An Ink squircle with a white glyph and a small spark sign in the corner (p. 19): Cobalt for the client, Ember for AI, none for destructive.',
  },
  {
    id: 'plaque',
    name: 'Sand plaque',
    ref: 'After the glass logo plaque (p. 16): a Sand squircle with a bright refractive edge, the glyph in its colour (Cobalt human, Ember AI), a soft coloured glow on the ground.',
  },
  {
    id: 'finder',
    name: 'Viewfinder',
    ref: 'Viewfinder corner brackets framing an object, with a mono tag (pp. 19–20). No tile: the glyph framed by four corners, a mono label under it (“INVITE”, “SPARK”).',
  },
] as const;

type LookId = (typeof LOOKS)[number]['id'];

function Spark() {
  return (
    <svg viewBox="0 0 100 100" className="itile__spark" aria-hidden>
      <path d="M50 4 C53 34 66 47 96 50 C66 53 53 66 50 96 C47 66 34 53 4 50 C34 47 47 34 50 4 Z" fill="currentColor" />
    </svg>
  );
}

const TAGS: Record<Kind, string> = { human: 'You', ai: 'Spark', danger: 'Final' };

function Tile({ look, icon: Icon, kind }: { look: LookId; icon: LucideIcon; kind: Kind }) {
  return (
    <span className={cx('itile', `itile--${look}`, `is-${kind}`)} aria-hidden>
      {look === 'finder' && (
        <>
          <span className="itile__c itile__c--tl" />
          <span className="itile__c itile__c--tr" />
          <span className="itile__c itile__c--bl" />
          <span className="itile__c itile__c--br" />
        </>
      )}
      <Icon size={look === 'finder' ? 24 : 26} strokeWidth={1.8} />
      {look === 'ink' && kind !== 'danger' && <Spark />}
      {look === 'finder' && <span className="itile__tag">{TAGS[kind]}</span>}
    </span>
  );
}

function Modal({ look, m }: { look: LookId; m: (typeof MODALS)[number] }) {
  return (
    <div className="mdemo__cell">
      <div className="mdemo__where">{m.where}</div>
      <div className="dialog dialog--sm dialog--hero mdemo__dialog">
        <div className="dialog__head">
          <div>
            <Tile look={look} icon={m.icon} kind={m.kind} />
            <h2 className="dialog__title">{m.title}</h2>
            <p className="dialog__desc">{m.desc}</p>
          </div>
        </div>
        <div className="dialog__foot">
          <Button>Cancel</Button>
          <span className="spacer" />
          <Button variant={m.danger ? 'danger' : 'primary'}>{m.cta}</Button>
        </div>
      </div>
    </div>
  );
}

export function ModalsDemo() {
  const [look, setLook] = useState<LookId>('frosted');
  const current = LOOKS.find((l) => l.id === look)!;
  return (
    <div className="cdemo mdemo">
      <PageHeader
        title="Modals"
        sub="Every modal in the portal, with six looks for the icon tile after the brand file (BRAND_GUIDELINES.md). Pick a look; the strip compares the three kinds of moment across all of them."
      />

      <div className="mdemo__strip">
        {LOOKS.map((l, i) => (
          <button key={l.id} className={cx('mdemo__look', look === l.id && 'is-on')} onClick={() => setLook(l.id)} aria-pressed={look === l.id}>
            <span className="mdemo__look-name">
              {i + 1} · {l.name}
            </span>
            <span className="mdemo__look-tiles">
              <Tile look={l.id} icon={UserPlus} kind="human" />
              <Tile look={l.id} icon={Check} kind="ai" />
              <Tile look={l.id} icon={Trash2} kind="danger" />
            </span>
          </button>
        ))}
      </div>

      <p className="mdemo__ref">
        <strong>{current.name}.</strong> {current.ref}
      </p>

      <div className="mdemo__grid">
        {MODALS.map((m, i) => (
          <Modal key={i} look={look} m={m} />
        ))}
      </div>
    </div>
  );
}

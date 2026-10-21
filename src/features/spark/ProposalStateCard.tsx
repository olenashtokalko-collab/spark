// The proposal block on a Spark request page, in its three moments:
// 1. none yet: an invitation to write one; 2. a draft: carry on editing;
// 3. sent (an envelope), and once the client answers, a bell joins it with what they said.
// Every moment is the same dashed block with a flat illustration in the style of the reference.
import type { ReactNode } from 'react';
import { Button } from '../../components/ui/primitives';
import { aed, fmtDate } from '../../lib/format';
import { navigate } from '../../lib/router';
import type { Person, Proposal } from '../../data/types';
import { AnsweredFlat, DocFlat, DraftFlat, EnvelopeBellBadgeFlat, EnvelopeBellFlat, EnvelopeFlat, GREEN, RED, ROSE } from './SentIcons';

export interface SentProposal {
  version: number;
  title: string;
  total: number;
  sentAt: string;
  validUntil: string;
  status: Proposal['status'];
  decider?: Person;
  decidedAt?: string;
  /** Sample requests carry their dates already written out ("16 Oct"). */
  sentLabel?: string;
  decidedLabel?: string;
  note?: string;
}

export function ProposalStateCard({
  first,
  href,
  onCreate,
  draft,
  sent,
  bell = 'badge',
}: {
  first: string;
  href: string;
  onCreate: () => void;
  draft?: { title: string; ready: number; savedAt: string };
  sent?: SentProposal;
  /** How the bell shows once the client answered: a second tile after the envelope, inside the tile, or in a round badge like the plus. */
  bell?: 'pair' | 'inside' | 'badge';
}) {
  if (!sent && !draft)
    return (
      <Block icon={<DocFlat />} title="Create proposal" body="Scope, timeline and price in one place.">
        <Button size="sm" variant="primary" onClick={onCreate}>
          Create
        </Button>
      </Block>
    );

  if (!sent && draft)
    return (
      <Block
        icon={<DraftFlat />}
        title="Proposal draft"
        body={`${draft.ready} of 6 sections ready`}
      >
        <Button size="sm" onClick={() => navigate(href)}>
          Edit
        </Button>
      </Block>
    );

  const p = sent!;
  const view = (
    <Button size="sm" onClick={() => navigate(href)}>
      Open
    </Button>
  );

  if (p.status === 'awaiting' || p.status === 'superseded')
    return (
      <Block icon={<EnvelopeFlat />} title={p.version > 1 ? 'Proposal resent' : 'Proposal sent'} body={`${aed(p.total)} · ${p.version > 1 ? 'resent' : 'sent'} ${p.sentLabel ?? fmtDate(p.sentAt)}.`}>
        {view}
      </Block>
    );

  // The client answered: the envelope with a bell, and what they did.
  const who = p.decider?.name.split(' ')[0] ?? first;
  const did = p.status === 'changes_requested' ? 'requested changes to the proposal' : p.status === 'approved' ? 'approved the proposal' : 'rejected the proposal';
  return (
    <Block
      icon={bell === 'inside' ? <EnvelopeBellFlat /> : bell === 'badge' ? (
          p.status === 'approved' ? (
            <EnvelopeBellBadgeFlat palette={GREEN} glyph="up" />
          ) : p.status === 'declined' ? (
            <EnvelopeBellBadgeFlat palette={RED} glyph="down" />
          ) : (
            <EnvelopeBellBadgeFlat palette={ROSE} />
          )
        ) : <AnsweredFlat />}
      title="Proposal reviewed"
      body={`${who} ${did}${p.decidedLabel ? ` · ${p.decidedLabel}` : p.decidedAt ? ` · ${fmtDate(p.decidedAt)}` : ''}`}
    >
      {view}
    </Block>
  );
}

/** The dashed block every moment uses: an illustration, a title and a line, an action on the right. */
function Block({ icon, title, body, children }: { icon: ReactNode; title: string; body: ReactNode; children: ReactNode }) {
  return (
    <div className="ask-empty">
      {icon}
      <div>
        <div className="ask-empty__title">{title}</div>
        <div className="faint">{body}</div>
      </div>
      {children}
    </div>
  );
}

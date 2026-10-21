// Prototype-only page (#/demo/proposal-states): every state of the proposal block on a
// Spark request page, side by side: none yet, a draft, and sent with each client answer.
import { useState } from 'react';
import { PageHeader, Segmented } from '../../components/ui/primitives';
import { ProposalStateCard, type SentProposal } from '../spark/ProposalStateCard';

const layla = { id: 'u-layla', name: 'Layla Haddad', email: '', title: '', org: 'client' as const, hue: 20 };
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const sent: SentProposal = {
  version: 1,
  title: 'Riyadh launch campaign',
  total: 186000,
  sentAt: '2026-10-06T10:00:00',
  validUntil: '2026-10-20',
  status: 'awaiting',
};

const STATES: { id: string; name: string; note: string; props: Parameters<typeof ProposalStateCard>[0] }[] = [
  {
    id: 'none',
    name: '1 · No proposal yet',
    note: 'Invites the manager to write one, and says why: the client can approve it in the portal and work can start.',
    props: { first: 'Layla', href: '/demo/proposal-states', onCreate: () => {} },
  },
  {
    id: 'draft',
    name: '2 · Draft, not sent',
    note: 'How far it is and when it was saved; the client doesn’t see it yet. Continue editing opens it.',
    props: { first: 'Layla', href: '/demo/proposal-states', onCreate: () => {}, draft: { title: 'Riyadh launch campaign', ready: 4, savedAt: hoursAgo(20) } },
  },
  {
    id: 'awaiting',
    name: '3a · Sent, waiting for the client',
    note: 'The envelope: version, price and date, and what the client can do with it by when.',
    props: { first: 'Layla', href: '/demo/proposal-states', onCreate: () => {}, sent },
  },
  {
    id: 'changes',
    name: '3b · Changes requested',
    note: 'A bell comes in after the envelope: who answered, the status, and their note.',
    props: {
      first: 'Layla',
      href: '/demo/proposal-states',
      onCreate: () => {},
      sent: { ...sent, status: 'changes_requested', decider: layla, decidedAt: '2026-10-09T10:00:00', note: 'Half the creators Arabic-first, and start a week later, after the school holidays.' },
    },
  },
  {
    id: 'next',
    name: '3c · Changes requested, next version in progress',
    note: 'The same, plus a line that version 2 is already being written.',
    props: {
      first: 'Layla',
      href: '/demo/proposal-states',
      onCreate: () => {},
      draft: { title: 'Riyadh launch campaign', ready: 6, savedAt: hoursAgo(2) },
      sent: { ...sent, status: 'changes_requested', decider: layla, decidedAt: '2026-10-09T10:00:00', note: 'Half the creators Arabic-first, and start a week later, after the school holidays.' },
    },
  },
  {
    id: 'approved',
    name: '3d · Approved',
    note: 'Green tile, the envelope with a thumb up in the badge.',
    props: { first: 'Layla', href: '/demo/proposal-states', onCreate: () => {}, sent: { ...sent, version: 3, total: 184000, status: 'approved', decider: layla, decidedAt: '2026-10-09T10:00:00', note: 'Looks good, let’s go.' } },
  },
  {
    id: 'declined',
    name: '3e · Declined',
    note: 'Red tile, the envelope with a thumb down in the badge.',
    props: { first: 'Layla', href: '/demo/proposal-states', onCreate: () => {}, sent: { ...sent, status: 'declined', decider: layla, decidedAt: '2026-10-09T10:00:00', note: 'We are pausing the Riyadh opening until Q2.' } },
  },
];

export function ProposalStatesDemo() {
  const [bell, setBell] = useState<'pair' | 'inside' | 'badge'>('badge');
  return (
    <div className="cdemo cmddemo">
      <PageHeader title="Proposal on the request page" sub="Every state of the proposal block on a Spark request: none yet, a draft, and sent with each answer from the client." />
      <div className="psd-bell">
        <span className="faint">When the client answers, the bell:</span>
        <Segmented
          label="Bell"
          value={bell}
          onChange={setBell}
          items={[
            { value: 'badge', label: 'In a badge, like the plus' },
            { value: 'inside', label: 'Inside the envelope tile' },
            { value: 'pair', label: 'A tile after the envelope' },
          ]}
        />
      </div>
      <div className="psd-list">
        {STATES.map((s) => (
          <section key={s.id} className="gdemo__card">
            <header>
              <h3>{s.name}</h3>
              <p>{s.note}</p>
            </header>
            <div className="cmddemo__stage psd-stage">
              <ProposalStateCard {...s.props} bell={bell} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

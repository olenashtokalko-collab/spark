// Prototype-only page (#/demo/proposal-sent): the proposal block on a Spark request once the
// proposal is sent (an envelope, three ways) and once the client has answered (a bell joins
// the envelope, three ways), in the same dashed block as "No proposal yet".
import { useState, type ReactNode } from 'react';
import { Eye } from 'lucide-react';
import { Button, PageHeader, Segmented, Tabs } from '../../components/ui/primitives';
import { BellBadge, BellTile, EnvelopeBellBadgeFlat, EnvelopeBellFlat, EnvelopeFlat, EnvelopeHand, EnvelopeTile } from '../spark/SentIcons';

type Env = 'tile' | 'flat' | 'hand';
type Answer = 'changes' | 'approved' | 'declined';

const ENVELOPES: { id: Env; name: string; note: string }[] = [
  { id: 'tile', name: 'A · Envelope on the glass tile', note: 'The same brand tile as “No proposal yet”, with a white envelope in place of the document. Floats a little.' },
  { id: 'flat', name: 'B · Flat illustration', note: 'After the reference: a white envelope tilted on a soft blue shape. Lifts gently now and then.' },
  { id: 'hand', name: 'C · Held up by a hand', note: 'The reference in small: a hand from below holding the envelope up on one finger.' },
];
const BELLS = [
  { id: 'badge', name: '1 · Bell on the envelope', note: 'A small dark bell sits on the envelope’s corner and rings now and then, like a notification on an app icon.' },
  { id: 'pair', name: '2 · Envelope, then bell', note: 'The bell comes in after the envelope as its own tile: first “sent”, then “there’s news”.' },
  { id: 'title', name: '3 · Bell by the title', note: 'The envelope stays as it was; a ringing bell and “New” lead the title, so the update reads first.' },
  { id: 'inside', name: '4 · Bell inside the tile', note: 'One flat tile: the envelope with a dark bell over its corner, the way the draft has a pencil over the page.' },
  { id: 'plus', name: '5 · Bell in a badge, like the plus', note: 'The envelope with a round navy badge and a white bell in it, in the style of the plus on “No proposal yet”, on the top right corner like a notification. No animation.' },
] as const;

const ANSWER: Record<Answer, { title: string; dot: string; status: string; note: string; at: string }> = {
  changes: { title: 'Layla asked for changes', dot: 'neutral', status: 'Changes requested', note: 'Half the creators Arabic-first, and start a week later, after the school holidays.', at: '9 Oct' },
  approved: { title: 'Layla approved the proposal', dot: 'positive', status: 'Approved', note: 'Looks good, let’s go.', at: '13 Oct' },
  declined: { title: 'Layla declined the proposal', dot: 'danger', status: 'Declined', note: 'We are pausing the Riyadh opening until Q2.', at: '13 Oct' },
};

function Envelope({ env }: { env: Env }) {
  return env === 'tile' ? <EnvelopeTile /> : env === 'flat' ? <EnvelopeFlat /> : <EnvelopeHand />;
}

function Block({ icon, title, body, action }: { icon: ReactNode; title: ReactNode; body: ReactNode; action: ReactNode }) {
  return (
    <div className="ask-empty">
      {icon}
      <div>
        <div className="ask-empty__title">{title}</div>
        <div className="faint">{body}</div>
      </div>
      {action}
    </div>
  );
}

const View = () => (
  <Button size="sm" icon={Eye}>
    View proposal
  </Button>
);

export function ProposalSentDemo() {
  const [env, setEnv] = useState<Env>('tile');
  const [answer, setAnswer] = useState<Answer>('changes');
  const a = ANSWER[answer];
  return (
    <div className="cdemo cmddemo">
      <PageHeader
        title="Proposal sent, and the client’s answer"
        sub="The proposal block on a Spark request after sending: an envelope three ways, then three ways for a bell to join it when the client answers."
      />

      <h2 className="psn-h">Proposal sent, waiting for the client</h2>
      <div className="psd-list">
        {ENVELOPES.map((e) => (
          <section key={e.id} className="gdemo__card">
            <header>
              <h3>{e.name}</h3>
              <p>{e.note}</p>
            </header>
            <div className="cmddemo__stage psd-stage">
              <Block
                icon={<Envelope env={e.id} />}
                title="Proposal sent"
                body="Version 1 · AED 186,000 · sent 6 Oct. Layla can approve it, ask for changes or decline it by 20 Oct."
                action={<View />}
              />
            </div>
          </section>
        ))}
      </div>

      <h2 className="psn-h">The client answered</h2>
      <div className="psn-controls">
        <Tabs
          className="tabs--underline"
          value={answer}
          onChange={setAnswer}
          items={[
            { value: 'changes', label: 'Changes requested' },
            { value: 'approved', label: 'Approved' },
            { value: 'declined', label: 'Declined' },
          ]}
        />
        <Segmented
          label="Envelope"
          value={env}
          onChange={setEnv}
          items={[
            { value: 'tile', label: 'A' },
            { value: 'flat', label: 'B' },
            { value: 'hand', label: 'C' },
          ]}
        />
      </div>
      <div className="psd-list">
        {BELLS.map((b) => (
          <section key={b.id + answer + env} className="gdemo__card">
            <header>
              <h3>{b.name}</h3>
              <p>{b.note}</p>
            </header>
            <div className="cmddemo__stage psd-stage">
              <Block
                icon={
                  b.id === 'plus' ? (
                    <EnvelopeBellBadgeFlat />
                  ) : b.id === 'inside' ? (
                    <EnvelopeBellFlat />
                  ) : b.id === 'badge' ? (
                    <span className="sic-stack">
                      <Envelope env={env} />
                      <BellBadge className="sic-stack__bell" />
                    </span>
                  ) : b.id === 'pair' ? (
                    <span className="sic-pair">
                      <Envelope env={env} />
                      <span className="sic-pair__in">
                        <BellTile />
                      </span>
                    </span>
                  ) : (
                    <Envelope env={env} />
                  )
                }
                title={
                  b.id === 'title' ? (
                    <span className="sic-title">
                      <BellBadge size={18} /> <span className="sic-new">New</span> {a.title}
                    </span>
                  ) : (
                    a.title
                  )
                }
                body={
                  <>
                    <span className="sic-status">
                      <i className={`vpd-dot vpd-dot--${a.dot}`} /> {a.status} · {a.at}
                    </span>{' '}
                    “{a.note}”
                  </>
                }
                action={<View />}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

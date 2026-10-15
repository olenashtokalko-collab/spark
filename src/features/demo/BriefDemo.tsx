// Prototype-only page (#/demo/brief): looks for the "Your request" section on a request's
// Overview tab, which today is a small bold heading over a plain paragraph. Every card shows
// the same section under a stub of the Proposal card, so you can see how the two read together.
//   1 · Now       2 · Card with details (soft tile, larger text, Type · Timing · Budget)
//   3 · Lead      4 · Message (a chat bubble from the client)      5 · Tint (a soft Cobalt block)
import { FileText, PenLine } from 'lucide-react';
import { PageHeader } from '../../components/ui/primitives';
import { useStore } from '../../state/store';
import { fmtDate, fmtTime } from '../../lib/format';

const Edit = () => (
  <button className="link-btn">
    <PenLine size={13} /> Edit
  </button>
);

function ProposalStub() {
  return (
    <div className="bf__prop">
      <div className="bf__prop-head">
        Proposal <span className="rstatus rstatus--approved"><span className="rstatus__dot" />Approved</span>
      </div>
      <div className="bf__prop-nums">
        <div>
          <b>AED 96,000</b>
          <span>Investment, excl. VAT</span>
        </div>
        <div>
          <b>8 weeks</b>
          <span>from 14 Sep</span>
        </div>
        <div>
          <b>3</b>
          <span>workstreams</span>
        </div>
      </div>
    </div>
  );
}

export function BriefDemo() {
  const { state } = useStore();
  const r = state.requests.find((x) => x.id === 'REQ-103') ?? state.requests[0];
  const ask = r.description;
  const meta = [
    ['Type', r.type],
    ['Timing', r.timing],
    ...(r.budget ? [['Budget', r.budget]] : []),
  ];

  const variants: { id: string; name: string; note: string; body: React.ReactNode }[] = [
    {
      id: 'now',
      name: '1 · Now',
      note: 'A small bold heading over a plain 14px paragraph, a quiet Edit beside it. Next to the big Proposal card it reads as an afterthought.',
      body: (
        <section className="block">
          <div className="block__head">
            <h2 className="block__title">Your request</h2>
            <button className="link-btn link-btn--quiet">
              <PenLine size={13} /> Edit
            </button>
          </div>
          <div className="block__text">{ask}</div>
        </section>
      ),
    },
    {
      id: 'card',
      name: '2 · Card with details',
      note: 'A card of the Proposal family: a soft tile with the heading, the text at 16px, a text-button Edit in the corner and a quiet row with Type, Timing and Budget (already known, today only in Details).',
      body: (
        <section className="bf-card">
          <header>
            <span className="bf-tile">
              <FileText size={15} strokeWidth={1.8} />
            </span>
            <h3>Your request</h3>
            <Edit />
          </header>
          <div className="bf-card__text">{ask}</div>
          <dl className="bf-meta">
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      ),
    },
    {
      id: 'lead',
      name: '3 · Lead paragraph',
      note: 'No card. The text itself is the statement: 18px Medium, black, a thin Cobalt rule on the left and a small label above. Editorial and quick to read.',
      body: (
        <section className="bf-lead">
          <div className="bf-lead__label">
            Your request <Edit />
          </div>
          <div className="bf-lead__text">{ask}</div>
        </section>
      ),
    },
    {
      id: 'msg',
      name: '4 · Message from you',
      note: 'The request as what it was: a message you sent. The same glass bubble as your chat messages, with “You · date” under it. It ties the page to the product: you asked, Spark answered with a proposal.',
      body: (
        <section className="bf-msg">
          <div className="msg-user">
            <div className="msg-user__bubble">{ask}</div>
            <div className="msg-user__meta">
              You · {fmtDate(r.createdAt)}, {fmtTime(r.createdAt)} · <Edit />
            </div>
          </div>
        </section>
      ),
    },
    {
      id: 'tint',
      name: '5 · Soft Cobalt block',
      note: 'A block tinted Cobalt at 5% with the tile icon, the text at 16px and Edit in the corner. It stands out the most, but adds one more colour next to the amber deadline and the status pill.',
      body: (
        <section className="bf-tint">
          <span className="bf-tile is-cobalt">
            <PenLine size={15} strokeWidth={1.8} />
          </span>
          <div>
            <div className="bf-tint__head">
              <h3>Your request</h3>
              <Edit />
            </div>
            <div className="bf-tint__text">{ask}</div>
          </div>
        </section>
      ),
    },
  ];

  return (
    <div className="cdemo bfdemo">
      <PageHeader title="Your request" sub="Five looks for the “Your request” section on the Overview tab, each under the Proposal card so you can see how the two read together. The text is the real request REQ-103." />
      <div className="bfdemo__grid">
        {variants.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className="bfdemo__stage">
              <ProposalStub />
              {v.body}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

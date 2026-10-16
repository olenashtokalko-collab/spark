// Prototype-only page (#/demo/primary): should the primary colour be Ink (black) instead of Cobalt?
// The same scene (decision card, buttons, tabs, a switch, a link) in three looks:
//   Now   Cobalt is the primary button and also selection, switches, tab counts and links.
//   A     Ink primary button; Cobalt stays for selection, switches, counts and links.
//   B     Ink primary button and Ink selection; Cobalt is left only for links and focus, so it becomes rare.
// The Ink pill is the book's "FOLLOW" button (p. 19); Cobalt is "Pills: Cobalt for human" and the send arrow.
import { useState } from 'react';
import { PageHeader, Button, Tabs, Switch, cx } from '../../components/ui/primitives';
import { StateRing } from '../../components/ui/StateTile';

type Look = 'now' | 'a' | 'b';

const LOOKS: { id: Look; name: string; note: string }[] = [
  { id: 'now', name: 'Now · Cobalt primary', note: 'One colour does everything: the main button, the selected tab’s count, the switch and the links. Cobalt is the loudest thing on every screen, including screens where nothing needs a decision.' },
  { id: 'a', name: 'A · Ink primary button', note: 'Only the main button turns Ink, like the book’s “FOLLOW” pill. Cobalt keeps selection, switches, counts and links, so it still reads as “what is yours / selected”. The smallest change.' },
  { id: 'b', name: 'B · Ink primary and Ink selection', note: 'The tab count and the switch go Ink too. Cobalt remains only in links and the focus ring, and in the AI-adjacent send arrow in the chat. The calmest; the page is almost monochrome apart from the glass.' },
];

function Scene() {
  const [tab, setTab] = useState<'overview' | 'files' | 'activity'>('overview');
  const [on, setOn] = useState(true);
  return (
    <div className="pk__scene">
      <div className="proposal__side pk__side">
        <section className="decision decision--timed">
          <div className="decision__eyebrow">
            <span>Due Sun 18 Oct · in 3 days</span>
          </div>
          <div className="decision__timed">
            <div>
              <div className="decision__total">AED 54,000</div>
              <div className="decision__meta">Waiting for your decision</div>
            </div>
            <StateRing used={0.4} glyph="hourglass" tone="cobalt" />
          </div>
          <div className="decision__btns">
            <Button variant="primary" size="lg">
              Approve proposal
            </Button>
            <div className="decision__row">
              <Button>Request changes</Button>
              <Button>Decline</Button>
            </div>
          </div>
        </section>
      </div>
      <Tabs
        className="tabs--underline"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'overview', label: 'Overview' },
          { value: 'files', label: 'Files', count: 3 },
          { value: 'activity', label: 'Activity', count: 4 },
        ]}
      />
      <div className="pk__row">
        <Button variant="primary">New request</Button>
        <Button>Share</Button>
        <button className="link-btn">See proposal</button>
        <Switch checked={on} onChange={setOn} label="Notify me" />
      </div>
    </div>
  );
}

export function PrimaryDemo() {
  return (
    <div className="cdemo pkdemo">
      <PageHeader
        title="Primary colour: Cobalt or Ink?"
        sub="The same screen pieces in three looks. In the brand book Ink is the pill for the main action (“FOLLOW”, p. 19) and Cobalt marks what is human and selected, so both are on brand; the question is how often Cobalt should appear. Nothing here is applied to the app."
      />
      <div className="pkdemo__grid">
        {LOOKS.map((l) => (
          <section key={l.id} className={cx('gdemo__card', 'pk', `pk--${l.id}`)}>
            <header>
              <h3>{l.name}</h3>
              <p>{l.note}</p>
            </header>
            <Scene />
          </section>
        ))}
      </div>
    </div>
  );
}

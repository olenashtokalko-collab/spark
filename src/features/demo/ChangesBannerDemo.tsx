// Prototype-only page (#/demo/changes-banner): the banner on top of the new version's editor when the client asked
// for changes, with a small animated 3D speech bubble. Looks of the bubble, each in the banner and large:
//   A  lavender, as in the reference: floats and blinks
//   B  the brand's spectrum glass: floats, blinks, glances at the text
//   C  Cobalt, talking: the mouth moves as if it speaks
//   D  peach, nodding: tilts, with blushing cheeks
//   E  no face: three dots typing
import { PageHeader } from '../../components/ui/primitives';
import { ChatBuddy, type BuddyLook } from '../spark/ChatBuddy';

const LOOKS: { id: BuddyLook; name: string; note: string }[] = [
  { id: 'lavender', name: 'A · Lavender', note: 'As in your reference: soft lilac, floats and blinks. Calm, friendly.' },
  { id: 'spectrum', name: 'B · Spectrum glass', note: 'The brand’s Cobalt to pink, like the “No proposal yet” icon. Floats, blinks and glances at the text.' },
  { id: 'cobalt', name: 'C · Cobalt, talking', note: 'The colour of people, as on the section dots. The mouth moves as if it’s telling you what the client said.' },
  { id: 'peach', name: 'D · Peach, nodding', note: 'Warm and a little playful: tilts side to side, with blushing cheeks.' },
  { id: 'typing', name: 'E · Typing dots', note: 'No face: a pale bubble with three Cobalt dots, like someone typing. The most neutral.' },
];

function Banner({ look }: { look: BuddyLook }) {
  return (
    <div className="cbd-banner">
      <ChatBuddy look={look} size={52} />
      <div>
        <div className="cbd-banner__title">Hessa asked for changes</div>
        <div className="cbd-banner__text">Sections with a blue dot have her comments. Update them, then send version 2.</div>
      </div>
    </div>
  );
}

export function ChangesBannerDemo() {
  return (
    <div className="cdemo">
      <PageHeader
        title="Banner: the client asked for changes"
        sub="Shown on top of the new version's editor. Five looks of the bubble, each in the banner and large. Nothing here is applied to the app."
      />
      <div className="cbd__grid">
        {LOOKS.map((l) => (
          <section key={l.id} className="cbd__card">
            <header>
              <h3>{l.name}</h3>
              <p>{l.note}</p>
            </header>
            <div className="cbd__row">
              <div className="cbd__big">
                <ChatBuddy look={l.id} size={120} />
              </div>
              <Banner look={l.id} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

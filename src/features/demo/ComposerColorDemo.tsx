// Prototype-only page (#/demo/composer-color): the chat box while someone types. With the primary now Ink,
// the Cobalt send button and the Cobalt rim and halo are left over. Five looks, on the real composer, each
// with text already typed so the typing state is shown.
//   Now  Cobalt sphere, Cobalt rim and halo
//   A    Ink: a graphite glass sphere, an Ink rim and a neutral halo (the same colour as the primary button)
//   B    Spectrum: a Cobalt to Ember glass sphere, a gradient rim and a violet and pink halo
//   C    Ink sphere, spectrum rim: the button is the primary, the light is the brand
//   D    Frosted white sphere with an Ink arrow, a bright rim, the spectrum only as a glow beneath
import { PageHeader, cx } from '../../components/ui/primitives';
import { Composer } from '../assistant/Composer';

type Look = 'now' | 'a' | 'b' | 'c' | 'd';
const LOOKS: { id: Look; name: string; note: string }[] = [
  { id: 'now', name: 'Now · Cobalt', note: 'A Cobalt sphere, a Cobalt hairline and a blue halo. With the black primary button everywhere else, this is the one blue object left in the typing state.' },
  { id: 'a', name: 'A · Ink', note: 'The send button is a graphite glass sphere, the rim is a fine Ink line, and the halo is a soft neutral shadow. It is the same colour as the primary button: sending is the main action.' },
  { id: 'b', name: 'B · Spectrum', note: 'The send button is a glass sphere with the spectrum inside (Cobalt, violet, pink, Ember) and a white arrow; the rim is a thin gradient line and the halo glows violet and pink. The most on-brand, and the most colour on the page.' },
  { id: 'c', name: 'C · Ink button, spectrum rim', note: 'The button is Ink, like every primary button, and the colour lives only in the rim and the halo around the box. A calm button on a lit box.' },
  { id: 'd', name: 'D · Frosted white', note: 'A frosted white sphere with an Ink arrow, a bright white rim, and the spectrum only as a soft glow under the box. The lightest: the box stays glass and nothing is solid.' },
];

export function ComposerColorDemo() {
  return (
    <div className="cdemo csdemo">
      <PageHeader title="The chat box when you type" sub="The send button and the rim (the stroke and halo that appear when there is text) are still Cobalt. Five looks on the real composer. Nothing here is applied to the app." />
      <div className="csdemo__grid">
        {LOOKS.map((l) => (
          <section key={l.id} className={cx('gdemo__card', 'cs', `cs--${l.id}`)}>
            <header>
              <h3>{l.name}</h3>
              <p>{l.note}</p>
            </header>
            <div className="cs__stage">
              <div className="cs__box">
                <Composer onSubmit={() => {}} size="lg" initial="Can you help me draft a brief for our spring campaign?" />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

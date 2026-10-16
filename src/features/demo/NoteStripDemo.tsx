// Prototype-only page (#/demo/note-strip): the note in a chat thread ("Layla created request REQ-113 from this
// chat. View REQ-113"). The first version was too dark and had a white stroke round it. Looks, each on the sand
// page and on the chat's own colour, with the real note markup:
//   Now  the current strip
//   A    pale light: the same gradient at a fraction of the strength, no stroke
//   B    haze: Haze blue, pink and peach, almost pastel, no stroke
//   C    glow only: no fill, a soft blurred spectrum under the words
//   D    white pill with a thin spectrum line under it
import { Inbox } from 'lucide-react';
import { PageHeader, cx } from '../../components/ui/primitives';

type Look = 'now' | 'a' | 'b' | 'c' | 'd';
const LOOKS: { id: Look; name: string; note: string }[] = [
  { id: 'now', name: 'Now', note: 'A saturated strip with a white stroke round it: heavy next to the quiet type of the thread.' },
  { id: 'a', name: 'A · Pale light', note: 'The same Cobalt to Ember light at about a third of the strength over white; no stroke, no edge. The closest to what you have now, lighter.' },
  { id: 'b', name: 'B · Haze', note: 'Haze blue, pink and peach: almost pastel, no stroke. Reads as a soft label, not a button.' },
  { id: 'c', name: 'C · Glow only', note: 'No fill and no edge: the words sit on a soft blurred spectrum glow, so there is no box at all. The lightest.' },
  { id: 'd', name: 'D · White with a light line', note: 'A plain white pill and a thin spectrum line under it, the way the brand shows light under glass.' },
];

function Note({ look }: { look: Look }) {
  return (
    <div className={cx('msg-system', 'ns', `ns--${look}`)}>
      <Inbox size={14} />
      <span>Layla created request REQ-113 from this chat.</span>
      <a className="link" href="#/demo/note-strip">
        View REQ-113
      </a>
    </div>
  );
}

export function NoteStripDemo() {
  return (
    <div className="cdemo nsdemo">
      <PageHeader title="The note in the chat" sub="The “request created from this chat” note was too dark and had a stroke. Five looks, each on the sand page and on the chat’s colour. Nothing here is applied to the app." />
      <div className="nsdemo__grid">
        {LOOKS.map((l) => (
          <section key={l.id} className="gdemo__card">
            <header>
              <h3>{l.name}</h3>
              <p>{l.note}</p>
            </header>
            <div className="nsdemo__row">
              <div className="nsdemo__stage nsdemo__stage--sand">
                <Note look={l.id} />
              </div>
              <div className="nsdemo__stage nsdemo__stage--chat">
                <Note look={l.id} />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

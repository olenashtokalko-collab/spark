// Prototype-only page (#/demo/rail-hover): what the sidebar's items could do under the pointer in the glass variant,
// in place of the grey. In each, Home is the picked item and Chats shows the hover; point at the others too.
import { FileText, Home, Inbox, MessageSquare } from 'lucide-react';
import { PageHeader, cx } from '../../components/ui/primitives';

const LOOKS = [
  { v: 'grey', label: 'Now · grey', note: 'A grey plate under the pointer.' },
  { v: 'half', label: '1 · Half white', note: 'The picked item’s white at about half: under the pointer it shows, on a click it turns solid.' },
  { v: 'bubble', label: '2 · Glass bubble', note: 'The filter tabs’ bubble: almost clear, a white rim and a highlight.' },
  { v: 'text', label: '3 · No plate', note: 'Only the words and the icon go from grey to Ink.' },
  { v: 'rim', label: '4 · White rim', note: 'A thin white outline of the plate, no fill.' },
] as const;

const ITEMS = [
  { label: 'Home', icon: Home },
  { label: 'Chats', icon: MessageSquare },
  { label: 'Requests', icon: Inbox },
  { label: 'Documents', icon: FileText },
];

export function RailHoverDemo() {
  return (
    <div className="cdemo">
      <PageHeader title="Glass · sidebar hover" sub="What the sidebar’s items could do under the pointer, instead of the grey. Home is picked; Chats shows the hover. Point at the others too. Prototype only." />
      <div className="rhd-grid">
        {LOOKS.map((l) => (
          <section key={l.v} className="rhd-col">
            <span className="gk-label">{l.label}</span>
            <nav className={cx('rhd-rail', `rhd--${l.v}`)}>
              {ITEMS.map(({ label, icon: I }) => (
                <a key={label} className={cx('rhd-item', label === 'Home' && 'is-on', label === 'Chats' && 'is-hover')}>
                  <I size={18} strokeWidth={1.7} />
                  {label}
                </a>
              ))}
            </nav>
            <p className="fdm-about">{l.note}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

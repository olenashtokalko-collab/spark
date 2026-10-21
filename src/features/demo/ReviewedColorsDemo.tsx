// Prototype-only page (#/demo/reviewed-colors): colours for the "Proposal reviewed" illustration,
// so news from the client stands apart from "Proposal sent" (always the quiet blue).
import { Button, PageHeader } from '../../components/ui/primitives';
import { BLUE, ROSE, EnvelopeBellBadgeFlat, EnvelopeFlat, type FlatPalette } from '../spark/SentIcons';

type Answer = 'changes' | 'approved' | 'rejected';
const TEXT: Record<Answer, string> = {
  changes: 'Layla requested changes to the proposal · 9 Oct',
  approved: 'Layla approved the proposal · 13 Oct',
  rejected: 'Layla rejected the proposal · 13 Oct',
};

const VARIANTS: { id: string; name: string; note: string; palette: (a: Answer) => FlatPalette }[] = [
  { id: 'blue', name: '1 · Today: the same blue', note: 'For comparison: reviewed looks like sent, only the bell tells them apart.', palette: () => BLUE },
  {
    id: 'sand',
    name: '2 · Warm sand',
    note: 'One warm colour for any news from the client. Stands out from the blue “sent” without saying good or bad.',
    palette: () => ({ bg: '#e2c9a6', badge: '#8a5a2b', bell: '#fff' }),
  },
  {
    id: 'status',
    name: '3 · By the answer',
    note: 'The tile takes the answer’s colour, muted: amber for changes, sage for approved, dusty rose for rejected.',
    palette: (a) =>
      a === 'changes' ? { bg: '#e6cf9e', badge: '#8a6420', bell: '#fff' } : a === 'approved' ? { bg: '#b5cdb8', badge: '#2f6b45', bell: '#fff' } : { bg: '#dcb4b0', badge: '#8e3b36', bell: '#fff' },
  },
  {
    id: 'navy',
    name: '4 · Dark tile',
    note: 'The tile turns navy with a white badge and a navy bell: the strongest contrast, reads as “needs you”.',
    palette: () => ({ bg: '#2d4378', badge: '#fff', bell: '#2d4378' }),
  },
  {
    id: 'brand',
    name: '5 · Spark gradient',
    note: 'The brand’s blue-to-violet, softened, with a white badge: news in the colours of Spark.',
    palette: () => ({ bg: '#7a6fd6', gradient: ['#5a74d8', '#a07ae0'], badge: '#fff', bell: '#4b4fb8' }),
  },
  {
    id: 'chosen',
    name: '6 · Chosen: one colour, dusty rose',
    note: 'Variant 2’s idea (one colour for any news) in variant 3’s last colour. This is what the request pages use.',
    palette: () => ROSE,
  },
];

function Block({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="ask-empty">
      {icon}
      <div>
        <div className="ask-empty__title">{title}</div>
        <div className="faint">{body}</div>
      </div>
      <Button size="sm">Open</Button>
    </div>
  );
}

export function ReviewedColorsDemo() {
  return (
    <div className="cdemo cmddemo">
      <PageHeader title="Colour for a reviewed proposal" sub="Five colours for the illustration once the client has answered. Each card shows “Proposal sent” first, for contrast, then the three answers." />
      <div className="psd-list">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className="cmddemo__stage psd-stage rcd-stack">
              <Block icon={<EnvelopeFlat />} title="Proposal sent" body="AED 186,000 · sent 6 Oct." />
              {(['changes', 'approved', 'rejected'] as Answer[]).map((a) => (
                <Block key={a} icon={<EnvelopeBellBadgeFlat palette={v.palette(a)} />} title="Proposal reviewed" body={TEXT[a]} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

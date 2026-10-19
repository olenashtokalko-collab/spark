// Prototype-only page (#/spark/icons): animated icons for the "No proposal yet" block. Five looks, each in the real block.
import { Plus } from 'lucide-react';
import { Button, PageHeader } from '../../components/ui/primitives';
import { EmptyProposalIcon, type IconVariant } from './EmptyProposalIcon';

const VARIANTS: { id: IconVariant; name: string; note: string }[] = [
  { id: 'plane', name: 'A · The paper plane takes off', note: 'The send icon you have, but alive: it flies off to the upper right, and a new one comes in from the corner. The idea: a proposal is about to be sent.' },
  { id: 'write', name: 'B · The page writes itself', note: 'A document whose lines are drawn one after another, held, then erased, so it looks like a proposal being written.' },
  { id: 'envelope', name: 'C · The envelope opens', note: 'An envelope whose flap lifts and a sheet rises out of it, then closes again. The idea: a proposal that goes to the client.' },
  { id: 'pen', name: 'D · A pencil writes the page', note: 'A document and a pencil that writes the three lines one by one, then the page clears.' },
  { id: 'tile', name: 'E · The glass tile', note: 'The brand’s glass tile with the document drawing its lines in white and a small spark that twinkles, like the other lit icons in the product. The only coloured one.' },
];

export function SparkIcons() {
  return (
    <div>
      <PageHeader title="The “No proposal yet” icon" sub="Five animated icons, each in the real block. Each loops slowly and stops for people who prefer less motion. Nothing here is applied yet." />
      <div className="aei-list">
        {VARIANTS.map((v) => (
          <section key={v.id} className="aei-card">
            <header>
              <h3>{v.name}</h3>
              <p className="muted">{v.note}</p>
            </header>
            <div className="ask-empty">
              <EmptyProposalIcon variant={v.id} />
              <div>
                <div className="ask-empty__title">No proposal yet</div>
                <div className="faint">Send one when the scope is clear.</div>
              </div>
              <Button size="sm" variant="primary" icon={Plus}>
                New proposal
              </Button>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

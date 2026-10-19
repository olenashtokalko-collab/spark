// The proposal editor: the contents menu of the client's proposal page on the left (a hairline rail with a bar on
// the section in view, a mark on each item) and every section as a card, one under another, on the right.
// An empty section is highlighted; a section being edited shows a Save button.
import { AlertCircle, Check } from 'lucide-react';
import { Button, cx } from '../../components/ui/primitives';
import { ProposalToc } from '../requests/ProposalView';
import { SECTIONS, SectionEditor, type ProposalForm } from './ProposalSections';

const Mark = ({ ok }: { ok: boolean }) =>
  ok ? (
    <span className="pe-mark pe-mark--ok" aria-label="Ready">
      <Check size={11} strokeWidth={3} />
    </span>
  ) : (
    <span className="pe-mark pe-mark--todo" aria-label="Needs content">
      <AlertCircle size={16} strokeWidth={2} />
    </span>
  );

export function SectionsEditor({ f, onSaved }: { f: ProposalForm; onSaved?: (label: string) => void }) {
  return (
    <div className="pe-layout">
      <div className="proposal__side pe-menu">
        <ProposalToc title="Sections" items={SECTIONS.map((s) => ({ id: s.id, label: s.label, trail: <Mark ok={f.done[s.id]} /> }))} />
      </div>
      <div className="pe-stack">
        {SECTIONS.map((s) => (
          <section key={s.id} id={`sec-${s.id}`} className={cx('pe-pane', !f.done[s.id] && 'is-empty')}>
            <header className="pe-pane__head">
              <div>
                <h3>{s.label}</h3>
                <p className="muted">{s.hint}</p>
              </div>
              <Mark ok={f.done[s.id]} />
            </header>
            {!f.done[s.id] && (
              <div className="pe-alert">
                <AlertCircle size={16} /> This section is still empty, so the client would see nothing here.
              </div>
            )}
            <SectionEditor id={s.id} f={f} />
            {f.dirty[s.id] && (
              <footer className="pe-pane__foot">
                <span className="faint">Unsaved changes</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    f.save(s.id);
                    onSaved?.(s.label);
                  }}
                >
                  Save
                </Button>
              </footer>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

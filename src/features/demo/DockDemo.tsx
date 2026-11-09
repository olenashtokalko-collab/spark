// Prototype-only page (#/demo/dock): where Dr.AI's dock stands on every page (6 Nov). The pick is kept in this
// browser, so you can walk the portal with it.
import { navigate } from '../../lib/router';
import { useStore } from '../../state/store';
import { PageHeader, cx } from '../../components/ui/primitives';
import { DOCK_LOOKS, setDockLook, useDockLook } from '../assistant/DrAiDock';

export function DockDemo() {
  const look = useDockLook();
  const { state, actions } = useStore();
  return (
    <div className="cdemo">
      <PageHeader title="Dr.AI on every page" sub="Pick where he stands, then walk the portal: he says only what’s urgent, with Ask me to open the full chat. Prototype only." />
      <div className="fdm-switch">
        {DOCK_LOOKS.map((x) => (
          <button key={x.v} className={cx(look === x.v && 'is-on')} onClick={() => setDockLook(x.v)}>
            {x.label}
          </button>
        ))}
      </div>
      <p className="fdm-about">{DOCK_LOOKS.find((x) => x.v === look)!.note}</p>
      <div className="fdm-switch">
        <span className="faint">Onboarding</span>
        <button
          className={cx(state.onboarding && 'is-on')}
          onClick={() => {
            actions.startOnboarding();
            navigate('/');
          }}
        >
          Start as a new company
        </button>
        <button className={cx(!state.onboarding && 'is-on')} onClick={() => actions.reset()}>
          Full demo data
        </button>
      </div>
      <p className="fdm-about">
        A new company: the portal is empty, Dr.AI takes the corner with four first steps, and Sparki flies to where each one starts. A
        step is done when you really do it (ask a question, create a request, upload a file, invite someone).
      </p>
      <div className="fdm-switch">
        <span className="faint">Try it on</span>
        {[
          ['/', 'Home'],
          ['/requests', 'Requests'],
          ['/documents', 'Documents'],
          ['/brand-analysis', 'Brand Analysis'],
        ].map(([p, l]) => (
          <button key={p} onClick={() => navigate(p)}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

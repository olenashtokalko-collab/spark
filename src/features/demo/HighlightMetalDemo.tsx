// Prototype-only page (#/demo/highlight-metal, 17 Nov): the next-step highlight in the Ask Dr.AI button's metal,
// four looks, each round Ask Dr.AI's message box and a button. "Use on the guide" makes it the one Sparki lights up
// steps with (kept in this browser).
import { Mic, Plus } from 'lucide-react';
import { HL_LOOKS, HighlightRim, setHlLook, useHlLook } from '../onboarding/HighlightRim';
import { cx } from '../../components/ui/primitives';

const rim = (r: number) => ({ inset: -6, borderRadius: r + 6, ['--metal-radius' as string]: `${r + 6}px` });

export function HighlightMetalDemo() {
  const live = useHlLook();
  return (
    <div className="hmd">
      <header className="hmd__head">
        <span className="hmd__eyebrow">Onboarding · next step</span>
        <h1>The highlight, in the button’s metal</h1>
        <p>The rim Sparki draws round what to press next, made from the Ask Dr.AI button’s liquid metal. Four looks; pick one for the guide.</p>
      </header>
      <div className="hmd__list">
        {HL_LOOKS.map((l) => (
          <section key={l.id} className="hmd__row">
            <div className="hmd__text">
              <b>{l.name}</b>
              <p>{l.note}</p>
              <button type="button" className={cx('hmd__use', live === l.id && 'is-on')} onClick={() => setHlLook(l.id)} aria-pressed={live === l.id}>
                {live === l.id ? 'On the guide' : 'Use on the guide'}
              </button>
            </div>
            <div className="hmd__stage">
              <div className="hmd__box">
                <HighlightRim look={l.id} style={rim(24)} />
                <span className="hmd__ph">Ask Dr.AI anything…</span>
                <span className="hmd__tools">
                  <i>
                    <Plus size={18} />
                  </i>
                  <i>
                    <Mic size={18} />
                  </i>
                </span>
              </div>
              <span className="hmd__btn">
                <HighlightRim look={l.id} style={rim(22)} />
                Request proposal
              </span>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

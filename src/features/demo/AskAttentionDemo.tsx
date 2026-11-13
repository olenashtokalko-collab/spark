// Prototype-only page (#/demo/ask-attention, 11 Nov): the Ask Dr.AI start page with what needs you as cards, to
// compare its options: Ink or Light cards, how a card leaves (Switching) and how the cards behind look (Next cards).
// The page itself lives in assistant/AttentionStart; Ask Dr.AI uses it with the picks (Light, Swipe, Fan).
import { useState } from 'react';
import { useStore } from '../../state/store';
import { navigate, useRoute, withQuery } from '../../lib/router';
import { cx } from '../../components/ui/primitives';
import { AttentionStart, MOTIONS, PEEKS, type Look, type Motion, type Peek } from '../assistant/AttentionStart';
import type { Attachment } from '../../data/types';

export function AskAttentionDemo() {
  const { actions } = useStore();
  const { query } = useRoute();
  const look: Look = query.get('look') === 'ink' ? 'ink' : 'light';
  const motion = (MOTIONS.find((x) => x.v === query.get('motion'))?.v ?? 'swipe') as Motion;
  const peek = (PEEKS.find((x) => x.v === query.get('peek'))?.v ?? 'fan') as Peek;
  const [pulse, setPulse] = useState(0);
  const pick = (k: 'motion' | 'peek', v: string) => {
    navigate(withQuery('/demo/ask-attention', { look: 'light', motion: k === 'motion' ? v : motion, peek: k === 'peek' ? v : peek }), { replace: true });
    window.setTimeout(() => setPulse((p) => p + 1), 60);
  };
  const send = (text: string, attachments: Attachment[] = []) => {
    const id = actions.ask(null, text, { attachments });
    navigate(`/assistant/${id}`);
  };
  const controls = (
    <>
      <div className="aa-looks" role="radiogroup" aria-label="Look">
        {(['ink', 'light'] as const).map((v) => (
          <button key={v} type="button" role="radio" aria-checked={look === v} className={cx(look === v && 'is-on')} onClick={() => navigate(withQuery('/demo/ask-attention', { look: v === 'ink' ? 'ink' : null }), { replace: true })}>
            {v === 'ink' ? 'Ink cards' : 'Light cards'}
          </button>
        ))}
      </div>
      {look === 'light' && (
        <div className="aa-opts">
          {(
            [
              ['motion', 'Switching', MOTIONS, motion],
              ['peek', 'Next cards', PEEKS, peek],
            ] as const
          ).map(([k, title, list, cur]) => (
            <div key={k} className="aa-opts__row" role="radiogroup" aria-label={title}>
              <span className="aa-opts__label">{title}</span>
              {list.map((o) => (
                <button key={o.v} type="button" role="radio" aria-checked={cur === o.v} className={cx(cur === o.v && 'is-on')} title={o.note} onClick={() => pick(k, o.v)}>
                  {o.label}
                </button>
              ))}
            </div>
          ))}
          <button type="button" className="aa-opts__play" onClick={() => setPulse((p) => p + 1)}>
            Play ▸
          </button>
        </div>
      )}
    </>
  );
  return (
    <div className="assistant assistant--chats aa-page">
      <section className="assistant__main">
        <AttentionStart onAsk={send} look={look} motion={motion} peek={peek} pulse={pulse} controls={controls} />
      </section>
    </div>
  );
}

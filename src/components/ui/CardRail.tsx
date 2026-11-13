// The cards' rail (12 Nov, review: one component for Ask Dr.AI's card stack and Home's reports): a fine arrow, a dot
// per card with the current one drawn out, a fine arrow. Upright beside a stack (Ask Dr.AI), or in a row (Home).
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { cx } from './primitives';
import '../../styles/ask-attention.css';

export function CardRail({
  count,
  index,
  onStep,
  onPick,
  dir = 'col',
  label = 'Cards',
  canPrev = count > 1,
  canNext = count > 1,
  className,
}: {
  count: number;
  index: number;
  onStep: (d: number) => void;
  onPick: (k: number) => void;
  dir?: 'col' | 'row';
  label?: string;
  canPrev?: boolean;
  canNext?: boolean;
  className?: string;
}) {
  const Prev = dir === 'row' ? ChevronLeft : ChevronUp;
  const Next = dir === 'row' ? ChevronRight : ChevronDown;
  return (
    <nav className={cx('aa-rail', dir === 'row' && 'aa-rail--row', className)} aria-label={label}>
      <button type="button" onClick={() => onStep(-1)} aria-label="Previous" disabled={!canPrev}>
        <Prev size={15} />
      </button>
      {Array.from({ length: count }, (_, k) => (
        <button key={k} type="button" className={cx('aa-dot', k === index && 'is-on')} onClick={() => onPick(k)} aria-label={`Card ${k + 1}`} aria-current={k === index} />
      ))}
      <button type="button" onClick={() => onStep(1)} aria-label="Next" disabled={!canNext}>
        <Next size={15} />
      </button>
    </nav>
  );
}

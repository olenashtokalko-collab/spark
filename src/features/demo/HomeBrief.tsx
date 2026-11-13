// Layout 6 · Brief (13 Nov). First built after waldo.fyi's Brand Scan as an issue of the client's brief (a cover, the
// read, the moves, the numbers, the reports, the next issue, a contents bar pinned at the top). Trimmed the same day
// (review: "too much for the client; on a call she said many sections look crammed and you don't know where to
// look"): what stays is what she'd look at.
//   · the top: the company and its balance (Layout 5's strip, the balance made the one thing to see in it)
//   · By the numbers: the four figures that matter, each against the typical
//   · the tabs: the reports, and the company profile
//   · Book consultation, floating at the foot of the page
// Spark's own terms: Sand and Ink, Cobalt and Ember as the only accents, Diatype for words, Diatype Mono for labels,
// Doto for the figures.
import type { ReactNode } from 'react';
import { useUI } from '../../state/ui';
import { cx } from '../../components/ui/primitives';
import { dotted } from './dotted';
import '../../styles/brief.css';

// the bar: yours, and a tick where the typical (or the aim) sits, both on one scale; Cobalt when yours is the better.
// Only figures the reports' cards don't show (13 Nov, review: "are By the numbers and the reports the same figures?
// The client doesn't want anything twice"): the mobile speed and the Instagram engagement live on their report cards
type Num = { fig: string; unit?: string; label: string; vs: string; mine: number; typical?: number; scale: number; better: boolean };
const NUMBERS: Num[] = [
  { fig: '6.8', unit: 's', label: 'Product page load on 4G', vs: 'Aim for under 3 s', mine: 6.8, typical: 3, scale: 8, better: false },
  { fig: '2', unit: 'K', label: 'Views of a TikTok video', vs: 'Competitors 20–60K', mine: 2, typical: 20, scale: 60, better: false },
  { fig: '4%', label: 'Recall in KSA', vs: 'Before the flagship', mine: 4, scale: 100, better: false },
  { fig: '26', unit: 'h', label: 'To reply to a comment', vs: 'Aim for 2 h', mine: 26, typical: 2, scale: 30, better: false },
];

function SectionHead({ title, note }: { title: string; note?: string }) {
  return (
    <header className="br-head">
      <h2 className="br-head__title">{title}</h2>
      {note && <span className="br-head__note">{note}</span>}
    </header>
  );
}

/** Home as the client's brief. `top` is the company and its balance; `reports` the tabs. */
export function BriefHome({ top, reports }: { top: ReactNode; reports: ReactNode }) {
  const { openRequest } = useUI();
  const consult = () => openRequest({ type: 'Strategy', title: 'Consultation on the brand analysis' });
  return (
    <div className="br">
      {top}

      <SectionHead title="By the numbers" note="What else the reports measured" />
      <div className="br-nums">
        {NUMBERS.map((x) => (
          <div key={x.label} className="br-num">
            <span className="br-num__fig" role="img" aria-label={`${x.fig}${x.unit ?? ''} ${x.label}`}>
              {dotted(x.fig)}
              {x.unit && <i>{x.unit}</i>}
            </span>
            <span className="br-num__label">{x.label}</span>
            <span className="br-num__bar" aria-hidden>
              <span className={cx(x.better && 'is-better')} style={{ width: `${Math.min(100, (x.mine / x.scale) * 100)}%` }} />
              {x.typical !== undefined && <i style={{ left: `${Math.min(100, (x.typical / x.scale) * 100)}%` }} />}
            </span>
            <span className={cx('br-num__vs', x.better ? 'is-up' : 'is-down')}>{x.vs}</span>
          </div>
        ))}
      </div>

      <SectionHead title="Your reports" note="The full reports, and your company profile" />
      {reports}

      {/* the consultation always at hand (review: "the Book a consultation button as a floating call to action"): only
          its words, on a pill of clear glass in the bottom right; the brief's last row, so it sticks to the foot of
          the view all the way down. The top holds no consultation any more, so it shows from the start */}
      <button type="button" className="br-float is-shown" onClick={consult}>
        Book consultation
      </button>
    </div>
  );
}

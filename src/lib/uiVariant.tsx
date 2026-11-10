// UI variants (prototype, 9 Nov): the same portal in more than one interface, to compare side by side. Not a theme:
// a variant may change cards, buttons, statuses and layout, not only colours. A is today's glass UI. The chosen
// variant sits on <html data-ui="…">, so a variant's CSS is scoped as :root[data-ui='b'] (styles/ui-b.css), and a
// component can branch with useUiVariant(). Chosen with the switch at the foot of the page (local only), or
// ?ui=b in the address; remembered for the browser.
import { useEffect, useState } from 'react';
import { cx } from '../components/ui/primitives';
import { ONBOARDING_BUILD, PORTAL_VIEW, VIEW_KEY, type PortalView } from '../state/store';

// a: the glass UI as committed on 9 Nov (b81dc78). b and c: the two directions in the "Spark Redesign Directions"
// design file, built on the same pages, structure and content: b is its row A (brand-aligned: Sand and Ink, Cobalt
// leads, Ember sparks, glass only in pictures), c its row B (glass as the interface).
export const UI_VARIANTS = [
  { v: 'a', label: 'Current' },
  { v: 'b', label: 'Direction A' },
  { v: 'c', label: 'Direction B' },
] as const;
export type UiVariant = (typeof UI_VARIANTS)[number]['v'];

const KEY = 'spark-ui-variant';
const EVENT = 'spark-ui-variant';
const known = (v: string | null): v is UiVariant => UI_VARIANTS.some((x) => x.v === v);

function fromUrl(): UiVariant | null {
  const q = window.location.hash.split('?')[1] ?? window.location.search.slice(1);
  const v = new URLSearchParams(q).get('ui');
  return known(v) ? v : null;
}
function current(): UiVariant {
  const url = fromUrl();
  if (url) return url;
  try {
    const v = localStorage.getItem(KEY);
    return known(v) ? v : 'a';
  } catch {
    return 'a';
  }
}

export function setUiVariant(v: UiVariant) {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* this visit only */
  }
  document.documentElement.dataset.ui = v;
  window.dispatchEvent(new Event(EVENT));
}

export function useUiVariant(): UiVariant {
  const [v, setV] = useState(current);
  useEffect(() => {
    const f = () => setV(current());
    window.addEventListener(EVENT, f);
    window.addEventListener('hashchange', f);
    return () => {
      window.removeEventListener(EVENT, f);
      window.removeEventListener('hashchange', f);
    };
  }, []);
  return v;
}

/** Puts the variant on <html> (call once, high up). An address with ?ui= is remembered as the choice. */
export function useApplyUiVariant() {
  const v = useUiVariant();
  useEffect(() => {
    document.documentElement.dataset.ui = v;
    if (fromUrl()) {
      try {
        localStorage.setItem(KEY, v);
      } catch {
        /* this visit only */
      }
    }
  }, [v]);
  return v;
}

// The switch shows when running locally, or in a build made with VITE_UI_SWITCH=1.
const SHOW_SWITCH = import.meta.env.DEV || import.meta.env.VITE_UI_SWITCH === '1';

/** Puts the variant on <html> and shows the switch: rendered once beside the app. The onboarding build shows its
 *  own switch instead, between the onboarding and the portal as it is today. */
export function UiVariantRoot() {
  useApplyUiVariant();
  return ONBOARDING_BUILD ? <ViewSwitch /> : <UiVariantSwitch />;
}

const VIEWS: { v: PortalView; label: string }[] = [
  { v: 'onboarding', label: 'Onboarding' },
  { v: 'current', label: 'Current' },
];

/** Onboarding or Current (10 Nov, spark-lead-preview): a new company's first steps, or the portal with a company's
 *  data. Each keeps its own saved state; a pick opens that view on Home. */
function ViewSwitch() {
  const pick = (v: PortalView) => {
    if (v === PORTAL_VIEW) return;
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      return;
    }
    window.location.hash = '#/';
    window.location.reload();
  };
  return (
    <div className="ui-switch" role="radiogroup" aria-label="View">
      <span className="ui-switch__label">VIEW</span>
      {VIEWS.map((x) => (
        <button key={x.v} type="button" role="radio" aria-checked={PORTAL_VIEW === x.v} className={cx(PORTAL_VIEW === x.v && 'is-on')} onClick={() => pick(x.v)}>
          {x.label}
        </button>
      ))}
    </div>
  );
}

/** The variants as a small segmented switch at the foot of the page. */
export function UiVariantSwitch() {
  const v = useUiVariant();
  if (!SHOW_SWITCH) return null;
  return (
    <div className="ui-switch" role="radiogroup" aria-label="UI variant">
      <span className="ui-switch__label">UI</span>
      {UI_VARIANTS.map((x) => (
        <button key={x.v} type="button" role="radio" aria-checked={v === x.v} className={cx(v === x.v && 'is-on')} onClick={() => setUiVariant(x.v)}>
          {x.label}
        </button>
      ))}
    </div>
  );
}

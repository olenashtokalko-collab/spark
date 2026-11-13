// A colleague's Home concepts (spark-portal, 12–13 Nov), brought in as separate demo pages (13 Nov, review: "add her
// design variants to my project as separate pages"). Each opens full screen, without the portal's shell, as on her own
// site: #/concepts/console, #/concepts/glass-deck, #/concepts/studio. Her code is as she wrote it, with only the
// paths changed (her images under public/concepts/, her fonts and CSS images under ./assets) and her shared tokens
// scoped to .cpx (concepts.css), so they don't reach the portal. Her switcher is replaced by one that switches by
// route and leads back to the portal; ?clean hides it, ?nolens turns off her glass star, as on her site.
import { Suspense, lazy, useEffect, useState } from 'react';
import { useRoute } from '../../lib/router';
import { HomeSwitch } from '../demo/HomeBentoDemo';
import SparkCursor from './shared/SparkCursor';
import './concepts.css';

const CONCEPTS = [
  { id: 'console', name: 'Console', Component: lazy(() => import('./c2/Home')) },
  { id: 'glass-deck', name: 'Glass deck', Component: lazy(() => import('./d2/Home')) },
  { id: 'studio', name: 'Studio', Component: lazy(() => import('./e/Home')) },
];

// her concepts' number face: Doto with its rounding axis, from Google Fonts, loaded on these pages only
const DOTO = 'https://fonts.googleapis.com/css2?family=Doto:ROND,wght@0..100,100..900&display=swap';
function useDoto() {
  useEffect(() => {
    if (document.querySelector(`link[href="${DOTO}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = DOTO;
    document.head.appendChild(l);
  }, []);
}

/** The concepts' switcher: her quiet pane of light glass, bottom left, half clear until the pointer is on it; the three
 *  by name, and the way back to the portal. */
function Switcher({ current }: { current: string }) {
  const [over, setOver] = useState(false);
  const clean = /[?&]clean\b/.test(window.location.hash) || new URLSearchParams(window.location.search).has('clean');
  if (clean) return null;
  const link = (on: boolean) => ({
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0 12px',
    borderRadius: 999,
    color: on ? 'var(--ink)' : 'rgba(14,17,22,.48)',
    background: on ? 'rgba(255,255,255,.88)' : 'transparent',
    transition: 'background .25s, color .25s',
  });
  return (
    <nav
      aria-label="Concepts"
      className="cpx-switch"
      onMouseEnter={() => setOver(true)}
      onMouseLeave={() => setOver(false)}
      onFocus={() => setOver(true)}
      onBlur={() => setOver(false)}
      style={{
        position: 'fixed',
        left: 16,
        bottom: 16,
        zIndex: 1000,
        display: 'flex',
        gap: 4,
        padding: 4,
        borderRadius: 999,
        background: 'rgba(255,255,255,.56)',
        backdropFilter: 'blur(16px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
        boxShadow: '0 8px 24px -12px rgba(30,30,60,.24)',
        fontFamily: 'var(--f-mono)',
        fontSize: 12,
        lineHeight: '16px',
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        opacity: over ? 1 : 0.56,
        transition: 'opacity .25s',
      }}
    >
      <a href="#/" style={link(false)} title="Back to the portal">
        ← Portal
      </a>
      {CONCEPTS.map((c) => (
        <a key={c.id} href={`#/concepts/${c.id}`} aria-current={current === c.id ? 'page' : undefined} style={link(current === c.id)}>
          {c.name}
        </a>
      ))}
    </nav>
  );
}

/** The concepts don't leave their page yet (13 Nov, review: "no redirects to other pages, they aren't ready"): her
 *  own links (#c2, #e and the like) would land on the portal's router, so they are held. The version switch and the
 *  links between the concepts still work, and everything the page opens itself (the top-up, her panels) is untouched. */
function holdLinks(e: React.MouseEvent) {
  const a = (e.target as HTMLElement).closest?.('a[href]');
  if (!a) return;
  const href = a.getAttribute('href') ?? '';
  if (href === '#/' || href.startsWith('#/concepts')) return;
  e.preventDefault();
}

export function ConceptsPage() {
  const { parts } = useRoute();
  useDoto();
  const concept = CONCEPTS.find((c) => c.id === parts[1]) ?? CONCEPTS[0];
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [concept.id]);
  const C = concept.Component;
  return (
    <div className="cpx" data-concept={concept.id} onClickCapture={holdLinks}>
      <Suspense fallback={null}>
        <C key={concept.id} />
      </Suspense>
      {/* her glass spark follows the pointer on every concept, as on her site */}
      <SparkCursor />
      {/* Console and Studio are versions of the portal now (13 Nov, review), so they carry the version switch; Glass
          deck keeps her own switcher, which leads between the concepts and back to the portal */}
      {concept.id === 'console' || concept.id === 'studio' ? <HomeSwitch current={concept.id as 'console' | 'studio'} /> : <Switcher current={concept.id} />}
    </div>
  );
}

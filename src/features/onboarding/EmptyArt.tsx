// Small still pictures for empty cards (6 Nov, review): Brand Analysis with no reports, Latest from Spark with nothing
// yet. One language: soft lilac glass shapes, the bars' gradient (Cobalt to violet, light), no motion. Latest moves
// away from Sparki, who reads as a live conversation, to pictures of waiting. Picked on #/demo/empty-art.
import { useEffect, useId, useState, type ReactNode } from 'react';
import { Bell, ChartColumn, Folder, MessageCircle, Search, Send, Sparkles } from 'lucide-react';

export const BA_ARTS = [
  { v: 'b-tile-chart', label: 'Bright tile' },
  { v: 'b-ring', label: 'Bright score ring' },
  { v: 'c-tile-chart', label: 'Clear tile' },
  { v: 'c-bubble-chart', label: 'Clear bubble' },
  { v: 'b-layers', label: 'Bright layers' },
  { v: 'b-orb', label: 'Bright orb' },
  { v: 'g-lens', label: 'Glass lens' },
  { v: 'g-slider', label: 'Glass slider' },
  { v: 'bars', label: 'Bars' },
  { v: 'ring', label: 'Score ring' },
  { v: 'sheets', label: 'Report pages' },
  { v: 'line', label: 'Line chart' },
] as const;
export const LATEST_ARTS = [
  { v: 'b-tile-spark', label: 'Bright tile' },
  { v: 'b-orb', label: 'Bright orb' },
  { v: 'c-tile-spark', label: 'Clear tile' },
  { v: 'c-bubble-spark', label: 'Clear bubble' },
  { v: 'c-chat', label: 'Clear chat' },
  { v: 'g-bubbles', label: 'Glass bubbles' },
  { v: 'g-star', label: 'Glass spark' },
  { v: 'clock', label: 'Clock' },
  { v: 'hourglass', label: 'Hourglass' },
  { v: 'stack', label: 'Empty feed' },
  { v: 'envelope', label: 'Envelope' },
  { v: 'sparki', label: 'Sparki (now)' },
] as const;
export type BaArt = (typeof BA_ARTS)[number]['v'];
export type LatestArt = (typeof LATEST_ARTS)[number]['v'];

/** The portal's other empty pages (9 Nov): three pictures each, plus "Text only", as they are today. */
export const PAGE_ARTS = {
  requests: {
    title: 'Requests · no requests yet',
    head: 'No requests yet.',
    body: 'Start a chat about your brand and turn a useful answer into a request.',
    list: [
      { v: 'b-tile-send', label: 'Bright tile' },
      { v: 'c-tile-send', label: 'Clear tile' },
      { v: 'c-bubble-send', label: 'Clear bubble' },
      { v: 'g-onit', label: 'Glass “On it”' },
      { v: 'tray', label: 'Tray' },
      { v: 'ticket', label: 'Request card' },
      { v: 'path', label: 'Steps' },
      { v: 'none', label: 'Text only' },
    ],
  },
  files: {
    title: 'Documents · no files added',
    head: 'No files added.',
    body: 'Drop files here or use Upload to share them with Spark.',
    list: [
      { v: 'b-tile-folder', label: 'Bright tile' },
      { v: 'c-tile-folder', label: 'Clear tile' },
      { v: 'c-bubble-folder', label: 'Clear bubble' },
      { v: 'b-layers', label: 'Bright layers' },
      { v: 'g-layers', label: 'Glass layers' },
      { v: 'folder', label: 'Folder' },
      { v: 'upload', label: 'Upload' },
      { v: 'docs', label: 'Pages' },
      { v: 'none', label: 'Text only' },
    ],
  },
  chats: {
    title: 'Chat history · no chats yet',
    head: 'No chats yet.',
    body: 'Start one above.',
    list: [
      { v: 'b-tile-chat', label: 'Bright tile' },
      { v: 'c-chat', label: 'Clear chat' },
      { v: 'c-tile-chat', label: 'Clear tile' },
      { v: 'g-bubbles', label: 'Glass bubbles' },
      { v: 'bubbles', label: 'Bubbles' },
      { v: 'typing', label: 'Typing' },
      { v: 'question', label: 'Question' },
      { v: 'none', label: 'Text only' },
    ],
  },
  notifs: {
    title: 'Notifications · all caught up',
    head: 'You’re all caught up.',
    body: '',
    list: [
      { v: 'b-tile-bell', label: 'Bright tile' },
      { v: 'c-tile-bell', label: 'Clear tile' },
      { v: 'c-bubble-bell', label: 'Clear bubble' },
      { v: 'b-toggle', label: 'Bright switch' },
      { v: 'g-toggle', label: 'Glass switch' },
      { v: 'bell', label: 'Bell' },
      { v: 'check', label: 'Check' },
      { v: 'inbox', label: 'Inbox zero' },
      { v: 'none', label: 'Text only' },
    ],
  },
  search: {
    title: 'Search and filters · nothing matches',
    head: 'No requests match these filters.',
    body: 'Try another word or clear the filters.',
    list: [
      { v: 'b-tile-search', label: 'Bright tile' },
      { v: 'c-search', label: 'Clear search' },
      { v: 'c-tile-search', label: 'Clear tile' },
      { v: 'g-search', label: 'Glass search' },
      { v: 'lens', label: 'Magnifier' },
      { v: 'funnel', label: 'Filter' },
      { v: 'cards', label: 'Empty cards' },
      { v: 'none', label: 'Text only' },
    ],
  },
} as const;
export type PageKey = keyof typeof PAGE_ARTS;
export type PageArt = (typeof PAGE_ARTS)[PageKey]['list'][number]['v'];

const KEYS = {
  ba: 'spark-art-ba',
  latest: 'spark-art-latest',
  requests: 'spark-art-requests',
  files: 'spark-art-files',
  chats: 'spark-art-chats',
  notifs: 'spark-art-notifs',
  search: 'spark-art-search',
} as const;
const EVENT = 'spark-art';
function read<T extends string>(key: string, list: readonly { v: T }[], dflt: T): T {
  try {
    return list.find((x) => x.v === localStorage.getItem(key))?.v ?? dflt;
  } catch {
    return dflt;
  }
}
export function setArt(which: keyof typeof KEYS, v: string) {
  try {
    localStorage.setItem(KEYS[which], v);
  } catch {
    /* this visit only */
  }
  window.dispatchEvent(new Event(EVENT));
}
export function useArt() {
  const page = (k: PageKey) => read<PageArt>(KEYS[k], PAGE_ARTS[k].list, PAGE_ARTS[k].list[0].v);
  const get = () => ({
    ba: read<BaArt>(KEYS.ba, BA_ARTS, 'b-tile-chart'),
    latest: read<LatestArt>(KEYS.latest, LATEST_ARTS, 'b-tile-spark'),
    requests: page('requests'),
    files: page('files'),
    chats: page('chats'),
    notifs: page('notifs'),
    search: page('search'),
  });
  const [v, setV] = useState(get);
  useEffect(() => {
    const f = () => setV(get());
    window.addEventListener(EVENT, f);
    return () => window.removeEventListener(EVENT, f);
  }, []);
  return v;
}

/** The shared fills: the bars' lilac, top to bottom, and a fainter one for what sits behind. */
function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}a`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#9a55ec" stopOpacity="0.36" />
        <stop offset="1" stopColor="#3c64f0" stopOpacity="0.12" />
      </linearGradient>
      <linearGradient id={`${id}b`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#9a55ec" stopOpacity="0.18" />
        <stop offset="1" stopColor="#3c64f0" stopOpacity="0.06" />
      </linearGradient>
      <linearGradient id={`${id}s`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#7a5be8" stopOpacity="0.55" />
        <stop offset="1" stopColor="#9a55ec" stopOpacity="0.35" />
      </linearGradient>
    </defs>
  );
}

export function BrandArt({ v }: { v: BaArt }) {
  const id = useId().replace(/:/g, '');
  if (v.startsWith('g-')) return <GlassArt v={v} />;
  if (v.startsWith('b-')) return <BrightArt v={v} />;
  if (v.startsWith('c-')) return <ClearArt v={v} />;
  const A = `url(#${id}a)`;
  const B = `url(#${id}b)`;
  const S = `url(#${id}s)`;
  return (
    <svg className="ea" viewBox="0 0 120 72" width="120" height="72" aria-hidden>
      <Defs id={id} />
      {v === 'bars' && (
        <g>
          <rect x="0" y="34" width="22" height="38" rx="7" fill={A} />
          <rect x="30" y="16" width="22" height="56" rx="7" fill={A} />
          <rect x="60" y="26" width="22" height="46" rx="7" fill={A} />
          <rect x="90" y="4" width="22" height="68" rx="7" fill={A} />
        </g>
      )}
      {v === 'ring' && (
        <g transform="translate(24 0)">
          <circle cx="36" cy="36" r="29" fill="none" stroke={B} strokeWidth="11" />
          <circle cx="36" cy="36" r="29" fill="none" stroke={S} strokeWidth="11" strokeLinecap="round" strokeDasharray="118 200" transform="rotate(-90 36 36)" />
          <rect x="26" y="31" width="20" height="10" rx="5" fill={A} />
        </g>
      )}
      {v === 'sheets' && (
        <g>
          <rect x="34" y="2" width="50" height="64" rx="9" fill={B} transform="rotate(8 59 34)" />
          <rect x="26" y="6" width="50" height="64" rx="9" fill={A} />
          <rect x="35" y="18" width="22" height="5" rx="2.5" fill={S} />
          <rect x="35" y="30" width="32" height="5" rx="2.5" fill={B} />
          <rect x="35" y="40" width="28" height="5" rx="2.5" fill={B} />
          <rect x="35" y="50" width="18" height="5" rx="2.5" fill={B} />
        </g>
      )}
      {v === 'line' && (
        <g>
          <rect x="0" y="2" width="118" height="68" rx="12" fill={B} />
          <path d="M12 54 C 28 52, 32 34, 48 38 S 72 50, 82 30 S 100 16, 108 14 L108 70 L12 70 Z" fill={A} />
          <path d="M12 54 C 28 52, 32 34, 48 38 S 72 50, 82 30 S 100 16, 108 14" fill="none" stroke={S} strokeWidth="3" strokeLinecap="round" />
          <circle cx="108" cy="14" r="4.5" fill="#fff" stroke={S} strokeWidth="2.5" />
        </g>
      )}
    </svg>
  );
}

export function LatestArtView({ v, sparki }: { v: LatestArt; sparki?: ReactNode }) {
  const id = useId().replace(/:/g, '');
  const A = `url(#${id}a)`;
  const B = `url(#${id}b)`;
  const S = `url(#${id}s)`;
  if (v === 'sparki') return <>{sparki}</>;
  if (v.startsWith('g-')) return <GlassArt v={v} />;
  if (v.startsWith('b-')) return <BrightArt v={v} />;
  if (v.startsWith('c-')) return <ClearArt v={v} />;
  return (
    <svg className="ea" viewBox="0 0 120 72" width="120" height="72" aria-hidden>
      <Defs id={id} />
      {v === 'clock' && (
        <g transform="translate(4 0)">
          <circle cx="36" cy="36" r="34" fill={A} />
          <circle cx="36" cy="36" r="25" fill={B} />
          {[0, 90, 180, 270].map((a) => (
            <rect key={a} x="34.5" y="7" width="3" height="6" rx="1.5" fill={S} transform={`rotate(${a} 36 36)`} />
          ))}
          <rect x="34.5" y="18" width="3.5" height="20" rx="1.75" fill={S} />
          <rect x="34.5" y="34" width="3.5" height="15" rx="1.75" fill={S} transform="rotate(-60 36 36)" />
          <circle cx="36" cy="36" r="3.5" fill="#fff" />
        </g>
      )}
      {v === 'hourglass' && (
        <g transform="translate(20 0)">
          <rect x="6" y="0" width="44" height="7" rx="3.5" fill={S} />
          <rect x="6" y="65" width="44" height="7" rx="3.5" fill={S} />
          <path d="M11 9 H45 C45 24 32 30 30 36 C32 42 45 48 45 63 H11 C11 48 24 42 26 36 C24 30 11 24 11 9 Z" fill={B} />
          <path d="M18 63 C18 54 26 50 28 46 C30 50 38 54 38 63 Z" fill={A} />
          <path d="M20 16 H36 C34 22 30 26 28 28 C26 26 22 22 20 16 Z" fill={A} />
        </g>
      )}
      {v === 'stack' && (
        <g>
          <rect x="22" y="2" width="76" height="18" rx="7" fill={B} />
          <rect x="14" y="26" width="92" height="20" rx="8" fill={B} />
          <rect x="6" y="52" width="108" height="20" rx="8" fill={A} />
          <rect x="16" y="59" width="40" height="6" rx="3" fill={S} />
        </g>
      )}
      {v === 'envelope' && (
        <g transform="translate(16 4)">
          <rect x="0" y="6" width="88" height="58" rx="10" fill={A} />
          <path d="M6 12 L44 40 L82 12" fill="none" stroke={S} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="82" cy="8" r="8" fill="#fff" />
          <circle cx="82" cy="8" r="5" fill={B} />
        </g>
      )}
    </svg>
  );
}

/** The empty pages' pictures, in the same language as the cards'. "none" draws nothing. */
export function PageArtView({ v, small }: { v: PageArt; small?: boolean }) {
  const id = useId().replace(/:/g, '');
  if (v === 'none') return null;
  if (v.startsWith('g-')) return <GlassArt v={v} small={small} />;
  if (v.startsWith('b-')) return <BrightArt v={v} small={small} />;
  if (v.startsWith('c-')) return <ClearArt v={v} small={small} />;
  const A = `url(#${id}a)`;
  const B = `url(#${id}b)`;
  const S = `url(#${id}s)`;
  return (
    <svg className={small ? 'ea ea--sm' : 'ea'} viewBox="0 0 120 72" width="120" height="72" aria-hidden>
      <Defs id={id} />
      {v === 'tray' && (
        <g>
          <rect x="34" y="4" width="52" height="30" rx="7" fill={B} />
          <rect x="40" y="14" width="40" height="5" rx="2.5" fill={S} opacity="0.7" />
          <path d="M10 40 H38 C40 40 41 41 42 43 L45 50 C46 52 47 53 49 53 H71 C73 53 74 52 75 50 L78 43 C79 41 80 40 82 40 H110 V62 C110 67 107 70 102 70 H18 C13 70 10 67 10 62 Z" fill={A} />
        </g>
      )}
      {v === 'ticket' && (
        <g>
          <rect x="14" y="8" width="78" height="56" rx="11" fill={A} />
          <rect x="26" y="20" width="34" height="6" rx="3" fill={S} />
          <rect x="26" y="34" width="52" height="5" rx="2.5" fill={B} />
          <rect x="26" y="44" width="40" height="5" rx="2.5" fill={B} />
          <circle cx="98" cy="54" r="14" fill="#fff" />
          <path d="M92 54 H104 M99 49 L104 54 L99 59" fill="none" stroke={S} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {v === 'path' && (
        <g>
          <rect x="16" y="34" width="88" height="4" rx="2" fill={B} />
          <rect x="16" y="34" width="30" height="4" rx="2" fill={S} />
          <circle cx="18" cy="36" r="10" fill={A} />
          <circle cx="18" cy="36" r="4" fill="#fff" />
          <circle cx="60" cy="36" r="10" fill={B} />
          <circle cx="102" cy="36" r="10" fill={B} />
        </g>
      )}
      {v === 'folder' && (
        <g>
          <path d="M14 14 C14 10 17 8 21 8 H44 C47 8 49 9 51 11 L56 17 H99 C103 17 106 20 106 24 V62 C106 66 103 69 99 69 H21 C17 69 14 66 14 62 Z" fill={B} />
          <rect x="24" y="22" width="56" height="34" rx="5" fill="#fff" opacity="0.7" />
          <path d="M10 32 C10 28 13 26 17 26 H103 C107 26 110 28 110 32 L107 62 C107 66 104 69 100 69 H20 C16 69 13 66 13 62 Z" fill={A} />
        </g>
      )}
      {v === 'upload' && (
        <g>
          <rect x="10" y="20" width="100" height="50" rx="12" fill={B} strokeDasharray="5 5" />
          <rect x="10.75" y="20.75" width="98.5" height="48.5" rx="11.5" fill="none" stroke={S} strokeWidth="1.5" strokeDasharray="5 5" opacity="0.6" />
          <circle cx="60" cy="22" r="16" fill={A} />
          <path d="M60 30 V15 M53 21 L60 14 L67 21" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="40" y="50" width="40" height="5" rx="2.5" fill={S} opacity="0.6" />
        </g>
      )}
      {v === 'docs' && (
        <g>
          <rect x="22" y="10" width="40" height="54" rx="8" fill={B} transform="rotate(-10 42 37)" />
          <rect x="58" y="10" width="40" height="54" rx="8" fill={B} transform="rotate(10 78 37)" />
          <rect x="40" y="6" width="40" height="58" rx="8" fill={A} />
          <path d="M66 6 V18 C66 20 67 21 69 21 H80" fill="#fff" opacity="0.6" />
          <rect x="48" y="30" width="24" height="4" rx="2" fill={S} />
          <rect x="48" y="40" width="18" height="4" rx="2" fill={B} />
        </g>
      )}
      {v === 'bubbles' && (
        <g>
          <path d="M8 14 C8 9 12 6 17 6 H63 C68 6 72 9 72 14 V34 C72 39 68 42 63 42 H28 L18 50 V42 H17 C12 42 8 39 8 34 Z" fill={A} />
          <rect x="18" y="17" width="36" height="5" rx="2.5" fill={S} />
          <rect x="18" y="27" width="24" height="5" rx="2.5" fill={B} />
          <path d="M112 38 C112 34 109 31 105 31 H58 C54 31 51 34 51 38 V56 C51 60 54 63 58 63 H94 L104 70 V63 H105 C109 63 112 60 112 56 Z" fill={B} />
          <rect x="62" y="42" width="34" height="5" rx="2.5" fill={S} opacity="0.6" />
        </g>
      )}
      {v === 'typing' && (
        <g>
          <path d="M18 16 C18 10 22 6 28 6 H92 C98 6 102 10 102 16 V46 C102 52 98 56 92 56 H44 L30 66 V56 H28 C22 56 18 52 18 46 Z" fill={A} />
          <circle cx="44" cy="31" r="6" fill={S} />
          <circle cx="60" cy="31" r="6" fill={S} opacity="0.7" />
          <circle cx="76" cy="31" r="6" fill={S} opacity="0.4" />
        </g>
      )}
      {v === 'question' && (
        <g>
          <path d="M22 16 C22 10 26 6 32 6 H88 C94 6 98 10 98 16 V46 C98 52 94 56 88 56 H76 L90 68 L58 56 H32 C26 56 22 52 22 46 Z" fill={A} />
          <path d="M52 24 C52 18 56 15 61 15 C66 15 70 18 70 23 C70 29 61 29 61 36" fill="none" stroke={S} strokeWidth="5" strokeLinecap="round" />
          <circle cx="61" cy="45" r="3.5" fill={S} />
        </g>
      )}
      {v === 'bell' && (
        <g>
          <path d="M60 8 C44 8 36 20 36 34 V46 L28 56 H92 L84 46 V34 C84 20 76 8 60 8 Z" fill={A} />
          <rect x="52" y="58" width="16" height="9" rx="4.5" fill={S} />
          <rect x="56" y="2" width="8" height="8" rx="4" fill={S} />
          <path d="M98 18 C102 22 104 28 104 34 M22 18 C18 22 16 28 16 34" fill="none" stroke={B} strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
      {v === 'check' && (
        <g>
          <circle cx="60" cy="36" r="32" fill={B} />
          <circle cx="60" cy="36" r="22" fill={A} />
          <path d="M49 36 L57 44 L72 28" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {v === 'inbox' && (
        <g>
          <rect x="16" y="6" width="88" height="14" rx="7" fill={B} />
          <rect x="16" y="26" width="88" height="14" rx="7" fill={B} opacity="0.7" />
          <rect x="16" y="46" width="88" height="20" rx="8" fill={A} />
          <path d="M50 56 L57 62 L70 50" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {v === 'lens' && (
        <g>
          <circle cx="52" cy="32" r="26" fill={A} />
          <circle cx="52" cy="32" r="17" fill="#fff" opacity="0.55" />
          <rect x="72" y="50" width="30" height="11" rx="5.5" fill={S} transform="rotate(38 72 50)" />
          <rect x="44" y="30" width="16" height="4" rx="2" fill={S} opacity="0.6" />
        </g>
      )}
      {v === 'funnel' && (
        <g>
          <path d="M22 8 H98 C102 8 104 13 101 16 L72 44 V62 C72 65 70 67 67 68 L54 72 V44 L19 16 C16 13 18 8 22 8 Z" fill={A} />
          <rect x="30" y="14" width="60" height="5" rx="2.5" fill="#fff" opacity="0.6" />
        </g>
      )}
      {v === 'cards' && (
        <g>
          <rect x="6" y="10" width="32" height="52" rx="8" fill={B} />
          <rect x="44" y="10" width="32" height="52" rx="8" fill={B} />
          <rect x="82" y="10" width="32" height="52" rx="8" fill={B} />
          <rect x="44" y="10" width="32" height="52" rx="8" fill="none" stroke={S} strokeWidth="2" strokeDasharray="4 4" />
        </g>
      )}
    </svg>
  );
}

/** Glass objects after the brand book's key visuals (9 Nov, reference): thick frosted pills and lenses, the spectrum
 *  (Noor) glowing inside or under them, a bright top edge, light rather than shadow. Built in CSS, 120 × 72. */
export function GlassArt({ v, small }: { v: string; small?: boolean }) {
  return (
    <span className={cx('ga', small && 'ga--sm')} aria-hidden>
      {v === 'g-bubbles' && (
        <>
          <span className="ga-pill ga-b1">
            <i className="ga-line" />
          </span>
          <span className="ga-pill ga-pill--glow ga-b2" />
          <span className="ga-pill ga-b3">
            <i className="ga-dots">
              <b />
              <b />
              <b />
            </i>
          </span>
        </>
      )}
      {v === 'g-onit' && (
        <>
          <span className="ga-pill ga-pill--glow ga-o1" />
          <span className="ga-pill ga-o2">
            <i className="ga-line ga-line--short" />
            <i className="ga-dots">
              <b />
              <b />
              <b />
            </i>
          </span>
        </>
      )}
      {v === 'g-search' && (
        <span className="ga-pill ga-search">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4 4" />
          </svg>
        </span>
      )}
      {v === 'g-toggle' && (
        <span className="ga-pill ga-pill--glow ga-toggle">
          <i className="ga-knob" />
        </span>
      )}
      {v === 'g-slider' && (
        <>
          <span className="ga-pill ga-track">
            <i className="ga-track__fill" />
            <i className="ga-knob ga-knob--sm" />
          </span>
          <span className="ga-pill ga-pill--glow ga-chip" />
        </>
      )}
      {v === 'g-lens' && (
        <>
          <span className="ga-lens" />
          <span className="ga-pill ga-pill--glow ga-lens-pill" />
        </>
      )}
      {v === 'g-layers' && (
        <>
          <span className="ga-sheet ga-s3" />
          <span className="ga-sheet ga-s2" />
          <span className="ga-sheet ga-s1" />
        </>
      )}
      {v === 'g-star' && (
        <svg className="ga-star" viewBox="0 0 72 72" width="72" height="72" aria-hidden>
          <defs>
            <linearGradient id="ga-star" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#3c64f0" />
              <stop offset="0.55" stopColor="#c86bd8" />
              <stop offset="1" stopColor="#ec6a4c" />
            </linearGradient>
          </defs>
          <path d="M36 4 C38 26 46 34 68 36 C46 38 38 46 36 68 C34 46 26 38 4 36 C26 34 34 26 36 4 Z" fill="none" stroke="url(#ga-star)" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}
function cx(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

/** Brighter (9 Nov, the client: "more brightness"): the book's icon tile, a glass squircle with the spectrum inside and
 *  a white glyph (p. 16), lit from below; coloured glass layers; a glowing orb; a bright switch. The glyph says where. */
const GLYPH: Record<string, typeof Bell> = {
  chart: ChartColumn,
  spark: Sparkles,
  send: Send,
  folder: Folder,
  chat: MessageCircle,
  bell: Bell,
  search: Search,
};
export function BrightArt({ v, small }: { v: string; small?: boolean }) {
  const G = v.startsWith('b-tile-') ? GLYPH[v.slice(7)] : undefined;
  return (
    <span className={cx('ga gb', small && 'ga--sm')} aria-hidden>
      {G && (
        <span className="gb-tile">
          <G size={28} strokeWidth={2} />
        </span>
      )}
      {v === 'b-layers' && (
        <>
          <span className="gb-slab gb-slab--3" />
          <span className="gb-slab gb-slab--2" />
          <span className="gb-slab gb-slab--1" />
        </>
      )}
      {v === 'b-orb' && <span className="gb-orb" />}
      {v === 'b-ring' && <Ring3D />}
      {v === 'b-toggle' && (
        <span className="gb-toggle">
          <i />
        </span>
      )}
    </span>
  );
}

/** The score ring in 3D (9 Nov): the ring tilted back, with a wall you can see. A frosted glass track, the spectrum
 *  arc as a solid piece of it (a darker wall, a lit top face, a white highlight), a grainy Noor halo under it, after
 *  the portrait key visual, and the Ink spark. */
function Ring3D() {
  const cx = 56;
  const cy = 30;
  const rx = 34;
  const ry = 16;
  const depth = [7, 6, 5, 4, 3, 2, 1];
  const ell = (dy: number, props: Record<string, unknown>) => <ellipse cx={cx} cy={cy + dy} rx={rx} ry={ry} fill="none" pathLength={100} {...props} />;
  // The arc: three quarters of the ring, from the right round the front to the back left; the gap at the back.
  const arc = { strokeDasharray: '70 100', strokeDashoffset: 0 };
  return (
    <svg className="gb-ring gb-ring3d" viewBox="0 0 120 72" width="120" height="72">
      <defs>
        <linearGradient id="r3-spec" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#2448ff" />
          <stop offset="0.45" stopColor="#8a4dff" />
          <stop offset="0.75" stopColor="#ff4fa3" />
          <stop offset="1" stopColor="#ff6a2a" />
        </linearGradient>
        <linearGradient id="r3-wall" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#1a2fb0" />
          <stop offset="0.45" stopColor="#5a2fc0" />
          <stop offset="0.75" stopColor="#c42a7c" />
          <stop offset="1" stopColor="#c8471a" />
        </linearGradient>
        <linearGradient id="r3-glass" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#efe9ff" stopOpacity="0.7" />
        </linearGradient>
        <filter id="r3-soft" x="-40%" y="-60%" width="180%" height="220%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0" result="g" />
          <feComposite in="g" in2="b" operator="in" result="gi" />
          <feBlend in="gi" in2="b" mode="soft-light" />
        </filter>
      </defs>
      {/* the light under it */}
      <ellipse cx={cx} cy={cy + 14} rx={rx + 4} ry={ry} fill="none" stroke="url(#r3-spec)" strokeWidth="12" opacity="0.7" filter="url(#r3-soft)" />
      {/* the glass track: its wall, then its face */}
      {depth.map((d) => ell(d, { key: `t${d}`, stroke: '#d9d0f2', strokeOpacity: 0.55, strokeWidth: 11 }))}
      {ell(0, { stroke: 'url(#r3-glass)', strokeWidth: 11 })}
      {/* the arc: its wall, then its lit face */}
      {depth.map((d) => ell(d, { key: `a${d}`, stroke: 'url(#r3-wall)', strokeWidth: 11, ...arc }))}
      {ell(0, { stroke: 'url(#r3-spec)', strokeWidth: 11, ...arc })}
      {/* highlights on the top face */}
      <ellipse cx={cx} cy={cy - 2.5} rx={rx - 2} ry={ry - 2.5} fill="none" pathLength={100} stroke="#fff" strokeOpacity="0.8" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="14 100" strokeDashoffset={-60} />
      <ellipse cx={cx} cy={cy} rx={rx - 5.5} ry={ry - 5.5} fill="none" stroke="#0e1116" strokeOpacity="0.12" strokeWidth="0.8" />
      {/* the spark */}
      <path d="M108 3 C108.6 9 110 10.4 116 11 C110 11.6 108.6 13 108 19 C107.4 13 106 11.6 100 11 C106 10.4 107.4 9 108 3 Z" fill="#0e1116" />
    </svg>
  );
}

/** Clear glass (9 Nov, after the highlight's rim): glass that takes the ground's colour, a faint dark edge with the
 *  light just inside it, a gloss at the top, an Ink glyph, a thin line of the spectrum's light under it. */
export function ClearArt({ v, small }: { v: string; small?: boolean }) {
  const glyph = v.startsWith('c-tile-') ? v.slice(7) : v.startsWith('c-bubble-') ? v.slice(9) : undefined;
  const G = glyph ? GLYPH[glyph] : undefined;
  return (
    <span className={cx('ga gc', small && 'ga--sm')} aria-hidden>
      {G && (
        <span className={cx('gc-obj', v.startsWith('c-bubble-') ? 'gc-obj--round' : 'gc-obj--tile')}>
          <G size={26} strokeWidth={1.7} />
        </span>
      )}
      {v === 'c-chat' && (
        <>
          <span className="gc-obj gc-pill gc-c1">
            <i />
          </span>
          <span className="gc-obj gc-pill gc-c2">
            <i />
            <i />
          </span>
          <span className="gc-obj gc-pill gc-c3">
            <b />
            <b />
            <b />
          </span>
        </>
      )}
      {v === 'c-search' && (
        <span className="gc-obj gc-pill gc-search">
          <Search size={16} strokeWidth={1.8} />
        </span>
      )}
    </span>
  );
}

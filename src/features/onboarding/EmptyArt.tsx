// Small still pictures for empty cards (6 Nov, review): Brand Analysis with no reports, Latest from Spark with nothing
// yet. One language: soft lilac glass shapes, the bars' gradient (Cobalt to violet, light), no motion. Latest moves
// away from Sparki, who reads as a live conversation, to pictures of waiting. Picked on #/demo/empty-art.
import { useEffect, useId, useState, type ReactNode } from 'react';
import {
  Bell,
  ChartColumn,
  ChartScatter,
  FileChartColumn,
  FilePlus,
  Files,
  FileUp,
  Folder,
  FolderOpen,
  Inbox,
  Mail,
  MessageCircle,
  MessageSquare,
  Plus,
  Radar,
  Search,
  Send,
  Sparkles,
} from 'lucide-react';

// The key-visual series (10 Nov, after the brand book p. 36): first in each list. "r-" pictures are drawn by KeyArt.
export const BA_ARTS = [
  { v: 'q-report', label: 'Glass · Report sheet' },
  { v: 's-lenschart', label: 'Soft · Magnifier + chart (main)' },
  { v: 's-report', label: 'Soft · Report sheet' },
  { v: 's-radar', label: 'Soft · Radar' },
  { v: 's-radar-card', label: 'Soft · Radar + card' },
  { v: 's-scatter', label: 'Soft · Dot chart' },
  { v: 's-bars', label: 'Soft · Bars' },
  { v: 's-ring', label: 'Soft · Score ring' },
  { v: 'r-icon-lenschart', label: 'Key · Magnifier + chart (main)' },
  { v: 'r-frost-lenschart', label: 'Key · Frosted magnifier + chart' },
  { v: 'r-icon-search', label: 'Key · Magnifier' },
  { v: 'r-frost-report', label: 'Key · Report sheet' },
  { v: 'r-icon-radar', label: 'Key · Radar' },
  { v: 'r-frost-scatter', label: 'Key · Dot chart' },
  { v: 'r-icon-chart', label: 'Key · Spark icon' },
  { v: 'r-frost-chart', label: 'Key · Frosted tile' },
  { v: 'r-cubes', label: 'Key · Glass cubes' },
  { v: 'r-stack', label: 'Key · Glass stack' },
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
  { v: 'q-bell', label: 'Glass · Bell' },
  { v: 's-spark', label: 'Soft · Spark (main)' },
  { v: 's-bell', label: 'Soft · Bell' },
  { v: 's-timeline', label: 'Soft · Timeline' },
  { v: 's-twinkle', label: 'Soft · Twinkling dots' },
  { v: 'r-icon-spark', label: 'Key · Spark (main)' },
  { v: 'r-frost-spark', label: 'Key · Frosted spark' },
  { v: 'r-icon-bell', label: 'Key · Bell' },
  { v: 'r-frost-timeline', label: 'Key · Timeline' },
  { v: 'r-icon-twinkle', label: 'Key · Twinkling dots' },
  { v: 'r-frost-mail', label: 'Key · Frosted mail' },
  { v: 'r-pill-logo', label: 'Key · Spark pill' },
  { v: 'r-stack', label: 'Key · Glass stack' },
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
      { v: 'q-docplus', label: 'Glass · Document + plus' },
      { v: 's-inboxplus', label: 'Soft · Inbox + plus (main)' },
      { v: 's-docplus', label: 'Soft · Document + plus' },
      { v: 's-plane', label: 'Soft · Paper plane' },
      { v: 's-bubble', label: 'Soft · Speech bubble' },
      { v: 'r-icon-inboxplus', label: 'Key · Inbox + plus (main)' },
      { v: 'r-frost-inboxplus', label: 'Key · Frosted inbox + plus' },
      { v: 'r-frost-fileplus', label: 'Key · Document + plus' },
      { v: 'r-icon-message', label: 'Key · Speech bubble' },
      { v: 'r-icon-send', label: 'Key · Paper plane' },
      { v: 'r-frost-send', label: 'Key · Frosted tile' },
      { v: 'r-stack', label: 'Key · Glass stack' },
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
      { v: 'q-folder', label: 'Glass · Folder' },
      { v: 's-folderopen', label: 'Soft · Open folder (main)' },
      { v: 's-sheets', label: 'Soft · Document sheets' },
      { v: 's-upload', label: 'Soft · Upload' },
      { v: 's-folder', label: 'Soft · Folder' },
      { v: 'r-icon-folderopen', label: 'Key · Open folder (main)' },
      { v: 'r-frost-folderopen', label: 'Key · Frosted open folder' },
      { v: 'r-icon-files', label: 'Key · Document sheets' },
      { v: 'r-frost-upload', label: 'Key · Upload' },
      { v: 'r-frost-folder', label: 'Key · Frosted folder' },
      { v: 'r-icon-folder', label: 'Key · Folder' },
      { v: 'r-cubes', label: 'Key · Glass cubes' },
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
      { v: 'q-chat', label: 'Glass · A conversation' },
      { v: 's-chat-ask', label: 'Soft · Ask Dr.AI (main)' },
      { v: 's-chat-pair', label: 'Soft · A conversation' },
      { v: 's-chat-typing', label: 'Soft · Typing' },
      { v: 's-chat-history', label: 'Soft · Empty history' },
      { v: 'r-icon-chat', label: 'Key · Spark icon' },
      { v: 'r-frost-chat', label: 'Key · Frosted tile' },
      { v: 'r-pill-chat', label: 'Key · Glass pill' },
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
      { v: 's-bell', label: 'Soft · Bell' },
      { v: 'q-bell', label: 'Glass · Bell' },
      { v: 'r-switch', label: 'Key · Spark switch' },
      { v: 'r-icon-bell', label: 'Key · Spark icon' },
      { v: 'r-frost-bell', label: 'Key · Frosted tile' },
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
      { v: 'q-lens', label: 'Glass · Magnifier' },
      { v: 'r-pill-search', label: 'Key · Glass pill' },
      { v: 'r-frost-search', label: 'Key · Frosted tile' },
      { v: 'r-icon-search', label: 'Key · Spark icon' },
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

// "-2" (10 Nov): the picks below became the portal's own, so picks a browser kept from before don't hide them.
const KEYS = {
  ba: 'spark-art-ba-2',
  latest: 'spark-art-latest-2',
  requests: 'spark-art-requests-2',
  files: 'spark-art-files-2',
  chats: 'spark-art-chats-2',
  notifs: 'spark-art-notifs-2',
  search: 'spark-art-search-2',
} as const;
// The portal's pictures (10 Nov, picked by the team on #/demo/empty-art): the soft series (notifications too, the
// same bell as Latest from Spark's), and the first still pictures' magnifier for search.
const PICKS: Partial<Record<keyof typeof KEYS, string>> = {
  ba: 's-report',
  latest: 's-bell',
  requests: 's-docplus',
  files: 's-folder',
  chats: 's-chat-pair',
  notifs: 's-bell',
  search: 'lens',
};
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
  const page = (k: PageKey) =>
    read<PageArt>(KEYS[k], PAGE_ARTS[k].list, (PICKS[k] ?? PAGE_ARTS[k].list.find((x) => x.v.startsWith('b-'))!.v) as PageArt);
  const get = () => ({
    ba: read<BaArt>(KEYS.ba, BA_ARTS, PICKS.ba as BaArt),
    latest: read<LatestArt>(KEYS.latest, LATEST_ARTS, PICKS.latest as LatestArt),
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
  if (v.startsWith('q-')) return <GlassPillArt v={v} />;
  if (v.startsWith('s-')) return <SoftArt v={v} />;
  if (v.startsWith('r-')) return <KeyArt v={v} />;
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
          <circle
            cx="36"
            cy="36"
            r="29"
            fill="none"
            stroke={S}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray="118 200"
            transform="rotate(-90 36 36)"
          />
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
  if (v.startsWith('q-')) return <GlassPillArt v={v} />;
  if (v.startsWith('s-')) return <SoftArt v={v} />;
  if (v.startsWith('r-')) return <KeyArt v={v} />;
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
  if (v.startsWith('q-')) return <GlassPillArt v={v} small={small} />;
  if (v.startsWith('s-')) return <SoftArt v={v} small={small} />;
  if (v.startsWith('r-')) return <KeyArt v={v} small={small} />;
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
          <path
            d="M10 40 H38 C40 40 41 41 42 43 L45 50 C46 52 47 53 49 53 H71 C73 53 74 52 75 50 L78 43 C79 41 80 40 82 40 H110 V62 C110 67 107 70 102 70 H18 C13 70 10 67 10 62 Z"
            fill={A}
          />
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
          <path
            d="M14 14 C14 10 17 8 21 8 H44 C47 8 49 9 51 11 L56 17 H99 C103 17 106 20 106 24 V62 C106 66 103 69 99 69 H21 C17 69 14 66 14 62 Z"
            fill={B}
          />
          <rect x="24" y="22" width="56" height="34" rx="5" fill="#fff" opacity="0.7" />
          <path d="M10 32 C10 28 13 26 17 26 H103 C107 26 110 28 110 32 L107 62 C107 66 104 69 100 69 H20 C16 69 13 66 13 62 Z" fill={A} />
        </g>
      )}
      {v === 'upload' && (
        <g>
          <rect x="10" y="20" width="100" height="50" rx="12" fill={B} strokeDasharray="5 5" />
          <rect
            x="10.75"
            y="20.75"
            width="98.5"
            height="48.5"
            rx="11.5"
            fill="none"
            stroke={S}
            strokeWidth="1.5"
            strokeDasharray="5 5"
            opacity="0.6"
          />
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
          <path
            d="M112 38 C112 34 109 31 105 31 H58 C54 31 51 34 51 38 V56 C51 60 54 63 58 63 H94 L104 70 V63 H105 C109 63 112 60 112 56 Z"
            fill={B}
          />
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
          <path
            d="M36 4 C38 26 46 34 68 36 C46 38 38 46 36 68 C34 46 26 38 4 36 C26 34 34 26 36 4 Z"
            fill="none"
            stroke="url(#ga-star)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
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
  const ell = (dy: number, props: Record<string, unknown>) => (
    <ellipse cx={cx} cy={cy + dy} rx={rx} ry={ry} fill="none" pathLength={100} {...props} />
  );
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
      <ellipse
        cx={cx}
        cy={cy - 2.5}
        rx={rx - 2}
        ry={ry - 2.5}
        fill="none"
        pathLength={100}
        stroke="#fff"
        strokeOpacity="0.8"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="14 100"
        strokeDashoffset={-60}
      />
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

/** The key-visual series (10 Nov, after the brand book p. 36): saturated glass lit from inside. The Spark icon (the
 *  spectrum melting in a squircle, Ember at its heart, a white glyph); a frosted tile with the spectrum glowing
 *  through and a glass glyph; the switch with an Ember knob carrying the spark; a clear pill floating on the spectrum's
 *  light; overlapping glass slabs; glass cubes with coloured cores. Built in CSS, 120 × 72. */
const KEY_GLYPH: Record<string, typeof Bell> = {
  ...GLYPH,
  mail: Mail,
  report: FileChartColumn,
  radar: Radar,
  scatter: ChartScatter,
  message: MessageSquare,
  fileplus: FilePlus,
  files: Files,
  upload: FileUp,
  folderopen: FolderOpen,
  // Two together (10 Nov, the main metaphors): the first glyph, with the second on a small Ember glass bead.
  lenschart: ChartColumn,
  inboxplus: Inbox,
};
const KEY_BADGE: Record<string, typeof Bell> = { lenschart: Search, inboxplus: Plus };
/** Drawn here, not in lucide: a timeline (a line with three events), twinkling dots (sparks and dots of light). */
function Timeline({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <path d="M6 3v18" />
      <circle cx="6" cy="6" r="2" fill="currentColor" />
      <circle cx="6" cy="12" r="2" fill="currentColor" />
      <circle cx="6" cy="18" r="2" fill="currentColor" />
      <path d="M11 6h9M11 12h6M11 18h8" />
    </svg>
  );
}
function Twinkle({ size = 30 }: { size?: number }) {
  const star = (x: number, y: number, r: number) =>
    `M${x} ${y - r} C${x + r * 0.12} ${y - r * 0.12} ${x + r * 0.12} ${y - r * 0.12} ${x + r} ${y} C${x + r * 0.12} ${y + r * 0.12} ${x + r * 0.12} ${y + r * 0.12} ${x} ${y + r} C${x - r * 0.12} ${y + r * 0.12} ${x - r * 0.12} ${y + r * 0.12} ${x - r} ${y} C${x - r * 0.12} ${y - r * 0.12} ${x - r * 0.12} ${y - r * 0.12} ${x} ${y - r} Z`;
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
      <path d={star(12, 13, 9)} fill="#fff" />
      <path d={star(25, 7, 4.5)} fill="#fff" opacity="0.85" />
      <path d={star(24, 24, 3.5)} fill="#fff" opacity="0.7" />
      <circle cx="6" cy="27" r="1.6" fill="#fff" opacity="0.7" />
      <circle cx="17" cy="28" r="1.2" fill="#fff" opacity="0.55" />
      <circle cx="29" cy="15" r="1.2" fill="#fff" opacity="0.55" />
    </svg>
  );
}
function SparkStar({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
      <path d="M16 1 C17 11 21 15 31 16 C21 17 17 21 16 31 C15 21 11 17 1 16 C11 15 15 11 16 1 Z" fill="#fff" />
    </svg>
  );
}
export function KeyArt({ v, small }: { v: string; small?: boolean }) {
  const kind = v.split('-')[1];
  const glyph = v.split('-')[2];
  const G = glyph ? KEY_GLYPH[glyph] : undefined;
  const Badge = glyph ? KEY_BADGE[glyph] : undefined;
  const mark =
    glyph === 'spark' ? (
      <SparkStar />
    ) : glyph === 'timeline' ? (
      <Timeline />
    ) : glyph === 'twinkle' ? (
      <Twinkle />
    ) : G ? (
      <>
        <G size={26} strokeWidth={2.2} />
        {Badge && (
          <span className="gk-badge">
            <Badge size={13} strokeWidth={3} />
          </span>
        )}
      </>
    ) : null;
  return (
    <span className={cx('ga gk', small && 'ga--sm')} aria-hidden>
      {kind === 'icon' && (
        <span className="gk-icon">
          <i className="gk-icon__glow" />
          <i className="gk-icon__paint" />
          <span className="gk-icon__mark">{mark}</span>
        </span>
      )}
      {kind === 'frost' && (
        <span className="gk-frost">
          <i className="gk-frost__light" />
          <span className="gk-frost__glass">{mark}</span>
        </span>
      )}
      {kind === 'switch' && (
        <span className="gk-switch">
          <i className="gk-switch__glow" />
          <span className="gk-switch__track">
            <i className="gk-switch__fill" />
          </span>
          <span className="gk-switch__knob">
            <SparkStar size={16} />
          </span>
        </span>
      )}
      {kind === 'pill' && (
        <span className="gk-pill">
          <i className="gk-pill__glow" />
          <span className="gk-pill__glass">
            {glyph === 'logo' && <img src="/brand/spark-logo-ink.png" alt="" />}
            {glyph === 'search' && (
              <>
                <Search size={15} strokeWidth={2.2} />
                <i className="gk-pill__line" />
              </>
            )}
            {glyph === 'chat' && (
              <i className="gk-pill__dots">
                <b />
                <b />
                <b />
              </i>
            )}
          </span>
        </span>
      )}
      {kind === 'stack' && (
        <span className="gk-stack">
          <i className="gk-stack__red" />
          <i className="gk-stack__haze" />
          <i className="gk-stack__orange" />
          <i className="gk-stack__blue" />
          <i className="gk-stack__front">
            <SparkStar size={16} />
          </i>
        </span>
      )}
      {kind === 'cubes' && (
        <span className="gk-cubes">
          {['blue', 'violet', 'magenta', 'pink', 'ember', 'peach'].map((c) => (
            <i key={c} className={`gk-cube gk-cube--${c}`} />
          ))}
        </span>
      )}
    </span>
  );
}

/** The soft series (10 Nov, review: "the Bars and Score ring style, but in our brand"): flat, still shapes in soft
 *  gradients, as the first pictures, in the brand's colours: Haze to a light Cobalt for the shapes, Cobalt for lines
 *  and marks, white for paper and glass, and one Ember spark (a dot, a plus, a handle) as the book asks. 120 × 72. */
function SoftDefs({ id }: { id: string }) {
  return (
    <defs>
      {/* the main shape: light Cobalt at the top melting into Haze */}
      <linearGradient id={`${id}a`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#1e3bd6" stopOpacity="0.3" />
        <stop offset="1" stopColor="#c8d8f0" stopOpacity="0.55" />
      </linearGradient>
      {/* what sits behind: Haze, fainter */}
      <linearGradient id={`${id}b`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#c8d8f0" stopOpacity="0.7" />
        <stop offset="1" stopColor="#c8d8f0" stopOpacity="0.3" />
      </linearGradient>
      {/* lines and marks: Cobalt */}
      <linearGradient id={`${id}s`} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#1e3bd6" stopOpacity="0.62" />
        <stop offset="1" stopColor="#1e3bd6" stopOpacity="0.4" />
      </linearGradient>
      {/* the one spark: Ember */}
      <linearGradient id={`${id}e`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#f07a4f" />
        <stop offset="1" stopColor="#e8501f" />
      </linearGradient>
    </defs>
  );
}
const star = (x: number, y: number, r: number) =>
  `M${x} ${y - r} C${x + r * 0.14} ${y - r * 0.14} ${x + r * 0.14} ${y - r * 0.14} ${x + r} ${y} C${x + r * 0.14} ${y + r * 0.14} ${x + r * 0.14} ${y + r * 0.14} ${x} ${y + r} C${x - r * 0.14} ${y + r * 0.14} ${x - r * 0.14} ${y + r * 0.14} ${x - r} ${y} C${x - r * 0.14} ${y - r * 0.14} ${x - r * 0.14} ${y - r * 0.14} ${x} ${y - r} Z`;
/** A white plus on an Ember disc: "make the first one". */
function EmberPlus({ x, y, r = 11, id }: { x: number; y: number; r?: number; id: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r + 2.5} fill="#fff" />
      <circle cx={x} cy={y} r={r} fill={`url(#${id}e)`} />
      <path
        d={`M${x - r * 0.42} ${y} H${x + r * 0.42} M${x} ${y - r * 0.42} V${y + r * 0.42}`}
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </g>
  );
}
export function SoftArt({ v, small }: { v: string; small?: boolean }) {
  const id = useId().replace(/:/g, '');
  const A = `url(#${id}a)`;
  const B = `url(#${id}b)`;
  const S = `url(#${id}s)`;
  const E = `url(#${id}e)`;
  return (
    <svg className={small ? 'ea ea--sm' : 'ea'} viewBox="0 0 120 72" width="120" height="72" aria-hidden>
      <SoftDefs id={id} />
      {v === 's-bars' && (
        <g>
          <rect x="0" y="34" width="22" height="38" rx="7" fill={A} />
          <rect x="30" y="16" width="22" height="56" rx="7" fill={A} />
          <rect x="60" y="26" width="22" height="46" rx="7" fill={A} />
          <rect x="90" y="4" width="22" height="68" rx="7" fill={A} />
          <circle cx="101" cy="4" r="4" fill={E} />
        </g>
      )}
      {v === 's-ring' && (
        <g transform="translate(24 0)">
          <circle cx="36" cy="36" r="29" fill="none" stroke={B} strokeWidth="11" />
          <circle
            cx="36"
            cy="36"
            r="29"
            fill="none"
            stroke={S}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray="118 200"
            transform="rotate(-90 36 36)"
          />
          <rect x="26" y="31" width="20" height="10" rx="5" fill={A} />
          <circle cx="36" cy="7" r="3.2" fill={E} />
        </g>
      )}
      {v === 's-lenschart' && (
        <g>
          <rect x="0" y="40" width="20" height="32" rx="7" fill={A} />
          <rect x="27" y="22" width="20" height="50" rx="7" fill={A} />
          <rect x="54" y="32" width="20" height="40" rx="7" fill={B} />
          <circle cx="78" cy="30" r="22" fill="#fff" fillOpacity="0.6" />
          <circle cx="78" cy="30" r="22" fill={B} />
          <circle cx="78" cy="30" r="22" fill="none" stroke={S} strokeWidth="5" />
          <path d="M68 36 L75 28 L81 33 L89 23" fill="none" stroke={S} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="94" y="48" width="24" height="10" rx="5" fill={E} transform="rotate(40 94 48)" />
        </g>
      )}
      {v === 's-report' && (
        <g>
          <rect x="40" y="4" width="48" height="64" rx="9" fill={B} transform="rotate(8 64 36)" />
          <path d="M30 8 C30 4 33 2 37 2 H66 L80 16 V64 C80 68 77 70 73 70 H37 C33 70 30 68 30 64 Z" fill={A} />
          <path d="M66 2 V12 C66 14 67 16 70 16 H80" fill="#fff" fillOpacity="0.6" />
          <rect x="38" y="14" width="20" height="5" rx="2.5" fill={S} />
          <rect x="38" y="46" width="7" height="14" rx="2.5" fill={S} opacity="0.55" />
          <rect x="49" y="38" width="7" height="22" rx="2.5" fill={S} opacity="0.75" />
          <rect x="60" y="30" width="7" height="30" rx="2.5" fill={S} />
          <circle cx="63.5" cy="23" r="3" fill={E} />
        </g>
      )}
      {/* Radar (10 Nov, review: the first take was crowded): Spark scanning the brand, simply. One ring, the sweep
          with a short fading trail, and what it found as an Ember dot. The second puts that find on a small card. */}
      {v === 's-radar' && (
        <g transform="translate(24 0)">
          <circle cx="36" cy="36" r="34" fill={B} />
          <circle cx="36" cy="36" r="21" fill="#fff" fillOpacity="0.55" />
          <path d="M36 36 L62.0 14.1 A34 34 0 0 0 50.4 5.2 Z" fill={S} fillOpacity="0.3" />
          <path d="M36 36 L50.4 5.2 A34 34 0 0 0 36 2 Z" fill={S} fillOpacity="0.12" />
          <path d="M36 36 L62 14.1" stroke={S} strokeWidth="3" strokeLinecap="round" />
          <circle cx="36" cy="36" r="3.5" fill={S} />
          <circle cx="48.9" cy="19.5" r="4.2" fill={E} />
        </g>
      )}
      {v === 's-radar-card' && (
        <g>
          <circle cx="30" cy="36" r="30" fill={B} />
          <circle cx="30" cy="36" r="18" fill="#fff" fillOpacity="0.55" />
          <path d="M30 36 L53.0 16.7 A30 30 0 0 0 42.7 8.8 Z" fill={S} fillOpacity="0.3" />
          <path d="M30 36 L42.7 8.8 A30 30 0 0 0 30 6 Z" fill={S} fillOpacity="0.12" />
          <path d="M30 36 L53 16.7" stroke={S} strokeWidth="3" strokeLinecap="round" />
          <circle cx="30" cy="36" r="3.2" fill={S} />
          <circle cx="41.1" cy="21.8" r="3.8" fill={E} />
          <rect x="70" y="22" width="46" height="28" rx="10" fill={A} />
          <rect x="79" y="30" width="22" height="4.5" rx="2.25" fill={S} />
          <rect x="79" y="39" width="28" height="4.5" rx="2.25" fill="#fff" fillOpacity="0.65" />
        </g>
      )}
      {/* No chats yet (10 Nov): one question waiting to be asked, a conversation, Dr.AI typing, an empty history. */}
      {v === 's-chat-ask' && (
        <g>
          <path d="M22 14 C22 8 26 4 32 4 H88 C94 4 98 8 98 14 V44 C98 50 94 54 88 54 H50 L36 66 V54 H32 C26 54 22 50 22 44 Z" fill={A} />
          <path d={star(60, 29, 13)} fill="#fff" fillOpacity="0.85" />
          <path d={star(84, 16, 4.5)} fill={E} />
        </g>
      )}
      {v === 's-chat-pair' && (
        <g>
          <path d="M8 12 C8 7 12 4 17 4 H67 C72 4 76 7 76 12 V34 C76 39 72 42 67 42 H30 L18 52 V42 H17 C12 42 8 39 8 34 Z" fill={A} />
          <rect x="18" y="15" width="40" height="5" rx="2.5" fill={S} />
          <rect x="18" y="26" width="26" height="5" rx="2.5" fill="#fff" fillOpacity="0.65" />
          <path
            d="M112 36 C112 32 109 29 105 29 H60 C56 29 53 32 53 36 V54 C53 58 56 61 60 61 H94 L104 69 V61 H105 C109 61 112 58 112 54 Z"
            fill={B}
          />
          <rect x="63" y="40" width="30" height="5" rx="2.5" fill={S} opacity="0.5" />
          <circle cx="103" cy="42.5" r="3" fill={E} />
        </g>
      )}
      {v === 's-chat-typing' && (
        <g>
          <path d="M18 16 C18 10 22 6 28 6 H92 C98 6 102 10 102 16 V46 C102 52 98 56 92 56 H44 L30 66 V56 H28 C22 56 18 52 18 46 Z" fill={A} />
          <circle cx="44" cy="31" r="6" fill={E} />
          <circle cx="60" cy="31" r="6" fill={S} opacity="0.7" />
          <circle cx="76" cy="31" r="6" fill={S} opacity="0.4" />
        </g>
      )}
      {v === 's-chat-history' && (
        <g>
          <rect x="14" y="4" width="92" height="18" rx="9" fill={A} />
          <circle cx="26" cy="13" r="4" fill={E} />
          <rect x="36" y="10.5" width="44" height="5" rx="2.5" fill={S} />
          <rect x="14" y="28" width="92" height="18" rx="9" fill={B} />
          <rect x="14" y="52" width="92" height="18" rx="9" fill={B} opacity="0.55" />
        </g>
      )}
      {v === 's-scatter' && (
        <g>
          <rect x="6" y="2" width="108" height="68" rx="12" fill={B} />
          <path d="M18 58 H102 M18 58 V12" stroke={S} strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 52 L96 18" stroke={S} strokeOpacity="0.45" strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />
          <circle cx="30" cy="46" r="5" fill={A} />
          <circle cx="44" cy="40" r="7" fill={A} />
          <circle cx="58" cy="44" r="4" fill={S} opacity="0.6" />
          <circle cx="66" cy="30" r="6" fill={A} />
          <circle cx="80" cy="34" r="4.5" fill={S} opacity="0.6" />
          <circle cx="92" cy="20" r="6.5" fill={E} />
        </g>
      )}
      {v === 's-spark' && (
        <g>
          <circle cx="60" cy="36" r="34" fill={B} />
          <path d={star(60, 36, 26)} fill={A} />
          <path d={star(60, 36, 26)} fill="#fff" fillOpacity="0.25" />
          <path d={star(91, 11, 9)} fill={E} />
          <circle cx="28" cy="60" r="3.5" fill={S} opacity="0.6" />
        </g>
      )}
      {v === 's-bell' && (
        <g>
          <path d="M60 8 C44 8 36 20 36 34 V46 L28 56 H92 L84 46 V34 C84 20 76 8 60 8 Z" fill={A} />
          <rect x="52" y="58" width="16" height="9" rx="4.5" fill={S} />
          <rect x="56" y="2" width="8" height="8" rx="4" fill={S} />
          <path d="M98 18 C102 22 104 28 104 34 M22 18 C18 22 16 28 16 34" fill="none" stroke={B} strokeWidth="4" strokeLinecap="round" />
          <circle cx="80" cy="14" r="7" fill="#fff" />
          <circle cx="80" cy="14" r="5" fill={E} />
        </g>
      )}
      {v === 's-timeline' && (
        <g>
          <rect x="22" y="6" width="4" height="62" rx="2" fill={B} />
          <circle cx="24" cy="12" r="7" fill={E} />
          <circle cx="24" cy="36" r="7" fill={A} />
          <circle cx="24" cy="60" r="7" fill={B} />
          <rect x="40" y="4" width="70" height="16" rx="8" fill={A} />
          <rect x="48" y="10" width="30" height="4" rx="2" fill={S} />
          <rect x="40" y="28" width="56" height="16" rx="8" fill={B} />
          <rect x="40" y="52" width="64" height="16" rx="8" fill={B} opacity="0.7" />
        </g>
      )}
      {v === 's-twinkle' && (
        <g>
          <path d={star(46, 34, 24)} fill={A} />
          <path d={star(84, 16, 11)} fill={A} />
          <path d={star(88, 52, 8)} fill={E} />
          <circle cx="14" cy="14" r="3.5" fill={S} opacity="0.5" />
          <circle cx="108" cy="34" r="3" fill={S} opacity="0.45" />
          <circle cx="20" cy="62" r="2.5" fill={S} opacity="0.4" />
          <circle cx="66" cy="66" r="3" fill={B} />
        </g>
      )}
      {v === 's-inboxplus' && (
        <g>
          <rect x="34" y="4" width="52" height="30" rx="7" fill={B} />
          <rect x="40" y="14" width="32" height="5" rx="2.5" fill={S} opacity="0.6" />
          <path
            d="M10 40 H38 C40 40 41 41 42 43 L45 50 C46 52 47 53 49 53 H71 C73 53 74 52 75 50 L78 43 C79 41 80 40 82 40 H110 V62 C110 67 107 70 102 70 H18 C13 70 10 67 10 62 Z"
            fill={A}
          />
          <EmberPlus x={96} y={18} id={id} />
        </g>
      )}
      {v === 's-docplus' && (
        <g>
          <path d="M34 8 C34 4 37 2 41 2 H70 L84 16 V64 C84 68 81 70 77 70 H41 C37 70 34 68 34 64 Z" fill={A} />
          <path d="M70 2 V12 C70 14 71 16 74 16 H84" fill="#fff" fillOpacity="0.6" />
          <rect x="42" y="24" width="28" height="5" rx="2.5" fill={S} />
          <rect x="42" y="35" width="34" height="5" rx="2.5" fill="#fff" fillOpacity="0.8" />
          <rect x="42" y="45" width="24" height="5" rx="2.5" fill="#fff" fillOpacity="0.8" />
          <EmberPlus x={84} y={58} id={id} />
        </g>
      )}
      {v === 's-plane' && (
        <g>
          <path
            d="M8 60 C26 64 36 50 50 52"
            fill="none"
            stroke={S}
            strokeOpacity="0.5"
            strokeWidth="2.5"
            strokeDasharray="2 6"
            strokeLinecap="round"
          />
          <path d="M52 40 L112 6 L96 64 L76 50 Z" fill={A} />
          <path d="M52 40 L112 6 L72 46 Z" fill="#fff" fillOpacity="0.5" />
          <path d="M72 46 L76 50 L74 64 Z" fill={B} />
          <path d="M72 46 L112 6" stroke={S} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <circle cx="112" cy="6" r="4" fill={E} />
        </g>
      )}
      {v === 's-bubble' && (
        <g>
          <path
            d="M112 34 C112 30 109 27 105 27 H62 C58 27 55 30 55 34 V54 C55 58 58 61 62 61 H96 L106 69 V61 H105 C109 61 112 58 112 54 Z"
            fill={B}
          />
          <path d="M8 12 C8 7 12 4 17 4 H67 C72 4 76 7 76 12 V36 C76 41 72 44 67 44 H30 L18 54 V44 H17 C12 44 8 41 8 36 Z" fill={A} />
          <rect x="18" y="15" width="40" height="5" rx="2.5" fill={S} />
          <rect x="18" y="26" width="26" height="5" rx="2.5" fill="#fff" fillOpacity="0.6" />
          <circle cx="98" cy="44" r="3" fill={E} />
          <circle cx="86" cy="44" r="3" fill={S} opacity="0.5" />
          <circle cx="74" cy="44" r="3" fill={S} opacity="0.3" />
        </g>
      )}
      {v === 's-folderopen' && (
        <g>
          <path
            d="M14 14 C14 10 17 8 21 8 H44 C47 8 49 9 51 11 L56 17 H99 C103 17 106 20 106 24 V62 C106 66 103 69 99 69 H21 C17 69 14 66 14 62 Z"
            fill={B}
          />
          <rect x="28" y="12" width="46" height="34" rx="5" fill="#fff" fillOpacity="0.8" transform="rotate(-6 51 29)" />
          <rect x="34" y="20" width="22" height="4" rx="2" fill={S} opacity="0.6" transform="rotate(-6 51 29)" />
          <path d="M26 34 C27 31 29 30 32 30 H112 C115 30 117 33 116 36 L108 64 C107 67 105 69 102 69 H20 C16 69 13 66 14 62 Z" fill={A} />
          <circle cx="100" cy="16" r="4" fill={E} />
        </g>
      )}
      {v === 's-sheets' && (
        <g>
          <rect x="22" y="10" width="40" height="54" rx="8" fill={B} transform="rotate(-10 42 37)" />
          <rect x="58" y="10" width="40" height="54" rx="8" fill={B} transform="rotate(10 78 37)" />
          <rect x="40" y="6" width="40" height="58" rx="8" fill={A} />
          <path d="M66 6 V18 C66 20 67 21 69 21 H80" fill="#fff" fillOpacity="0.6" />
          <rect x="48" y="30" width="24" height="4" rx="2" fill={S} />
          <rect x="48" y="40" width="18" height="4" rx="2" fill="#fff" fillOpacity="0.6" />
          <circle cx="92" cy="12" r="3.5" fill={E} />
        </g>
      )}
      {v === 's-upload' && (
        <g>
          <path d="M34 8 C34 4 37 2 41 2 H70 L84 16 V64 C84 68 81 70 77 70 H41 C37 70 34 68 34 64 Z" fill={A} />
          <path d="M70 2 V12 C70 14 71 16 74 16 H84" fill="#fff" fillOpacity="0.6" />
          <rect x="42" y="52" width="34" height="5" rx="2.5" fill={B} />
          <circle cx="59" cy="32" r="13" fill={E} />
          <path d="M59 39 V25 M53 31 L59 25 L65 31" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {v === 's-folder' && (
        <g>
          <path
            d="M14 14 C14 10 17 8 21 8 H44 C47 8 49 9 51 11 L56 17 H99 C103 17 106 20 106 24 V62 C106 66 103 69 99 69 H21 C17 69 14 66 14 62 Z"
            fill={B}
          />
          <rect x="24" y="22" width="56" height="34" rx="5" fill="#fff" fillOpacity="0.7" />
          <path d="M10 32 C10 28 13 26 17 26 H103 C107 26 110 28 110 32 L107 62 C107 66 104 69 100 69 H20 C16 69 13 66 13 62 Z" fill={A} />
          <rect x="22" y="38" width="22" height="5" rx="2.5" fill="#fff" fillOpacity="0.6" />
          <circle cx="96" cy="38" r="4" fill={E} />
        </g>
      )}
    </svg>
  );
}

/** The picked pictures as glass (10 Nov, review: "in the style of the glass pill"): each shape in clear glass, white
 *  at the top, a breath of lavender at the bottom, a white rim with Haze either side of it, Ink and Cobalt marks on
 *  it, one Ember spark, and the spectrum's light under it as under the pill. 120 × 72. */
function GlassPillArt({ v, small }: { v: string; small?: boolean }) {
  const id = useId().replace(/:/g, '');
  const F = `url(#${id}f)`;
  const G = `url(#${id}g)`;
  const E = `url(#${id}e)`;
  /** A piece of glass: the body, then its rim, Haze outside and a white line on it. */
  const glass = (d: string, k: string) => (
    <g key={k}>
      <path d={d} fill={F} />
      <path d={d} fill="none" stroke="#c8d8f0" strokeOpacity="0.95" strokeWidth="3.6" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
    </g>
  );
  /** The light under it: Cobalt on the left, Ember on the right. */
  const light = (x: number, w: number, y = 66) => <ellipse cx={x + w / 2} cy={y} rx={w / 2} ry="6" fill={G} filter={`url(#${id}b)`} opacity="0.7" />;
  const ink = 'rgba(14, 17, 22, 0.82)';
  const line = 'rgba(14, 17, 22, 0.16)';
  return (
    <svg className={small ? 'ea ea--sm' : 'ea'} viewBox="0 0 120 72" width="120" height="72" aria-hidden>
      <defs>
        <linearGradient id={`${id}f`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.97" />
          <stop offset="0.6" stopColor="#f6f5ff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#e6e3ff" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0.1" stopColor="#1e3bd6" />
          <stop offset="0.55" stopColor="#c86bd8" />
          <stop offset="0.9" stopColor="#e8501f" />
        </linearGradient>
        <linearGradient id={`${id}e`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f07a4f" />
          <stop offset="1" stopColor="#e8501f" />
        </linearGradient>
        <filter id={`${id}b`} x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      {v === 'q-report' && (
        <g>
          {light(36, 48)}
          {glass('M46 9 C46 6 48 4 51 4 H76 L88 16 V58 C88 61 86 63 83 63 H51 C48 63 46 61 46 58 Z', 'back')}
          {glass('M34 13 C34 10 36 8 39 8 H64 L76 20 V64 C76 67 74 69 71 69 H39 C36 69 34 67 34 64 Z', 'front')}
          <path d="M64 8 V17 C64 19 65 20 67 20 H76" fill="none" stroke="#c8d8f0" strokeWidth="1.5" />
          <rect x="41" y="20" width="16" height="4" rx="2" fill={ink} />
          <rect x="42" y="47" width="6" height="13" rx="2.5" fill="#1e3bd6" opacity="0.45" />
          <rect x="51" y="40" width="6" height="20" rx="2.5" fill="#1e3bd6" opacity="0.7" />
          <rect x="60" y="33" width="6" height="27" rx="2.5" fill="#1e3bd6" />
          <circle cx="63" cy="26" r="2.8" fill={E} />
        </g>
      )}
      {v === 'q-bell' && (
        <g>
          {light(34, 52)}
          {glass('M60 9 C46 9 39 20 39 33 V44 L32 54 H88 L81 44 V33 C81 20 74 9 60 9 Z', 'bell')}
          {glass('M52 57 H68 C68 62 65 66 60 66 C55 66 52 62 52 57 Z', 'clapper')}
          <path d="M48 24 C50 19 54 16 58 15" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="60" cy="6" r="3.5" fill={ink} />
          <circle cx="79" cy="16" r="6" fill="#fff" />
          <circle cx="79" cy="16" r="4.2" fill={E} />
        </g>
      )}
      {v === 'q-docplus' && (
        <g>
          {light(36, 52)}
          {glass('M38 8 C38 5 40 3 43 3 H68 L80 15 V62 C80 65 78 67 75 67 H43 C40 67 38 65 38 62 Z', 'doc')}
          <path d="M68 3 V12 C68 14 69 15 71 15 H80" fill="none" stroke="#c8d8f0" strokeWidth="1.5" />
          <rect x="45" y="22" width="22" height="4" rx="2" fill={ink} />
          <rect x="45" y="31" width="28" height="4" rx="2" fill={line} />
          <rect x="45" y="40" width="20" height="4" rx="2" fill={line} />
          <circle cx="80" cy="56" r="12" fill="#fff" />
          <circle cx="80" cy="56" r="9.5" fill={E} />
          <path d="M76 56 H84 M80 52 V60" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      )}
      {v === 'q-folder' && (
        <g>
          {light(24, 72)}
          {glass('M22 14 C22 11 24 9 27 9 H46 C48 9 50 10 51 12 L55 17 H93 C96 17 98 19 98 22 V60 C98 63 96 65 93 65 H27 C24 65 22 63 22 60 Z', 'back')}
          <rect x="32" y="19" width="46" height="26" rx="4" fill="#fff" stroke="#c8d8f0" strokeWidth="1.2" />
          <rect x="38" y="25" width="18" height="3.5" rx="1.75" fill={line} />
          {glass('M18 32 C18 29 20 27 23 27 H97 C100 27 102 29 102 32 L99 61 C99 64 97 66 94 66 H26 C23 66 21 64 21 61 Z', 'front')}
          <rect x="30" y="38" width="22" height="4" rx="2" fill={ink} />
          <circle cx="90" cy="38" r="3.2" fill={E} />
        </g>
      )}
      {v === 'q-chat' && (
        <g>
          {light(22, 80)}
          {glass('M12 12 C12 8 15 5 19 5 H65 C69 5 72 8 72 12 V32 C72 36 69 39 65 39 H32 L21 48 V39 H19 C15 39 12 36 12 32 Z', 'mine')}
          <rect x="21" y="15" width="34" height="4" rx="2" fill={ink} />
          <rect x="21" y="25" width="24" height="4" rx="2" fill={line} />
          {glass('M108 36 C108 32 105 29 101 29 H58 C54 29 51 32 51 36 V53 C51 57 54 60 58 60 H90 L99 67 V60 H101 C105 60 108 57 108 53 Z', 'reply')}
          <circle cx="66" cy="44.5" r="3" fill={ink} />
          <circle cx="76" cy="44.5" r="3" fill={ink} opacity="0.5" />
          <circle cx="86" cy="44.5" r="3" fill={ink} opacity="0.25" />
          <circle cx="98" cy="44.5" r="3" fill={E} />
        </g>
      )}
      {v === 'q-lens' && (
        <g>
          {light(30, 56)}
          {glass('M54 6 A24 24 0 1 1 53.9 6 Z', 'lens')}
          <circle cx="54" cy="30" r="15" fill="#fff" fillOpacity="0.6" stroke="#c8d8f0" strokeWidth="1.4" />
          <path d="M42 22 C44 18 48 16 52 15.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <rect x="47" y="28.5" width="14" height="3.5" rx="1.75" fill={line} />
          {glass('M71 49 L76 44 L92 60 C93.5 61.5 93.5 63.5 92 65 C90.5 66.5 88.5 66.5 87 65 Z', 'handle')}
          <circle cx="89" cy="62" r="2.6" fill={E} />
        </g>
      )}
    </svg>
  );
}

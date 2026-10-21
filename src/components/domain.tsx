// Small domain-aware building blocks shared by several screens.
import { FileArchive, FileImage, FileSpreadsheet, FileText, Presentation } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import type { Doc, DocKind, DocPreview, Folder, ProposalStatus, RequestStatus } from '../data/types';
import { Badge, cx, type Tone } from './ui/primitives';
export { kindOf } from '../lib/files';

// One name per state everywhere (badges, filters, status card). Whatever waits
// on the client reads "Needs your decision", for requests and proposals alike.
export const requestStatusMeta: Record<RequestStatus, { label: string; tone: Tone }> = {
  submitted: { label: 'New', tone: 'neutral' },
  in_review: { label: 'In review', tone: 'accent' },
  proposal: { label: 'Needs your decision', tone: 'warning' },
  changes_requested: { label: 'Changes requested', tone: 'neutral' },
  approved: { label: 'Approved', tone: 'positive' },
  in_progress: { label: 'In progress', tone: 'accent' },
  delivered: { label: 'Delivered', tone: 'positive' },
  declined: { label: 'Declined', tone: 'neutral' },
};

/** The same states named from the Spark team's side: whatever waits on the client is "Waiting for client",
 *  where the client reads "Needs your decision". One state, two points of view. */
export const sparkStatusLabel: Record<RequestStatus, string> = {
  submitted: 'New',
  in_review: 'In review',
  proposal: 'Waiting for client',
  changes_requested: 'Changes requested',
  approved: 'Approved',
  in_progress: 'In progress',
  delivered: 'Delivered',
  declined: 'Declined',
};

/** Four stages; the status in the badge says what is happening inside one:
 *  New (new, in review) → Proposal (waiting for the client, changes requested, declined)
 *  → In progress (approved, in progress) → Delivered. */
export const STAGES = ['New', 'Proposal', 'In progress', 'Delivered'] as const;

// What each stage means for the client, shown in the request's stage list.
export const STAGE_INFO: Record<(typeof STAGES)[number], string> = {
  New: 'Spark reviews your request and may come back with questions.',
  Proposal: 'You get scope, price and timeline to approve or change.',
  'In progress': 'Spark works on the deliverables; you review drafts.',
  Delivered: 'Final files land in Documents.',
};

/** The same stages, described from the Spark team's side. */
export const SPARK_STAGE_INFO: Record<(typeof STAGES)[number], string> = {
  New: 'Scope the work, ask the client any questions and send a proposal.',
  Proposal: 'The client approves the proposal or asks for changes.',
  'In progress': 'Work on the deliverables; the client reviews drafts.',
  Delivered: 'Final files land in the client’s Documents.',
};

export function stageIndex(s: RequestStatus) {
  switch (s) {
    case 'submitted':
    case 'in_review':
      return 0;
    case 'proposal':
    case 'changes_requested':
    case 'declined':
      return 1;
    case 'approved':
    case 'in_progress':
      return 2;
    case 'delivered':
      return 3;
  }
}

export const isOpen = (s: RequestStatus) => !['delivered', 'declined'].includes(s);

/**
 * A request's status as a filled pill, a colour per status (picked on
 * #/demo/status, 2b). When the next step waits on the client (`onClient`),
 * it reads "Needs your feedback" in the same amber as a decision.
 */
export function RequestStatus({ status, onClient }: { status: RequestStatus; onClient?: boolean }) {
  const onYou = status === 'proposal' || (onClient && status !== 'delivered' && status !== 'declined');
  const label = status === 'proposal' ? requestStatusMeta.proposal.label : onYou ? 'Needs your feedback' : requestStatusMeta[status].label;
  return (
    <span className={`rstatus rstatus--${onYou ? 'you' : status}`}>
      <span className="rstatus__dot" />
      {label}
    </span>
  );
}

export const proposalStatusMeta: Record<ProposalStatus, { label: string; tone: Tone }> = {
  awaiting: { label: 'Needs your decision', tone: 'warning' },
  changes_requested: { label: 'Changes requested', tone: 'neutral' },
  approved: { label: 'Approved', tone: 'positive' },
  declined: { label: 'Declined', tone: 'danger' },
  superseded: { label: 'Superseded', tone: 'neutral' },
};

export function ProposalStatus({ status }: { status: ProposalStatus }) {
  const m = proposalStatusMeta[status];
  return (
    <Badge tone={m.tone} dot>
      {m.label}
    </Badge>
  );
}

// ---- Files -------------------------------------------------------------------

const kindIcon: Record<DocKind, typeof FileText> = {
  pdf: FileText,
  image: FileImage,
  deck: Presentation,
  sheet: FileSpreadsheet,
  archive: FileArchive,
};

export const kindLabel: Record<DocKind, string> = { pdf: 'PDF', image: 'Image', deck: 'Presentation', sheet: 'Spreadsheet', archive: 'Archive' };

export function FileIcon({ kind, size = 18 }: { kind: DocKind; size?: number }) {
  const I = kindIcon[kind];
  return (
    <span className={cx('file-icon', `file-icon--${kind}`)}>
      <I size={size} strokeWidth={1.6} />
    </span>
  );
}

/** Generated artwork so image files have believable previews without assets. */
export function Art({ preview, className }: { preview: Extract<DocPreview, { type: 'art' }>; className?: string }) {
  const [a, b, c] = preview.palette;
  const common = { className: cx('art', className), viewBox: '0 0 320 220', preserveAspectRatio: 'xMidYMid slice' as const, 'aria-hidden': true };
  switch (preview.motif) {
    case 'night':
      return (
        <svg {...common}>
          <rect width="320" height="220" fill={a} />
          {Array.from({ length: 9 }).map((_, i) => (
            <g key={i} transform={`translate(${30 + i * 32} ${60 + (i % 3) * 14})`}>
              <line x1="0" y1="-60" x2="0" y2="0" stroke={b} strokeOpacity=".35" />
              <rect x="-8" y="0" width="16" height="24" rx="8" fill={b} opacity={0.55 + (i % 3) * 0.15} />
              <circle cx="0" cy="12" r="18" fill={b} opacity=".08" />
            </g>
          ))}
          <rect y="160" width="320" height="60" fill={c} opacity=".8" />
          <rect y="160" width="320" height="4" fill={b} opacity=".6" />
        </svg>
      );
    case 'bloom':
      return (
        <svg {...common}>
          <rect width="320" height="220" fill={a} />
          <circle cx="230" cy="70" r="46" fill={b} opacity=".9" />
          <path d="M0 170 Q80 120 160 160 T320 150 V220 H0Z" fill={b} opacity=".35" />
          <path d="M0 190 Q90 150 170 185 T320 175 V220 H0Z" fill={c} opacity=".85" />
          {[60, 90, 120].map((x, i) => (
            <g key={x} transform={`translate(${x} ${120 + i * 6})`}>
              <line x1="0" y1="0" x2="0" y2="50" stroke={c} strokeWidth="2" />
              <circle r={7 + i * 2} fill={b} />
            </g>
          ))}
        </svg>
      );
    case 'store':
      return (
        <svg {...common}>
          <rect width="320" height="220" fill={a} />
          <rect x="0" y="130" width="320" height="90" fill={b} opacity=".55" />
          <rect x="40" y="40" width="90" height="90" rx="45" fill={c} opacity=".85" />
          <rect x="170" y="60" width="110" height="70" fill={c} opacity=".18" />
          <rect x="60" y="150" width="200" height="14" rx="3" fill={c} opacity=".7" />
          <rect x="80" y="164" width="8" height="40" fill={c} opacity=".5" />
          <rect x="232" y="164" width="8" height="40" fill={c} opacity=".5" />
        </svg>
      );
    case 'pack':
      return (
        <svg {...common}>
          <rect width="320" height="220" fill={c} opacity=".12" />
          <rect width="320" height="220" fill={a} opacity=".9" />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${52 + i * 92} 40)`}>
              <path d="M0 14 L10 0 H62 L72 14 V150 H0Z" fill={i === 1 ? c : a} stroke={b} strokeOpacity=".5" />
              <rect x="14" y="40" width="44" height="44" rx="22" fill={b} opacity={i === 1 ? 0.9 : 0.6} />
              <rect x="14" y="100" width="44" height="4" fill={i === 1 ? a : b} opacity=".6" />
              <rect x="20" y="110" width="32" height="3" fill={i === 1 ? a : b} opacity=".4" />
            </g>
          ))}
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect width="320" height="220" fill={a} />
          <circle cx="160" cy="110" r="40" fill={b} />
        </svg>
      );
  }
}

export function DocThumb({ doc }: { doc: Doc }) {
  const p = doc.preview;
  if (p.type === 'art') return <Art preview={p} className="doc-thumb__art" />;
  if (p.type === 'pages')
    return (
      <div className="doc-thumb__page">
        <div className="doc-thumb__page-title">{p.pages[0]?.heading}</div>
        {[92, 80, 86, 60, 74].map((w, i) => (
          <span key={i} style={{ width: `${w}%` }} />
        ))}
      </div>
    );
  if (p.type === 'table')
    return (
      <div className="doc-thumb__sheet">
        {Array.from({ length: 5 }).map((_, r) => (
          <div key={r}>
            {Array.from({ length: 4 }).map((_, c) => (
              <span key={c} />
            ))}
          </div>
        ))}
      </div>
    );
  return (
    <div className="doc-thumb__icon">
      <FileIcon kind={doc.kind} size={26} />
    </div>
  );
}

// ---- Folders ----------------------------------------------------------------------------

/** One muted hue per top-level folder, in list order: low saturation so the
 *  folders sit in the dark UI next to the blue accent. */
export const FOLDER_HUES = ['#b0846a', '#7f78b0', '#5f7fb4', '#a87487', '#64917f', '#5f8f9c'];

/** Subfolders take the hue of the top-level folder they live in. */
export function folderHue(folders: Folder[], id: string): string {
  let f = folders.find((x) => x.id === id);
  while (f?.parentId) f = folders.find((x) => x.id === f!.parentId);
  const i = folders.filter((x) => x.parentId === null).findIndex((x) => x.id === f?.id);
  return FOLDER_HUES[Math.max(0, i) % FOLDER_HUES.length];
}

/** A folder drawn as a folder: sheets peek out of the back, the frosted,
 *  tabbed front carries the name and one line about what's inside. */
export function FolderTile({ name, sub, hue, href, onClick, badge }: { name: string; sub: string; hue: string; href?: string; onClick?: () => void; badge?: ReactNode }) {
  const body = (
    <>
      <span className="tile__sheets" aria-hidden>
        <span />
        <span />
        <span>
          <i />
          <i />
        </span>
      </span>
      {badge && <span className="tile__badge">{badge}</span>}
      <span className="tile__front">
        <span className="tile__text">
          <span className="tile__name">{name}</span>
          <span className="tile__desc">{sub}</span>
        </span>
      </span>
    </>
  );
  const props = { className: 'tile tile--tab', style: { '--hue': hue } as CSSProperties };
  return href ? (
    <a href={href} {...props}>
      {body}
    </a>
  ) : (
    <button onClick={onClick} {...props}>
      {body}
    </button>
  );
}

import { useMemo, useState } from 'react';
import { Calendar, FileText, Plus, Search, Tag, X } from 'lucide-react';
import { useStore } from '../../state/store';
import { useUI } from '../../state/ui';
import { useRoute } from '../../lib/router';
import { Button, EmptyState } from '../../components/ui/primitives';
import { FilterMenu } from '../../components/ui/overlay';
import { isOpen, NeedsYou, RequestStatus } from '../../components/domain';
import { fmtDate, fmtRelative } from '../../lib/format';
import type { RequestType, WorkRequest } from '../../data/types';
import { TYPES, TYPE_ICON } from './CreateRequestDialog';
import { ChatDrawer } from '../assistant/ChatDrawer';
import { SparkDisc } from '../../components/ui/BrandSpark';
import { GlassTabs } from '../../components/ui/GlassTabs';

type Filter = 'all' | 'decision' | 'active' | 'closed';
type Updated = 'any' | 'week' | 'month';
const UPDATED_DAYS: Record<Exclude<Updated, 'any'>, number> = { week: 7, month: 30 };

/** A date as everywhere else in lists ("22 Oct"); "4 h ago" only for today, as in Activity. */
const whenOf = (iso: string) => (new Date(iso).toDateString() === new Date().toDateString() ? fmtRelative(iso) : fmtDate(iso));

/** Waiting on the client: a proposal to decide on, or a question from Spark. */
const onYou = (r: WorkRequest) => r.status === 'proposal' || !!(r.nextStep?.onClient && isOpen(r.status));

/** A request sent in the last ten minutes stays at the top of the list, so the person sees it land. */
const isFresh = (r: WorkRequest) => r.status === 'submitted' && Date.now() - new Date(r.createdAt).getTime() < 10 * 60000;

/** One request per line, as a table row: title with the Ember mark when it waits on the client
 *  (the next step on hover), type, status, date. */
function RequestRow({ r }: { r: WorkRequest }) {
  const I = TYPE_ICON[r.type] ?? FileText;
  return (
    <a role="listitem" className="rq-row3" href={`#/requests/${r.id}`}>
      <span className="rq-row3__name">
        <span className="rq-row3__title">{r.title}</span>
        <NeedsYou request={r} />
      </span>
      <span className="rq-row3__type">
        <I size={15} strokeWidth={1.7} />
        {r.type}
      </span>
      <RequestStatus status={r.status} />
      <span className="rq-row3__when">{whenOf(r.updatedAt)}</span>
    </a>
  );
}

export function Requests() {
  const { state } = useStore();
  const { openRequest } = useUI();
  // #/requests?filter=decision opens on "Needs you" (the alert on Home links here).
  const { query } = useRoute();
  const [filter, setFilter] = useState<Filter>(() => {
    const f = query.get('filter') as Filter | null;
    return f && ['all', 'decision', 'active', 'closed'].includes(f) ? f : 'all';
  });
  const [q, setQ] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [type, setType] = useState<RequestType | 'any'>('any');
  const [updated, setUpdated] = useState<Updated>('any');
  const narrowed = !!q || type !== 'any' || updated !== 'any';
  const clearFilters = () => {
    setQ('');
    setType('any');
    setUpdated('any');
  };

  const needsDecision = onYou;
  const groups: Record<Filter, (r: WorkRequest) => boolean> = {
    all: () => true,
    decision: needsDecision,
    active: (r) => isOpen(r.status) && !needsDecision(r),
    closed: (r) => !isOpen(r.status),
  };

  const list = useMemo(
    () =>
      state.requests
        .filter(groups[filter])
        .filter((r) => (q ? `${r.id} ${r.title} ${r.type}`.toLowerCase().includes(q.toLowerCase()) : true))
        .filter((r) => type === 'any' || r.type === type)
        .filter((r) => updated === 'any' || Date.now() - new Date(r.updatedAt).getTime() <= UPDATED_DAYS[updated] * 86400000)
        .sort((a, b) => Number(isFresh(b)) - Number(isFresh(a)) || Number(needsDecision(b)) - Number(needsDecision(a)) || b.updatedAt.localeCompare(a.updatedAt)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.requests, filter, q, type, updated],
  );

  // Words only: the emoji marks read as off brand next to Ink on Sand (guidelines p. 30).
  const tabs: [Filter, string][] = [
    ['all', 'All'],
    ['decision', 'Needs you'],
    ['active', 'In progress'],
    ['closed', 'Closed'],
  ];

  // Quiet layout (picked on #/demo/requests-ui, 5): a small title and one line, text tabs, then one row
  // per request on hairlines: title, type with its icon, status, date.
  return (
    <div className="rqp">
      <div className="rq-head">
        <div>
          <h1 className="rq-head__title">Requests</h1>
          <p className="rq-head__sub">Ask Spark for new work and follow it to delivery.</p>
        </div>
        <div className="rq-head__acts">
          {/* Ask Spark as on Home: the mascot pill; it opens the chat drawer over this page. */}
          <button type="button" className="hl-mchat rq-ask" onClick={() => setChatOpen(true)}>
            <SparkDisc size={22} />
            Ask Spark
          </button>
          <Button size="sm" variant="primary" icon={Plus} onClick={() => openRequest()}>
            New request
          </Button>
        </div>
      </div>

      <div className="rq-centre rq-centre--left">
        <div className="rq-bar">
          <GlassTabs
            label="Requests"
            value={filter}
            onChange={setFilter}
            items={tabs.map(([v, label]) => ({ value: v, label, count: state.requests.filter(groups[v]).length, you: v === 'decision' }))}
          />
          <div className="rq-tools">
            <label className="rq-search">
              <Search size={15} />
              <input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search requests" />
            </label>
            <FilterMenu icon={Tag} label="Type" value={type} onChange={setType} options={[{ value: 'any', label: 'Any type' }, ...TYPES.map((t) => ({ value: t, label: t }))]} />
            <FilterMenu
              icon={Calendar}
              label="Updated"
              value={updated}
              onChange={setUpdated}
              options={[
                { value: 'any', label: 'Any time' },
                { value: 'week', label: 'Past 7 days' },
                { value: 'month', label: 'Past 30 days' },
              ]}
            />
            {narrowed && (
              <button className="link-btn filter-bar__clear" onClick={clearFilters}>
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState
            title={narrowed ? 'No requests match these filters.' : filter === 'decision' ? 'Nothing needs you.' : 'No requests yet.'}
            body={narrowed ? 'Try another word or clear the filters.' : 'Start a chat about your brand and turn a useful answer into a request.'}
            action={
              !narrowed && (
                <Button size="sm" onClick={() => openRequest()}>
                  New request
                </Button>
              )
            }
          />
        ) : (
          <div className="rq-list rq-tbl" role="list" aria-label="Requests">
            {/* Column labels in Diatype Mono (p. 32), on the same grid as the rows. */}
            <div className="rq-row3 rq-cols" aria-hidden>
              <span>Request</span>
              <span>Type</span>
              <span>Status</span>
              <span className="rq-row3__when">Updated</span>
            </div>
            {list.map((r) => (
              <RequestRow key={r.id} r={r} />
            ))}
          </div>
        )}
      </div>
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

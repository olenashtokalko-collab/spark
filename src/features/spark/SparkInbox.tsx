// Screen 1 · Inbox: requests from every client in one table, what waits on Spark first.
import { useMemo, useState } from 'react';
import { Building2, CircleAlert, FileText, Search, UserRound, X } from 'lucide-react';
import { Avatar, EmptyState, cx } from '../../components/ui/primitives';
import { TYPE_ICON } from '../requests/CreateRequestDialog';
import { FilterMenu } from '../../components/ui/overlay';
import { navigate } from '../../lib/router';
import { STATUS_LABEL, clientOf, clients, sparkTeam, type SparkRequest } from './data';
import { useSparkRequests } from './model';

type Tab = 'all' | 'reply' | 'new' | 'client' | 'done';

// A dot and a word, as in the client portal. New is yellow: the manager has to pick it up. Awaiting the
// client's decision is grey: nothing to do on Spark's side.
const chipTone = (s: SparkRequest['status']) => (s === 'proposal' ? 'superseded' : s);
export const SparkStatusChip = ({ r }: { r: SparkRequest }) => (
  <span className={`rstatus rstatus--${chipTone(r.status)}`}>
    <span className="rstatus__dot" />
    {STATUS_LABEL[r.status]}
  </span>
);

export function SparkInbox({ initialClient }: { initialClient?: string }) {
  const { list: requests } = useSparkRequests();
  const [tab, setTab] = useState<Tab>('all');
  const [q, setQ] = useState('');
  const [client, setClient] = useState<string>(initialClient ?? 'any');
  const [owner, setOwner] = useState<string>('any');

  const groups: Record<Tab, (r: SparkRequest) => boolean> = {
    all: () => true,
    reply: (r) => r.waiting === 'spark' && r.status !== 'submitted',
    new: (r) => r.status === 'submitted',
    client: (r) => r.waiting === 'client',
    done: (r) => r.status === 'delivered' || r.status === 'declined',
  };
  const list = useMemo(
    () =>
      requests
        .filter(groups[tab])
        .filter((r) => (q ? `${r.id} ${r.title} ${clientOf(r.clientId).name}`.toLowerCase().includes(q.toLowerCase()) : true))
        .filter((r) => client === 'any' || r.clientId === client)
        .filter((r) => owner === 'any' || r.owner.id === owner)
        .sort((a, b) => Number(b.waiting === 'spark') - Number(a.waiting === 'spark')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab, q, client, owner, requests],
  );
  const narrowed = !!q || client !== 'any' || owner !== 'any';

  const clear = () => {
    setQ('');
    setClient('any');
    setOwner('any');
  };
  const tabs: [Tab, string][] = [
    ['all', 'All'],
    ['new', 'New'],
    ['reply', 'Needs action'],
    ['client', 'Waiting on client'],
    ['done', 'Closed'],
  ];

  // As the client portal's Requests page: a small title and one line, text tabs, quiet search and
  // filters, then one row per request on hairlines, a quiet header above the columns.
  return (
    <div className="rqp spk-inbox">
      <div className="rq-head">
        <div>
          <h1 className="rq-head__title">Inbox</h1>
          <p className="rq-head__sub">Requests from every client in one place. What is waiting on Spark comes first.</p>
        </div>
      </div>
      <div className="rq-bar">
        <div className="rq-tabs" role="tablist" aria-label="Requests">
          {tabs.map(([v, label]) => (
            <button key={v} role="tab" aria-selected={tab === v} className={cx(tab === v && 'is-on')} onClick={() => setTab(v)}>
              {label}
              <span>{requests.filter(groups[v]).length}</span>
            </button>
          ))}
        </div>
        <div className="rq-tools">
          <label className="rq-search">
            <Search size={15} />
            <input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search requests or clients" />
          </label>
          <FilterMenu icon={Building2} label="Client" value={client} onChange={setClient} options={[{ value: 'any', label: 'All clients' }, ...clients.map((c) => ({ value: c.id, label: c.name }))]} />
          <FilterMenu icon={UserRound} label="Manager" value={owner} onChange={setOwner} options={[{ value: 'any', label: 'Anyone' }, ...sparkTeam.map((p) => ({ value: p.id, label: p.name }))]} />
          {narrowed && (
            <button className="link-btn filter-bar__clear" onClick={clear}>
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>
      {list.length === 0 ? (
        <EmptyState title="Nothing here." body="Try another tab or clear the filters." />
      ) : (
        <div className="spk-t" role="table" aria-label="Requests from all clients">
          <div className="spk-t__row spk-t__row--head" role="row">
            <span role="columnheader">Request</span>
            <span role="columnheader">Client</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Manager</span>
            <span role="columnheader" className="spk-t__end">
              Due
            </span>
          </div>
          {list.map((r) => {
            const I = TYPE_ICON[r.type as keyof typeof TYPE_ICON] ?? FileText;
            return (
              <a key={r.id} role="row" className="spk-t__row" href={`#/spark/requests/${r.id}`} onClick={(e) => (e.preventDefault(), navigate(`/spark/requests/${r.id}`))}>
                <span role="cell" className="spk-t__req">
                  {/* What waits on Spark (a new request to pick up, a reply, a proposal to send) is marked beside
                      the title, as the client portal marks what waits on the client; it says why on hover. */}
                  <span className="rq-row3__name">
                    <span className="spk-t__title">{r.title}</span>
                    {r.waiting === 'spark' && (
                      <span className="needs-you" title={r.waitingFor ?? 'Needs action'} aria-label={r.waitingFor ?? 'Needs action'} role="img">
                        <CircleAlert size={15} strokeWidth={2.2} />
                      </span>
                    )}
                  </span>
                  <span className="spk-t__meta">
                    <span className="mono">{r.id}</span>
                    <span className="spk-t__type">
                      <I size={13} strokeWidth={1.8} /> {r.type}
                    </span>
                  </span>
                </span>
                <span role="cell" className="spk-t__client">
                  <span className="spk-t__co">{clientOf(r.clientId).name}</span>
                  <span className="spk-t__who">{r.requester.name}</span>
                </span>
                <span role="cell">
                  <SparkStatusChip r={r} />
                </span>
                <span role="cell" className="spk-t__owner">
                  <Avatar person={r.owner} size={22} />
                  {r.owner.name.split(' ')[0]}
                </span>
                <span role="cell" className="spk-t__quiet spk-t__end">
                  {r.due ?? '—'}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

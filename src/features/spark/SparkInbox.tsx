// Screen 1 · Inbox: requests from every client in one table, what waits on Spark first.
import { useMemo, useState } from 'react';
import { Building2, Search, UserRound, X } from 'lucide-react';
import { Avatar, Input, PageHeader, Tabs, EmptyState } from '../../components/ui/primitives';
import { FilterMenu } from '../../components/ui/overlay';
import { navigate } from '../../lib/router';
import { STATUS_LABEL, clientOf, clients, sparkTeam, type SparkRequest } from './data';
import { useSparkRequests } from './model';

type Tab = 'all' | 'reply' | 'new' | 'client' | 'done';

export const SparkStatusChip = ({ r }: { r: SparkRequest }) => (
  <span className={`rstatus rstatus--${r.status === 'proposal' ? 'you' : r.status}`}>
    <span className="rstatus__dot" />
    {STATUS_LABEL[r.status]}
  </span>
);

const WaitingBadge = ({ r }: { r: SparkRequest }) =>
  r.waiting === 'spark' ? (
    <span className="spk__wait spk__wait--spark" title={r.waitingFor}>
      On Spark
    </span>
  ) : r.waiting === 'client' ? (
    <span className="spk__wait" title={r.waitingFor}>
      On client
    </span>
  ) : (
    <span className="faint">—</span>
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

  return (
    <div>
      <PageHeader title="Inbox" sub="Requests from every client in one place. What is waiting on Spark comes first." />
      <div className="toolbar">
        <Tabs
          className="tabs--underline"
          value={tab}
          onChange={setTab}
          items={[
            { value: 'all', label: 'All', count: requests.length },
            { value: 'new', label: 'New', count: requests.filter(groups.new).length },
            { value: 'reply', label: 'Needs a reply', count: requests.filter(groups.reply).length },
            { value: 'client', label: 'Waiting on client', count: requests.filter(groups.client).length },
            { value: 'done', label: 'Closed', count: requests.filter(groups.done).length },
          ]}
        />
      </div>
      <div className="filter-bar">
        <Input icon={Search} placeholder="Search requests or clients" value={q} onChange={(e) => setQ(e.target.value)} className="filter-bar__search" aria-label="Search requests" />
        <FilterMenu icon={Building2} label="Client" value={client} onChange={setClient} options={[{ value: 'any', label: 'All clients' }, ...clients.map((c) => ({ value: c.id, label: c.name }))]} />
        <FilterMenu icon={UserRound} label="Owner" value={owner} onChange={setOwner} options={[{ value: 'any', label: 'Anyone' }, ...sparkTeam.map((p) => ({ value: p.id, label: p.name }))]} />
        {narrowed && (
          <button
            className="link-btn filter-bar__clear"
            onClick={() => {
              setQ('');
              setClient('any');
              setOwner('any');
            }}
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>
      {list.length === 0 ? (
        <EmptyState title="Nothing here." body="Try another tab or clear the filters." />
      ) : (
        <div className="spk-table" role="table" aria-label="Requests from all clients">
          <div className="spk-row spk-row--head" role="row">
            <span role="columnheader">Request</span>
            <span role="columnheader">Client</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Waiting</span>
            <span role="columnheader">Owner</span>
            <span role="columnheader">Due</span>
            <span role="columnheader">Updated</span>
          </div>
          {list.map((r) => (
            <a key={r.id} role="row" className="spk-row" href={`#/spark/requests/${r.id}`} onClick={(e) => (e.preventDefault(), navigate(`/spark/requests/${r.id}`))}>
              <span role="cell" className="req-row__main">
                <span className="mono faint">{r.id}</span>
                <span className="req-row__title">{r.title}</span>
              </span>
              <span role="cell" className="spk-row__client">
                <span className="spk-row__co">{clientOf(r.clientId).name}</span>
                <span className="faint">{r.requester.name}</span>
              </span>
              <span role="cell">
                <SparkStatusChip r={r} />
              </span>
              <span role="cell">
                <WaitingBadge r={r} />
              </span>
              <span role="cell" className="spk-row__owner">
                <Avatar person={r.owner} size={22} />
                {r.owner.name.split(' ')[0]}
              </span>
              <span role="cell" className="muted">
                {r.due ?? '—'}
              </span>
              <span role="cell" className="faint">
                {r.updated}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// Screen 5 · Clients: every company Spark works with, who is on their side, and what is open.
import { useState } from 'react';
import { CircleAlert, Plus, Search } from 'lucide-react';
import { Avatar, AvatarStack, Button } from '../../components/ui/primitives';
import { useToast } from '../../components/ui/toast';
import { navigate } from '../../lib/router';
import { clients } from './data';
import { useSparkRequests } from './model';

export function SparkClients() {
  const toast = useToast();
  const { list: requests } = useSparkRequests();
  const [q, setQ] = useState('');
  const list = clients.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  // As the client portal's tables: a small title with the action beside it, a quiet search, then one row
  // per client on hairlines. What waits on Spark is marked as in the client's tables.
  return (
    <div className="rqp spk-clients-page">
      <div className="rq-head">
        <div>
          <h1 className="rq-head__title">Clients</h1>
          <p className="rq-head__sub">Every company Spark works with, the people on their side, and what is open.</p>
        </div>
        <div className="rq-head__acts">
          <Button size="sm" variant="primary" icon={Plus} onClick={() => toast({ title: 'Add a client', body: 'Name the company and invite its first owner by email.' })}>
            Add client
          </Button>
        </div>
      </div>
      <div className="rq-bar">
        <span />
        <div className="rq-tools">
          <label className="rq-search">
            <Search size={15} />
            <input placeholder="Search clients" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search clients" />
          </label>
        </div>
      </div>
      <div className="spk-t" role="table" aria-label="Clients">
        <div className="spk-t__row spk-t__row--head spk-t__row--clients" role="row">
          <span role="columnheader">Client</span>
          <span role="columnheader">Open requests</span>
          <span role="columnheader">Waiting on Spark</span>
          <span role="columnheader">People</span>
          <span role="columnheader">Lead</span>
          <span role="columnheader" className="spk-t__end">
            Last active
          </span>
        </div>
        {list.map((c) => {
          const mine = requests.filter((r) => r.clientId === c.id);
          const open = mine.filter((r) => r.status !== 'delivered' && r.status !== 'declined');
          const onSpark = mine.filter((r) => r.waiting === 'spark').length;
          return (
            <a key={c.id} role="row" className="spk-t__row spk-t__row--clients" href={`#/spark?client=${c.id}`} onClick={(e) => (e.preventDefault(), navigate(`/spark?client=${c.id}`))}>
              <span role="cell" className="spk-t__who-cell">
                <span className="spk-t__mono">{c.name[0]}</span>
                <span className="spk-t__client">
                  <span className="spk-t__co">{c.name}</span>
                  <span className="spk-t__who">{c.industry}</span>
                </span>
              </span>
              <span role="cell" className="spk-t__quiet">
                {open.length}
              </span>
              <span role="cell" className="spk-t__wait">
                {onSpark}
                {onSpark > 0 && (
                  <span className="needs-you" title="Waiting on Spark" aria-label="Waiting on Spark" role="img">
                    <CircleAlert size={15} strokeWidth={2.2} />
                  </span>
                )}
              </span>
              <span role="cell">
                <AvatarStack people={c.people} size={24} max={4} />
              </span>
              <span role="cell" className="spk-t__owner">
                <Avatar person={c.lead} size={22} />
                {c.lead.name.split(' ')[0]}
              </span>
              <span role="cell" className="spk-t__quiet spk-t__end">
                {c.lastActive}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

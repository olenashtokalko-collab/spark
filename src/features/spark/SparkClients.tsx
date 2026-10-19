// Screen 5 · Clients: every company Spark works with, who is on their side, and what is open.
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Avatar, AvatarStack, Button, Input, PageHeader } from '../../components/ui/primitives';
import { useToast } from '../../components/ui/toast';
import { navigate } from '../../lib/router';
import { clients, requests } from './data';

export function SparkClients() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const list = clients.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader
        title="Clients"
        sub="Every company Spark works with, the people on their side, and what is open."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => toast({ title: 'Add a client', body: 'Name the company and invite its first owner by email.' })}>
            Add client
          </Button>
        }
      />
      <div className="filter-bar">
        <Input icon={Search} placeholder="Search clients" value={q} onChange={(e) => setQ(e.target.value)} className="filter-bar__search" aria-label="Search clients" />
      </div>
      <div className="spk-clients">
        {list.map((c) => {
          const mine = requests.filter((r) => r.clientId === c.id);
          const open = mine.filter((r) => r.status !== 'delivered' && r.status !== 'declined');
          const onSpark = mine.filter((r) => r.waiting === 'spark').length;
          return (
            <a key={c.id} className="spk-client" href={`#/spark?client=${c.id}`} onClick={(e) => (e.preventDefault(), navigate(`/spark?client=${c.id}`))}>
              <div className="spk-client__top">
                <span className="spk-client__mono">{c.name[0]}</span>
                <div>
                  <div className="spk-client__name">{c.name}</div>
                  <div className="faint">{c.industry}</div>
                </div>
              </div>
              <div className="spk-client__stats">
                <div>
                  <strong>{open.length}</strong>
                  <span>open requests</span>
                </div>
                <div>
                  <strong className={onSpark ? 'spk-client__hot' : undefined}>{onSpark}</strong>
                  <span>waiting on Spark</span>
                </div>
                <div>
                  <strong>{c.people.length}</strong>
                  <span>people</span>
                </div>
              </div>
              <div className="spk-client__foot">
                <AvatarStack people={c.people} size={24} max={4} />
                <span className="spk-client__lead">
                  <Avatar person={c.lead} size={20} /> {c.lead.name.split(' ')[0]}
                </span>
                <span className="faint">Active {c.lastActive.toLowerCase()}</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

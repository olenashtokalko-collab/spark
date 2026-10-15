// Prototype-only page (#/demo/marks): one look for the round or square icon that leads a row,
// which today is three different things: soft tiles in Notifications, outline discs in
// Activity and raised white discs in Stages. Each row of this page shows the same three
// places (Notifications, Activity, Stages) in one look:
//   Now · today, as shipped (three looks)
//   A · raised disc (as Stages)   B · outline disc (as Activity)
//   C · soft tile (as Notifications)   D · bare icon, no container
// Every look uses one size (32px, icon 15px) and the same three states: active, done, to do.
import { BadgeCheck, FileText, Folder, Hammer, Inbox, ScanSearch, Send } from 'lucide-react';
import { PageHeader, cx } from '../../components/ui/primitives';

type State = 'active' | 'done' | 'todo';
type Icon = typeof Send;

function Mark({ icon: I, state }: { icon: Icon; state: State }) {
  return (
    <span className={cx('mkd__mark', `is-${state}`)}>
      <I size={15} strokeWidth={1.8} />
    </span>
  );
}

function Notifications() {
  const rows: { icon: Icon; title: string; sub: string; when: string; unread?: boolean }[] = [
    { icon: FileText, title: 'Proposal ready: UAE National Day window displays', sub: 'AED 54,000 · 6 weeks · decision by 18 Oct', when: '5 days ago', unread: true },
    { icon: Inbox, title: 'Spark started reviewing REQ-105', sub: 'Response plan for delivery fee complaints', when: '8 Oct' },
    { icon: Folder, title: 'Approval requested on packaging concepts', sub: 'Spark shared round 1 · due 15 Oct', when: '7 Oct' },
  ];
  return (
    <div className="mkd__ctx mkd__ctx--notif mkd__card">
      <div className="mkd__title">Notifications</div>
      {rows.map((r) => (
        <div key={r.title} className="mkd__notif">
          <Mark icon={r.icon} state={r.unread ? 'active' : 'done'} />
          <div>
            <div className="mkd__notif-title">{r.title}</div>
            <div className="mkd__sub">{r.sub}</div>
            <div className="mkd__when">{r.when}</div>
          </div>
          {r.unread && <i className="mkd__dot" />}
        </div>
      ))}
    </div>
  );
}

function Activity() {
  const rows: { icon: Icon; who: string; text: string; obj?: string; act?: string; when: string }[] = [
    { icon: FileText, who: 'Spark', text: 'sent a proposal', obj: 'AED 54,000 · 6 weeks', act: 'See proposal', when: '12:00' },
    { icon: ScanSearch, who: 'Spark', text: 'moved the request from Submitted to In review', when: '09:30' },
    { icon: Send, who: 'Layla Haddad', text: 'created this request', when: '10:00' },
  ];
  return (
    <div className="mkd__ctx mkd__ctx--activity">
      <div className="mkd__title">Activity</div>
      <ol className="mkd__list">
        {rows.map((r) => (
          <li key={r.text} className="mkd__row">
            <Mark icon={r.icon} state="done" />
            <div className="mkd__line">
              <span className="mkd__text">
                <b>{r.who}</b> {r.text} {r.obj && <span className="mkd__obj">{r.obj}</span>} {r.act && <span className="mkd__act">{r.act}</span>}
              </span>
              <span className="mkd__when">{r.when}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Stages() {
  const rows: { icon: Icon; name: string; info: string; state: State; due?: string }[] = [
    { icon: Send, name: 'Submitted', info: 'Your request is in Spark’s queue.', state: 'done' },
    { icon: ScanSearch, name: 'In review', info: 'Spark scopes the work and may come back with questions.', state: 'done' },
    { icon: FileText, name: 'Proposal', info: 'You get scope, price and timeline to approve or change.', state: 'active', due: 'Due Sun 18 Oct · in 3 days' },
    { icon: BadgeCheck, name: 'Approved', info: 'Spark schedules the kick-off.', state: 'todo' },
    { icon: Hammer, name: 'In progress', info: 'Spark works on the deliverables.', state: 'todo' },
  ];
  return (
    <div className="mkd__ctx mkd__ctx--stages mkd__card">
      <div className="mkd__title">Stages</div>
      <ol className="mkd__list">
        {rows.map((r) => (
          <li key={r.name} className={cx('mkd__row mkd__row--stage', `is-${r.state}`)}>
            <Mark icon={r.icon} state={r.state} />
            <div>
              <div className="mkd__stage-name">{r.name}</div>
              <div className="mkd__sub">{r.info}</div>
              {r.due && <div className="mkd__due">{r.due}</div>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

const SETS = [
  { id: 'now', name: 'Now: three different looks', note: 'Notifications are soft rounded tiles (32px), Activity is an outline disc (28px), Stages is a raised white disc (36px).' },
  { id: 'raised', name: 'A · Raised disc', note: 'One white disc with a hairline and a soft shadow, as in Stages. The current one gets a Cobalt ring. The most “object-like”, best on white cards.' },
  { id: 'outline', name: 'B · Outline disc', note: 'A thin ring, no fill, as in Activity. Lightest, works on Sand and on white. The current one gets a Cobalt ring.' },
  { id: 'tile', name: 'C · Soft tile', note: 'A rounded square tinted Cobalt when it is current or new, soft grey when done, as in Notifications. It is the only one that shows state by fill.' },
  { id: 'bare', name: 'D · Bare icon', note: 'No container at all: just the icon on the line. Cobalt when current, grey when done or to do. The quietest, but the least like a button.' },
] as const;

export function MarksDemo() {
  return (
    <div className="cdemo mkd">
      <PageHeader title="Icon marks" sub="One look for the icon that leads a row, in Notifications, Activity and Stages. Each row is the same three places in one look; the first row is how they are today." />
      <div className="mkd__sets">
        {SETS.map((s) => (
          <section key={s.id} className={cx('gdemo__card', 'mkd__set', `mkd__set--${s.id}`)}>
            <header>
              <h3>{s.name}</h3>
              <p>{s.note}</p>
            </header>
            <div className="mkd__stage">
              <Notifications />
              <Activity />
              <Stages />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

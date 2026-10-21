// Prototype-only page (#/demo/version-info): the box above the proposal that says which version is
// on screen, when it was sent and what the client did with it, with the client's comment. The version
// menu itself only lists versions; this box carries the detail. Four looks, for every client answer.
import { useState } from 'react';
import { Check, History, MessageSquareText, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Avatar, PageHeader, Tabs, cx } from '../../components/ui/primitives';

type Answer = 'changes' | 'approved' | 'declined' | 'new';
const layla = { id: 'u-layla', name: 'Layla Haddad', email: '', title: '', org: 'client' as const, hue: 20 };

const STATE: Record<Answer, { version: number; sent: string; did?: string; at?: string; note?: string; badge: string; tone: string }> = {
  changes: { version: 1, sent: '29 Sep', did: 'requested changes', at: '2 Oct', note: 'Over the Q4 budget. Can the films move to a later phase?', badge: 'Changes requested', tone: 'changes_requested' },
  approved: { version: 3, sent: '12 Oct', did: 'approved the proposal', at: '13 Oct', note: 'Looks good, let’s go.', badge: 'Approved', tone: 'approved' },
  declined: { version: 2, sent: '6 Oct', did: 'rejected the proposal', at: '9 Oct', note: 'We are pausing the Riyadh opening until Q2.', badge: 'Declined', tone: 'declined' },
  new: { version: 3, sent: '12 Oct', badge: 'New', tone: 'awaiting' },
};

const VARIANTS = [
  {
    id: 'sketch',
    name: 'A · As sketched',
    note: '“You’re viewing version 1” with the history icon on the left, “Sent 29 Sep” on the right; under it, what Layla did, then her comment. A version still waiting says “New” where the date sits.',
  },
  {
    id: 'badge',
    name: 'B · Status badge on the right',
    note: 'The version and the date on one line, the status as a coloured badge on the right. The comment sits in a soft grey bubble with Layla’s avatar.',
  },
  {
    id: 'rail',
    name: 'C · Coloured edge',
    note: 'No badge: a coloured edge on the left says how the client answered (rose, green, red; grey while waiting). The client’s words read like a quote.',
  },
  {
    id: 'chat',
    name: 'D · Like a message',
    note: 'The client’s answer as a message: avatar, “Layla requested changes”, her comment. The version and date are a quiet line on top.',
  },
] as const;
type Id = (typeof VARIANTS)[number]['id'];

function Icon({ a }: { a: Answer }) {
  return a === 'approved' ? <ThumbsUp size={14} /> : a === 'declined' ? <ThumbsDown size={14} /> : a === 'changes' ? <MessageSquareText size={14} /> : <Check size={14} />;
}

function Box({ id, a }: { id: Id; a: Answer }) {
  const st = STATE[a];
  const isNew = a === 'new';
  if (id === 'sketch')
    return (
      <div className="vid vid--sketch">
        <div className="vid__row">
          <span className="vid__line"><History size={16} /> You’re viewing <b>version {st.version}</b></span>
          {isNew ? <span className="vid__new">New</span> : <span className="vid__date">Sent {st.sent}</span>}
        </div>
        {isNew ? (
          <div className="vid__did faint">Sent {st.sent} · waiting for Layla</div>
        ) : (
          <>
            <div className={cx('vid__did', `vid__did--${st.tone}`)}>
              <Icon a={a} /> Layla {st.did} · {st.at}
            </div>
            {st.note && <p className="vid__note">{st.note}</p>}
          </>
        )}
      </div>
    );
  if (id === 'badge')
    return (
      <div className="vid vid--badge">
        <div className="vid__row">
          <span className="vid__line">
            <History size={16} /> You’re viewing <b>version {st.version}</b> · sent {st.sent}
          </span>
          <span className={cx('spv-status', `spv-status--${st.tone}`)}>
            <i /> {st.badge}
          </span>
        </div>
        {!isNew && (
          <div className="spv-info__note">
            <Avatar person={layla} size={22} />
            <div>
              <div className="spv-comment__who">
                <strong>Layla Haddad</strong>
                <span className="faint">· {st.at}</span>
              </div>
              <p>{st.note}</p>
            </div>
          </div>
        )}
      </div>
    );
  if (id === 'rail')
    return (
      <div className={cx('vid vid--rail', `vid--rail-${st.tone}`)}>
        <div className="vid__row">
          <span className="vid__line"><History size={16} /> You’re viewing <b>version {st.version}</b></span>
          {isNew ? <span className="vid__new">New</span> : <span className="vid__date">Sent {st.sent}</span>}
        </div>
        {isNew ? (
          <div className="vid__did faint">Waiting for Layla to answer</div>
        ) : (
          <>
            <div className={cx('vid__did', `vid__did--${st.tone}`)}>
              Layla {st.did} · {st.at}
            </div>
            {st.note && <blockquote className="vid__quote">“{st.note}”</blockquote>}
          </>
        )}
      </div>
    );
  return (
    <div className="vid vid--chat">
      <div className="vid__top faint">
        <History size={14} /> You’re viewing version {st.version} · sent {st.sent}
        {isNew && <span className="vid__new">New</span>}
      </div>
      {isNew ? (
        <div className="vid__did faint">No answer from Layla yet.</div>
      ) : (
        <div className="vid__msg">
          <Avatar person={layla} size={28} />
          <div>
            <div className={cx('vid__did', `vid__did--${st.tone}`)}>
              <Icon a={a} /> <b>Layla</b>&nbsp;{st.did} <span className="faint">· {st.at}</span>
            </div>
            {st.note && <div className="vid__bubble">{st.note}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export function VersionInfoDemo() {
  const [a, setA] = useState<Answer>('changes');
  return (
    <div className="cdemo cmddemo">
      <PageHeader
        title="Version box on the proposal"
        sub="The box above the proposal: which version is on screen, when it was sent, what the client did and what they said. The version menu now lists versions only."
      />
      <Tabs
        className="tabs--underline"
        value={a}
        onChange={setA}
        items={[
          { value: 'changes', label: 'Changes requested' },
          { value: 'approved', label: 'Approved' },
          { value: 'declined', label: 'Declined' },
          { value: 'new', label: 'New (waiting)' },
        ]}
      />
      <div className="psd-list">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className="cmddemo__stage psd-stage">
              <Box id={v.id} a={a} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

// Prototype-only page (#/demo/version-picker): looks for a quiet version dropdown
// to the right of the proposal title on the manager's page, replacing the arrows.
import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { PageHeader, Switch, cx } from '../../components/ui/primitives';
import { Popover } from '../../components/ui/overlay';

const VERSIONS = [
  { v: 3, status: 'Approved', tone: 'positive', sent: '12 Oct', total: 'AED 184,000' },
  { v: 2, status: 'Changes requested', tone: 'neutral', sent: '6 Oct', total: 'AED 186,000' },
  { v: 1, status: 'Changes requested', tone: 'neutral', sent: '29 Sep', total: 'AED 214,000' },
] as const;

const VARIANTS = [
  { id: 'pill', name: '1 · Quiet pill', note: 'A soft grey pill “v2” with a small chevron at the right end of the title row. Sent date and the toggle move to a quiet line under the title.' },
  { id: 'text', name: '2 · Text and chevron', note: 'No background at all: “Version 2 of 3” in grey with a chevron, right-aligned. Darkens on hover.' },
  { id: 'status', name: '3 · Version and status', note: 'The pill also says how the client answered that version: “v2 · Changes requested”, with the status dot.' },
  { id: 'inline', name: '4 · Next to the title', note: 'A small grey “v2” right after the title text, like a tag. Reads as part of the name.' },
  { id: 'timeline', name: '5 · Menu as a timeline', note: 'The quiet pill, but the menu shows the versions as a small history: a line through dots, status and date for each.' },
] as const;
type Id = (typeof VARIANTS)[number]['id'];

function Dot({ tone }: { tone: string }) {
  return <i className={cx('vpd-dot', `vpd-dot--${tone}`)} />;
}

function Picker({ id, at, setAt }: { id: Id; at: number; setAt: (v: number) => void }) {
  const cur = VERSIONS.find((x) => x.v === at)!;
  return (
    <Popover
      align={id === 'inline' ? 'start' : 'end'}
      width={id === 'timeline' ? 340 : 280}
      className="vpd-menu"
      trigger={({ open, toggle, ref }) => (
        <button ref={ref} className={cx('vpd-trigger', `vpd-trigger--${id}`, open && 'is-open')} onClick={toggle} aria-haspopup="menu" aria-expanded={open}>
          {id === 'text' ? (
            <>
              Version {at} <span className="vpd-of">of 3</span>
            </>
          ) : id === 'status' ? (
            <>
              v{at} <span className="vpd-sep">·</span> <Dot tone={cur.tone} /> {cur.status}
            </>
          ) : (
            <>v{at}</>
          )}
          <ChevronDown size={14} className="vpd-chev" />
        </button>
      )}
    >
      {(close) => (
        <div className={cx('vpd-list', id === 'timeline' && 'vpd-list--timeline')} role="menu">
          {[...VERSIONS].reverse().map((x) => (
            <button
              key={x.v}
              role="menuitemradio"
              aria-checked={x.v === at}
              className={cx('vpd-item', x.v === at && 'is-current')}
              onClick={() => {
                setAt(x.v);
                close();
              }}
            >
              {id === 'timeline' && <span className="vpd-node" />}
              <span className="vpd-item__main">
                <span className="vpd-item__v">
                  Version {x.v}
                </span>
                <span className="vpd-item__meta">
                  <Dot tone={x.tone} /> {x.status} · sent {x.sent}
                </span>
              </span>
              {id === 'timeline' ? <span className="vpd-item__total">{x.total}</span> : x.v === at ? <Check size={15} className="vpd-check" /> : null}
            </button>
          ))}
        </div>
      )}
    </Popover>
  );
}

function Head({ id }: { id: Id }) {
  const [at, setAt] = useState(2);
  const [on, setOn] = useState(true);
  const sent = VERSIONS.find((x) => x.v === at)!.sent;
  const toggle = at > 1 && (
    <span className="spv-toggle">
      <Switch checked={on} onChange={setOn} label={`Show changes from v${at - 1}`} />
      <span onClick={() => setOn(!on)}>Show changes from v{at - 1}</span>
    </span>
  );
  if (id === 'inline')
    return (
      <div className="vpd-head">
        <div className="vpd-row">
          <h1 className="proposal__title vpd-title">
            Riyadh launch campaign <Picker id={id} at={at} setAt={setAt} />
          </h1>
        </div>
        <div className="vpd-meta">
          <span>Sent {sent} to Layla</span>
          {toggle}
        </div>
      </div>
    );
  return (
    <div className="vpd-head">
      <div className="vpd-row">
        <h1 className="proposal__title vpd-title">Riyadh launch campaign</h1>
        <Picker id={id} at={at} setAt={setAt} />
      </div>
      <div className="vpd-meta">
        <span>Sent {sent} to Layla</span>
        {toggle}
      </div>
    </div>
  );
}

export function VersionPickerDemo() {
  return (
    <div className="cdemo cmddemo">
      <PageHeader title="Version dropdown" sub="Five quiet ways to pick a proposal version from a dropdown to the right of the title, instead of the arrows. Each one opens." />
      <div className="vpd-list-demo">
        {VARIANTS.map((v) => (
          <section key={v.id} className="gdemo__card">
            <header>
              <h3>{v.name}</h3>
              <p>{v.note}</p>
            </header>
            <div className="cmddemo__stage vpd-stage">
              <Head id={v.id} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

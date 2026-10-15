// Prototype-only page (#/demo/clickables): the changes proposed after checking every
// clickable element. Each block shows what it is today next to how it would change.
// The controls are the real ones; a row marked "hover" has the hover look forced on so
// you can compare without holding the mouse, and every control still reacts live.
//   1 · Chat chips: the source chip made one family with follow-ups and "Sources".
//   2 · Hover for the avatar button, the logo and the theme buttons (none today).
//   3 · Row hover: the two sets today, or one for everything (two options).
import { ArrowRight, ChevronDown, FileText, Monitor, Moon, Settings, Sun, UserPlus } from 'lucide-react';
import { Avatar, PageHeader, cx } from '../../components/ui/primitives';
import { FileIcon, kindOf } from '../../components/domain';
import { useStore } from '../../state/store';

// ---- 1 · Chat chips -----------------------------------------------------------------

function ChipRow() {
  return (
    <div className="ck-chips">
      <button className="sources__toggle">
        Sources · 3 <ChevronDown size={13} />
      </button>
      <button className="src-chip">
        <FileText size={13} /> Proposal · Riyadh launch campaign
      </button>
      <button className="src-chip">
        <FileText size={13} /> Q4 marketing budget.xlsx
      </button>
      <button className="followup">
        <ArrowRight size={12} /> A signature product made only for the opening
      </button>
    </div>
  );
}

// ---- 2 · Hover where there is none ---------------------------------------------------

function HoverPair({ children }: { children: (hover: boolean) => React.ReactNode }) {
  return (
    <>
      <div className="ck-cell">{children(false)}</div>
      <div className="ck-cell">{children(true)}</div>
    </>
  );
}

function Controls({ version }: { version: 'was' | 'now' }) {
  const { me } = useStore();
  const rows: { name: string; render: (hover: boolean) => React.ReactNode; note: string }[] = [
    {
      name: 'Avatar button',
      note: 'now: a soft halo',
      render: (h) => (
        <button className={cx('user-btn', h && 'is-hover')} aria-label="Account">
          <Avatar person={me} size={30} />
        </button>
      ),
    },
    {
      name: 'Logo',
      note: 'now: lifts a little',
      render: (h) => (
        <a className={cx('topbar__logo', h && 'is-hover')} href="#/demo/clickables" aria-label="Spark">
          <img className="topbar__icon brand-only" src="/brand/spark-app-icon.jpg" alt="" />
        </a>
      ),
    },
    {
      name: 'Theme buttons',
      note: 'now: the fill darkens',
      render: (h) => (
        <div className="theme-pick ck-theme">
          <button className="is-active">
            <Sun size={14} /> Light
          </button>
          <button className={cx(h && 'is-hover')}>
            <Moon size={14} /> Dark
          </button>
          <button>
            <Monitor size={14} /> System
          </button>
        </div>
      ),
    },
  ];
  return (
    <div className={cx('ck-grid', `ck-${version}`)}>
      <span />
      <span className="ck-col">Rest</span>
      <span className="ck-col">Hover</span>
      {rows.map((r) => (
        <div key={r.name} className="ck-grid__row">
          <span className="ck-name">
            {r.name}
            {version === 'now' && <em>{r.note}</em>}
          </span>
          <HoverPair>{r.render}</HoverPair>
        </div>
      ))}
    </div>
  );
}

// ---- 3 · Row hover -------------------------------------------------------------------

const FILES = ['Brand guidelines v3.2.pdf', 'Moodboard — Night Market.png', 'Q4 marketing budget.xlsx'];

function RowSamples({ id }: { id: 'ship' | 'a' | 'b' }) {
  return (
    <div className={cx('ck-rows', `ck-rows--${id}`)}>
      <div className="ck-rows__label">Table row</div>
      <div className="req-table">
        {[
          ['REQ-100', 'UAE National Day window displays', '5 days ago'],
          ['REQ-104', 'Riyadh launch campaign', '6 Oct'],
          ['REQ-105', 'Response plan for delivery fee', '8 Oct'],
        ].map((r, i) => (
          <div key={r[0]} className={cx('req-row', i === 1 && 'is-hover')}>
            <span className="req-row__main">
              <span className="mono faint">{r[0]}</span>
              <span className="req-row__title">{r[1]}</span>
            </span>
            <span className="faint">{r[2]}</span>
          </div>
        ))}
      </div>
      <div className="ck-rows__label">List row</div>
      <div className="file-rows">
        {FILES.map((f, i) => (
          <button key={f} className={cx('file-row', i === 1 && 'is-hover')}>
            <FileIcon kind={kindOf(f)} />
            <span className="file-row__name">{f}</span>
            <span className="faint">Spark · 2 h ago</span>
          </button>
        ))}
      </div>
      <div className="ck-rows__label">Menu item</div>
      <div className="menu ck-menu">
        {[
          [UserPlus, 'Invite people'],
          [Settings, 'Manage team'],
          [Sun, 'Appearance'],
        ].map(([I, label], i) => {
          const Icon = I as typeof Sun;
          return (
            <button key={label as string} className={cx('menu__item', i === 1 && 'is-hover')}>
              <Icon size={15} />
              <span>{label as string}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- Page ----------------------------------------------------------------------------

export function ClickablesDemo() {
  return (
    <div className="cdemo ckdemo">
      <PageHeader title="Clickable elements" sub="What changes after the check of every clickable element: how it is today, and how it would look. The second row of each pair has hover forced on; every control also reacts live." />

      <section className="gdemo__card">
        <header>
          <h3>1 · Chat chips: one family (applied)</h3>
          <p>Before, the file chip under an answer is a white 28px pill with grey text, while “Sources” and the follow-ups are 30px grey pills with dark text. Now the file chip takes the same look, so all chat chips match, and it stays visible on a white card.</p>
        </header>
        <div className="ck-compare">
          <div>
            <div className="ck-tag">Before</div>
            <div className="ck-stage ck-was">
              <ChipRow />
            </div>
          </div>
          <div>
            <div className="ck-tag is-now">Now in the app</div>
            <div className="ck-stage ck-now">
              <ChipRow />
            </div>
          </div>
          <div>
            <div className="ck-tag">Before, on a white card</div>
            <div className="ck-stage ck-stage--card ck-was">
              <ChipRow />
            </div>
          </div>
          <div>
            <div className="ck-tag is-now">Now in the app, on a white card</div>
            <div className="ck-stage ck-stage--card ck-now">
              <ChipRow />
            </div>
          </div>
        </div>
      </section>

      <section className="gdemo__card">
        <header>
          <h3>2 · Hover where there is none</h3>
          <p>The avatar button, the logo and the theme buttons give no reaction on hover today. After: a soft halo around the avatar, a small lift for the logo, a darker fill for a theme button.</p>
        </header>
        <div className="ck-compare">
          <div>
            <div className="ck-tag">Today</div>
            <div className="ck-stage">
              <Controls version="was" />
            </div>
          </div>
          <div>
            <div className="ck-tag is-now">After</div>
            <div className="ck-stage">
              <Controls version="now" />
            </div>
          </div>
        </div>
      </section>

      <section className="gdemo__card">
        <header>
          <h3>3 · Row hover: one set or two (B applied)</h3>
          <p>Today tables (Requests, the file list) light up in a Cobalt tint and everything else (file rows, menus, notifications, history) in grey. Option A makes everything the Cobalt tint, option B makes everything grey. The middle row of each sample is hovered.</p>
        </header>
        <div className="ck-compare ck-compare--3">
          <div>
            <div className="ck-tag">Before: two sets</div>
            <div className="ck-stage ck-stage--card">
              <RowSamples id="ship" />
            </div>
          </div>
          <div>
            <div className="ck-tag is-now">A · all Cobalt tint</div>
            <div className="ck-stage ck-stage--card">
              <RowSamples id="a" />
            </div>
          </div>
          <div>
            <div className="ck-tag is-now">B · all grey (now in the app)</div>
            <div className="ck-stage ck-stage--card">
              <RowSamples id="b" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

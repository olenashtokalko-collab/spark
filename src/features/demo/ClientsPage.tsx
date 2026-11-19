// The Spark team's start page (19 Nov): every client on one list, so the team sees where it's needed before opening a
// client's page. A general version, made before Jean's answers on the team's role: it holds whatever the answers are
// (who can approve, how many clients a person has), since it only shows what's waiting and on whom.
//   · Tabs: All · Needs Spark (a request waits for a proposal or for changes) · Waiting on client (a proposal sent)
//     · Quiet (no update in 14 days).
//   · A row: the client's mark and name, what it is; its health in a figure and a word; what waits on Spark and on the
//     client; when Spark last updated its page. A click opens the client's page as the client sees it.
// Add update: what Spark posts on a client's page (a note on what changed and where it shows), from the client's Home.
import { useMemo, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { useStore } from '../../state/store';
import { navigate } from '../../lib/router';
import { GlassTabs } from '../../components/ui/GlassTabs';
import { Dialog } from '../../components/ui/overlay';
import { Button, EmptyState, Field, Textarea, cx } from '../../components/ui/primitives';
import { PageArtView, useArt } from '../onboarding/EmptyArt';
import { BrandMark, brandStore, brandsFor, updatesStore, useUpdatedAt, type BrandItem } from './HealthHead';
import { clientPage } from './HomeHealth';
import type { RequestStatus } from '../../data/types';

const ON_SPARK: RequestStatus[] = ['submitted', 'in_review', 'changes_requested'];
const ON_CLIENT: RequestStatus[] = ['proposal'];
const QUIET_DAYS = 14;
const TODAY = new Date('2026-11-19T12:00:00');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const daysAgo = (iso: string) => Math.max(0, Math.floor((TODAY.getTime() - new Date(iso).getTime()) / 86400000));
const whenOf = (iso: string) => {
  const n = daysAgo(iso);
  if (n === 0) return 'Today';
  if (n === 1) return 'Yesterday';
  if (n < 7) return `${n} days ago`;
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

type Filter = 'all' | 'spark' | 'client' | 'quiet';
type Row = { b: BrandItem; score: number; word: string; good: boolean; onSpark: number; onClient: number; updated: string };

/** One client's row figures: its health, and what of its requests waits on whom. */
function useRows(): Row[] {
  const { state } = useStore();
  const updatedAt = useUpdatedAt();
  return useMemo(
    () =>
      brandsFor('view').map((b) => {
        const p = clientPage(b.id);
        const reqs = p.latest ?? state.requests;
        return {
          b: b.id === 'b-brandco' ? { ...b, name: state.brand.name } : b,
          score: p.score,
          word: p.verdict.word,
          good: p.verdict.good,
          onSpark: reqs.filter((r) => ON_SPARK.includes(r.status)).length,
          onClient: reqs.filter((r) => ON_CLIENT.includes(r.status)).length,
          updated: updatedAt(b),
        };
      }),
    [state.requests, state.brand.name, updatedAt],
  );
}

const MATCH: Record<Filter, (r: Row) => boolean> = {
  all: () => true,
  spark: (r) => r.onSpark > 0,
  client: (r) => r.onClient > 0,
  quiet: (r) => daysAgo(r.updated) >= QUIET_DAYS,
};

export function ClientsPage() {
  const rows = useRows();
  const art = useArt();
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const list = rows
    .filter(MATCH[filter])
    .filter((r) => !q || `${r.b.name} ${r.b.kind}`.toLowerCase().includes(q.toLowerCase()))
    // what waits on Spark first, then the weakest health
    .sort((a, b) => b.onSpark - a.onSpark || a.score - b.score);
  const waiting = rows.reduce((n, r) => n + r.onSpark, 0);
  const open = (id: string) => {
    brandStore.set(id);
    navigate('/');
  };
  return (
    <div className="rqp cl">
      <div className="rq-head">
        <div>
          <h1 className="rq-head__title">Clients</h1>
          <p className="rq-head__sub">
            {rows.length} clients{waiting ? ` · ${waiting} request${waiting === 1 ? '' : 's'} wait${waiting === 1 ? 's' : ''} on Spark` : ''}
          </p>
        </div>
      </div>

      <div className="rq-centre rq-centre--left">
        <div className="rq-bar">
          <GlassTabs
            label="Clients"
            value={filter}
            onChange={setFilter}
            items={(
              [
                ['all', 'All'],
                ['spark', 'Needs Spark'],
                ['client', 'Waiting on client'],
                ['quiet', 'Quiet'],
              ] as [Filter, string][]
            ).map(([v, label]) => ({ value: v, label, count: rows.filter(MATCH[v]).length, you: v === 'spark' }))}
          />
          <div className="rq-tools">
            <label className="rq-search">
              <Search size={15} />
              <input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search clients" />
            </label>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="rq-list rq-tbl rq-tbl--empty">
            <EmptyState
              art={<PageArtView v={q ? art.search : art.requests} />}
              title={q ? 'No clients match.' : filter === 'spark' ? 'Nothing waits on Spark.' : filter === 'client' ? 'Nothing waits on a client.' : 'Every page is up to date.'}
              body={q ? 'Try another name.' : undefined}
            />
          </div>
        ) : (
          <div className="rq-list rq-tbl" role="list" aria-label="Clients">
            <div className="cl-row cl-cols rq-cols" aria-hidden>
              <span>Client</span>
              <span>Health</span>
              <span>Waiting</span>
              <span className="cl-row__when">Last update</span>
            </div>
            {list.map((r) => (
              <button key={r.b.id} type="button" role="listitem" className="cl-row" onClick={() => open(r.b.id)}>
                <span className="cl-who">
                  <BrandMark b={r.b} size={32} glass />
                  <span className="cl-who__text">
                    <b>{r.b.name}</b>
                    <span>{r.b.kind}</span>
                  </span>
                </span>
                <span className={cx('cl-health', r.good ? 'is-good' : r.score < 50 ? 'is-weak' : 'is-fair')}>
                  <b>{r.score}</b>
                  <span>{r.word}</span>
                </span>
                <span className="cl-wait">
                  {r.onSpark > 0 && (
                    <span className="cl-wait__on is-spark">
                      <i aria-hidden />
                      {r.onSpark} on Spark
                    </span>
                  )}
                  {r.onClient > 0 && (
                    <span className="cl-wait__on">
                      <i aria-hidden />
                      {r.onClient} on client
                    </span>
                  )}
                  {!r.onSpark && !r.onClient && <span className="cl-wait__none">Nothing</span>}
                </span>
                <span className={cx('cl-row__when', daysAgo(r.updated) >= QUIET_DAYS && 'is-quiet')}>{whenOf(r.updated)}</span>
                <ChevronRight className="cl-row__go" size={16} strokeWidth={1.8} aria-hidden />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const WHERE = ['Brand health', 'Website', 'Social', 'PR', 'A report'] as const;

/** Add update (19 Nov): what the Spark team posts on a client's page. What changed, in a sentence or two, and where on
 *  the page it shows; the client sees "Last update today". Prototype: nothing is sent. */
export function AddUpdateDialog({ open, client, onClose }: { open: boolean; client: BrandItem; onClose: () => void }) {
  const [text, setText] = useState('');
  const [where, setWhere] = useState<(typeof WHERE)[number]>('Brand health');
  const [done, setDone] = useState(false);
  const close = () => {
    onClose();
    window.setTimeout(() => {
      setText('');
      setWhere('Brand health');
      setDone(false);
    }, 300);
  };
  if (done)
    return (
      <Dialog
        open={open}
        onClose={close}
        size="md"
        className="dlg-spark"
        title="Update posted."
        description={`${client.name} sees it on their Home, under ${where}.`}
        footer={
          <Button variant="primary" onClick={close}>
            Done
          </Button>
        }
      >
        {null}
      </Dialog>
    );
  return (
    <Dialog
      open={open}
      onClose={close}
      size="md"
      className="dlg-spark"
      title="Add an update."
      description={`What changed on ${client.name}’s page. They’re told when you post it.`}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!text.trim()}
            onClick={() => {
              updatesStore.post(client.id);
              setDone(true);
            }}
          >
            Post update
          </Button>
        </>
      }
    >
      <div className="stack">
        <Field label="Where it shows">
          <span className="cl-where" role="radiogroup" aria-label="Where it shows">
            {WHERE.map((w) => (
              <button key={w} type="button" role="radio" aria-checked={where === w} className={cx('cl-where__opt', where === w && 'is-on')} onClick={() => setWhere(w)}>
                {w}
              </button>
            ))}
          </span>
        </Field>
        <Field label="What changed" htmlFor="cl-text">
          <Textarea id="cl-text" rows={4} placeholder="e.g. The October social report is in: engagement rose to 4%." value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
      </div>
    </Dialog>
  );
}

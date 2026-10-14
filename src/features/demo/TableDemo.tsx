// Prototype-only page (#/demo/table): five looks for the requests table in the
// Brand A direction. Same live data in each; hover the rows.
import { latestProposal, proposalTotal, useStore } from '../../state/store';
import { PageHeader } from '../../components/ui/primitives';
import { RequestStatus } from '../../components/domain';
import { aed, fmtRelative } from '../../lib/format';

const VARIANTS = [
  {
    id: 'one',
    name: '1 · One typeface',
    note: 'Everything in the text face: IDs and amounts in tabular figures, the type as a soft pill, headers in sentence case. Hover: a whisper of Cobalt (4%), not grey.',
  },
  {
    id: 'label',
    name: '2 · Brand labels',
    note: 'Mono only where the brand book uses it, for labels: the column headers and the type, both 11px uppercase with the same tracking. IDs in grey text figures. Hover: warm Sand.',
  },
  {
    id: 'doto',
    name: '3 · Doto numbers',
    note: 'The brand’s Highlight face (Doto) for the request numbers, so they read as an index, like the book’s page numbers. Hover: a Cobalt bar on the left and Cobalt title.',
  },
  {
    id: 'cards',
    name: '4 · Row cards',
    note: 'No table box: each request is its own white card on Sand with a hairline. Hover lifts the card and gives it a Cobalt rim.',
  },
  {
    id: 'index',
    name: '5 · Contents list',
    note: 'After the book’s contents page (p. 2): no box, hairline rules, a larger title and quiet metadata. Hover: the title turns Cobalt and an arrow appears.',
  },
] as const;

export function TableDemo() {
  const { state } = useStore();
  const rows = [...state.requests].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);
  return (
    <div className="cdemo tbdemo">
      <PageHeader title="Requests table" sub="Five looks for the table after the brand book: one type system, a calmer hover. Same live data in each; hover the rows." />
      {VARIANTS.map((v) => (
        <section key={v.id} className="tbdemo__card">
          <header>
            <h3>{v.name}</h3>
            <p>{v.note}</p>
          </header>
          <div className={`tbt tbt--${v.id}`} role="table" aria-label={v.name}>
            <div className="tbt__row tbt__row--head" role="row">
              <span role="columnheader">Request</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Proposal</span>
              <span role="columnheader">Updated</span>
            </div>
            {rows.map((r) => {
              const p = latestProposal(state, r.id);
              return (
                <a key={r.id} className="tbt__row" role="row" href={`#/requests/${r.id}`}>
                  <span className="tbt__main" role="cell">
                    <span className="tbt__id">{r.id.replace('REQ-', v.id === 'doto' ? '' : 'REQ-')}</span>
                    <span className="tbt__title">{r.title}</span>
                    <span className="tbt__type">{r.type}</span>
                    {v.id === 'index' && <span className="tbt__arrow">→</span>}
                  </span>
                  <span role="cell">
                    <RequestStatus status={r.status} />
                  </span>
                  <span role="cell" className="tbt__num">
                    {p ? aed(proposalTotal(p)) : '—'}
                  </span>
                  <span role="cell" className="tbt__muted">
                    {fmtRelative(r.updatedAt)}
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

import { LoadingBlock, EmptyState, ErrorState } from '../ui/States.jsx';
import { cn } from '../../utils/cn.js';

/**
 * One table definition drives two layouts: a real <table> from `md` up, and a
 * stacked label/value list below it. Shrinking a wide table onto a phone is
 * the single worst pattern in most admin panels, so it is not done here.
 *
 * columns: [{ key, header, render?(row), className?, primary?, hideOnMobile? }]
 */
export function DataTable({
  columns,
  rows,
  loading,
  error,
  onRetry,
  rowKey = (row) => row._id,
  empty = { title: 'Nothing here yet', description: null },
  caption,
}) {
  if (loading) return <LoadingBlock />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!rows?.length) return <EmptyState title={empty.title} description={empty.description} action={empty.action} />;

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-x-auto rounded-lg border border-line bg-white md:block">
        <table className="w-full border-collapse text-left">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-line bg-paper">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap px-4 py-3 text-caption font-bold uppercase tracking-wide text-slate-500',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={rowKey(row)} className="align-top transition-colors hover:bg-paper/60">
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3.5 text-small text-slate-700', col.className)}>
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="space-y-3 md:hidden">
        {rows.map((row) => {
          const primary = columns.find((c) => c.primary) || columns[0];
          const rest = columns.filter((c) => c !== primary && !c.hideOnMobile);
          return (
            <li key={rowKey(row)} className="rounded-lg border border-line bg-white p-4">
              <div className="text-small font-bold text-ink">
                {primary.render ? primary.render(row) : row[primary.key]}
              </div>
              <dl className="mt-3 space-y-2">
                {rest.map((col) => (
                  <div key={col.key} className="flex items-start justify-between gap-4">
                    <dt className="shrink-0 text-caption font-semibold uppercase tracking-wide text-slate-500">{col.header}</dt>
                    {/* min-w-0 + flex-1: the value takes the remaining width and
                        wraps/truncates inside it instead of pushing the card
                        wider than the screen. */}
                    <dd className="flex min-w-0 flex-1 flex-wrap justify-end break-words text-right text-small text-slate-700">
                      {col.render ? col.render(row) : row[col.key] ?? '—'}
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
      </ul>
    </>
  );
}

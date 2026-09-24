import * as Icons from 'lucide-react';
import { Check, ChevronRight } from 'lucide-react';
import { RevealGroup, RevealItem } from '../ui/Reveal.jsx';
import { cn } from '../../utils/cn.js';

/**
 * Grouped item lists (programme families, course categories, included
 * services) rendered with the site's existing `tile` card styling — used by
 * Higher Education, Professional Courses, Dubai Launch and Appostle Services
 * so the new content looks like it was always part of those pages.
 *
 * groups: [{ title, description?, icon?, items?: string[] }]
 */
export function ItemGroups({ groups, columns = 'md:grid-cols-2 lg:grid-cols-3', className, onItemClick }) {
  const clickable = typeof onItemClick === 'function';
  return (
    <RevealGroup className={cn('grid gap-4', columns, className)} staggerDelay={0.06}>
      {groups.map((group) => {
        const Icon = (group.icon && Icons[group.icon]) || null;
        // Title-only cards (no list, no description) are set compact so a
        // long run of them — e.g. nine document services — stays scannable
        // on a phone instead of each card filling the screen.
        const compact = !group.items?.length && !group.description;
        // A title-only card is itself the programme ("X / SSLC"), so when the
        // grid is clickable the whole card opens it.
        const cardClickable = clickable && compact;

        const header = (
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="tile-icon grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-azure-50">
                <Icon className="h-5 w-5 text-azure" aria-hidden />
              </span>
            )}
            <h3 className={cn('font-bold text-ink', compact ? 'text-body' : 'text-h3')}>{group.title}</h3>
            {cardClickable && (
              <ChevronRight className="ml-auto h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-azure" aria-hidden />
            )}
          </div>
        );

        return (
          <RevealItem
            as="article"
            key={group.title}
            className={cn(
              'tile flex flex-col transition-transform duration-200 hover:-translate-y-0.5',
              compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6',
              cardClickable && 'p-0 sm:p-0'
            )}
          >
            {cardClickable ? (
              <button
                type="button"
                onClick={() => onItemClick(group.title, group.title)}
                className="group w-full rounded-[inherit] p-4 text-left focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-azure-300 sm:p-5"
                aria-label={`View partner institutes for ${group.title}`}
              >
                {header}
              </button>
            ) : (
              header
            )}
            {group.description && <p className="mt-2 text-small text-slate-600">{group.description}</p>}
            {group.items?.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {group.items.map((item) =>
                clickable ? (
                  <li key={item}>
                    <button
                      type="button"
                      onClick={() => onItemClick(item, group.title)}
                      aria-label={`View partner institutes for ${item}`}
                      className="rounded-full border border-line bg-paper px-3 py-1.5 text-small font-medium text-slate-700 transition-colors duration-150 hover:border-azure-300 hover:bg-azure-50 hover:text-azure-700 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-azure-300 active:scale-[0.98]"
                    >
                      {item}
                    </button>
                  </li>
                ) : (
                  <li
                    key={item}
                    className="rounded-full border border-line bg-paper px-3 py-1.5 text-small font-medium text-slate-700"
                  >
                    {item}
                  </li>
                )
              )}
            </ul>
            )}
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}

/** A simple check-marked list, for "why choose us" style points. */
export function CheckList({ items, className, tone = 'light' }) {
  return (
    <ul className={cn('space-y-3', className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <Check className="mt-1 h-4 w-4 shrink-0 text-success" aria-hidden />
          <span className={cn('text-body', tone === 'dark' ? 'text-slate-200' : 'text-slate-700')}>{item}</span>
        </li>
      ))}
    </ul>
  );
}
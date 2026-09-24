import * as Icons from 'lucide-react';
import { Check } from 'lucide-react';
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
export function ItemGroups({ groups, columns = 'md:grid-cols-2 lg:grid-cols-3', className }) {
  return (
    <RevealGroup className={cn('grid gap-4', columns, className)} staggerDelay={0.06}>
      {groups.map((group) => {
        const Icon = (group.icon && Icons[group.icon]) || null;
        // Title-only cards (no list, no description) are set compact so a
        // long run of them — e.g. nine document services — stays scannable
        // on a phone instead of each card filling the screen.
        const compact = !group.items?.length && !group.description;
        return (
          <RevealItem
            as="article"
            key={group.title}
            className={cn(
              'tile flex flex-col transition-transform duration-200 hover:-translate-y-0.5',
              compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'
            )}
          >
            <div className="flex items-center gap-3">
              {Icon && (
                <span className="tile-icon grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-azure-50">
                  <Icon className="h-5 w-5 text-azure" aria-hidden />
                </span>
              )}
              <h3 className={cn('font-bold text-ink', compact ? 'text-body' : 'text-h3')}>{group.title}</h3>
            </div>
            {group.description && <p className="mt-2 text-small text-slate-600">{group.description}</p>}
            {group.items?.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-line bg-paper px-3 py-1.5 text-small font-medium text-slate-700"
                >
                  {item}
                </li>
              ))}
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

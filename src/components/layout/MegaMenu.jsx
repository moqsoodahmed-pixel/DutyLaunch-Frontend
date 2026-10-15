import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Icons } from '../../utils/iconMap.js';
import { cn } from '../../utils/cn.js';

/* Panel widths. Each stays well under the navbar's own width, and
   max-w keeps a panel inside the viewport on narrow desktops. */
const WIDTHS = {
  sm: 'w-[31rem]',
  md: 'w-[41rem]',
  lg: 'w-[46rem]',
};

/* One focus style for every link in the panel: an inset ring, so it is never
   clipped by the panel's rounded overflow. */
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dl-blue focus-visible:ring-offset-0';

function MenuIcon({ name, className }) {
  const Icon = Icons[name] || Icons.Circle;
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-lg border border-dl-border/70 bg-dl-hover text-dl-blue transition-colors duration-150 group-hover:border-dl-border group-hover:bg-white group-focus-visible:bg-white',
        className
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </span>
  );
}

/** A link with an icon, a label and (optionally) a one-line description. */
function MenuLink({ item, compact, onNavigate }) {
  return (
    <Link
      to={item.path}
      onClick={onNavigate}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-2.5 transition-colors duration-150 hover:bg-dl-hover focus-visible:bg-dl-hover',
        focusRing,
        compact || !item.description ? 'py-2' : 'items-start py-2.5'
      )}
    >
      <MenuIcon name={item.icon} className={compact || !item.description ? 'h-8 w-8' : 'h-9 w-9'} />
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block text-[13.5px] font-semibold leading-snug text-dl-ink transition-colors duration-150 group-hover:text-dl-blue group-focus-visible:text-dl-blue',
            compact && 'truncate'
          )}
        >
          {item.label}
        </span>
        {item.description && !compact && (
          <span className="mt-0.5 block text-[12.5px] leading-snug text-dl-muted">{item.description}</span>
        )}
      </span>
    </Link>
  );
}

function SectionHeading({ children }) {
  return <h3 className="px-2.5 pb-1.5 text-[11.5px] font-bold uppercase tracking-[0.08em] text-dl-navy">{children}</h3>;
}

/**
 * Desktop dropdown panel. Presentational only: the navbar decides when it is
 * open, where it sits (`offset`) and what happens on hover, focus and Escape.
 *
 * Always mounted, hidden with `visibility` rather than unmounted, so the
 * 180 ms fade / 4px slide can run in both directions and `aria-controls` on
 * the trigger always points at a real element. While hidden it is
 * `invisible` + `pointer-events-none`, which also removes its links from the
 * tab order and the accessibility tree.
 *
 * Layout: a transparent `pt-3` strip above the card bridges the gap to the
 * nav item. It belongs to the same hover wrapper, so the pointer never leaves
 * the menu while crossing it.
 */
export function MegaMenu({ id, menu, open, offset = 0, panelRef, onNavigate }) {
  const hasGroups = menu.sections.some((s) => s.groups);
  // Columns: the apostille menu gives its service list a little more room.
  const columns = hasGroups ? 'md:grid-cols-[1.08fr_1fr]' : 'md:grid-cols-2';

  return (
    <div
      id={id}
      ref={panelRef}
      style={{ left: offset }}
      className={cn(
        'absolute top-full z-[80] max-w-[calc(100vw-2rem)] pt-3 transition-[opacity,transform,visibility] duration-[180ms] ease-out',
        open ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-1 opacity-0'
      )}
    >
      <div className={cn('overflow-hidden rounded-2xl border border-dl-border bg-dl-nav shadow-dl-menu', WIDTHS[menu.width] || WIDTHS.md)}>
        <nav aria-label={`${menu.label} menu`} className={cn('grid gap-y-4 p-3', columns)}>
          {menu.sections.map((section, i) => (
            <div key={section.heading} className={cn('min-w-0', i > 0 && 'md:border-l md:border-dl-border md:pl-3')}>
              <SectionHeading>{section.heading}</SectionHeading>

              {section.items && (
                <ul className="grid gap-0.5">
                  {section.items.map((item) => (
                    <li key={item.path}>
                      <MenuLink item={item} compact={section.compact} onNavigate={onNavigate} />
                    </li>
                  ))}
                </ul>
              )}

              {section.groups &&
                section.groups.map((group, gi) => (
                  <div key={group.label} className={cn(gi > 0 && 'mt-3 border-t border-dl-border pt-3')}>
                    <p className="px-2.5 pb-1 text-[12px] font-semibold text-dl-muted">{group.label}</p>
                    <ul className="grid gap-0.5">
                      {group.items.map((item) => (
                        <li key={item.path}>
                          <MenuLink item={item} onNavigate={onNavigate} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          ))}
        </nav>

        {menu.viewAll && (
          <div className="border-t border-dl-border bg-dl-hover/70 px-3 py-1.5">
            <Link
              to={menu.viewAll.path}
              onClick={onNavigate}
              className={cn(
                'group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-dl-navy transition-colors hover:text-dl-blue',
                focusRing
              )}
            >
              {menu.viewAll.label}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
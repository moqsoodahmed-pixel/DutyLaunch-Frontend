import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Icons } from '../../utils/iconMap.js';
import { menuGroups } from '../../data/site.js';

/**
 * Desktop dropdown — a clean floating glass card centred under the navbar.
 *
 * Layout notes:
 *  - The outer wrapper is full-width and flush to the header bottom, with a
 *    transparent `pt-2` "bridge". This keeps the cursor over a header
 *    descendant the whole way from the nav item down onto the card, so the
 *    header's mouseleave does not close the menu across a visible gap.
 *  - The visible card is a centred, rounded, frosted panel; items are a tidy
 *    grid, each highlighting on hover with a soft glass inset.
 */
export function MegaMenu({ menuIds, onNavigate, anchorLeft = 0, onMouseEnter, onMouseLeave }) {
  const groups = menuGroups.filter((p) => menuIds.includes(p.id));
  const single = groups.length === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.16 }}
      style={{ left: anchorLeft }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-full z-50 pt-2"
    >
      <div className="w-[min(36rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border-2 border-azure-200 bg-white shadow-[0_18px_44px_-10px_rgba(5,8,14,0.45)]">
        <div className={`grid gap-6 p-5 sm:p-6 ${single ? '' : 'md:grid-cols-2'}`}>
          {groups.map((group) => {
            const Icon = Icons[group.icon] || Icons.Circle;
            return (
              <div key={group.id}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/60 bg-gradient-to-br from-azure-50 to-glacier-200 text-azure shadow-frost-inset overflow-hidden p-1.5">
                    {group.id === 'career-tools' || group.icon === 'LogoMark' ? (
                      <img src="/favicon-192.png" alt="DutyLaunch" className="h-6 w-6 object-contain" />
                    ) : (
                      <Icon className="h-4.5 w-4.5" aria-hidden />
                    )}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-body font-bold text-ink">{group.label}</h3>
                    <p className="truncate text-caption text-slate-500">{group.summary}</p>
                  </div>
                </div>

                <ul className={`grid gap-1 ${single ? 'sm:grid-cols-2' : ''}`}>
                  {group.items.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={onNavigate}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-glacier-200 hover:shadow-frost-inset"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-small font-semibold text-ink">{item.label}</span>
                          <span className="block truncate text-caption text-slate-500">{item.description}</span>
                        </span>
                        <ArrowUpRight
                          className="h-4 w-4 shrink-0 text-slate-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-frost-600"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
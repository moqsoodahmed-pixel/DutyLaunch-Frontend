import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { menuGroups } from '../../data/site.js';

/**
 * Desktop dropdown. Each panel shows one or two pillars: a short positioning
 * line on the left, and the links that sit under it on the right.
 */
export function MegaMenu({ menuIds, onNavigate }) {
  const groups = menuGroups.filter((p) => menuIds.includes(p.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.16 }}
      className="absolute left-0 right-0 top-full z-50 border-b border-line bg-white shadow-panel"
    >
      <div className="mx-auto grid max-w-shell gap-8 px-gutter py-8 md:grid-cols-2">
        {groups.map((group) => {
          const Icon = Icons[group.icon] || Icons.Circle;
          return (
            <div key={group.id} className="grid gap-5 sm:grid-cols-5">
              <div className="sm:col-span-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded bg-azure-50 text-azure">
                  <Icon className="h-4.5 w-4.5" aria-hidden />
                </span>
                <h3 className="mt-3 text-body font-bold text-ink">{group.label}</h3>
                <p className="mt-1.5 text-small text-slate-600">{group.summary}</p>
              </div>
              <ul className="sm:col-span-3">
                {group.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onNavigate}
                      className="block rounded px-3 py-2.5 transition-colors hover:bg-paper"
                    >
                      <span className="block text-small font-semibold text-ink">{item.label}</span>
                      <span className="block text-caption text-slate-500">{item.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
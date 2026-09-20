import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export function Accordion({ items, defaultOpen = null, className }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn('divide-y divide-line border-y border-line', className)}>
      {items.map((item, index) => {
        const id = item.id || item._id || `item-${index}`;
        const isOpen = open === id;
        return (
          <div key={id}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : id)}
                aria-expanded={isOpen}
                aria-controls={`panel-${id}`}
                className="flex w-full items-start justify-between gap-6 py-5 text-left"
              >
                <span className="text-body font-semibold text-ink">{item.question || item.title}</span>
                <Plus
                  className={cn(
                    'mt-0.5 h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200',
                    isOpen && 'rotate-45 text-azure'
                  )}
                  aria-hidden
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`panel-${id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 0.84, 0.44, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-prose pb-6 pr-10 text-body text-slate-600">{item.answer || item.body}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

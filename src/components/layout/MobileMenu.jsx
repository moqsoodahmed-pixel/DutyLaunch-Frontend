import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { pillars, contact } from '../../data/site.js';
import { Button } from '../ui/Button.jsx';
import { Logo } from './Logo.jsx';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { cn } from '../../utils/cn.js';

export function MobileMenu({ open, onClose }) {
  const [expanded, setExpanded] = useState(null);
  const { isAuthenticated, user } = useAuth();
  useLockBodyScroll(open);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[80] flex flex-col bg-white lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex items-center justify-between border-b border-line px-gutter py-4">
            <Logo />
            <button type="button" onClick={onClose} className="rounded p-2 text-slate-500 hover:bg-paper" aria-label="Close menu">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-gutter py-4">
            <ul className="divide-y divide-line">
              {pillars.map((pillar) => {
                const isOpen = expanded === pillar.id;
                return (
                  <li key={pillar.id}>
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : pillar.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between py-4 text-left"
                    >
                      <span className="text-body font-semibold text-ink">{pillar.label}</span>
                      <ChevronDown className={cn('h-4.5 w-4.5 text-slate-400 transition-transform', isOpen && 'rotate-180')} aria-hidden />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pb-2"
                        >
                          {pillar.items.map((item) => (
                            <li key={item.path}>
                              <Link to={item.path} onClick={onClose} className="block py-2.5 pl-3 text-small text-slate-600">
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
              {[
                { label: 'Pricing', path: '/pricing' },
                { label: 'Blog', path: '/blog' },
                { label: 'About', path: '/about' },
                { label: 'FAQ', path: '/faq' },
                { label: 'Contact', path: '/contact' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} onClick={onClose} className="block py-4 text-body font-semibold text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3 border-t border-line px-gutter py-5">
            <Button to="/contact#consultation" fullWidth onClick={onClose}>
              Book a free consultation
            </Button>
            {isAuthenticated ? (
              <Button to="/dashboard" variant="outline" fullWidth onClick={onClose}>
                {user?.name?.split(' ')[0]}&apos;s dashboard
              </Button>
            ) : (
              <Button to="/login" variant="outline" fullWidth onClick={onClose}>
                Sign in
              </Button>
            )}
            <p className="pt-1 text-center text-caption text-slate-500">{contact.email}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

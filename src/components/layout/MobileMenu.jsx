import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Phone, X } from 'lucide-react';
import { primaryNav, navMenus, contact, primaryCta } from '../../data/site.js';
import { Button } from '../ui/Button.jsx';
import { Logo } from './Logo.jsx';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { cn } from '../../utils/cn.js';
import { Badge } from '../ui/Badge.jsx';
import { Icons } from '../../utils/iconMap.js';
import { initials } from '../../utils/format.js';
import { roleLabel, roleTone } from '../../utils/roles.js';
import { homePathFor } from '../../utils/homePath.js';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dl-blue focus-visible:ring-offset-0';

/** One link inside an expanded group. 44px minimum height, icon + label. */
function SubLink({ item, onClose }) {
  const Icon = Icons[item.icon] || Icons.Circle;
  return (
    <Link
      to={item.path}
      onClick={onClose}
      className={cn('flex min-h-[2.75rem] items-center gap-3 rounded-xl px-2 py-2 hover:bg-dl-hover active:bg-dl-hover', focusRing)}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-dl-border/70 bg-dl-hover text-dl-blue">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold leading-snug text-dl-ink">{item.label}</span>
        {item.description && <span className="block text-[12.5px] leading-snug text-dl-muted">{item.description}</span>}
      </span>
    </Link>
  );
}

function Group({ menu, onClose }) {
  return (
    <div className="space-y-4 pb-3 pl-1 pt-1">
      {menu.sections.map((section) => (
        <div key={section.heading}>
          <h3 className="px-2 pb-1 text-[11.5px] font-bold uppercase tracking-[0.08em] text-dl-navy">{section.heading}</h3>
          {section.items && (
            <ul>
              {section.items.map((item) => (
                <li key={item.path}>
                  <SubLink item={{ ...item, description: section.compact ? undefined : item.description }} onClose={onClose} />
                </li>
              ))}
            </ul>
          )}
          {section.groups?.map((g) => (
            <div key={g.label} className="mt-2">
              <p className="px-2 pb-0.5 text-[12px] font-semibold text-dl-muted">{g.label}</p>
              <ul>
                {g.items.map((item) => (
                  <li key={item.path}>
                    <SubLink item={item} onClose={onClose} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
      {menu.viewAll && (
        <Link
          to={menu.viewAll.path}
          onClick={onClose}
          className={cn('mx-1 flex min-h-[2.75rem] items-center gap-1.5 rounded-xl px-2 text-[14px] font-semibold text-dl-blue hover:bg-dl-hover', focusRing)}
        >
          {menu.viewAll.label}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}

export function MobileMenu({ open, onClose }) {
  const [expanded, setExpanded] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const closeBtn = useRef(null);
  useLockBodyScroll(open);

  // Move focus into the drawer when it opens, and let Escape close it.
  useEffect(() => {
    if (!open) return undefined;
    closeBtn.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /* Rendered without an outer AnimatePresence on purpose — with an exit
     animation, tapping a link started the fade-out, the navigation then
     interrupted it (lazy pages suspend while their code loads), and the
     menu stayed on screen even though `open` was false. The menu still
     animates in; it simply closes instantly. */
  if (!open) return null;

  return (
    /* Full-screen on phones; from 640px a right-hand drawer over a dimmed
       backdrop (tap the backdrop to close). Hidden at xl, where the full
       desktop bar is shown. */
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[80] sm:bg-dl-ink/30 xl:hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 24 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 0.84, 0.44, 1] }}
        className="ml-auto flex h-full w-full flex-col bg-white sm:max-w-sm sm:border-l sm:border-dl-border sm:shadow-dl-menu"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="flex items-center justify-between border-b border-dl-border px-gutter py-3">
          <Logo />
          <button
            ref={closeBtn}
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full border border-dl-border text-dl-navy hover:bg-dl-hover hover:text-dl-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dl-blue"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-gutter py-2" aria-label="Main">
          {/* Same order as the desktop bar — both read primaryNav. */}
          <ul className="divide-y divide-dl-border">
            {primaryNav.map((navItem) => {
              if (!navItem.menu) {
                return (
                  <li key={navItem.path}>
                    <Link
                      to={navItem.path}
                      onClick={onClose}
                      className={cn('flex min-h-[3.25rem] items-center text-[16px] font-semibold text-dl-navy', focusRing)}
                    >
                      {navItem.label}
                    </Link>
                  </li>
                );
              }
              const menu = navMenus[navItem.menu];
              const isOpen = expanded === navItem.menu;
              const panelId = `mobile-panel-${navItem.menu}`;
              return (
                <li key={navItem.label}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : navItem.menu)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className={cn('flex min-h-[3.25rem] w-full items-center justify-between text-left', focusRing)}
                  >
                    <span className={cn('text-[16px] font-semibold', isOpen ? 'text-dl-blue' : 'text-dl-navy')}>{navItem.label}</span>
                    <ChevronDown
                      className={cn('h-5 w-5 text-dl-navy/70 transition-transform duration-200', isOpen && 'rotate-180 text-dl-blue')}
                      aria-hidden
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <Group menu={menu} onClose={onClose} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Pinned actions: the resume CTA is always one tap away. */}
        <div className="space-y-2.5 border-t border-dl-border bg-white px-gutter py-4">
          <Button to={primaryCta.to} variant="solid" fullWidth onClick={onClose}>
            {primaryCta.label}
          </Button>
          <Button to="/contact#consultation" variant="solidOutline" fullWidth onClick={onClose}>
            Book a free consultation
          </Button>
          <a
            href={contact.phoneHref}
            className={cn('flex min-h-12 items-center justify-center gap-2 rounded-[10px] text-[14.5px] font-semibold text-dl-navy hover:bg-dl-hover hover:text-dl-blue', focusRing)}
          >
            <Phone className="h-4 w-4" aria-hidden />
            {contact.phone}
          </a>
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-dl-border bg-dl-hover px-3 py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-dl-blue text-small font-bold text-white">
                  {initials(user?.name) || '?'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-small font-bold text-dl-ink">{user?.name}</p>
                  <p className="truncate text-caption text-dl-muted">{user?.email}</p>
                </div>
                <Badge tone={roleTone(user?.role)} className="shrink-0 !py-0.5">
                  {roleLabel(user?.role)}
                </Badge>
              </div>
              <Button to={homePathFor(user?.role)} variant="solidOutline" fullWidth onClick={onClose}>
                Go to my dashboard
              </Button>
            </>
          ) : (
            <Button to="/login" variant="solidOutline" fullWidth onClick={onClose}>
              Sign in
            </Button>
          )}
          <p className="pt-0.5 text-center text-caption text-dl-muted">{contact.email}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Phone, Search, UserRound } from 'lucide-react';
import { primaryNav, primaryCta, contact } from '../../data/site.js';
import { Button } from '../ui/Button.jsx';
import { Logo } from './Logo.jsx';
import { MegaMenu } from './MegaMenu.jsx';
import { MobileMenu } from './MobileMenu.jsx';
import { SearchModal } from './SearchModal.jsx';
import { ContactMenu } from './ContactMenu.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { cn } from '../../utils/cn.js';
import { homePathFor } from '../../utils/homePath.js';

/* Shared style for the round glass icon buttons on the right of the pill —
   the reference site's search / call / account cluster. */
const iconBtn =
  'grid h-9 w-9 shrink-0 place-items-center rounded-full border border-glacier-300 bg-white/70 text-slate-600 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-frost-400 hover:text-azure hover:shadow-crystal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-frost-400';

export function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navRef = useRef(null);
  const contactRef = useRef(null);
  const searchRef = useRef(null);
  // True when the open dropdown was opened by mouse hover (not a click/tap).
  const hoverOpened = useRef(false);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
    setSearchOpen(false);
    setContactOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ⌘K / Ctrl+K opens site search from anywhere.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setContactOpen(false);
        setSearchOpen(false);
      }
    };
    const onClickAway = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null);
      if (contactRef.current && !contactRef.current.contains(e.target)) setContactOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickAway);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickAway);
    };
  }, []);

  useEffect(() => {
    if (!openMenu) return undefined;
    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      if (navRef.current && !navRef.current.contains(e.target)) {
        hoverOpened.current = false;
        setOpenMenu(null);
      }
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => document.removeEventListener('pointermove', onMove);
  }, [openMenu]);

  // Position the mega-menu's left edge under the hovered nav item, clamped
  // so a wide panel never runs off the right of the viewport.
  const computeAnchor = (el) => {
    const rect = el.getBoundingClientRect();
    const cardW = Math.min(576, window.innerWidth - 32);
    setMenuAnchor(Math.max(16, Math.min(rect.left, window.innerWidth - cardW - 16)));
  };

  const dashboardPath = homePathFor(user?.role);
  const accountTo = isAuthenticated ? dashboardPath : '/login';
  const accountLabel = isAuthenticated ? (user?.name?.split(' ')[0] || 'Account') : 'Sign in';

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded focus:bg-ink-800 focus:px-4 focus:py-2 focus:text-small focus:text-white"
      >
        Skip to content
      </a>

      <header
        ref={navRef}
        onMouseLeave={() => setOpenMenu(null)}
        className={cn('sticky top-0 z-[70] transition-all duration-300', scrolled ? 'py-2' : 'py-3')}
      >
        {/* Floating pill — always rounded-full with a glass fill and margins,
            so it reads as the reference's floating navbar at every scroll
            position; on scroll it tightens and turns more opaque. */}
        <div
          className={cn(
            'mx-auto flex h-14 max-w-[80rem] items-center gap-3 rounded-full px-3 pl-4 transition-all duration-300 lg:h-[3.75rem] lg:pl-5 xl:gap-5',
            scrolled
              ? 'max-w-[74rem] border border-white/70 bg-white/80 shadow-crystal backdrop-blur-xl'
              : 'border border-white/60 bg-white/65 shadow-lift backdrop-blur-md'
          )}
        >
          <Logo />

          <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex" aria-label="Main">
            {primaryNav.map((item) =>
              item.menu ? (
                <button
                  key={item.label}
                  type="button"
                  onClick={(e) => {
                    if (hoverOpened.current && openMenu === item.label) {
                      hoverOpened.current = false;
                      return;
                    }
                    if (openMenu === item.label) {
                      setOpenMenu(null);
                    } else {
                      computeAnchor(e.currentTarget);
                      setOpenMenu(item.label);
                    }
                  }}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'mouse') return;
                    hoverOpened.current = true;
                    computeAnchor(e.currentTarget);
                    setOpenMenu(item.label);
                  }}
                  aria-expanded={openMenu === item.label}
                  aria-haspopup="true"
                  className={cn(
                    'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-small font-medium transition-colors xl:px-3.5',
                    openMenu === item.label
                      ? 'bg-glacier-200 text-ink shadow-frost-inset'
                      : 'text-slate-700 hover:bg-glacier-200 hover:text-ink hover:shadow-frost-inset'
                  )}
                >
                  {item.label}
                  <ChevronDown className={cn('h-4 w-4 transition-transform', openMenu === item.label && 'rotate-180')} aria-hidden />
                </button>
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onMouseEnter={() => setOpenMenu(null)}
                  className={({ isActive }) =>
                    cn(
                      'whitespace-nowrap rounded-full px-2.5 py-2 text-small font-medium transition-colors xl:px-3.5',
                      isActive ? 'text-ink font-semibold' : 'text-slate-700 hover:bg-glacier-200 hover:text-ink hover:shadow-frost-inset'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
          </nav>

          {/* Right cluster: round glass icon buttons (search / call / account),
              then the primary CTA, then the mobile menu toggle. */}
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <div ref={searchRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setSearchOpen((o) => !o)}
                aria-label="Search the site"
                aria-expanded={searchOpen}
                aria-haspopup="true"
                title="Search (⌘K)"
                className={cn(iconBtn, searchOpen && 'border-frost-400 text-azure shadow-crystal')}
              >
                <Search className="h-4.5 w-4.5" aria-hidden />
              </button>
              {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
            </div>
            <div ref={contactRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setContactOpen((o) => !o)}
                aria-label="Contact us"
                aria-expanded={contactOpen}
                aria-haspopup="true"
                title="Contact us"
                className={cn(iconBtn, contactOpen && 'border-frost-400 text-azure shadow-crystal')}
              >
                <Phone className="h-4.5 w-4.5" aria-hidden />
              </button>
              {contactOpen && <ContactMenu onClose={() => setContactOpen(false)} />}
            </div>
            <Link
              to={accountTo}
              aria-label={accountLabel}
              title={accountLabel}
              className={cn(iconBtn, 'relative')}
            >
              <UserRound className="h-4.5 w-4.5" aria-hidden />
              {isAuthenticated && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-success" aria-hidden />
              )}
            </Link>

            <Button to={primaryCta.to} size="sm" variant="premium" className="hidden !rounded-full sm:inline-flex lg:hidden xl:inline-flex">
              {primaryCta.label}
            </Button>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-full border border-glacier-300 bg-white/70 text-ink backdrop-blur transition hover:border-frost-400 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        {openMenu && (
          <MegaMenu
            key={openMenu}
            anchorLeft={menuAnchor}
            menuIds={primaryNav.find((i) => i.label === openMenu)?.menu || []}
            onNavigate={() => {
              hoverOpened.current = false;
              setOpenMenu(null);
            }}
          />
        )}
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, UserRound } from 'lucide-react';
import { primaryNav } from '../../data/site.js';
import { Button } from '../ui/Button.jsx';
import { Logo } from './Logo.jsx';
import { MegaMenu } from './MegaMenu.jsx';
import { MobileMenu } from './MobileMenu.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { cn } from '../../utils/cn.js';

export function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, isAdmin, user } = useAuth();
  const location = useLocation();
  const navRef = useRef(null);
  // True when the open dropdown was opened by mouse hover (not a click/tap).
  const hoverOpened = useRef(false);

  // Depending on `pathname` alone missed navigations that only change the
  // query string or hash (e.g. /documentation?category=Apostille or
  // /career-services#counselling) — the dropdown stayed visually open
  // because pathname hadn't changed even though a real navigation had
  // happened. Watching the full location tuple closes it for any
  // navigation, not just a pathname change, with no per-route special-casing.
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpenMenu(null);
    const onClickAway = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickAway);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickAway);
    };
  }, []);

  // Safety net for hover-opened menus: while a dropdown is open, close it as
  // soon as the mouse is over anything outside the header (which contains
  // both the bar and the dropdown panel). This does not depend on a
  // mouseleave event firing — fast moves, trackpads and moving the cursor
  // straight off the panel onto the page all close it.
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

  const dashboardPath = isAdmin ? '/admin' : '/dashboard';

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded focus:bg-ink-800 focus:px-4 focus:py-2 focus:text-small focus:text-white"
      >
        Skip to content
      </a>

      {/* Close the dropdown when the cursor leaves the whole header — the bar
          and the panel together. Listening only on the panel missed every
          exit that never passed through it (moving up, sideways or straight
          back onto the page from the menu button). */}
      <header
        ref={navRef}
        onMouseLeave={() => setOpenMenu(null)}
        className={cn(
          'sticky top-0 z-[70] transition-all duration-300',
          scrolled ? 'py-2' : 'py-3'
        )}
      >
        <div
          className={cn(
            'mx-auto flex h-14 max-w-shell items-center gap-4 rounded-2xl px-gutter transition-all duration-300 lg:h-[4rem] xl:gap-6',
            scrolled
              ? 'max-w-[76rem] border border-line/80 bg-white/85 shadow-lift backdrop-blur-lg'
              : 'border border-transparent bg-white/70 backdrop-blur-md'
          )}
        >
          <Logo />

          <nav className="hidden flex-1 items-center gap-0.5 lg:flex" aria-label="Main">
            {primaryNav.map((item) =>
              item.menu ? (
                <button
                  key={item.label}
                  type="button"
                  // Mouse: hovering opens it, and a click after hovering keeps it
                  // open (previously the click toggled it straight back shut).
                  // Touch / keyboard: there is no hover, so a tap toggles it.
                  onClick={() => {
                    if (hoverOpened.current && openMenu === item.label) {
                      hoverOpened.current = false;
                      return;
                    }
                    setOpenMenu(openMenu === item.label ? null : item.label);
                  }}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'mouse') return;
                    hoverOpened.current = true;
                    setOpenMenu(item.label);
                  }}
                  aria-expanded={openMenu === item.label}
                  aria-haspopup="true"
                  className={cn(
                    'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-small font-medium transition-colors xl:px-3.5',
                    openMenu === item.label
                      ? 'bg-azure-50 text-azure-600 shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-ink'
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
                      isActive ? 'bg-azure-50 text-azure-600 shadow-xs' : 'text-slate-700 hover:bg-slate-100 hover:text-ink'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            {isAuthenticated ? (
              <Link
                to={dashboardPath}
                className="hidden items-center gap-2 whitespace-nowrap rounded px-3 py-2 text-small font-medium text-slate-700 hover:text-ink lg:inline-flex"
              >
                <UserRound className="h-4 w-4" aria-hidden />
                <span className="max-w-[8rem] truncate">{user?.name?.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link to="/login" className="hidden whitespace-nowrap rounded px-3 py-2 text-small font-medium text-slate-700 hover:text-ink lg:inline-block">
                Sign in
              </Link>
            )}
            {/* Hidden only between 1024 and 1279px, where the six desktop
                links plus Sign in fill the bar; every page hero carries its
                own consultation CTA. Visible on tablets (next to the menu
                button) and on wide desktops. */}
            <Button to="/contact#consultation" size="sm" className="hidden sm:inline-flex lg:hidden xl:inline-flex">
              Book a free consultation
            </Button>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded p-2 text-ink hover:bg-paper lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5.5 w-5.5" aria-hidden />
            </button>
          </div>
        </div>

        {/* Rendered without AnimatePresence on purpose. With an exit
            animation, a navigation that happened while the panel was open
            (clicking one of its links) could interrupt the fade-out, and the
            panel then stayed on screen at full opacity even though the menu
            state was closed — the "dropdown won't close" bug. It still fades
            in on open; on close it is removed immediately, so it cannot get
            stuck. */}
        {openMenu && (
          <MegaMenu
            key={openMenu}
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
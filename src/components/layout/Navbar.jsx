import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Phone, Search, UserRound } from 'lucide-react';
import { primaryNav, primaryCta } from '../../data/site.js';
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
   with smooth lift, scale 1.04, neon glow, and 250ms transitions matching Analyze button colors. */
const iconBtn =
  'group/icon dl-glass-btn grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-cyan-400/50 bg-white/95 text-slate-700 shadow-[0_0_12px_rgba(56,189,248,0.35)] backdrop-blur-md transition-all duration-[250ms] ease-out hover:-translate-y-0.5 hover:scale-[1.06] hover:border-cyan-400 hover:text-azure hover:bg-gradient-to-r hover:from-frost-50 hover:via-azure-50/60 hover:to-aurora-50 hover:shadow-[0_0_22px_rgba(56,189,248,0.7),0_0_35px_rgba(169,140,234,0.5)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-frost-400 [&>svg]:transition-colors [&>svg]:duration-[250ms] group-hover/icon:[&>svg]:text-azure';

export function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navRef = useRef(null);
  const contactRef = useRef(null);
  const searchRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  const isBuilderPage =
    location.pathname.startsWith('/ai-resume-builder') ||
    location.pathname.startsWith('/cv-builder') ||
    location.pathname.startsWith('/resume-checker');

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
    setSearchOpen(false);
    setContactOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Inside Resume Builder pages, keep dark glacier theme throughout the page for seamless contrast.
  const isDarkNavbar = isBuilderPage;

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
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
      if (contactRef.current && !contactRef.current.contains(e.target)) {
        setContactOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickAway);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickAway);
    };
  }, []);

  // Position the mega-menu's left edge under the hovered nav item, clamped
  // so a wide panel never runs off the right of the viewport.
  const computeAnchor = (el) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cardW = Math.min(576, window.innerWidth - 32);
    setMenuAnchor(Math.max(16, Math.min(rect.left, window.innerWidth - cardW - 16)));
  };

  const handleMenuEnter = (label, element) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    computeAnchor(element);
    setOpenMenu(label);
  };

  const handleMenuLeave = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 150);
  };

  const handleDropdownEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleDropdownLeave = () => {
    handleMenuLeave();
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
        onMouseLeave={handleMenuLeave}
        className={cn('sticky top-0 z-[70] transition-all duration-300 px-3 sm:px-4 lg:px-6', scrolled ? 'py-2' : 'py-3')}
      >
        {/* Outer pill wrapper — overflow visible so dropdowns like ContactMenu are not clipped */}
        <div
          className={cn(
            'relative mx-auto transition-all duration-500',
            scrolled ? 'max-w-[74rem]' : 'max-w-[80rem]'
          )}
        >
          {/* Edge Lighting Glow Aura — continuous edge lighting visible on every section */}
          <div
            className="pointer-events-none absolute -inset-1 rounded-full opacity-70 blur-md transition-all duration-300"
            style={{
              background: isDarkNavbar
                ? 'linear-gradient(90deg, rgba(56,189,248,0.5), rgba(129,140,248,0.45), rgba(56,189,248,0.5))'
                : 'linear-gradient(90deg, rgba(79,193,230,0.45), rgba(96,165,250,0.45), rgba(169,140,234,0.4), rgba(79,193,230,0.45))',
            }}
            aria-hidden="true"
          />

          {/* Continuous rotating edge-light perimeter border */}
          <div className="pointer-events-none absolute -inset-[1.5px] rounded-full p-[1.5px] overflow-hidden" aria-hidden="true">
            <div
              className="absolute -inset-[200%] opacity-90 animate-edge-orbit"
              style={{
                background: isDarkNavbar
                  ? 'conic-gradient(from 0deg, transparent 0deg, transparent 200deg, rgba(56,189,248,0.8) 260deg, rgba(169,140,234,0.95) 310deg, #ffffff 350deg, transparent 360deg)'
                  : 'conic-gradient(from 0deg, transparent 0deg, transparent 200deg, rgba(56,189,248,0.75) 260deg, rgba(43,114,212,0.9) 310deg, #ffffff 350deg, transparent 360deg)',
              }}
            />
          </div>

          {/* Floating pill body */}
          <div
            className={cn(
              'relative flex h-14 w-full items-center gap-2 sm:gap-3 rounded-full px-2.5 sm:px-3 pl-3.5 sm:pl-4 transition-all duration-300 lg:h-[3.75rem] lg:pl-5 xl:gap-5',
              isDarkNavbar
                ? scrolled
                  ? 'border border-cyan-400/60 bg-[#060D1A]/95 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_28px_rgba(56,189,248,0.4)] backdrop-blur-2xl'
                  : 'border border-cyan-400/50 bg-[#060D1A]/90 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7),0_0_24px_rgba(56,189,248,0.35)] backdrop-blur-2xl'
                : scrolled
                  ? 'border border-cyan-400/50 bg-white/98 shadow-[0_18px_45px_-12px_rgba(79,193,230,0.4),0_0_22px_rgba(56,189,248,0.35)] backdrop-blur-2xl'
                  : 'border border-cyan-300/60 bg-white/90 shadow-[0_12px_36px_-10px_rgba(79,193,230,0.35),0_0_20px_rgba(56,189,248,0.3)] backdrop-blur-xl'
            )}
          >
            <Logo tone={isDarkNavbar ? 'light' : 'dark'} />

            <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Main">
              {primaryNav.map((item) =>
                item.menu ? (
                  <button
                    key={item.label}
                    type="button"
                    onClick={(e) => {
                      if (openMenu === item.label) {
                        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
                        setOpenMenu(null);
                      } else {
                        handleMenuEnter(item.label, e.currentTarget);
                      }
                    }}
                    onMouseEnter={(e) => handleMenuEnter(item.label, e.currentTarget)}
                    onMouseLeave={handleMenuLeave}
                    aria-expanded={openMenu === item.label}
                    aria-haspopup="true"
                    className={cn(
                      'group/nav relative overflow-hidden inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-small font-semibold cursor-pointer border border-transparent transition-all duration-[250ms] ease-out hover:-translate-y-0.5 hover:scale-[1.04] active:scale-95 xl:px-3.5',
                      openMenu === item.label
                        ? isDarkNavbar
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(56,189,248,0.35)]'
                          : 'bg-gradient-to-r from-frost-50 via-azure-50/50 to-aurora-50 text-azure-800 shadow-[0_8px_20px_-4px_rgba(79,193,230,0.35)] border-frost-300'
                        : isDarkNavbar
                          ? 'text-slate-100 hover:text-cyan-300 hover:border-cyan-500/30 hover:bg-cyan-950/40'
                          : 'text-slate-800 hover:bg-gradient-to-r hover:from-frost-50 hover:via-azure-50/50 hover:to-aurora-50 hover:text-azure-700 hover:border-frost-300/80 hover:shadow-[0_8px_20px_-4px_rgba(79,193,230,0.35)]'
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform duration-[250ms]',
                        isDarkNavbar
                          ? 'text-slate-300 group-hover/nav:text-cyan-300'
                          : 'text-slate-600 group-hover/nav:text-azure',
                        openMenu === item.label && 'rotate-180'
                      )}
                      aria-hidden
                    />
                  </button>
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onMouseEnter={() => {
                      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
                      setOpenMenu(null);
                    }}
                    className={({ isActive }) =>
                      cn(
                        'relative overflow-hidden inline-flex items-center whitespace-nowrap rounded-full px-3 py-2 text-small font-semibold cursor-pointer border border-transparent transition-all duration-[250ms] ease-out hover:-translate-y-0.5 hover:scale-[1.04] active:scale-95 xl:px-3.5',
                        isActive
                          ? isDarkNavbar
                            ? 'bg-cyan-950/80 text-cyan-300 font-bold border-cyan-400/50 shadow-[0_0_15px_rgba(56,189,248,0.35)]'
                            : 'bg-gradient-to-r from-frost-50 via-azure-50/50 to-aurora-50 text-azure-800 font-bold shadow-[0_8px_20px_-4px_rgba(79,193,230,0.35)] border-frost-300'
                          : isDarkNavbar
                            ? 'text-slate-100 hover:text-cyan-300 hover:border-cyan-500/30 hover:bg-cyan-950/40'
                            : 'text-slate-800 hover:bg-gradient-to-r hover:from-frost-50 hover:via-azure-50/50 hover:to-aurora-50 hover:text-azure-700 hover:border-frost-300/80 hover:shadow-[0_8px_20px_-4px_rgba(79,193,230,0.35)]'
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                )
              )}
            </nav>

            {/* Right cluster: Search, Call, User, then CTA button. Fully accessible on mobile & tablet */}
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2 lg:ml-0">
              <div ref={searchRef} className="relative">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search the site"
                  aria-expanded={searchOpen}
                  aria-haspopup="dialog"
                  className={cn(
                    iconBtn,
                    isDarkNavbar && 'border-cyan-400/60 bg-slate-900/90 text-cyan-200 shadow-[0_0_15px_rgba(56,189,248,0.35)] hover:text-white hover:border-cyan-300 hover:bg-cyan-950/80 hover:shadow-[0_0_24px_rgba(56,189,248,0.8),0_0_35px_rgba(169,140,234,0.5)]',
                    searchOpen && 'border-frost-400 text-azure shadow-crystal'
                  )}
                >
                  <Search className="h-4.5 w-4.5" aria-hidden />
                </button>
              </div>

              <div ref={contactRef} className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setContactOpen((o) => !o)}
                  aria-label="Contact us"
                  aria-expanded={contactOpen}
                  aria-haspopup="true"
                  className={cn(
                    iconBtn,
                    isDarkNavbar && 'border-cyan-400/60 bg-slate-900/90 text-cyan-200 shadow-[0_0_15px_rgba(56,189,248,0.35)] hover:text-white hover:border-cyan-300 hover:bg-cyan-950/80 hover:shadow-[0_0_24px_rgba(56,189,248,0.8),0_0_35px_rgba(169,140,234,0.5)]',
                    contactOpen && 'border-frost-400 text-azure shadow-crystal'
                  )}
                >
                  <Phone className="h-4.5 w-4.5" aria-hidden />
                </button>
                {contactOpen && <ContactMenu onClose={() => setContactOpen(false)} />}
              </div>

              <Link
                to={accountTo}
                aria-label={accountLabel}
                className={cn(
                  iconBtn,
                  isDarkNavbar && 'border-cyan-400/60 bg-slate-900/90 text-cyan-200 shadow-[0_0_15px_rgba(56,189,248,0.35)] hover:text-white hover:border-cyan-300 hover:bg-cyan-950/80 hover:shadow-[0_0_24px_rgba(56,189,248,0.8),0_0_35px_rgba(169,140,234,0.5)]',
                  'relative hidden xs:grid'
                )}
              >
                <UserRound className="h-4.5 w-4.5" aria-hidden />
                {isAuthenticated && (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-success" aria-hidden />
                )}
              </Link>

              {/* Official Color Reference: Analyze My Resume Free Button */}
              <Button
                to={primaryCta.to}
                size="sm"
                variant="premium"
                className="hidden !rounded-full sm:inline-flex lg:hidden xl:inline-flex transition-all duration-[250ms] hover:scale-[1.04] hover:-translate-y-0.5 shadow-[0_0_20px_rgba(56,189,248,0.5),0_4px_16px_rgba(169,140,234,0.4)] hover:shadow-[0_0_30px_rgba(56,189,248,0.8),0_0_45px_rgba(169,140,234,0.6)]"
              >
                {primaryCta.label}
              </Button>

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className={cn(
                  iconBtn,
                  isDarkNavbar && 'border-cyan-400/60 bg-slate-900/90 text-cyan-200 shadow-[0_0_15px_rgba(56,189,248,0.35)] hover:text-white hover:border-cyan-300 hover:bg-cyan-950/80 hover:shadow-[0_0_24px_rgba(56,189,248,0.8),0_0_35px_rgba(169,140,234,0.5)]',
                  'lg:hidden'
                )}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Dropdown MegaMenu with smooth bridging and clean auto-closing */}
        {openMenu && (
          <MegaMenu
            key={openMenu}
            anchorLeft={menuAnchor}
            menuIds={primaryNav.find((i) => i.label === openMenu)?.menu || []}
            onNavigate={() => {
              if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
              setOpenMenu(null);
            }}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          />
        )}
      </header>

      {/* Centered Command Palette Search Modal — opens outside navbar so it never clips or distorts */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
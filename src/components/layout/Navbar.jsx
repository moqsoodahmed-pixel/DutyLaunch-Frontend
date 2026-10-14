import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Phone, Search } from 'lucide-react';
import { primaryNav, primaryCta } from '../../data/site.js';
import { Button } from '../ui/Button.jsx';
import { Logo } from './Logo.jsx';
import { MegaMenu } from './MegaMenu.jsx';
import { MobileMenu } from './MobileMenu.jsx';
import { SearchModal } from './SearchModal.jsx';
import { ContactMenu } from './ContactMenu.jsx';
import { ProfileMenu } from './ProfileMenu.jsx';
import { cn } from '../../utils/cn.js';

/* Shared style for the square icon buttons on the right of the bar. Quiet by
   default (white, 1px pale-blue border); hover only shifts colour. 44px touch
   target on phones/tablets, 40px on desktop. */
const iconBtn =
  'grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl border border-glacier-400 bg-white text-ink transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out hover:border-azure-200 hover:bg-glacier-200 hover:text-azure motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.04] hover:shadow-card-hover motion-safe:active:translate-y-0 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:h-10 lg:w-10';

/* Desktop nav item: navy text, brand blue on hover/active. No scale or glow. */
const navItem =
  'relative inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-small font-semibold text-ink transition-[transform,box-shadow,background-color,color] duration-200 ease-out hover:bg-glacier-200 hover:text-azure motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.04] hover:shadow-card-hover motion-safe:active:translate-y-0 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400 xl:px-3.5';

export function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);
  const containerRef = useRef(null);
  const contactRef = useRef(null);
  const searchRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const menuButtonRef = useRef(null);
  const triggerRef = useRef(null);
  const [focusMenu, setFocusMenu] = useState(false);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
    setSearchOpen(false);
    setContactOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
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
        setOpenMenu((current) => {
          // Return focus to the nav button that opened the menu.
          if (current) triggerRef.current?.focus();
          return null;
        });
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
    const box = containerRef.current?.getBoundingClientRect();
    if (!box) return;
    // The panel lives inside the bar's container, so measure relative to it and
    // clamp so a wide panel never runs past the container's right edge.
    const cardW = Math.min(576, box.width);
    setMenuAnchor(Math.max(0, Math.min(rect.left - box.left, box.width - cardW)));
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

  const closeMobile = () => {
    setMobileOpen(false);
    // Hand focus back to the hamburger so keyboard users keep their place.
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

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
        className="sticky top-0 z-[70] py-2.5"
      >
        {/* Same container as every page section (<Container>: max-w-shell + gutter), so
            the bar's edges line up with the content below it. */}
        <div className="mx-auto w-full max-w-shell px-gutter">
        <div ref={containerRef} className="relative">
          <div
            className={cn(
              'relative flex h-16 w-full items-center gap-2 rounded-2xl border border-glacier-400 bg-white pl-4 pr-2.5 transition-shadow duration-200 sm:gap-3 sm:pr-3 lg:h-[4.25rem] lg:pl-5 xl:gap-5',
              scrolled ? 'shadow-lift' : 'shadow-card'
            )}
          >
            <Logo tone="dark" />

            <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Main">
              {primaryNav.map((item) =>
                item.menu ? (
                  <button
                    key={item.label}
                    type="button"
                    onClick={(e) => {
                      // A second activation closes the menu. detail === 0 means the
                      // click came from the keyboard (Enter / Space), so focus moves
                      // into the opened menu instead of leaving the user at the end of the bar.
                      if (openMenu === item.label) {
                        setOpenMenu(null);
                        return;
                      }
                      triggerRef.current = e.currentTarget;
                      setFocusMenu(e.detail === 0);
                      handleMenuEnter(item.label, e.currentTarget);
                    }}
                    onMouseEnter={(e) => {
                      triggerRef.current = e.currentTarget;
                      setFocusMenu(false);
                      handleMenuEnter(item.label, e.currentTarget);
                    }}
                    onMouseLeave={handleMenuLeave}
                    aria-expanded={openMenu === item.label}
                    aria-haspopup="true"
                    aria-controls={openMenu === item.label ? 'dl-mega-menu' : undefined}
                    className={cn(navItem, openMenu === item.label && 'bg-glacier-200 text-azure')}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn('h-4 w-4 transition-transform duration-200', openMenu === item.label && 'rotate-180')}
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
                    className={({ isActive }) => cn(navItem, isActive && 'bg-azure-50 text-azure')}
                  >
                    {item.label}
                  </NavLink>
                )
              )}
            </nav>

            {/* Right cluster: Search, Call, Account, CTA, and the menu button below lg. */}
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2 lg:ml-0">
              <div ref={searchRef} className="relative">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search the site"
                  aria-expanded={searchOpen}
                  aria-haspopup="dialog"
                  className={cn(iconBtn, searchOpen && 'border-azure-200 text-azure')}
                >
                  <Search className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                </button>
              </div>

              <div ref={contactRef} className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setContactOpen((o) => !o)}
                  aria-label="Contact us"
                  aria-expanded={contactOpen}
                  aria-haspopup="true"
                  className={cn(iconBtn, contactOpen && 'border-azure-200 text-azure')}
                >
                  <Phone className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                </button>
                {contactOpen && <ContactMenu onClose={() => setContactOpen(false)} />}
              </div>

              <ProfileMenu iconClassName={iconBtn} />

              <Button
                to={primaryCta.to}
                size="sm"
                className="hidden sm:inline-flex lg:hidden xl:inline-flex motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.04] hover:shadow-card-hover motion-safe:active:scale-95"
              >
                {primaryCta.label}
              </Button>

              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setMobileOpen(true)}
                className={cn(iconBtn, 'lg:hidden')}
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-haspopup="dialog"
              >
                <Menu className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>

          {/* Desktop dropdown. Positioned inside the same container so it can
              never be wider than, or offset from, the bar it belongs to. */}
          {openMenu && (
            <MegaMenu
              key={openMenu}
              id="dl-mega-menu"
              label={openMenu}
              focusFirst={focusMenu}
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
        </div>
        </div>
      </header>

      {/* Centered command-palette search — rendered outside the bar so it never clips. */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      <MobileMenu open={mobileOpen} onClose={closeMobile} />
    </>
  );
}
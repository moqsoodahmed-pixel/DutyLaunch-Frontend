import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Phone, Search } from 'lucide-react';
import { primaryNav, primaryCta, navMenus } from '../../data/site.js';
import { Button } from '../ui/Button.jsx';
import { Container } from '../ui/Container.jsx';
import { Logo } from './Logo.jsx';
import { MegaMenu } from './MegaMenu.jsx';
import { MobileMenu } from './MobileMenu.jsx';
import { SearchModal } from './SearchModal.jsx';
import { ContactMenu } from './ContactMenu.jsx';
import { ProfileMenu } from './ProfileMenu.jsx';
import { cn } from '../../utils/cn.js';

/* The round utility buttons on the right (search, contact, account). Thin
   #D5E4F2 ring, navy glyph, blue on hover. 44px on touch layouts, 40px on the
   desktop bar — the same size for all three so they line up exactly. */
const iconBtn =
  'grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border border-dl-border bg-white text-dl-navy transition-colors duration-150 hover:border-dl-blue hover:bg-dl-hover hover:text-dl-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dl-blue focus-visible:ring-offset-2 ring-offset-white xl:h-10 xl:w-10';
const iconBtnOpen = 'border-dl-blue bg-dl-hover text-dl-blue';

/* Top-level link style. No permanent box: only a pale fill on hover/open and a
   thin blue underline on the page you are on. */
const navLink =
  'relative inline-flex h-10 items-center gap-1 whitespace-nowrap rounded-lg px-3 text-[14.5px] font-semibold text-dl-navy transition-colors duration-150 hover:bg-dl-hover hover:text-dl-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dl-blue xl:px-3.5';
const navLinkOn = 'text-dl-blue after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-dl-blue xl:after:inset-x-3.5';
const navLinkOpen = 'bg-dl-hover text-dl-blue';

const CLOSE_DELAY = 120; // ms — long enough to cross a diagonal, short enough to feel instant

export function Navbar() {
  const [openMenu, setOpenMenu] = useState(null); // a key of navMenus, or null
  const [offsets, setOffsets] = useState({}); // horizontal shift per panel, so none leaves the bar
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const { pathname, search, hash } = useLocation();

  const navRef = useRef(null);
  const cardRef = useRef(null);
  const contactRef = useRef(null);
  const searchRef = useRef(null);
  const itemRefs = useRef({}); // <li> hover wrappers
  const triggerRefs = useRef({}); // the top-level links
  const panelRefs = useRef({}); // the dropdown panels
  const closeTimer = useRef(null);
  const skipFocusOpen = useRef(false); // set while we hand focus back to a trigger after Escape
  const lastPointer = useRef('mouse'); // 'mouse' | 'pen' | 'touch' — decides hover vs tap

  /* ------------------------------ open / close ------------------------------ */
  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);
  const openMenuFor = useCallback(
    (id) => {
      cancelClose();
      setOpenMenu(id);
    },
    [cancelClose]
  );
  const closeNow = useCallback(() => {
    cancelClose();
    setOpenMenu(null);
  }, [cancelClose]);
  const closeSoon = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenMenu(null), CLOSE_DELAY);
  }, [cancelClose]);
  useEffect(() => cancelClose, [cancelClose]);

  // Any navigation closes everything.
  useEffect(() => {
    closeNow();
    setMobileOpen(false);
    setSearchOpen(false);
    setContactOpen(false);
  }, [pathname, search, hash, closeNow]);

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

  // Escape closes whatever is open; a press outside closes it too. `pointerdown`
  // (not mousedown) so a tap on a touch screen counts as well.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeNow();
        setContactOpen(false);
        setSearchOpen(false);
      }
    };
    const onPointerDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) closeNow();
      if (contactRef.current && !contactRef.current.contains(e.target)) setContactOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [closeNow]);

  /* ----------------------------- panel placement ----------------------------- */
  // A panel is left-aligned with its nav item. If that would push it past the
  // right edge of the bar (the Apostille panel is the widest), shift it left
  // just enough to fit. Done for EVERY panel on mount and resize, not only the
  // open one: closed panels are invisible but still occupy layout, and an
  // unshifted one would widen the page and cause horizontal scrolling.
  useLayoutEffect(() => {
    const place = () => {
      const card = cardRef.current?.getBoundingClientRect();
      if (!card) return;
      const next = {};
      Object.keys(navMenus).forEach((id) => {
        const item = itemRefs.current[id]?.getBoundingClientRect();
        const panel = panelRefs.current[id];
        if (!item || !panel || !item.width) return;
        const maxLeft = card.right - item.left - panel.offsetWidth;
        const minLeft = card.left - item.left;
        next[id] = Math.max(minLeft, Math.min(0, maxLeft));
      });
      setOffsets((o) => (Object.keys(next).every((k) => o[k] === next[k]) ? o : { ...o, ...next }));
    };
    place();
    window.addEventListener('resize', place);
    document.fonts?.ready.then(place);
    return () => window.removeEventListener('resize', place);
  }, [openMenu]);

  /* -------------------------------- keyboard -------------------------------- */
  const panelLinks = (id) => [...(panelRefs.current[id]?.querySelectorAll('a[href]') || [])];

  const onItemKeyDown = (e, id) => {
    const trigger = triggerRefs.current[id];
    if (e.key === 'Escape' && openMenu === id) {
      e.preventDefault();
      e.stopPropagation();
      closeNow();
      // Returning focus must not count as "keyboard focus opens the menu".
      skipFocusOpen.current = true;
      trigger?.focus();
      skipFocusOpen.current = false;
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;

    if (e.target === trigger) {
      if (e.key !== 'ArrowDown') return;
      e.preventDefault();
      openMenuFor(id);
      // The panel turns visible on the next frame; focus can only land then.
      requestAnimationFrame(() => panelLinks(id)[0]?.focus());
      return;
    }
    // Inside the panel: arrows walk the links, Home / End jump to the ends.
    const links = panelLinks(id);
    const i = links.indexOf(document.activeElement);
    if (i === -1) return;
    e.preventDefault();
    if (e.key === 'ArrowDown') links[Math.min(i + 1, links.length - 1)].focus();
    if (e.key === 'End') links[links.length - 1].focus();
    if (e.key === 'Home') links[0].focus();
    if (e.key === 'ArrowUp') (i === 0 ? trigger : links[i - 1])?.focus();
  };

  const isActive = (item) => item.match?.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  /* --------------------------------- render --------------------------------- */
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded focus:bg-dl-navy focus:px-4 focus:py-2 focus:text-small focus:text-white"
      >
        Skip to content
      </a>

      <header ref={navRef} className="sticky top-0 z-[70] print:hidden">
        {/* Same <Container> as the page sections, so the bar's edges line up
            with the content below it at every width. */}
        <Container className="py-2.5">
          <div
            ref={cardRef}
            className="relative flex h-[3.75rem] items-center gap-2 rounded-2xl border border-dl-border bg-dl-nav pl-4 pr-2.5 shadow-dl sm:gap-3 xl:gap-6 xl:pl-5 xl:pr-3"
          >
            <Logo tone="dark" />

            {/* Desktop navigation (xl and up). Below that the drawer takes over. */}
            <nav className="hidden flex-1 xl:block" aria-label="Main">
              <ul className="flex items-center justify-center gap-0.5">
                {primaryNav.map((item) => {
                  const menu = item.menu ? navMenus[item.menu] : null;
                  const active = isActive(item);
                  const open = openMenu === item.menu;
                  const panelId = `nav-panel-${item.menu}`;

                  if (!menu) {
                    return (
                      <li key={item.label} onPointerEnter={(e) => e.pointerType !== 'touch' && closeNow()}>
                        <Link to={item.path} aria-current={active ? 'page' : undefined} className={cn(navLink, active && navLinkOn)}>
                          {item.label}
                        </Link>
                      </li>
                    );
                  }

                  return (
                    <li
                      key={item.label}
                      ref={(el) => {
                        itemRefs.current[item.menu] = el;
                      }}
                      className="relative"
                      onPointerEnter={(e) => e.pointerType !== 'touch' && openMenuFor(item.menu)}
                      onPointerLeave={(e) => e.pointerType !== 'touch' && closeSoon()}
                      onBlur={(e) => {
                        // Focus left the item and its panel entirely.
                        if (open && !e.currentTarget.contains(e.relatedTarget)) closeNow();
                      }}
                      onKeyDown={(e) => onItemKeyDown(e, item.menu)}
                    >
                      <Link
                        ref={(el) => {
                          triggerRefs.current[item.menu] = el;
                        }}
                        to={item.path}
                        aria-haspopup="true"
                        aria-expanded={open}
                        aria-controls={panelId}
                        aria-current={active ? 'page' : undefined}
                        className={cn(navLink, active && navLinkOn, open && navLinkOpen)}
                        onPointerDown={(e) => {
                          lastPointer.current = e.pointerType;
                        }}
                        // Keyboard focus opens the panel (not a mouse click, which has its own path).
                        onFocus={(e) => {
                          if (!skipFocusOpen.current && e.currentTarget.matches(':focus-visible')) openMenuFor(item.menu);
                        }}
                        onClick={(e) => {
                          // A tap on a touch screen opens the menu first; a second tap follows the link.
                          // `detail === 0` is a keyboard-triggered click, which should just navigate.
                          if (lastPointer.current === 'touch' && e.detail > 0 && !open) {
                            e.preventDefault();
                            openMenuFor(item.menu);
                          }
                        }}
                      >
                        {item.label}
                        <ChevronDown
                          className={cn('h-4 w-4 text-dl-navy/70 transition-transform duration-150', open && 'rotate-180 text-dl-blue')}
                          aria-hidden
                        />
                      </Link>

                      <MegaMenu
                        id={panelId}
                        menu={menu}
                        open={open}
                        offset={offsets[item.menu] || 0}
                        panelRef={(el) => {
                          panelRefs.current[item.menu] = el;
                        }}
                        onNavigate={closeNow}
                      />
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Right cluster: search, contact, account, then the primary CTA. */}
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2 xl:ml-0">
              <div ref={searchRef} className="relative">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search the site"
                  aria-expanded={searchOpen}
                  aria-haspopup="dialog"
                  className={cn(iconBtn, searchOpen && iconBtnOpen)}
                >
                  <Search className="h-[18px] w-[18px]" aria-hidden />
                </button>
              </div>

              <div ref={contactRef} className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setContactOpen((o) => !o)}
                  aria-label="Contact us"
                  aria-expanded={contactOpen}
                  className={cn(iconBtn, contactOpen && iconBtnOpen)}
                >
                  <Phone className="h-[18px] w-[18px]" aria-hidden />
                </button>
                {contactOpen && <ContactMenu onClose={() => setContactOpen(false)} />}
              </div>

              <ProfileMenu iconClassName={iconBtn} />

              {/* Primary CTA: flat action blue, white text. Inside the drawer on phones. */}
              <Button
                to={primaryCta.to}
                size="sm"
                variant="solid"
                className="ml-1 hidden !min-h-[40px] !rounded-[10px] !px-[18px] md:inline-flex"
              >
                {primaryCta.label}
              </Button>

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className={cn(iconBtn, 'xl:hidden')}
                aria-label="Open menu"
                aria-haspopup="dialog"
                aria-expanded={mobileOpen}
              >
                <Menu className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Command-palette search — rendered outside the bar so it never clips. */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
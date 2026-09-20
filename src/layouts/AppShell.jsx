import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { LogOut, Menu, X, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/layout/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll.js';
import { initials } from '../utils/format.js';
import { cn } from '../utils/cn.js';

function SidebarNav({ groups, onNavigate }) {
  return (
    <nav className="flex-1 space-y-7 overflow-y-auto py-6" aria-label="Section">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="px-3 text-caption font-bold uppercase tracking-wide text-slate-400">{group.title}</p>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => {
              const Icon = Icons[item.icon] || Icons.Circle;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded px-3 py-2 text-small font-medium transition-colors',
                        isActive ? 'bg-azure-50 text-azure-700' : 'text-slate-700 hover:bg-paper hover:text-ink'
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/**
 * The shell behind both /dashboard and /admin. It is intentionally a different
 * chrome from the public site — persistent left rail, denser type, no marketing
 * navigation — while using the same tokens so it still reads as one product.
 */
export default function AppShell({ groups, title }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useLockBodyScroll(open);
  useEffect(() => setOpen(false), [pathname]);

  const signOut = async () => {
    try {
      await logout();
      toast.success('Signed out');
      navigate('/');
    } catch {
      toast.error('Could not sign out. Try again.');
    }
  };

  const account = (
    <div className="border-t border-line px-3 py-4">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-ink-800 text-caption font-bold text-white">
          {initials(user?.name) || '—'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-small font-semibold text-ink">{user?.name}</p>
          <p className="truncate text-caption capitalize text-slate-500">{user?.role}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Link
          to="/"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded border border-line px-2.5 py-1.5 text-caption font-medium text-slate-600 hover:bg-paper"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Site
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded border border-line px-2.5 py-1.5 text-caption font-medium text-slate-600 hover:bg-paper"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-white px-3 lg:flex">
        <div className="flex h-16 items-center px-1">
          <Logo />
        </div>
        <SidebarNav groups={groups} />
        {account}
      </aside>

      {/* Mobile bar */}
      <div className="sticky top-0 z-[60] flex h-14 items-center gap-3 border-b border-line bg-white px-gutter lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="-ml-2 rounded p-2 text-ink hover:bg-paper"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
        <span className="text-small font-bold text-ink">{title}</span>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[95] lg:hidden">
            <motion.div
              className="absolute inset-0 bg-ink-900/55"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="relative flex h-full w-[17rem] max-w-[85vw] flex-col bg-white px-3"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.16, 0.84, 0.44, 1] }}
            >
              <div className="flex h-14 items-center justify-between px-1">
                <Logo />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded p-2 text-slate-500 hover:bg-paper"
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <SidebarNav groups={groups} onNavigate={() => setOpen(false)} />
              {account}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main id="main" className="min-w-0 px-gutter py-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}

/** Page heading used inside the shell. */
export function PanelHeader({ title, description, actions }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-h1 font-extrabold text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-prose text-small text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

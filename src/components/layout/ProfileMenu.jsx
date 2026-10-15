import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, CreditCard, LayoutDashboard, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Badge } from '../ui/Badge.jsx';
import { homePathFor } from '../../utils/homePath.js';
import { initials } from '../../utils/format.js';
import { roleLabel, roleTone } from '../../utils/roles.js';
import { cn } from '../../utils/cn.js';

/** Where each account type edits its own details. */
function profilePathFor(role) {
  if (role === 'institute') return '/partner';
  if (role === 'admin') return null;
  return '/profile';
}

/**
 * Account control on the right of the navbar.
 *   Signed out → round icon linking to sign in.
 *   Signed in  → avatar with first name and account type; opens a menu with
 *                the full name, email, account type and account links.
 */
export function ProfileMenu({ iconClassName }) {
  const { isAuthenticated, user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!isAuthenticated) {
    return (
      <Link to="/login" aria-label="Sign in" className={cn(iconClassName, 'relative')}>
        <UserRound className="h-4.5 w-4.5" aria-hidden />
      </Link>
    );
  }

  const firstName = user?.name?.split(' ')[0] || 'Account';
  const label = roleLabel(user?.role);
  const profilePath = profilePathFor(user?.role);

  const signOut = async () => {
    setOpen(false);
    try {
      await logout();
      toast.success('Signed out');
      navigate('/');
    } catch {
      toast.error('Could not sign out. Try again.');
    }
  };

  const items = [
    { to: homePathFor(user?.role), label: 'Dashboard', icon: LayoutDashboard },
    profilePath && { to: profilePath, label: user?.role === 'institute' ? 'Partner profile' : 'My profile', icon: UserRound },
    user?.role !== 'admin' && { to: '/payments', label: 'My payments', icon: CreditCard },
  ].filter(Boolean);

  const rowClass =
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-small font-semibold text-dl-ink transition-colors hover:bg-dl-hover hover:text-dl-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dl-blue';

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${user?.name}, ${label} account`}
        className={cn(
          'flex h-11 items-center gap-2 rounded-full border border-dl-border bg-white py-0.5 pl-0.5 pr-0.5 text-dl-ink transition-colors duration-150 hover:border-dl-blue hover:bg-dl-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dl-blue focus-visible:ring-offset-2 xl:h-10 xl:pr-2.5',
          open && 'border-dl-blue bg-dl-hover'
        )}
      >
        <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-dl-blue text-caption font-bold text-white">
          {initials(user?.name) || '?'}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-success" aria-hidden />
        </span>
        <span className="hidden min-w-0 text-left leading-tight xl:block">
          <span className="block max-w-[7rem] truncate text-[13px] font-bold">{firstName}</span>
          <span className="block text-[11px] font-medium text-dl-muted">{label}</span>
        </span>
        <ChevronDown className={cn('hidden h-3.5 w-3.5 transition-transform xl:block', open && 'rotate-180')} aria-hidden />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
          role="menu"
          className="absolute right-0 top-full z-[80] mt-3 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-dl-border bg-white p-2 shadow-dl-menu"
        >
          <div className="flex items-center gap-3 rounded-xl bg-dl-hover px-3 py-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-dl-blue text-small font-bold text-white">
              {initials(user?.name) || '?'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-small font-bold text-dl-ink">{user?.name}</p>
              <p className="truncate text-caption text-dl-muted">{user?.email}</p>
              <Badge tone={roleTone(user?.role)} className="mt-1.5 !py-0.5">
                {label} account
              </Badge>
            </div>
          </div>

          <ul className="mt-1 grid gap-0.5">
            {items.map(({ to, label: text, icon: Icon }) => (
              <li key={to}>
                <Link to={to} role="menuitem" className={rowClass} onClick={() => setOpen(false)}>
                  <Icon className="h-4 w-4 text-dl-blue" aria-hidden />
                  {text}
                </Link>
              </li>
            ))}
            <li className="mt-1 border-t border-dl-border pt-1">
              <button type="button" role="menuitem" onClick={signOut} className={cn(rowClass, 'w-full')}>
                <LogOut className="h-4 w-4 text-dl-muted" aria-hidden />
                Sign out
              </button>
            </li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}
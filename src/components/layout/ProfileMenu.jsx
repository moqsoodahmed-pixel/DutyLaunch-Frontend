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
export function ProfileMenu({ dark = false, iconClassName }) {
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
    'flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-small font-semibold text-slate-700 transition-colors hover:bg-glacier-200 hover:text-ink focus-visible:bg-glacier-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400';

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${user?.name}, ${label} account`}
        className={cn(
          'flex h-11 items-center gap-2 rounded-xl border border-glacier-400 bg-white py-0.5 pl-1 pr-1 text-ink transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:border-azure-200 hover:bg-glacier-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.04] hover:shadow-card-hover motion-safe:active:translate-y-0 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:h-10 xl:pr-2.5',
          open && 'border-azure-200 bg-glacier-200'
        )}
      >
        <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-azure text-caption font-bold text-white">
          {initials(user?.name) || '?'}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-success" aria-hidden />
        </span>
        <span className="hidden min-w-0 text-left leading-tight xl:block">
          <span className="block max-w-[7rem] truncate text-[13px] font-bold">{firstName}</span>
          <span className={cn('block text-[11px] font-medium', 'text-slate-600')}>{label}</span>
        </span>
        <ChevronDown className={cn('hidden h-3.5 w-3.5 transition-transform xl:block', open && 'rotate-180')} aria-hidden />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
          role="menu"
          className="absolute right-0 top-full z-[80] mt-2 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-glacier-400 bg-white p-2 shadow-card-hover"
        >
          <div className="flex items-center gap-3 rounded-xl bg-glacier-200 px-3 py-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-azure text-small font-bold text-white">
              {initials(user?.name) || '?'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-small font-bold text-ink">{user?.name}</p>
              <p className="truncate text-caption text-slate-600">{user?.email}</p>
              <Badge tone={roleTone(user?.role)} className="mt-1.5 !py-0.5">
                {label} account
              </Badge>
            </div>
          </div>

          <ul className="mt-1 grid gap-0.5">
            {items.map(({ to, label: text, icon: Icon }) => (
              <li key={to}>
                <Link to={to} role="menuitem" className={rowClass} onClick={() => setOpen(false)}>
                  <Icon className="h-4 w-4 text-azure" aria-hidden />
                  {text}
                </Link>
              </li>
            ))}
            <li className="mt-1 border-t border-line pt-1">
              <button type="button" role="menuitem" onClick={signOut} className={cn(rowClass, 'w-full')}>
                <LogOut className="h-4 w-4 text-slate-500" aria-hidden />
                Sign out
              </button>
            </li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}
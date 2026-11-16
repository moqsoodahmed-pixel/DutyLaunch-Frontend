import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingBlock } from '../components/ui/States.jsx';
import { homePathFor } from '../utils/homePath.js';

/**
 * Guards the private sections. The session is resolved server-side on first
 * load, so we wait for that rather than flashing the sign-in screen at someone
 * who is already signed in.
 */
export function ProtectedRoute({ roles }) {
  const { isAuthenticated, user, initialising } = useAuth();
  const location = useLocation();

  if (initialising) return <LoadingBlock label="Checking your session" className="min-h-screen" />;

  const isAdminRoute = location.pathname.startsWith('/admin') || roles?.includes('admin');

  if (!isAuthenticated) {
    // Attack-surface hardening: never leak admin routes in redirect state query to unauthenticated visitors
    if (isAdminRoute) {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  if (roles) {
    const isAllowed = roles.some((r) => {
      if (r === 'admin') {
        return ['admin', 'super_admin', 'assistant_admin', 'master_admin'].includes(user?.role);
      }
      return user?.role === r;
    });
    if (!isAllowed) {
      // Attack-surface hardening: if an unauthorized user probes admin areas, deflect to root
      if (isAdminRoute) {
        return <Navigate to="/" replace />;
      }
      return <Navigate to={homePathFor(user?.role)} replace />;
    }
  }

  return <Outlet />;
}

/** Keeps signed-in people away from the sign-in and registration screens. */
export function GuestRoute() {
  const { isAuthenticated, user, initialising } = useAuth();
  if (initialising) return <LoadingBlock label="Loading" className="min-h-screen" />;
  if (isAuthenticated) return <Navigate to={homePathFor(user.role)} replace />;
  return <Outlet />;
}

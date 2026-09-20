import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingBlock } from '../components/ui/States.jsx';

/**
 * Guards the private sections. The session is resolved server-side on first
 * load, so we wait for that rather than flashing the sign-in screen at someone
 * who is already signed in.
 */
export function ProtectedRoute({ roles }) {
  const { isAuthenticated, user, initialising } = useAuth();
  const location = useLocation();

  if (initialising) return <LoadingBlock label="Checking your session" className="min-h-screen" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <Outlet />;
}

/** Keeps signed-in people away from the sign-in and registration screens. */
export function GuestRoute() {
  const { isAuthenticated, user, initialising } = useAuth();
  if (initialising) return <LoadingBlock label="Loading" className="min-h-screen" />;
  if (isAuthenticated) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return <Outlet />;
}

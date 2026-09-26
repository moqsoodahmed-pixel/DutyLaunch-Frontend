/**
 * Where each role lands after signing in, and where a route guard sends
 * someone who opens a page their role can't use.
 *
 * Kept in ONE place on purpose: this used to be written out separately in
 * the navbar, both route guards, Login and Register as
 * `role === 'admin' ? '/admin' : '/dashboard'`. With an 'institute' role
 * that would have bounced institutes from /dashboard back to /dashboard —
 * an infinite redirect loop.
 */
export function homePathFor(role) {
  if (role === 'admin') return '/admin';
  if (role === 'institute') return '/partner';
  return '/dashboard';
}

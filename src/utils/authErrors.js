/**
 * `api.js` already normalises every rejected request into `Error(message)`
 * with `.status` and `.fieldErrors` (see the response interceptor), so by
 * the time an error reaches a page it is never a raw AxiosError. This just
 * adds a last line of defence: if a message still looks like it leaked an
 * implementation detail (a stack line, a URL, a driver/DB error), swap it
 * for a plain-language fallback instead of ever rendering it.
 */
const LEAKY_PATTERNS = [
  /axioserror/i,
  /request failed with status/i,
  /\bstatus code\b/i,
  /^(get|post|put|patch|delete)\s+\/?api\//i,
  /\bstack\b/i,
  /mongo|mongoose|sequelize|prisma|sql|ECONNREFUSED|ENOTFOUND/i,
  /https?:\/\//i,
];

export function friendlyAuthError(error, fallback = 'Something went wrong. Please try again.') {
  const message = error?.message;
  if (!message || typeof message !== 'string') return fallback;
  if (LEAKY_PATTERNS.some((re) => re.test(message))) return fallback;
  return message;
}
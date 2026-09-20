/** Tiny class joiner — avoids pulling clsx in for this one job. */
export function cn(...parts) {
  return parts.flat(Infinity).filter(Boolean).join(' ');
}

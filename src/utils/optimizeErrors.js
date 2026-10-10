/**
 * One place for the wording of "AI optimisation did not work" messages, shared
 * by the upload start page and the from-scratch ATS review step.
 */
export function describeOptimizeError(err) {
  const status = err?.response?.status ?? err?.status;
  if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') return 'Optimization was cancelled.';
  // The API layer rewrites a browser timeout as "That took too long…", which
  // has no "timeout" in it — match that wording too, or a slow AI shows up as
  // a vague "unavailable".
  if (err?.code === 'ECONNABORTED' || /time(?:d)?[\s-]?out|took too long/i.test(err?.message || '')) {
    return 'The AI is slower than usual right now, so this took too long. Your resume has not been changed. Press Try again — it usually works on the next attempt.';
  }
  if (status === 429) return 'Too many requests right now. Wait a minute and try again.';
  if (status === 401 || status === 403) return 'Your session has expired. Sign in again to use AI optimization.';
  if (status === 400 || status === 422) return err?.response?.data?.message || 'We could not process this resume for optimization.';
  return 'AI optimization is unavailable right now. Your resume has not been changed.';
}
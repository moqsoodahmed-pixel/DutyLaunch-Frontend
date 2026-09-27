import { LoadingBlock } from './States.jsx';

/**
 * Shown in place of a page while its code loads. Each layout wraps its
 * <Outlet /> in <Suspense fallback={<PageFallback />}> so only the page
 * area waits — the navbar, sidebar and footer stay mounted.
 */
export function PageFallback() {
  return <LoadingBlock label="Loading" className="min-h-[50vh]" />;
}
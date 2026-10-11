import { LoadingBlock } from './States.jsx';

/**
 * Shown in place of a page while its code loads. Each layout wraps its
 * <Outlet /> in <Suspense fallback={<PageFallback />}> so only the page
 * area waits — the navbar, sidebar and footer stay mounted.
 */
export function PageFallback() {
  return (
    <div className="relative min-h-[60vh] w-full flex flex-col items-center justify-center py-20" role="status">
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100/80 overflow-hidden">
        <div className="h-full w-1/3 bg-gradient-to-r from-azure-500 via-azure-600 to-frost-400 animate-[shimmer_1.5s_infinite]" />
      </div>
      <LoadingBlock label="Loading page" className="py-8" />
    </div>
  );
}
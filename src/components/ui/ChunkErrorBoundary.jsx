import { Component } from 'react';
import { reloadOnceForNewDeploy } from '../../utils/lazyWithReload.js';

/**
 * Wraps the entire <Routes> tree. Catches two categories of failure:
 *
 * 1. "Failed to fetch dynamically imported module" — happens when a browser
 *    tab was open before a new deploy. The old chunk hash no longer exists on
 *    Cloudflare Pages; the server returns index.html (text/html) and the JS
 *    import throws. lazyWithReload already handles this in its .catch(), but
 *    if the error escapes into React's render cycle (e.g. the reload fires
 *    after React has already started throwing), this boundary catches it and
 *    shows a clean "Updating…" screen while the reload happens.
 *
 * 2. Any other chunk-level render error — shows the user a clear "something
 *    went wrong" screen with a manual reload button rather than a white page.
 *
 * It does NOT catch errors inside a page's own component tree — those should
 * be handled by page-level boundaries closer to the broken component.
 */
export class ChunkErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, isChunkError: false };
    }

    static getDerivedStateFromError(error) {
        // Detect the specific "stale chunk after deploy" error pattern.
        const msg = error?.message || '';
        const isChunkError =
            msg.includes('Failed to fetch dynamically imported module') ||
            msg.includes('Importing a module script failed') ||
            msg.includes('error loading dynamically imported module') ||
            // Vite/Rollup's own message on chunk 404
            msg.includes('Unable to preload CSS') ||
            error?.name === 'ChunkLoadError';

        return { hasError: true, isChunkError };
    }

    componentDidCatch(error, info) {
        if (this.state.isChunkError) {
            // Try a once-guarded reload. If we already reloaded in the last 10s,
            // reloadOnceForNewDeploy() returns false and we fall through to the
            // manual-reload UI below instead of looping.
            reloadOnceForNewDeploy();
        } else {
            // Log non-chunk errors so they're still visible in monitoring.
            // eslint-disable-next-line no-console
            console.error('[ChunkErrorBoundary] non-chunk render error:', error, info);
        }
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        // Shown only if the auto-reload was suppressed (already reloaded once
        // in the last 10 seconds and the error persists — likely a genuine bug).
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    background: '#050C18',
                    color: '#e2e8f0',
                    fontFamily: '"Helvetica Neue", Arial, sans-serif',
                    textAlign: 'center',
                    padding: '2rem',
                }}
            >
                {this.state.isChunkError ? (
                    <>
                        <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem' }}>
                            Updating DutyLaunch…
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '30ch' }}>
                            A new version was just deployed. Reloading now.
                        </p>
                    </>
                ) : (
                    <>
                        <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f87171', marginBottom: '0.5rem' }}>
                            Something went wrong
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '30ch', marginBottom: '1.5rem' }}>
                            This page ran into an error. Try reloading — if the problem
                            persists, contact support.
                        </p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            style={{
                                background: 'linear-gradient(to right, #1d5db8, #06b6d4)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '0.75rem',
                                padding: '0.75rem 1.75rem',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            Reload page
                        </button>
                    </>
                )}
            </div>
        );
    }
}
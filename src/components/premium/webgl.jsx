import { Component } from 'react';

/* ------------------------------------------------------------------ *
 * Shared safety layer for every three.js scene on the site.
 *
 * isWebGLAvailable() — runs once (cached), before any <Canvas> mounts.
 * Old browsers, locked-down corporate machines and some embedded
 * webviews have no WebGL context; scenes return null in that case and
 * the section's CSS background remains on its own.
 *
 * <SceneErrorBoundary> — catches any runtime error from a scene (driver
 * quirk, context loss, anything) and renders nothing instead of taking
 * the page down. The section keeps all of its real content.
 * ------------------------------------------------------------------ */
let webglSupportCache = null;

export function isWebGLAvailable() {
    if (webglSupportCache !== null) return webglSupportCache;
    if (typeof window === 'undefined') return false;
    try {
        const canvas = document.createElement('canvas');
        webglSupportCache = Boolean(
            window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl'))
        );
    } catch {
        webglSupportCache = false;
    }
    return webglSupportCache;
}

export class SceneErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(err) {
        // eslint-disable-next-line no-console
        console.warn(`[${this.props.name || 'Scene'}] disabled after a render error:`, err);
    }

    render() {
        return this.state.hasError ? null : this.props.children;
    }
}
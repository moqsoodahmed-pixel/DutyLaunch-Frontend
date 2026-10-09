/**
 * Carries a File object from the AI Career Assistant's "+" upload button to
 * the Resume Builder's upload step, across a client-side route change.
 *
 * Why not sessionStorage (like BUILDER_IMPORT_KEY elsewhere)? A File/Blob
 * can't be serialized to a string, and this app is a single-page app — a
 * normal in-memory module variable survives a React Router navigation just
 * fine as long as there's no full page reload in between. If the person
 * does refresh mid-way (or opens the builder in a new tab), takePendingUpload()
 * simply returns null and the Resume Builder falls back to its normal,
 * empty upload screen — never a dead end, just one extra click.
 */
let pendingFile = null;

export function setPendingUpload(file) {
  pendingFile = file || null;
}

/** Returns the pending file and clears it — a one-time handoff, not a cache. */
export function takePendingUpload() {
  const file = pendingFile;
  pendingFile = null;
  return file;
}
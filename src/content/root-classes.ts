/**
 * Classes on <html> that switch the CSS-only features.
 *
 * chrome.storage is asynchronous, so at document_start the settings are not known yet and a
 * hidden element (Shorts, say) would flash before disappearing. To avoid that, the last applied
 * classes are cached in youtube.com's localStorage, which a content script can read synchronously,
 * and put on <html> before YouTube renders anything. The real settings then confirm or correct them.
 */

/** Prefix of every FlashTube class, so classes we no longer want can be found and removed. */
export const ROOT_CLASS_PREFIX = "ft-";

const CACHE_KEY = "flashtube:root-classes";

/** Reads the cached classes; empty when there is no cache or it cannot be read. */
export function readCachedRootClasses(): string[] {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (raw === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((c): c is string => typeof c === "string" && c.startsWith(ROOT_CLASS_PREFIX)) : [];
  } catch {
    return [];
  }
}

/** Puts exactly these FlashTube classes on <html> (others of ours are removed) and caches them. */
export function applyRootClasses(classes: readonly string[]): void {
  const root = document.documentElement;
  const wanted = new Set(classes);
  for (const existing of Array.from(root.classList)) {
    if (existing.startsWith(ROOT_CLASS_PREFIX) && !wanted.has(existing)) {
      root.classList.remove(existing);
    }
  }

  for (const cls of wanted) {
    root.classList.add(cls);
  }

  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(classes));
  } catch {
    // Storage full or blocked: the cache only saves a flash, so carry on without it.
  }
}

/**
 * YouTube page changes without polling.
 *
 * YouTube is a single-page app: going from home to a video does not reload the page, so a content
 * script runs once and must be told about page changes. YouTube fires "yt-navigate-finish" on the
 * document after each in-app navigation; listening to it is free, unlike watching the URL on a timer.
 */

/** Kind of page, for features that only act on some pages. */
export type PageKind = "home" | "watch" | "search" | "subscriptions" | "shorts" | "channel" | "playlist" | "other";

/** Classifies a youtube.com path. */
export function pageKindOf(pathname: string): PageKind {
  if (pathname === "/") {
    return "home";
  }

  if (pathname === "/watch") {
    return "watch";
  }

  if (pathname === "/results") {
    return "search";
  }

  if (pathname === "/feed/subscriptions") {
    return "subscriptions";
  }

  if (pathname === "/playlist") {
    return "playlist";
  }

  if (pathname.startsWith("/shorts/")) {
    return "shorts";
  }

  if (pathname.startsWith("/@") || pathname.startsWith("/channel/") || pathname.startsWith("/c/") || pathname.startsWith("/user/")) {
    return "channel";
  }

  return "other";
}

type Listener = (kind: PageKind, url: URL) => void;

export class Navigation {
  private readonly listeners = new Set<Listener>();

  constructor() {
    document.addEventListener("yt-navigate-finish", () => this.emit());
  }

  /** The page currently shown. */
  get current(): PageKind {
    return pageKindOf(location.pathname);
  }

  /** Calls back after every in-app page change. Returns an unsubscribe function. */
  onChange(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    const url = new URL(location.href);
    const kind = pageKindOf(url.pathname);
    for (const listener of this.listeners) {
      listener(kind, url);
    }
  }
}

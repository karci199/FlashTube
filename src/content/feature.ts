import type { Settings } from "../shared/settings";
import type { DomWatcher } from "./dom-watcher";
import type { Navigation } from "./navigation";

/**
 * Services every feature can use. They are shared, so ten features still cost one observer
 * and one navigation listener.
 */
export interface FeatureContext {
  /** The single MutationObserver, batched per animation frame. */
  readonly dom: DomWatcher;
  /** YouTube's in-app page changes (it is a single-page app: no reloads between pages). */
  readonly navigation: Navigation;
}

/**
 * One feature. Prefer the CSS part: a class on <html> plus rules in features.css cost nothing
 * per frame and apply before YouTube paints. Use apply() only for what CSS cannot do.
 */
export interface Feature {
  /** Stable identifier, used in logs. */
  readonly id: string;

  /** Class put on <html> while the feature is on; the CSS in features.css keys off it. */
  readonly rootClass?: string;

  /** Whether the feature is on for these settings. */
  isEnabled(settings: Settings): boolean;

  /**
   * The JS part, if any. Called at start and after every settings change, with the new settings.
   * It must be idempotent and undo itself when the feature is turned off.
   */
  apply?(settings: Settings, context: FeatureContext): void;
}

/** The <html> classes the enabled features ask for, in registry order. */
export function rootClassesFor(features: readonly Feature[], settings: Settings): string[] {
  const classes: string[] = [];
  for (const feature of features) {
    if (feature.rootClass !== undefined && feature.isEnabled(settings)) {
      classes.push(feature.rootClass);
    }
  }

  return classes;
}

/**
 * Content script entry, injected into youtube.com at document_start.
 *
 * Order matters for speed: the cached <html> classes go on first, synchronously, so CSS features
 * are in effect before YouTube paints; the stored settings are read after, and the shared services
 * (DOM watcher, navigation) are created only once.
 */

import { loadSettings, onSettingsChanged, type Settings } from "../shared/settings";
import { DomWatcher } from "./dom-watcher";
import { rootClassesFor, type FeatureContext } from "./feature";
import { FEATURES } from "./features";
import { Navigation } from "./navigation";
import { applyRootClasses, readCachedRootClasses } from "./root-classes";

applyRootClasses(readCachedRootClasses());

const context: FeatureContext = {
  dom: new DomWatcher(),
  navigation: new Navigation(),
};

/** Applies the settings to every feature: CSS classes first, then the JS parts. */
function applyAll(settings: Settings): void {
  applyRootClasses(rootClassesFor(FEATURES, settings));
  for (const feature of FEATURES) {
    if (feature.apply === undefined) {
      continue;
    }

    try {
      feature.apply(settings, context);
    } catch (error) {
      // One broken feature (YouTube changed its markup, say) must not take the others down.
      console.warn("[FlashTube] feature failed:", feature.id, error);
    }
  }
}

loadSettings().then(applyAll, (error: unknown) => console.warn("[FlashTube] settings could not be read:", error));
onSettingsChanged(applyAll);

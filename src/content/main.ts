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

const navigation = new Navigation();
const context: FeatureContext = {
  dom: new DomWatcher(),
  navigation,
};

/**
 * The current page kind as an attribute (html[data-ft-page="subscriptions"]), so CSS features can
 * be limited to one YouTube section without any JS per page.
 */
function markPage(): void {
  document.documentElement.dataset["ftPage"] = navigation.current;
}

markPage();
navigation.onChange(markPage);

/** Applies the settings to every feature: CSS classes first, then the JS parts. The master switch turns everything off. */
function applyAll(settings: Settings): void {
  applyRootClasses(settings.enabled ? rootClassesFor(FEATURES, settings) : []);
  for (const feature of FEATURES) {
    if (feature.apply === undefined) {
      continue;
    }

    try {
      feature.apply(settings, context, settings.enabled && feature.isEnabled(settings));
    } catch (error) {
      // One broken feature (YouTube changed its markup, say) must not take the others down.
      console.warn("[FlashTube] feature failed:", feature.id, error);
    }
  }
}

loadSettings().then(applyAll, (error: unknown) => console.warn("[FlashTube] settings could not be read:", error));
onSettingsChanged(applyAll);

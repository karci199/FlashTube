import type { Feature } from "../feature";

/**
 * Hides Shorts shelves, Shorts items in grids and search results, and the Shorts entry in the
 * side menu. CSS only (see .ft-hide-shorts in features.css): no per-frame cost, no flash.
 */
export const hideShorts: Feature = {
  id: "hide-shorts",
  rootClass: "ft-hide-shorts",
  isEnabled: (settings) => settings.hideShorts,
};

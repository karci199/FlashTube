/**
 * What the settings UI shows: sections (mirroring YouTube's side menu), the settings in each, and
 * presets. The popup and the options page are both generated from this, so adding a feature to the
 * UI is one entry here plus its messages in _locales.
 */

import type { BooleanSettingKey, Settings } from "./settings";

/** Icon names; each must be listed in src/ui/icons.ts. */
export type IconName =
  | "palette" | "menu-2" | "home" | "compass" | "user-check" | "flame" | "player-play"
  | "keyboard" | "chart-bar" | "database-export" | "target" | "movie" | "sparkles" | "refresh";

/** Groups of the options page navigation, in display order. */
export type SectionGroup = "general" | "youtube" | "other";

/** A page of the options page. */
export interface SectionDefinition {
  readonly id: string;
  readonly group: SectionGroup;
  readonly icon: IconName;
  /** Message id of the title. */
  readonly label: string;
}

/** One switch. */
export interface SwitchDefinition {
  readonly key: BooleanSettingKey;
  /** Section it belongs to (SectionDefinition.id). */
  readonly section: string;
  /** Message ids of the title and the one-line explanation. */
  readonly label: string;
  readonly hint: string;
  /** Also shown in the popup. */
  readonly quick: boolean;
}

/** A named set of values applied in one click. */
export interface PresetDefinition {
  readonly id: string;
  readonly icon: IconName;
  readonly label: string;
  readonly values: Partial<Settings>;
}

export const SECTIONS: readonly SectionDefinition[] = [
  { id: "appearance", group: "general", icon: "palette", label: "sectionAppearance" },
  { id: "sideMenu", group: "general", icon: "menu-2", label: "sectionSideMenu" },
  { id: "home", group: "youtube", icon: "home", label: "sectionHome" },
  { id: "explore", group: "youtube", icon: "compass", label: "sectionExplore" },
  { id: "subscriptions", group: "youtube", icon: "user-check", label: "sectionSubscriptions" },
  { id: "trending", group: "youtube", icon: "flame", label: "sectionTrending" },
  { id: "watch", group: "youtube", icon: "player-play", label: "sectionWatch" },
  { id: "shortcuts", group: "other", icon: "keyboard", label: "sectionShortcuts" },
  { id: "statistics", group: "other", icon: "chart-bar", label: "sectionStatistics" },
  { id: "backup", group: "other", icon: "database-export", label: "sectionBackup" },
];

export const GROUP_LABELS: Readonly<Record<SectionGroup, string>> = {
  general: "groupGeneral",
  youtube: "groupYouTube",
  other: "groupOther",
};

export const SWITCHES: readonly SwitchDefinition[] = [
  { key: "hideShorts", section: "appearance", label: "hideShortsLabel", hint: "hideShortsHint", quick: true },
];

/**
 * Presets. Each lists only the settings it cares about; the rest stay as they are.
 * They grow as features land: every new switch should be placed in the presets it belongs to.
 */
export const PRESETS: readonly PresetDefinition[] = [
  { id: "focus", icon: "target", label: "presetFocus", values: { hideShorts: true } },
  { id: "cinema", icon: "movie", label: "presetCinema", values: { hideShorts: false } },
  { id: "clean", icon: "sparkles", label: "presetClean", values: { hideShorts: true } },
  { id: "default", icon: "refresh", label: "presetDefault", values: { hideShorts: false } },
];

/** Switches of one section, in catalog order. */
export function switchesIn(sectionId: string): SwitchDefinition[] {
  return SWITCHES.filter((s) => s.section === sectionId);
}

/** Whether every value of the preset matches the settings (so its chip shows as active). */
export function presetMatches(preset: PresetDefinition, settings: Settings): boolean {
  for (const [key, value] of Object.entries(preset.values)) {
    if (settings[key as keyof Settings] !== value) {
      return false;
    }
  }

  return true;
}

/** The first preset that matches, or undefined (the user has a custom mix). */
export function activePreset(settings: Settings): PresetDefinition | undefined {
  return PRESETS.find((p) => presetMatches(p, settings));
}

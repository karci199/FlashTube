/**
 * User settings: their shape, defaults, validation and storage.
 *
 * Settings live in chrome.storage.sync, so they follow the user's browser profile across devices.
 * Every key has a default; anything missing or of the wrong type in storage falls back to it,
 * so an older or hand-edited store can never break the content script.
 */

/** All settings. Add a key here, in DEFAULT_SETTINGS and in the catalog when a feature needs one. */
export interface Settings {
  /** Master switch: when off, FlashTube changes nothing on YouTube. */
  enabled: boolean;

  /** Hide Shorts everywhere: home, search, sidebar, subscriptions. */
  hideShorts: boolean;
}

/** Keys whose value is a boolean (shown as switches). */
export type BooleanSettingKey = { [K in keyof Settings]: Settings[K] extends boolean ? K : never }[keyof Settings];

/** Values used until the user changes something. */
export const DEFAULT_SETTINGS: Readonly<Settings> = Object.freeze({
  enabled: true,
  hideShorts: false,
});

/** Key of the settings object in chrome.storage.sync. */
export const STORAGE_KEY = "settings";

/**
 * Builds a complete, type-correct settings object from whatever was stored.
 * Unknown keys are dropped; missing or mistyped keys take their default.
 */
export function mergeSettings(stored: unknown): Settings {
  const result: Settings = { ...DEFAULT_SETTINGS };
  if (stored === null || typeof stored !== "object") {
    return result;
  }

  const source = stored as Record<string, unknown>;
  const target = result as unknown as Record<string, unknown>;
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
    const value = source[key];
    if (typeof value === typeof DEFAULT_SETTINGS[key]) {
      target[key] = value;
    }
  }

  return result;
}

/** Reads the settings from storage. */
export async function loadSettings(): Promise<Settings> {
  const data = await chrome.storage.sync.get(STORAGE_KEY);
  return mergeSettings(data[STORAGE_KEY]);
}

/** Changes some settings and keeps the rest. */
export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await loadSettings()), ...patch };
  await chrome.storage.sync.set({ [STORAGE_KEY]: next });
  return next;
}

/** Calls back whenever the settings change, from any tab or the popup. Returns an unsubscribe function. */
export function onSettingsChanged(callback: (settings: Settings) => void): () => void {
  const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string): void => {
    const change = changes[STORAGE_KEY];
    if (area === "sync" && change !== undefined) {
      callback(mergeSettings(change.newValue));
    }
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}

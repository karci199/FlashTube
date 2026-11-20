/**
 * Popup: a list of switches bound to the settings. Changes are saved at once; the content script
 * hears them through chrome.storage.onChanged and applies them without a page reload.
 */

import { loadSettings, saveSettings, type Settings } from "../shared/settings";

/** A boolean setting shown as a switch: its key and the message ids of its texts. */
interface SwitchDefinition {
  readonly key: { [K in keyof Settings]: Settings[K] extends boolean ? K : never }[keyof Settings];
  readonly label: string;
  readonly hint: string;
}

const SWITCHES: readonly SwitchDefinition[] = [
  { key: "hideShorts", label: "hideShortsLabel", hint: "hideShortsHint" },
];

/** Localized text by message id (from _locales), or the id itself when it is missing. */
function text(id: string): string {
  return chrome.i18n.getMessage(id) || id;
}

function render(container: HTMLElement, settings: Settings): void {
  container.replaceChildren();
  for (const definition of SWITCHES) {
    const row = document.createElement("label");
    row.className = "switch-row";

    const texts = document.createElement("span");
    texts.className = "switch-texts";
    const label = document.createElement("span");
    label.className = "switch-label";
    label.textContent = text(definition.label);
    const hint = document.createElement("span");
    hint.className = "switch-hint";
    hint.textContent = text(definition.hint);
    texts.append(label, hint);

    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "switch";
    input.checked = settings[definition.key];
    input.addEventListener("change", () => {
      void saveSettings({ [definition.key]: input.checked });
    });

    row.append(texts, input);
    container.append(row);
  }
}

for (const element of document.querySelectorAll<HTMLElement>("[data-i18n]")) {
  element.textContent = text(element.dataset["i18n"] ?? "");
}

const container = document.getElementById("settings");
if (container !== null) {
  loadSettings().then((settings) => render(container, settings), (error: unknown) => console.warn("[FlashTube]", error));
}

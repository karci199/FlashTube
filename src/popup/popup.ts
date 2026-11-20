/**
 * Quick panel opened from the toolbar icon: master switch, presets, the switches marked `quick` in
 * the catalog, and a link to the full settings page. Changes are saved at once; YouTube tabs apply
 * them through chrome.storage.onChanged without a reload.
 */

import { PRESETS, SWITCHES, presetMatches } from "../shared/catalog";
import { loadSettings, onSettingsChanged, saveSettings, type Settings } from "../shared/settings";
import { el, localizeDocument, presetChip, switchRow, text, toggle } from "../ui/controls";
import { icon } from "../ui/icons";

const app = document.getElementById("app") as HTMLElement;
const master = document.getElementById("master") as HTMLElement;
const presets = document.getElementById("presets") as HTMLElement;
const switches = document.getElementById("switches") as HTMLElement;
const status = document.getElementById("status") as HTMLElement;
const openOptions = document.getElementById("open-options") as HTMLButtonElement;

function save(patch: Partial<Settings>): void {
  void saveSettings(patch);
}

/** Redraws the panel from the settings. Cheap: a handful of elements. */
function render(settings: Settings): void {
  app.classList.toggle("is-off", !settings.enabled);
  master.replaceChildren(toggle(settings.enabled, text("masterSwitch"), (on) => save({ enabled: on })));
  status.textContent = text(settings.enabled ? "statusOn" : "statusOff");

  presets.replaceChildren(...PRESETS.map((preset) => presetChip(preset, presetMatches(preset, settings), () => save(preset.values))));
  switches.replaceChildren(...SWITCHES.filter((s) => s.quick).map((definition) => switchRow(definition, settings, save)));
}

localizeDocument();
(document.getElementById("logo") as HTMLElement).append(icon("player-play"));
openOptions.append(document.createTextNode(text("allSettings")), icon("arrow-right"));
openOptions.addEventListener("click", () => {
  void chrome.runtime.openOptionsPage();
  window.close();
});

loadSettings().then(render, (error: unknown) => {
  switches.replaceChildren(el("div", "caption", String(error)));
});
onSettingsChanged(render);

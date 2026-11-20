/**
 * Small DOM builders shared by the popup and the options page. Plain DOM, no framework: the pages
 * open instantly and the bundle stays a few kilobytes.
 */

import type { PresetDefinition, SwitchDefinition } from "../shared/catalog";
import type { Settings } from "../shared/settings";
import { icon, type AnyIconName } from "./icons";

/** Localized text by message id (from _locales), or the id itself when it is missing. */
export function text(id: string): string {
  return chrome.i18n.getMessage(id) || id;
}

/** Fills every [data-i18n] element with its message. */
export function localizeDocument(): void {
  for (const element of document.querySelectorAll<HTMLElement>("[data-i18n]")) {
    element.textContent = text(element.dataset["i18n"] ?? "");
  }

  for (const element of document.querySelectorAll<HTMLInputElement>("[data-i18n-placeholder]")) {
    element.placeholder = text(element.dataset["i18nPlaceholder"] ?? "");
  }

  document.documentElement.lang = chrome.i18n.getUILanguage();
}

/** Creates an element with a class and optional text. */
export function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, content?: string): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.className = className;
  if (content !== undefined) {
    element.textContent = content;
  }

  return element;
}

/** A Fluent-style toggle switch. */
export function toggle(checked: boolean, label: string, onChange: (checked: boolean) => void): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.className = "switch";
  input.checked = checked;
  input.setAttribute("aria-label", label);
  input.addEventListener("change", () => onChange(input.checked));
  return input;
}

/** A settings row: title, one-line hint and a switch on the right. */
export function switchRow(definition: SwitchDefinition, settings: Settings, onChange: (patch: Partial<Settings>) => void): HTMLLabelElement {
  const row = el("label", "row");
  const texts = el("span", "row-texts");
  texts.append(el("span", "row-title", text(definition.label)), el("span", "row-hint", text(definition.hint)));
  const label = text(definition.label);
  row.append(texts, toggle(settings[definition.key], label, (checked) => onChange({ [definition.key]: checked })));
  return row;
}

/** A preset chip; `active` when the current settings match it. */
export function presetChip(preset: PresetDefinition, active: boolean, onApply: () => void): HTMLButtonElement {
  const button = el("button", active ? "chip chip-on" : "chip");
  button.type = "button";
  button.setAttribute("aria-pressed", String(active));
  button.append(icon(preset.icon), document.createTextNode(text(preset.label)));
  button.addEventListener("click", onApply);
  return button;
}

/** An icon followed by text. */
export function iconLabel(name: AnyIconName, label: string, className: string): HTMLSpanElement {
  const span = el("span", className);
  span.append(icon(name), document.createTextNode(label));
  return span;
}

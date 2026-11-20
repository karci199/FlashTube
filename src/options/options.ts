/**
 * Full settings page (opens in its own tab). Navigation on the left mirrors YouTube's side menu,
 * grouped as in the catalog; a search box finds a setting across every section. The open section
 * is kept in the URL hash, so a link can point straight at it (options.html#subscriptions).
 */

import { GROUP_LABELS, SECTIONS, SWITCHES, switchesIn, type SectionDefinition, type SectionGroup, type SwitchDefinition } from "../shared/catalog";
import { loadSettings, onSettingsChanged, saveSettings, type Settings } from "../shared/settings";
import { el, iconLabel, localizeDocument, switchRow, text, toggle } from "../ui/controls";
import { icon } from "../ui/icons";

const app = document.getElementById("app") as HTMLElement;
const master = document.getElementById("master") as HTMLElement;
const navGroups = document.getElementById("nav-groups") as HTMLElement;
const search = document.getElementById("search") as HTMLInputElement;
const header = document.getElementById("section-header") as HTMLElement;
const list = document.getElementById("list") as HTMLElement;

let settings: Settings | null = null;
let currentSection: SectionDefinition = SECTIONS[0] as SectionDefinition;

function save(patch: Partial<Settings>): void {
  void saveSettings(patch);
}

/** Lower-cased for matching, with the UI language's rules (Turkish İ/ı). */
function fold(value: string): string {
  return value.toLocaleLowerCase(chrome.i18n.getUILanguage());
}

// #region Navigation

function sectionFromHash(): SectionDefinition {
  const id = location.hash.replace(/^#/, "");
  return SECTIONS.find((s) => s.id === id) ?? (SECTIONS[0] as SectionDefinition);
}

function renderNav(): void {
  const groups = new Map<SectionGroup, SectionDefinition[]>();
  for (const section of SECTIONS) {
    const items = groups.get(section.group) ?? [];
    items.push(section);
    groups.set(section.group, items);
  }

  const parts: HTMLElement[] = [];
  for (const [group, sections] of groups) {
    parts.push(el("div", "nav-group", text(GROUP_LABELS[group])));
    for (const section of sections) {
      const item = el("a", section.id === currentSection.id && search.value === "" ? "nav-item nav-item-on" : "nav-item");
      item.href = "#" + section.id;
      item.append(icon(section.icon), document.createTextNode(text(section.label)));
      parts.push(item);
    }
  }

  navGroups.replaceChildren(...parts);
}

// #endregion

// #region Content

function renderRows(definitions: readonly SwitchDefinition[], withSection: boolean): HTMLElement[] {
  if (settings === null) {
    return [];
  }

  const current = settings;
  return definitions.map((definition) => {
    const row = switchRow(definition, current, save);
    if (withSection) {
      const section = SECTIONS.find((s) => s.id === definition.section);
      if (section !== undefined) {
        row.querySelector(".row-texts")?.prepend(el("span", "row-section", text(section.label)));
      }
    }

    return row;
  });
}

function renderEmpty(title: string, body: string): HTMLElement {
  const box = el("div", "empty");
  box.append(el("div", "empty-title", title), el("div", "empty-body", body));
  return box;
}

function renderContent(): void {
  const query = fold(search.value.trim());
  if (query !== "") {
    const hits = SWITCHES.filter((s) => fold(text(s.label) + " " + text(s.hint)).includes(query));
    header.replaceChildren(iconLabel("search", text("searchResults"), "section-title"));
    list.replaceChildren(...(hits.length > 0 ? renderRows(hits, true) : [renderEmpty(text("noResultsTitle"), text("noResultsBody"))]));
    return;
  }

  header.replaceChildren(iconLabel(currentSection.icon, text(currentSection.label), "section-title"));
  const definitions = switchesIn(currentSection.id);
  list.replaceChildren(...(definitions.length > 0 ? renderRows(definitions, false) : [renderEmpty(text("comingSoonTitle"), text("comingSoonBody"))]));
}

function render(): void {
  if (settings !== null) {
    app.classList.toggle("is-off", !settings.enabled);
    master.replaceChildren(toggle(settings.enabled, text("masterSwitch"), (on) => save({ enabled: on })));
  }

  renderNav();
  renderContent();
}

// #endregion

localizeDocument();
(document.getElementById("logo") as HTMLElement).append(icon("player-play"));
(document.getElementById("search-icon") as HTMLElement).append(icon("search"));

currentSection = sectionFromHash();
window.addEventListener("hashchange", () => {
  currentSection = sectionFromHash();
  search.value = "";
  render();
});
search.addEventListener("input", render);

loadSettings().then((loaded) => {
  settings = loaded;
  render();
}, (error: unknown) => list.replaceChildren(el("div", "caption", String(error))));

onSettingsChanged((changed) => {
  settings = changed;
  render();
});

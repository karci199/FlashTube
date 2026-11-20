import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GROUP_LABELS, PRESETS, SECTIONS, SWITCHES, activePreset, presetMatches } from "../src/shared/catalog";
import { DEFAULT_SETTINGS } from "../src/shared/settings";

function messages(locale: string): Record<string, { message: string }> {
  const file = new URL("../src/_locales/" + locale + "/messages.json", import.meta.url);
  return JSON.parse(readFileSync(file, "utf8")) as Record<string, { message: string }>;
}

const en = messages("en");
const tr = messages("tr");

/** Every message id the catalog refers to. */
function catalogMessageIds(): string[] {
  return [
    ...SECTIONS.map((s) => s.label),
    ...Object.values(GROUP_LABELS),
    ...SWITCHES.flatMap((s) => [s.label, s.hint]),
    ...PRESETS.map((p) => p.label),
  ];
}

describe("catalog", () => {
  it("has unique section ids", () => {
    const ids = SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("puts every switch in an existing section", () => {
    const ids = new Set(SECTIONS.map((s) => s.id));
    for (const definition of SWITCHES) {
      expect(ids.has(definition.section), definition.key).toBe(true);
    }
  });

  it("only uses real setting keys", () => {
    for (const definition of SWITCHES) {
      expect(DEFAULT_SETTINGS, definition.key).toHaveProperty(definition.key);
    }

    for (const preset of PRESETS) {
      for (const key of Object.keys(preset.values)) {
        expect(DEFAULT_SETTINGS, preset.id + "." + key).toHaveProperty(key);
      }
    }
  });

  it("never lets a preset turn the extension off", () => {
    for (const preset of PRESETS) {
      expect(preset.values).not.toHaveProperty("enabled");
    }
  });
});

describe("messages", () => {
  it("has every catalog text in English and Turkish", () => {
    for (const id of catalogMessageIds()) {
      expect(en[id]?.message, "en: " + id).toBeTruthy();
      expect(tr[id]?.message, "tr: " + id).toBeTruthy();
    }
  });

  it("has the same ids in both languages", () => {
    expect(Object.keys(tr).sort()).toEqual(Object.keys(en).sort());
  });
});

describe("presets", () => {
  it("matches the default preset on fresh settings", () => {
    const preset = PRESETS.find((p) => p.id === "default");
    expect(preset).toBeDefined();
    expect(presetMatches(preset!, DEFAULT_SETTINGS)).toBe(true);
  });

  it("finds no preset for a mix none of them describes", () => {
    const custom = { ...DEFAULT_SETTINGS };
    const matching = PRESETS.filter((p) => presetMatches(p, custom));
    expect(activePreset(custom)).toBe(matching[0]);
  });
});

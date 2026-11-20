import { describe, expect, it } from "vitest";
import { rootClassesFor, type Feature } from "../src/content/feature";
import { pageKindOf } from "../src/content/navigation";
import { DEFAULT_SETTINGS, mergeSettings } from "../src/shared/settings";

describe("mergeSettings", () => {
  it("returns the defaults for nothing stored", () => {
    expect(mergeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(mergeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(mergeSettings("garbage")).toEqual(DEFAULT_SETTINGS);
  });

  it("keeps stored values of the right type", () => {
    expect(mergeSettings({ hideShorts: true }).hideShorts).toBe(true);
  });

  it("drops mistyped and unknown keys", () => {
    const merged = mergeSettings({ hideShorts: "yes", somethingOld: 1 });
    expect(merged.hideShorts).toBe(DEFAULT_SETTINGS.hideShorts);
    expect(merged).not.toHaveProperty("somethingOld");
  });
});

describe("rootClassesFor", () => {
  const features: Feature[] = [
    { id: "a", rootClass: "ft-a", isEnabled: (s) => s.hideShorts },
    { id: "b", isEnabled: () => true },
    { id: "c", rootClass: "ft-c", isEnabled: () => true },
  ];

  it("lists the classes of enabled CSS features in order", () => {
    expect(rootClassesFor(features, { ...DEFAULT_SETTINGS, hideShorts: true })).toEqual(["ft-a", "ft-c"]);
    expect(rootClassesFor(features, { ...DEFAULT_SETTINGS, hideShorts: false })).toEqual(["ft-c"]);
  });
});

describe("pageKindOf", () => {
  it.each([
    ["/", "home"],
    ["/watch", "watch"],
    ["/results", "search"],
    ["/feed/subscriptions", "subscriptions"],
    ["/shorts/abc", "shorts"],
    ["/@someone", "channel"],
    ["/playlist", "playlist"],
    ["/feed/history", "other"],
  ])("%s is %s", (path, kind) => {
    expect(pageKindOf(path)).toBe(kind);
  });
});

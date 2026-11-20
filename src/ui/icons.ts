/**
 * Icons used by the extension's own pages: Tabler outline SVGs (MIT), bundled at build time as
 * strings. Only the icons imported here end up in the output, and nothing is loaded from a CDN.
 */

import type { IconName } from "../shared/catalog";
import arrowRight from "@tabler/icons/outline/arrow-right.svg";
import chartBar from "@tabler/icons/outline/chart-bar.svg";
import compass from "@tabler/icons/outline/compass.svg";
import databaseExport from "@tabler/icons/outline/database-export.svg";
import flame from "@tabler/icons/outline/flame.svg";
import home from "@tabler/icons/outline/home.svg";
import keyboard from "@tabler/icons/outline/keyboard.svg";
import menu2 from "@tabler/icons/outline/menu-2.svg";
import movie from "@tabler/icons/outline/movie.svg";
import palette from "@tabler/icons/outline/palette.svg";
import playerPlay from "@tabler/icons/outline/player-play.svg";
import refresh from "@tabler/icons/outline/refresh.svg";
import search from "@tabler/icons/outline/search.svg";
import settings from "@tabler/icons/outline/settings.svg";
import sparkles from "@tabler/icons/outline/sparkles.svg";
import target from "@tabler/icons/outline/target.svg";
import userCheck from "@tabler/icons/outline/user-check.svg";

const SVG: Readonly<Record<IconName | "arrow-right" | "search" | "settings", string>> = {
  "arrow-right": arrowRight,
  "chart-bar": chartBar,
  compass,
  "database-export": databaseExport,
  flame,
  home,
  keyboard,
  "menu-2": menu2,
  movie,
  palette,
  "player-play": playerPlay,
  refresh,
  search,
  settings,
  sparkles,
  target,
  "user-check": userCheck,
};

export type AnyIconName = keyof typeof SVG;

/** An inline SVG element for the icon, sized by the surrounding font size (1em) and coloured by currentColor. */
export function icon(name: AnyIconName): SVGElement {
  const template = document.createElement("template");
  template.innerHTML = SVG[name].trim();
  const svg = template.content.firstElementChild as SVGElement;
  svg.removeAttribute("class");
  svg.setAttribute("width", "1em");
  svg.setAttribute("height", "1em");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("icon");
  return svg;
}

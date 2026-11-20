import type { Feature } from "../feature";
import { hideShorts } from "./hide-shorts";

/** Every feature, in the order they are applied. Register new features here. */
export const FEATURES: readonly Feature[] = [
  hideShorts,
];

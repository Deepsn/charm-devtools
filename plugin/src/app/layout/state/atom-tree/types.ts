import type { Action } from "atoms";

export const ROW_HEIGHT = 24;
export const ROW_GAP = 6;
export const ICON_SCALE = 0.6;
export const FLASH_START_TRANSPARENCY = 0.6;
export const FLASH_DURATION = 0.6;

export type Section = "client" | "server" | "shared";

/** `depth` is the number of indents before the chevron; `key` identifies the group for collapsing. */
export type GroupRow = { kind: "group"; key: string; name: string; count: number; open: boolean; depth: number };
/**
 * `env` is set when the row's environment isn't implied by its section, and is `"both"` for atoms merged across environments.
 * `action` is the latest update among `atomIds`, the first of which is selected when the row is clicked.
 */
export type AtomRow = {
	kind: "atom";
	action: Action;
	label: string;
	atomIds: string[];
	depth: number;
	env?: Action["env"] | "both";
};
export type TreeRow = GroupRow | AtomRow;

import type { Action } from "atoms";

export const ROW_HEIGHT = 24;
export const ROW_GAP = 6;
export const ICON_SCALE = 0.6;
export const FLASH_START_TRANSPARENCY = 0.6;
export const FLASH_DURATION = 0.6;

export type GroupRow = { kind: "group"; name: string; count: number; open: boolean };
export type AtomRow = { kind: "atom"; action: Action; label: string; nested: boolean };
export type TreeRow = GroupRow | AtomRow;

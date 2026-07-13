import { atom } from "@rbxts/charm";

export type WindowId = "history" | "settings" | "atoms";

export const currentWindow = atom<WindowId>("history");

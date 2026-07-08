import { atom } from "@rbxts/charm";

export type WindowId = "history" | "settings";

export const currentWindow = atom<WindowId>("history");

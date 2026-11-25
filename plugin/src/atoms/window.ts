import { atom } from "@rbxts/charm";

export type WindowId = "state" | "timeline" | "settings";

export const currentWindow = atom<WindowId>("state");

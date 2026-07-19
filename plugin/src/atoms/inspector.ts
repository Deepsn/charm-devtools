import { atom } from "@rbxts/charm";

export const selectedActionId = atom<string | undefined>(undefined);

export const selectedAtomId = atom<string | undefined>(undefined);

export const filter = atom("");

export type InspectorTab = "tree" | "raw" | "diff";

export const inspectorTab = atom<InspectorTab>("tree");

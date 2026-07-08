import { atom } from "@rbxts/charm";

/** Id of the action currently selected in the list, shown in the inspector. */
export const selectedActionId = atom<string | undefined>(undefined);

/** Free-text filter applied to the action list. */
export const filter = atom("");

export type InspectorTab = "tree" | "raw";

/** Which representation the inspector is showing for the selected action. */
export const inspectorTab = atom<InspectorTab>("tree");

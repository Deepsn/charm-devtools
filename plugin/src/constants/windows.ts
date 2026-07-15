import type { WindowId } from "atoms/window";

export interface WindowTab {
	id: WindowId;
	label: string;
}

export const WINDOWS: WindowTab[] = [
	{ id: "history", label: "History" },
	{ id: "atoms", label: "Atoms" },
	{ id: "settings", label: "Settings" },
];

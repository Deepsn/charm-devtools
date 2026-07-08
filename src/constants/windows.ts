import type { WindowId } from "atoms/window";

export interface WindowTab {
	id: WindowId;
	label: string;
}

export const WINDOWS: WindowTab[] = [
	{ id: "history", label: "History" },
	{ id: "settings", label: "Settings" },
];

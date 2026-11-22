import type { WindowId } from "atoms/window";

export interface WindowTab {
	id: WindowId;
	label: string;
	icon: string;
}

export const WINDOWS: WindowTab[] = [
	{ id: "atoms", label: "Atoms", icon: "rbxassetid://92694088951236" },
	{ id: "history", label: "History", icon: "rbxassetid://71718845424462" },
	{ id: "settings", label: "Settings", icon: "rbxassetid://101549466136132" },
];

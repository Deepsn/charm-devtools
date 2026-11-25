import type { WindowId } from "atoms/window";
import { ICONS } from "constants/icons";

export interface WindowTab {
	id: WindowId;
	label: string;
	icon: string;
}

export const WINDOWS: WindowTab[] = [
	{ id: "state", label: "State", icon: ICONS.stacks },
	{ id: "timeline", label: "Timeline", icon: ICONS.history },
	{ id: "settings", label: "Settings", icon: ICONS.settings },
];

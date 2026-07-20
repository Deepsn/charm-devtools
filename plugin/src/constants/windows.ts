import type { WindowId } from "atoms/window";

/** Swap for the real artwork once it is uploaded. */
const PLACEHOLDER_ICON = "rbxasset://textures/ui/GuiImagePlaceholder.png";

export interface WindowTab {
	id: WindowId;
	label: string;
	icon: string;
}

export const WINDOWS: WindowTab[] = [
	{ id: "atoms", label: "Atoms", icon: PLACEHOLDER_ICON },
	{ id: "history", label: "History", icon: PLACEHOLDER_ICON },
	{ id: "settings", label: "Settings", icon: PLACEHOLDER_ICON },
];

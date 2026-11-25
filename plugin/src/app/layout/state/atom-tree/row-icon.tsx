import Vide from "@rbxts/vide";
import { Icon } from "app/components/icon";
import { ICONS } from "constants/icons";
import { THEME } from "constants/theme";
import { kindColor, valueKind } from "lib/format";
import { ICON_SCALE, type TreeRow } from "./types";

function iconImage(row: TreeRow) {
	if (row.kind === "group") return row.open ? ICONS.folder.open : ICONS.folder.closed;
	return ICONS.atom;
}

function iconColor(row: TreeRow) {
	if (row.kind === "group") return THEME.folder;
	return kindColor(valueKind(row.action.value));
}

export function RowIcon(props: { row: () => TreeRow; LayoutOrder: number }) {
	return (
		<Icon
			image={() => iconImage(props.row())}
			color={() => iconColor(props.row())}
			scale={ICON_SCALE}
			LayoutOrder={props.LayoutOrder}
		/>
	);
}

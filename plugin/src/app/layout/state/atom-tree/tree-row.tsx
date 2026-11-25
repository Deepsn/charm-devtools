import Vide, { source } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { px, udim, udim2 } from "app/hooks/use-px";
import { selectedAtomId, toggleGroup } from "atoms/inspector";
import { FONT, THEME } from "constants/theme";
import { RowFlash } from "./row-flash";
import { RowIcon } from "./row-icon";
import { ICON_SCALE, ROW_GAP, type TreeRow } from "./types";

const CHEVRON_SCALE = 0.45;

function Square(props: { name: string; scale: number; LayoutOrder: number; visible?: () => boolean }) {
	return (
		<frame
			Name={props.name}
			Size={UDim2.fromScale(1, props.scale)}
			BackgroundTransparency={1}
			LayoutOrder={props.LayoutOrder}
			Visible={props.visible ?? true}
		>
			<uiaspectratioconstraint AspectRatio={1} DominantAxis={Enum.DominantAxis.Height} />
		</frame>
	);
}

function RowChevron(props: { row: () => TreeRow; LayoutOrder: number }) {
	return (
		<textlabel
			Name="Chevron"
			Size={UDim2.fromScale(1, CHEVRON_SCALE)}
			BackgroundTransparency={1}
			Text={() => {
				const current = props.row();
				if (current.kind !== "group") return "";
				return current.open ? "▼" : "▶";
			}}
			TextColor3={THEME.textMuted}
			TextScaled={true}
			Font={FONT.mono}
			LayoutOrder={props.LayoutOrder}
		>
			<uiaspectratioconstraint AspectRatio={1} DominantAxis={Enum.DominantAxis.Height} />
		</textlabel>
	);
}

function RowLabel(props: { row: () => TreeRow; selected: () => boolean; LayoutOrder: number }) {
	return (
		<textlabel
			Name="Label"
			Size={UDim2.fromScale(0, 1)}
			BackgroundTransparency={1}
			Text={() => {
				const current = props.row();
				return current.kind === "group" ? current.name : current.label;
			}}
			TextColor3={() => (props.selected() || props.row().kind === "group" ? THEME.text : THEME.textMuted)}
			TextSize={px(THEME.fontSize)}
			Font={() => (props.row().kind === "group" ? FONT.medium : FONT.ui)}
			TextXAlignment={Enum.TextXAlignment.Left}
			TextTruncate={Enum.TextTruncate.AtEnd}
			LayoutOrder={props.LayoutOrder}
		>
			<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
		</textlabel>
	);
}

function RowCount(props: { row: () => TreeRow; LayoutOrder: number }) {
	return (
		<textlabel
			Name="Count"
			Size={UDim2.fromScale(0, 1)}
			AutomaticSize={Enum.AutomaticSize.X}
			BackgroundTransparency={1}
			Text={() => {
				const current = props.row();
				return current.kind === "group" ? tostring(current.count) : "";
			}}
			TextColor3={THEME.textDim}
			TextSize={px(THEME.fontSize - 2)}
			Font={FONT.mono}
			TextXAlignment={Enum.TextXAlignment.Right}
			Visible={() => props.row().kind === "group"}
			LayoutOrder={props.LayoutOrder}
		/>
	);
}

export function TreeRowView(props: {
	row: () => TreeRow;
	showEnv: () => boolean;
	updatedAt: () => ReadonlyMap<string, number>;
}) {
	const selected = useAtom(selectedAtomId);
	const hovered = source(false);

	const row = props.row;
	const atomId = () => {
		const current = row();
		return current.kind === "atom" ? current.action.atomId : undefined;
	};
	const isSelected = () => {
		const id = atomId();
		return id !== undefined && selected() === id;
	};
	const updatedAt = () => {
		const id = atomId();
		return id !== undefined ? props.updatedAt().get(id) : undefined;
	};
	const nested = () => {
		const current = row();
		return current.kind === "atom" && current.nested;
	};

	return (
		<textbutton
			Name="TreeRow"
			Size={UDim2.fromScale(1, 1)}
			BackgroundColor3={() => (isSelected() ? THEME.rowSelected : THEME.rowHover)}
			BackgroundTransparency={() => (isSelected() ? 0 : hovered() ? 0.3 : 1)}
			BorderSizePixel={0}
			AutoButtonColor={false}
			Text=""
			Activated={() => {
				const current = row();
				if (current.kind === "group") {
					toggleGroup(current.name);
				} else {
					selectedAtomId(current.action.atomId);
				}
			}}
			MouseEnter={() => hovered(true)}
			MouseLeave={() => hovered(false)}
		>
			<uicorner CornerRadius={udim(0, 4)} />

			<RowFlash updatedAt={updatedAt} />

			<frame
				Name="Accent"
				Size={udim2(0, 2, 0.65, 0)}
				Position={UDim2.fromScale(0, 0.5)}
				AnchorPoint={new Vector2(0, 0.5)}
				BackgroundColor3={THEME.accent}
				BorderSizePixel={0}
				Visible={isSelected}
			/>

			<frame Name="Content" Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
				<uipadding PaddingLeft={udim(0, THEME.padding)} PaddingRight={udim(0, THEME.padding)} />
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					Padding={udim(0, ROW_GAP)}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>

				<RowChevron row={row} LayoutOrder={0} />
				{/* nested atoms indent by one icon so they line up under the group's label */}
				<Square name="Indent" scale={ICON_SCALE} LayoutOrder={1} visible={nested} />
				<RowIcon row={row} LayoutOrder={2} />
				<RowLabel row={row} selected={isSelected} LayoutOrder={3} />
				<RowCount row={row} LayoutOrder={4} />
			</frame>
		</textbutton>
	);
}

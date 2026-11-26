import Vide, { source } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { px, udim, udim2 } from "app/hooks/use-px";
import { selectedAtomId, toggleGroup } from "atoms/inspector";
import { FONT, THEME } from "constants/theme";
import { envColor } from "lib/format";
import { RowFlash } from "./row-flash";
import { RowIcon } from "./row-icon";
import { ROW_GAP, ROW_HEIGHT, type TreeRow } from "./types";

const CHEVRON_SCALE = 0.45;

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
			FontFace={FONT.mono}
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
			FontFace={() => (props.row().kind === "group" ? FONT.medium : FONT.ui)}
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
			FontFace={FONT.mono}
			TextXAlignment={Enum.TextXAlignment.Right}
			Visible={() => props.row().kind === "group"}
			LayoutOrder={props.LayoutOrder}
		/>
	);
}

function EnvDot(props: { color: () => Color3; visible: () => boolean; LayoutOrder: number }) {
	return (
		<frame
			Name="Env"
			Size={UDim2.fromScale(1, 0.3)}
			BackgroundColor3={props.color}
			BorderSizePixel={0}
			Visible={props.visible}
			LayoutOrder={props.LayoutOrder}
		>
			<uiaspectratioconstraint AspectRatio={1} DominantAxis={Enum.DominantAxis.Height} />
			<uicorner CornerRadius={new UDim(1, 0)} />
		</frame>
	);
}

/** One dot per environment the atom lives on; merged atoms show both a client and a server dot. */
function RowEnv(props: { row: () => TreeRow; LayoutOrder: number }) {
	const env = () => {
		const current = props.row();
		return current.kind === "atom" ? current.env : undefined;
	};

	return (
		<>
			<EnvDot
				color={() => {
					const current = env();
					return current === "both" ? envColor("client") : current !== undefined ? envColor(current) : THEME.textDim;
				}}
				visible={() => env() !== undefined}
				LayoutOrder={props.LayoutOrder}
			/>
			<EnvDot color={() => envColor("server")} visible={() => env() === "both"} LayoutOrder={props.LayoutOrder + 1} />
		</>
	);
}

export function TreeRowView(props: { row: () => TreeRow; updatedAt: () => ReadonlyMap<string, number> }) {
	const selected = useAtom(selectedAtomId);
	const hovered = source(false);

	const row = props.row;
	const atomIds = (): readonly string[] => {
		const current = row();
		return current.kind === "atom" ? current.atomIds : [];
	};
	const isSelected = () => {
		const id = selected();
		return id !== undefined && atomIds().includes(id);
	};
	const updatedAt = () => {
		let latest: number | undefined;
		for (const id of atomIds()) {
			const time = props.updatedAt().get(id);
			if (time !== undefined && (latest === undefined || time > latest)) latest = time;
		}
		return latest;
	};
	const gap = px(ROW_GAP);
	const indentStep = px(ROW_HEIGHT * CHEVRON_SCALE + ROW_GAP);

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
					toggleGroup(current.key);
				} else if (!isSelected()) {
					selectedAtomId(current.atomIds[0]);
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

				{/* each level indents by one chevron so children line up under their parent's icon */}
				<frame
					Name="Indent"
					Size={() => new UDim2(0, math.max(row().depth * indentStep() - gap(), 0), 1, 0)}
					BackgroundTransparency={1}
					LayoutOrder={0}
					Visible={() => row().depth > 0}
				/>
				<RowChevron row={row} LayoutOrder={1} />
				<RowIcon row={row} LayoutOrder={3} />
				<RowLabel row={row} selected={isSelected} LayoutOrder={4} />
				<RowEnv row={row} LayoutOrder={5} />
				<RowCount row={row} LayoutOrder={7} />
			</frame>
		</textbutton>
	);
}

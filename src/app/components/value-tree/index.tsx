import Vide, { Show, source } from "@rbxts/vide";
import { FONT, THEME } from "constants/theme";
import { displayKey, formatValue, getEntries, isTable, previewTable } from "lib/format";

function Cell(props: { text: Vide.Derivable<string>; color: Color3; order: number; width?: number; size?: number }) {
	return (
		<textlabel
			AutomaticSize={props.width !== undefined ? Enum.AutomaticSize.None : Enum.AutomaticSize.X}
			Size={UDim2.fromOffset(props.width ?? 0, THEME.treeRowHeight)}
			BackgroundTransparency={1}
			Text={props.text}
			TextColor3={props.color}
			TextSize={props.size ?? THEME.monoSize}
			Font={FONT.mono}
			TextXAlignment={Enum.TextXAlignment.Left}
			TextYAlignment={Enum.TextYAlignment.Center}
			LayoutOrder={props.order}
		/>
	);
}

function TreeNode(props: { name: string; value: unknown; expand?: boolean }) {
	const container = isTable(props.value) ? props.value : undefined;
	const entries = container !== undefined ? getEntries(container) : undefined;
	const expandable = entries !== undefined && entries.size() > 0;
	const expanded = source(props.expand === true && expandable);
	const primitive = container === undefined ? formatValue(props.value) : undefined;

	return (
		<frame Name="Node" AutomaticSize={Enum.AutomaticSize.Y} Size={new UDim2(1, 0, 0, 0)} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />

			<textbutton
				Name="Header"
				Size={new UDim2(1, 0, 0, THEME.treeRowHeight)}
				BackgroundTransparency={1}
				AutoButtonColor={false}
				Text=""
				LayoutOrder={1}
				Activated={() => {
					if (expandable) expanded(!expanded());
				}}
			>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Padding={new UDim(0, 3)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>
				<Cell
					text={() => (expandable ? (expanded() ? "▼" : "▶") : "")}
					color={THEME.tree.arrow}
					order={1}
					width={12}
					size={THEME.monoSize - 2}
				/>
				<Cell text={`${props.name}:`} color={THEME.tree.key} order={2} />
				{primitive !== undefined ? (
					<Cell text={primitive.text} color={primitive.color} order={3} />
				) : (
					<Cell text={previewTable(container as object)} color={THEME.tree.preview} order={3} />
				)}
			</textbutton>

			{expandable ? (
				<Show when={expanded}>
					{() => (
						<frame
							Name="Children"
							AutomaticSize={Enum.AutomaticSize.Y}
							Size={new UDim2(1, 0, 0, 0)}
							BackgroundTransparency={1}
							LayoutOrder={2}
						>
							<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
							<uipadding PaddingLeft={new UDim(0, THEME.indent)} />
							{entries?.map((entry) => (
								<TreeNode name={displayKey(entry.key)} value={entry.value} />
							))}
						</frame>
					)}
				</Show>
			) : undefined}
		</frame>
	);
}

/** Renders a value as a collapsible tree. Top-level table entries start expanded. */
export function ValueTree(props: { value: unknown }) {
	if (isTable(props.value)) {
		const entries = getEntries(props.value);
		if (entries.size() === 0) {
			return <TreeNode name="value" value={props.value} />;
		}

		return (
			<frame
				Name="ValueTree"
				AutomaticSize={Enum.AutomaticSize.Y}
				Size={new UDim2(1, 0, 0, 0)}
				BackgroundTransparency={1}
			>
				<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
				{entries.map((entry) => (
					<TreeNode name={displayKey(entry.key)} value={entry.value} expand={true} />
				))}
			</frame>
		);
	}

	return <TreeNode name="value" value={props.value} />;
}

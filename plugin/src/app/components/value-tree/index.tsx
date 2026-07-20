import Vide, { Case, type Derivable, derive, Index, read, Show, type Source, Switch, source } from "@rbxts/vide";
import { FONT, THEME } from "constants/theme";
import { displayKey, formatValue, getEntries, isTable, previewTable } from "lib/format";

const expansionSources = new Map<string, Source<boolean>>();

function expansionSource(path: string, initial: boolean): Source<boolean> {
	let existing = expansionSources.get(path);
	if (existing === undefined) {
		existing = source(initial);
		expansionSources.set(path, existing);
	}
	return existing;
}

function keySegment(key: unknown): string {
	return `${typeOf(key)}:${tostring(key)}`;
}

function Cell(props: {
	text: Derivable<string>;
	color: Derivable<Color3>;
	order: number;
	width?: number;
	size?: number;
}) {
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

function TreeNode(props: {
	name: Derivable<string>;
	value: Derivable<unknown>;
	path: Derivable<string>;
	order?: number;
	expand?: boolean;
}) {
	const value = () => read(props.value);

	const container = derive(() => {
		const current = value();
		return isTable(current) ? current : undefined;
	});
	const entries = derive(() => {
		const current = container();
		return current !== undefined ? getEntries(current) : [];
	});

	const expandable = () => !entries().isEmpty();
	// shared source for this path, so the open/closed state survives tree rebuilds
	const open = () => expansionSource(read(props.path), props.expand === true);
	const expanded = () => open()() && expandable();

	// header text/color collapse into one reactive cell so the node re-renders in
	// place instead of relying on a Switch to rebuild it
	const display = derive(() => {
		const current = container();
		if (current === undefined) return formatValue(value());
		if (expanded()) return { text: "{", color: THEME.tree.key };
		return { text: previewTable(current), color: THEME.tree.preview };
	});

	return (
		<frame
			Name="Node"
			AutomaticSize={Enum.AutomaticSize.Y}
			Size={new UDim2(1, 0, 0, 0)}
			BackgroundTransparency={1}
			LayoutOrder={props.order ?? 0}
		>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />

			<textbutton
				Name="Header"
				Size={new UDim2(1, 0, 0, THEME.treeRowHeight)}
				BackgroundTransparency={1}
				AutoButtonColor={false}
				Text=""
				LayoutOrder={1}
				Activated={() => {
					if (expandable()) {
						const state = open();
						state(!state());
					}
				}}
			>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Padding={new UDim(0, 3)}
					SortOrder={Enum.SortOrder.LayoutOrder}
					VerticalAlignment={Enum.VerticalAlignment.Center}
				/>
				<Cell text={() => `${read(props.name)}:`} color={THEME.tree.key} order={1} />

				<Show when={expandable}>
					{() => (
						<Cell
							text={() => (expanded() ? "▼" : "▶")}
							color={THEME.tree.arrow}
							order={2}
							width={12}
							size={THEME.monoSize - 2}
						/>
					)}
				</Show>

				<Cell text={() => display().text} color={() => display().color} order={3} />
			</textbutton>

			<Show when={expanded}>
				{() => (
					<>
						<frame
							Name="Children"
							AutomaticSize={Enum.AutomaticSize.Y}
							Size={new UDim2(1, 0, 0, 0)}
							BackgroundTransparency={1}
							LayoutOrder={2}
						>
							<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
							<uipadding PaddingLeft={new UDim(0, THEME.indent)} />
							<Index each={entries}>
								{(entry, index) => (
									<TreeNode
										name={() => displayKey(entry().key)}
										value={() => entry().value}
										path={() => `${read(props.path)}/${keySegment(entry().key)}`}
										order={index}
									/>
								)}
							</Index>
						</frame>
						<Cell text={"}"} color={THEME.tree.key} order={4} />
					</>
				)}
			</Show>
		</frame>
	);
}

export function ValueTree(props: { value: Derivable<unknown>; scope?: Derivable<string> }) {
	const value = () => read(props.value);

	const entries = derive(() => {
		const current = value();
		return isTable(current) ? getEntries(current) : [];
	});

	// root of the expansion path; scoping per inspected atom keeps trees independent
	const rootPath = () => read(props.scope) ?? "root";

	return (
		<Switch condition={() => !entries().isEmpty()}>
			<Case match={true}>
				{() => (
					<frame
						Name="ValueTree"
						AutomaticSize={Enum.AutomaticSize.Y}
						Size={new UDim2(1, 0, 0, 0)}
						BackgroundTransparency={1}
					>
						<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
						<Index each={entries}>
							{(entry, index) => (
								<TreeNode
									name={() => displayKey(entry().key)}
									value={() => entry().value}
									path={() => `${rootPath()}/${keySegment(entry().key)}`}
									order={index}
									expand={true}
								/>
							)}
						</Index>
					</frame>
				)}
			</Case>

			<Case match={false}>{() => <TreeNode name="value" value={value} path={() => `${rootPath()}/value`} />}</Case>
		</Switch>
	);
}

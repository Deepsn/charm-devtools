import type { Action, Dependent } from "@rbxts/charm-devtools";
import Vide, { derive, For, Show, source } from "@rbxts/vide";
import { useAtom } from "@rbxts/vide-charm";
import { EmptyState } from "app/components/empty-state";
import { offset, px, udim, udim2 } from "app/hooks/use-px";
import { atoms } from "atoms/atoms";
import { dependents } from "atoms/dependents";
import { selectedAtomId } from "atoms/inspector";
import { FONT, THEME } from "constants/theme";
import { splitAtomName } from "lib/format";
import { openSource, sourceLabel } from "lib/studio";

const KIND_WIDTH = 64;
const HEADER_HEIGHT = 22;

type Row = { type: "header"; label: string; count: number } | { type: "item"; dependent: Dependent };

function describe(dependent: Dependent, action: Action | undefined) {
	if (dependent.kind === "atom") {
		const path = splitAtomName(action?.name ?? dependent.name);
		return { name: path.leaf, location: path.group ?? "" };
	}

	const source = dependent.source;
	if (source === undefined) return { name: dependent.name, location: "" };

	const segments = source.script.split(".");
	segments.pop();
	return { name: sourceLabel(source), location: segments.join(".") };
}

function KindTag(props: { kind: Dependent["kind"] }) {
	const color = THEME.dependent[props.kind];

	return (
		<frame Name="Kind" Size={udim2(0, KIND_WIDTH, 1, 0)} BackgroundTransparency={1} LayoutOrder={0}>
			<textlabel
				Name="Tag"
				AnchorPoint={new Vector2(0, 0.5)}
				Position={UDim2.fromScale(0, 0.5)}
				Size={offset(0, 16)}
				AutomaticSize={Enum.AutomaticSize.X}
				BackgroundColor3={color}
				BackgroundTransparency={0.85}
				BorderSizePixel={0}
				Text={props.kind}
				TextColor3={color}
				TextSize={px(THEME.fontSize - 3)}
				FontFace={FONT.mono}
			>
				<uicorner CornerRadius={udim(0, 4)} />
				<uipadding PaddingLeft={udim(0, 5)} PaddingRight={udim(0, 5)} />
			</textlabel>
		</frame>
	);
}

function SectionHeader(props: { label: string; count: number; order: () => number }) {
	return (
		<textlabel
			Name="Header"
			Size={udim2(1, 0, 0, HEADER_HEIGHT)}
			BackgroundTransparency={1}
			Text={`${props.label.upper()}  -  ${props.count}`}
			TextColor3={THEME.textDim}
			TextSize={px(THEME.labelSize)}
			FontFace={FONT.medium}
			TextXAlignment={Enum.TextXAlignment.Left}
			TextYAlignment={Enum.TextYAlignment.Bottom}
			LayoutOrder={props.order}
		>
			<uipadding PaddingLeft={udim(0, THEME.padding)} PaddingBottom={udim(0, 4)} />
		</textlabel>
	);
}

function DependentRow(props: { dependent: Dependent; action: () => Action | undefined; order: () => number }) {
	const hovered = source(false);
	const { dependent } = props;
	const info = () => describe(dependent, props.action());
	const canOpen = () => (dependent.kind === "atom" ? props.action() !== undefined : dependent.source !== undefined);

	return (
		<textbutton
			Name={dependent.kind}
			Size={udim2(1, 0, 0, THEME.rowHeight)}
			BackgroundColor3={THEME.rowHover}
			BackgroundTransparency={() => (hovered() && canOpen() ? 0.3 : 1)}
			BorderSizePixel={0}
			AutoButtonColor={false}
			Text=""
			LayoutOrder={props.order}
			Activated={() => {
				if (dependent.kind === "atom") {
					if (props.action() !== undefined) selectedAtomId(dependent.id);
				} else if (dependent.source !== undefined) {
					openSource(dependent.source);
				}
			}}
			MouseEnter={() => hovered(true)}
			MouseLeave={() => hovered(false)}
		>
			<uicorner CornerRadius={udim(0, 4)} />
			<uipadding
				PaddingLeft={udim(0, THEME.padding + (dependent.depth - 1) * THEME.indent)}
				PaddingRight={udim(0, THEME.padding)}
			/>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				VerticalAlignment={Enum.VerticalAlignment.Center}
				Padding={udim(0, 8)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>

			<KindTag kind={dependent.kind} />

			<textlabel
				Name="Name"
				Size={UDim2.fromScale(0, 1)}
				BackgroundTransparency={1}
				Text={() => info().name}
				TextColor3={() => (hovered() && canOpen() ? THEME.text : THEME.textMuted)}
				TextSize={px(THEME.fontSize)}
				FontFace={dependent.kind === "atom" ? FONT.ui : FONT.mono}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextTruncate={Enum.TextTruncate.AtEnd}
				LayoutOrder={1}
			>
				<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
			</textlabel>

			<textlabel
				Name="Location"
				Size={UDim2.fromScale(0, 1)}
				AutomaticSize={Enum.AutomaticSize.X}
				BackgroundTransparency={1}
				Text={() => info().location}
				TextColor3={THEME.textDim}
				TextSize={px(THEME.fontSize - 2)}
				FontFace={FONT.mono}
				TextXAlignment={Enum.TextXAlignment.Right}
				LayoutOrder={2}
			/>
		</textbutton>
	);
}

export function DependentsView(props: { atomId: () => string | undefined }) {
	const graph = useAtom(dependents);
	const atomsState = useAtom(atoms);

	const list = derive(() => {
		const id = props.atomId();
		return id !== undefined ? (graph().get(id)?.dependents ?? []) : [];
	});

	const actionsById = derive(() => {
		const byId = new Map<string, Action>();
		for (const action of atomsState()) byId.set(action.atomId, action);
		return byId;
	});

	const rows = derive(() => {
		const direct = list().filter((dependent) => dependent.depth <= 1);
		const indirect = list().filter((dependent) => dependent.depth > 1);
		const result: Row[] = [];

		if (!direct.isEmpty()) {
			result.push({ type: "header", label: "Direct", count: direct.size() });
			for (const dependent of direct) result.push({ type: "item", dependent });
		}
		if (!indirect.isEmpty()) {
			result.push({ type: "header", label: "Indirect", count: indirect.size() });
			for (const dependent of indirect) result.push({ type: "item", dependent });
		}

		return result;
	});

	return (
		<>
			<Show when={() => list().isEmpty()}>{() => <EmptyState text="Nothing depends on this atom yet" />}</Show>

			<Show when={() => !list().isEmpty()}>
				{() => (
					<scrollingframe
						Name="DependentsScroll"
						Size={UDim2.fromScale(1, 1)}
						BackgroundTransparency={1}
						BorderSizePixel={0}
						CanvasSize={UDim2.fromScale(0, 0)}
						AutomaticCanvasSize={Enum.AutomaticSize.Y}
						ScrollingDirection={Enum.ScrollingDirection.Y}
						ScrollBarThickness={px(6)}
						ScrollBarImageColor3={THEME.scrollbar}
					>
						<uilistlayout
							FillDirection={Enum.FillDirection.Vertical}
							Padding={udim(0, THEME.rowSpacing)}
							SortOrder={Enum.SortOrder.LayoutOrder}
						/>

						<For each={rows}>
							{(row, index) =>
								row.type === "header" ? (
									<SectionHeader label={row.label} count={row.count} order={index} />
								) : (
									<DependentRow
										dependent={row.dependent}
										action={() => actionsById().get(row.dependent.id)}
										order={index}
									/>
								)
							}
						</For>
					</scrollingframe>
				)}
			</Show>
		</>
	);
}

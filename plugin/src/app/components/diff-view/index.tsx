import Vide, { Index, Show } from "@rbxts/vide";
import { offset, px, udim, udim2 } from "app/hooks/use-px";
import { FONT, THEME } from "constants/theme";
import type { BlockKind, DiffBlock, ValueDiff } from "lib/diff";

const GUTTER_WIDTH = 34;
const SIGN_WIDTH = 16;
const LINE_HEIGHT = 1.4;

type Gutter = "old" | "new";

function lineColor(kind: BlockKind) {
	if (kind === "added") return THEME.diff.added;
	if (kind === "removed") return THEME.diff.removed;
	if (kind === "collapsed") return THEME.diff.collapsed;
	return THEME.diff.empty;
}

function lineTransparency(kind: BlockKind, gutter: boolean) {
	if (kind === "added" || kind === "removed") {
		return gutter ? THEME.diff.gutterTransparency : THEME.diff.lineTransparency;
	}
	if (kind === "collapsed") return 0.6;
	return kind === "empty" && !gutter ? 0.4 : 1;
}

function MonoLabel(props: {
	name: string;
	text: () => string;
	color: () => Color3;
	width?: number;
	order: number;
	align?: Enum.TextXAlignment;
	rich?: boolean;
	background?: () => Color3;
	transparency?: () => number;
}) {
	const fixed = props.width !== undefined;
	return (
		<textlabel
			Name={props.name}
			Size={offset(props.width ?? 0, 0)}
			AutomaticSize={fixed ? Enum.AutomaticSize.Y : Enum.AutomaticSize.XY}
			BackgroundColor3={props.background ?? THEME.inputBg}
			BackgroundTransparency={props.transparency ?? 1}
			BorderSizePixel={0}
			RichText={props.rich === true}
			Text={props.text}
			TextColor3={props.color}
			TextSize={px(THEME.monoSize)}
			LineHeight={LINE_HEIGHT}
			FontFace={FONT.mono}
			TextXAlignment={props.align ?? Enum.TextXAlignment.Left}
			TextYAlignment={Enum.TextYAlignment.Top}
			LayoutOrder={props.order}
		>
			{fixed && props.align === Enum.TextXAlignment.Right ? <uipadding PaddingRight={udim(0, 8)} /> : undefined}
		</textlabel>
	);
}

/** A run of same-kind diff lines; its text holds every line so heights match across split columns. */
function Block(props: { block: () => DiffBlock; gutters: Gutter[]; order: number; grow: boolean }) {
	const kind = () => props.block().kind;
	const collapsed = () => kind() === "collapsed";
	const signColor = () => {
		if (kind() === "added") return THEME.diff.addedText;
		if (kind() === "removed") return THEME.diff.removedText;
		return THEME.textDim;
	};

	return (
		<frame
			Name="Block"
			Size={UDim2.fromScale(1, 0)}
			AutomaticSize={props.grow ? Enum.AutomaticSize.XY : Enum.AutomaticSize.Y}
			BackgroundColor3={() => lineColor(kind())}
			BackgroundTransparency={() => lineTransparency(kind(), false)}
			BorderSizePixel={0}
			LayoutOrder={props.order}
		>
			<uilistlayout FillDirection={Enum.FillDirection.Horizontal} SortOrder={Enum.SortOrder.LayoutOrder} />

			<Show when={collapsed}>
				{() => (
					<>
						<frame Name="Indent" Size={offset(12, 1)} BackgroundTransparency={1} LayoutOrder={0} />
						<MonoLabel
							name="Collapsed"
							text={() => {
								const count = props.block().count;
								return `⋯  ${count} unchanged ${count === 1 ? "line" : "lines"}`;
							}}
							color={() => THEME.textMuted}
							order={1}
						/>
					</>
				)}
			</Show>

			<Show when={() => !collapsed()}>
				{() => (
					<>
						{props.gutters.map((gutter, index) => (
							<MonoLabel
								name={gutter === "old" ? "OldLines" : "NewLines"}
								text={() => (gutter === "old" ? props.block().oldNumbers : props.block().newNumbers)}
								color={() => THEME.textDim}
								width={GUTTER_WIDTH}
								align={Enum.TextXAlignment.Right}
								background={() => lineColor(kind())}
								transparency={() => lineTransparency(kind(), true)}
								order={index}
							/>
						))}
						<MonoLabel
							name="Signs"
							text={() => props.block().signs}
							color={signColor}
							width={SIGN_WIDTH}
							align={Enum.TextXAlignment.Center}
							order={10}
						/>
						<MonoLabel name="Code" text={() => props.block().text} color={() => THEME.text} rich={true} order={11} />
						<frame Name="End" Size={offset(12, 1)} BackgroundTransparency={1} LayoutOrder={12} />
					</>
				)}
			</Show>
		</frame>
	);
}

function Blocks(props: { blocks: () => DiffBlock[]; gutters: Gutter[]; grow: boolean }) {
	return (
		<>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
			<uipadding PaddingTop={udim(0, 8)} PaddingBottom={udim(0, 8)} />
			<Index each={props.blocks}>
				{(block, index) => <Block block={block} gutters={props.gutters} order={index} grow={props.grow} />}
			</Index>
		</>
	);
}

function Scroller(props: { direction: "XY" | "Y"; children: Vide.Node }) {
	const xy = props.direction === "XY";
	return (
		<scrollingframe
			Name="DiffView"
			Size={UDim2.fromScale(1, 1)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			CanvasSize={UDim2.fromScale(0, 0)}
			AutomaticCanvasSize={xy ? Enum.AutomaticSize.XY : Enum.AutomaticSize.Y}
			ScrollingDirection={xy ? Enum.ScrollingDirection.XY : Enum.ScrollingDirection.Y}
			ScrollBarThickness={px(6)}
			ScrollBarImageColor3={THEME.scrollbar}
		>
			{props.children}
		</scrollingframe>
	);
}

/** Unified diff: one column with both line numbers, removals listed before additions. */
export function InlineDiff(props: { diff: () => ValueDiff }) {
	return (
		<Scroller direction="XY">
			<frame Name="Rows" Size={UDim2.fromScale(1, 0)} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
				<Blocks blocks={() => props.diff().inline} gutters={["old", "new"]} grow={true} />
			</frame>
		</Scroller>
	);
}

/** Side-by-side diff: previous value on the left, current on the right, aligned row by row. */
export function SplitDiff(props: { diff: () => ValueDiff }) {
	return (
		<Scroller direction="Y">
			<frame
				Name="Left"
				Size={udim2(0.5, -1, 0, 0)}
				AutomaticSize={Enum.AutomaticSize.Y}
				BackgroundTransparency={1}
				ClipsDescendants={true}
			>
				<Blocks blocks={() => props.diff().left} gutters={["old"]} grow={false} />
			</frame>
			<frame
				Name="Divider"
				Position={udim2(0.5, -1, 0, 0)}
				Size={new UDim2(0, 1, 1, 0)}
				BackgroundColor3={THEME.border}
				BorderSizePixel={0}
			/>
			<frame
				Name="Right"
				Position={UDim2.fromScale(0.5, 0)}
				Size={UDim2.fromScale(0.5, 0)}
				AutomaticSize={Enum.AutomaticSize.Y}
				BackgroundTransparency={1}
				ClipsDescendants={true}
			>
				<Blocks blocks={() => props.diff().right} gutters={["new"]} grow={false} />
			</frame>
		</Scroller>
	);
}

import Vide from "@rbxts/vide";
import { FONT, THEME } from "constants/theme";
import { type DiffLine, diffLines } from "lib/diff";

const OP_COLOR: Record<DiffLine["op"], Color3> = {
	equal: THEME.text,
	removed: Color3.fromRGB(197, 134, 192),
	added: Color3.fromRGB(152, 195, 121),
};

const OP_BG: Record<DiffLine["op"], Color3 | undefined> = {
	equal: undefined,
	removed: Color3.fromRGB(60, 30, 50),
	added: Color3.fromRGB(30, 50, 30),
};

function Side(props: { line: DiffLine; side: "old" | "new" }) {
	const text = props.side === "old" ? props.line.oldText : props.line.newText;
	const visible = text !== undefined;
	const color = OP_COLOR[props.line.op];
	const bg = OP_BG[props.line.op];

	return (
		<frame
			Name={props.side === "old" ? "Old" : "New"}
			Size={new UDim2(0.5, -2, 0, 0)}
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={bg ? (visible ? 0 : 1) : 1}
			BackgroundColor3={bg}
			BorderSizePixel={0}
		>
			<textlabel
				Name="Text"
				Size={new UDim2(1, -8, 0, 0)}
				AutomaticSize={Enum.AutomaticSize.Y}
				Position={new UDim2(0, 4, 0, 0)}
				BackgroundTransparency={1}
				Text={text ?? ""}
				TextColor3={color}
				TextSize={THEME.monoSize}
				Font={FONT.mono}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextYAlignment={Enum.TextYAlignment.Top}
				TextWrapped={true}
				RichText={false}
			/>
		</frame>
	);
}

function Row(props: { line: DiffLine }) {
	return (
		<frame Name="Row" Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Top}
			/>
			<Side line={props.line} side="old" />
			<Side line={props.line} side="new" />
		</frame>
	);
}

/** Renders a GitHub-style side-by-side diff of two raw strings. */
export function DiffView(props: { oldText: string; newText: string }) {
	const rows = diffLines(props.oldText, props.newText);

	return (
		<scrollingframe
			Name="DiffView"
			Size={new UDim2(1, 0, 1, -22)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			CanvasSize={UDim2.fromScale(0, 0)}
			AutomaticCanvasSize={Enum.AutomaticSize.Y}
			ScrollingDirection={Enum.ScrollingDirection.Y}
			ScrollBarThickness={8}
			ScrollBarImageColor3={THEME.scrollbar}
		>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
			<uipadding
				PaddingLeft={new UDim(0, 8)}
				PaddingRight={new UDim(0, 8)}
				PaddingTop={new UDim(0, 8)}
				PaddingBottom={new UDim(0, 8)}
			/>
			{rows.map((line) => (
				<Row line={line} />
			))}
		</scrollingframe>
	);
}

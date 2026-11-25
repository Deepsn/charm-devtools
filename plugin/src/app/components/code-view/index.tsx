import Vide, { derive } from "@rbxts/vide";
import { FONT, THEME } from "constants/theme";
import { highlightValue } from "lib/code";

const GUTTER_WIDTH = 34;
const LINE_HEIGHT = 1.4;

/** Read-only, syntax-highlighted, line-numbered view of a value. */
export function CodeView(props: { value: () => unknown }) {
	const lines = derive(() => highlightValue(props.value()));

	const gutter = () => {
		const numbers: string[] = [];
		for (const index of $range(1, lines().size())) numbers.push(tostring(index));
		return numbers.join("\n");
	};

	return (
		<scrollingframe
			Name="CodeView"
			Size={UDim2.fromScale(1, 1)}
			BackgroundTransparency={1}
			BorderSizePixel={0}
			CanvasSize={UDim2.fromScale(0, 0)}
			AutomaticCanvasSize={Enum.AutomaticSize.XY}
			ScrollingDirection={Enum.ScrollingDirection.XY}
			ScrollBarThickness={6}
			ScrollBarImageColor3={THEME.scrollbar}
		>
			<uipadding PaddingTop={new UDim(0, 8)} PaddingBottom={new UDim(0, 8)} PaddingRight={new UDim(0, 12)} />

			<textlabel
				Name="Gutter"
				Size={UDim2.fromOffset(GUTTER_WIDTH, 0)}
				AutomaticSize={Enum.AutomaticSize.Y}
				BackgroundTransparency={1}
				Text={gutter}
				TextColor3={THEME.textDim}
				TextSize={THEME.monoSize}
				LineHeight={LINE_HEIGHT}
				Font={FONT.mono}
				TextXAlignment={Enum.TextXAlignment.Right}
				TextYAlignment={Enum.TextYAlignment.Top}
			/>

			<textlabel
				Name="Code"
				Position={UDim2.fromOffset(GUTTER_WIDTH + 18, 0)}
				Size={UDim2.fromOffset(0, 0)}
				AutomaticSize={Enum.AutomaticSize.XY}
				BackgroundTransparency={1}
				RichText={true}
				Text={() => lines().join("\n")}
				TextColor3={THEME.text}
				TextSize={THEME.monoSize}
				LineHeight={LINE_HEIGHT}
				Font={FONT.mono}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextYAlignment={Enum.TextYAlignment.Top}
			/>
		</scrollingframe>
	);
}

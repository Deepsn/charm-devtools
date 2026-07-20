import Vide, { type Derivable } from "@rbxts/vide";
import { FONT, THEME } from "constants/theme";

export function CodeBlock(props: {
	text: Derivable<string>;
	color?: Derivable<Color3>;
	ref?: (instance: TextBox) => void;
	order?: number;
}) {
	return (
		<textbox
			Name="Code"
			action={(instance: TextBox) => props.ref?.(instance)}
			AutomaticSize={Enum.AutomaticSize.Y}
			Size={UDim2.fromScale(1, 0)}
			BackgroundTransparency={1}
			TextEditable={false}
			ClearTextOnFocus={false}
			Text={props.text}
			TextColor3={props.color ?? THEME.tree.other}
			TextSize={THEME.monoSize}
			Font={FONT.mono}
			TextXAlignment={Enum.TextXAlignment.Left}
			TextYAlignment={Enum.TextYAlignment.Top}
			LayoutOrder={props.order ?? 0}
		/>
	);
}

import Vide, { type Derivable } from "@rbxts/vide";
import { FONT, THEME } from "constants/theme";

export function EmptyState(props: { text: Derivable<string> }) {
	return (
		<textlabel
			Name="Empty"
			Size={UDim2.fromScale(1, 1)}
			BackgroundTransparency={1}
			Text={props.text}
			TextColor3={THEME.textDim}
			TextSize={THEME.fontSize}
			Font={FONT.ui}
		/>
	);
}

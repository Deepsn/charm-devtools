import Vide from "@rbxts/vide";
import { THEME } from "constants/theme";

export function Settings() {
	return (
		<textlabel
			Name="Settings"
			Size={UDim2.fromScale(1, 1)}
			BackgroundTransparency={1}
			Text="Settings will go here"
			TextColor3={THEME.textMuted}
			TextSize={THEME.fontSize}
			Font={Enum.Font.Gotham}
		/>
	);
}

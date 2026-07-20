import Vide, { type Derivable, read } from "@rbxts/vide";
import type { Action } from "atoms";
import { FONT, THEME } from "constants/theme";
import { envColor } from "lib/format";

export function EnvBadge(props: {
	env: Derivable<Action["env"]>;
	Size?: UDim2;
	Position?: UDim2;
	AnchorPoint?: Vector2;
	TextSize?: number;
}) {
	return (
		<textlabel
			Name="Env"
			Size={props.Size ?? UDim2.fromOffset(44, 16)}
			Position={props.Position ?? UDim2.fromScale(0, 0)}
			AnchorPoint={props.AnchorPoint ?? Vector2.zero}
			BackgroundColor3={() => envColor(read(props.env))}
			BackgroundTransparency={0}
			BorderSizePixel={0}
			Text={() => read(props.env).upper()}
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextSize={props.TextSize ?? THEME.fontSize - 3}
			Font={FONT.bold}
			TextXAlignment={Enum.TextXAlignment.Center}
			TextYAlignment={Enum.TextYAlignment.Center}
		>
			<uicorner CornerRadius={new UDim(0, 3)} />
		</textlabel>
	);
}

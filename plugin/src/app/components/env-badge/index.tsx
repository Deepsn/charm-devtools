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
	const shouldCapText = props.Size === undefined || (props.Size.X.Scale === 0 && props.Size.X.Offset === 0);
	return (
		<textlabel
			Name="Env"
			Size={props.Size ?? UDim2.fromOffset(0, 16)}
			Position={props.Position ?? UDim2.fromScale(0, 0)}
			AnchorPoint={props.AnchorPoint ?? Vector2.zero}
			BackgroundColor3={() => envColor(read(props.env))}
			BackgroundTransparency={0}
			BorderSizePixel={0}
			AutomaticSize={Enum.AutomaticSize.X}
			Text={() => {
				const text = read(props.env).upper();
				if (shouldCapText) return text.sub(0, 1);
				return text;
			}}
			TextColor3={Color3.fromRGB(255, 255, 255)}
			TextSize={props.TextSize ?? THEME.fontSize - 3}
			Font={FONT.bold}
			TextXAlignment={Enum.TextXAlignment.Center}
			TextYAlignment={Enum.TextYAlignment.Center}
		>
			<uipadding PaddingLeft={new UDim(0, 5)} PaddingRight={new UDim(0, 5)} />
			<uicorner CornerRadius={new UDim(0, 3)} />
		</textlabel>
	);
}

import Vide, { type Derivable } from "@rbxts/vide";
import { THEME } from "constants/theme";

export function Card(props: {
	name?: string;
	Size?: Derivable<UDim2>;
	Position?: Derivable<UDim2>;
	LayoutOrder?: number;
	background?: Derivable<Color3>;
	padding?: number;
	children?: Vide.Node;
}) {
	const padding = props.padding ?? 0;

	return (
		<frame
			Name={props.name ?? "Card"}
			Size={props.Size ?? UDim2.fromScale(1, 1)}
			Position={props.Position ?? UDim2.fromScale(0, 0)}
			BackgroundColor3={props.background ?? THEME.panelBg}
			BorderSizePixel={0}
			LayoutOrder={props.LayoutOrder ?? 0}
		>
			<uicorner CornerRadius={new UDim(0, THEME.radius)} />
			<uistroke Color={THEME.border} />
			<uipadding
				PaddingTop={new UDim(0, padding)}
				PaddingBottom={new UDim(0, padding)}
				PaddingLeft={new UDim(0, padding)}
				PaddingRight={new UDim(0, padding)}
			/>

			{props.children}
		</frame>
	);
}

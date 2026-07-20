import Vide, { source } from "@rbxts/vide";
import { THEME } from "constants/theme";

export function ListRow(props: { selected: () => boolean; onSelect: () => void; children?: Vide.Node }) {
	const hovered = source(false);

	const background = () => {
		if (props.selected()) return THEME.rowSelected;
		return hovered() ? THEME.rowHover : THEME.cardBg;
	};

	return (
		<textbutton
			Name="Row"
			Size={UDim2.fromScale(1, 1)}
			BackgroundColor3={background}
			BorderSizePixel={0}
			AutoButtonColor={false}
			Text=""
			Activated={props.onSelect}
			MouseEnter={() => hovered(true)}
			MouseLeave={() => hovered(false)}
		>
			<uicorner CornerRadius={new UDim(0, THEME.radius - 1)} />
			<uistroke Color={() => (props.selected() ? THEME.accent : THEME.border)} Transparency={0.4} />

			<frame
				Name="Accent"
				Size={new UDim2(0, 3, 1, -10)}
				Position={new UDim2(0, 3, 0.5, 0)}
				AnchorPoint={new Vector2(0, 0.5)}
				BackgroundColor3={THEME.accent}
				BorderSizePixel={0}
				Visible={props.selected}
			>
				<uicorner CornerRadius={new UDim(1, 0)} />
			</frame>

			{props.children}
		</textbutton>
	);
}

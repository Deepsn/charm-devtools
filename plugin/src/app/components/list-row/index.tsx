import Vide, { source } from "@rbxts/vide";
import { THEME } from "constants/theme";

export function ListRow(props: { selected: () => boolean; onSelect: () => void; children?: Vide.Node }) {
	const hovered = source(false);

	return (
		<textbutton
			Name="Row"
			Size={UDim2.fromScale(1, 1)}
			BackgroundColor3={() => (props.selected() ? THEME.rowSelected : THEME.rowHover)}
			BackgroundTransparency={() => (props.selected() || hovered() ? 0 : 1)}
			BorderSizePixel={0}
			AutoButtonColor={false}
			Text=""
			Activated={props.onSelect}
			MouseEnter={() => hovered(true)}
			MouseLeave={() => hovered(false)}
		>
			<frame
				Name="Accent"
				Size={new UDim2(0, 2, 1, 0)}
				BackgroundColor3={THEME.accent}
				BorderSizePixel={0}
				Visible={props.selected}
			/>

			{props.children}
		</textbutton>
	);
}

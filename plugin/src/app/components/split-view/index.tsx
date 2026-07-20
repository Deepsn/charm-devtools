import Vide from "@rbxts/vide";
import { THEME } from "constants/theme";

const LIST_OFFSET = THEME.filterHeight + THEME.gap;
const MAIN_OFFSET = THEME.listWidth + THEME.gap;

export function SplitView(props: { name: string; filter: Vide.Node; list: Vide.Node; inspector: Vide.Node }) {
	return (
		<frame Name={props.name} Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1} BorderSizePixel={0}>
			<frame Name="Sidebar" Size={new UDim2(0, THEME.listWidth, 1, 0)} BackgroundTransparency={1} BorderSizePixel={0}>
				<frame
					Name="FilterSlot"
					Size={new UDim2(1, 0, 0, THEME.filterHeight)}
					BackgroundTransparency={1}
					BorderSizePixel={0}
				>
					{props.filter}
				</frame>

				<frame
					Name="ListSlot"
					Size={new UDim2(1, 0, 1, -LIST_OFFSET)}
					Position={new UDim2(0, 0, 0, LIST_OFFSET)}
					BackgroundTransparency={1}
					BorderSizePixel={0}
				>
					{props.list}
				</frame>
			</frame>

			<frame
				Name="MainSlot"
				Size={new UDim2(1, -MAIN_OFFSET, 1, 0)}
				Position={new UDim2(0, MAIN_OFFSET, 0, 0)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
			>
				{props.inspector}
			</frame>
		</frame>
	);
}

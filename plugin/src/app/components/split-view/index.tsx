import Vide from "@rbxts/vide";
import { THEME } from "constants/theme";

const FILTER_OFFSET = THEME.filterHeight + THEME.gap;
const MAIN_OFFSET = THEME.listWidth + THEME.gap;

export function SplitView(props: {
	name: string;
	filter: Vide.Node;
	subFilter?: Vide.Node;
	list: Vide.Node;
	inspector: Vide.Node;
}) {
	const subOffset = props.subFilter !== undefined ? FILTER_OFFSET : 0;
	const listOffset = FILTER_OFFSET + subOffset;

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

				{props.subFilter !== undefined ? (
					<frame
						Name="SubFilterSlot"
						Size={new UDim2(1, 0, 0, THEME.filterHeight)}
						Position={new UDim2(0, 0, 0, FILTER_OFFSET)}
						BackgroundTransparency={1}
						BorderSizePixel={0}
					>
						{props.subFilter}
					</frame>
				) : undefined}

				<frame
					Name="ListSlot"
					Size={new UDim2(1, 0, 1, -listOffset)}
					Position={new UDim2(0, 0, 0, listOffset)}
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

import Vide, { type Derivable, Show } from "@rbxts/vide";
import { VirtualizedList } from "app/components/virtualized-list";
import { FONT, THEME } from "constants/theme";

export function ListPanel<T extends defined>(props: {
	items: () => readonly T[];
	emptyText: Derivable<string>;
	render: (value: () => T, index: () => number) => Vide.Node;
}) {
	return (
		<frame Name="ListPanel" Size={UDim2.fromScale(1, 1)} BackgroundColor3={THEME.panelBg} BorderSizePixel={0}>
			<Show when={() => props.items().isEmpty()}>
				{() => (
					<textlabel
						Name="Empty"
						Size={new UDim2(1, -20, 0, THEME.rowHeight)}
						Position={new UDim2(0, 10, 0, 4)}
						BackgroundTransparency={1}
						Text={props.emptyText}
						TextColor3={THEME.textDim}
						TextSize={THEME.fontSize}
						Font={FONT.ui}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>
				)}
			</Show>

			{VirtualizedList({
				items: props.items,
				rowHeight: THEME.rowHeight,
				spacing: THEME.rowSpacing,
				Size: UDim2.fromScale(1, 1),
				BackgroundTransparency: 1,
				ScrollBarImageColor3: THEME.scrollbar,
				render: props.render,
			})}
		</frame>
	);
}

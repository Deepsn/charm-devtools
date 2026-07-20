import Vide from "@rbxts/vide";
import { FONT, THEME } from "constants/theme";

export const TAB_HEIGHT = 26;

export interface Tab<T extends string> {
	id: T;
	label: string;
}

export function TabStrip<T extends string>(props: {
	tabs: readonly Tab<T>[];
	active: () => T;
	onSelect: (id: T) => void;
	Position?: UDim2;
}) {
	return (
		<frame
			Name="Tabs"
			Size={new UDim2(1, 0, 0, TAB_HEIGHT)}
			Position={props.Position ?? UDim2.fromScale(0, 0)}
			BackgroundTransparency={1}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				Padding={new UDim(0, 4)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			<uipadding PaddingLeft={new UDim(0, 12)} PaddingTop={new UDim(0, 2)} PaddingBottom={new UDim(0, 2)} />

			{props.tabs.map((tab, index) => {
				const isActive = () => props.active() === tab.id;

				return (
					<textbutton
						Name={tab.label}
						Size={new UDim2(0, 64, 1, 0)}
						BackgroundColor3={THEME.accent}
						BackgroundTransparency={() => (isActive() ? 0 : 1)}
						BorderSizePixel={0}
						AutoButtonColor={false}
						Text={tab.label}
						TextColor3={() => (isActive() ? THEME.text : THEME.textMuted)}
						TextSize={THEME.fontSize}
						Font={FONT.medium}
						LayoutOrder={index}
						Activated={() => props.onSelect(tab.id)}
					>
						<uicorner CornerRadius={new UDim(0, 4)} />
					</textbutton>
				);
			})}
		</frame>
	);
}

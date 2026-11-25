import Vide from "@rbxts/vide";
import { px, udim, udim2 } from "app/hooks/use-px";
import { FONT, THEME } from "constants/theme";

export const TAB_HEIGHT = THEME.tabHeight;

const SEGMENT_WIDTH = 66;
const SEPARATOR_WIDTH = 1;

export interface Tab<T extends string> {
	id: T;
	label: string;
}

export function TabStrip<T extends string>(props: {
	tabs: readonly Tab<T>[];
	active: () => T;
	onSelect: (id: T) => void;
	Position?: UDim2;
	AnchorPoint?: Vector2;
}) {
	const width = props.tabs.size() * SEGMENT_WIDTH;

	return (
		<frame
			Name="Tabs"
			Size={udim2(0, width, 0, TAB_HEIGHT)}
			Position={props.Position ?? UDim2.fromScale(0, 0)}
			AnchorPoint={props.AnchorPoint ?? Vector2.zero}
			BackgroundColor3={THEME.inputBg}
			BorderSizePixel={0}
			ClipsDescendants={true}
		>
			<uicorner CornerRadius={udim(0, THEME.radius)} />
			<uistroke Color={THEME.border} />
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				Padding={new UDim(0, 0)}
				SortOrder={Enum.SortOrder.LayoutOrder}
			/>

			{props.tabs.map((tab, index) => {
				const isActive = () => props.active() === tab.id;

				return (
					<textbutton
						Name={tab.label}
						Size={udim2(0, SEGMENT_WIDTH, 1, 0)}
						BackgroundColor3={THEME.frameBg}
						BackgroundTransparency={() => (isActive() ? 0 : 1)}
						BorderSizePixel={0}
						AutoButtonColor={false}
						Text={tab.label}
						TextColor3={() => (isActive() ? THEME.accent : THEME.textMuted)}
						TextSize={px(THEME.fontSize)}
						FontFace={FONT.medium}
						LayoutOrder={index}
						Activated={() => props.onSelect(tab.id)}
					>
						{index > 0 ? (
							<frame
								Name="Separator"
								Size={udim2(0, SEPARATOR_WIDTH, 1, 0)}
								BackgroundColor3={THEME.border}
								BorderSizePixel={0}
							/>
						) : undefined}
					</textbutton>
				);
			})}
		</frame>
	);
}

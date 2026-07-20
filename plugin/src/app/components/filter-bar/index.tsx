import Vide, { type Derivable } from "@rbxts/vide";
import { FONT, THEME } from "constants/theme";

export interface FilterAction {
	label: string;
	onClick: () => void;
	width?: number;
}

const ACTION_WIDTH = 52;
const ACTION_GAP = 6;

export function FilterBar(props: {
	search: Derivable<string>;
	placeholder: string;
	onSearch: (text: string) => void;
	actions?: FilterAction[];
}) {
	const actions = props.actions ?? [];

	let actionsWidth = 0;
	for (const action of actions) {
		actionsWidth += (action.width ?? ACTION_WIDTH) + ACTION_GAP;
	}

	return (
		<frame Name="FilterBar" Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1} BorderSizePixel={0}>
			<frame
				Name="Search"
				Size={new UDim2(1, -actionsWidth, 1, 0)}
				BackgroundColor3={THEME.inputBg}
				BorderSizePixel={0}
			>
				<uicorner CornerRadius={new UDim(0, THEME.radius)} />
				<uistroke Color={THEME.border} />
				<uipadding PaddingLeft={new UDim(0, 10)} PaddingRight={new UDim(0, 10)} />
				<textbox
					Name="Input"
					Size={UDim2.fromScale(1, 1)}
					BackgroundTransparency={1}
					Text={props.search}
					PlaceholderText={props.placeholder}
					PlaceholderColor3={THEME.textDim}
					TextColor3={THEME.text}
					TextSize={THEME.fontSize}
					Font={FONT.ui}
					TextXAlignment={Enum.TextXAlignment.Left}
					ClearTextOnFocus={false}
					TextChanged={(text: string) => props.onSearch(text)}
				/>
			</frame>

			<frame
				Name="Actions"
				AnchorPoint={new Vector2(1, 0)}
				Position={UDim2.fromScale(1, 0)}
				Size={new UDim2(0, math.max(actionsWidth - ACTION_GAP, 0), 1, 0)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
			>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Padding={new UDim(0, ACTION_GAP)}
					HorizontalAlignment={Enum.HorizontalAlignment.Right}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>
				{actions.map((action, index) => (
					<textbutton
						Name={action.label}
						Size={new UDim2(0, action.width ?? ACTION_WIDTH, 1, 0)}
						BackgroundColor3={THEME.cardBg}
						BorderSizePixel={0}
						AutoButtonColor={true}
						Text={action.label}
						TextColor3={THEME.textMuted}
						TextSize={THEME.fontSize - 1}
						Font={FONT.medium}
						LayoutOrder={index}
						Activated={action.onClick}
					>
						<uicorner CornerRadius={new UDim(0, THEME.radius)} />
						<uistroke Color={THEME.border} />
					</textbutton>
				))}
			</frame>
		</frame>
	);
}

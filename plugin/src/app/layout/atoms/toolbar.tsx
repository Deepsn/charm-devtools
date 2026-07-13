import Vide from "@rbxts/vide";
import { clearHistory } from "atoms/history";
import { filter, selectedActionId } from "atoms/inspector";
import { FONT, THEME } from "constants/theme";
import { useAtom } from "lib/use-atom";

export function Toolbar() {
	const search = useAtom(filter);

	return (
		<frame
			Name="Toolbar"
			Size={new UDim2(1, 0, 0, THEME.toolbarHeight)}
			BackgroundColor3={THEME.toolbarBg}
			BorderSizePixel={0}
			LayoutOrder={1}
		>
			<uipadding
				PaddingLeft={new UDim(0, 6)}
				PaddingRight={new UDim(0, 6)}
				PaddingTop={new UDim(0, 4)}
				PaddingBottom={new UDim(0, 4)}
			/>

			<frame
				Name="Search"
				Size={new UDim2(1, -86, 1, 0)}
				Position={UDim2.fromScale(0, 0)}
				BackgroundColor3={THEME.inputBg}
				BorderSizePixel={0}
			>
				<uicorner CornerRadius={new UDim(0, 4)} />
				<uipadding PaddingLeft={new UDim(0, 8)} PaddingRight={new UDim(0, 8)} />
				<textbox
					Name="Input"
					Size={UDim2.fromScale(1, 1)}
					BackgroundTransparency={1}
					Text={search}
					PlaceholderText="Filter actions…"
					PlaceholderColor3={THEME.textDim}
					TextColor3={THEME.text}
					TextSize={THEME.fontSize}
					Font={FONT.ui}
					TextXAlignment={Enum.TextXAlignment.Left}
					ClearTextOnFocus={false}
					TextChanged={(text: string) => filter(text)}
				/>
			</frame>

			<textbutton
				Name="Clear"
				Size={new UDim2(0, 76, 1, 0)}
				AnchorPoint={new Vector2(1, 0)}
				Position={UDim2.fromScale(1, 0)}
				BackgroundColor3={THEME.frameBg}
				BorderSizePixel={0}
				AutoButtonColor={true}
				Text="Clear"
				TextColor3={THEME.text}
				TextSize={THEME.fontSize}
				Font={FONT.medium}
				Activated={() => {
					clearHistory();
					selectedActionId(undefined);
				}}
			>
				<uicorner CornerRadius={new UDim(0, 4)} />
			</textbutton>
		</frame>
	);
}

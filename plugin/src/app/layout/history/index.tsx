import Vide from "@rbxts/vide";
import { ActionList } from "app/layout/history/action-list";
import { Inspector } from "app/layout/history/inspector";
import { Toolbar } from "app/layout/history/toolbar";
import { THEME } from "constants/theme";

export function History() {
	return (
		<frame Name="History" Size={UDim2.fromScale(1, 1)} BackgroundColor3={THEME.windowBg} BorderSizePixel={0}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />

			<Toolbar />

			<frame
				Name="Split"
				Size={new UDim2(1, 0, 1, -THEME.toolbarHeight)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				LayoutOrder={2}
			>
				<frame
					Name="ListSlot"
					Size={new UDim2(0, THEME.listWidth, 1, 0)}
					Position={UDim2.fromScale(0, 0)}
					BackgroundTransparency={1}
					BorderSizePixel={0}
				>
					<ActionList />
				</frame>

				<frame
					Name="Divider"
					Size={new UDim2(0, 1, 1, 0)}
					Position={new UDim2(0, THEME.listWidth, 0, 0)}
					BackgroundColor3={THEME.divider}
					BorderSizePixel={0}
				/>

				<frame
					Name="InspectorSlot"
					Size={new UDim2(1, -(THEME.listWidth + 1), 1, 0)}
					Position={new UDim2(0, THEME.listWidth + 1, 0, 0)}
					BackgroundTransparency={1}
					BorderSizePixel={0}
				>
					<Inspector />
				</frame>
			</frame>
		</frame>
	);
}

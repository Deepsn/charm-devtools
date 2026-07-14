import Vide, { match } from "@rbxts/vide";
import { Atoms } from "app/layout/atoms";
import { History } from "app/layout/history";
import { Settings } from "app/layout/settings";
import { currentWindow, type WindowId } from "atoms/window";
import { THEME } from "constants/theme";
import { WINDOWS } from "constants/windows";
import { useAtom } from "@rbxts/vide-charm";

function Tab(props: { id: WindowId; label: string; active: () => WindowId }) {
	return (
		<textbutton
			Name={props.label}
			Size={new UDim2(0, 96, 1, 0)}
			BackgroundColor3={() => (props.active() === props.id ? THEME.accent : THEME.frameBg)}
			BorderSizePixel={0}
			AutoButtonColor={true}
			Text={props.label}
			TextColor3={THEME.text}
			TextSize={THEME.fontSize}
			Font={Enum.Font.Gotham}
			Activated={() => currentWindow(props.id)}
		>
			<uicorner CornerRadius={new UDim(0, 4)} />
		</textbutton>
	);
}

function TabBar(props: { active: () => WindowId }) {
	return (
		<frame
			Name="Tabs"
			Size={new UDim2(1, 0, 0, THEME.tabHeight)}
			BackgroundColor3={THEME.windowBg}
			BorderSizePixel={0}
			LayoutOrder={1}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				Padding={new UDim(0, 4)}
				SortOrder={Enum.SortOrder.LayoutOrder}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			{WINDOWS.map((window) => (
				<Tab id={window.id} label={window.label} active={props.active} />
			))}
		</frame>
	);
}

export function App() {
	const active = useAtom(currentWindow);

	return (
		<frame Name="CharmDevtools" Size={UDim2.fromScale(1, 1)} BackgroundColor3={THEME.windowBg} BorderSizePixel={0}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />

			<TabBar active={active} />

			<frame
				Name="Content"
				Size={new UDim2(1, 0, 1, -THEME.tabHeight)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				LayoutOrder={2}
			>
				<uipadding
					PaddingTop={new UDim(0, THEME.padding)}
					PaddingBottom={new UDim(0, THEME.padding)}
					PaddingLeft={new UDim(0, THEME.padding)}
					PaddingRight={new UDim(0, THEME.padding)}
				/>
				{match(active)({
					history: () => History(),
					atoms: () => Atoms(),
					settings: () => Settings(),
				})}
			</frame>
		</frame>
	);
}

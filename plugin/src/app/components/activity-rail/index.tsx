import Vide, { Show, source } from "@rbxts/vide";
import { currentWindow, type WindowId } from "atoms/window";
import { FONT, THEME } from "constants/theme";
import { WINDOWS, type WindowTab } from "constants/windows";

const TOOLTIP_ZINDEX = 50;

function Tooltip(props: { text: string }) {
	return (
		<textlabel
			Name="Tooltip"
			AnchorPoint={new Vector2(0, 0.5)}
			Position={new UDim2(1, 8, 0.5, 0)}
			Size={new UDim2(0, 0, 0, 22)}
			AutomaticSize={Enum.AutomaticSize.X}
			BackgroundColor3={THEME.cardBg}
			BorderSizePixel={0}
			Text={props.text}
			TextColor3={THEME.text}
			TextSize={THEME.fontSize}
			Font={FONT.medium}
			ZIndex={TOOLTIP_ZINDEX}
		>
			<uicorner CornerRadius={new UDim(0, 4)} />
			<uistroke Color={THEME.border} />
			<uipadding PaddingLeft={new UDim(0, 8)} PaddingRight={new UDim(0, 8)} />
		</textlabel>
	);
}

function RailButton(props: { window: WindowTab; active: () => WindowId; order: number }) {
	const hovered = source(false);
	const isActive = () => props.active() === props.window.id;

	return (
		<textbutton
			Name={props.window.label}
			Size={new UDim2(1, 0, 0, THEME.railItemHeight)}
			BackgroundColor3={THEME.rowHover}
			BackgroundTransparency={() => (hovered() && !isActive() ? 0.5 : 1)}
			BorderSizePixel={0}
			AutoButtonColor={false}
			Text=""
			LayoutOrder={props.order}
			Activated={() => currentWindow(props.window.id)}
			MouseEnter={() => hovered(true)}
			MouseLeave={() => hovered(false)}
		>
			<frame
				Name="Indicator"
				Size={new UDim2(0, 2, 1, -12)}
				Position={new UDim2(0, 0, 0.5, 0)}
				AnchorPoint={new Vector2(0, 0.5)}
				BackgroundColor3={THEME.accent}
				BorderSizePixel={0}
				Visible={isActive}
			/>

			<imagelabel
				Name="Icon"
				AnchorPoint={new Vector2(0.5, 0.5)}
				Position={UDim2.fromScale(0.5, 0.5)}
				Size={UDim2.fromOffset(THEME.railIconSize, THEME.railIconSize)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				Image={props.window.icon}
				ImageColor3={() => (isActive() || hovered() ? THEME.iconActive : THEME.icon)}
			/>

			<Show when={hovered}>{() => <Tooltip text={props.window.label} />}</Show>
		</textbutton>
	);
}

export function ActivityRail(props: { active: () => WindowId }) {
	return (
		<frame
			Name="ActivityRail"
			Size={new UDim2(0, THEME.railWidth, 1, 0)}
			BackgroundColor3={THEME.railBg}
			BorderSizePixel={0}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				SortOrder={Enum.SortOrder.LayoutOrder}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
			/>
			<uipadding PaddingTop={new UDim(0, 6)} />

			{WINDOWS.map((window, index) => (
				<RailButton window={window} active={props.active} order={index} />
			))}
		</frame>
	);
}

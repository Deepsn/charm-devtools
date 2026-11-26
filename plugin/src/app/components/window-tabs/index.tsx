import Vide, { Show, source } from "@rbxts/vide";
import { offset, px, udim, udim2 } from "app/hooks/use-px";
import { FONT, THEME } from "constants/theme";

const TAB_HEIGHT = THEME.tabHeight + 4;
const TAB_GAP = 2;
const BAR_INSET = THEME.radius;

export interface WindowTab<T extends string> {
	id: T;
	label: string;
	badge?: () => string | undefined;
}

function Badge(props: { text: () => string; active: () => boolean }) {
	return (
		<textlabel
			Name="Badge"
			Size={offset(0, 16)}
			AutomaticSize={Enum.AutomaticSize.X}
			BackgroundColor3={() => (props.active() ? THEME.rowSelected : THEME.chipBg)}
			BorderSizePixel={0}
			Text={props.text}
			TextColor3={() => (props.active() ? THEME.accentText : THEME.textMuted)}
			TextSize={px(THEME.fontSize - 3)}
			FontFace={FONT.mono}
			LayoutOrder={1}
		>
			<uicorner CornerRadius={udim(0, 4)} />
			<uipadding PaddingLeft={udim(0, 5)} PaddingRight={udim(0, 5)} />
		</textlabel>
	);
}

function Tab<T extends string>(props: {
	tab: WindowTab<T>;
	active: () => T;
	onSelect: (id: T) => void;
	order: number;
}) {
	const hovered = source(false);
	const isActive = () => props.active() === props.tab.id;
	const badge = () => props.tab.badge?.();

	return (
		<textbutton
			Name={props.tab.label}
			Size={UDim2.fromScale(0, 1)}
			AutomaticSize={Enum.AutomaticSize.X}
			BackgroundColor3={() => (isActive() ? THEME.valueBg : THEME.rowHover)}
			BackgroundTransparency={() => (isActive() ? 0 : hovered() ? 0.4 : 1)}
			BorderSizePixel={0}
			AutoButtonColor={false}
			Text=""
			LayoutOrder={props.order}
			Activated={() => props.onSelect(props.tab.id)}
			MouseEnter={() => hovered(true)}
			MouseLeave={() => hovered(false)}
		>
			<uicorner CornerRadius={udim(0, THEME.radius)} />
			<uistroke Color={THEME.border} Transparency={() => (isActive() ? 0 : 1)} />

			<frame
				Name="Join"
				Position={udim2(0, 0, 1, -THEME.radius)}
				Size={udim2(1, 0, 0, THEME.radius + 2)}
				BackgroundColor3={THEME.valueBg}
				BorderSizePixel={0}
				Visible={isActive}
			/>

			<frame
				Name="Content"
				Size={UDim2.fromScale(0, 1)}
				AutomaticSize={Enum.AutomaticSize.X}
				BackgroundTransparency={1}
			>
				<uipadding PaddingLeft={udim(0, 12)} PaddingRight={udim(0, 12)} />
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					Padding={udim(0, 6)}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>

				<textlabel
					Name="Label"
					Size={UDim2.fromScale(0, 1)}
					AutomaticSize={Enum.AutomaticSize.X}
					BackgroundTransparency={1}
					Text={props.tab.label}
					TextColor3={() => (isActive() || hovered() ? THEME.text : THEME.textMuted)}
					TextSize={px(THEME.fontSize - 1)}
					FontFace={FONT.medium}
					LayoutOrder={0}
				/>

				<Show when={() => badge() !== undefined}>{() => <Badge text={() => badge() ?? ""} active={isActive} />}</Show>
			</frame>
		</textbutton>
	);
}

export function WindowTabs<T extends string>(props: {
	name?: string;
	tabs: readonly WindowTab<T>[];
	active: () => T;
	onSelect: (id: T) => void;
	padding?: number;
	LayoutOrder?: number;
	children?: Vide.Node;
}) {
	const padding = props.padding ?? 0;

	return (
		<frame
			Name={props.name ?? "Windows"}
			Size={UDim2.fromScale(1, 0)}
			BackgroundTransparency={1}
			LayoutOrder={props.LayoutOrder ?? 0}
		>
			<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />

			<frame Name="TabBar" Size={udim2(1, 0, 0, TAB_HEIGHT)} BackgroundTransparency={1} ZIndex={2}>
				<uipadding PaddingLeft={udim(0, BAR_INSET)} />
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					Padding={udim(0, TAB_GAP)}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>

				{props.tabs.map((tab, index) => (
					<Tab tab={tab} active={props.active} onSelect={props.onSelect} order={index} />
				))}
			</frame>

			<frame
				Name="Body"
				Position={udim2(0, 0, 0, TAB_HEIGHT)}
				Size={udim2(1, 0, 1, -TAB_HEIGHT)}
				BackgroundColor3={THEME.valueBg}
				BorderSizePixel={0}
				ClipsDescendants={true}
				ZIndex={1}
			>
				<uicorner CornerRadius={udim(0, THEME.radius)} />
				<uistroke Color={THEME.border} />
				<uipadding
					PaddingTop={udim(0, padding)}
					PaddingBottom={udim(0, padding)}
					PaddingLeft={udim(0, padding)}
					PaddingRight={udim(0, padding)}
				/>
				{props.children}
			</frame>
		</frame>
	);
}

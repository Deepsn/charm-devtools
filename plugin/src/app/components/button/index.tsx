import Vide, { type Derivable, read, source } from "@rbxts/vide";
import { offset, px, udim, udim2 } from "app/hooks/use-px";
import { FONT, THEME } from "constants/theme";

/** Pass `width` when nesting a popover: auto-sized buttons would grow to fit it. */
export function ToolbarButton(props: {
	name: string;
	text?: Derivable<string>;
	icon?: string;
	active?: Derivable<boolean>;
	width?: number;
	ZIndex?: Derivable<number>;
	LayoutOrder?: number;
	onClick: () => void;
	children?: Vide.Node;
}) {
	const hovered = source(false);
	const active = () => read(props.active) === true;

	return (
		<textbutton
			Name={props.name}
			Size={udim2(0, props.width ?? 0, 1, 0)}
			AutomaticSize={props.width === undefined ? Enum.AutomaticSize.X : Enum.AutomaticSize.None}
			BackgroundColor3={() => {
				if (active()) return THEME.rowSelected;
				return hovered() ? THEME.rowHover : THEME.cardBg;
			}}
			BorderSizePixel={0}
			AutoButtonColor={false}
			Text=""
			ZIndex={props.ZIndex ?? 1}
			LayoutOrder={props.LayoutOrder ?? 0}
			Activated={props.onClick}
			MouseEnter={() => hovered(true)}
			MouseLeave={() => hovered(false)}
		>
			<uicorner CornerRadius={udim(0, THEME.radius)} />
			<uistroke Color={() => (active() ? THEME.accent : THEME.border)} Transparency={() => (active() ? 0.2 : 0)} />
			<uipadding PaddingLeft={udim(0, 10)} PaddingRight={udim(0, 10)} />

			<frame
				Name="Content"
				Size={new UDim2(props.width === undefined ? 0 : 1, 0, 1, 0)}
				AutomaticSize={props.width === undefined ? Enum.AutomaticSize.X : Enum.AutomaticSize.None}
				BackgroundTransparency={1}
			>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					Padding={udim(0, 6)}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>
				{props.icon !== undefined ? (
					<imagelabel
						Name="Icon"
						Size={offset(15, 15)}
						BackgroundTransparency={1}
						Image={props.icon}
						ImageColor3={() => (active() ? THEME.accentText : THEME.textMuted)}
						LayoutOrder={0}
					/>
				) : undefined}
				{props.text !== undefined ? (
					<textlabel
						Name="Label"
						Size={UDim2.fromScale(0, 1)}
						AutomaticSize={Enum.AutomaticSize.X}
						BackgroundTransparency={1}
						Text={props.text}
						TextColor3={() => (active() ? THEME.accentText : hovered() ? THEME.text : THEME.textMuted)}
						TextSize={px(THEME.fontSize - 1)}
						Font={FONT.medium}
						LayoutOrder={1}
					/>
				) : undefined}
			</frame>

			{props.children}
		</textbutton>
	);
}

/** Square icon-only button used for compact controls (e.g. timeline playback). */
export function IconButton(props: {
	name: string;
	primary?: Derivable<boolean>;
	size?: number;
	LayoutOrder?: number;
	onClick: () => void;
	children?: Vide.Node;
}) {
	const hovered = source(false);
	const primary = () => read(props.primary) === true;
	const size = props.size ?? 26;

	return (
		<textbutton
			Name={props.name}
			Size={offset(size, size)}
			BackgroundColor3={() => {
				if (primary()) return THEME.accent;
				return hovered() ? THEME.rowHover : THEME.cardBg;
			}}
			BorderSizePixel={0}
			AutoButtonColor={false}
			Text=""
			LayoutOrder={props.LayoutOrder ?? 0}
			Activated={props.onClick}
			MouseEnter={() => hovered(true)}
			MouseLeave={() => hovered(false)}
		>
			<uicorner CornerRadius={udim(0, THEME.radius - 1)} />
			<uistroke Color={() => (primary() ? THEME.accent : THEME.border)} />
			{props.children}
		</textbutton>
	);
}

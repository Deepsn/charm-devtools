import Vide, { type Derivable, read, Show, source } from "@rbxts/vide";
import { offset, px, udim, udim2 } from "app/hooks/use-px";
import { FONT, THEME } from "constants/theme";

const BACKDROP_SIZE = 8000;

/**
 * Dropdown panel anchored below its parent. Render it as a child of the trigger
 * and raise the trigger's ZIndex while open so the panel draws above siblings.
 */
export function Popover(props: {
	open: () => boolean;
	onClose: () => void;
	width: number;
	align?: "left" | "right";
	/** Horizontal padding of the trigger, so the panel lines up with its outer edge. */
	inset?: number;
	children?: Vide.Node;
}) {
	const right = props.align === "right";
	const inset = props.inset ?? 10;

	return (
		<Show when={props.open}>
			{() => (
				<>
					<textbutton
						Name="Backdrop"
						Size={offset(BACKDROP_SIZE, BACKDROP_SIZE)}
						Position={offset(-BACKDROP_SIZE / 2, -BACKDROP_SIZE / 2)}
						BackgroundTransparency={1}
						AutoButtonColor={false}
						Text=""
						ZIndex={50}
						Activated={props.onClose}
					/>
					<frame
						Name="Popover"
						AnchorPoint={new Vector2(right ? 1 : 0, 0)}
						Position={udim2(right ? 1 : 0, right ? inset : -inset, 1, 6)}
						Size={offset(props.width, 0)}
						AutomaticSize={Enum.AutomaticSize.Y}
						BackgroundColor3={THEME.cardBg}
						BorderSizePixel={0}
						ZIndex={51}
					>
						<uicorner CornerRadius={udim(0, THEME.radius)} />
						<uistroke Color={THEME.border} />
						<uipadding
							PaddingTop={udim(0, 4)}
							PaddingBottom={udim(0, 4)}
							PaddingLeft={udim(0, 4)}
							PaddingRight={udim(0, 4)}
						/>
						<uilistlayout FillDirection={Enum.FillDirection.Vertical} SortOrder={Enum.SortOrder.LayoutOrder} />
						{props.children}
					</frame>
				</>
			)}
		</Show>
	);
}

export function PopoverTitle(props: { text: string; LayoutOrder?: number }) {
	return (
		<textlabel
			Name="Title"
			Size={udim2(1, 0, 0, 22)}
			BackgroundTransparency={1}
			Text={props.text.upper()}
			TextColor3={THEME.textDim}
			TextSize={px(THEME.labelSize)}
			FontFace={FONT.bold}
			TextXAlignment={Enum.TextXAlignment.Left}
			LayoutOrder={props.LayoutOrder ?? 0}
			ZIndex={52}
		>
			<uipadding PaddingLeft={udim(0, 8)} />
		</textlabel>
	);
}

/** Row inside a popover with a leading marker (check or dot) and a label. */
export function PopoverItem(props: {
	text: string;
	checked: Derivable<boolean>;
	color?: Color3;
	LayoutOrder?: number;
	onClick: () => void;
}) {
	const hovered = source(false);
	const checked = () => read(props.checked);

	return (
		<textbutton
			Name={props.text}
			Size={udim2(1, 0, 0, 26)}
			BackgroundColor3={THEME.rowHover}
			BackgroundTransparency={() => (hovered() ? 0 : 1)}
			BorderSizePixel={0}
			AutoButtonColor={false}
			Text=""
			LayoutOrder={props.LayoutOrder ?? 0}
			ZIndex={52}
			Activated={props.onClick}
			MouseEnter={() => hovered(true)}
			MouseLeave={() => hovered(false)}
		>
			<uicorner CornerRadius={udim(0, THEME.radius - 2)} />

			<frame
				Name="Check"
				AnchorPoint={new Vector2(0, 0.5)}
				Position={udim2(0, 8, 0.5, 0)}
				Size={offset(12, 12)}
				BackgroundColor3={THEME.accent}
				BackgroundTransparency={() => (checked() ? 0 : 1)}
				BorderSizePixel={0}
				ZIndex={53}
			>
				<uicorner CornerRadius={udim(0, 3)} />
				<uistroke Color={() => (checked() ? THEME.accent : THEME.textDim)} />
				<textlabel
					Size={UDim2.fromScale(1, 1)}
					BackgroundTransparency={1}
					Text="✓"
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextSize={px(10)}
					FontFace={FONT.bold}
					Visible={checked}
					ZIndex={54}
				/>
			</frame>

			{props.color !== undefined ? (
				<frame
					Name="Dot"
					AnchorPoint={new Vector2(0, 0.5)}
					Position={udim2(0, 28, 0.5, 0)}
					Size={offset(8, 8)}
					BackgroundColor3={props.color}
					BorderSizePixel={0}
					ZIndex={53}
				>
					<uicorner CornerRadius={new UDim(1, 0)} />
				</frame>
			) : undefined}

			<textlabel
				Name="Label"
				Position={udim2(0, props.color !== undefined ? 44 : 28, 0, 0)}
				Size={udim2(1, -52, 1, 0)}
				BackgroundTransparency={1}
				Text={props.text}
				TextColor3={() => (checked() || hovered() ? THEME.text : THEME.textMuted)}
				TextSize={px(THEME.fontSize - 1)}
				FontFace={FONT.medium}
				TextXAlignment={Enum.TextXAlignment.Left}
				ZIndex={53}
			/>
		</textbutton>
	);
}

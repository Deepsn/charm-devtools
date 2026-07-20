import Vide, { type Derivable, source } from "@rbxts/vide";
import { FONT, THEME } from "constants/theme";

const COPY_RESET_DELAY = 1.5;

export function CodeBlock(props: {
	text: Derivable<string>;
	color?: Derivable<Color3>;
	ref?: (instance: TextBox) => void;
	order?: number;
}) {
	return (
		<textbox
			Name="Code"
			action={(instance: TextBox) => props.ref?.(instance)}
			AutomaticSize={Enum.AutomaticSize.Y}
			Size={new UDim2(1, 0, 0, 0)}
			BackgroundTransparency={1}
			TextEditable={false}
			ClearTextOnFocus={false}
			Text={props.text}
			TextColor3={props.color ?? THEME.tree.other}
			TextSize={THEME.monoSize}
			Font={FONT.mono}
			TextWrapped={true}
			TextXAlignment={Enum.TextXAlignment.Left}
			TextYAlignment={Enum.TextYAlignment.Top}
			LayoutOrder={props.order ?? 0}
		/>
	);
}

export function CodeCard(props: { text: Derivable<string>; color?: Derivable<Color3>; order?: number }) {
	const box = source<TextBox | undefined>(undefined);
	const copyLabel = source("Copy");

	const selectAll = () => {
		const field = box();
		if (field === undefined) return;

		field.CaptureFocus();
		field.SelectionStart = 1;
		field.CursorPosition = field.Text.size() + 1;

		copyLabel("⌃C");
		task.delay(COPY_RESET_DELAY, () => copyLabel("Copy"));
	};

	return (
		<frame
			Name="Card"
			AutomaticSize={Enum.AutomaticSize.Y}
			Size={new UDim2(1, 0, 0, 0)}
			BackgroundColor3={THEME.cardBg}
			BorderSizePixel={0}
			LayoutOrder={props.order ?? 0}
		>
			<uicorner CornerRadius={new UDim(0, 6)} />
			<uistroke Color={THEME.border} Transparency={0.35} />

			<frame Name="Rail" Size={new UDim2(0, 2, 1, 0)} BackgroundColor3={THEME.rail} BorderSizePixel={0} ZIndex={2} />

			<frame
				Name="Content"
				AutomaticSize={Enum.AutomaticSize.Y}
				Size={new UDim2(1, -66, 0, 0)}
				Position={new UDim2(0, 14, 0, 0)}
				BackgroundTransparency={1}
			>
				<uipadding PaddingTop={new UDim(0, 10)} PaddingBottom={new UDim(0, 10)} />
				<CodeBlock text={props.text} color={props.color} ref={(instance) => box(instance)} />
			</frame>

			<textbutton
				Name="Copy"
				AnchorPoint={new Vector2(1, 0)}
				Position={new UDim2(1, -8, 0, 8)}
				Size={UDim2.fromOffset(42, 20)}
				BackgroundColor3={THEME.chipBg}
				BorderSizePixel={0}
				AutoButtonColor={true}
				Text={copyLabel}
				TextColor3={THEME.textMuted}
				TextSize={THEME.fontSize - 2}
				Font={FONT.medium}
				ZIndex={2}
				Activated={selectAll}
			>
				<uicorner CornerRadius={new UDim(0, 4)} />
			</textbutton>
		</frame>
	);
}

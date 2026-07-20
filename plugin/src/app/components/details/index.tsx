import Vide, { type Derivable } from "@rbxts/vide";
import { FONT, THEME } from "constants/theme";

const SECTION_GAP = 18;

export function Section(props: { title: string; order: number; children?: Vide.Node }) {
	return (
		<frame
			Name={props.title}
			AutomaticSize={Enum.AutomaticSize.Y}
			Size={new UDim2(1, 0, 0, 0)}
			BackgroundTransparency={1}
			LayoutOrder={props.order}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				SortOrder={Enum.SortOrder.LayoutOrder}
				Padding={new UDim(0, 8)}
			/>
			<uipadding PaddingTop={new UDim(0, props.order > 1 ? SECTION_GAP : 0)} />

			<textlabel
				Name="Title"
				Size={new UDim2(1, 0, 0, 18)}
				BackgroundTransparency={1}
				Text={props.title}
				TextColor3={THEME.text}
				TextSize={THEME.sectionSize}
				Font={FONT.bold}
				TextXAlignment={Enum.TextXAlignment.Left}
				LayoutOrder={0}
			/>

			{props.children}
		</frame>
	);
}

export function Chip(props: { text: Derivable<string>; color?: Derivable<Color3>; order: number }) {
	return (
		<frame
			Name="Chip"
			AutomaticSize={Enum.AutomaticSize.XY}
			Size={UDim2.fromOffset(0, 0)}
			BackgroundColor3={THEME.chipBg}
			BorderSizePixel={0}
			LayoutOrder={props.order}
		>
			<uicorner CornerRadius={new UDim(0, 4)} />
			<uipadding
				PaddingLeft={new UDim(0, 7)}
				PaddingRight={new UDim(0, 7)}
				PaddingTop={new UDim(0, 3)}
				PaddingBottom={new UDim(0, 3)}
			/>
			<textlabel
				Name="Value"
				AutomaticSize={Enum.AutomaticSize.XY}
				Size={UDim2.fromOffset(0, 0)}
				BackgroundTransparency={1}
				Text={props.text}
				TextColor3={props.color ?? THEME.text}
				TextSize={THEME.monoSize - 1}
				Font={FONT.mono}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>
		</frame>
	);
}

export function Field(props: { label: string; value: Derivable<string>; color?: Derivable<Color3>; order: number }) {
	return (
		<frame
			Name={props.label}
			AutomaticSize={Enum.AutomaticSize.Y}
			Size={new UDim2(1, 0, 0, 0)}
			BackgroundTransparency={1}
			LayoutOrder={props.order}
		>
			<uilistlayout
				FillDirection={Enum.FillDirection.Vertical}
				SortOrder={Enum.SortOrder.LayoutOrder}
				Padding={new UDim(0, 4)}
			/>

			<textlabel
				Name="Label"
				Size={new UDim2(1, 0, 0, 12)}
				BackgroundTransparency={1}
				Text={props.label.upper()}
				TextColor3={THEME.textDim}
				TextSize={THEME.labelSize}
				Font={FONT.bold}
				TextXAlignment={Enum.TextXAlignment.Left}
				LayoutOrder={1}
			/>

			<Chip text={props.value} color={props.color} order={2} />
		</frame>
	);
}

export function SectionEmpty(props: { text: string; order: number }) {
	return (
		<textlabel
			Name="Empty"
			Size={new UDim2(1, 0, 0, 18)}
			BackgroundTransparency={1}
			Text={props.text}
			TextColor3={THEME.textMuted}
			TextSize={THEME.fontSize}
			Font={FONT.ui}
			TextXAlignment={Enum.TextXAlignment.Left}
			LayoutOrder={props.order}
		/>
	);
}

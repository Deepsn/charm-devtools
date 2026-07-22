import Vide, { type Derivable, read } from "@rbxts/vide";
import { Container } from "app/components/container";
import type { Env } from "atoms/inspector";
import { FONT, THEME } from "constants/theme";
import { envColor } from "lib/format";

const ENVS: readonly Env[] = ["server", "client"];
const HEIGHT = 26;
const DOT_SIZE = 7;

function Segment(props: {
	env: Env;
	active: Derivable<boolean>;
	onToggle: () => void;
	first: boolean;
	LayoutOrder: number;
}) {
	const color = envColor(props.env);
	const active = () => read(props.active);

	return (
		<textbutton
			Name={props.env}
			Size={UDim2.fromScale(1, 1)}
			BackgroundColor3={THEME.frameBg}
			BackgroundTransparency={() => (active() ? 0 : 1)}
			BorderSizePixel={0}
			AutoButtonColor={false}
			Text=""
			LayoutOrder={props.LayoutOrder}
			Activated={props.onToggle}
		>
			{!props.first ? (
				<frame
					Name="Divider"
					Size={new UDim2(0, 1, 1, 0)}
					BackgroundColor3={THEME.border}
					BorderSizePixel={0}
					ZIndex={2}
				/>
			) : undefined}

			<frame Name="Content" Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1} BorderSizePixel={0}>
				<uilistlayout
					FillDirection={Enum.FillDirection.Horizontal}
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					VerticalAlignment={Enum.VerticalAlignment.Center}
					Padding={new UDim(0, 7)}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>

				<frame
					Name="Dot"
					Size={UDim2.fromOffset(DOT_SIZE, DOT_SIZE)}
					BackgroundColor3={color}
					BackgroundTransparency={() => (active() ? 0 : 1)}
					BorderSizePixel={0}
					LayoutOrder={0}
				>
					<uicorner CornerRadius={new UDim(1, 0)} />
					<uistroke Color={color} Transparency={() => (active() ? 1 : 0.25)} />
				</frame>

				<textlabel
					Name="Label"
					AutomaticSize={Enum.AutomaticSize.X}
					Size={new UDim2(0, 0, 1, 0)}
					BackgroundTransparency={1}
					Text={props.env}
					TextColor3={() => (active() ? THEME.text : THEME.textMuted)}
					TextSize={THEME.fontSize - 1}
					Font={FONT.medium}
					LayoutOrder={1}
				/>
			</frame>
		</textbutton>
	);
}

export function EnvSwitch(props: { enabled: (env: Env) => boolean; onToggle: (env: Env) => void }) {
	return (
		<frame
			Name="EnvSwitch"
			AutomaticSize={Enum.AutomaticSize.X}
			Size={new UDim2(0, 0, 0, HEIGHT)}
			AnchorPoint={new Vector2(0, 0.5)}
			Position={UDim2.fromScale(0, 0.5)}
			BackgroundColor3={THEME.inputBg}
			BorderSizePixel={0}
			ClipsDescendants={true}
		>
			<uicorner CornerRadius={new UDim(0, THEME.radius)} />
			<uistroke Color={THEME.border} />
			<uilistlayout FillDirection={Enum.FillDirection.Horizontal} SortOrder={Enum.SortOrder.LayoutOrder} />

			{ENVS.map((env, index) => (
				<Container Size={UDim2.fromScale(0.5, 1)}>
					<Segment
						env={env}
						active={() => props.enabled(env)}
						onToggle={() => props.onToggle(env)}
						first={index === 0}
						LayoutOrder={index}
					/>
				</Container>
			))}
		</frame>
	);
}

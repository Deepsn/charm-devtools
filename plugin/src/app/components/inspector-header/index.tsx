import Vide, { type Derivable, read } from "@rbxts/vide";
import { EnvBadge } from "app/components/env-badge";
import type { Action } from "atoms";
import { FONT, THEME } from "constants/theme";
import { formatTime } from "lib/format";

const CONTENT_HEIGHT = 34;

export const HEADER_HEIGHT = CONTENT_HEIGHT + 1;

export function InspectorHeader(props: {
	env: Derivable<Action["env"]>;
	title: Derivable<string>;
	timestamp: Derivable<number>;
}) {
	return (
		<frame Name="Header" Size={new UDim2(1, 0, 0, HEADER_HEIGHT)} BackgroundTransparency={1} BorderSizePixel={0}>
			<frame Name="Content" Size={new UDim2(1, 0, 0, CONTENT_HEIGHT)} BackgroundTransparency={1}>
				<uipadding PaddingLeft={new UDim(0, 12)} PaddingRight={new UDim(0, 12)} />

				<EnvBadge
					env={props.env}
					Size={UDim2.fromOffset(52, 18)}
					Position={new UDim2(0, 0, 0.5, 0)}
					AnchorPoint={new Vector2(0, 0.5)}
					TextSize={THEME.fontSize - 2}
				/>

				<textlabel
					Name="Title"
					AnchorPoint={new Vector2(0, 0.5)}
					Position={new UDim2(0, 60, 0.5, 0)}
					Size={new UDim2(1, -140, 0, CONTENT_HEIGHT)}
					BackgroundTransparency={1}
					Text={props.title}
					TextColor3={THEME.text}
					TextSize={THEME.fontSize + 1}
					Font={FONT.bold}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextTruncate={Enum.TextTruncate.AtEnd}
				/>

				<textlabel
					Name="Time"
					AnchorPoint={new Vector2(1, 0.5)}
					Position={new UDim2(1, 0, 0.5, 0)}
					Size={UDim2.fromOffset(72, CONTENT_HEIGHT)}
					BackgroundTransparency={1}
					Text={() => formatTime(read(props.timestamp))}
					TextColor3={THEME.textDim}
					TextSize={THEME.fontSize - 1}
					Font={FONT.mono}
					TextXAlignment={Enum.TextXAlignment.Right}
				/>
			</frame>

			<frame
				Name="Divider"
				Size={new UDim2(1, 0, 0, 1)}
				Position={new UDim2(0, 0, 0, CONTENT_HEIGHT)}
				BackgroundColor3={THEME.divider}
				BorderSizePixel={0}
			/>
		</frame>
	);
}

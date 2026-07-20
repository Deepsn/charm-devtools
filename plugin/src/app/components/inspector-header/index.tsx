import Vide, { type Derivable, read } from "@rbxts/vide";
import { EnvBadge } from "app/components/env-badge";
import type { Action } from "atoms";
import { FONT, THEME } from "constants/theme";
import { formatTime } from "lib/format";

export const HEADER_HEIGHT = 26;

const BADGE_WIDTH = 46;
const TITLE_OFFSET = BADGE_WIDTH + 10;
const TIME_WIDTH = 72;

export function InspectorHeader(props: {
	env: Derivable<Action["env"]>;
	title: Derivable<string>;
	timestamp: Derivable<number>;
}) {
	return (
		<frame Name="Header" Size={new UDim2(1, 0, 0, HEADER_HEIGHT)} BackgroundTransparency={1} BorderSizePixel={0}>
			<EnvBadge
				env={props.env}
				Size={UDim2.fromOffset(BADGE_WIDTH, 17)}
				Position={new UDim2(0, 0, 0.5, 0)}
				AnchorPoint={new Vector2(0, 0.5)}
				TextSize={THEME.fontSize - 3}
			/>

			<textlabel
				Name="Title"
				AnchorPoint={new Vector2(0, 0.5)}
				Position={new UDim2(0, TITLE_OFFSET, 0.5, 0)}
				Size={new UDim2(1, -(TITLE_OFFSET + TIME_WIDTH + 8), 1, 0)}
				BackgroundTransparency={1}
				Text={props.title}
				TextColor3={THEME.text}
				TextSize={THEME.fontSize + 2}
				Font={FONT.bold}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextTruncate={Enum.TextTruncate.AtEnd}
			/>

			<textlabel
				Name="Time"
				AnchorPoint={new Vector2(1, 0.5)}
				Position={new UDim2(1, 0, 0.5, 0)}
				Size={UDim2.fromOffset(TIME_WIDTH, HEADER_HEIGHT)}
				BackgroundTransparency={1}
				Text={() => formatTime(read(props.timestamp))}
				TextColor3={THEME.textDim}
				TextSize={THEME.fontSize - 1}
				Font={FONT.mono}
				TextXAlignment={Enum.TextXAlignment.Right}
			/>
		</frame>
	);
}

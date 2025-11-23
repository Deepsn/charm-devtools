import { Button } from "app/components/button";
import { Container } from "app/components/container";
import { Text } from "app/components/text";
import type { Action as ActionType } from "atoms";
import { palette } from "constants/palette";
import React from "react";

interface ActionProps {
	action: ActionType;
	selected: boolean;
	onSelect: () => void;
}

export function Action({ action, selected, onSelect }: ActionProps) {
	return (
		<Container
			Size={new UDim2(1, 0, 0, 50)}
			BackgroundColor3={palette.primary}
			BackgroundTransparency={0}
			BorderSizePixel={0}
		>
			<Button
				onClick={onSelect}
				hoverColor={palette.hover}
				BackgroundTransparency={selected ? 0.5 : undefined}
				BackgroundColor3={selected ? palette.hover : undefined}
			>
				<Text Text={action.name} />
			</Button>

			<Text
				TextXAlignment={Enum.TextXAlignment.Left}
				Size={new UDim2(1, 0, 0, 20)}
				Position={UDim2.fromScale(0, 1)}
				AnchorPoint={new Vector2(0, 1)}
				Text={DateTime.fromUnixTimestampMillis(action.timestamp).FormatLocalTime("hh:mm:ss SS", "en-us")}
			/>
		</Container>
	);
}

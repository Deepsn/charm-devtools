import { useAtom } from "@rbxts/react-charm";
import { history, selectedAction } from "app/atoms";
import { Action } from "app/components/action";
import { Container } from "app/components/container";
import { palette } from "constants/palette";
import React from "react";

export function History() {
	const actions = useAtom(history);

	return (
		<Container
			Size={new UDim2(0.4, 0, 1, -3)}
			Position={new UDim2(0, 0, 0.5, 3)}
			AnchorPoint={new Vector2(0, 0.5)}
			BackgroundColor3={palette.primary}
			BackgroundTransparency={0}
		>
			<uilistlayout HorizontalAlignment={Enum.HorizontalAlignment.Center} />

			{actions.map((action) => {
				return (
					<Action
						key={action}
						onSelect={() => {
							selectedAction(action);
						}}
					/>
				);
			})}
		</Container>
	);
}

import { useAtom } from "@rbxts/react-charm";
import { Components, DataSources, Dimensions, Renderers } from "@rbxts/ultimate-list";
import { Action } from "app/components/action";
import { Container } from "app/components/container";
import { type Action as ActionType, history, selectedAction } from "atoms";
import { palette } from "constants/palette";
import React from "react";

export function History() {
	const actions = useAtom(history);
	const actionSelected = useAtom(selectedAction);

	return (
		<Container
			Size={new UDim2(0.4, 0, 1, -3)}
			Position={new UDim2(0, 0, 0.5, 3)}
			AnchorPoint={new Vector2(0, 0.5)}
			BackgroundColor3={palette.primary}
			BackgroundTransparency={0}
		>
			<Components.ScrollingFrame
				native={{
					BackgroundTransparency: 1,
					ScrollBarThickness: 6,
				}}
				dataSource={DataSources.array(actions)}
				dimensions={Dimensions.consistentSize(50)}
				renderer={Renderers.byState((action: ActionType) => {
					return (
						<Action
							key={action.timestamp}
							action={action}
							selected={actionSelected?.id === action.id}
							onSelect={() => {
								selectedAction(action);
							}}
						/>
					);
				})}
				direction="y"
			/>
		</Container>
	);
}

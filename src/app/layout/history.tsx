import { useAtom } from "@rbxts/react-charm";
import { Action } from "app/components/action";
import { Container } from "app/components/container";
import { history, selectedAction } from "atoms";
import { palette } from "constants/palette";
import React, { useEffect } from "react";

export function History() {
	const actions = useAtom(history);
	const actionSelected = useAtom(selectedAction);

	useEffect(() => {
		print("History updated:", actions);
	}, [actions]);

	return (
		<Container
			Size={new UDim2(0.4, 0, 1, -3)}
			Position={new UDim2(0, 0, 0.5, 3)}
			AnchorPoint={new Vector2(0, 0.5)}
			BackgroundColor3={palette.primary}
			BackgroundTransparency={0}
		>
			<uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} HorizontalAlignment={Enum.HorizontalAlignment.Center} />

			{actions.map((action, index) => {
				return (
					<Action
						// biome-ignore lint/suspicious/noArrayIndexKey: index is stable here
						key={index}
						name={action.name}
						selected={actionSelected?.id === action.id}
						onSelect={() => {
							selectedAction(action);
						}}
					/>
				);
			})}
		</Container>
	);
}

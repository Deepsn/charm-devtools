import { useAtom } from "@rbxts/react-charm";
import { Container } from "app/components/container";
import { Text } from "app/components/text";
import { selectedAction } from "atoms";
import { palette } from "constants/palette";
import React from "react";

export function Preview() {
	const selected = useAtom(selectedAction);

	if (!selected) {
		return (
			<Container Size={UDim2.fromScale(0.6, 1)}>
				<Text Text="No action selected" />
			</Container>
		);
	}

	return (
		<Container Size={UDim2.fromScale(0.6, 1)}>
			<uilistlayout />

			<frame BackgroundColor3={palette.primary} Size={new UDim2(1, 0, 0, 30)}>
				<uilistlayout FillDirection={Enum.FillDirection.Horizontal} />
			</frame>

			<Container Size={new UDim2(1, 0, 1, -30)}>
				<Text Text={tostring(selected.value)} />
			</Container>
		</Container>
	);
}

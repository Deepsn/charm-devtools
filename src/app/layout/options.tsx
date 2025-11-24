import { Button } from "app/components/button";
import { Container } from "app/components/container";
import { Text } from "app/components/text";
import { options } from "atoms";
import { palette } from "constants/palette";
import React from "react";

export function Options() {
	function handleShowAsJson() {
		options((prev) => ({ ...prev, showAsJson: !prev.showAsJson }));
	}

	return (
		<frame BackgroundColor3={palette.primary} Size={new UDim2(1, 0, 0, 30)}>
			<uilistlayout FillDirection={Enum.FillDirection.Horizontal} />

			<Container AutomaticSize={Enum.AutomaticSize.X} Size={UDim2.fromScale(0, 1)}>
				<Button
					onClick={handleShowAsJson}
					hoverColor={palette.hover}
					BackgroundTransparency={0.7}
					BackgroundColor3={palette.secondary}
					Size={UDim2.fromScale(0, 1)}
					AutomaticSize={Enum.AutomaticSize.X}
				>
					<uipadding PaddingLeft={new UDim(0, 20)} PaddingRight={new UDim(0, 20)} />
					<Text Text="show as json" />
				</Button>
			</Container>
		</frame>
	);
}

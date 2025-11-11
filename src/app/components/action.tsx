import { Button } from "app/components/button";
import { Container } from "app/components/container";
import { Text } from "app/components/text";
import { palette } from "constants/palette";
import React from "react";

interface ActionProps {
	onSelect: () => void;
}

export function Action({ onSelect }: ActionProps) {
	return (
		<Container
			Size={new UDim2(1, -5, 0, 50)}
			BackgroundColor3={palette.primary}
			BackgroundTransparency={0}
			BorderColor3={palette.secondary}
			BorderSizePixel={3}
			BorderMode={Enum.BorderMode.Outline}
		>
			<Button onClick={onSelect} hoverColor={Color3.fromRGB(186, 186, 186)}>
				<Text Text={"Gaming"} />
			</Button>
		</Container>
	);
}

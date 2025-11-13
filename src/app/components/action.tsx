import { Button } from "app/components/button";
import { Container } from "app/components/container";
import { Text } from "app/components/text";
import { palette } from "constants/palette";
import React from "react";

interface ActionProps {
	name: string;
	selected: boolean;
	onSelect: () => void;
}

export function Action({ name, selected, onSelect }: ActionProps) {
	return (
		<Container
			Size={new UDim2(1, -5, 0, 50)}
			BackgroundColor3={palette.primary}
			BackgroundTransparency={0}
			BorderColor3={palette.secondary}
			BorderSizePixel={3}
			BorderMode={Enum.BorderMode.Outline}
		>
			<Button
				onClick={onSelect}
				hoverColor={!selected ? palette.hover : undefined}
				BackgroundColor3={selected ? palette.hover : undefined}
			>
				<Text Text={name} />
			</Button>
		</Container>
	);
}

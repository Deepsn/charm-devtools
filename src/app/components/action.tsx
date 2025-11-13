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
				<Text Text={name} />
			</Button>
		</Container>
	);
}

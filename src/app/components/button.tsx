import React, { type PropsWithChildren, useState } from "react";

interface ButtonProps extends WritableProperties<TextButton> {
	onHover: () => void;
	onUnhover: () => void;
	onClick: () => void;
	hoverColor: Color3;
}

export function Button(props: PropsWithChildren & Partial<ButtonProps>) {
	const rest = {
		...props,
		children: undefined,
		onHover: undefined,
		onUnhover: undefined,
		onClick: undefined,
		hoverColor: undefined,
	} as Partial<ButtonProps>;

	const [hovered, setHovered] = useState(false);

	return (
		<textbutton
			{...rest}
			Text={props.Text ?? ""}
			Size={props.Size ?? UDim2.fromScale(1, 1)}
			BackgroundTransparency={props.BackgroundTransparency ?? (hovered && props.hoverColor ? 0.5 : 1)}
			AutoButtonColor={false}
			BackgroundColor3={hovered && props.hoverColor ? props.hoverColor : props.BackgroundColor3}
			Event={{
				MouseButton1Click: props.onClick,
				MouseEnter: () => {
					props.hoverColor && setHovered(true);
					props.onHover?.();
				},
				MouseLeave: () => {
					props.hoverColor && setHovered(false);
					props.onUnhover?.();
				},
			}}
		>
			{props.children}
		</textbutton>
	);
}

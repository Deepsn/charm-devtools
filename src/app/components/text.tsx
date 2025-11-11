import { palette } from "constants/palette";
import React, { type PropsWithChildren } from "react";

export function Text(props: PropsWithChildren & Partial<WritableProperties<TextLabel>>) {
	const rest = { ...props, children: undefined };
	return (
		<textlabel {...rest} Size={rest.Size ?? UDim2.fromScale(1, 1)} BackgroundTransparency={1} TextColor3={palette.text}>
			{props.children}
		</textlabel>
	);
}

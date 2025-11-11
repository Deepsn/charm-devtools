import React, { type PropsWithChildren } from "react";

export function Container(props: PropsWithChildren & Partial<WritableProperties<Frame>>) {
	const rest = { ...props, children: undefined };
	return (
		<frame {...rest} Size={rest.Size ?? UDim2.fromScale(1, 1)} Transparency={1}>
			{props.children}
		</frame>
	);
}

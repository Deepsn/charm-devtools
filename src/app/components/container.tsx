import React, { type ForwardedRef, forwardRef, type PropsWithChildren } from "react";

interface ContainerProps extends Partial<WritableProperties<Frame>> {}

export const Container = forwardRef(
	(props: PropsWithChildren & ContainerProps, ref: ForwardedRef<ScrollingFrame | Frame>) => {
		const rest = { ...props, children: undefined };

		return (
			<frame {...rest} Size={rest.Size ?? UDim2.fromScale(1, 1)} Transparency={1} ref={ref as ForwardedRef<Frame>}>
				{props.children}
			</frame>
		);
	},
);
